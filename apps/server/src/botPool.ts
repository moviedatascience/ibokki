/**
 * One long-lived worker thread for solo-bot move computation, so hard-bot
 * searches (~0.5s) never stall the event loop that serves every room. Degrades
 * gracefully: if the worker can't start or dies, requests compute inline on the
 * main thread (the pre-worker behavior) — callers never notice beyond latency.
 */
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import type { Action, GameState } from "@ibokki/engine";
import { computeBotAction, type BotLevel } from "./bots.ts";

interface BotReply {
  id: number;
  action?: Action | null;
  error?: string;
}

export class BotPool {
  private worker: Worker | null = null;
  private broken = false;
  private nextId = 1;
  private pending = new Map<number, { resolve: (a: Action | null) => void; reject: (err: Error) => void }>();

  /** Compute one bot decision for seat 1; null = no legal action. Never rejects. */
  async compute(level: BotLevel, seed: number, state: GameState): Promise<Action | null> {
    const worker = this.ensure();
    if (worker) {
      try {
        return await this.viaWorker(worker, level, seed, state);
      } catch {
        // fall through to inline — this request still gets answered
      }
    }
    return computeBotAction(level, seed, state);
  }

  dispose(): void {
    this.broken = true;
    this.fail(new Error("bot pool disposed"));
    void this.worker?.terminate();
    this.worker = null;
  }

  private ensure(): Worker | null {
    if (this.broken) return null;
    if (this.worker) return this.worker;
    try {
      // tsx's loader does NOT flow into nested workers, so the entry is a plain
      // .mjs shim that registers tsx inside the worker and imports the TS module
      // (this whole repo runs on tsx, including the production image).
      const worker = new Worker(fileURLToPath(new URL("./botWorker.boot.mjs", import.meta.url)));
      worker.unref(); // never keep the process alive on the bot's account
      worker.on("message", (msg: BotReply) => {
        const req = this.pending.get(msg.id);
        if (!req) return;
        this.pending.delete(msg.id);
        if (msg.error) req.reject(new Error(msg.error));
        else req.resolve(msg.action ?? null);
      });
      worker.on("error", (err) => {
        console.error("bot worker crashed — falling back to inline bot compute:", err);
        this.worker = null;
        this.broken = true; // don't respawn-loop a worker that can't boot
        this.fail(err instanceof Error ? err : new Error(String(err)));
      });
      worker.on("exit", () => {
        this.worker = null;
        this.fail(new Error("bot worker exited"));
      });
      this.worker = worker;
      return worker;
    } catch (err) {
      console.error("bot worker unavailable — using inline bot compute:", err);
      this.broken = true;
      return null;
    }
  }

  private viaWorker(worker: Worker, level: BotLevel, seed: number, state: GameState): Promise<Action | null> {
    const id = this.nextId++;
    return new Promise<Action | null>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ id, level, seed, state });
    });
  }

  private fail(err: Error): void {
    const waiting = [...this.pending.values()];
    this.pending.clear();
    for (const req of waiting) req.reject(err);
  }
}
