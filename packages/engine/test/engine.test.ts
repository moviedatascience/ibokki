import { describe, expect, it } from "vitest";
import {
  apply,
  combinedSymbols,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  meetsCost,
  otherPlayer,
  outcomeHash,
  redact,
  rngInt,
  tierForLevel,
  type Action,
  type CardInstance,
  type GameState,
} from "../src/index.ts";
import { COMPONENTS_BY_ID, getCard } from "@ibokki/cards";

function newGame(seed = 1): GameState {
  return createGame({ seed, players: [deckFor("Evocation"), deckFor("Abjuration")] });
}

/** Drive both players through the Prepare phase (fill slots, then finish) into Main. */
function prepareAll(state: GameState): GameState {
  let s = state;
  let guard = 0;
  while (s.phase === "prepare") {
    const legal = legalActions(s, s.priorityPlayer);
    const choice = legal.find((a) => a.type === "prepareSpell") ?? legal.find((a) => a.type === "donePreparing")!;
    s = apply(s, choice).state;
    if (++guard > 200) throw new Error("prepare did not complete");
  }
  return s;
}

/** Deterministic random playout driver — its own seeded picker. */
function playOut(seed: number, pickSeed: number): GameState {
  let state = newGame(seed);
  let s = pickSeed | 0;
  let guard = 0;
  while (!isTerminal(state)) {
    const legal = legalActions(state, state.priorityPlayer);
    expect(legal.length).toBeGreaterThan(0);
    let idx: number;
    [idx, s] = rngInt(s, legal.length);
    const action = legal[idx] as Action;
    state = apply(state, action).state;
    if (++guard > 200_000) throw new Error("playout did not terminate");
  }
  return state;
}

describe("cost math", () => {
  it("a same-symbol dual covers a 2-symbol same-color cost", () => {
    const ss = COMPONENTS_BY_ID.get("CMP-SS")!;
    expect(meetsCost({ V: 0, S: 2, M: 0 }, combinedSymbols([ss]))).toBe(true);
  });

  it("two basics cover a cross cost; one basic does not", () => {
    const v = COMPONENTS_BY_ID.get("CMP-V")!;
    const s = COMPONENTS_BY_ID.get("CMP-S")!;
    expect(meetsCost({ V: 1, S: 1, M: 0 }, combinedSymbols([v, s]))).toBe(true);
    expect(meetsCost({ V: 1, S: 1, M: 0 }, combinedSymbols([v]))).toBe(false);
  });

  it("a tri-component covers any single-symbol cost", () => {
    const vsm = COMPONENTS_BY_ID.get("CMP-VSM")!;
    expect(meetsCost({ V: 0, S: 0, M: 1 }, combinedSymbols([vsm]))).toBe(true);
  });
});

describe("level curve", () => {
  it("matches the design-doc table at key levels", () => {
    expect(tierForLevel(1)).toEqual({ maxSpellLevel: 1, slots: 2, prepared: 4 });
    expect(tierForLevel(5).maxSpellLevel).toBe(2);
    expect(tierForLevel(10).maxSpellLevel).toBe(3);
    expect(tierForLevel(15).maxSpellLevel).toBe(4);
    expect(tierForLevel(99).prepared).toBe(10); // clamps to level 21
  });
});

describe("createGame", () => {
  it("opens in the Prepare phase with an empty board and a full spellbook", () => {
    const g = newGame(42);
    expect(g.phase).toBe("prepare");
    expect(g.round).toBe(1);
    expect(g.turnCount).toBe(0); // no turns until Main begins
    expect(g.players[0].prepared).toHaveLength(0); // you choose what to prepare
    expect(g.players[0].hand).toHaveLength(0); // draw-5 happens after Prepare
    expect(g.players[0].spellbook.length).toBeGreaterThan(0);
    expect([0, 1]).toContain(g.priorityPlayer);
  });

  it("after preparing, Main begins with level-1 prepared spells and 5-card hands", () => {
    const g = prepareAll(newGame(42));
    expect(g.phase).toBe("main");
    expect(g.turnCount).toBe(1);
    expect(g.activePlayer).toBe(g.startingPlayer);
    expect(g.players[0].prepared).toHaveLength(4); // level-1 prepared cap, filled by choice
    expect(g.players[1].prepared).toHaveLength(4);
    expect(g.players[0].hand).toHaveLength(5);
    expect(g.players[1].hand).toHaveLength(5);
    // Every prepared spell is castable at the current level (no bricking).
    for (const prep of g.players[0].prepared) {
      const def = getCard(prep.spell.defId)!;
      expect(def.level ?? 1).toBeLessThanOrEqual(1);
    }
  });

  it("is reproducible for a given seed", () => {
    expect(newGame(7)).toEqual(newGame(7));
  });
});

describe("apply", () => {
  it("does not mutate the input state (purity)", () => {
    const g = prepareAll(newGame(3));
    const before = structuredClone(g);
    apply(g, { type: "pass" });
    expect(g).toEqual(before);
  });

  it("pass hands the turn to the opponent", () => {
    const g = prepareAll(newGame(3));
    const start = g.activePlayer as number;
    const { state } = apply(g, { type: "pass" });
    expect(state.activePlayer).toBe((start ^ 1) as 0 | 1);
    expect(state.turnCount).toBe(g.turnCount + 1);
  });
});

describe("redaction (hidden information)", () => {
  it("hides the opponent's hand contents and face-down spells", () => {
    const g = prepareAll(newGame(11));
    const view = redact(g, 0);
    expect(view.self.hand).toHaveLength(g.players[0].hand.length);
    expect(view.opponent.handCount).toBe(g.players[1].hand.length);
    // every opponent prepared spell starts face-down and must be hidden
    for (const prep of view.opponent.prepared) {
      expect(prep.faceDown).toBe(true);
      expect(prep.spellDefId).toBeNull();
    }
    // you can always see your own prepared spells
    for (const prep of view.self.prepared) {
      expect(prep.spellDefId).not.toBeNull();
    }
  });

  it("exposes both players' ongoing effects to both viewers (public markers)", () => {
    const g = prepareAll(newGame(11));
    g.players[0].ongoing.push({ id: 900, owner: 0, kind: "damageBuff", value: 2, expiry: "endOfRound" });
    g.players[1].ongoing.push({ id: 901, owner: 1, kind: "reactionsLocked", value: 1, expiry: "startOfOwnNextTurn" });
    for (const viewer of [0, 1] as const) {
      const view = redact(g, viewer);
      const p0 = viewer === 0 ? view.self.ongoing : view.opponent.ongoing;
      const p1 = viewer === 0 ? view.opponent.ongoing : view.self.ongoing;
      expect(p0).toEqual([{ kind: "damageBuff", value: 2, expiry: "endOfRound" }]);
      expect(p1).toEqual([{ kind: "reactionsLocked", value: 1, expiry: "startOfOwnNextTurn" }]);
    }
  });
});

describe("random self-play", () => {
  it("always terminates with a valid outcome", () => {
    for (let seed = 0; seed < 60; seed++) {
      const final = playOut(seed, seed * 31 + 1);
      expect(final.phase).toBe("gameover");
      expect([0, 1, null]).toContain(final.winner);
      expect(final.endReason).not.toBeNull();
    }
  });

  it("is fully deterministic (same seeds -> same outcome)", () => {
    const a = playOut(123, 456);
    const b = playOut(123, 456);
    expect(outcomeHash(a)).toBe(outcomeHash(b));
  });
});

describe("pendingChoice fuzz invariants", () => {
  /** Choice modes whose candidates are STAGED OUT of a zone (the choice owns them).
   *  The other modes (bank/discard/bounce) alias cards still sitting in a hand. */
  const STAGED_MODES = new Set(["takeToHand", "orderToTop", "millFromTop"]);

  function assertZonesSane(state: GameState, step: number): void {
    const seen = new Map<number, string>();
    const check = (cards: readonly (CardInstance | undefined | null)[], where: string): void => {
      for (const c of cards) {
        if (!c) throw new Error(`step ${step}: undefined card in ${where}`);
        const prev = seen.get(c.iid);
        if (prev) throw new Error(`step ${step}: iid ${c.iid} (${c.defId}) in BOTH ${prev} and ${where}`);
        seen.set(c.iid, where);
      }
    };
    for (const p of state.players) {
      check(p.hand, `P${p.id} hand`);
      check(p.resourceDeck, `P${p.id} deck`);
      check(p.discard, `P${p.id} discard`);
      check(p.spellbook, `P${p.id} spellbook`);
      for (const prep of p.prepared) {
        check([prep.spell], `P${p.id} prepared`);
        check(prep.attached, `P${p.id} attached`);
      }
    }
    const pc = state.pendingChoice;
    if (pc && STAGED_MODES.has(pc.mode)) {
      check(pc.candidates, "pendingChoice.candidates");
      check(pc.picked ?? [], "pendingChoice.picked");
    }
    if (pc && !isTerminal(state)) {
      // Only the chooser may act, and they must be able to (no deadlock).
      if (legalActions(state, otherPlayer(pc.player)).length !== 0) {
        throw new Error(`step ${step}: non-chooser has actions during a pending choice`);
      }
      if (legalActions(state, pc.player).length === 0) {
        throw new Error(`step ${step}: chooser is deadlocked (no legal actions)`);
      }
    }
  }

  it("random playouts biased toward casts keep every zone consistent through choice chains", () => {
    for (let seed = 200; seed < 220; seed++) {
      let state = newGame(seed);
      let s = (seed * 7 + 5) | 0;
      let step = 0;
      let choicesSeen = 0;
      while (!isTerminal(state) && step < 60_000) {
        const legal = legalActions(state, state.priorityPlayer);
        expect(legal.length).toBeGreaterThan(0);
        // Bias: prefer effect-triggering actions so choice chains actually occur.
        const preferred = legal.filter((a) => a.type === "cast" || a.type === "playTrainer" || a.type === "choose");
        const pool = preferred.length > 0 ? preferred : legal;
        let idx: number;
        [idx, s] = rngInt(s, pool.length);
        state = apply(state, pool[idx] as Action).state;
        if (state.pendingChoice) choicesSeen++;
        assertZonesSane(state, ++step);
      }
      expect(state.phase).toBe("gameover");
      expect(choicesSeen, `seed ${seed} never exercised a pending choice`).toBeGreaterThan(0);
    }
  });
});
