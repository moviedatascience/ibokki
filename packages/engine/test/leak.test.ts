/**
 * Hidden-information leak test (OPENSKY_REVIEW §D.18). `legalActions(state, p)` takes
 * the FULL state, so any gate that reads the opponent's hidden zones (hand contents,
 * deck order, face-down prepared identities, remaining spellbook) would leak through
 * the list of legal actions — to the human (the client shows legal actions) and to
 * search bots. Property: for every reachable state and both players, the legal
 * actions are identical in every world `determinize` can sample for that player.
 *
 * Audit 2026-10-06: no gate currently leaks. trainerHasEffect reads only the
 * player's own zones plus the opponent's PUBLIC wards / ongoing markers / hand COUNT;
 * reactionAnswersTop reads the (public) stack top; LEDGER_MIN reads the caster's own
 * bank. Keep it that way: a gate may read the opponent's hidden zones only through
 * their counts. If a feel-bad guard would need hidden info, OFFER the action and let
 * the effect no-op — that is the honest behaviour.
 *
 * (A `redact`-based variant is not possible: redact returns a view, not a state.)
 */
import { describe, expect, it } from "vitest";
import { determinize, legalActions, type Action, type GameState, type PlayerId } from "../src/index.ts";
import { matchupFor, newFuzzGame, walk } from "./fuzz.ts";

/** Ply cap per walk: covers prepare + several rounds of main, keeps the suite fast. */
const STEPS = 350;
const SEEDS = 48;

const key = (a: Action): string => JSON.stringify(a);

function leakDiff(state: GameState, truth: string[], p: PlayerId, k: number): string | null {
  const sampled = legalActions(determinize(state, p, k), p).map(key);
  if (truth.length === sampled.length && truth.every((a, i) => a === sampled[i])) return null;
  const t = new Set(truth);
  const d = new Set(sampled);
  const onlyTrue = truth.filter((a) => !d.has(a));
  const onlySampled = sampled.filter((a) => !t.has(a));
  return `only-in-true=[${onlyTrue.join(", ")}] only-in-sampled=[${onlySampled.join(", ")}]${
    onlyTrue.length + onlySampled.length === 0 ? " (order differs)" : ""
  }`;
}

describe("legalActions leaks no hidden information", () => {
  it("is invariant under determinize for both players at every step of random walks", () => {
    const failures: string[] = [];
    let checked = 0;
    let choiceSteps = 0;
    let reactionSteps = 0;
    let prepareSteps = 0;
    let trainerSteps = 0;
    for (let seed = 0; seed < SEEDS; seed++) {
      walk(newFuzzGame(seed, seed % 4 >= 2), seed * 97 + 13, { biased: seed % 2 === 0, maxSteps: STEPS, label: `seed ${seed}` }, (state, step) => {
        if (state.pendingChoice) choiceSteps++;
        if (state.stack.length > 0) reactionSteps++;
        if (state.phase === "prepare") prepareSteps++;
        for (const p of [0, 1] as PlayerId[]) {
          const truth = legalActions(state, p).map(key);
          // Windows where a hidden-info gate could bite get all three samples; elsewhere
          // one rotating sample per step (consecutive states are near-identical, so the
          // walk still sees every k). A player with no true actions is gated only by
          // public facts (priority / choice owner / prepareDone) — still sampled once.
          const interesting =
            state.pendingChoice !== null ||
            state.stack.length > 0 ||
            truth.some((a) => a.includes('"playTrainer"'));
          if (truth.some((a) => a.includes('"playTrainer"'))) trainerSteps++;
          const ks = interesting ? [1, 2, 3] : [1 + (step % 3)];
          for (const k of ks) {
            checked++;
            const diff = leakDiff(state, truth, p, seed * 1000 + step * 7 + k);
            if (diff && failures.length < 20) {
              failures.push(`seed ${seed} (${matchupFor(seed).join(" v ")}) step ${step} player ${p} k ${k}: ${diff}`);
            }
          }
        }
      });
    }
    expect(failures, failures.join("\n")).toEqual([]);
    // The walks must actually reach the interesting windows.
    expect(choiceSteps).toBeGreaterThan(0);
    expect(reactionSteps).toBeGreaterThan(0);
    expect(prepareSteps).toBeGreaterThan(0);
    expect(trainerSteps).toBeGreaterThan(0);
    expect(checked).toBeGreaterThan(15_000);
  });
});

describe("known leaks (it.fails — flip to it() when fixed)", () => {
  it.fails("a seal choice's legal actions don't depend on which spell hides in a face-down slot", async () => {
    // ABJ-010 Iron Brand / ABJ-030 Welded Shut: context.ts shows face-down slots as
    // FACEDOWN-<slot> descriptors but keeps the hidden spell's REAL iid as the choose
    // key, and iids are dealt in decklist order at createGame — so `choose {iid}` (and
    // PendingChoiceView.candidateIids) identifies the face-down spell. Fix: key face-down
    // candidates by a slot-derived/synthetic id (context.ts + apply.ts sealPrepared).
    const { apply, createGame, deckFor, getEffect, makeContext } = await import("../src/index.ts");
    let s = createGame({ seed: 5, players: [deckFor("Abjuration"), deckFor("Divination")] });
    while (s.phase === "prepare") {
      const p = s.players[0].prepareDone ? 1 : 0;
      const legal = legalActions(s, p);
      s = apply(s, legal.find((a) => a.type === "prepareSpell") ?? legal.find((a) => a.type === "donePreparing")!, p).state;
    }
    expect(s.players[1].prepared.some((pr) => pr.faceDown)).toBe(true);
    const sealFrom = (world: GameState): string[] => {
      const w = structuredClone(world);
      const brand = { iid: w.nextIid++, defId: "ABJ-010" };
      getEffect("ABJ-010")!(makeContext(w, 0, brand, []), brand);
      return legalActions(w, 0).map(key);
    };
    const truth = sealFrom(s);
    for (const k of [1, 2, 3, 4, 5]) expect(sealFrom(determinize(s, 0, k))).toEqual(truth);
  });
});
