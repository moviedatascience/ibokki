/**
 * The persistence loop: finished matches become per-user history + a W-L record,
 * any played match can be re-watched (authenticated) or shared as a public
 * replay link, and replays rebuild deterministically from {seed, decks, actions}
 * with the sharing seat's own redaction (a link never shows more than its owner
 * saw live).
 */
import { afterAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import Database from "better-sqlite3";
import { createOnlineServer, type ServerOptions } from "../src/app.ts";
import { Db } from "../src/db.ts";
import { buildReplayFrames, MAX_REPLAY_ACTIONS, ReplayTooLong } from "../src/replay.ts";
import { presetDeck } from "@ibokki/engine";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

const tmp = mkdtempSync(join(tmpdir(), "ibokki-history-"));
afterAll(() => {
  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* a failed test can leave a db handle open — don't mask the real failure */
  }
});

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

async function startServer(opts: ServerOptions): Promise<{ base: string; wsUrl: string; shutdown: () => Promise<void> }> {
  const { http, shutdown } = createOnlineServer({ msgBurst: 1e9, msgRefillPerSec: 1e9, ...opts });
  await new Promise<void>((res) => http.listen(0, res));
  const port = (http.address() as AddressInfo).port;
  return { base: `http://127.0.0.1:${port}`, wsUrl: `ws://127.0.0.1:${port}/ws`, shutdown };
}

/** Minimal cookie-jar HTTP client (accounts.test.ts pattern). */
class Http {
  cookie = "";
  constructor(private base: string) {}
  async call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const r = await fetch(this.base + path, {
      method,
      redirect: "manual",
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookie = r.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0]!;
    const text = await r.text();
    return { status: r.status, text, json: text.startsWith("{") ? JSON.parse(text) : null, headers: r.headers };
  }
}

class TestClient {
  ws: WebSocket;
  latest: MatchStatePayload | null = null;
  states: MatchStatePayload[] = [];
  lobby: { code: string; side: number; token: string } | null = null;
  errors: string[] = [];

  constructor(url: string, cookie?: string) {
    this.ws = new WebSocket(url, cookie ? { headers: { cookie } } : undefined);
    this.ws.on("message", (data) => {
      const msg = JSON.parse(String(data)) as ServerMessage;
      if (msg.t === "created" || msg.t === "joined") this.lobby = { code: msg.code, side: msg.side, token: msg.token };
      if (msg.t === "state") {
        this.states.push(msg.state);
        this.latest = msg.state;
        if (msg.error) this.errors.push(msg.error);
      }
      if (msg.t === "error") this.errors.push(msg.message);
    });
  }

  open(): Promise<void> {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((res, rej) => {
      this.ws.once("open", () => res());
      this.ws.once("error", rej);
    });
  }

  send(msg: object): void {
    this.ws.send(JSON.stringify(msg));
  }

  close(): void {
    this.ws.close();
  }
}

const until = async (pred: () => boolean, label: string, timeoutMs = 15_000) => {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout waiting for ${label}`);
    await new Promise((r) => setTimeout(r, 2));
  }
};

async function playRandom(clients: TestClient[], rand: () => number, stop: () => boolean): Promise<void> {
  while (!stop()) {
    if (clients.every((c) => c.latest?.gameOver)) return;
    await until(() => clients.some((c) => c.latest?.yourTurn) || clients.every((c) => c.latest?.gameOver), "a turn or game over");
    const actor = clients.find((c) => c.latest?.yourTurn);
    if (!actor) continue;
    const legal = actor.latest!.legal;
    const before = actor.states.length;
    actor.send({ t: "act", indices: [Math.floor(rand() * legal.length)] });
    await until(() => actor.states.length > before, "state frame after acting");
  }
}

/** Fetch every frame of a replay through the chunk API. */
async function allFrames(http: Http, basePath: string): Promise<MatchStatePayload[]> {
  const frames: MatchStatePayload[] = [];
  for (;;) {
    const r = await http.call("GET", `${basePath}/frames?from=${frames.length}&count=200`);
    expect(r.status).toBe(200);
    frames.push(...(r.json.frames as MatchStatePayload[]));
    if (frames.length >= (r.json.total as number) || r.json.frames.length === 0) return frames;
  }
}

describe("solo match: history, W-L record, share, deterministic replay", () => {
  it("runs the whole loop", { timeout: 120_000 }, async () => {
    const dbFile = join(tmp, "solo.db");
    const rand = lcg(11);
    const srv = await startServer({ dbFile, startingHp: 4 }); // low HP: random play must finish fast

    const alice = new Http(srv.base);
    expect((await alice.call("POST", "/api/auth/register", { email: "a@x.co", username: "alice", password: "longenough1" })).status).toBe(201);

    // Signed-out history is rejected; an empty history starts the loop.
    expect((await new Http(srv.base).call("GET", "/api/matches")).status).toBe(401);
    const before = await alice.call("GET", "/api/matches");
    expect(before.json.matches).toEqual([]);
    expect(before.json.record.solo).toEqual({ wins: 0, losses: 0, draws: 0 });

    // Play a solo bot match to a natural end (the session cookie rides the WS handshake).
    const a = new TestClient(srv.wsUrl, alice.cookie);
    await a.open();
    a.send({ t: "create", deck: { preset: "Riptide" }, bot: true });
    await until(() => a.latest !== null, "bot room created");
    await playRandom([a], rand, () => false);
    expect(a.latest!.gameOver).toBe(true);
    const live = a.latest!;
    a.close();

    // History: one solo row whose outcome matches the live frame's winner.
    const hist = await alice.call("GET", "/api/matches");
    expect(hist.json.matches).toHaveLength(1);
    const entry = hist.json.matches[0];
    expect(entry.mode).toBe("solo");
    expect(entry.opponentName).toBe("Bot");
    expect(entry.shareToken).toBeNull();
    const expected = live.winner === null ? "draw" : live.winner === 0 ? "win" : "loss";
    expect(entry.outcome).toBe(expected);
    const rec = hist.json.record.solo;
    expect(rec.wins + rec.losses + rec.draws).toBe(1);
    expect(rec[expected === "win" ? "wins" : expected === "loss" ? "losses" : "draws"]).toBe(1);

    // No participant, no share: bob gets the same 404 as a nonexistent id.
    const bob = new Http(srv.base);
    await bob.call("POST", "/api/auth/register", { email: "b@x.co", username: "bob", password: "longenough1" });
    expect((await bob.call("POST", `/api/matches/${entry.id}/share`)).status).toBe(404);
    expect((await bob.call("GET", `/api/matches/${entry.id}/replay`)).status).toBe(404);

    // Minting is idempotent and shows up in history afterwards.
    const share = await alice.call("POST", `/api/matches/${entry.id}/share`);
    expect(share.status).toBe(200);
    const token = share.json.token as string;
    expect((await alice.call("POST", `/api/matches/${entry.id}/share`)).json.token).toBe(token);
    expect((await alice.call("GET", "/api/matches")).json.matches[0].shareToken).toBe(token);

    // Public replay meta: deck names only — no usernames, no ids.
    const anon = new Http(srv.base);
    const meta = await anon.call("GET", `/api/replays/${token}`);
    expect(meta.status).toBe(200);
    expect(meta.json.decks[0]).toBe("Riptide");
    expect(meta.json.bot).toBe(true);
    expect(meta.json.result.winner).toBe(live.winner);
    expect(meta.text).not.toContain("alice");
    expect((await anon.call("GET", "/api/replays/nosuchtoken123")).status).toBe(404);

    // Frames: full deterministic rebuild, ending exactly where the live game did.
    const frames = await allFrames(anon, `/api/replays/${token}`);
    expect(frames.length).toBe(meta.json.total);
    const last = frames[frames.length - 1]!;
    expect(last.gameOver).toBe(true);
    expect(last.winner).toBe(live.winner);
    expect(last.view.self.hp).toBe(live.view.self.hp);
    expect(last.view.opponent.hp).toBe(live.view.opponent.hp);
    expect(frames[0]!.view.self.hp).toBe(4);

    // Redaction and leak guards hold on every frame: the opponent view never exposes
    // a hand or spellbook key, nothing is clickable, and no rejoin token appears
    // anywhere. (Face-down prep redaction itself is owned by the protocol's
    // eventForViewer/redact and their tests — frames only reuse it.)
    for (const f of frames) {
      expect("hand" in f.view.opponent).toBe(false);
      expect("spellbook" in f.view.opponent).toBe(false);
      expect(f.legal).toEqual([]);
    }
    const bodies = JSON.stringify(frames) + meta.text + hist.text;
    expect(bodies).not.toContain(a.lobby!.token);

    // The accumulated log deltas replay the live transcript (same line count, same
    // tail). Assumes no turn-clock strike fired mid-match (bot rooms run no clocks;
    // an "out of time" line is live-only and would offset the count by one).
    const lines = frames.flatMap((f) => f.log);
    expect(lines.length).toBe(live.log.length);
    expect(lines.slice(-5)).toEqual(live.log.slice(-5));

    // Chunk pagination is deterministic regardless of match length: a 1-frame window
    // at the end must deep-equal the corresponding frame of the full fetch.
    const probe = await anon.call("GET", `/api/replays/${token}/frames?from=${frames.length - 1}&count=1`);
    expect(probe.json.frames).toHaveLength(1);
    expect(probe.json.frames[0]).toEqual(frames[frames.length - 1]);

    // Frames are served gzipped when accepted, raw otherwise — same payload both
    // ways — and only the PUBLIC token route is browser-cacheable; bad `from` is 400.
    const gz = await anon.call("GET", `/api/replays/${token}/frames?from=0&count=1`);
    expect(gz.headers.get("content-encoding")).toBe("gzip"); // node fetch advertises gzip + auto-decompresses
    expect(gz.headers.get("cache-control")).toContain("max-age");
    const raw = await anon.call("GET", `/api/replays/${token}/frames?from=0&count=1`, undefined, { "accept-encoding": "identity" });
    expect(raw.headers.get("content-encoding")).toBeNull();
    expect(gz.text).toBe(raw.text);
    expect((await anon.call("GET", `/api/replays/${token}/frames?from=-1`)).status).toBe(400);
    expect((await anon.call("GET", `/api/replays/${token}/frames?from=abc`)).status).toBe(400);

    // Own rewatch (no token minted, cookie required) serves the same replay from the
    // same SEAT — deep-equality of the final frame pins the seat (seat 1's view.self
    // would differ) — and must never be browser-cacheable (URL-keyed caches are
    // cookie-blind on shared profiles).
    expect((await anon.call("GET", `/api/matches/${entry.id}/replay/frames`)).status).toBe(401);
    const own = await alice.call("GET", `/api/matches/${entry.id}/replay`);
    expect(own.status).toBe(200);
    expect(own.json.total).toBe(meta.json.total);
    const ownFrames = await allFrames(alice, `/api/matches/${entry.id}/replay`);
    expect(ownFrames.length).toBe(frames.length);
    expect(ownFrames[ownFrames.length - 1]).toEqual(frames[frames.length - 1]);
    const ownChunk = await alice.call("GET", `/api/matches/${entry.id}/replay/frames?from=0&count=1`);
    expect(ownChunk.headers.get("cache-control")).toBe("no-store");

    // The viewer's catalog is served under the replay prefix (dev-proxy routing).
    const cat = await anon.call("GET", "/api/replays/catalog");
    expect(cat.status).toBe(200);
    expect(Object.keys(cat.json).length).toBeGreaterThan(50);

    await srv.shutdown();

    // Replay fidelity across config drift: a server booted with a DIFFERENT
    // startingHp must rebuild this match from its recorded per-row value.
    const srv2 = await startServer({ dbFile }); // no override — engine default 30
    const alice2 = new Http(srv2.base);
    alice2.cookie = alice.cookie; // sessions live in the same db file
    const again = await allFrames(alice2, `/api/matches/${entry.id}/replay`);
    expect(again[0]!.view.self.hp).toBe(4);
    expect(again[again.length - 1]!.gameOver).toBe(true);
    await srv2.shutdown();

    // Outcome-drift honesty over HTTP: tamper the stored result (flip the winner —
    // the stored result is the replay's checksum) and the frames route must 410
    // instead of serving a replay that contradicts the record.
    const rawDb = new Database(dbFile);
    rawDb.prepare("UPDATE matches SET result = json_set(result, '$.winner', ?) WHERE id = ?").run(live.winner === 0 ? 1 : 0, entry.id);
    rawDb.close();
    const srv3 = await startServer({ dbFile });
    const alice3 = new Http(srv3.base);
    alice3.cookie = alice.cookie;
    const drift = await alice3.call("GET", `/api/matches/${entry.id}/replay/frames`);
    expect(drift.status).toBe(410);
    expect(drift.json.error).toContain("older version");
    await srv3.shutdown();
  });
});

describe("PvP forfeit: out-of-band endings in history and replay meta", () => {
  it("records the forfeit for both seats and replays to a non-terminal tail", { timeout: 60_000 }, async () => {
    const rand = lcg(23);
    const srv = await startServer({ dbFile: ":memory:", disconnectGraceMs: 200 });
    const cara = new Http(srv.base);
    const dave = new Http(srv.base);
    await cara.call("POST", "/api/auth/register", { email: "c@x.co", username: "cara", password: "longenough1" });
    await dave.call("POST", "/api/auth/register", { email: "d@x.co", username: "dave", password: "longenough1" });

    const c = new TestClient(srv.wsUrl, cara.cookie);
    await c.open();
    c.send({ t: "create", deck: { preset: "Emberworks" } });
    await until(() => c.lobby !== null, "room created");
    const d = new TestClient(srv.wsUrl, dave.cookie);
    await d.open();
    d.send({ t: "join", code: c.lobby!.code, deck: { preset: "Bastion" } });
    await until(() => c.latest !== null && d.latest !== null, "both seated");

    let acted = 0;
    await playRandom([c, d], rand, () => ++acted > 10);
    expect(c.latest!.gameOver).toBe(false);

    // Dave walks away; the grace timer forfeits him and Cara sees the game end.
    d.close();
    await until(() => !!c.latest?.gameOver, "forfeit resolution", 10_000);
    expect(c.latest!.endReason).toBe("forfeit");

    // Both users see the same match with opposite outcomes and real usernames.
    const ch = await cara.call("GET", "/api/matches");
    const dh = await dave.call("GET", "/api/matches");
    expect(ch.json.matches[0].outcome).toBe("win");
    expect(ch.json.matches[0].opponentName).toBe("dave");
    expect(ch.json.matches[0].endReason).toBe("forfeit");
    expect(dh.json.matches[0].outcome).toBe("loss");
    expect(dh.json.matches[0].opponentName).toBe("cara");
    expect(ch.json.record.pvp).toEqual({ wins: 1, losses: 0, draws: 0 });
    expect(dh.json.record.pvp).toEqual({ wins: 0, losses: 1, draws: 0 });

    // Each seat's share is its own perspective: the winner is seat-relative.
    const id = ch.json.matches[0].id;
    const ct = (await cara.call("POST", `/api/matches/${id}/share`)).json.token as string;
    const dt = (await dave.call("POST", `/api/matches/${id}/share`)).json.token as string;
    expect(ct).not.toBe(dt);
    const anon = new Http(srv.base);
    const cm = await anon.call("GET", `/api/replays/${ct}`);
    const dm = await anon.call("GET", `/api/replays/${dt}`);
    const cmeta = cm.json;
    const dmeta = dm.json;
    expect(cmeta.result.winner).toBe(0);
    expect(cmeta.result.forfeit).toEqual({ by: 1, cause: "disconnected" });
    expect(dmeta.result.winner).toBe(1);
    expect(dmeta.result.forfeit).toEqual({ by: 0, cause: "disconnected" });

    // A forfeit is match-layer, not an action: the replay ends before the ending.
    // And the OPPONENT's plaintext rejoin token (stored beside the sharer's in the
    // seats JSON) must never surface in either seat's public meta or frames —
    // nor either token in a participant's own history payload.
    const cFrames = await allFrames(anon, `/api/replays/${ct}`);
    expect(cFrames[cFrames.length - 1]!.gameOver).toBe(false);
    expect(JSON.stringify(cFrames) + cm.text).not.toContain(d.lobby!.token);
    const dFrames = await allFrames(anon, `/api/replays/${dt}`);
    expect(JSON.stringify(dFrames) + dm.text).not.toContain(c.lobby!.token);
    expect(ch.text).not.toContain(c.lobby!.token);
    expect(ch.text).not.toContain(d.lobby!.token);

    // A second, unfinished match: 409 for its player, 404 for a stranger.
    const c2 = new TestClient(srv.wsUrl, cara.cookie);
    await c2.open();
    c2.send({ t: "create", deck: { preset: "Emberworks" }, bot: true });
    await until(() => c2.latest !== null, "second room");
    const liveId = id + 1; // rows are sequential; the new row is the only live one
    expect((await cara.call("POST", `/api/matches/${liveId}/share`)).status).toBe(409);
    expect((await dave.call("POST", `/api/matches/${liveId}/share`)).status).toBe(404);
    c2.close();
    c.close();
    await srv.shutdown();
  });
});

describe("db-level record and replay guards", () => {
  const deck = presetDeck("Emberworks")!;
  const seat = (userId?: number) => ({ token: "t-" + Math.random(), deckName: deck.name, deck: { spellbook: deck.spellbook, resourceDeck: deck.resourceDeck }, userId });
  const finish = (db: Db, id: number, winner: 0 | 1 | null, endReason: string) =>
    db.finishMatch(id, JSON.stringify({ winner, endReason, forfeit: null }));

  it("counts self-matches once per seat and hides abandoned rows", () => {
    const db = new Db(":memory:");
    const uid = 7;
    // Win as seat 0 vs a guest; loss as seat 1; draw; a self-match; an abandoned row.
    finish(db, db.createMatch("AAAAA", 1, JSON.stringify([seat(uid), seat()]), false), 0, "hp");
    finish(db, db.createMatch("BBBBB", 2, JSON.stringify([seat(9), seat(uid)]), false), 0, "hp");
    finish(db, db.createMatch("CCCCC", 3, JSON.stringify([seat(uid), seat(9)]), false), null, "forfeit");
    finish(db, db.createMatch("DDDDD", 4, JSON.stringify([seat(uid), seat(uid)]), false), 1, "hp");
    finish(db, db.createMatch("EEEEE", 5, JSON.stringify([seat(uid), seat()]), false), null, "abandoned");
    const rec = db.recordForUser(uid);
    // A(win) + B(loss) + C(draw) + D(self: one win AND one loss) — E never counts.
    expect(rec.pvp).toEqual({ wins: 2, losses: 2, draws: 1 });
    expect(rec.solo).toEqual({ wins: 0, losses: 0, draws: 0 });
    expect(db.matchesForUser(uid).map((m) => m.code)).toEqual(["DDDDD", "CCCCC", "BBBBB", "AAAAA"]);
    // The other named user counts only their own seats: a win in B, a draw in C.
    expect(db.recordForUser(9)).toEqual({ pvp: { wins: 1, losses: 0, draws: 1 }, solo: { wins: 0, losses: 0, draws: 0 } });
    // A user in no matches has a clean slate.
    expect(db.recordForUser(999)).toEqual({ pvp: { wins: 0, losses: 0, draws: 0 }, solo: { wins: 0, losses: 0, draws: 0 } });
    db.close();
  });

  it("share tokens are per-seat, idempotent, and resolvable", () => {
    const db = new Db(":memory:");
    const id = db.createMatch("AAAAA", 1, JSON.stringify([seat(1), seat(2)]), false);
    expect(db.shareTokenFor(id, 0)).toBeNull();
    const t0 = db.getOrCreateShare(id, 0);
    const t1 = db.getOrCreateShare(id, 1);
    expect(t0).not.toBe(t1);
    expect(db.getOrCreateShare(id, 0)).toBe(t0);
    expect(db.matchByShareToken(t1)).toMatchObject({ seat: 1 });
    expect(db.matchByShareToken(t1)!.row.id).toBe(id);
    expect(db.matchByShareToken("nope")).toBeUndefined();
    db.close();
  });

  it("refuses degenerate action logs and detects outcome drift", () => {
    const db = new Db(":memory:");
    // A crafted log past the cap must be refused before any replay work happens.
    const longId = db.createMatch("AAAAA", 1, JSON.stringify([seat(1), seat()]), false);
    db.updateMatchActions(longId, JSON.stringify(Array(MAX_REPLAY_ACTIONS + 1).fill({ s: 0, a: { type: "pass" } })));
    finish(db, longId, 0, "hp");
    expect(() => buildReplayFrames(db.matchById(longId)!, 0)).toThrow(ReplayTooLong);
    // A stored natural ending that the replay can't reproduce (here: no actions at
    // all) is drift, not a servable replay.
    const driftId = db.createMatch("BBBBB", 2, JSON.stringify([seat(1), seat()]), false);
    finish(db, driftId, 0, "hp");
    expect(() => buildReplayFrames(db.matchById(driftId)!, 0)).toThrow(/drift/);
    db.close();
  });
});
