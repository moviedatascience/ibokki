/**
 * HTTP API for accounts and decks, sharing the origin (and session cookie)
 * with the game WebSocket. JSON in/out; the session lives in an httpOnly
 * cookie so neither the client JS nor the WS handshake handle tokens
 * explicitly — the browser sends the cookie on both.
 *
 * Registration is open; the verification mail follows the ibokkiSite pattern
 * (single-use hashed token, 72h). Unverified accounts can play — verification
 * only gates password reset (you can't recover an account whose email was
 * never proven). Reset tokens are 1h single-use, and a successful reset
 * invalidates all sessions.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import {
  MAX_SAME_SYMBOL_DUALS,
  MAX_TRAINER_COPIES,
  MAX_TRAINERS,
  MIN_LEVEL1_SPELLS,
  PRESET_DECKS,
  RESOURCE_DECK_SIZE,
  SPELLBOOK_MAX,
  SPELLBOOK_MIN,
  MAX_TRI_COMPONENTS,
  validateDeck,
} from "@ibokki/engine";
import { buildCardCatalog } from "@ibokki/protocol";

/** Deck-rule constants, shipped to the deckbuilder so its live counters match the validator. */
const DECK_RULES = {
  resourceDeckSize: RESOURCE_DECK_SIZE,
  maxTrainers: MAX_TRAINERS,
  maxTrainerCopies: MAX_TRAINER_COPIES,
  maxSameSymbolDuals: MAX_SAME_SYMBOL_DUALS,
  maxTriComponents: MAX_TRI_COMPONENTS,
  spellbookMin: SPELLBOOK_MIN,
  spellbookMax: SPELLBOOK_MAX,
  minLevel1Spells: MIN_LEVEL1_SPELLS,
};

const HTTP_CATALOG = buildCardCatalog();
import type { Db, UserRow } from "./db.ts";
import type { Mailer } from "./mail.ts";

/**
 * SSO against the ibokki.com site (django-oauth-toolkit as the OIDC provider).
 * When configured, "Sign in with ibokki.com" replaces local registration.
 */
export interface OidcConfig {
  /** Provider base, e.g. https://ibokki.com/o — endpoints are {issuer}/authorize/, /token/, /userinfo/. */
  issuer: string;
  clientId: string;
  clientSecret: string;
  /** External callback URL as the browser reaches it (behind nginx this includes /play). */
  redirectUri: string;
  /** Where to land after login, e.g. /play/. */
  publicPath: string;
}

export function oidcFromEnv(): OidcConfig | undefined {
  const issuer = process.env.IBOKKI_OIDC_ISSUER;
  const clientId = process.env.IBOKKI_OIDC_CLIENT_ID;
  const clientSecret = process.env.IBOKKI_OIDC_CLIENT_SECRET;
  if (!issuer || !clientId || !clientSecret) return undefined;
  const baseUrl = process.env.IBOKKI_BASE_URL ?? "http://localhost:7788";
  return {
    issuer: issuer.replace(/\/$/, ""),
    clientId,
    clientSecret,
    redirectUri: process.env.IBOKKI_OIDC_REDIRECT_URI ?? `${baseUrl}/api/auth/oidc/callback`,
    publicPath: process.env.IBOKKI_PUBLIC_PATH ?? "/",
  };
}

export interface ApiContext {
  db: Db;
  mailer: Mailer;
  /** Public origin for links in mails, e.g. https://ibokki.com */
  baseUrl: string;
  /** Set Secure on cookies (behind TLS in production). */
  secureCookies: boolean;
  oidc?: OidcConfig;
}

const SESSION_COOKIE = "ibokki_session";
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((res) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        res(data ? JSON.parse(data) : {});
      } catch {
        res({});
      }
    });
  });
}

function sendJson(res: ServerResponse, body: unknown, status = 200): void {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

function cookies(req: IncomingMessage): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function setSessionCookie(res: ServerResponse, ctx: ApiContext, raw: string | null): void {
  const attrs = [`${SESSION_COOKIE}=${raw ?? ""}`, "HttpOnly", "Path=/", "SameSite=Lax"];
  attrs.push(raw ? `Max-Age=${30 * 24 * 3600}` : "Max-Age=0");
  if (ctx.secureCookies) attrs.push("Secure");
  res.setHeader("set-cookie", attrs.join("; "));
}

/** The logged-in user for a request (HTTP route or WS upgrade), if any. */
export function userFromRequest(req: IncomingMessage, db: Db): UserRow | undefined {
  const raw = cookies(req)[SESSION_COOKIE];
  return raw ? db.userBySession(raw) : undefined;
}

function publicUser(u: UserRow) {
  return { id: u.id, username: u.username, email: u.email, emailVerified: !!u.email_verified };
}

function deckJson(row: { id: number; name: string; spellbook: string; resource_deck: string }) {
  return {
    id: row.id,
    name: row.name,
    spellbook: JSON.parse(row.spellbook) as string[],
    resourceDeck: JSON.parse(row.resource_deck) as string[],
  };
}

/** Handle /api/* routes. Returns false if the path is not an API route. */
export async function handleApi(req: IncomingMessage, res: ServerResponse, ctx: ApiContext): Promise<boolean> {
  const url = new URL(req.url ?? "/", ctx.baseUrl);
  const path = url.pathname;
  if (!path.startsWith("/api/")) return false;
  const { db, mailer } = ctx;
  const method = req.method ?? "GET";

  try {
    // ---------- auth ----------
    if (path === "/api/auth/config" && method === "GET") {
      sendJson(res, { oidcEnabled: !!ctx.oidc });
      return true;
    }

    if (path === "/api/auth/oidc/login" && method === "GET" && ctx.oidc) {
      const state = randomBytes(16).toString("base64url");
      const verifier = randomBytes(32).toString("base64url");
      const challenge = createHash("sha256").update(verifier).digest("base64url");
      // Short-lived flow cookie; verified against `state` at the callback.
      res.setHeader(
        "set-cookie",
        `ibokki_oidc=${state}.${verifier}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${ctx.secureCookies ? "; Secure" : ""}`,
      );
      const q = new URLSearchParams({
        response_type: "code",
        client_id: ctx.oidc.clientId,
        redirect_uri: ctx.oidc.redirectUri,
        scope: "openid profile email",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });
      res.writeHead(302, { location: `${ctx.oidc.issuer}/authorize/?${q}` });
      res.end();
      return true;
    }

    if (path === "/api/auth/oidc/callback" && method === "GET" && ctx.oidc) {
      const fail = (why: string) => {
        console.error("oidc callback failed:", why);
        res.writeHead(302, { location: `${ctx.oidc!.publicPath}?sso=failed` });
        res.end();
      };
      const [cookieState, verifier] = (cookies(req)["ibokki_oidc"] ?? "").split(".");
      const code = url.searchParams.get("code");
      if (!code || !cookieState || !verifier || url.searchParams.get("state") !== cookieState) {
        fail("state mismatch or missing code");
        return true;
      }
      const tokenRes = await fetch(`${ctx.oidc.issuer}/token/`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: ctx.oidc.redirectUri,
          client_id: ctx.oidc.clientId,
          client_secret: ctx.oidc.clientSecret,
          code_verifier: verifier,
        }),
      });
      if (!tokenRes.ok) {
        fail(`token endpoint ${tokenRes.status}: ${(await tokenRes.text()).slice(0, 200)}`);
        return true;
      }
      const tokens = (await tokenRes.json()) as { access_token?: string };
      if (!tokens.access_token) {
        fail("no access_token in token response");
        return true;
      }
      const infoRes = await fetch(`${ctx.oidc.issuer}/userinfo/`, {
        headers: { authorization: `Bearer ${tokens.access_token}` },
      });
      if (!infoRes.ok) {
        fail(`userinfo ${infoRes.status}`);
        return true;
      }
      const claims = (await infoRes.json()) as { sub?: string; preferred_username?: string; username?: string; email?: string };
      if (!claims.sub) {
        fail("userinfo carried no sub");
        return true;
      }
      const username = claims.preferred_username ?? claims.username ?? `wizard_${claims.sub.slice(0, 8)}`;
      const user = db.upsertOidcUser(String(claims.sub), username, claims.email ?? `${claims.sub}@sso.ibokki`);
      setSessionCookie(res, ctx, db.createSession(user.id));
      res.setHeader("set-cookie", [
        String(res.getHeader("set-cookie")),
        `ibokki_oidc=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
      ]);
      res.writeHead(302, { location: ctx.oidc.publicPath });
      res.end();
      return true;
    }

    if (path === "/api/auth/register" && method === "POST") {
      const b = await readBody(req);
      const email = String(b.email ?? "").trim();
      const username = String(b.username ?? "").trim();
      const password = String(b.password ?? "");
      if (!EMAIL_RE.test(email)) return sendJson(res, { error: "enter a valid email address" }, 400), true;
      if (!USERNAME_RE.test(username)) return sendJson(res, { error: "username must be 3–20 letters, digits or _" }, 400), true;
      if (password.length < MIN_PASSWORD) return sendJson(res, { error: `password must be at least ${MIN_PASSWORD} characters` }, 400), true;
      if (db.userByLogin(email) || db.userByLogin(username)) {
        return sendJson(res, { error: "that email or username is already registered" }, 409), true;
      }
      const user = db.createUser(email, username, await argon2.hash(password));
      const token = db.createEmailToken(user.id, "verify");
      void mailer
        .send(
          email,
          "Verify your Ibokki account",
          `Welcome to Ibokki, ${username}!\n\nVerify your email so you can recover your account later:\n${ctx.baseUrl}/api/auth/verify?token=${token}\n\nThe link is valid for 72 hours.`,
        )
        .catch((err) => console.error("verify mail failed:", err));
      setSessionCookie(res, ctx, db.createSession(user.id));
      sendJson(res, { user: publicUser(user) }, 201);
      return true;
    }

    if (path === "/api/auth/login" && method === "POST") {
      const b = await readBody(req);
      const user = db.userByLogin(String(b.usernameOrEmail ?? "").trim());
      if (user && user.password_hash === "") {
        return sendJson(res, { error: "this account signs in via ibokki.com" }, 401), true;
      }
      const ok = user && (await argon2.verify(user.password_hash, String(b.password ?? "")));
      if (!ok) return sendJson(res, { error: "wrong username/email or password" }, 401), true;
      setSessionCookie(res, ctx, db.createSession(user.id));
      sendJson(res, { user: publicUser(user) });
      return true;
    }

    if (path === "/api/auth/logout" && method === "POST") {
      const raw = cookies(req)[SESSION_COOKIE];
      if (raw) db.deleteSession(raw);
      setSessionCookie(res, ctx, null);
      sendJson(res, { ok: true });
      return true;
    }

    if (path === "/api/auth/me" && method === "GET") {
      const user = userFromRequest(req, db);
      sendJson(res, { user: user ? publicUser(user) : null });
      return true;
    }

    if (path === "/api/auth/verify" && method === "GET") {
      const userId = db.consumeEmailToken(url.searchParams.get("token") ?? "", "verify");
      if (userId !== null) db.markEmailVerified(userId);
      // Mail links land in a browser — bounce to the app with a status flag.
      res.writeHead(302, { location: userId !== null ? "/?verified=1" : "/?verified=0" });
      res.end();
      return true;
    }

    if (path === "/api/auth/forgot" && method === "POST") {
      const b = await readBody(req);
      const user = db.userByLogin(String(b.email ?? "").trim());
      // Always 200 — never reveal whether an email exists.
      if (user && user.email_verified) {
        const token = db.createEmailToken(user.id, "reset");
        void mailer
          .send(
            user.email,
            "Reset your Ibokki password",
            `Someone (hopefully you) asked to reset the password for ${user.username}.\n\nReset it here within 1 hour:\n${ctx.baseUrl}/reset?token=${token}\n\nIf this wasn't you, ignore this mail.`,
          )
          .catch((err) => console.error("reset mail failed:", err));
      }
      sendJson(res, { ok: true });
      return true;
    }

    if (path === "/api/auth/reset" && method === "POST") {
      const b = await readBody(req);
      const password = String(b.password ?? "");
      if (password.length < MIN_PASSWORD) return sendJson(res, { error: `password must be at least ${MIN_PASSWORD} characters` }, 400), true;
      const userId = db.consumeEmailToken(String(b.token ?? ""), "reset");
      if (userId === null) return sendJson(res, { error: "that reset link is invalid or expired" }, 400), true;
      db.setPassword(userId, await argon2.hash(password));
      setSessionCookie(res, ctx, db.createSession(userId));
      sendJson(res, { user: publicUser(db.userById(userId)!) });
      return true;
    }

    // ---------- cards & decks ----------
    if (path === "/api/cards" && method === "GET") {
      sendJson(res, HTTP_CATALOG);
      return true;
    }

    if (path === "/api/decks" && method === "GET") {
      const user = userFromRequest(req, db);
      sendJson(res, {
        rules: DECK_RULES,
        presets: PRESET_DECKS,
        decks: user ? db.decksForUser(user.id).map(deckJson) : [],
      });
      return true;
    }

    if (path === "/api/decks" && method === "POST") {
      const user = userFromRequest(req, db);
      if (!user) return sendJson(res, { error: "sign in to save decks" }, 401), true;
      const b = await readBody(req);
      const deck = {
        name: String(b.name ?? "").trim(),
        spellbook: Array.isArray(b.spellbook) ? b.spellbook.map(String) : [],
        resourceDeck: Array.isArray(b.resourceDeck) ? b.resourceDeck.map(String) : [],
      };
      const v = validateDeck(deck);
      if (!v.ok) return sendJson(res, { error: "deck is not legal", errors: v.errors }, 400), true;
      if (PRESET_DECKS.some((p) => p.name.toLowerCase() === deck.name.toLowerCase())) {
        return sendJson(res, { error: "that name is reserved for a preset deck" }, 400), true;
      }
      const id = typeof b.id === "number" ? b.id : undefined;
      if (id !== undefined && db.deckById(id)?.user_id !== user.id) {
        return sendJson(res, { error: "no such deck" }, 404), true;
      }
      try {
        sendJson(res, { deck: deckJson(db.saveDeck(user.id, deck.name, deck.spellbook, deck.resourceDeck, id)) }, id === undefined ? 201 : 200);
      } catch (err) {
        // UNIQUE(user_id, name) — a different deck already has this name.
        sendJson(res, { error: `you already have a deck named "${deck.name}"` }, 409);
      }
      return true;
    }

    const deckMatch = /^\/api\/decks\/(\d+)$/.exec(path);
    if (deckMatch && method === "DELETE") {
      const user = userFromRequest(req, db);
      if (!user) return sendJson(res, { error: "sign in first" }, 401), true;
      const gone = db.deleteDeck(user.id, Number(deckMatch[1]));
      sendJson(res, gone ? { ok: true } : { error: "no such deck" }, gone ? 200 : 404);
      return true;
    }

    sendJson(res, { error: "not found" }, 404);
    return true;
  } catch (err) {
    console.error("api error:", err);
    sendJson(res, { error: "server error" }, 500);
    return true;
  }
}
