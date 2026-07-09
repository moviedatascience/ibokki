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

import type { GameEvent, GameState, PlayerId } from "./types.ts";
import { endGame } from "./state-ops.ts";

/** True once the match has ended. */
export function isTerminal(state: GameState): boolean {
  return state.phase === "gameover";
}

/**
 * End a match out-of-band with a "forfeit" outcome and an explicit winner (or null for a
 * mutual-abandonment draw). MATCH-layer, not a rule: never part of the deterministic action
 * log, so a {seed, actions} replay of the game itself is unaffected. Pure like `apply`:
 * clones, never mutates the input. A no-op on an already-finished game.
 */
export function abandon(state: GameState, winner: PlayerId | null): { state: GameState; events: GameEvent[] } {
  const next = structuredClone(state);
  const events: GameEvent[] = [];
  endGame(next, winner, "forfeit", events);
  return { state: next, events };
}

/** The common case: `loser` conceded/disconnected/timed out, so the other player wins. */
export function concede(state: GameState, loser: PlayerId): { state: GameState; events: GameEvent[] } {
  return abandon(state, (loser ^ 1) as PlayerId);
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
