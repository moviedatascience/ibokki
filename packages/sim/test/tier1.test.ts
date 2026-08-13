import { describe, expect, it } from "vitest";
import {
  apply,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  redact,
  tierForLevel,
  type GameState,
} from "@ibokki/engine";
import { GreedySimBot, HeuristicBot } from "../src/index.ts";
import { _sideScore, evaluateState } from "../src/evaluate.ts";

/** Play forward with heuristic bots until `stop(state)` (or terminal / step cap). */
function playUntil(state: GameState, stop: (s: GameState) => boolean, maxSteps = 3000): GameState {
  const bots = [new HeuristicBot(11), new HeuristicBot(22)] as const;
  for (let i = 0; i < maxSteps && !isTerminal(state) && !stop(state); i++) {
    const actor = state.priorityPlayer;
    const legal = legalActions(state, actor);
    state = apply(state, bots[actor].chooseAction(redact(state, actor), legal), actor).state;
  }
  return state;
}

/** A quiet main-phase decision point for P0 with at least one prepared spell. */
function quietMainSpot(seed: number): GameState {
  const spot = playUntil(
    createGame({ seed, players: [deckFor("Abjuration"), deckFor("Divination")] }),
    (s) =>
      s.phase === "main" &&
      s.priorityPlayer === 0 &&
      s.stack.length === 0 &&
      !s.pendingChoice &&
      s.players[0].prepared.some((p) => !p.cast),
  );
  expect(spot.phase).toBe("main");
  return spot;
}

describe("tier-1 bot behavior valves (2026-08-13)", () => {
  it("detach-rescue: pulls sweep-bound fuel to hand on the round's final turn", () => {
    const s = structuredClone(quietMainSpot(31));
    // Round will end after this turn: opponent slot-exhausted, my cast spent.
    s.players[1].slotsUsedThisRound = tierForLevel(s.players[1].level).slots;
    s.players[0].spellCastThisTurn = true;
    // Fuel sitting on an uncast spell, about to be swept.
    const prep = s.players[0].prepared.find((p) => !p.cast)!;
    prep.attached.push({ iid: 555001, defId: "CMP-S" });

    const legal = legalActions(s, 0);
    expect(legal.some((a) => a.type === "detach")).toBe(true);
    const action = new GreedySimBot(5, { determinizations: 2, rolloutPlies: 12 }).chooseAction(redact(s, 0), legal, s);
    expect(action.type).toBe("detach");
  });

  it("detach-rescue: cleanup mode passes once nothing is left to rescue (no oscillation)", () => {
    const s = structuredClone(quietMainSpot(31));
    s.players[1].slotsUsedThisRound = tierForLevel(s.players[1].level).slots;
    s.players[0].spellCastThisTurn = true;
    for (const p of s.players[0].prepared) p.attached = [];

    const legal = legalActions(s, 0);
    const action = new GreedySimBot(5, { determinizations: 2, rolloutPlies: 12 }).chooseAction(redact(s, 0), legal, s);
    expect(action.type).toBe("pass");
  });

  it("waste accounting: attached fuel is worth less once the owner is slot-exhausted", () => {
    // Synthetic NON-Reaction spell prep (Fortify, cost S) so the sweep
    // discount applies deterministically (Reactions are exempt by design).
    const base = structuredClone(quietMainSpot(31));
    base.players[0].prepared.push({
      spell: { iid: 555010, defId: "ABJ-001" },
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
    });
    const fueled = structuredClone(base);
    fueled.players[0].prepared.find((p) => p.spell.iid === 555010)!.attached.push({ iid: 555002, defId: "CMP-S" });
    const gainLive = _sideScore(fueled, 0) - _sideScore(base, 0);

    const baseDone = structuredClone(base);
    baseDone.players[0].slotsUsedThisRound = tierForLevel(baseDone.players[0].level).slots;
    const fueledDone = structuredClone(fueled);
    fueledDone.players[0].slotsUsedThisRound = tierForLevel(fueledDone.players[0].level).slots;
    const gainDone = _sideScore(fueledDone, 0) - _sideScore(baseDone, 0);

    expect(gainLive).toBeGreaterThan(0);
    expect(gainDone).toBeLessThan(gainLive * 0.5); // sweep-bound fuel ≈ dead weight
  });

  it("ward-battery convertibility (tier 2): a prepared Ward Collapse makes ward HP payload", () => {
    const s = structuredClone(quietMainSpot(31));
    s.players[0].level = 10; // past ABJ-031's L3 tier gate
    s.players[1].level = 10;
    s.players[0].wards = [{ wid: 9001, hp: 12 }];

    const withCollapse = structuredClone(s);
    withCollapse.players[0].prepared.push({
      spell: { iid: 555020, defId: "ABJ-031" },
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
    });
    // The prepared collapse must add MORE than a generic L3 prep would —
    // the battery payload term. Compare against an equal-level non-battery prep.
    const withGeneric = structuredClone(s);
    withGeneric.players[0].prepared.push({
      spell: { iid: 555021, defId: "ABJ-022" }, // Aegis Eternal, also L3 SSS
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
    });
    expect(_sideScore(withCollapse, 0)).toBeGreaterThan(_sideScore(withGeneric, 0));

    // And the payload scales with the battery: bigger ward, bigger score.
    const bigBattery = structuredClone(withCollapse);
    bigBattery.players[0].wards = [{ wid: 9002, hp: 25 }];
    expect(_sideScore(bigBattery, 0)).toBeGreaterThan(_sideScore(withCollapse, 0));
  });

  it("doom-aware option value: an armed cancel is worth more against live prophecy preps", () => {
    const s = structuredClone(quietMainSpot(31));
    // Phase Shift is L2 — the armed term requires castable, so lift the level
    // past its tier gate (both sides, to keep the state coherent).
    s.players[0].level = 10;
    s.players[1].level = 10;
    // Arm a cancel reaction for P0 (Phase Shift SS, fully fueled).
    s.players[0].prepared.push({
      spell: { iid: 555003, defId: "ABJ-014" },
      faceDown: true,
      attached: [{ iid: 555004, defId: "CMP-SS" }],
      cast: false,
      sealed: false,
    });
    // Opponent variant A: a live prophecy prep (Omen). Variant B: a non-doom prep (Insight).
    const withDoom = structuredClone(s);
    withDoom.players[1].prepared.push({
      spell: { iid: 555005, defId: "DIV-012" },
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
    });
    const withDraw = structuredClone(s);
    withDraw.players[1].prepared.push({
      spell: { iid: 555006, defId: "DIV-001" },
      faceDown: true,
      attached: [],
      cast: false,
      sealed: false,
    });
    // My OWN side score isolates the option-value term (opponent preps only
    // enter my side through the doom-aware scale).
    expect(_sideScore(withDoom, 0)).toBeGreaterThan(_sideScore(withDraw, 0));
    // Sanity: composite eval still runs on these states.
    expect(Number.isFinite(evaluateState(withDoom, 0))).toBe(true);
  });
});
