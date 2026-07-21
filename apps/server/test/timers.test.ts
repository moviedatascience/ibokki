/**
 * Turn clocks (G6): per-seat window budgets pushed with every frame; a timeout
 * forces the canonical pass line; the third timeout forfeits. Solo bot rooms
 * run no clocks. Uses tiny budgets so the whole escalation plays out in ~2s.
 */
import { describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import WebSocket from "ws";
import { createOnlineServer, type ServerOptions } from "../src/app.ts";
import type { MatchStatePayload, ServerMessage } from "@ibokki/protocol";

async function startServer(opts: ServerOptions): Promise<{ url: string; shutdown: () => Promise<void> }> {
  const { http, shutdown } = createOnlineServer({ dbFile: ":memory:", msgBurst: 1e9, msgRefillPerSec: 1e9, ...opts });
  await new Promise<void>((res) => http.listen(0, res));
  return { url: `ws://127.0.0.1:${(http.address() as AddressInfo).port}/ws`, shutdown };
}

class TestClient {
  ws: WebSocket;
  latest: MatchStatePayload | null = null;
  lobby: { code: string; side: number; token: string } | null = null;
  errors: string[] = [];

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on("message", (data) => {
      const msg = JSON.parse(String(data)) as ServerMessage;
      if (msg.t === "created" || msg.t === "joined") this.lobby = { code: msg.code, side: msg.side, token: msg.token };
      if (msg.t === "state") this.latest = msg.state;
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

const until = async (pred: () => boolean, label: string, timeoutMs = 10_000) => {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout waiting for ${label}`);
    await new Promise((r) => setTimeout(r, 5));
  }
};

describe("turn clocks", () => {
  it("frames carry deadlines; timeouts auto-pass and the third forfeits", { timeout: 30_000 }, async () => {
    const srv = await startServer({ turnMs: 250, reactionMs: 200 });
    const a = new TestClient(srv.url);
    const b = new TestClient(srv.url);
    await a.open();
    a.send({ t: "create", deck: { preset: "Emberworks" } });
    await until(() => a.lobby !== null, "room created");
    await b.open();
    b.send({ t: "join", code: a.lobby!.code, deck: { preset: "Bastion" } });
    await until(() => a.latest !== null && b.latest !== null, "both seated with frames");

    // Prepare is simultaneous: both viewers see their own clock running.
    expect(a.latest!.clock, "clock must ride every PvP frame").toBeTruthy();
    expect(a.latest!.clock!.self).not.toBeNull();
    expect(b.latest!.clock!.self).not.toBeNull();
    expect(a.latest!.clock!.now).toBeGreaterThan(0);

    // Touch nothing: timeouts force prepare-done, then pass turns, then forfeit at 3 strikes.
    await until(() => !!a.latest?.gameOver && !!b.latest?.gameOver, "timeout escalation to game over", 20_000);
    expect(a.latest!.endReason).toBe("forfeit");
    expect(a.latest!.forfeit?.cause).toBe("idle");
    const log = a.latest!.log.join("\n");
    expect(log).toContain("out of time (1/3");
    expect(log).toContain("out of time (2/3");
    // The winner is whoever wasn't third to strike out — viewer-relative consistency:
    if (a.latest!.winner === null) expect(b.latest!.winner).toBeNull();
    else expect(a.latest!.winner! ^ b.latest!.winner!).toBe(1);
    expect(a.errors).toEqual([]);
    expect(b.errors).toEqual([]);
    a.close();
    b.close();

    // Solo bot rooms run no clocks — a learning game is never lost to a timer.
    const c = new TestClient(srv.url);
    await c.open();
    c.send({ t: "create", deck: { preset: "Riptide" }, bot: true });
    await until(() => c.latest !== null, "bot room first frame");
    expect(c.latest!.clock).toBeUndefined();
    c.close();
    await srv.shutdown();
  });
});
