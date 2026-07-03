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
import { createOnlineServer } from "../src/app.ts";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

const { http: server } = createOnlineServer({ dbFile: ":memory:" });
let wsUrl = "";

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
});
