/** Aggregate many matches into a balance report. */
import { deckFor, type GameEvent, type PlayerConfig } from "@ibokki/engine";
import type { School } from "@ibokki/cards";
import { makeAgent, type AgentKind, type GreedyOptions } from "./greedy.ts";
import type { MctsOptions } from "./mcts.ts";
import { runMatch } from "./runMatch.ts";
import type { CardStatsCollector } from "./telemetry.ts";

export type PlayableSchool = Exclude<School, "Neutral">;
export const SCHOOLS: PlayableSchool[] = ["Evocation", "Abjuration", "Divination"];

export interface MatchupStats {
  games: number;
  p1Wins: number;
  p2Wins: number;
  draws: number;
  /** end-reason -> count */
  endReasons: Record<string, number>;
  avgRounds: number;
  avgTurns: number;
}

function agentSeed(matchSeed: number, player: number): number {
  return (matchSeed ^ ((player + 1) * 0x9e3779b1)) | 0;
}

export interface MatchupConfig {
  school1: PlayableSchool;
  school2: PlayableSchool;
  agent1: AgentKind;
  agent2: AgentKind;
  games: number;
  baseSeed: number;
  startingHp?: number;
  /** Deck overrides: play this list instead of the school's archetype preset. */
  deck1?: PlayerConfig;
  deck2?: PlayerConfig;
  /** Paired seat-swap: each seed is played twice with the sides swapped, halving
   * the variance from turn-order/draw luck. `games` stays the TOTAL game count. */
  paired?: boolean;
  /** Optional per-card telemetry sink (see telemetry.ts). */
  collector?: CardStatsCollector;
  /** Options for any greedy agents (e.g. rolloutTurns for the horizon A/B). */
  greedy?: GreedyOptions;
  /** Options for any search agents (e.g. iterations for the budget sweep). */
  mcts?: MctsOptions;
}

export function runMatchup(cfg: MatchupConfig): MatchupStats {
  const stats: MatchupStats = {
    games: cfg.games,
    p1Wins: 0,
    p2Wins: 0,
    draws: 0,
    endReasons: {},
    avgRounds: 0,
    avgTurns: 0,
  };
  let totalRounds = 0;
  let totalTurns = 0;
  const side1 = { deck: cfg.deck1 ?? deckFor(cfg.school1), agent: cfg.agent1 };
  const side2 = { deck: cfg.deck2 ?? deckFor(cfg.school2), agent: cfg.agent2 };

  for (let i = 0; i < cfg.games; i++) {
    // Paired mode replays each seed with the seats swapped (game 2k+1 mirrors 2k).
    const swapped = cfg.paired === true && i % 2 === 1;
    const seed = cfg.paired ? cfg.baseSeed + Math.floor(i / 2) : cfg.baseSeed + i;
    const [a, b] = swapped ? [side2, side1] : [side1, side2];
    const result = runMatch({
      seed,
      decks: [a.deck, b.deck],
      agents: [makeAgent(a.agent, agentSeed(seed, swapped ? 1 : 0), cfg.greedy, cfg.mcts), makeAgent(b.agent, agentSeed(seed, swapped ? 0 : 1), cfg.greedy, cfg.mcts)],
      ...(cfg.startingHp !== undefined ? { startingHp: cfg.startingHp } : {}),
      ...(cfg.collector ? { onEvents: (ev: GameEvent[]) => cfg.collector!.onEvents(ev) } : {}),
    });
    // Card usage and the winner are both seat-relative, so no remap is needed here.
    cfg.collector?.endGame(result.winner);

    const side1Won = swapped ? result.winner === 1 : result.winner === 0;
    const side2Won = swapped ? result.winner === 0 : result.winner === 1;
    if (side1Won) stats.p1Wins++;
    else if (side2Won) stats.p2Wins++;
    else stats.draws++;

    const reason = result.endReason ?? "none";
    stats.endReasons[reason] = (stats.endReasons[reason] ?? 0) + 1;
    totalRounds += result.rounds;
    totalTurns += result.turns;
  }

  stats.avgRounds = totalRounds / cfg.games;
  stats.avgTurns = totalTurns / cfg.games;
  return stats;
}

/** Win rate for the full 3x3 school matrix (P1-school win % vs each P2-school). */
export function runSchoolMatrix(
  agent: AgentKind,
  games: number,
  baseSeed: number,
  startingHp?: number,
  paired?: boolean,
  greedy?: GreedyOptions,
): Record<PlayableSchool, Record<PlayableSchool, number>> {
  const matrix = {} as Record<PlayableSchool, Record<PlayableSchool, number>>;
  for (const s1 of SCHOOLS) {
    matrix[s1] = {} as Record<PlayableSchool, number>;
    for (const s2 of SCHOOLS) {
      const stats = runMatchup({
        school1: s1,
        school2: s2,
        agent1: agent,
        agent2: agent,
        games,
        baseSeed,
        ...(startingHp !== undefined ? { startingHp } : {}),
        ...(paired !== undefined ? { paired } : {}),
        ...(greedy ? { greedy } : {}),
      });
      matrix[s1][s2] = stats.p1Wins / stats.games;
    }
  }
  return matrix;
}
