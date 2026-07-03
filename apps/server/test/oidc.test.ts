/**
 * SSO flow against a mock django-oauth-toolkit-shaped issuer: authorize
 * redirect (PKCE + state), code→token exchange, userinfo→local user upsert,
 * session cookie, and the guards (state mismatch, local login lockout for
 * SSO accounts, stable identity across logins).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import { createOnlineServer } from "../src/app.ts";

// ---- mock issuer ----
const issued = { tokens: 0, lastVerifier: "", lastCode: "" };
const mockIssuer: Server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  if (url.pathname === "/o/token/" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const p = new URLSearchParams(body);
      issued.lastVerifier = p.get("code_verifier") ?? "";
      issued.lastCode = p.get("code") ?? "";
      const ok =
        p.get("grant_type") === "authorization_code" &&
        p.get("client_id") === "game-client" &&
        p.get("client_secret") === "game-secret" &&
        p.get("code") === "good-code";
      if (!ok) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_grant" }));
        return;
      }
      issued.tokens++;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ access_token: `tok-${issued.tokens}`, token_type: "Bearer" }));
    });
    return;
  }
  if (url.pathname === "/o/userinfo/" && req.method === "GET") {
    if (!(req.headers.authorization ?? "").startsWith("Bearer tok-")) {
      res.writeHead(401);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ sub: "site-42", preferred_username: "eric", email: "eric@ibokki.com" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

let issuerUrl = "";
let base = "";
let game: ReturnType<typeof createOnlineServer>;

beforeAll(async () => {
  await new Promise<void>((r) => mockIssuer.listen(0, r));
  issuerUrl = `http://127.0.0.1:${(mockIssuer.address() as AddressInfo).port}/o`;
  game = createOnlineServer({
    dbFile: ":memory:",
    baseUrl: "http://game.local",
    mailer: { send: async () => {} },
    oidc: {
      issuer: issuerUrl,
      clientId: "game-client",
      clientSecret: "game-secret",
      redirectUri: "http://game.local/api/auth/oidc/callback",
      publicPath: "/play/",
    },
  });
  await new Promise<void>((r) => game.http.listen(0, r));
  base = `http://127.0.0.1:${(game.http.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((r) => game.http.close(r));
  await new Promise((r) => mockIssuer.close(r));
});

/** Run /login and return the pieces a browser would carry to the callback. */
async function startLogin() {
  const r = await fetch(`${base}/api/auth/oidc/login`, { redirect: "manual" });
  expect(r.status).toBe(302);
  const location = new URL(r.headers.get("location")!);
  const flowCookie = r.headers.getSetCookie().find((c) => c.startsWith("ibokki_oidc="))!.split(";")[0]!;
  return { location, flowCookie };
}

describe("oidc sso", () => {
  it("advertises SSO via /api/auth/config", async () => {
    const cfg = (await (await fetch(`${base}/api/auth/config`)).json()) as { oidcEnabled: boolean };
    expect(cfg.oidcEnabled).toBe(true);
  });

  it("login redirects to the issuer with state + S256 PKCE", async () => {
    const { location, flowCookie } = await startLogin();
    expect(location.href.startsWith(`${issuerUrl}/authorize/`)).toBe(true);
    expect(location.searchParams.get("client_id")).toBe("game-client");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    const [state, verifier] = flowCookie.split("=")[1]!.split(".");
    expect(location.searchParams.get("state")).toBe(state);
    const expected = createHash("sha256").update(verifier!).digest("base64url");
    expect(location.searchParams.get("code_challenge")).toBe(expected);
  });

  it("callback exchanges the code, creates the user, and signs them in", async () => {
    const { location, flowCookie } = await startLogin();
    const state = location.searchParams.get("state")!;
    const cb = await fetch(`${base}/api/auth/oidc/callback?code=good-code&state=${state}`, {
      redirect: "manual",
      headers: { cookie: flowCookie },
    });
    expect(cb.status).toBe(302);
    expect(cb.headers.get("location")).toBe("/play/");
    // The verifier sent to the token endpoint matches the flow cookie's.
    expect(issued.lastVerifier).toBe(flowCookie.split("=")[1]!.split(".")[1]);

    const session = cb.headers.getSetCookie().find((c) => c.startsWith("ibokki_session="))!.split(";")[0]!;
    const me = (await (await fetch(`${base}/api/auth/me`, { headers: { cookie: session } })).json()) as {
      user: { username: string; emailVerified: boolean };
    };
    expect(me.user.username).toBe("eric");
    expect(me.user.emailVerified).toBe(true); // the site verified it
  });

  it("the same site identity maps to the same local user on re-login", async () => {
    const before = game.db.userByLogin("eric")!.id;
    const { location, flowCookie } = await startLogin();
    const state = location.searchParams.get("state")!;
    await fetch(`${base}/api/auth/oidc/callback?code=good-code&state=${state}`, { redirect: "manual", headers: { cookie: flowCookie } });
    expect(game.db.userByLogin("eric")!.id).toBe(before);
  });

  it("rejects a forged state and refuses local logins for SSO accounts", async () => {
    const { flowCookie } = await startLogin();
    const bad = await fetch(`${base}/api/auth/oidc/callback?code=good-code&state=WRONG`, {
      redirect: "manual",
      headers: { cookie: flowCookie },
    });
    expect(bad.headers.get("location")).toBe("/play/?sso=failed");

    const login = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "eric", password: "whatever123" }),
    });
    expect(login.status).toBe(401);
    expect(((await login.json()) as { error: string }).error).toContain("ibokki.com");
  });
});
