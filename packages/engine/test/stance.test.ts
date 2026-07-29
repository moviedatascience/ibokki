import { describe, expect, it } from "vitest";
import { createGame, deckFor, getEffect, makeContext, type CardInstance, type GameEvent } from "../src/index.ts";

/** Experiment 1 (2026-07-27 balance triangle): Searing Word 2→1 damage; Stone
 *  Stance reworked from a never-cast reaction discount to round-long -1 on
 *  incoming spell damage (the anti-cantrip tax). */
describe("experiment 1 card changes", () => {
  const fresh = () => createGame({ seed: 3, players: [deckFor("Abjuration"), deckFor("Evocation")] });
  const run = (state: ReturnType<typeof fresh>, caster: 0 | 1, defId: string) => {
    const card: CardInstance = { iid: 9500, defId };
    const events: GameEvent[] = [];
    getEffect(defId)!(makeContext(state, caster, card, events), card);
  };

  it("Searing Word deals 1", () => {
    const state = fresh();
    run(state, 1, "EVO-004");
    expect(state.players[0].hp).toBe(29);
  });

  it("Stone Stance grants round-long -2 that zeroes cantrips (exp-1h)", () => {
    const state = fresh();
    run(state, 0, "ABJ-005");
    expect(state.players[0].ongoing).toContainEqual(
      expect.objectContaining({ kind: "damageReduction", value: 2, expiry: "endOfRound" }),
    );
    run(state, 1, "EVO-001"); // Spark: 2 damage, reduced to 0
    expect(state.players[0].hp).toBe(30);
    run(state, 1, "EVO-001"); // reduction is per-hit, not a consumed pool
    expect(state.players[0].hp).toBe(30);
  });

  it("Reckoning (exp-1d) deals half the MATCH-lifetime prevention, rounded up", () => {
    const state = fresh();
    // Charge the accumulator the honest way: stance up, then eat two Sparks (2 prevented each).
    run(state, 0, "ABJ-005");
    run(state, 1, "EVO-001");
    run(state, 1, "EVO-001");
    expect(state.players[0].damagePreventedTotal).toBe(4);
    run(state, 0, "ABJ-032"); // ceil(4/2) = 2
    expect(state.players[1].hp).toBe(28);
    // The window is the MATCH: a round boundary must not reset the charge.
    state.players[0].damagePreventedThisRound = 0; // what endRoundAndLevelUp does
    state.players[0].damagePreventedTotal = 9;
    run(state, 0, "ABJ-032"); // ceil(9/2) = 5
    expect(state.players[1].hp).toBe(23);
  });

  it("ward soaks charge Reckoning's MATCH counter but not the round counter (exp-1g)", () => {
    const state = fresh();
    state.players[0].wards = [{ wid: 900, hp: 3 }];
    run(state, 1, "EVO-001"); // Spark: 2 soaked by the ward, wizard untouched
    expect(state.players[0].hp).toBe(30);
    expect(state.players[0].wards[0]!.hp).toBe(1);
    expect(state.players[0].damagePreventedTotal).toBe(2); // soak charges the match window
    expect(state.players[0].damagePreventedThisRound).toBe(0); // round vocabulary unchanged (Searing Riposte)
    run(state, 1, "EVO-001"); // 1 soaked (ward dies), 1 through to the wizard
    expect(state.players[0].hp).toBe(29);
    expect(state.players[0].damagePreventedTotal).toBe(3); // only the soaked share counts
    run(state, 0, "ABJ-032"); // ceil(3/2) = 2
    expect(state.players[1].hp).toBe(28);
  });
});
