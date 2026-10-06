/**
 * Shared seeded self-play walker for the engine's fuzz-style property tests
 * (leak, invariants, forced-choice). Not a test file itself (no `.test.ts`).
 */
import {
  apply,
  assertInvariants,
  countCards,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  rngInt,
  type Action,
  type GameState,
} from "../src/index.ts";
import { CARDS } from "@ibokki/cards";

export const SCHOOLS = ["Evocation", "Abjuration", "Divination"] as const;

/** Every ordered school pairing, indexed by seed so a seed range covers the triangle. */
export function matchupFor(seed: number): [(typeof SCHOOLS)[number], (typeof SCHOOLS)[number]] {
  const i = ((seed % 9) + 9) % 9;
  return [SCHOOLS[Math.floor(i / 3)]!, SCHOOLS[i % 3]!];
}

/** Every trainer (Item/Gambit) in the card DB — presets carry only 7 per school. */
export const ALL_TRAINERS: readonly string[] = CARDS.filter((c) => c.type === "Item" || c.type === "Gambit").map((c) => c.id);

/** Replace `n` basic components with a seed-rotated slice of ALL trainers, so fuzz
 *  reaches trainer gates / choice modes the presets never carry (Transmuter's Stone,
 *  Mnemonic Charm, Mentor's Guidance, …). Deck size is unchanged. */
function salt(deck: string[], seed: number, n = 10): string[] {
  const out = [...deck];
  let placed = 0;
  for (let i = 0; i < out.length && placed < n; i++) {
    if (/^CMP-[VSM]$/.test(out[i]!)) {
      out[i] = ALL_TRAINERS[(seed * 7 + placed * 3) % ALL_TRAINERS.length]!;
      placed++;
    }
  }
  return out;
}

/** A preset matchup by seed; `salted` swaps 10 basics per deck for off-preset trainers. */
export function newFuzzGame(seed: number, salted = false): GameState {
  const [a, b] = matchupFor(seed);
  const [da, db] = [deckFor(a), deckFor(b)];
  if (salted) {
    da.resourceDeck = salt(da.resourceDeck, seed);
    db.resourceDeck = salt(db.resourceDeck, seed + 5);
  }
  return createGame({ seed, players: [da, db] });
}

export interface WalkOptions {
  /** Prefer effect-triggering actions (cast / trainer / reaction / choose) so choice chains occur. */
  biased?: boolean;
  /** Hard ply cap (a random walk always terminates via TURN_CAP; this just bounds runtime). */
  maxSteps?: number;
  /** Run the engine invariant checker after every apply (default true). */
  check?: boolean;
  /** Label prefix for invariant failures (e.g. "seed 7"). */
  label?: string;
}

/**
 * KNOWN ENGINE BUG (found by the invariant checker, 2026-10-06; the fix belongs in
 * apply.ts / effects/context.ts, outside this test suite): when Flame Mirror (DIV-026,
 * `redirectTarget`) turns an "opponent's cards" choice spell on its caster — DIV-008
 * Char the Page / DIV-039 Burn the Letter (discardFromOpponentHand), ABJ-010 Iron Brand /
 * ABJ-030 Welded Shut (sealPrepared), DIV-011/017/031 (reveal) — context.ts stages the
 * candidates from the CASTER'S own zones (opponentId = selfId when redirected), but
 * apply's `choose` handler resolves against otherPlayer(chooser). discardFromOpponentHand
 * then pushes the pick into the opponent's discard while it stays in the caster's hand
 * (a DUPLICATED card); sealPrepared silently seals nothing. Until fixed, walks STOP
 * (and count) on reaching such a choice instead of corrupting state. Pinned by the
 * it.fails repro in invariants.test.ts — flip it when fixed.
 */
export function redirectedOpponentChoice(state: GameState): boolean {
  const pc = state.pendingChoice;
  if (!pc) return false;
  if (!["discardFromOpponentHand", "bounceToOwnersDeckTop", "sealPrepared", "reveal"].includes(pc.mode)) return false;
  const me = state.players[pc.player];
  const mine = new Set([...me.hand, ...me.resourceDeck, ...me.prepared.map((p) => p.spell)].map((c) => c.iid));
  return pc.candidates.some((c) => mine.has(c.iid));
}

export const fuzzStats = { knownBugStops: 0 };

/**
 * Random legal walk from `start`. `onStep(state, step)` is called on the initial state
 * (step 0) and after EVERY apply (after the invariant check, when enabled). In Prepare, the acting player alternates between the
 * un-done players so both players' prepare windows are exercised.
 */
export function walk(
  start: GameState,
  pickSeed: number,
  opts: WalkOptions,
  onStep: (state: GameState, step: number, action: Action | null) => void,
): GameState {
  let state = start;
  let s = pickSeed | 0;
  let step = 0;
  const max = opts.maxSteps ?? 100_000;
  const check = opts.check ?? true;
  const cardCount = countCards(start);
  onStep(state, 0, null);
  while (!isTerminal(state) && step < max) {
    let actor = state.pendingChoice ? state.pendingChoice.player : state.priorityPlayer;
    if (state.phase === "prepare" && !state.pendingChoice) {
      const undone = state.players.filter((p) => !p.prepareDone).map((p) => p.id);
      let r: number;
      [r, s] = rngInt(s, undone.length);
      actor = undone[r]!;
    }
    const legal = legalActions(state, actor);
    if (legal.length === 0) throw new Error(`walk: player ${actor} has no legal actions at step ${step}`);
    let pool = legal;
    if (opts.biased) {
      const preferred = legal.filter(
        (a) => a.type === "cast" || a.type === "castReaction" || a.type === "playTrainer" || a.type === "choose",
      );
      if (preferred.length > 0) pool = preferred;
    }
    let idx: number;
    [idx, s] = rngInt(s, pool.length);
    const action = pool[idx] as Action;
    state = apply(state, action, actor).state;
    ++step;
    if (redirectedOpponentChoice(state)) {
      fuzzStats.knownBugStops++;
      return state; // see redirectedOpponentChoice — don't walk into the duplication
    }
    if (check) assertInvariants(state, `${opts.label ?? "walk"} pick ${pickSeed} step ${step} after ${JSON.stringify(action)}`, { cardCount });
    onStep(state, step, action);
  }
  return state;
}
