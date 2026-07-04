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
  presetDeck,
  redact,
  validateDeck,
  type Action,
  type DeckDefinition,
  type DeckList,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";
import { describeAction, describeEvent, HeuristicBot, renderDecision, type Agent } from "@ibokki/sim";

export type School = "Evocation" | "Abjuration" | "Divination";
export type Controls = "0" | "1" | "both";

export interface Match {
  id: string;
  state: GameState;
  /** Display labels per side: deck name if a deck was given, else the school. */
  labels: [string, string];
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
  return match.labels;
}

/**
 * Resolve a side's deck: no spec = the school's archetype preset; a preset name
 * ("Emberworks"/"Bastion"/"Riptide") = that preset; otherwise a JSON
 * DeckDefinition {name?, spellbook, resourceDeck} validated against the real
 * construction rules. Throws with a readable message on a bad spec.
 */
export function resolveDeck(school: School, spec?: string): { deck: DeckList; label: string } {
  if (!spec) return { deck: deckFor(school), label: school };
  const preset = presetDeck(spec);
  if (preset) return { deck: preset, label: preset.name };
  let parsed: unknown;
  try {
    parsed = JSON.parse(spec);
  } catch {
    throw new Error(`deck "${spec}" is neither a preset name nor valid JSON. Presets: Emberworks, Bastion, Riptide.`);
  }
  const p = parsed as Partial<DeckDefinition>;
  if (!Array.isArray(p.spellbook) || !Array.isArray(p.resourceDeck)) {
    throw new Error(`custom deck JSON must have "spellbook" and "resourceDeck" arrays of card ids.`);
  }
  const def: DeckDefinition = { name: p.name ?? "Custom", spellbook: p.spellbook, resourceDeck: p.resourceDeck };
  const v = validateDeck(def);
  if (!v.ok) throw new Error(`deck "${def.name}" violates deck rules: ${v.errors.map((e) => e.message).join("; ")}`);
  return { deck: def, label: def.name };
}

export function createMatch(
  school1: School,
  school2: School,
  seed: number,
  controls: Controls,
  deck1?: string,
  deck2?: string,
): Match {
  const d0 = resolveDeck(school1, deck1);
  const d1 = resolveDeck(school2, deck2);
  const state = createGame({ seed, players: [d0.deck, d1.deck] });
  const id = `m${++counter}`;
  const match: Match = {
    id,
    state,
    labels: [d0.label, d1.label],
    controls,
    seed,
    bot: new HeuristicBot((seed ^ 0x5bd1e995) | 0),
    transcript: [`# Playtest ${id}: ${d0.label} (P0) vs ${d1.label} (P1) — seed ${seed}`],
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
  const safe = (s: string) => s.replace(/[^\w-]+/g, "_");
  const path = resolve(dir, `${new Date().toISOString().slice(0, 10)}-${match.id}-${safe(match.labels[0])}-vs-${safe(match.labels[1])}.md`);
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
