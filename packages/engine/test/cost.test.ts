import { describe, expect, it } from "vitest";
import { getComponent } from "@ibokki/cards";
import { combinedSymbols, meetsCost, reactionCost } from "../src/cost.ts";

// Pins written to dispose the m46/m48 pilot reports of "inconsistent" component
// funding (exp-8d wave, 2026-08-18). Code review found one designed asymmetry —
// Stone Stance discounts REACTION S-costs only — and no path where a dual fails
// to supply a symbol it contains. These pins make the answer permanent.
describe("component funding math (m46/m48 repro — disposed as designed behavior)", () => {
  it("a dual pays any single symbol it contains (SM pays an M cost)", () => {
    const sm = getComponent("CMP-SM")!;
    expect(meetsCost({ V: 0, S: 0, M: 1 }, combinedSymbols([sm]))).toBe(true);
    expect(meetsCost({ V: 0, S: 1, M: 0 }, combinedSymbols([sm]))).toBe(true);
  });

  it("one multi-symbol card supplies each of its pips ONCE (a VSM never pays SS)", () => {
    const vsm = getComponent("CMP-VSM");
    // The triple may not exist in the component pool; the invariant holds for any dual too.
    const card = vsm ?? getComponent("CMP-VS")!;
    expect(meetsCost({ V: 0, S: 2, M: 0 }, combinedSymbols([card]))).toBe(false);
  });

  it("two S-bearing cards together pay SS (the documented rule m49 experienced)", () => {
    const ss = combinedSymbols([getComponent("CMP-VS")!, getComponent("CMP-SM")!]);
    expect(meetsCost({ V: 0, S: 2, M: 0 }, ss)).toBe(true);
  });

  it("Stone Stance's S-discount applies to REACTION costs only — the m48 'asymmetry' is this, working as printed", () => {
    // SS reaction under discount 1 → effective S1 (one S-bearing card suffices).
    expect(reactionCost({ V: 0, S: 2, M: 0 }, 1, 0)).toEqual({ V: 0, S: 1, M: 0 });
    // The floor: a reaction never drops below one component total.
    expect(reactionCost({ V: 0, S: 1, M: 0 }, 3, 0)).toEqual({ V: 0, S: 1, M: 0 });
  });
});
