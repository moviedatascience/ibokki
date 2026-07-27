/**
 * Solo-bot ladder, shared by the main thread (inline fallback) and the bot
 * worker. Medium ≈ 0.1s/move; hard is iteration- AND wall-clock-capped
 * (maxMillis trades determinism for responsiveness — the right trade in a live
 * room, where replays come from the action log, not from re-running the bot).
 */
import { legalActions, redact, type Action, type GameState } from "@ibokki/engine";
import { GreedySimBot, HeuristicBot, type Agent } from "@ibokki/sim";

export const BOT_LEVELS = ["easy", "medium", "hard"] as const;
export type BotLevel = (typeof BOT_LEVELS)[number];

export function asBotLevel(level: unknown): BotLevel {
  return BOT_LEVELS.includes(level as BotLevel) ? (level as BotLevel) : "easy";
}

export function makeBot(level: BotLevel, seed: number): Agent {
  // Measured ladder (2026-07-27 paired benchmarks): greedy > heuristic ≥ search
  // in race matchups and greedy >> heuristic in defensive ones, so greedy
  // anchors BOTH top rungs — medium reads one sampled world, hard reads three.
  // ISMCTS stays off the ladder until its lookahead reliably beats greedy's
  // exact one-ply (it already shows defensive promise — see mcts.ts).
  if (level === "hard") return new GreedySimBot(seed);
  if (level === "medium") return new GreedySimBot(seed, { determinizations: 1 });
  return new HeuristicBot(seed);
}

/** One bot decision for seat 1, or null when the bot has no legal action. */
export function computeBotAction(level: BotLevel, seed: number, state: GameState): Action | null {
  const legal = legalActions(state, 1);
  if (legal.length === 0) return null;
  // The true state is passed so simulation bots can sample determinized worlds
  // from it — they never read hidden zones directly.
  return makeBot(level, seed).chooseAction(redact(state, 1), legal, state);
}
