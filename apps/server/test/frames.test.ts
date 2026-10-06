/**
 * Frame streaming + the OpenSky-review match-layer fixes (2026-10-06):
 *  #78 a bot's turn arrives as one frame per move, not one teleporting snapshot;
 *  #75 an act carrying a stale epoch is ignored and answered with a fresh frame;
 *  #77 advertised clock deadlines leave a late-move grace;
 *  #74 a socket that stops answering heartbeat pings is terminated → its seat enters grace;
 *  #76 a live match recorded under different rules is abandoned on boot, never replayed.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import { createOnlineServer, type ServerOptions } from "../src/app.ts";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

const tmp = mkdtempSync(join(tmpdir(), "ibokki-frames-"));
afterAll(() => {
  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* a failed test can leave a db handle open — don't mask the real failure */
  }
});

async function startServer(opts: ServerOptions) {
  const srv = createOnlineServer({ dbFile: ":memory:", msgBurst: 1e9, msgRefillPerSec: 1e9, heartbeatMs: 0, ...opts });
  await new Promise<void>((res) => srv.http.listen(0, res));
  return { ...srv, url: `ws://127.0.0.1:${(srv.http.address() as AddressInfo).port}/ws` };
}

class TestClient {
  ws: WebSocket;
  states: MatchStatePayload[] = [];
  latest: MatchStatePayload | null = null;
  lobby: { code: string; side: number; token: string } | null = null;
  presence: boolean[] = [];
  errors: string[] = [];
  closed = false;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on("message", (data) => {
      const msg = JSON.parse(String(data)) as ServerMessage;
      if (msg.t === "created" || msg.t === "joined") this.lobby = { code: msg.code, side: msg.side, token: msg.token };
      if (msg.t === "state") {
        this.states.push(msg.state);
        this.latest = msg.state;
        if (msg.error) this.errors.push(msg.error);
      }
      if (msg.t === "presence") this.presence.push(msg.opponentConnected);
      if (msg.t === "error") this.errors.push(msg.message);
    });
    this.ws.on("close", () => (this.closed = true));
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

const until = async (pred: () => boolean, label: string, timeoutMs = 10_000) => {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout waiting for ${label}`);
    await new Promise((r) => setTimeout(r, 5));
  }
};

/** A quiet 300ms: no new frame arrived — the bot is done for now. */
const settle = async (c: TestClient) => {
  for (;;) {
    const n = c.states.length;
    await new Promise((r) => setTimeout(r, 300));
    if (c.states.length === n) return;
  }
};

describe("frame streaming (#78) and stale acts (#75)", () => {
  it("a solo room streams the bot's prepare phase one frame per move, epochs strictly increasing", { timeout: 20_000 }, async () => {
    const srv = await startServer({});
    const a = new TestClient(srv.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" }, bot: true, botLevel: "easy" });
    await until(() => a.latest !== null, "first frame");
    await settle(a);
    // The bot lays ≥4 prepared spells + done: at least that many distinct frames.
    const epochs = a.states.map((s) => s.epoch);
    const distinct = [...new Set(epochs)];
    expect(distinct.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < epochs.length; i++) expect(epochs[i]!).toBeGreaterThanOrEqual(epochs[i - 1]!);
    // Each streamed frame carries only its own move's events (opponent prepares show as
    // redacted spellPrepared events, one per frame).
    const prepFrames = a.states.filter((s) => s.events.some((e) => e.type === "spellPrepared" && e.player === 1));
    expect(prepFrames.length).toBeGreaterThanOrEqual(3);
    for (const f of prepFrames) expect(f.events.filter((e) => e.type === "spellPrepared").length).toBe(1);
    a.close();
    await srv.shutdown();
  });

  it("an act with a stale epoch is ignored and answered with the current frame", { timeout: 20_000 }, async () => {
    const srv = await startServer({});
    const a = new TestClient(srv.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" }, bot: true, botLevel: "easy" });
    await until(() => a.latest !== null, "first frame");
    await settle(a);
    const before = a.latest!;
    expect(before.yourTurn).toBe(true);
    const prepare = before.legal.find((x) => x.type === "prepareSpell");
    expect(prepare).toBeTruthy();
    const n = a.states.length;
    a.send({ t: "act", indices: [prepare!.index], epoch: before.epoch - 1 });
    await until(() => a.states.length > n, "resync frame");
    const resync = a.latest!;
    expect(resync.epoch).toBe(before.epoch);
    expect(resync.view.self.prepared.length).toBe(before.view.self.prepared.length);
    expect(a.errors).toEqual([]);
    // The same click with the right epoch applies.
    const m = a.states.length;
    a.send({ t: "act", indices: [prepare!.index], epoch: before.epoch });
    await until(() => a.states.length > m, "applied frame");
    expect(a.latest!.epoch).toBe(before.epoch + 1);
    expect(a.latest!.view.self.prepared.length).toBe(before.view.self.prepared.length + 1);
    a.close();
    await srv.shutdown();
  });
});

describe("clock grace (#77)", () => {
  it("advertised deadlines run out clockGraceMs before the server timer", { timeout: 20_000 }, async () => {
    const srv = await startServer({ turnMs: 4000, reactionMs: 4000, clockGraceMs: 500 });
    const a = new TestClient(srv.url);
    const b = new TestClient(srv.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" } });
    await until(() => a.lobby !== null, "room created");
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, deck: { preset: "Crucible" } });
    await until(() => a.latest?.clock != null && b.latest?.clock != null, "clocks on both frames");
    const remaining = a.latest!.clock!.self! - a.latest!.clock!.now;
    expect(remaining).toBeGreaterThan(3400);
    expect(remaining).toBeLessThanOrEqual(3500);
    a.close();
    b.close();
    await srv.shutdown();
  });
});

describe("heartbeat (#74)", () => {
  it("a socket that stops answering pings is terminated and its seat goes absent", { timeout: 20_000 }, async () => {
    const srv = await startServer({ heartbeatMs: 60, disconnectGraceMs: 60_000 });
    const a = new TestClient(srv.url);
    const b = new TestClient(srv.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" } });
    await until(() => a.lobby !== null, "room created");
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, deck: { preset: "Crucible" } });
    await until(() => a.latest !== null && b.latest !== null, "both seated");
    await until(() => a.presence.includes(true), "creator told the opponent is present");
    // Freeze B's socket: it can neither read the server's ping nor answer it — the
    // same as a link that died without a FIN. B's tab never fires close on its own.
    (b.ws as unknown as { _socket: { pause: () => void } })._socket.pause();
    await until(() => a.presence[a.presence.length - 1] === false, "creator sees the opponent drop", 3000);
    a.close();
    b.ws.terminate();
    await srv.shutdown();
  });
});

describe("rules hash (#76)", () => {
  it("a live match replays under the same rules and is abandoned under different ones", { timeout: 30_000 }, async () => {
    const dbFile = join(tmp, "rules.db");
    // 1. Play the opening of a solo match under rules "A".
    const one = await startServer({ dbFile, rulesHash: "A" });
    const a = new TestClient(one.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" }, bot: true, botLevel: "easy" });
    await until(() => a.latest !== null, "first frame");
    await settle(a);
    const code = a.lobby!.code;
    a.close();
    await one.shutdown();
    // 2. Same rules: the row is live and rehydrates.
    const two = await startServer({ dbFile, rulesHash: "A" });
    expect(two.db.liveMatches().length).toBe(1);
    expect(two.db.liveMatches()[0]!.rules_hash).toBe("A");
    expect(two.db.liveMatches()[0]!.code).toBe(code);
    await two.shutdown();
    // 3. Different rules: the row is closed out as abandoned (rulesChanged) and never replayed.
    const three = await startServer({ dbFile, rulesHash: "B" });
    expect(three.db.liveMatches().length).toBe(0);
    const row = three.db.matchById(1)!;
    expect(JSON.parse(row.result!)).toMatchObject({ endReason: "abandoned", rulesChanged: true });
    await three.shutdown();
  });
});
