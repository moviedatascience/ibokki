/**
 * File-persisted playtest CLI. Drives a match one decision at a time, saving game
 * state to playtests/.sessions/<name>.json between invocations and appending a
 * readable markdown transcript (moves, events, and your notes) to playtests/<name>.md.
 *
 *   npm run playtest -- new mygame Evocation Abjuration 42
 *   npm run playtest -- show mygame
 *   npm run playtest -- act mygame cast-evo-002 "the slug form never suffers stale-index misplays"
 *   npm run playtest -- act mygame 3 "attaching Verbal to threaten Fireball early"
 *   npm run playtest -- auto mygame        # skip forced passes to the next real decision
 *   npm run playtest -- note mygame "they're durdling on wards; I should race"
 *   npm run playtest -- finish mygame "Evo's tempo overwhelmed a slow Abjuration opener."
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { apply, createGame, deckFor, isTerminal, legalActions, type GameState } from "@ibokki/engine";
import { describeAction, describeEvent, renderDecision, slugFor, stateLine } from "./render.ts";

type PlayableSchool = "Evocation" | "Abjuration" | "Divination";

const PT_DIR = resolve(process.cwd(), "playtests");
const SESS_DIR = resolve(PT_DIR, ".sessions");

interface Session {
  schools: [string, string];
  seed: number;
  state: GameState;
}

const sessFile = (name: string) => resolve(SESS_DIR, `${name}.json`);
const logFile = (name: string) => resolve(PT_DIR, `${name}.md`);

function loadSession(name: string): Session {
  return JSON.parse(readFileSync(sessFile(name), "utf8")) as Session;
}
function saveSession(name: string, s: Session): void {
  mkdirSync(SESS_DIR, { recursive: true });
  writeFileSync(sessFile(name), JSON.stringify(s), "utf8");
}
function appendLog(name: string, text: string): void {
  appendFileSync(logFile(name), text + "\n", "utf8");
}

function resultLine(state: GameState): string {
  return `**Result:** ${state.winner === null ? "draw" : `P${state.winner} wins`} (${state.endReason}), ` +
    `round ${state.round}. Final HP: P0 ${state.players[0].hp}, P1 ${state.players[1].hp}.`;
}

function cmdNew(rest: string[]): void {
  const [name, s0, s1, seedStr, hpStr] = rest;
  if (!name || !s0 || !s1) throw new Error("usage: new <name> <school0> <school1> [seed] [hp]");
  const seed = seedStr ? Number(seedStr) : Math.floor(Math.random() * 2_000_000_000);
  const hp = hpStr ? Number(hpStr) : undefined;
  const state = createGame({
    seed,
    ...(hp !== undefined ? { startingHp: hp } : {}),
    players: [deckFor(s0 as PlayableSchool), deckFor(s1 as PlayableSchool)],
  });
  mkdirSync(PT_DIR, { recursive: true });
  writeFileSync(
    logFile(name),
    `# Playtest: ${s0} (P0) vs ${s1} (P1)\n\n` +
      `- Date: ${new Date().toISOString().slice(0, 10)}\n- Seed: ${seed}\n` +
      `- Controller: Claude (self-play, both sides)\n\n## Match log\n`,
    "utf8",
  );
  saveSession(name, { schools: [s0, s1], seed, state });
  console.log(`Started "${name}".\n\n` + renderDecision(state, [s0, s1]));
}

function cmdShow(name: string): void {
  const sess = loadSession(name);
  console.log(renderDecision(sess.state, sess.schools));
}

function cmdAct(rest: string[]): void {
  const [name, ref, ...noteParts] = rest;
  if (!name || ref === undefined) throw new Error("usage: act <name> <index-or-slug> [note...]");
  const sess = loadSession(name);
  if (isTerminal(sess.state)) {
    console.log("Match is already over.\n\n" + renderDecision(sess.state, sess.schools));
    return;
  }
  const actor = sess.state.priorityPlayer;
  const legal = legalActions(sess.state, actor);

  // Resolve by slug (preferred — stable across listings) or by positional index.
  // A stale slug fails loudly here instead of silently applying the wrong action.
  let action;
  if (/^\d+$/.test(ref)) {
    const index = Number(ref);
    if (index < 0 || index >= legal.length) {
      console.log(`Invalid index ${ref}. Valid 0..${legal.length - 1}.\n\n` + renderDecision(sess.state, sess.schools));
      return;
    }
    action = legal[index]!;
  } else {
    const want = ref.toLowerCase();
    action = legal.find((a) => slugFor(sess.state, a, actor) === want);
    if (!action) {
      console.log(`No legal action matches slug "${ref}" — the position may have moved on.\n\n` + renderDecision(sess.state, sess.schools));
      return;
    }
  }
  const note = noteParts.join(" ").trim();
  if (note) appendLog(name, `\n> **P${actor} (${sess.schools[actor]}) thinks:** ${note}`);

  const label = describeAction(sess.state, action); // label before state changes
  const { state: next, events } = apply(sess.state, action);
  appendLog(name, `- **P${actor}:** ${label}`);
  for (const e of events) {
    const s = describeEvent(e);
    if (s) appendLog(name, `    - ${s}`);
  }
  appendLog(name, `    _${stateLine(next)}_`);
  sess.state = next;
  saveSession(name, sess);
  if (isTerminal(next)) appendLog(name, `\n${resultLine(next)}`);
  // Echo what was actually taken — the transcript-level guard against misplays.
  console.log(`→ P${actor} acted: ${label}\n\n` + renderDecision(next, sess.schools));
}

function cmdNote(rest: string[]): void {
  const [name, ...textParts] = rest;
  if (!name) throw new Error("usage: note <name> <text...>");
  const sess = loadSession(name);
  const text = textParts.join(" ").trim();
  appendLog(name, `\n> **note (P${sess.state.priorityPlayer}):** ${text}`);
  console.log("Noted.");
}

/** Apply forced passes until a real (non-pass) decision or game over. */
function cmdAuto(rest: string[]): void {
  const [name, ...noteParts] = rest;
  if (!name) throw new Error("usage: auto <name> [note...]");
  const sess = loadSession(name);
  const note = noteParts.join(" ").trim();
  if (note) appendLog(name, `\n> **note:** ${note}`);

  const events: string[] = [];
  let passes = 0;
  let guard = 0;
  while (!isTerminal(sess.state)) {
    const actor = sess.state.priorityPlayer;
    const legal = legalActions(sess.state, actor);
    if (legal.some((a) => a.type !== "pass")) break; // a real choice exists — hand back control
    const { state: next, events: evs } = apply(sess.state, { type: "pass" });
    for (const e of evs) {
      const s = describeEvent(e);
      if (s) events.push(s);
    }
    sess.state = next;
    passes++;
    if (++guard > 2000) break;
  }
  if (passes > 0) appendLog(name, `- _(auto-advanced ${passes} forced pass step(s))_`);
  for (const s of events) appendLog(name, `    - ${s}`);
  appendLog(name, `    _${stateLine(sess.state)}_`);
  saveSession(name, sess);
  if (isTerminal(sess.state)) appendLog(name, `\n${resultLine(sess.state)}`);
  console.log(renderDecision(sess.state, sess.schools));
}

function cmdFinish(rest: string[]): void {
  const [name, ...analysisParts] = rest;
  if (!name) throw new Error("usage: finish <name> [analysis...]");
  const analysis = analysisParts.join(" ").trim();
  appendLog(name, `\n## Analysis\n\n${analysis}\n`);
  console.log(`Appended analysis to ${logFile(name)}`);
}

function cmdLog(name: string): void {
  console.log(readFileSync(logFile(name), "utf8"));
}

function main(): void {
  const [command, ...rest] = process.argv.slice(2);
  switch (command) {
    case "new":
      return cmdNew(rest);
    case "show":
      return cmdShow(rest[0]!);
    case "act":
      return cmdAct(rest);
    case "note":
      return cmdNote(rest);
    case "auto":
      return cmdAuto(rest);
    case "finish":
      return cmdFinish(rest);
    case "log":
      return cmdLog(rest[0]!);
    default:
      console.log("commands: new | show | act | note | auto | finish | log");
  }
}

main();
