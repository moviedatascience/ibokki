/**
 * Simultaneous prepare phase: both players lay face-down spells independently
 * of priority (design doc: "Wizards simultaneously pull cards..."). Servers
 * pass the actor explicitly; sequential drivers keep the priority default.
 */
import { describe, expect, it } from "vitest";
import { apply, createGame, deckFor, isTerminal, legalActions, type GameState, type PlayerId } from "../src/index.ts";

function newGame(): GameState {
  return createGame({ seed: 7, players: [deckFor("Evocation"), deckFor("Abjuration")] });
}

describe("simultaneous prepare", () => {
  it("both players have prepare actions from the start, regardless of priority", () => {
    const g = newGame();
    expect(g.phase).toBe("prepare");
    expect(legalActions(g, 0).length).toBeGreaterThan(0);
    expect(legalActions(g, 1).length).toBeGreaterThan(0);
  });

  it("the non-priority player can prepare and finish via the actor argument", () => {
    let state = newGame();
    const waiting = (state.priorityPlayer ^ 1) as PlayerId;

    const prep = legalActions(state, waiting).find((a) => a.type === "prepareSpell")!;
    state = apply(state, prep, waiting).state;
    expect(state.players[waiting].prepared).toHaveLength(1);
    // Priority is untouched by the concurrent prepare.
    expect(state.priorityPlayer).toBe((waiting ^ 1) as PlayerId);

    // Interleave: the priority player prepares too, defaulting the actor.
    const prio = state.priorityPlayer;
    const prep2 = legalActions(state, prio).find((a) => a.type === "prepareSpell")!;
    state = apply(state, prep2).state;
    expect(state.players[prio].prepared).toHaveLength(1);
  });

  it("finishing in either order reaches the main phase; done players have no actions", () => {
    for (const firstFinisher of [0, 1] as PlayerId[]) {
      let state = newGame();
      const second = (firstFinisher ^ 1) as PlayerId;

      state = apply(state, { type: "donePreparing" }, firstFinisher).state;
      expect(state.phase).toBe("prepare");
      expect(legalActions(state, firstFinisher)).toHaveLength(0);
      expect(legalActions(state, second).length).toBeGreaterThan(0);

      state = apply(state, { type: "donePreparing" }, second).state;
      expect(state.phase).toBe("main");
      expect(isTerminal(state)).toBe(false);
    }
  });

  it("rejects prepare actions from a player who already finished", () => {
    let state = newGame();
    const prep = legalActions(state, 0).find((a) => a.type === "prepareSpell")!;
    state = apply(state, { type: "donePreparing" }, 0).state;
    expect(() => apply(state, prep, 0)).toThrow(/already finished preparing/);
  });

  it("outside prepare, an explicit actor must be the priority holder", () => {
    let state = newGame();
    state = apply(state, { type: "donePreparing" }, 0).state;
    state = apply(state, { type: "donePreparing" }, 1).state;
    expect(state.phase).toBe("main");
    const waiting = (state.priorityPlayer ^ 1) as PlayerId;
    expect(() => apply(state, { type: "pass" }, waiting)).toThrow(/priority holder/);
  });
});
