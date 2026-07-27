/**
 * Worker-thread entry for solo-bot move computation (see botPool.ts). Requests
 * and replies are correlated by id; the GameState arrives structured-cloned, so
 * nothing here can touch live room state.
 */
import { parentPort } from "node:worker_threads";
import type { GameState } from "@ibokki/engine";
import { computeBotAction, type BotLevel } from "./bots.ts";

interface BotRequest {
  id: number;
  level: BotLevel;
  seed: number;
  state: GameState;
}

parentPort!.on("message", ({ id, level, seed, state }: BotRequest) => {
  try {
    parentPort!.postMessage({ id, action: computeBotAction(level, seed, state) });
  } catch (err) {
    parentPort!.postMessage({ id, error: String(err) });
  }
});
