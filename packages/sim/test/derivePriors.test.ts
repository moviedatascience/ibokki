import { describe, expect, it } from "vitest";
import { createGame, deckFor } from "@ibokki/engine";
import castPriors from "../data/cast-priors.json";
import { _overridePrepThreat, evaluateState } from "../src/evaluate.ts";

describe("auto-derived cast priors (blind-spot plan workstream 2)", () => {
  const priors = castPriors.priors as Record<string, number>;

  it("the generated table is populated and on the tiebreak scale", () => {
    expect(Object.keys(priors).length).toBeGreaterThan(50);
    for (const v of Object.values(priors)) {
      expect(v).toBeGreaterThanOrEqual(0.3);
      expect(v).toBeLessThanOrEqual(2);
    }
  });

  it("reproduces the exp-3b hand values within tolerance (Omen / Foretell)", () => {
    expect(priors["DIV-012"]).toBeGreaterThanOrEqual(1.4); // hand value 1.7
    expect(priors["DIV-011"]).toBeGreaterThanOrEqual(1.2); // hand value 1.6
  });

  it("evaluateState consumes the table (and the derivation hook round-trips)", () => {
    const state = createGame({ seed: 21, players: [deckFor("Divination"), deckFor("Evocation")] });
    const s = structuredClone(state);
    // Inject a fully-paid Omen — its prior should be visible in the eval.
    s.players[0].prepared.push({
      spell: { iid: 990001, defId: "DIV-012" },
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
      bonus: { V: 0, S: 0, M: 2 },
    });
    const withPriors = evaluateState(s, 0);
    _overridePrepThreat({});
    const priorFree = evaluateState(s, 0);
    _overridePrepThreat(null);
    const restored = evaluateState(s, 0);

    expect(withPriors).toBeGreaterThan(priorFree); // the prior contributes
    expect(restored).toBe(withPriors); // the hook restores exactly
  });
});
