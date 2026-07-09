/**
 * M5 acceptance: two WebSocket clients play a full authoritative network match.
 *
 * Drives the real server (createOnlineServer on an ephemeral port) with two raw
 * ws clients playing uniformly random legal actions until the game terminates.
 * Every frame each client receives is checked for hidden-information leaks:
 * the opponent's hand, face-down prepared spells, private choice candidates,
 * and the defIds inside prepare/replace/chose events must never appear.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import WebSocket from "ws";
import { createOnlineServer, type ServerOptions } from "../src/app.ts";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

// The random-drive tests act as fast as the event loop allows (hundreds of msg/s),
// far faster than any real client, so the shared server runs its message rate limit
// effectively off; the dedicated rate-limit test below uses a low limit instead.
const { http: server } = createOnlineServer({ dbFile: ":memory:", msgBurst: 1e9, msgRefillPerSec: 1e9 });
let wsUrl = "";

/** Spin up an isolated server (its own rooms map) so timer-based tests can use short
 *  grace/inactivity windows without touching the shared server above. */
async function startServer(opts: ServerOptions): Promise<{ url: string; shutdown: () => Promise<void> }> {
  const { http, shutdown } = createOnlineServer({ dbFile: ":memory:", ...opts });
  await new Promise<void>((res) => http.listen(0, res));
  return { url: `ws://127.0.0.1:${(http.address() as AddressInfo).port}/ws`, shutdown };
}

beforeAll(async () => {
  await new Promise<void>((res) => server.listen(0, res));
  wsUrl = `ws://127.0.0.1:${(server.address() as AddressInfo).port}/ws`;
});

afterAll(async () => {
  await new Promise((res) => server.close(res));
});

/** Deterministic PRNG so a failing run is reproducible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Thin test client: records every message, exposes promise-based waiting. */
class TestClient {
  ws: WebSocket;
  messages: ServerMessage[] = [];
  states: MatchStatePayload[] = [];
  latest: MatchStatePayload | null = null;
  lobby: { code: string; side: number; token: string } | null = null;
  errors: string[] = [];
  private waiters: (() => void)[] = [];

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on("message", (data) => {
      const msg = JSON.parse(String(data)) as ServerMessage;
      this.messages.push(msg);
      if (msg.t === "created" || msg.t === "joined") this.lobby = { code: msg.code, side: msg.side, token: msg.token };
      if (msg.t === "state") {
        this.states.push(msg.state);
        this.latest = msg.state;
        if (msg.error) this.errors.push(msg.error);
      }
      if (msg.t === "error") this.errors.push(msg.message);
      for (const w of this.waiters.splice(0)) w();
    });
  }

  open(): Promise<void> {
    return new Promise((res, rej) => {
      this.ws.once("open", res);
      this.ws.once("error", rej);
    });
  }

  send(msg: object): void {
    this.ws.send(JSON.stringify(msg));
  }

  /** Resolve once `pred()` is true (checked after every incoming message). */
  waitFor(pred: () => boolean, label: string, timeoutMs = 5000): Promise<void> {
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error(`timeout waiting for ${label}`)), timeoutMs);
      const check = () => {
        if (pred()) {
          clearTimeout(timer);
          res();
        } else {
          this.waiters.push(check);
        }
      };
      check();
    });
  }

  close(): void {
    this.ws.close();
  }
}

/** Assert one received frame leaks nothing the viewer may not see. */
function assertNoLeaks(state: MatchStatePayload): void {
  const opp = state.view.opponent as unknown as Record<string, unknown>;
  expect(opp.hand, "opponent hand must never be sent").toBeUndefined();
  expect(opp.spellbook, "opponent spellbook must never be sent").toBeUndefined();
  for (const prep of state.view.opponent.prepared) {
    if (prep.faceDown && !prep.cast) {
      expect(prep.spellDefId, "opponent face-down prepared spell must be hidden").toBeNull();
    }
  }
  const choice = state.view.pendingChoice;
  if (choice && !choice.mine) {
    expect(choice.candidates, "opponent's private choice candidates must be empty").toEqual([]);
  }
  for (const e of state.events) {
    if ((e.player as number) !== 1) continue; // relative: 1 = the opponent
    if (e.type === "spellPrepared") expect(e.spellDefId, "opponent prepare event must not name the spell").toBeNull();
    if (e.type === "spellReplaced") {
      expect(e.outDefId).toBeNull();
      expect(e.inDefId).toBeNull();
    }
    if (e.type === "chose") expect(e.defId, "opponent chose event must not name the card").toBeNull();
  }
}

describe("online server", () => {
  it("two clients play a full random match to termination without leaks", { timeout: 120_000 }, async () => {
    const rand = lcg(12345);
    const a = new TestClient(wsUrl);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    expect(a.lobby!.side).toBe(0);
    expect(a.lobby!.code).toMatch(/^[A-Z2-9]{5}$/);

    const b = new TestClient(wsUrl);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Abjuration" });
    await b.waitFor(() => b.latest !== null, "joined + first frame");
    await a.waitFor(() => a.latest !== null, "creator got first frame");
    expect(b.lobby!.side).toBe(1);

    // Both viewers see themselves as "you" (relative ids) with their own deck label
    // first (legacy `school` fields resolve to that school's archetype preset).
    expect(a.latest!.schools).toEqual(["Emberworks", "Bastion"]);
    expect(b.latest!.schools).toEqual(["Bastion", "Emberworks"]);

    // Poll-based drive loop (a waitFor race would leave dangling timeout rejections).
    const until = async (pred: () => boolean, label: string, timeoutMs = 10_000) => {
      const t0 = Date.now();
      while (!pred()) {
        if (Date.now() - t0 > timeoutMs) throw new Error(`timeout waiting for ${label}`);
        await new Promise((r) => setTimeout(r, 2));
      }
    };
    const clients = [a, b];
    let actions = 0;
    while (actions < 20_000) {
      if (a.latest!.gameOver && b.latest!.gameOver) break;
      await until(
        () => clients.some((c) => c.latest!.yourTurn) || (a.latest!.gameOver && b.latest!.gameOver),
        "a turn or game over",
      );
      const actor = clients.find((c) => c.latest!.yourTurn);
      if (!actor) continue;
      const legal = actor.latest!.legal;
      expect(legal.length, "a player on turn must have legal actions").toBeGreaterThan(0);
      const idx = Math.floor(rand() * legal.length);
      const before = actor.states.length;
      actor.send({ t: "act", indices: [idx] });
      await until(() => actor.states.length > before, "state frame after acting");
      actions++;
    }

    expect(a.latest!.gameOver).toBe(true);
    expect(b.latest!.gameOver).toBe(true);
    expect(a.errors).toEqual([]);
    expect(b.errors).toEqual([]);
    // Winner is viewer-relative and consistent: if A sees 0 ("you"), B sees 1.
    if (a.latest!.winner === null) {
      expect(b.latest!.winner).toBeNull();
    } else {
      expect(a.latest!.winner! ^ b.latest!.winner!).toBe(1);
    }

    for (const c of clients) for (const s of c.states) assertNoLeaks(s);

    a.close();
    b.close();
  });

  it("a solo bot room plays a full match to termination and rematches", { timeout: 120_000 }, async () => {
    const rand = lcg(4242);
    const a = new TestClient(wsUrl);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" }, bot: true });
    await a.waitFor(() => a.latest !== null, "bot room created + first frame");
    expect(a.lobby!.side).toBe(0);
    // The bot occupies the relative-opponent seat and is announced as present.
    expect(a.latest!.bots).toEqual([1]);
    expect(a.messages.some((m) => m.t === "presence" && m.opponentConnected)).toBe(true);
    // Joining a bot room must fail — the seat is taken.
    const b = new TestClient(wsUrl);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Abjuration" });
    await b.waitFor(() => b.errors.length > 0, "join rejected");
    expect(b.errors[0]).toContain("full");
    b.close();

    const until = async (pred: () => boolean, label: string, timeoutMs = 10_000) => {
      const t0 = Date.now();
      while (!pred()) {
        if (Date.now() - t0 > timeoutMs) throw new Error(`timeout waiting for ${label}`);
        await new Promise((r) => setTimeout(r, 2));
      }
    };
    let actions = 0;
    while (actions < 20_000 && !a.latest!.gameOver) {
      await until(() => a.latest!.yourTurn || a.latest!.gameOver, "our turn or game over");
      if (a.latest!.gameOver) break;
      const legal = a.latest!.legal;
      expect(legal.length, "human on turn must have legal actions").toBeGreaterThan(0);
      const idx = Math.floor(rand() * legal.length);
      const before = a.states.length;
      a.send({ t: "act", indices: [idx] });
      await until(() => a.states.length > before, "state frame after acting");
      actions++;
    }
    expect(a.latest!.gameOver).toBe(true);
    expect(a.errors).toEqual([]);
    for (const s of a.states) assertNoLeaks(s);

    // Rematch: the bot auto-accepts, so one vote restarts the room.
    const epochBefore = a.latest!.epoch;
    a.send({ t: "rematch" });
    await until(() => a.latest!.epoch > epochBefore && !a.latest!.gameOver, "rematch started");
    a.close();
  });

  it("a dropped client rejoins with its token and resumes the match", async () => {
    const a = new TestClient(wsUrl);
    await a.open();
    a.send({ t: "create", school: "Divination" });
    await a.waitFor(() => a.lobby !== null, "room created");

    const b = new TestClient(wsUrl);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Evocation" });
    await b.waitFor(() => b.latest !== null, "first frame");
    const lobby = b.lobby!;
    const epochBefore = b.latest!.epoch;

    // Drop B; A should see presence=false.
    b.close();
    await a.waitFor(
      () => a.messages.some((m) => m.t === "presence" && !m.opponentConnected),
      "presence lost",
    );

    // Rejoin with the token; B gets its redacted snapshot back, A sees presence=true.
    const b2 = new TestClient(wsUrl);
    await b2.open();
    b2.send({ t: "rejoin", code: lobby.code, token: lobby.token });
    await b2.waitFor(() => b2.latest !== null, "snapshot after rejoin");
    expect(b2.lobby!.side).toBe(1);
    expect(b2.latest!.epoch).toBe(epochBefore);
    assertNoLeaks(b2.latest!);
    await a.waitFor(
      () => a.messages.some((m) => m.t === "presence" && m.opponentConnected),
      "presence back",
    );

    // A stale/foreign token must not seat anyone.
    const evil = new TestClient(wsUrl);
    await evil.open();
    evil.send({ t: "rejoin", code: lobby.code, token: "not-a-real-token" });
    await evil.waitFor(() => evil.errors.length > 0, "rejected rejoin");
    expect(evil.errors[0]).toContain("no seat");

    a.close();
    b2.close();
    evil.close();
  });

  it("rejects a second create/join on an already-seated connection", async () => {
    const a = new TestClient(wsUrl);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    // A second create on the same socket must be refused (else one connection could
    // spray orphan rooms).
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.errors.some((e) => e.includes("already in a room")), "second create rejected");
    a.close();
  });

  it("rate-limits a message flood on one connection", async () => {
    const s = await startServer({ msgBurst: 20, msgRefillPerSec: 5 });
    const a = new TestClient(s.url);
    await a.open();
    // Far exceed the burst in one tick with cheap unseated messages.
    for (let i = 0; i < 200; i++) a.send({ t: "rejoin", code: "ZZZZZ", token: "x" });
    await a.waitFor(() => a.errors.some((e) => e.includes("slow down")), "rate-limit warning", 5000);
    a.close();
    await s.shutdown();
  });
});

describe("online server — match-layer safety", () => {
  it("a dropped seat forfeits after the grace period, awarding the opponent", async () => {
    const s = await startServer({ disconnectGraceMs: 250, inactivityMs: 60_000 });
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    const b = new TestClient(s.url);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Abjuration" });
    await b.waitFor(() => b.latest !== null, "first frame");
    await a.waitFor(() => a.latest !== null, "creator frame");
    expect(a.latest!.gameOver).toBe(false);

    // Drop B; after the grace window A wins by forfeit (viewer-relative winner 0 = A).
    b.close();
    await a.waitFor(() => a.latest!.gameOver, "forfeit game over", 5000);
    expect(a.latest!.endReason).toBe("forfeit");
    expect(a.latest!.winner).toBe(0);
    a.close();
    await s.shutdown();
  });

  it("a rejoin inside the grace window cancels the forfeit", async () => {
    const s = await startServer({ disconnectGraceMs: 400, inactivityMs: 60_000 });
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    const b = new TestClient(s.url);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Abjuration" });
    await b.waitFor(() => b.latest !== null, "first frame");
    const lobby = b.lobby!;

    b.close();
    // Rejoin promptly — well inside the 400ms grace.
    const b2 = new TestClient(s.url);
    await b2.open();
    b2.send({ t: "rejoin", code: lobby.code, token: lobby.token });
    await b2.waitFor(() => b2.latest !== null, "snapshot after rejoin");
    // Wait past the original grace deadline; the match must NOT have forfeited.
    await new Promise((r) => setTimeout(r, 600));
    expect(a.latest!.gameOver).toBe(false);
    expect(b2.latest!.gameOver).toBe(false);
    a.close();
    b2.close();
    await s.shutdown();
  });

  it("both players idle in the prepare phase → the match is abandoned as a draw", async () => {
    const s = await startServer({ inactivityMs: 300, disconnectGraceMs: 60_000 });
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    const b = new TestClient(s.url);
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, school: "Abjuration" });
    await b.waitFor(() => b.latest !== null, "first frame");
    await a.waitFor(() => a.latest !== null, "creator frame");

    // Both are on the clock (simultaneous prepare) and both idle → a draw, not a one-sided
    // loss for whichever seat happens to be index 0.
    await a.waitFor(() => a.latest!.gameOver, "abandon game over", 5000);
    expect(a.latest!.endReason).toBe("forfeit");
    expect(a.latest!.winner).toBeNull();
    await b.waitFor(() => b.latest!.gameOver, "b sees game over", 5000);
    expect(b.latest!.winner).toBeNull();
    a.close();
    b.close();
    await s.shutdown();
  });

  it("a lone idle player forfeits to a present opponent (bot room)", async () => {
    const s = await startServer({ inactivityMs: 300 });
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" }, bot: true });
    await a.waitFor(() => a.latest !== null, "bot room first frame");

    // Only the human is on the clock (the bot is excluded), so an idle human forfeits.
    await a.waitFor(() => a.latest!.gameOver, "inactivity forfeit", 5000);
    expect(a.latest!.endReason).toBe("forfeit");
    expect(a.latest!.winner).toBe(1); // relative: 1 = the bot opponent
    a.close();
    await s.shutdown();
  });

  it("reaps a never-joined room when its creator drops (no capacity leak)", async () => {
    const s = await startServer({ disconnectGraceMs: 200 });
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    const code = a.lobby!.code;

    // Creator drops before anyone joins; the empty room must be reaped after the grace
    // window (not left squatting until the 1h idle sweep).
    a.close();
    await new Promise((r) => setTimeout(r, 500));
    const b = new TestClient(s.url);
    await b.open();
    b.send({ t: "join", code, school: "Abjuration" });
    await b.waitFor(() => b.errors.length > 0, "join rejected");
    expect(b.errors[0]).toContain("no room");
    b.close();
    await s.shutdown();
  });

  it("graceful shutdown notifies clients and closes their sockets", async () => {
    const s = await startServer({});
    const a = new TestClient(s.url);
    await a.open();
    a.send({ t: "create", school: "Evocation" });
    await a.waitFor(() => a.lobby !== null, "room created");
    const closedP = new Promise<void>((res) => a.ws.once("close", () => res()));
    await s.shutdown();
    expect(a.messages.some((m) => m.t === "notice")).toBe(true);
    await closedP; // shutdown closes our socket; resolves well within the test timeout
  });
});
