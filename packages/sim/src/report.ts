/** Aggregate many matches into a balance report. */
import { deckFor } from "@ibokki/engine";
import type { School } from "@ibokki/cards";
import { makeAgent, type AgentKind } from "./agent.ts";
import { runMatch } from "./runMatch.ts";

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

  for (let i = 0; i < cfg.games; i++) {
    const seed = cfg.baseSeed + i;
    const result = runMatch({
      seed,
      decks: [deckFor(cfg.school1), deckFor(cfg.school2)],
      agents: [makeAgent(cfg.agent1, agentSeed(seed, 0)), makeAgent(cfg.agent2, agentSeed(seed, 1))],
      ...(cfg.startingHp !== undefined ? { startingHp: cfg.startingHp } : {}),
    });

    if (result.winner === 0) stats.p1Wins++;
    else if (result.winner === 1) stats.p2Wins++;
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
      });
      matrix[s1][s2] = stats.p1Wins / stats.games;
    }
  }
  return matrix;
}
