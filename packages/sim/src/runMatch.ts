/** Headless match runner: pit two agents against each other to completion. */
import {
  apply,
  createGame,
  isTerminal,
  legalActions,
  outcomeHash,
  redact,
  type EndReason,
  type GameEvent,
  type GameState,
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
  /** Tap the engine's event stream (telemetry); called after every applied action. */
  onEvents?: (events: GameEvent[], state: GameState) => void;
}

export function runMatch(cfg: RunMatchConfig): MatchResult {
  let state = createGame({
    seed: cfg.seed,
    ...(cfg.startingHp !== undefined ? { startingHp: cfg.startingHp } : {}),
    players: cfg.decks,
  });

  // Livelock guard: the engine's TURN_CAP only counts turn STARTS, so an agent
  // oscillating inside one turn (cast→retract, attach→detach) would otherwise
  // hang the whole batch — and a total-ply cap is useless for SLOW agents (a
  // search bot at seconds/ply would take days to reach it). Detect the actual
  // pathology instead: a legitimate turn is at most a few dozen plies (attach
  // cap 2/spell, ≤7 prepared slots, bounded choices); 400 within one turn is
  // impossible without a loop. The prepare phase parks turnCount too, but both
  // players placing every slot stays far under the bound.
  const TURN_PLY_CAP = 400;
  let lastTurnCount = -1;
  let pliesThisTurn = 0;
  while (!isTerminal(state)) {
    if (state.turnCount !== lastTurnCount) {
      lastTurnCount = state.turnCount;
      pliesThisTurn = 0;
    }
    if (++pliesThisTurn > TURN_PLY_CAP) {
      throw new Error(`${TURN_PLY_CAP}+ plies within turn ${state.turnCount} (seed ${cfg.seed}) — an agent is oscillating without advancing the game`);
    }
    const actor = state.priorityPlayer;
    const legal = legalActions(state, actor);
    if (legal.length === 0) {
      throw new Error(`No legal actions for priority player ${actor} (engine invariant violated)`);
    }
    const view = redact(state, actor);
    const action = cfg.agents[actor].chooseAction(view, legal, state);
    const applied = apply(state, action, actor);
    state = applied.state;
    cfg.onEvents?.(applied.events, state);
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
