/**
 * Solo-bot ladder, shared by the main thread (inline fallback) and the bot
 * worker. Medium ≈ 0.1s/move; hard is iteration- AND wall-clock-capped
 * (maxMillis trades determinism for responsiveness — the right trade in a live
 * room, where replays come from the action log, not from re-running the bot).
 */
import { legalActions, redact, type Action, type GameState } from "@ibokki/engine";
import { GreedySimBot, HeuristicBot, IsmctsBot, type Agent } from "@ibokki/sim";

export const BOT_LEVELS = ["easy", "medium", "hard"] as const;
export type BotLevel = (typeof BOT_LEVELS)[number];

export function asBotLevel(level: unknown): BotLevel {
  return BOT_LEVELS.includes(level as BotLevel) ? (level as BotLevel) : "easy";
}

export function makeBot(level: BotLevel, seed: number): Agent {
  if (level === "hard") return new IsmctsBot(seed, { iterations: 240, maxMillis: 700 });
  if (level === "medium") return new GreedySimBot(seed, { determinizations: 2 });
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
