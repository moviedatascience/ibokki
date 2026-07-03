/**
 * SQLite persistence for accounts and decks (better-sqlite3, synchronous).
 *
 * One file on disk is the whole database — trivial to back up (copy the file)
 * and more than enough for friends-scale play. Token storage follows the
 * ibokkiSite pattern: secrets are random urlsafe strings handed to the user
 * once; only their SHA-256 hash is stored, with an expiry and single-use flag.
 */
import Database from "better-sqlite3";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export interface UserRow {
  id: number;
  email: string;
  username: string;
  /** Empty string for SSO-only users (signed in via the ibokki.com site). */
  password_hash: string;
  email_verified: number;
  /** OIDC subject from the site's identity provider, when linked. */
  oidc_sub: string | null;
  created_at: number;
}

export interface DeckRow {
  id: number;
  user_id: number;
  name: string;
  spellbook: string; // JSON string[]
  resource_deck: string; // JSON string[]
  updated_at: number;
}

export type TokenPurpose = "verify" | "reset";

const SESSION_TTL_MS = 30 * 24 * 3600_000;
const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  verify: 72 * 3600_000, // 72h, like the site's invitations
  reset: 1 * 3600_000, // 1h, like the site's password resets
};

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function newToken(): string {
  return randomBytes(36).toString("base64url");
}

export class Db {
  private db: Database.Database;

  constructor(file: string) {
    if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });
    this.db = new Database(file);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        email_verified INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS email_tokens (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
        token_hash TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        spellbook TEXT NOT NULL,
        resource_deck TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE (user_id, name COLLATE NOCASE)
      );
    `);
    // Additive migration for databases created before SSO support.
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN oidc_sub TEXT");
    } catch {
      /* column already exists */
    }
    this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oidc_sub ON users(oidc_sub) WHERE oidc_sub IS NOT NULL");
  }

  // ---- users ----

  createUser(email: string, username: string, passwordHash: string): UserRow {
    const info = this.db
      .prepare("INSERT INTO users (email, username, password_hash, created_at) VALUES (?, ?, ?, ?)")
      .run(email, username, passwordHash, Date.now());
    return this.userById(Number(info.lastInsertRowid))!;
  }

  userById(id: number): UserRow | undefined {
    return this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  }

  userByLogin(usernameOrEmail: string): UserRow | undefined {
    return this.db
      .prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE")
      .get(usernameOrEmail, usernameOrEmail) as UserRow | undefined;
  }

  /**
   * Find-or-create the local row for a site (OIDC) identity. Keyed by the
   * stable subject; username/email refresh on each login (the site owns them).
   * A username collision with an unrelated local account gets a numeric suffix.
   */
  upsertOidcUser(sub: string, username: string, email: string): UserRow {
    const existing = this.db.prepare("SELECT * FROM users WHERE oidc_sub = ?").get(sub) as UserRow | undefined;
    if (existing) {
      if (existing.username !== username || existing.email !== email) {
        try {
          this.db.prepare("UPDATE users SET username = ?, email = ? WHERE id = ?").run(username, email, existing.id);
        } catch {
          /* new name/email collides with another local account — keep the old ones */
        }
      }
      return this.userById(existing.id)!;
    }
    let name = username;
    for (let n = 2; this.userByLogin(name); n++) name = `${username}${n}`;
    const insert = this.db.prepare(
      "INSERT INTO users (email, username, password_hash, email_verified, oidc_sub, created_at) VALUES (?, ?, '', 1, ?, ?)",
    );
    let info;
    try {
      info = insert.run(email, name, sub, Date.now());
    } catch {
      // Email already held by an unlinked local account — keep both; placeholder here.
      info = insert.run(`${sub}@sso.ibokki`, name, sub, Date.now());
    }
    return this.userById(Number(info.lastInsertRowid))!;
  }

  markEmailVerified(userId: number): void {
    this.db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(userId);
  }

  setPassword(userId: number, passwordHash: string): void {
    this.db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId);
    // A password change invalidates every open session.
    this.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }

  // ---- sessions ----

  /** Create a session; returns the raw cookie token (stored only as a hash). */
  createSession(userId: number): string {
    const raw = newToken();
    this.db
      .prepare("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)")
      .run(userId, hashToken(raw), Date.now() + SESSION_TTL_MS);
    return raw;
  }

  userBySession(rawToken: string): UserRow | undefined {
    const row = this.db
      .prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?")
      .get(hashToken(rawToken), Date.now()) as UserRow | undefined;
    return row;
  }

  deleteSession(rawToken: string): void {
    this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(rawToken));
  }

  // ---- email tokens (verify / reset) ----

  /** Create a single-use email token; returns the raw token for the mail link. */
  createEmailToken(userId: number, purpose: TokenPurpose): string {
    // New token supersedes older unused ones of the same purpose (site pattern).
    this.db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = ? AND used = 0").run(userId, purpose);
    const raw = newToken();
    this.db
      .prepare("INSERT INTO email_tokens (user_id, purpose, token_hash, expires_at) VALUES (?, ?, ?, ?)")
      .run(userId, purpose, hashToken(raw), Date.now() + TOKEN_TTL_MS[purpose]);
    return raw;
  }

  /** Consume a token: returns the user id if valid+fresh, marking it used. */
  consumeEmailToken(rawToken: string, purpose: TokenPurpose): number | null {
    const row = this.db
      .prepare("SELECT id, user_id FROM email_tokens WHERE token_hash = ? AND purpose = ? AND used = 0 AND expires_at > ?")
      .get(hashToken(rawToken), purpose, Date.now()) as { id: number; user_id: number } | undefined;
    if (!row) return null;
    this.db.prepare("UPDATE email_tokens SET used = 1 WHERE id = ?").run(row.id);
    return row.user_id;
  }

  // ---- decks ----

  decksForUser(userId: number): DeckRow[] {
    return this.db.prepare("SELECT * FROM decks WHERE user_id = ? ORDER BY name").all(userId) as DeckRow[];
  }

  deckById(id: number): DeckRow | undefined {
    return this.db.prepare("SELECT * FROM decks WHERE id = ?").get(id) as DeckRow | undefined;
  }

  saveDeck(userId: number, name: string, spellbook: string[], resourceDeck: string[], id?: number): DeckRow {
    if (id !== undefined) {
      this.db
        .prepare("UPDATE decks SET name = ?, spellbook = ?, resource_deck = ?, updated_at = ? WHERE id = ? AND user_id = ?")
        .run(name, JSON.stringify(spellbook), JSON.stringify(resourceDeck), Date.now(), id, userId);
      return this.deckById(id)!;
    }
    const info = this.db
      .prepare("INSERT INTO decks (user_id, name, spellbook, resource_deck, updated_at) VALUES (?, ?, ?, ?, ?)")
      .run(userId, name, JSON.stringify(spellbook), JSON.stringify(resourceDeck), Date.now());
    return this.deckById(Number(info.lastInsertRowid))!;
  }

  deleteDeck(userId: number, id: number): boolean {
    return this.db.prepare("DELETE FROM decks WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
  }

  close(): void {
    this.db.close();
  }
}
