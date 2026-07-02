/** Headless match runner: pit two agents against each other to completion. */
import {
  apply,
  createGame,
  isTerminal,
  legalActions,
  outcomeHash,
  redact,
  type EndReason,
  type PlayerConfig,
  type PlayerId,
} from "@ibokki/engine";
import type { Agent } from "./agent.ts";

export interface MatchResult {
  winner: PlayerId | null;
  endReason: EndReason | null;
  rounds: number;
  turns: number;
  finalHp: [number, number];
  hash: string;
}

export interface RunMatchConfig {
  seed: number;
  decks: [PlayerConfig, PlayerConfig];
  agents: [Agent, Agent];
  startingHp?: number;
}

export function runMatch(cfg: RunMatchConfig): MatchResult {
  let state = createGame({
    seed: cfg.seed,
    ...(cfg.startingHp !== undefined ? { startingHp: cfg.startingHp } : {}),
    players: cfg.decks,
  });

  while (!isTerminal(state)) {
    const actor = state.priorityPlayer;
    const legal = legalActions(state, actor);
    if (legal.length === 0) {
      throw new Error(`No legal actions for priority player ${actor} (engine invariant violated)`);
    }
    const view = redact(state, actor);
    const action = cfg.agents[actor].chooseAction(view, legal);
    state = apply(state, action).state;
  }

  return {
    winner: state.winner,
    endReason: state.endReason,
    rounds: state.round,
    turns: state.turnCount,
    finalHp: [state.players[0].hp, state.players[1].hp],
    hash: outcomeHash(state),
  };
}
