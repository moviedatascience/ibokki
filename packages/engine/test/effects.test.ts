import { describe, expect, it } from "vitest";
import {
  apply,
  discountCostS,
  getEffect,
  legalActions,
  makeContext,
  type Action,
  type CardInstance,
  type GameEvent,
  type GameState,
  type PlayerId,
  type PlayerState,
  type StackItem,
} from "../src/index.ts";
import { endRoundAndLevelUp } from "../src/mechanics.ts";
import { drawN } from "../src/state-ops.ts";

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
function inst(defId: string): CardInstance {
  return { iid: iid++, defId };
}

/** Run a registered effect as player 0 against a (possibly customized) blank state. */
function cast(id: string, setup?: (s: GameState) => void): { state: GameState; events: GameEvent[] } {
  const state = blankState();
  setup?.(state);
  const events: GameEvent[] = [];
  const card = inst(id);
  const fn = getEffect(id);
  expect(fn, `effect ${id} should be registered`).toBeTruthy();
  fn!(makeContext(state, 0, card, events), card);
  return { state, events };
}

describe("Evocation effects", () => {
  it("Fireball (EVO-017) deals 5", () => {
    const { state } = cast("EVO-017");
    expect(state.players[1].hp).toBe(25);
  });

  it("Spark (EVO-001) deals 2", () => {
    expect(cast("EVO-001").state.players[1].hp).toBe(28);
  });

  it("Burning Hands (EVO-003) deals 1 and applies a Burn marker", () => {
    const { state } = cast("EVO-003");
    expect(state.players[1].hp).toBe(29);
    expect(state.players[1].burn).toBe(1);
  });

  it("Catalyst (EVO-005) buffs the next damaging spell this round", () => {
    const state = blankState();
    const events: GameEvent[] = [];
    const catalyst = inst("EVO-005");
    getEffect("EVO-005")!(makeContext(state, 0, catalyst, events), catalyst);
    const fireball = inst("EVO-017");
    getEffect("EVO-017")!(makeContext(state, 0, fireball, events), fireball);
    expect(state.players[1].hp).toBe(30 - 6); // 5 + 1 buff
  });

  it("Voltaic Overload (EVO-039) costs 3 self HP to deal 8", () => {
    const { state } = cast("EVO-039");
    expect(state.players[0].hp).toBe(27);
    expect(state.players[1].hp).toBe(22);
  });

  it("Maelstrom (EVO-027) scales with the opponent's Burn", () => {
    const { state } = cast("EVO-027", (s) => {
      s.players[1].burn = 3;
    });
    expect(state.players[1].hp).toBe(30 - (2 + 3));
  });

  it("Detonate (EVO-021) discards the hand and deals 2 per card", () => {
    const { state } = cast("EVO-021", (s) => {
      s.players[0].hand = [inst("CMP-V"), inst("CMP-V"), inst("CMP-S")];
    });
    expect(state.players[0].hand).toHaveLength(0);
    expect(state.players[1].hp).toBe(30 - 6);
  });

  it("Sunburst (EVO-040) destroys all wards and deals their total HP", () => {
    const { state } = cast("EVO-040", (s) => {
      s.players[1].wards = [
        { wid: 1, hp: 3 },
        { wid: 2, hp: 2 },
      ];
    });
    expect(state.players[1].wards).toHaveLength(0);
    expect(state.players[1].hp).toBe(30 - 5);
  });

  it("Chain Lightning (EVO-033) deals 4 (ward-soaked) then 2 to each remaining ward", () => {
    const { state } = cast("EVO-033", (s) => {
      s.players[1].wards = [
        { wid: 1, hp: 2 },
        { wid: 2, hp: 3 },
      ];
    });
    // 4 to opponent soaks the wards (2hp ward dies, 3hp -> 1, 0 overflow to face);
    // then "2 to each ward" finishes the last ward. Wards protect the wizard fully here.
    expect(state.players[1].hp).toBe(30);
    expect(state.players[1].wards).toHaveLength(0);
  });

  it("Ember Storm (EVO-025) scales with the opponent's attached components", () => {
    const { state } = cast("EVO-025", (s) => {
      s.players[1].prepared = [
        { spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-V"), inst("CMP-V")], cast: false, sealed: false },
        { spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-S")], cast: false, sealed: false },
      ];
    });
    expect(state.players[1].hp).toBe(27); // 3 attached components
  });
});

describe("Divination effects", () => {
  it("Insight (DIV-001) draws two cards (2026-07 buff)", () => {
    const { state } = cast("DIV-001", (s) => {
      s.players[0].resourceDeck = [inst("CMP-M"), inst("CMP-M"), inst("CMP-M")];
    });
    expect(state.players[0].hand).toHaveLength(2);
    expect(state.players[0].resourceDeck).toHaveLength(1);
  });

  it("Premonition (DIV-005) draws two, plus a third if either is multi-symbol", () => {
    const hit = cast("DIV-005", (s) => {
      s.players[0].resourceDeck = [inst("CMP-M"), inst("CMP-VV"), inst("CMP-V")]; // top two: V, VV
    });
    expect(hit.state.players[0].hand).toHaveLength(3); // VV triggers the bonus

    const miss = cast("DIV-005", (s) => {
      s.players[0].resourceDeck = [inst("CMP-M"), inst("CMP-S"), inst("CMP-V")];
    });
    expect(miss.state.players[0].hand).toHaveLength(2); // singles only — no bonus
  });

  it("Foreclosure (DIV-020) mills the opponent for 2", () => {
    const { state } = cast("DIV-020", (s) => {
      s.players[1].resourceDeck = [inst("CMP-V"), inst("CMP-V"), inst("CMP-V")];
    });
    expect(state.players[1].resourceDeck).toHaveLength(1);
    expect(state.players[1].discard).toHaveLength(2);
  });

  it("Recover (DIV-006) pauses for the player to pick the discard component", () => {
    const { state } = cast("DIV-006", (s) => {
      s.players[0].discard = [inst("CMP-M")];
    });
    const pc = state.pendingChoice!;
    expect(pc.mode).toBe("discardToHand");
    const next = apply(state, { type: "choose", iid: pc.candidates[0]!.iid }).state;
    expect(next.players[0].hand.map((c) => c.defId)).toEqual(["CMP-M"]);
    expect(next.players[0].discard).toHaveLength(0);
  });

  it("Unbind (DIV-019) destroys an opponent ward and draws", () => {
    const { state } = cast("DIV-019", (s) => {
      s.players[1].wards = [{ wid: 1, hp: 3 }];
      s.players[0].resourceDeck = [inst("CMP-M")];
    });
    expect(state.players[1].wards).toHaveLength(0);
    expect(state.players[0].hand).toHaveLength(1);
  });
});

describe("Abjuration effects", () => {
  it("Fortify (ABJ-001) creates a 1 HP ward when you have none", () => {
    const { state } = cast("ABJ-001");
    expect(state.players[0].wards.map((w) => w.hp)).toEqual([1]);
  });

  it("Fortify (ABJ-001) adds 2 HP to an existing ward", () => {
    const { state } = cast("ABJ-001", (s) => {
      s.players[0].wards = [{ wid: 1, hp: 3 }];
    });
    expect(state.players[0].wards.map((w) => w.hp)).toEqual([5]);
  });

  it("Aegis Eternal (ABJ-022) makes a 6 HP ward, reduces incoming damage by 1, and the ward soaks the rest", () => {
    const state = blankState();
    const events: GameEvent[] = [];
    const aegis = inst("ABJ-022");
    getEffect("ABJ-022")!(makeContext(state, 0, aegis, events), aegis);
    expect(state.players[0].wards.map((w) => w.hp)).toEqual([6]);
    // Player 1 fires a Fireball (5) at player 0 — reduced to 4, then soaked by the ward (6 -> 2), 0 to face.
    const fb = inst("EVO-017");
    getEffect("EVO-017")!(makeContext(state, 1, fb, events), fb);
    expect(state.players[0].hp).toBe(30);
    expect(state.players[0].wards.map((w) => w.hp)).toEqual([2]);
    expect(state.players[0].damagePreventedThisRound).toBe(1);
  });

  it("a ward soaks damage first and overflow spills to HP", () => {
    const state = blankState();
    const events: GameEvent[] = [];
    state.players[0].wards = [{ wid: 1, hp: 2 }];
    // Player 1 Fireball (5) at player 0: ward (2) destroyed, 3 overflow to HP -> 27.
    const fb = inst("EVO-017");
    getEffect("EVO-017")!(makeContext(state, 1, fb, events), fb);
    expect(state.players[0].wards).toHaveLength(0);
    expect(state.players[0].hp).toBe(27);
  });

  it("Ward Collapse (ABJ-031) converts your largest ward into damage", () => {
    const { state } = cast("ABJ-031", (s) => {
      s.players[0].wards = [{ wid: 1, hp: 4 }];
    });
    expect(state.players[0].wards).toHaveLength(0);
    expect(state.players[1].hp).toBe(26);
  });

  it("Banishing Bolt (ABJ-035) deals 5, or 7 with a ward", () => {
    expect(cast("ABJ-035").state.players[1].hp).toBe(25);
    const withWard = cast("ABJ-035", (s) => {
      s.players[0].wards = [{ wid: 1, hp: 2 }];
    });
    expect(withWard.state.players[1].hp).toBe(23);
  });

  it("Runic Seal (ABJ-010) seals an opponent prepared spell", () => {
    const { state } = cast("ABJ-010", (s) => {
      s.players[1].prepared = [
        { spell: inst("EVO-017"), faceDown: true, attached: [], cast: false, sealed: false },
      ];
    });
    expect(state.players[1].prepared[0]!.sealed).toBe(true);
  });
});

/** Resolve a Reaction (player 0) responding to a spell (player 1) on the stack. */
function runReaction(
  reactionId: string,
  targetDefId: string,
  opts?: { selfSetup?: (s: GameState) => void; targetAttached?: string[]; targetLevel?: number },
): { state: GameState; events: GameEvent[]; targetItem: StackItem } {
  const state = blankState();
  opts?.selfSetup?.(state);
  const attached = (opts?.targetAttached ?? []).map(inst);
  state.players[1].prepared = [
    { spell: inst(targetDefId), faceDown: false, attached, cast: true, sealed: false },
  ];
  const targetItem: StackItem = {
    sid: 1,
    controller: 1,
    preparedIndex: 0,
    defId: targetDefId,
    isReaction: false,
    level: opts?.targetLevel ?? 2,
    componentCount: attached.length,
    targetSid: null,
    cancelled: false,
    damageReduction: 0,
    reflect: 0,
    unstoppable: false,
    reactionProof: false,
    minDamage: 0,
    wasFaceDown: false,
    retractable: false,
    damageBonus: 0,
  };
  state.stack = [targetItem];
  const reactionItem: StackItem = {
    sid: 2,
    controller: 0,
    preparedIndex: 0,
    defId: reactionId,
    isReaction: true,
    level: 1,
    componentCount: 0,
    targetSid: 1,
    cancelled: false,
    damageReduction: 0,
    reflect: 0,
    unstoppable: false,
    reactionProof: false,
    minDamage: 0,
    wasFaceDown: false,
    retractable: false,
    damageBonus: 0,
  };
  const events: GameEvent[] = [];
  const card = inst(reactionId);
  getEffect(reactionId)!(makeContext(state, 0, card, events, reactionItem), card);
  return { state, events, targetItem };
}

describe("Reactions", () => {
  it("Counterbind (ABJ-015) cancels a Material spell but not a Verbal one", () => {
    expect(runReaction("ABJ-015", "DIV-001").targetItem.cancelled).toBe(true); // DIV-001 costs M
    expect(runReaction("ABJ-015", "EVO-017").targetItem.cancelled).toBe(false); // Fireball costs V
  });

  it("Break Form (ABJ-016) cancels a Somatic spell", () => {
    expect(runReaction("ABJ-016", "ABJ-022").targetItem.cancelled).toBe(true); // costs SSS
  });

  it("Dampen (ABJ-006) reduces the target spell's damage", () => {
    expect(runReaction("ABJ-006", "EVO-017").targetItem.damageReduction).toBe(1);
  });

  it("Abjure the Wicked (ABJ-026) cancels and punishes per component", () => {
    const { state, targetItem } = runReaction("ABJ-026", "EVO-017", { targetAttached: ["CMP-VV"] });
    expect(targetItem.cancelled).toBe(true);
    expect(state.players[1].hp).toBe(28); // 2 damage x 1 component
  });

  it("Backdraft (EVO-013) burns the caster without cancelling the spell", () => {
    const { state, targetItem } = runReaction("EVO-013", "EVO-017");
    expect(targetItem.cancelled).toBe(false);
    expect(state.players[1].hp).toBe(28);
  });

  it("prevention on a stack item reduces that spell's damage on resolution", () => {
    const state = blankState();
    const events: GameEvent[] = [];
    const item: StackItem = {
      sid: 1,
      controller: 0,
      preparedIndex: 0,
      defId: "EVO-017",
      isReaction: false,
      level: 2,
      componentCount: 0,
      targetSid: null,
      cancelled: false,
      damageReduction: 1, // a Dampen-style reaction reduced it by 1
      reflect: 0,
      unstoppable: false,
      reactionProof: false,
      minDamage: 0,
      wasFaceDown: false,
      retractable: false,
      damageBonus: 0,
    };
    getEffect("EVO-017")!(makeContext(state, 0, inst("EVO-017"), events, item), inst("EVO-017"));
    expect(state.players[1].hp).toBe(26); // Fireball 5 -> 4
  });
});

describe("Trainers (Items & Gambits)", () => {
  it("Second Wind (GAM-009) heals 5", () => {
    const { state } = cast("GAM-009");
    expect(state.players[0].hp).toBe(35);
  });

  it("Battle Trance (GAM-010) self-damages and arms a one-shot next-spell bonus", () => {
    // The +3 is consumed at CAST time (StackItem.damageBonus), not a round
    // buff — the full cast/expiry flow is covered in interactions.test.ts.
    const state = blankState();
    const events: GameEvent[] = [];
    const bt = inst("GAM-010");
    getEffect("GAM-010")!(makeContext(state, 0, bt, events), bt);
    expect(state.players[0].hp).toBe(28); // lost 2
    expect(state.players[0].nextSpellBonus).toBe(3);
    expect(state.players[0].ongoing).toHaveLength(0); // NOT a round-long buff
  });

  it("Quenching Salts (GAM-013) clears Burn and heals per marker", () => {
    const { state } = cast("GAM-013", (s) => {
      s.players[0].burn = 3;
    });
    expect(state.players[0].burn).toBe(0);
    expect(state.players[0].hp).toBe(33);
  });

  it("enforces at most one Gambit per turn via the action layer", () => {
    const state = blankState();
    const g1 = inst("GAM-009");
    const g2 = inst("GAM-011");
    state.players[0].hand = [g1, g2];

    const trainers1 = legalActions(state, 0).filter((a) => a.type === "playTrainer");
    expect(trainers1).toHaveLength(2); // both gambits offered

    const playG1 = trainers1.find((a) => a.type === "playTrainer" && a.handIid === g1.iid)!;
    const after = apply(state, playG1).state;
    expect(after.players[0].gambitPlayedThisTurn).toBe(true);
    expect(after.players[0].hp).toBe(35);

    const trainers2 = legalActions(after, 0).filter((a) => a.type === "playTrainer");
    expect(trainers2).toHaveLength(0); // second Gambit no longer allowed this turn
  });
});

describe("Burn ticks through the turn machinery", () => {
  it("deals damage at the start of the burned player's turn", () => {
    const state = blankState();
    // Player 0 is active and has taken a turn; player 1 is burned and ready to draw.
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].resourceDeck = [inst("CMP-V")];
    state.players[1].turnsTakenThisRound = 1;
    state.players[1].resourceDeck = [inst("CMP-V"), inst("CMP-V")];
    state.players[1].burn = 2;

    const { state: next } = apply(state, { type: "pass" }); // hands turn to player 1
    expect(next.activePlayer).toBe(1);
    expect(next.players[1].hp).toBe(28); // took 2 Burn damage at turn start
    expect(next.players[1].burn).toBe(1); // …then one marker decays
  });

  it("decays one marker per tick and persists across rounds", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].resourceDeck = [inst("CMP-V")];
    state.players[1].turnsTakenThisRound = 1;
    state.players[1].resourceDeck = [inst("CMP-V"), inst("CMP-V")];
    state.players[1].burn = 3;

    const { state: next } = apply(state, { type: "pass" });
    expect(next.players[1].hp).toBe(27); // 3 markers = 3 damage
    expect(next.players[1].burn).toBe(2); // decayed to 2, NOT cleared

    // Round end does not clear the remaining markers.
    const events: GameEvent[] = [];
    endRoundAndLevelUp(next, events);
    expect(next.players[1].burn).toBe(2);
  });
});

describe("Deck recycling with exhaustion", () => {
  it("reshuffles the discard into an empty deck at escalating damage instead of losing", () => {
    const state = blankState();
    const p = state.players[0];
    const events: GameEvent[] = [];

    // First recycle: 3-card discard becomes the deck, 2 exhaustion damage.
    p.discard = [inst("CMP-V"), inst("CMP-S"), inst("CMP-M")];
    expect(drawN(state, 0, 2, events)).toBe(2);
    expect(p.reshuffles).toBe(1);
    expect(p.hp).toBe(28);
    expect(p.discard).toHaveLength(0);
    expect(p.resourceDeck.length + p.hand.length).toBe(3);

    // Second recycle escalates to 4 damage.
    p.resourceDeck = [];
    p.discard = [inst("CMP-V")];
    expect(drawN(state, 0, 1, events)).toBe(1);
    expect(p.reshuffles).toBe(2);
    expect(p.hp).toBe(24);

    // Deck AND discard empty: nothing to draw, no damage, no phantom reshuffle.
    p.resourceDeck = [];
    expect(drawN(state, 0, 1, events)).toBe(0);
    expect(p.reshuffles).toBe(2);
    expect(p.hp).toBe(24);
    expect(events.filter((e) => e.type === "reshuffled")).toHaveLength(2);
  });

  it("round end grants the non-exhausting wizard one final turn", () => {
    const state = blankState();
    // P0 (active) has spent all slots at tier 1 (2 slots); flag should be set, not an instant round end.
    state.players[0].slotsUsedThisRound = 2;
    state.players[0].spellCastThisTurn = true;
    // Simulate the post-resolution check path: P0 passes turn; P1 must get a turn in the same round.
    state.finalTurnFor = 1; // as flagRoundEnd would set after P0's last cast resolved
    state.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-V")];
    state.players[1].resourceDeck = [inst("CMP-S"), inst("CMP-S")];
    state.players[1].turnsTakenThisRound = 1;
    state.players[0].turnsTakenThisRound = 1;

    const { state: s1 } = apply(state, { type: "pass" }); // P0 ends turn -> P1's FINAL turn begins
    expect(s1.round).toBe(1);
    expect(s1.activePlayer).toBe(1);

    const { state: s2 } = apply(s1, { type: "pass" }); // P1's final turn ends -> round ends
    expect(s2.round).toBe(2);
    expect(s2.finalTurnFor).toBeNull();
  });

  it("a round ends once both wizards hit the per-round turn limit", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 8;
    state.players[1].turnsTakenThisRound = 8;
    state.players[0].resourceDeck = [inst("CMP-V")];
    const { state: next } = apply(state, { type: "pass" });
    expect(next.round).toBe(2); // stalemate valve fired
  });

  it("hand cap discards down to 10 at end of turn", () => {
    const state = blankState();
    state.players[0].hand = Array.from({ length: 13 }, () => inst("CMP-V"));
    state.players[0].resourceDeck = [inst("CMP-V")];
    state.players[1].resourceDeck = [inst("CMP-S")];
    state.players[0].turnsTakenThisRound = 1;
    const { state: next, events } = apply(state, { type: "pass" });
    expect(next.players[0].hand.length).toBe(10);
    expect(next.players[0].discard.length).toBe(3);
    expect(events.some((e) => e.type === "handCapDiscard")).toBe(true);
  });

  it("exhaustion bypasses wards and hits HP directly", () => {
    const state = blankState();
    const p = state.players[0];
    p.wards = [{ wid: 1, hp: 10 }];
    p.resourceDeck = [];
    p.discard = [inst("CMP-V")];
    const events: GameEvent[] = [];
    drawN(state, 0, 1, events);
    expect(p.hp).toBe(28); // 2 exhaustion straight to face
    expect(p.wards[0]!.hp).toBe(10); // ward untouched
  });
});

describe("Reaction fueling from hand, Aegis, Stone Stance", () => {
  const prepared = (defId: string, attached: string[] = []) => ({
    spell: inst(defId),
    faceDown: false,
    attached: attached.map(inst),
    cast: false,
    sealed: false,
  });
  const findReaction = (s: GameState): Extract<Action, { type: "castReaction" }> | undefined =>
    legalActions(s, 0).find((a) => a.type === "castReaction") as
      | Extract<Action, { type: "castReaction" }>
      | undefined;

  it("a Reaction needs its cost PRE-ATTACHED — hand components can't fuel it mid-window", () => {
    // Live-play ruling (2026-07-03): reactions follow the same rule as casts.
    const state = blankState();
    // P0 holds Dampen prepared but UNfueled, with a Somatic in hand.
    state.players[0].prepared = [prepared("ABJ-006")];
    state.players[0].hand = [inst("CMP-S")];
    state.players[1].prepared = [prepared("EVO-001", ["CMP-V"])];
    state.activePlayer = 1;
    state.priorityPlayer = 1;
    let s = apply(state, { type: "cast", preparedIndex: 0 }).state;
    s = apply(s, { type: "pass" }).state; // open the reaction window
    expect(findReaction(s), "unfueled Reaction must NOT be castable").toBeUndefined();

    // Pre-attached, the same Reaction works.
    const state2 = blankState();
    state2.players[0].prepared = [prepared("ABJ-006", ["CMP-S"])];
    state2.players[1].prepared = [prepared("EVO-001", ["CMP-V"])];
    state2.activePlayer = 1;
    state2.priorityPlayer = 1;
    let t = apply(state2, { type: "cast", preparedIndex: 0 }).state;
    t = apply(t, { type: "pass" }).state;
    const react = findReaction(t);
    expect(react, "pre-fueled Dampen should be castable").toBeTruthy();
    t = apply(t, react!).state;
    // Resolve the whole stack: Dampen reduces Spark by 1, then Spark lands for 1.
    for (let i = 0; i < 4; i++) t = apply(t, { type: "pass" }).state;
    expect(t.players[0].hp).toBe(29);
  });

  it("Aegis: a 1-component spell fizzles, a 2-component spell still lands", () => {
    const resolveSpark = (attached: string[]): GameState => {
      const state = blankState();
      state.players[0].ongoing.push({
        id: 1,
        owner: 0,
        kind: "untargetableBySingle",
        value: 1,
        expiry: "startOfOwnNextTurn",
      });
      state.players[1].prepared = [prepared("EVO-001", attached)];
      state.activePlayer = 1;
      state.priorityPlayer = 1;
      let s = apply(state, { type: "cast", preparedIndex: 0 }).state;
      s = apply(s, { type: "pass" }).state;
      s = apply(s, { type: "pass" }).state;
      return s;
    };
    expect(resolveSpark(["CMP-V"]).players[0].hp).toBe(30); // one component -> fizzles
    expect(resolveSpark(["CMP-V", "CMP-V"]).players[0].hp).toBe(28); // two components -> 2 damage
  });

  it("discountCostS reduces S but keeps a 1-component floor", () => {
    expect(discountCostS({ V: 0, S: 2, M: 0 }, 1)).toEqual({ V: 0, S: 1, M: 0 }); // SS -> S
    expect(discountCostS({ V: 0, S: 1, M: 0 }, 1)).toEqual({ V: 0, S: 1, M: 0 }); // S -> S (min 1)
    expect(discountCostS({ V: 0, S: 1, M: 1 }, 1)).toEqual({ V: 0, S: 0, M: 1 }); // SM -> M
  });

  it("Stone Stance lets an SS Reaction go off with one ATTACHED S, and is consumed", () => {
    const state = blankState();
    state.players[0].level = 5; // unlocks L2 Reactions (Interrupt is SS)
    state.players[0].ongoing.push({
      id: 1,
      owner: 0,
      kind: "reactionDiscountS",
      value: 1,
      expiry: "endOfRound",
    });
    state.players[0].prepared = [prepared("ABJ-013", ["CMP-S"])]; // Interrupt (SS) with one S attached
    state.players[1].prepared = [prepared("EVO-001", ["CMP-V"])];
    state.activePlayer = 1;
    state.priorityPlayer = 1;
    let s = apply(state, { type: "cast", preparedIndex: 0 }).state;
    s = apply(s, { type: "pass" }).state; // caster keeps priority after casting; pass to open the reaction window

    const react = findReaction(s);
    expect(react, "Interrupt should be castable with one attached S under Stone Stance").toBeTruthy();

    s = apply(s, react!).state;
    expect(s.players[0].ongoing.some((o) => o.kind === "reactionDiscountS")).toBe(false); // consumed
  });
});

describe("Divination deck sculpting", () => {
  it("Foresight (DIV-002) reveals the top 3 for an interactive take-one choice", () => {
    const { state } = cast("DIV-002", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-MM"), inst("CMP-S")];
    });
    expect(state.pendingChoice?.mode).toBe("takeToHand");
    expect(state.pendingChoice?.picksRemaining).toBe(1);
    expect(state.pendingChoice!.candidates.map((c) => c.defId).sort()).toEqual(["CMP-MM", "CMP-S", "CMP-V"]);
  });

  it("Augury (DIV-004) draws a Material top card but bottoms a non-Material one", () => {
    const hit = cast("DIV-004", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-M")]; // top = CMP-M
    });
    expect(hit.state.players[0].hand.map((c) => c.defId)).toEqual(["CMP-M"]);
    const miss = cast("DIV-004", (s) => {
      s.players[0].resourceDeck = [inst("CMP-MM"), inst("CMP-V")]; // top = CMP-V (no M)
    });
    expect(miss.state.players[0].hand).toHaveLength(0);
    expect(miss.state.players[0].resourceDeck[0]!.defId).toBe("CMP-V"); // bottomed
  });

  it("Index (DIV-022) pauses for the PLAYER to order the top 5 (no card gain)", () => {
    // Interactive since the 2026-07 sweep; the full ordering flow is covered
    // in interactions.test.ts.
    const { state } = cast("DIV-022", (s) => {
      s.players[0].resourceDeck = [
        inst("CMP-V"),
        inst("CMP-S"),
        inst("CMP-M"),
        inst("CMP-VV"),
        inst("CMP-MM"),
      ];
    });
    expect(state.pendingChoice!.mode).toBe("orderToTop");
    expect(state.pendingChoice!.candidates).toHaveLength(5);
    expect(state.players[0].hand).toHaveLength(0); // pure sculpt, no draw
  });

  it("Quick Study (DIV-021) draws 2, then requests a bank-to-top choice", () => {
    const { state } = cast("DIV-021", (s) => {
      s.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-S"), inst("CMP-MM")];
      s.players[0].hand = [];
    });
    expect(state.players[0].hand).toHaveLength(2); // drew 2
    expect(state.pendingChoice?.mode).toBe("bankToDeckTop");
    expect(state.pendingChoice?.candidates).toHaveLength(2);
  });
});

function combinedSym(defId: string): number {
  return defId === "CMP-VV" || defId === "CMP-SS" || defId === "CMP-MM" ? 2 : 1;
}

describe("Mulligan", () => {
  it("shuffles the hand back and draws one fewer, only at the start of the first turn", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].hand = [inst("CMP-V"), inst("CMP-S"), inst("CMP-M")];
    state.players[0].resourceDeck = [inst("CMP-VV"), inst("CMP-SS"), inst("CMP-MM"), inst("CMP-VM")];

    expect(legalActions(state, 0).some((a) => a.type === "mulligan")).toBe(true);
    const s = apply(state, { type: "mulligan" }).state;
    expect(s.players[0].hand).toHaveLength(2); // 3 -> 2
    expect(s.players[0].resourceDeck).toHaveLength(5); // 4 + 3 shuffled in - 2 drawn

    // No longer offered once you've attached/cast (not the start of the turn anymore).
    state.players[0].componentPlayedThisTurn = true;
    expect(legalActions(state, 0).some((a) => a.type === "mulligan")).toBe(false);
  });

  it("is not offered on a later turn of the round", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 2;
    state.players[0].hand = [inst("CMP-V")];
    expect(legalActions(state, 0).some((a) => a.type === "mulligan")).toBe(false);
  });

  it("is only for the opening hand — not offered after round 1", () => {
    const state = blankState();
    state.round = 2; // a later round's first turn has no bulk draw, so nothing to mulligan
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].hand = [inst("CMP-V")];
    expect(legalActions(state, 0).some((a) => a.type === "mulligan")).toBe(false);
    expect(() => apply(state, { type: "mulligan" })).toThrow();
  });
});

describe("Triggers, replacements, and immunity flags", () => {
  it("Arcane Shell's ward draws 2 when destroyed by damage; overflow hits face", () => {
    const state = blankState();
    state.players[0].wards = [{ wid: 1, hp: 1, onDestroy: "draw2" }];
    state.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-S"), inst("CMP-M")];
    const events: GameEvent[] = [];
    getEffect("EVO-001")!(makeContext(state, 1, inst("EVO-001"), events), inst("EVO-001")); // Spark 2 at P0
    expect(state.players[0].wards).toHaveLength(0);
    expect(state.players[0].hand).toHaveLength(2); // drew 2 on destroy
    expect(state.players[0].hp).toBe(29); // 1 overflow past the 1-HP ward
  });

  it("Reflective Ward chips the attacker when it absorbs", () => {
    const state = blankState();
    state.players[0].wards = [{ wid: 1, hp: 3, reflectOnPrevent: 1 }];
    const events: GameEvent[] = [];
    getEffect("EVO-001")!(makeContext(state, 1, inst("EVO-001"), events), inst("EVO-001")); // Spark 2 at P0
    expect(state.players[0].wards[0]!.hp).toBe(1); // absorbed 2
    expect(state.players[1].hp).toBe(29); // reflected 1 to the attacker
  });

  it("Inversion Field converts incoming damage into healing, capped per round", () => {
    const state = blankState();
    state.players[0].hp = 20;
    state.players[0].ongoing = [{ id: 1, owner: 0, kind: "damageToHeal", value: 5, expiry: "endOfRound" }];
    const events: GameEvent[] = [];
    getEffect("EVO-017")!(makeContext(state, 1, inst("EVO-017"), events), inst("EVO-017")); // Fireball 5 at P0
    expect(state.players[0].hp).toBe(25); // 5 damage healed instead
    expect(state.players[0].damageHealedThisRound).toBe(5);
  });

  it("Attune lets the next attach pay an off-color symbol it lacks", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].prepared = [
      { spell: inst("EVO-009"), faceDown: true, attached: [], cast: false, sealed: false }, // Battery, cost VM (L1)
    ];
    state.players[0].hand = [inst("CMP-V")];
    state.players[0].ongoing = [{ id: 1, owner: 0, kind: "attuneBonus", value: 1, expiry: "endOfRound" }];
    const attach = legalActions(state, 0).find((a) => a.type === "attach");
    expect(attach).toBeTruthy();
    const s = apply(state, attach!).state;
    expect(s.players[0].prepared[0]!.bonus).toEqual({ V: 0, S: 0, M: 1 }); // Attune supplied the missing M
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(true);
  });
});

describe("Interactive look/loot choices", () => {
  const chooseDef = (s: GameState, defId: string) => {
    const legal = legalActions(s, 0);
    return legal.find((a) => a.type === "choose" && s.pendingChoice!.candidates.find((c) => c.iid === (a as Extract<Action, { type: "choose" }>).iid)?.defId === defId)!;
  };

  it("Scrying Lens reveals the top 2 and lets you choose one into hand", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].resourceDeck = [inst("CMP-S"), inst("CMP-V"), inst("CMP-MM")]; // top two = CMP-V, CMP-MM
    state.players[0].hand = [inst("ITM-001")]; // Scrying Lens

    let s = apply(state, legalActions(state, 0).find((a) => a.type === "playTrainer")!).state;
    expect(s.pendingChoice?.mode).toBe("takeToHand");
    expect(s.pendingChoice!.candidates.map((c) => c.defId).sort()).toEqual(["CMP-MM", "CMP-V"]);
    expect(legalActions(s, 0).every((a) => a.type === "choose")).toBe(true); // nothing else is legal mid-choice

    s = apply(s, chooseDef(s, "CMP-MM")).state; // take the dual
    expect(s.pendingChoice).toBeNull();
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-MM"]);
    expect(s.players[0].resourceDeck.at(-1)!.defId).toBe("CMP-V"); // the other went back on top
  });

  it("Arcane Study draws 2, then you choose which card to bank on top", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].resourceDeck = [inst("CMP-V"), inst("CMP-S"), inst("CMP-M"), inst("CMP-VV")]; // draws CMP-VV, CMP-M
    state.players[0].hand = [inst("GAM-001")]; // Arcane Study

    let s = apply(state, legalActions(state, 0).find((a) => a.type === "playTrainer")!).state;
    expect(s.pendingChoice?.mode).toBe("bankToDeckTop");
    expect(s.players[0].hand.map((c) => c.defId).sort()).toEqual(["CMP-M", "CMP-VV"]); // net +2 in hand pre-bank

    s = apply(s, chooseDef(s, "CMP-M")).state; // bank the Material
    expect(s.pendingChoice).toBeNull();
    expect(s.players[0].hand.map((c) => c.defId)).toEqual(["CMP-VV"]); // kept the dual (net +1)
    expect(s.players[0].resourceDeck.at(-1)!.defId).toBe("CMP-M"); // banked on top
  });
});

describe("Take-backs (detach / retract)", () => {
  it("allows unlimited attaches per turn and detaches any attached component", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].prepared = [{ spell: inst("EVO-001"), faceDown: true, attached: [], cast: false, sealed: false }];
    state.players[0].hand = [inst("CMP-V"), inst("CMP-S")];

    // Two attaches in the SAME turn (no once-per-turn limit; 2-card cap still applies).
    let s = apply(state, legalActions(state, 0).find((a) => a.type === "attach")!).state;
    s = apply(s, legalActions(s, 0).find((a) => a.type === "attach")!).state;
    expect(s.players[0].prepared[0]!.attached).toHaveLength(2);
    expect(legalActions(s, 0).some((a) => a.type === "attach")).toBe(false); // spell at the 2-card cap

    // Detach one back to hand.
    const detach = legalActions(s, 0).find((a) => a.type === "detach");
    expect(detach, "detach should be offered for an attached component").toBeTruthy();
    s = apply(s, detach!).state;
    expect(s.players[0].prepared[0]!.attached).toHaveLength(1);
    expect(s.players[0].hand).toHaveLength(1); // one returned to hand
    expect(legalActions(s, 0).some((a) => a.type === "attach")).toBe(true); // room again under the cap
  });

  it("allows only one non-Reaction spell cast per turn", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].prepared = [
      { spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false },
      { spell: inst("EVO-002"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false },
    ];

    let s = apply(state, legalActions(state, 0).find((a) => a.type === "cast")!).state; // cast the first
    expect(s.players[0].spellCastThisTurn).toBe(true);
    s = apply(s, { type: "pass" }).state; // caster passes
    s = apply(s, { type: "pass" }).state; // opponent passes -> resolves; back on P0's turn

    // The 2nd spell is ready and a slot remains, but you've already cast this turn.
    expect(s.players[0].slotsUsedThisRound).toBe(1);
    expect(legalActions(s, 0).some((a) => a.type === "cast")).toBe(false);
    expect(s.players[0].prepared[1]!.cast).toBe(false);
  });

  it("discards components left on uncast spells at end of round", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].slotsUsedThisRound = 1; // already cast once earlier this round (L1 = 2 slots)
    state.players[1].turnsTakenThisRound = 1;
    const prep = (id: string, withV: boolean) => ({
      spell: inst(id), faceDown: false, attached: withV ? [inst("CMP-V")] : [], cast: false, sealed: false,
    });
    // Casting the first exhausts the last slot (round ends); the second keeps its component.
    state.players[0].prepared = [prep("EVO-001", true), prep("EVO-003", true)];
    state.players[1].prepared = [prep("EVO-001", false)];

    let s = apply(state, legalActions(state, 0).find((a) => a.type === "cast")!).state; // cast -> slot 2/2
    s = apply(s, { type: "pass" }).state; // caster passes
    s = apply(s, { type: "pass" }).state; // opponent passes -> resolve -> round-end FLAGGED
    expect(s.finalTurnFor).toBe(1);
    s = apply(s, { type: "pass" }).state; // P0 ends turn -> P1's final turn
    s = apply(s, { type: "pass" }).state; // final turn ends -> round ends

    expect(s.phase).toBe("prepare");
    expect(s.players[0].prepared.every((pp) => pp.attached.length === 0)).toBe(true); // leftover discarded
    expect(s.players[0].discard.filter((c) => c.defId === "CMP-V").length).toBeGreaterThanOrEqual(2);
  });

  it("retract takes back a just-cast spell while you still hold priority", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].prepared = [{ spell: inst("EVO-001"), faceDown: true, attached: [inst("CMP-V")], cast: false, sealed: false }];

    let s = apply(state, legalActions(state, 0).find((a) => a.type === "cast")!).state;
    expect(s.priorityPlayer).toBe(0); // caster keeps priority
    expect(s.stack).toHaveLength(1);
    expect(s.players[0].slotsUsedThisRound).toBe(1);

    const retract = legalActions(s, 0).find((a) => a.type === "retractCast");
    expect(retract, "retract should be offered before priority passes").toBeTruthy();
    s = apply(s, retract!).state;
    expect(s.stack).toHaveLength(0);
    expect(s.players[0].prepared[0]!.cast).toBe(false);
    expect(s.players[0].prepared[0]!.faceDown).toBe(true); // re-hidden
    expect(s.players[0].slotsUsedThisRound).toBe(0); // slot refunded
    expect(s.players[1].hp).toBe(30); // no damage dealt
  });

  it("retract is no longer offered once you pass priority", () => {
    const state = blankState();
    state.players[0].turnsTakenThisRound = 1;
    state.players[0].prepared = [{ spell: inst("EVO-001"), faceDown: false, attached: [inst("CMP-V")], cast: false, sealed: false }];
    let s = apply(state, legalActions(state, 0).find((a) => a.type === "cast")!).state;
    s = apply(s, { type: "pass" }).state; // priority -> opponent; the cast is now committed
    expect(legalActions(s, 1).some((a) => a.type === "retractCast")).toBe(false);
  });
});
