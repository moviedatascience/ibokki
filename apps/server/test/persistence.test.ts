/**
 * Match persistence: live rooms are written to SQLite (seed + seats + action log)
 * and rebuilt by deterministic replay when the server boots, so a redeploy or
 * crash no longer destroys in-flight matches. Rejoin tokens survive with them.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import { createOnlineServer, type ServerOptions } from "../src/app.ts";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

const tmp = mkdtempSync(join(tmpdir(), "ibokki-persist-"));
afterAll(() => {
  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* a failed test can leave a server (and its db handle) open — don't mask the real failure */
  }
});

/** Deterministic PRNG so a failing run is reproducible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

async function startServer(opts: ServerOptions): Promise<{ url: string; shutdown: () => Promise<void> }> {
  const { http, shutdown } = createOnlineServer({ msgBurst: 1e9, msgRefillPerSec: 1e9, ...opts });
  await new Promise<void>((res) => http.listen(0, res));
  return { url: `ws://127.0.0.1:${(http.address() as AddressInfo).port}/ws`, shutdown };
}

class TestClient {
  ws: WebSocket;
  latest: MatchStatePayload | null = null;
  states: MatchStatePayload[] = [];
  lobby: { code: string; side: number; token: string } | null = null;
  errors: string[] = [];

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
      if (msg.t === "error") this.errors.push(msg.message);
    });
  }

  open(): Promise<void> {
    // The socket starts connecting at construction — it may already BE open by the
    // time the test awaits it, and a stale once("open") listener would hang forever.
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
    await new Promise((r) => setTimeout(r, 2));
  }
};

/** Drive random legal actions across the given clients until `stop` (or game over). */
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

describe("match persistence across restarts", () => {
  it("a PvP match survives a server restart and resumes via rejoin tokens", { timeout: 60_000 }, async () => {
    const dbFile = join(tmp, "pvp.db");
    const rand = lcg(99);
    const srvA = await startServer({ dbFile });

    const a = new TestClient(srvA.url);
    const b = new TestClient(srvA.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" } });
    await until(() => a.lobby !== null, "room created");
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, deck: { preset: "Bastion" } });
    await until(() => a.latest !== null && b.latest !== null, "both seated with frames");

    // Play a meaningful chunk of the match, then stop mid-game.
    let acted = 0;
    await playRandom([a, b], rand, () => ++acted > 30);
    expect(a.latest!.gameOver).toBe(false);
    const snapshot = {
      round: a.latest!.view.round,
      selfHp: a.latest!.view.self.hp,
      oppHp: a.latest!.view.opponent.hp,
      log: a.latest!.log.length,
    };
    const code = a.lobby!.code;
    const tokens = [a.lobby!.token, b.lobby!.token];
    a.close();
    b.close();
    await srvA.shutdown();

    // Boot a fresh server on the same database: the room must be back. (Short grace so
    // the wind-down below resolves the match by forfeit instead of a full playout.)
    const srvB = await startServer({ dbFile, disconnectGraceMs: 250 });
    const a2 = new TestClient(srvB.url);
    const b2 = new TestClient(srvB.url);
    await a2.open();
    a2.send({ t: "rejoin", code, token: tokens[0] });
    await until(() => a2.latest !== null, "A resumed with a frame");
    await b2.open();
    b2.send({ t: "rejoin", code, token: tokens[1] });
    await until(() => b2.latest !== null, "B resumed with a frame");
    expect(a2.errors).toEqual([]);
    expect(b2.errors).toEqual([]);

    // Deterministic replay: the restored game is exactly where it stopped, and the
    // rebuilt transcript matches the original line count (plus the restored marker).
    expect(a2.latest!.view.round).toBe(snapshot.round);
    expect(a2.latest!.view.self.hp).toBe(snapshot.selfHp);
    expect(a2.latest!.view.opponent.hp).toBe(snapshot.oppHp);
    expect(a2.latest!.log.length).toBe(snapshot.log + 1);
    expect(a2.latest!.log.at(-1)).toContain("restored");

    // And it is live: keep playing on the new process without a single rejected intent.
    let more = 0;
    await playRandom([a2, b2], rand, () => ++more > 20);
    expect(a2.errors).toEqual([]);
    expect(b2.errors).toEqual([]);

    // Wind down: both tabs leave; the 250ms disconnect grace resolves the match
    // (forfeit or abandon), which must land in the row as a result.
    a2.close();
    b2.close();
    await new Promise((r) => setTimeout(r, 900));
    await srvB.shutdown();

    // A finished match must NOT come back on the next boot.
    const srvC = await startServer({ dbFile });
    const a3 = new TestClient(srvC.url);
    await a3.open();
    a3.send({ t: "rejoin", code, token: tokens[0] });
    await until(() => a3.errors.length > 0, "rejoin of a finished match rejected");
    expect(a3.errors[0]).toContain("no seat matches");
    a3.close();
    await srvC.shutdown();
  });

  it("a solo bot room survives a restart and stays playable", { timeout: 60_000 }, async () => {
    const dbFile = join(tmp, "bot.db");
    const rand = lcg(7);
    const srvA = await startServer({ dbFile });

    const a = new TestClient(srvA.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Riptide" }, bot: true });
    await until(() => a.latest !== null, "bot room created + first frame");
    let acted = 0;
    await playRandom([a], rand, () => ++acted > 10);
    expect(a.latest!.gameOver).toBe(false);
    const round = a.latest!.view.round;
    const code = a.lobby!.code;
    const token = a.lobby!.token;
    a.close();
    await srvA.shutdown();

    const srvB = await startServer({ dbFile });
    const a2 = new TestClient(srvB.url);
    await a2.open();
    a2.send({ t: "rejoin", code, token });
    await until(() => a2.latest !== null, "resumed with a frame");
    expect(a2.errors).toEqual([]);
    expect(a2.latest!.view.round).toBe(round);
    expect(a2.latest!.bots).toEqual([1]);

    // The restored bot keeps playing: make a few moves without errors.
    acted = 0;
    await playRandom([a2], rand, () => ++acted > 5);
    expect(a2.errors).toEqual([]);
    a2.close();
    await srvB.shutdown();
  });
});
