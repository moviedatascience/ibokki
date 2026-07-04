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
  createGame,
  deckFor,
  getEffect,
  legalActions,
  makeContext,
  tierForLevel,
  type CardInstance,
  type GameEvent,
  type GameState,
  type PlayerId,
  type PlayerState,
} from "../src/index.ts";
import { pushToStack, resolveTop } from "../src/stack.ts";
import { beginTurn, endRoundAndLevelUp } from "../src/mechanics.ts";

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

describe("Overclock (GAM-008) — one extra cast this turn (playtest m9 regression)", () => {
  function armed(): GameState {
    const s = blankState();
    const p = s.players[0];
    p.hand = [inst("GAM-008")];
    p.prepared = [
      { spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false },
      { spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false },
    ];
    return s;
  }
  /** Cast prepared[i] and resolve it (caster passes, opponent passes). */
  const castResolve = (s: GameState, i: number): GameState => {
    let st = apply(s, { type: "cast", preparedIndex: i }).state;
    st = apply(st, { type: "pass" }).state;
    return apply(st, { type: "pass" }).state;
  };

  it("was a no-op when played BEFORE the first cast — now the second cast is offered", () => {
    let s = armed();
    s = apply(s, { type: "playTrainer", handIid: s.players[0].hand[0]!.iid }).state;
    expect(s.players[0].extraCastsThisTurn).toBe(1);
    s = castResolve(s, 0);
    // The old grantExtraCast refunded a slot and left the turn gate shut: no cast here.
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(true);
    s = castResolve(s, 1);
    expect(s.players[0].slotsUsedThisRound).toBe(2); // extra cast still CONSUMES a slot per text
    expect(s.players[0].extraCastsThisTurn).toBe(0);
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(false); // and no third
  });

  it("retracting the extra cast refunds the Overclock grant, not the base cast", () => {
    let s = armed();
    s = apply(s, { type: "playTrainer", handIid: s.players[0].hand[0]!.iid }).state;
    s = castResolve(s, 0);
    s = apply(s, { type: "cast", preparedIndex: 1 }).state;
    s = apply(s, { type: "retractCast" }).state;
    expect(s.players[0].extraCastsThisTurn).toBe(1); // grant back
    expect(s.players[0].spellCastThisTurn).toBe(true); // first cast still counts
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(true); // may recast
  });
});

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

describe("Recharge interactive search (GAM-004)", () => {
  function playRecharge(deck: string[]): { state: GameState; events: GameEvent[] } {
    const state = blankState();
    state.players[0].resourceDeck = deck.map(inst);
    const events: GameEvent[] = [];
    const card = inst("GAM-004");
    getEffect("GAM-004")!(makeContext(state, 0, card, events), card);
    return { state, events };
  }

  it("offers ONLY same-symbol duals from the deck as candidates", () => {
    const { state } = playRecharge(["CMP-V", "CMP-VV", "CMP-VS", "CMP-SS", "CMP-M", "CMP-VSM"]);
    const pc = state.pendingChoice!;
    expect(pc).toBeTruthy();
    expect(pc.mode).toBe("takeToHand");
    expect(pc.candidates.map((c) => c.defId).sort()).toEqual(["CMP-SS", "CMP-VV"]); // no basics, cross-duals or tris
  });

  it("the PLAYER'S pick goes to hand (not the engine's pick) and the deck reshuffles", () => {
    const { state } = playRecharge(["CMP-V", "CMP-VV", "CMP-SS", "CMP-M"]);
    const ss = state.pendingChoice!.candidates.find((c) => c.defId === "CMP-SS")!;
    const { state: next, events } = apply(state, { type: "choose", iid: ss.iid });
    expect(next.players[0].hand.map((c) => c.defId)).toEqual(["CMP-SS"]);
    expect(next.pendingChoice).toBeNull();
    // Unpicked dual returns to the deck; nothing was lost.
    expect(next.players[0].resourceDeck.map((c) => c.defId).sort()).toEqual(["CMP-M", "CMP-V", "CMP-VV"]);
    expect(next.rngState).not.toBe(state.rngState); // the search shuffled
    // The pick is REVEALED (public event), unlike private loot picks.
    expect(events.some((e) => e.type === "tutored" && e.defId === "CMP-SS")).toBe(true);
  });

  it("with no duals in the deck, no choice pends and the deck still shuffles", () => {
    const { state, events } = playRecharge(["CMP-V", "CMP-VS", "CMP-M"]);
    expect(state.pendingChoice).toBeNull();
    expect(state.players[0].resourceDeck).toHaveLength(3);
    expect(events.some((e) => e.type === "searched" && e.count === 0)).toBe(true);
  });
});

describe("Battle Trance buffs ONE spell, THIS turn (GAM-010) — live-match regression", () => {
  const play = (s: GameState, id: string, events: GameEvent[]) => {
    const card = inst(id);
    getEffect(id)!(makeContext(s, 0, card, events), card);
  };
  /** Cast + resolve `spellId` for P0 through the real stack. */
  const castAndResolve = (s: GameState, spellId: string, events: GameEvent[]) => {
    s.players[0].prepared.push({ spell: inst(spellId), faceDown: false, attached: [], cast: false, sealed: false });
    pushToStack(s, 0, s.players[0].prepared.length - 1, false, null, events);
    resolveTop(s, events);
  };

  it("the +3 rides only the next cast; later spells get Catalyst's +1 alone", () => {
    const s = blankState();
    const events: GameEvent[] = [];
    play(s, "EVO-005", events); // Catalyst: +1 all round (correct, unchanged)
    play(s, "GAM-010", events); // Battle Trance: -2 HP, +3 on the NEXT spell this turn
    expect(s.players[0].hp).toBe(28);
    expect(s.players[0].nextSpellBonus).toBe(3);

    castAndResolve(s, "EVO-004", events); // Searing Word, base 2
    expect(s.players[1].hp).toBe(30 - (2 + 1 + 3)); // 24 — Trance consumed here
    expect(s.players[0].nextSpellBonus).toBe(0);

    castAndResolve(s, "EVO-009", events); // Battery, base 2 — the fatal 6 from the match log
    expect(s.players[1].hp).toBe(24 - (2 + 1)); // 21 — Catalyst only, NO stale +3
  });

  it("an unspent bonus dies at the turn boundary", () => {
    const s = blankState();
    const events: GameEvent[] = [];
    // Cards in both decks so beginTurn's draw can't trigger exhaustion noise.
    s.players[0].resourceDeck = ["CMP-V", "CMP-V"].map(inst);
    s.players[1].resourceDeck = ["CMP-V", "CMP-V"].map(inst);
    play(s, "GAM-010", events);
    expect(s.players[0].nextSpellBonus).toBe(3);
    s.activePlayer = 1;
    beginTurn(s, events); // P0's turn ended without casting — the buff is wasted
    expect(s.players[0].nextSpellBonus).toBe(0);
  });

  it("retracting returns the unspent bonus with the cast", () => {
    const s = blankState();
    const events: GameEvent[] = [];
    play(s, "GAM-010", events);
    s.players[0].prepared = [{ spell: inst("EVO-004"), faceDown: true, attached: [], cast: false, sealed: false }];
    pushToStack(s, 0, 0, false, null, events);
    expect(s.players[0].nextSpellBonus).toBe(0); // consumed by the cast
    const next = apply(s, { type: "retractCast" }).state;
    expect(next.players[0].nextSpellBonus).toBe(3); // back with the take-back
  });
});

describe("auto-resolve conversions (2026-07 sweep)", () => {
  function play(id: string, setup: (s: GameState) => void): { state: GameState; events: GameEvent[] } {
    const state = blankState();
    setup(state);
    const events: GameEvent[] = [];
    const card = inst(id);
    getEffect(id)!(makeContext(state, 0, card, events), card);
    return { state, events };
  }
  const choose = (s: GameState, defId: string): GameState => {
    const c = s.pendingChoice!.candidates.find((x) => x.defId === defId)!;
    return apply(s, { type: "choose", iid: c.iid }).state;
  };

  it("Omen (DIV-012): all four shown, only M-carrying cards pickable, rest to bottom", () => {
    const { state } = play("DIV-012", (s) => {
      s.players[0].resourceDeck = ["CMP-S", "CMP-V", "CMP-M", "CMP-VM", "CMP-SS"].map(inst); // top 4 = V,M,VM,SS
    });
    const pc = state.pendingChoice!;
    expect(pc.candidates).toHaveLength(4); // you LOOKED at all four
    const pickable = legalActions(state, 0).filter((a) => a.type === "choose");
    expect(pickable).toHaveLength(2); // CMP-M and CMP-VM only
    expect(legalActions(state, 0).some((a) => a.type === "pass")).toBe(false); // not optional
    const next = choose(state, "CMP-VM");
    expect(next.players[0].hand.map((c) => c.defId)).toEqual(["CMP-VM"]);
    expect(next.players[0].resourceDeck).toHaveLength(4); // 1 untouched + 3 to the bottom
    expect(next.pendingChoice).toBeNull();
  });

  it("Omen with no M in the top cards: no pause, all to the bottom", () => {
    const { state } = play("DIV-012", (s) => {
      s.players[0].resourceDeck = ["CMP-V", "CMP-S", "CMP-VS", "CMP-VV"].map(inst);
    });
    expect(state.pendingChoice).toBeNull();
    expect(state.players[0].resourceDeck).toHaveLength(4);
  });

  it("Seek (DIV-016): components only — trainers in the deck are not offered", () => {
    const { state } = play("DIV-016", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("GAM-001"), inst("CMP-MM")];
    });
    expect(state.pendingChoice!.candidates.map((c) => c.defId).sort()).toEqual(["CMP-MM", "CMP-V"]);
  });

  it("Premeditate (DIV-033): 'up to 2' — Done ends the choice after one pick", () => {
    const { state } = play("DIV-033", (s) => {
      s.players[0].resourceDeck = ["CMP-V", "CMP-S", "CMP-M"].map(inst);
    });
    let s = choose(state, "CMP-M");
    expect(s.pendingChoice, "second pick still open").toBeTruthy();
    expect(legalActions(s, 0).some((a) => a.type === "pass")).toBe(true);
    s = apply(s, { type: "pass" }).state; // Done — decline the second
    expect(s.pendingChoice).toBeNull();
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-M"]);
    expect(s.players[0].resourceDeck).toHaveLength(2); // leftovers returned + shuffled
  });

  it("Grand Design (DIV-042): 'any card' — trainers are searchable too", () => {
    const { state } = play("DIV-042", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("GAM-001")];
    });
    expect(state.pendingChoice!.candidates.map((c) => c.defId).sort()).toEqual(["CMP-V", "GAM-001"]);
  });

  it("Index (DIV-022): the player orders the top five — first pick ends topmost", () => {
    const { state } = play("DIV-022", (s) => {
      s.players[0].resourceDeck = ["CMP-V", "CMP-S", "CMP-M", "CMP-VV", "CMP-SS", "CMP-MM"].map(inst);
    });
    expect(state.pendingChoice!.candidates).toHaveLength(5);
    let s = state;
    for (const pick of ["CMP-MM", "CMP-S", "CMP-M", "CMP-VV", "CMP-SS"]) s = choose(s, pick);
    expect(s.pendingChoice).toBeNull();
    const deck = s.players[0].resourceDeck.map((c) => c.defId);
    // Bottom card untouched; picks land first-pick-topmost (top = end of array).
    expect(deck).toEqual(["CMP-V", "CMP-SS", "CMP-VV", "CMP-M", "CMP-S", "CMP-MM"]);
  });

  it("Disarm (GAM-020): reveals the hand, only components pickable, may decline", () => {
    const setup = (s: GameState) => {
      s.players[1].hand = [inst("CMP-VV"), inst("GAM-001")];
      s.players[1].resourceDeck = [inst("CMP-V")];
    };
    // Decline: pass leaves their hand untouched.
    const declined = play("GAM-020", setup).state;
    expect(declined.pendingChoice!.candidates).toHaveLength(2); // whole hand revealed
    expect(legalActions(declined, 0).filter((a) => a.type === "choose")).toHaveLength(1); // the component
    const after = apply(declined, { type: "pass" }).state;
    expect(after.players[1].hand).toHaveLength(2);

    // Pick: the component goes on top of ITS OWNER'S deck.
    const picked = choose(play("GAM-020", setup).state, "CMP-VV");
    expect(picked.players[1].hand.map((c) => c.defId)).toEqual(["GAM-001"]);
    expect(picked.players[1].resourceDeck.map((c) => c.defId)).toEqual(["CMP-V", "CMP-VV"]); // top = end
  });

  it("Far Sight (DIV-023): sting lands, caster sees opp top 3, may mill ONE or decline", () => {
    const setup = (s: GameState) => {
      // top = end of array: top 3 are CMP-S, CMP-M, CMP-VV (VV topmost)
      s.players[1].resourceDeck = ["CMP-V", "CMP-S", "CMP-M", "CMP-VV"].map(inst);
    };
    const { state } = play("DIV-023", setup);
    expect(state.players[1].hp).toBe(29); // the 1 damage is immediate
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("millFromTop");
    expect(pc.candidates.map((c) => c.defId)).toEqual(["CMP-S", "CMP-M", "CMP-VV"]);
    expect(legalActions(state, 0).some((a) => a.type === "pass")).toBe(true); // "you MAY"

    // Decline: everything returns to the opponent's deck top in original order.
    const declined = apply(state, { type: "pass" }).state;
    expect(declined.pendingChoice).toBeNull();
    expect(declined.players[1].resourceDeck.map((c) => c.defId)).toEqual(["CMP-V", "CMP-S", "CMP-M", "CMP-VV"]);
    expect(declined.players[1].discard).toHaveLength(0);

    // Pick: the chosen card goes to THEIR discard, the rest back on top in order.
    const milled = choose(play("DIV-023", setup).state, "CMP-M");
    expect(milled.players[1].discard.map((c) => c.defId)).toEqual(["CMP-M"]);
    expect(milled.players[1].resourceDeck.map((c) => c.defId)).toEqual(["CMP-V", "CMP-S", "CMP-VV"]);
    expect(milled.pendingChoice).toBeNull();
  });

  it("Far Sight with an empty opponent deck: damage only, no pause", () => {
    const { state } = play("DIV-023", (s) => {
      s.players[1].resourceDeck = [];
    });
    expect(state.players[1].hp).toBe(29);
    expect(state.pendingChoice).toBeNull();
  });

  it("Foretell (DIV-011): reveals the opponent's hand — nothing pickable, nothing moves", () => {
    const { state } = play("DIV-011", (s) => {
      s.players[1].hand = [inst("CMP-V"), inst("GAM-001")];
    });
    expect(state.players[1].hp).toBe(28); // the 2 damage landed
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("reveal");
    expect(pc.candidates.map((c) => c.defId)).toEqual(["CMP-V", "GAM-001"]);
    const legal = legalActions(state, 0);
    expect(legal.every((a) => a.type === "pass")).toBe(true); // information only: Done is the only action
    const after = apply(state, { type: "pass" }).state;
    expect(after.pendingChoice).toBeNull();
    expect(after.players[1].hand).toHaveLength(2); // untouched
  });

  it("Perfect Information (DIV-031): reveals hand AND their top 3 without moving them", () => {
    const { state } = play("DIV-031", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-V"), inst("CMP-V")]; // fuel the draw 2
      s.players[1].hand = [inst("GAM-001")];
      s.players[1].resourceDeck = ["CMP-S", "CMP-M", "CMP-SS", "CMP-MM"].map(inst); // top 3 = M, SS, MM
    });
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("reveal");
    expect(pc.candidates.map((c) => c.defId)).toEqual(["GAM-001", "CMP-M", "CMP-SS", "CMP-MM"]);
    const after = apply(state, { type: "pass" }).state;
    expect(after.players[1].resourceDeck).toHaveLength(4); // deck untouched
    expect(after.players[1].hand).toHaveLength(1);
  });

  it("Alchemy (DIV-018): discard ANY NUMBER of your choice, then draw that many", () => {
    const { state } = play("DIV-018", (s) => {
      s.players[0].hand = ["CMP-V", "CMP-S", "CMP-M"].map(inst);
      s.players[0].resourceDeck = [inst("CMP-VV"), inst("CMP-SS")]; // top = SS
    });
    expect(state.pendingChoice!.mode).toBe("discardThenDraw");
    let s = choose(state, "CMP-V");
    s = choose(s, "CMP-M");
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-S"]); // draws NOT yet dealt
    s = apply(s, { type: "pass" }).state; // done — stop at two
    expect(s.pendingChoice).toBeNull();
    expect(s.players[0].discard.map((c) => c.defId)).toEqual(["CMP-V", "CMP-M"]);
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-S", "CMP-SS", "CMP-VV"]); // drew exactly 2
  });

  it("Mind Theft (DIV-039): the CASTER picks which card the opponent discards", () => {
    const { state } = play("DIV-039", (s) => {
      s.players[1].hand = ["CMP-VV", "GAM-001", "CMP-M"].map(inst);
    });
    expect(state.pendingChoice!.mode).toBe("discardFromOpponentHand");
    expect(legalActions(state, 0).some((a) => a.type === "pass")).toBe(false); // "choose a card" — mandatory
    const after = choose(state, "GAM-001");
    expect(after.players[1].discard.map((c) => c.defId)).toEqual(["GAM-001"]);
    expect(after.players[1].hand.map((c) => c.defId)).toEqual(["CMP-VV", "CMP-M"]);
  });

  it("Mind Theft vs Iron Will: no choice, no discard", () => {
    const { state } = play("DIV-039", (s) => {
      s.players[1].hand = [inst("CMP-VV")];
      s.players[1].ongoing.push({ id: 1, owner: 1, kind: "cannotBeForcedToDiscard", value: 1, expiry: "endOfRound" });
    });
    expect(state.pendingChoice).toBeNull();
    expect(state.players[1].hand).toHaveLength(1);
  });

  it("Mnemonic Charm (ITM-006): pick a discard COMPONENT — it goes to your deck TOP", () => {
    const { state } = play("ITM-006", (s) => {
      s.players[0].discard = ["GAM-001", "CMP-VV", "CMP-M"].map(inst);
      s.players[0].resourceDeck = [inst("CMP-V")];
    });
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("discardToDeckTop");
    expect(pc.candidates.map((c) => c.defId)).toEqual(["CMP-VV", "CMP-M"]); // trainers not offered
    const after = choose(state, "CMP-M");
    expect(after.players[0].resourceDeck.map((c) => c.defId)).toEqual(["CMP-V", "CMP-M"]); // top = end
    expect(after.players[0].discard.map((c) => c.defId)).toEqual(["GAM-001", "CMP-VV"]);
  });

  it("Calculated Draw (DIV-029): pick ANY deck card; the rest keep their order, then draw 2", () => {
    const { state } = play("DIV-029", (s) => {
      s.players[0].resourceDeck = ["CMP-V", "CMP-S", "CMP-M", "CMP-VV"].map(inst); // top = VV
    });
    expect(state.pendingChoice!.candidates).toHaveLength(4); // the WHOLE deck is searchable
    const after = choose(state, "CMP-S");
    expect(after.pendingChoice).toBeNull();
    // Took CMP-S, leftovers [V, M, VV] kept order, then drew 2 off the top (VV, M).
    expect(after.players[0].hand.map((c) => c.defId)).toEqual(["CMP-S", "CMP-VV", "CMP-M"]);
    expect(after.players[0].resourceDeck.map((c) => c.defId)).toEqual(["CMP-V"]);
  });

  it("Reclaim (DIV-015): return UP TO 2 discard components of your choice to hand", () => {
    const { state } = play("DIV-015", (s) => {
      s.players[0].discard = ["CMP-V", "GAM-001", "CMP-SS", "CMP-M"].map(inst);
    });
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("discardToHand");
    expect(pc.candidates.map((c) => c.defId)).toEqual(["CMP-V", "CMP-SS", "CMP-M"]); // components only
    let s = choose(state, "CMP-SS");
    expect(legalActions(s, 0).some((a) => a.type === "pass")).toBe(true); // "up to 2" — may stop
    s = apply(s, { type: "pass" }).state;
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-SS"]);
    expect(s.players[0].discard.map((c) => c.defId)).toEqual(["CMP-V", "GAM-001", "CMP-M"]);
  });

  it("Calculated Draw with an empty deck: just the draws (exhaustion path)", () => {
    const { state } = play("DIV-029", (s) => {
      s.players[0].resourceDeck = [];
      s.players[0].discard = [inst("CMP-V")]; // reshuffle fodder
    });
    expect(state.pendingChoice).toBeNull(); // nothing to search — drew straight through
  });

  it("Mentor's Guidance (GAM-003): YOUR discard, then search for ANY one card", () => {
    const { state } = play("GAM-003", (s) => {
      s.players[0].hand = [inst("CMP-V"), inst("GAM-001")];
      s.players[0].resourceDeck = [inst("CMP-M"), inst("ITM-001")];
    });
    expect(state.pendingChoice!.mode).toBe("discardForSearch");
    let s = choose(state, "GAM-001"); // the PLAYER picks the discard (was random)
    expect(s.players[0].discard.map((c) => c.defId)).toEqual(["GAM-001"]);
    // The follow-up search offers the ENTIRE deck (was components-only).
    expect(s.pendingChoice!.mode).toBe("takeToHand");
    expect(s.pendingChoice!.candidates.map((c) => c.defId).sort()).toEqual(["CMP-M", "ITM-001"]);
    s = choose(s, "ITM-001");
    expect(s.players[0].hand.map((c) => c.defId).sort()).toEqual(["CMP-V", "ITM-001"]);
    expect(s.pendingChoice).toBeNull();
  });

  it("Mentor's Guidance with an empty hand skips straight to the search", () => {
    const { state } = play("GAM-003", (s) => {
      s.players[0].resourceDeck = [inst("CMP-M")];
    });
    expect(state.pendingChoice!.mode).toBe("takeToHand");
  });
});

describe("Volatile Bolt attach-trap (EVO-015)", () => {
  /** P1 active with an M in hand and a prepared spell to attach to; P0 holds the Bolt. */
  function trapState(boltAttached: string[], handDef = "CMP-M"): GameState {
    const s = blankState();
    s.players[0].prepared = [{ spell: inst("EVO-015"), faceDown: true, attached: boltAttached.map(inst), cast: false, sealed: false }];
    s.players[1].prepared = [{ spell: inst("EVO-001"), faceDown: true, attached: [], cast: false, sealed: false }];
    s.players[1].hand = [inst(handDef)];
    s.activePlayer = 1;
    s.priorityPlayer = 1;
    return s;
  }
  const attach = (s: GameState) =>
    apply(s, { type: "attach", preparedIndex: 0, handIid: s.players[1].hand[0]!.iid }, 1);

  it("fires automatically when the opponent attaches an M — spent like a cast", () => {
    const { state: s, events } = attach(trapState(["CMP-V"]));
    expect(s.players[1].hp).toBe(28); // stung for 2
    const bolt = s.players[0].prepared[0]!;
    expect(bolt.cast).toBe(true); // spent
    expect(bolt.faceDown).toBe(false); // revealed
    expect(bolt.attached).toHaveLength(0); // fuel discarded
    expect(s.players[0].discard.map((c) => c.defId)).toEqual(["CMP-V"]);
    expect(events.some((e) => e.type === "reactionCast" && e.spellDefId === "EVO-015")).toBe(true);
  });

  it("stays silent for non-M attaches and while unfueled", () => {
    expect(attach(trapState(["CMP-V"], "CMP-S")).state.players[1].hp).toBe(30); // S attach — no trigger
    const unfueled = attach(trapState([]));
    expect(unfueled.state.players[1].hp).toBe(30); // no V attached — not armed
    expect(unfueled.state.players[0].prepared[0]!.cast).toBe(false); // still lying in wait
  });

  it("is never offered as a castable reaction in a window", () => {
    const s = blankState();
    s.players[0].prepared = [{ spell: inst("EVO-015"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false }];
    s.players[1].prepared = [{ spell: inst("EVO-001"), faceDown: false, attached: [inst("CMP-V")], cast: false, sealed: false }];
    s.activePlayer = 1;
    s.priorityPlayer = 1;
    let t = apply(s, { type: "cast", preparedIndex: 0 }).state;
    t = apply(t, { type: "pass" }).state; // reaction window for P0
    expect(legalActions(t, 0).some((a) => a.type === "castReaction")).toBe(false);
  });
});

describe("round leader alternates (ruling 2026-07-03)", () => {
  it("the coin-flip winner leads round 1; the other player leads round 2", () => {
    let s = createGame({ seed: 3, players: [deckFor("Evocation"), deckFor("Evocation")] });
    const first = s.startingPlayer;
    expect(s.priorityPlayer).toBe(first); // round 1 lead
    // Fast-forward: both done preparing, then force the round to end.
    s = apply(s, { type: "donePreparing" }, 0).state;
    s = apply(s, { type: "donePreparing" }, 1).state;
    expect(s.activePlayer).toBe(first);
    const events: GameEvent[] = [];
    endRoundAndLevelUp(s, events);
    expect(s.round).toBe(2);
    expect(s.priorityPlayer).toBe((first ^ 1) as PlayerId); // round 2: the OTHER wizard leads
    s = apply(s, { type: "donePreparing" }, 0).state;
    s = apply(s, { type: "donePreparing" }, 1).state;
    expect(s.activePlayer).toBe((first ^ 1) as PlayerId);
  });
});

describe("Divination early-game buffs (2026-07-04)", () => {
  it("Foretell (DIV-011) deals 2", () => {
    const s = blankState();
    const events: GameEvent[] = [];
    const card = inst("DIV-011");
    getEffect("DIV-011")!(makeContext(s, 0, card, events), card);
    expect(s.players[1].hp).toBe(28);
  });

  it("Anticipate (DIV-014) draws 1 and stings for 1", () => {
    const s = blankState();
    s.players[0].resourceDeck = [inst("CMP-M")];
    const events: GameEvent[] = [];
    const card = inst("DIV-014");
    getEffect("DIV-014")!(makeContext(s, 0, card, events), card);
    expect(s.players[0].hand).toHaveLength(1);
    expect(s.players[1].hp).toBe(29);
  });
});

describe("bonus swap on tier-up rounds (ruling 2026-07-04)", () => {
  function prepState(level: number): GameState {
    const s = blankState();
    s.phase = "prepare";
    const p = s.players[0];
    p.level = level;
    const tier = tierForLevel(level);
    for (let i = 0; i < tier.prepared; i++) {
      p.prepared.push({ spell: inst("EVO-001"), faceDown: true, attached: [], cast: false, sealed: false });
    }
    p.spellbook = [inst("EVO-002"), inst("EVO-003"), inst("EVO-004")];
    return s;
  }

  it("L5 (new spell tier) allows two replacements; L4/L6 allow one", () => {
    // Two swaps at L5.
    let s = prepState(5);
    const swap = () => {
      const a = legalActions(s, 0).find((x) => x.type === "replacePrepared");
      expect(a, "a replacement should be offered").toBeTruthy();
      s = apply(s, a!, 0).state;
    };
    swap();
    swap();
    expect(legalActions(s, 0).some((x) => x.type === "replacePrepared")).toBe(false); // limit reached

    // Only one at a non-tier-up level.
    s = prepState(6);
    swap();
    expect(legalActions(s, 0).some((x) => x.type === "replacePrepared")).toBe(false);
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
