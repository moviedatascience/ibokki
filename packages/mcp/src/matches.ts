/**
 * In-memory match manager for the MCP server. Holds live games, accumulates a
 * readable transcript (moves + my notes), applies a chosen action, auto-plays the
 * bot side, and can save a playtest log to disk.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  apply,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  redact,
  type Action,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";
import { describeAction, describeEvent, HeuristicBot, renderDecision, type Agent } from "@ibokki/sim";

export type School = "Evocation" | "Abjuration" | "Divination";
export type Controls = "0" | "1" | "both";

export interface Match {
  id: string;
  state: GameState;
  schools: [School, School];
  controls: Controls;
  seed: number;
  bot: Agent;
  transcript: string[];
}

const matches = new Map<string, Match>();
let counter = 0;

export function claudeControls(match: Match, player: PlayerId): boolean {
  return match.controls === "both" || match.controls === String(player);
}

function labels(match: Match): [string, string] {
  return [match.schools[0], match.schools[1]];
}

export function createMatch(school1: School, school2: School, seed: number, controls: Controls): Match {
  const state = createGame({ seed, players: [deckFor(school1), deckFor(school2)] });
  const id = `m${++counter}`;
  const match: Match = {
    id,
    state,
    schools: [school1, school2],
    controls,
    seed,
    bot: new HeuristicBot((seed ^ 0x5bd1e995) | 0),
    transcript: [`# Playtest ${id}: ${school1} (P0) vs ${school2} (P1) — seed ${seed}`],
  };
  matches.set(id, match);
  return match;
}

export function getMatch(id: string): Match | undefined {
  return matches.get(id);
}

/** Apply an action, labelling it (against the pre-action state) and logging events. */
function applyLogged(match: Match, action: Action): void {
  const actor = match.state.priorityPlayer;
  const label = describeAction(match.state, action);
  const { state, events } = apply(match.state, action);
  match.state = state;
  match.transcript.push(`- P${actor}: ${label}`);
  for (const e of events) {
    const s = describeEvent(e);
    if (s) match.transcript.push(`    ${s}`);
  }
}

export function addNote(match: Match, text: string): void {
  match.transcript.push(`> **P${match.state.priorityPlayer} thinks:** ${text}`);
}

/** Advance bot-controlled decisions until it's Claude's turn or the game ends. */
export function autoPlayBots(match: Match): void {
  let guard = 0;
  while (!isTerminal(match.state) && !claudeControls(match, match.state.priorityPlayer)) {
    const actor = match.state.priorityPlayer;
    const legal = legalActions(match.state, actor);
    const action = match.bot.chooseAction(redact(match.state, actor), legal);
    applyLogged(match, action);
    if (++guard > 5000) break;
  }
}

export function renderState(match: Match): string {
  return renderDecision(match.state, labels(match));
}

/** Apply the legal action at `index` for the priority player, then auto-play bots. */
export function act(match: Match, index: number, note?: string): string {
  if (isTerminal(match.state)) return "Match is over.\n\n" + renderState(match);
  const actor = match.state.priorityPlayer;
  if (!claudeControls(match, actor)) {
    autoPlayBots(match);
    return "It was the bot's turn — advanced.\n\n" + renderState(match);
  }
  const legal = legalActions(match.state, actor);
  if (index < 0 || index >= legal.length) {
    return `Invalid index ${index}. Valid 0..${legal.length - 1}.\n\n` + renderState(match);
  }
  if (note) addNote(match, note);
  const before = match.transcript.length;
  applyLogged(match, legal[index]!);
  autoPlayBots(match);
  return match.transcript.slice(before).join("\n") + "\n\n" + renderState(match);
}

/** Write the transcript (+ optional analysis) to playtests/<id>.md; returns the path. */
export function savePlaytest(match: Match, analysis?: string): string {
  const dir = resolve(process.cwd(), "playtests");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, `${new Date().toISOString().slice(0, 10)}-${match.id}-${match.schools[0]}-vs-${match.schools[1]}.md`);
  const result = isTerminal(match.state)
    ? `**Result:** ${match.state.winner === null ? "draw" : `P${match.state.winner} wins`} (${match.state.endReason}), round ${match.state.round}.`
    : "**Result:** (in progress)";
  const body =
    match.transcript.join("\n") +
    `\n\n${result}\n` +
    (analysis ? `\n## Analysis\n\n${analysis}\n` : "");
  writeFileSync(path, body, "utf8");
  return path;
}
