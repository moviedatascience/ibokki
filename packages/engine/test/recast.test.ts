import { describe, expect, it } from "vitest";
import { createGame, deckFor, getEffect, makeContext, type CardInstance, type GameEvent } from "../src/index.ts";

/**
 * Regression: copy-spells must never copy copy-spells. DIV-045 (Convergence,
 * L4) picking ITSELF as "the biggest cast spell" recursed until stack overflow
 * in a live balance run (2026-07-27); DIV-027 (Borrowed Spell) self-picks the
 * same way among L1s.
 */
describe("recast effects cannot recurse", () => {
  function stateWithCastSpell(defId: string) {
    const state = createGame({ seed: 1, players: [deckFor("Divination"), deckFor("Evocation")] });
    state.players[0].prepared.push({
      spell: { iid: 9001, defId },
      faceDown: false,
      attached: [],
      cast: true, // already cast this round — the recast candidate pool
      sealed: false,
    });
    return state;
  }

  it("Convergence with only itself cast does not blow the stack (and recasts nothing)", () => {
    const state = stateWithCastSpell("DIV-045");
    const card: CardInstance = { iid: 9002, defId: "DIV-045" };
    const events: GameEvent[] = [];
    const fn = getEffect("DIV-045")!;
    expect(() => fn(makeContext(state, 0, card, events), card)).not.toThrow();
  });

  it("Borrowed Spell with only itself cast does not blow the stack", () => {
    const state = stateWithCastSpell("DIV-027");
    const card: CardInstance = { iid: 9002, defId: "DIV-027" };
    const events: GameEvent[] = [];
    const fn = getEffect("DIV-027")!;
    expect(() => fn(makeContext(state, 0, card, events), card)).not.toThrow();
  });

  it("Convergence still recasts a real engine spell (Fireball)", () => {
    const state = stateWithCastSpell("EVO-017"); // a cast Fireball is a legal target
    const hpBefore = state.players[1].hp;
    const card: CardInstance = { iid: 9002, defId: "DIV-045" };
    const events: GameEvent[] = [];
    getEffect("DIV-045")!(makeContext(state, 0, card, events), card);
    expect(state.players[1].hp).toBeLessThan(hpBefore); // the copied Fireball resolved
  });
});
