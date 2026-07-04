/**
 * Regression tests from live play (2026-07-03):
 *  1. Wild Surge must let the PLAYER choose the discard (it auto-picked the
 *     highest-symbol card).
 *  2. The retract window must close once the caster passes — previously, after
 *     a Reaction resolved, priority returned to the caster with their spell
 *     back on top and passStreak reset, re-arming Retract. That let a player
 *     dodge a counter (or save components) after seeing the response.
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
import { pushToStack } from "../src/stack.ts";

let iid = 1;
const inst = (defId: string): CardInstance => ({ iid: iid++, defId });

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

describe("Wild Surge interactive discard (EVO-007)", () => {
  function castWildSurge(hand: string[]): GameState {
    const state = blankState();
    state.players[0].hand = hand.map(inst);
    const events: GameEvent[] = [];
    const card = inst("EVO-007");
    getEffect("EVO-007")!(makeContext(state, 0, card, events), card);
    return state;
  }

  it("pauses for the caster to pick which card to discard", () => {
    const state = castWildSurge(["CMP-V", "CMP-VSM", "CMP-VV"]);
    const pc = state.pendingChoice!;
    expect(pc).toBeTruthy();
    expect(pc.mode).toBe("discardForDamage");
    expect(pc.player).toBe(0);
    expect(pc.candidates).toHaveLength(3);
    // Only choose actions are legal while the pick is pending.
    expect(legalActions(state, 0).every((a) => a.type === "choose")).toBe(true);
    expect(legalActions(state, 1)).toHaveLength(0);
  });

  it("the pick is discarded and damage equals ITS symbols — not the best card's", () => {
    const state = castWildSurge(["CMP-V", "CMP-VSM", "CMP-VV"]);
    const single = state.pendingChoice!.candidates.find((c) => c.defId === "CMP-V")!;
    const next = apply(state, { type: "choose", iid: single.iid }).state;
    expect(next.players[1].hp).toBe(29); // 1 symbol, not the VSM's 3
    expect(next.players[0].discard.map((c) => c.defId)).toEqual(["CMP-V"]);
    expect(next.players[0].hand.map((c) => c.defId).sort()).toEqual(["CMP-VSM", "CMP-VV"]);
    expect(next.pendingChoice).toBeNull();
  });

  it("with an empty hand, nothing happens and no choice pends", () => {
    const state = castWildSurge([]);
    expect(state.pendingChoice).toBeNull();
    expect(state.players[1].hp).toBe(30);
  });
});

describe("retract window", () => {
  /** P0 with a freshly cast Fireball on the stack (holds priority, streak 0). */
  function stateWithFreshCast(): GameState {
    const s = blankState();
    s.players[0].prepared = [{ spell: inst("EVO-017"), faceDown: false, attached: [], cast: false, sealed: false }];
    const events: GameEvent[] = [];
    pushToStack(s, 0, 0, false, null, events);
    s.priorityPlayer = 0;
    s.passStreak = 0;
    return s;
  }

  it("is open right after casting", () => {
    const s = stateWithFreshCast();
    expect(s.stack[0]!.retractable).toBe(true);
    expect(legalActions(s, 0).some((a) => a.type === "retractCast")).toBe(true);
  });

  it("closes permanently once the caster passes — even if priority returns with the spell on top", () => {
    let s = stateWithFreshCast();
    s = apply(s, { type: "pass" }).state; // caster commits
    expect(s.stack[0]!.retractable).toBe(false);

    // Simulate the post-reaction return: a Reaction resolved, priority is back
    // with the caster, their spell is top of stack, passStreak reset.
    s.priorityPlayer = 0;
    s.passStreak = 0;
    expect(legalActions(s, 0).some((a) => a.type === "retractCast")).toBe(false);
    expect(() => apply(s, { type: "retractCast" })).toThrow(/committed/);
  });

  it("closes when anything else joins the stack", () => {
    const s = stateWithFreshCast();
    s.players[1].prepared = [{ spell: inst("ABJ-010"), faceDown: true, attached: [], cast: false, sealed: false }];
    const events: GameEvent[] = [];
    pushToStack(s, 1, 0, true, s.stack[0]!.sid, events);
    expect(s.stack[0]!.retractable).toBe(false);
  });
});
