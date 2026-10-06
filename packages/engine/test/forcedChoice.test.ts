/**
 * Forced-choice timeout line (OPENSKY_REVIEW §D.20). apps/server's onClockTimeout
 * resolves a timed-out seat with the canonical line: `pass` if legal, else
 * `donePreparing`, else the FIRST `choose` (else the first legal action), repeated
 * ≤50 times and stopping after a pass/donePreparing. This test replays that exact
 * line from a state with each reachable PendingChoice.mode pending and asserts it is
 * always legal, keeps every engine invariant, and clears the pending choice.
 *
 * Mode coverage (2026-10-06, the fuzz below): see REACHED / the report printed on
 * failure. `millFromTop` has no creation site in the engine (Short Wick's handler
 * exists in apply but no effect stages it), so fuzz cannot reach it.
 */
import { describe, expect, it } from "vitest";
import {
  apply,
  assertInvariants,
  countCards,
  isTerminal,
  legalActions,
  type Action,
  type GameState,
  type PendingChoice,
} from "../src/index.ts";
import { newFuzzGame, walk } from "./fuzz.ts";

type Mode = PendingChoice["mode"];
const ALL_MODES: Mode[] = [
  "takeToHand",
  "bankToDeckTop",
  "discardForDamage",
  "discardForSearch",
  "orderToTop",
  "bounceToOwnersDeckTop",
  "millFromTop",
  "reveal",
  "discardThenDraw",
  "discardFromOpponentHand",
  "discardToDeckTop",
  "discardToHand",
  "sealPrepared",
  "treatAsComponent",
  "treatAsSymbol",
];
/** Modes the fuzz is expected to reach; a regression in coverage fails the test. */
const UNREACHABLE: ReadonlySet<Mode> = new Set(["millFromTop"]);
const SAMPLES_PER_MODE = 4;

/** The server's canonical timeout pick (apps/server/src/app.ts onClockTimeout). */
function timeoutPick(legal: Action[]): Action {
  return (
    legal.find((a) => a.type === "pass") ??
    legal.find((a) => a.type === "donePreparing") ??
    legal.find((a) => a.type === "choose") ??
    legal[0]!
  );
}

function collectChoiceStates(): Map<Mode, { state: GameState; label: string }[]> {
  const byMode = new Map<Mode, { state: GameState; label: string }[]>();
  for (let seed = 0; seed < 40; seed++) {
    walk(newFuzzGame(seed, seed % 2 === 1), seed * 7919 + 3, { biased: true, maxSteps: 700, label: `seed ${seed}` }, (s, step) => {
      const pc = s.pendingChoice;
      if (!pc || isTerminal(s)) return;
      const list = byMode.get(pc.mode) ?? [];
      if (list.length >= SAMPLES_PER_MODE) return;
      list.push({ state: structuredClone(s), label: `seed ${seed} step ${step}` });
      byMode.set(pc.mode, list);
    });
  }
  return byMode;
}

describe("forced-choice timeout line", () => {
  const byMode = collectChoiceStates();
  const reached = ALL_MODES.filter((m) => byMode.has(m));
  const missing = ALL_MODES.filter((m) => !byMode.has(m));

  it("fuzz reaches every creatable PendingChoice mode", () => {
    // Printed for the auditing issue (reached vs not).
    console.log(`forced-choice modes reached: ${reached.join(", ")}\nnot reached: ${missing.join(", ") || "(none)"}`);
    expect(missing.filter((m) => !UNREACHABLE.has(m))).toEqual([]);
  });

  for (const mode of ALL_MODES) {
    it.runIf(byMode.has(mode))(`the canonical timeout line clears a pending ${mode} choice legally`, () => {
      for (const { state: start, label } of byMode.get(mode) ?? []) {
        const side = start.pendingChoice!.player;
        const cardCount = countCards(start);
        let state = start;
        let clearedAt = -1;
        for (let guard = 0; guard < 50 && !isTerminal(state); guard++) {
          const legal = legalActions(state, side);
          if (legal.length === 0) break;
          const pick = timeoutPick(legal);
          expect(legal).toContainEqual(pick); // routed through the real validator
          state = apply(state, pick, side).state;
          assertInvariants(state, `${label} (${mode}) timeout step ${guard} after ${JSON.stringify(pick)}`, { cardCount });
          if (state.pendingChoice === null && clearedAt < 0) clearedAt = guard;
          if (pick.type === "pass" || pick.type === "donePreparing") break;
        }
        expect(clearedAt, `${label}: ${mode} choice never cleared by the timeout line`).toBeGreaterThanOrEqual(0);
        // The timed-out seat is not left holding a choice it must answer.
        if (!isTerminal(state) && state.pendingChoice) expect(state.pendingChoice.player).not.toBe(side);
      }
    });
  }
});
