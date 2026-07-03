/** @ibokki/engine — the deterministic Ibokki rules engine. */
export * from "./types.ts";
export * from "./rng.ts";
export * from "./cost.ts";
export * from "./levels.ts";
export * from "./decks.ts";
export * from "./deckrules.ts";
export { createGame, DEFAULT_STARTING_HP, type GameConfig, type PlayerConfig } from "./game.ts";
export { apply } from "./apply.ts";
export { legalActions } from "./legal.ts";
export { TURN_CAP } from "./mechanics.ts";
export {
  redact,
  type PlayerView,
  type SelfView,
  type OpponentView,
  type PreparedView,
  type StackItemView,
} from "./redact.ts";
export {
  getEffect,
  makeContext,
  isImplemented,
  implementedIds,
  type EffectContext,
} from "./effects/index.ts";

import type { GameState, PlayerId } from "./types.ts";

/** True once the match has ended. */
export function isTerminal(state: GameState): boolean {
  return state.phase === "gameover";
}

/** A compact, stable fingerprint of an outcome — handy for determinism tests. */
export function outcomeHash(state: GameState): string {
  return [
    state.winner ?? "none",
    state.endReason ?? "none",
    state.round,
    state.turnCount,
    state.players[0].hp,
    state.players[1].hp,
  ].join("|");
}

export function winner(state: GameState): PlayerId | null {
  return state.winner;
}
