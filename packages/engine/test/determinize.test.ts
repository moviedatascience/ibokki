import { describe, expect, it } from "vitest";
import {
  apply,
  createGame,
  deckFor,
  determinize,
  isTerminal,
  legalActions,
  redact,
  rngInt,
  tierForLevel,
  type GameState,
  type PlayerId,
} from "../src/index.ts";
import { getCard } from "@ibokki/cards";

/** Advance a game `steps` random legal actions (the fuzz-walk used across engine tests). */
function walk(start: GameState, steps: number, rngSeed: number): GameState {
  let state = start;
  let rs = rngSeed | 0;
  for (let i = 0; i < steps && !isTerminal(state); i++) {
    const actor = state.priorityPlayer;
    const legal = legalActions(state, actor);
    if (legal.length === 0) break;
    let pick: number;
    [pick, rs] = rngInt(rs, legal.length);
    state = apply(state, legal[pick]!, actor).state;
  }
  return state;
}

function midGame(seed: number, steps = 60): GameState {
  return walk(createGame({ seed, players: [deckFor("Evocation"), deckFor("Divination")] }), steps, seed ^ 0x51ed);
}

const sortedDefIds = (cards: { defId: string }[]): string[] => cards.map((c) => c.defId).sort();

describe("determinize", () => {
  it("preserves the viewer's redacted view exactly", () => {
    for (const seed of [3, 17, 99]) {
      const state = midGame(seed);
      for (const viewer of [0, 1] as PlayerId[]) {
        const det = determinize(state, viewer, 1234 + seed);
        expect(redact(det, viewer)).toEqual(redact(state, viewer));
      }
    }
  });

  it("preserves the multisets of hidden cards (nothing invented or lost)", () => {
    const state = midGame(7);
    const det = determinize(state, 0, 42);
    const opp = state.players[1];
    const dopp = det.players[1];
    expect(sortedDefIds([...dopp.hand, ...dopp.resourceDeck])).toEqual(
      sortedDefIds([...opp.hand, ...opp.resourceDeck]),
    );
    expect(
      sortedDefIds([...dopp.spellbook, ...dopp.prepared.filter((p) => p.faceDown).map((p) => p.spell)]),
    ).toEqual(sortedDefIds([...opp.spellbook, ...opp.prepared.filter((p) => p.faceDown).map((p) => p.spell)]));
  });

  it("is deterministic in the seed, and varies across seeds", () => {
    const state = midGame(11);
    expect(JSON.stringify(determinize(state, 0, 5))).toBe(JSON.stringify(determinize(state, 0, 5)));
    // With a big hidden pool, at least one of a handful of seeds must deal differently.
    const base = JSON.stringify(determinize(state, 0, 5).players[1].hand);
    const anyDiffers = [6, 7, 8, 9, 10].some(
      (s) => JSON.stringify(determinize(state, 0, s).players[1].hand) !== base,
    );
    expect(anyDiffers).toBe(true);
  });

  it("never mutates the input state", () => {
    const state = midGame(23);
    const before = JSON.stringify(state);
    determinize(state, 0, 77);
    determinize(state, 1, 78);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("keeps sampled face-down prepared spells tier-legal", () => {
    for (const seed of [5, 31, 63]) {
      const state = midGame(seed, 90);
      const det = determinize(state, 0, seed * 3 + 1);
      const opp = det.players[1];
      const maxLevel = tierForLevel(opp.level).maxSpellLevel;
      for (const prep of opp.prepared) {
        if (!prep.faceDown) continue;
        expect((getCard(prep.spell.defId)?.level ?? 1)).toBeLessThanOrEqual(maxLevel);
      }
    }
  });

  it("produces playable worlds (random walk applies without throwing)", () => {
    const state = midGame(13);
    for (const seed of [1, 2, 3]) {
      const det = determinize(state, 0, seed);
      expect(() => walk(det, 50, seed ^ 0xbeef)).not.toThrow();
    }
  });
});
