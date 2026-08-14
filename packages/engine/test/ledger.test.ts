/**
 * Ledger family (2026-08-13): Warding Tithe / Sealed Verdict / Restoring Rune
 * spend the lifetime prevention total that Reckoning reads — the first (and
 * only) decrementers of damagePreventedTotal. These tests pin the spend
 * semantics, the sub-minimum whiff guards, and that Reckoning reads whatever
 * the spenders leave behind.
 */
import { describe, expect, it } from "vitest";
import {
  apply,
  getEffect,
  legalActions,
  makeContext,
  type CardInstance,
  type GameEvent,
  type GameState,
  type PlayerId,
  type PlayerState,
} from "../src/index.ts";

function blankPlayer(id: PlayerId): PlayerState {
  return {
    id,
    hp: 30,
    level: 1,
    resourceDeck: [],
    spellbook: [],
    hand: [],
    prepared: [],
    discard: [],
    wards: [],
    burn: 0,
    prophecies: [],
    reshuffles: 0,
    ongoing: [],
    reactionsCastThisRound: 0,
    damagePreventedThisRound: 0,
    gambitPlayedThisTurn: false,
    prepareDone: false,
    replacementsThisRound: 0,
    slotsUsedThisRound: 0,
    spellsCastThisRound: 0,
    damageHealedThisRound: 0,
    turnsTakenThisRound: 0,
    componentPlayedThisTurn: false,
    spellCastThisTurn: false,
    extraCastsThisTurn: 0,
    nextSpellBonus: 0,
    noCastThisTurn: false,
  };
}

function blankState(): GameState {
  return {
    seed: 1,
    rngState: 12345,
    round: 1,
    turnCount: 1,
    startingPlayer: 0,
    activePlayer: 0,
    priorityPlayer: 0,
    passStreak: 0,
    stack: [],
    phase: "main",
    players: [blankPlayer(0), blankPlayer(1)],
    nextIid: 1000,
    winner: null,
    endReason: null,
    pendingChoice: null,
    finalTurnFor: null,
  };
}

let iid = 1;
const inst = (defId: string): CardInstance => ({ iid: iid++, defId });

/** Run a registered effect as player 0 against a customized blank state. */
function cast(id: string, setup?: (s: GameState) => void): GameState {
  const state = blankState();
  setup?.(state);
  const events: GameEvent[] = [];
  const card = inst(id);
  const fn = getEffect(id);
  expect(fn, `effect ${id} should be registered`).toBeTruthy();
  fn!(makeContext(state, 0, card, events), card);
  return state;
}

describe("ledger family — spending the Reckoning bank", () => {
  it("Warding Tithe spends up to 4 and builds a ward that big", () => {
    const s = cast("ABJ-046", (st) => (st.players[0].damagePreventedTotal = 10));
    expect(s.players[0].wards).toHaveLength(1);
    expect(s.players[0].wards[0]!.hp).toBe(4);
    expect(s.players[0].damagePreventedTotal).toBe(6);
  });

  it("Warding Tithe with a small bank spends what exists", () => {
    const s = cast("ABJ-046", (st) => (st.players[0].damagePreventedTotal = 3));
    expect(s.players[0].wards[0]!.hp).toBe(3);
    expect(s.players[0].damagePreventedTotal).toBe(0);
  });

  it("Restoring Rune heals half of what it spends, rounded down", () => {
    const s = cast("ABJ-048", (st) => {
      st.players[0].hp = 20;
      st.players[0].damagePreventedTotal = 5;
    });
    expect(s.players[0].hp).toBe(22); // spent 5, healed floor(5/2)
    expect(s.players[0].damagePreventedTotal).toBe(0);
  });

  it("Reckoning reads whatever the spenders leave behind", () => {
    const s = cast("ABJ-046", (st) => (st.players[0].damagePreventedTotal = 10));
    const events: GameEvent[] = [];
    const card = inst("ABJ-032");
    getEffect("ABJ-032")!(makeContext(s, 0, card, events), card);
    expect(s.players[1].hp).toBe(27); // ceil(6/2) = 3, not ceil(10/2)
  });

  it("sub-minimum ledger casts are not offered and apply refuses them", () => {
    const s = blankState();
    s.players[0].prepared = [
      { spell: inst("ABJ-046"), faceDown: false, attached: [inst("CMP-S")], cast: false, sealed: false },
    ];
    // Bank 0: fully funded Tithe is still not castable (deterministic whiff).
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(false);
    expect(() => apply(s, { type: "cast", preparedIndex: 0 })).toThrow(/ledger/);
    // Bank 1: offered.
    s.players[0].damagePreventedTotal = 1;
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(true);
  });

  it("Sealed Verdict needs bank 6: gated in the window, cancels and spends when live", () => {
    const mk = (bank: number): GameState => {
      const s = blankState();
      s.players[0].level = 10; // past Verdict's L2 tier gate
      s.players[1].level = 10;
      s.players[0].damagePreventedTotal = bank;
      s.players[0].prepared = [
        { spell: inst("ABJ-047"), faceDown: true, attached: [inst("CMP-S")], cast: false, sealed: false },
      ];
      s.players[1].prepared = [
        { spell: inst("EVO-017"), faceDown: false, attached: [inst("CMP-VV")], cast: false, sealed: false },
      ];
      s.activePlayer = 1;
      s.priorityPlayer = 1;
      const t = apply(s, { type: "cast", preparedIndex: 0 }).state; // Fireball tops
      return apply(t, { type: "pass" }).state; // P0's window
    };
    const dry = mk(5);
    expect(legalActions(dry, 0).some((a) => a.type === "castReaction")).toBe(false);
    expect(() => apply(dry, { type: "castReaction", preparedIndex: 0 })).toThrow(/ledger/);

    let live = mk(8);
    expect(legalActions(live, 0).some((a) => a.type === "castReaction")).toBe(true);
    live = apply(live, { type: "castReaction", preparedIndex: 0 }).state; // Verdict on the stack
    live = apply(live, { type: "pass" }).state; // P1 passes — Verdict resolves, then Fireball
    live = apply(live, { type: "pass" }).state;
    live = apply(live, { type: "pass" }).state;
    live = apply(live, { type: "pass" }).state;
    expect(live.players[0].damagePreventedTotal).toBe(2); // spent exactly 6
    expect(live.players[0].hp).toBe(30); // Fireball was cancelled
  });
});
