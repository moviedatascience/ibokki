/**
 * Accounts + decks: register → verify → save deck → bring it to a match,
 * plus password reset and the ownership/legality guards. Uses the real HTTP
 * API with a hand-rolled cookie jar and a capturing mailer (the "SMTP" side
 * of the ProtonMail setup is nodemailer config, not logic worth mocking).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import WebSocket from "ws";
import { createOnlineServer } from "../src/app.ts";
import { PRESET_DECKS } from "@ibokki/engine";
import { SPELLS } from "@ibokki/cards";

interface Mail {
  to: string;
  subject: string;
  text: string;
}
const mails: Mail[] = [];

const { http: server } = createOnlineServer({
  dbFile: ":memory:",
  baseUrl: "http://test.local",
  mailer: { send: async (to, subject, text) => void mails.push({ to, subject, text }) },
});

let base = "";
let wsUrl = "";

beforeAll(async () => {
  await new Promise<void>((res) => server.listen(0, res));
  const port = (server.address() as AddressInfo).port;
  base = `http://127.0.0.1:${port}`;
  wsUrl = `ws://127.0.0.1:${port}/ws`;
});

afterAll(async () => {
  await new Promise((res) => server.close(res));
});

/** Minimal per-user cookie jar over fetch. */
class Client {
  cookie = "";
  async call(method: string, path: string, body?: unknown): Promise<{ status: number; json: any; headers: Headers }> {
    const r = await fetch(base + path, {
      method,
      redirect: "manual",
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(this.cookie ? { cookie: this.cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookie = r.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0]!;
    const text = await r.text();
    return { status: r.status, json: text.startsWith("{") ? JSON.parse(text) : null, headers: r.headers };
  }
}

const tokenFrom = (mail: Mail) => /token=([A-Za-z0-9_-]+)/.exec(mail.text)![1]!;

describe("accounts", () => {
  const alice = new Client();

  it("registers, is signed in, and receives a verification mail", async () => {
    const r = await alice.call("POST", "/api/auth/register", {
      email: "alice@example.com",
      username: "alice",
      password: "hunter22222",
    });
    expect(r.status).toBe(201);
    expect(r.json.user.username).toBe("alice");
    expect(r.json.user.emailVerified).toBe(false);
    expect(alice.cookie).toContain("ibokki_session=");

    const me = await alice.call("GET", "/api/auth/me");
    expect(me.json.user.username).toBe("alice");

    expect(mails).toHaveLength(1);
    expect(mails[0]!.subject).toContain("Verify");
  });

  it("rejects bad registrations and duplicates", async () => {
    const c = new Client();
    expect((await c.call("POST", "/api/auth/register", { email: "x", username: "ok_name", password: "longenough" })).status).toBe(400);
    expect((await c.call("POST", "/api/auth/register", { email: "b@b.co", username: "no spaces", password: "longenough" })).status).toBe(400);
    expect((await c.call("POST", "/api/auth/register", { email: "b@b.co", username: "bob", password: "short" })).status).toBe(400);
    expect((await c.call("POST", "/api/auth/register", { email: "ALICE@example.com", username: "alice2", password: "longenough" })).status).toBe(409);
  });

  it("verifies the email via the mailed token", async () => {
    const verify = await alice.call("GET", `/api/auth/verify?token=${tokenFrom(mails[0]!)}`);
    expect(verify.status).toBe(302);
    expect(verify.headers.get("location")).toBe("/?verified=1");
    expect((await alice.call("GET", "/api/auth/me")).json.user.emailVerified).toBe(true);
    // Single use.
    const again = await alice.call("GET", `/api/auth/verify?token=${tokenFrom(mails[0]!)}`);
    expect(again.headers.get("location")).toBe("/?verified=0");
  });

  it("resets the password via the mailed token and invalidates old sessions", async () => {
    await alice.call("POST", "/api/auth/forgot", { email: "alice@example.com" });
    const resetMail = mails.find((m) => m.subject.includes("Reset"))!;
    expect(resetMail).toBeTruthy();

    const fresh = new Client();
    const r = await fresh.call("POST", "/api/auth/reset", { token: tokenFrom(resetMail), password: "newpassword1" });
    expect(r.status).toBe(200);

    // Old session is dead; old password fails; new password works.
    expect((await alice.call("GET", "/api/auth/me")).json.user).toBeNull();
    expect((await new Client().call("POST", "/api/auth/login", { usernameOrEmail: "alice", password: "hunter22222" })).status).toBe(401);
    const login = await new Client().call("POST", "/api/auth/login", { usernameOrEmail: "alice@example.com", password: "newpassword1" });
    expect(login.status).toBe(200);
    alice.cookie = ""; // rebuild alice's session for later tests
    const relog = await alice.call("POST", "/api/auth/login", { usernameOrEmail: "alice", password: "newpassword1" });
    expect(relog.status).toBe(200);
  });
});

describe("decks", () => {
  const alice = new Client();
  let deckId = 0;

  /** A legal custom deck: Emberworks with one Evocation spell swapped cross-school. */
  function customDeck() {
    const ember = PRESET_DECKS.find((d) => d.name === "Emberworks")!;
    const spellbook = [...ember.spellbook];
    const swap = SPELLS.find((c) => c.school === "Divination" && !spellbook.includes(c.id))!;
    spellbook[spellbook.length - 1] = swap.id;
    return { name: "Alice Burn", spellbook, resourceDeck: [...ember.resourceDeck] };
  }

  it("lists presets without login; saving requires login", async () => {
    const anon = new Client();
    const list = await anon.call("GET", "/api/decks");
    expect(list.json.presets.map((p: { name: string }) => p.name).sort()).toEqual(["Bastion", "Emberworks", "Riptide"]);
    expect(list.json.decks).toEqual([]);
    expect((await anon.call("POST", "/api/decks", customDeck())).status).toBe(401);
  });

  it("saves a legal deck, rejects illegal ones and reserved names", async () => {
    await alice.call("POST", "/api/auth/login", { usernameOrEmail: "alice", password: "newpassword1" });

    const bad = customDeck();
    bad.resourceDeck.push("CMP-V"); // 41 cards
    const rBad = await alice.call("POST", "/api/decks", bad);
    expect(rBad.status).toBe(400);
    expect(rBad.json.errors[0].message).toContain("exactly 40");

    expect((await alice.call("POST", "/api/decks", { ...customDeck(), name: "Emberworks" })).status).toBe(400);

    const r = await alice.call("POST", "/api/decks", customDeck());
    expect(r.status).toBe(201);
    deckId = r.json.deck.id;

    const list = await alice.call("GET", "/api/decks");
    expect(list.json.decks).toHaveLength(1);
    expect(list.json.decks[0].name).toBe("Alice Burn");
  });

  it("brings the saved deck into a match (deck names as the match labels)", async () => {
    const frames: any[] = [];
    const wsA = new WebSocket(wsUrl, { headers: { cookie: alice.cookie } });
    const wsB = new WebSocket(wsUrl);
    const wait = (pred: () => boolean) =>
      new Promise<void>((res, rej) => {
        const t = setTimeout(() => rej(new Error("timeout")), 5000);
        const iv = setInterval(() => {
          if (pred()) {
            clearTimeout(t);
            clearInterval(iv);
            res();
          }
        }, 5);
      });

    // A socket may already be OPEN by the time we get to await it.
    const opened = (ws: WebSocket) =>
      ws.readyState === WebSocket.OPEN ? Promise.resolve() : new Promise((res) => ws.once("open", res));

    let code = "";
    wsA.on("message", (d) => {
      const m = JSON.parse(String(d));
      if (m.t === "created") code = m.code;
      if (m.t === "state") frames.push(m.state);
      if (m.t === "error") frames.push({ error: m.message });
    });
    await opened(wsA);
    wsA.send(JSON.stringify({ t: "create", deck: { deckId } }));
    await wait(() => code !== "");

    await opened(wsB);
    wsB.send(JSON.stringify({ t: "join", code, deck: { preset: "Bastion" } }));
    await wait(() => frames.length > 0);

    expect(frames[0].error).toBeUndefined();
    expect(frames[0].schools).toEqual(["Alice Burn", "Bastion"]);
    wsA.close();
    wsB.close();
  });

  it("refuses a saved deck without the owner's session", async () => {
    const errors: string[] = [];
    const ws = new WebSocket(wsUrl); // no cookie
    ws.on("message", (d) => {
      const m = JSON.parse(String(d));
      if (m.t === "error") errors.push(m.message);
    });
    await new Promise((res) => ws.once("open", res));
    ws.send(JSON.stringify({ t: "create", deck: { deckId } }));
    await new Promise((r) => setTimeout(r, 200));
    expect(errors[0]).toContain("sign in");
    ws.close();
  });

  it("deletes a deck", async () => {
    expect((await alice.call("DELETE", `/api/decks/${deckId}`)).status).toBe(200);
    expect((await alice.call("GET", "/api/decks")).json.decks).toEqual([]);
  });
});
