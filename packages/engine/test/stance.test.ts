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

  it("Stone Stance grants round-long damage reduction that blunts cantrips", () => {
    const state = fresh();
    run(state, 0, "ABJ-005");
    expect(state.players[0].ongoing).toContainEqual(
      expect.objectContaining({ kind: "damageReduction", value: 1, expiry: "endOfRound" }),
    );
    run(state, 1, "EVO-001"); // Spark: 2 damage, reduced to 1
    expect(state.players[0].hp).toBe(29);
    run(state, 1, "EVO-001"); // reduction is per-hit, not a consumed pool
    expect(state.players[0].hp).toBe(28);
  });
});
