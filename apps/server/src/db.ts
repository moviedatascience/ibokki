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

export interface ErrorRow {
  id: number;
  /** Dedupe key: scope + first line of the message (room codes etc. stay out). */
  fingerprint: string;
  scope: string;
  message: string;
  stack: string;
  /** How many times this fault has fired since first_seen. */
  count: number;
  first_seen: number;
  last_seen: number;
}

export interface MatchRow {
  id: number;
  code: string;
  seed: number;
  /** JSON: per-seat {token, deckName, deck:{spellbook,resourceDeck}, userId?} — enough to rebuild the room and honor rejoin tokens. */
  seats: string;
  /** 1 = seat 1 is a server-side bot. */
  bot: number;
  /** Solo-bot strength ("easy"/"medium"/"hard"); NULL on PvP rows and rows predating levels. */
  bot_level: string | null;
  /** JSON: ordered {s: side, a: Action}[] — with `seed`, the whole deterministic match. */
  actions: string;
  /** JSON {winner, endReason, forfeit} once finished; NULL = live (rehydrated on boot). */
  result: string | null;
  /** HP the game was created with; NULL = the engine default (and rows predating the column). */
  starting_hp: number | null;
  started_at: number;
  updated_at: number;
  ended_at: number | null;
}

/** One seat's per-user tally of finished, non-abandoned matches. */
export interface WinLoss {
  wins: number;
  losses: number;
  draws: number;
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
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        seed INTEGER NOT NULL,
        seats TEXT NOT NULL,
        bot INTEGER NOT NULL DEFAULT 0,
        actions TEXT NOT NULL DEFAULT '[]',
        result TEXT,
        started_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        ended_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_matches_live ON matches(updated_at) WHERE result IS NULL;
      CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY,
        fingerprint TEXT NOT NULL UNIQUE,
        scope TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT NOT NULL DEFAULT '',
        count INTEGER NOT NULL DEFAULT 1,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL
      );
    `);
    // Additive migration for databases created before SSO support.
    try {
      this.db.exec("ALTER TABLE users ADD COLUMN oidc_sub TEXT");
    } catch {
      /* column already exists */
    }
    // Additive migration for databases created before solo-bot difficulty levels.
    try {
      this.db.exec("ALTER TABLE matches ADD COLUMN bot_level TEXT");
    } catch {
      /* column already exists */
    }
    // Additive migration for databases created before per-row starting HP (replay fidelity).
    try {
      this.db.exec("ALTER TABLE matches ADD COLUMN starting_hp INTEGER");
    } catch {
      /* column already exists */
    }
    // Replay share links: one token per (match, seat) — the replay renders that seat's
    // view. Deliberate exception to the hash-only token rule above: the unguessable
    // link IS the credential, "copy link" must show the same URL twice, and the seats
    // JSON beside it already stores plaintext rejoin tokens — hashing buys nothing here.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS replay_shares (
        id INTEGER PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        seat INTEGER NOT NULL CHECK (seat IN (0, 1)),
        token TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        UNIQUE (match_id, seat)
      );
    `);
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

  // ---- matches (persistence: live rooms survive a restart; finished rows are history) ----

  createMatch(code: string, seed: number, seatsJson: string, bot: boolean, botLevel: string | null = null, startingHp: number | null = null): number {
    const now = Date.now();
    const info = this.db
      .prepare("INSERT INTO matches (code, seed, seats, bot, bot_level, starting_hp, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(code, seed, seatsJson, bot ? 1 : 0, bot ? botLevel : null, startingHp, now, now);
    return Number(info.lastInsertRowid);
  }

  updateMatchActions(id: number, actionsJson: string): void {
    this.db.prepare("UPDATE matches SET actions = ?, updated_at = ? WHERE id = ?").run(actionsJson, Date.now(), id);
  }

  /** Record the final result. WHERE result IS NULL makes racing callers idempotent. */
  finishMatch(id: number, resultJson: string): void {
    this.db.prepare("UPDATE matches SET result = ?, ended_at = ? WHERE id = ? AND result IS NULL").run(resultJson, Date.now(), id);
  }

  /** Unfinished matches to rehydrate on boot. */
  liveMatches(): MatchRow[] {
    return this.db.prepare("SELECT * FROM matches WHERE result IS NULL ORDER BY id").all() as MatchRow[];
  }

  /** Mark live rows idle since `cutoff` abandoned (zombie guard: never rehydrate stale rooms). */
  abandonMatchesBefore(cutoff: number): void {
    this.db
      .prepare("UPDATE matches SET result = ?, ended_at = ? WHERE result IS NULL AND updated_at < ?")
      .run(JSON.stringify({ winner: null, endReason: "abandoned", forfeit: null }), Date.now(), cutoff);
  }

  // ---- match history / replay shares ----

  matchById(id: number): MatchRow | undefined {
    return this.db.prepare("SELECT * FROM matches WHERE id = ?").get(id) as MatchRow | undefined;
  }

  /** Where this user was seated (result rows are played matches, not spectated ones). */
  private static readonly SEATED =
    "(json_extract(seats, '$[0].userId') = @uid OR json_extract(seats, '$[1].userId') = @uid)";

  /**
   * The user's finished matches, newest first. Abandoned rows (server sweeps, dead
   * rooms — nobody played those to an end) are bookkeeping, not history.
   */
  matchesForUser(userId: number, limit = 50): MatchRow[] {
    // History never reads the action log, and a long match's blob is hundreds of KB
    // per row (rewritten every ply) — ship a placeholder instead of hauling it.
    return this.db
      .prepare(
        `SELECT id, code, seed, seats, bot, bot_level, '[]' AS actions, result,
                starting_hp, started_at, updated_at, ended_at
         FROM matches
         WHERE result IS NOT NULL
           AND json_extract(result, '$.endReason') IS NOT 'abandoned'
           AND ${Db.SEATED}
         ORDER BY ended_at DESC, id DESC LIMIT @limit`,
      )
      .all({ uid: userId, limit }) as MatchRow[];
  }

  /**
   * Lifetime W-L-D over the same rows `matchesForUser` counts, split solo (vs bot)
   * vs PvP. Counted per SEAT additively, so a user who joined their own room from a
   * second tab scores that match as one win AND one loss — self-consistent, unlike
   * resolving one seat (which silently drops the other seat's outcome). `IS` is
   * null-safe: guest/bot seats have no userId key (json_extract → NULL) and never match.
   */
  recordForUser(userId: number): { pvp: WinLoss; solo: WinLoss } {
    const rows = this.db
      .prepare(
        `SELECT bot,
                SUM((s0 IS @uid AND w IS 0) + (s1 IS @uid AND w IS 1)) AS wins,
                SUM((s0 IS @uid AND w IS 1) + (s1 IS @uid AND w IS 0)) AS losses,
                SUM((w IS NULL) * ((s0 IS @uid) + (s1 IS @uid))) AS draws
         FROM (
           SELECT bot,
                  json_extract(result, '$.winner') AS w,
                  json_extract(seats, '$[0].userId') AS s0,
                  json_extract(seats, '$[1].userId') AS s1
           FROM matches
           WHERE result IS NOT NULL
             AND json_extract(result, '$.endReason') IS NOT 'abandoned'
             AND ${Db.SEATED}
         )
         GROUP BY bot`,
      )
      .all({ uid: userId }) as { bot: number; wins: number; losses: number; draws: number }[];
    const empty = (): WinLoss => ({ wins: 0, losses: 0, draws: 0 });
    const out = { pvp: empty(), solo: empty() };
    for (const r of rows) out[r.bot ? "solo" : "pvp"] = { wins: r.wins, losses: r.losses, draws: r.draws };
    return out;
  }

  /**
   * The share token for one seat's view of a match, minted on first request. Stored
   * raw (unlike session tokens): the unguessable link IS the credential, and the
   * share button must be able to show the same URL again.
   */
  getOrCreateShare(matchId: number, seat: 0 | 1): string {
    const existing = this.db
      .prepare("SELECT token FROM replay_shares WHERE match_id = ? AND seat = ?")
      .get(matchId, seat) as { token: string } | undefined;
    if (existing) return existing.token;
    const token = newToken();
    this.db
      .prepare("INSERT INTO replay_shares (match_id, seat, token, created_at) VALUES (?, ?, ?, ?)")
      .run(matchId, seat, token, Date.now());
    return token;
  }

  /** Existing share token for one seat of a match, if any (no minting). */
  shareTokenFor(matchId: number, seat: 0 | 1): string | null {
    const row = this.db
      .prepare("SELECT token FROM replay_shares WHERE match_id = ? AND seat = ?")
      .get(matchId, seat) as { token: string } | undefined;
    return row?.token ?? null;
  }

  matchByShareToken(token: string): { row: MatchRow; seat: 0 | 1 } | undefined {
    const found = this.db
      .prepare("SELECT m.*, s.seat AS share_seat FROM replay_shares s JOIN matches m ON m.id = s.match_id WHERE s.token = ?")
      .get(token) as (MatchRow & { share_seat: 0 | 1 }) | undefined;
    if (!found) return undefined;
    const { share_seat, ...row } = found;
    return { row: row as MatchRow, seat: share_seat };
  }

  // ---- errors (production monitoring — see monitor.ts) ----

  /** Record one error occurrence, deduped by fingerprint (count increments). */
  recordError(fingerprint: string, scope: string, message: string, stack: string): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO errors (fingerprint, scope, message, stack, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(fingerprint) DO UPDATE SET count = count + 1, last_seen = excluded.last_seen, stack = excluded.stack`,
      )
      .run(fingerprint, scope, message, stack, now, now);
  }

  /** Errors last seen at/after `cutoff`, newest first. */
  errorsSince(cutoff: number): ErrorRow[] {
    return this.db.prepare("SELECT * FROM errors WHERE last_seen >= ? ORDER BY last_seen DESC").all(cutoff) as ErrorRow[];
  }

  close(): void {
    this.db.close();
  }
}
