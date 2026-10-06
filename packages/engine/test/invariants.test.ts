/**
 * The invariant checker must be able to FAIL (OPENSKY_REVIEW §D.19: two of OpenSky's
 * asserts never could). Each test corrupts one fact of a real mid-game state and
 * expects the matching violation; a clean fuzz walk must report nothing.
 */
import { describe, expect, it } from "vitest";
import { assertInvariants, checkInvariants, countCards, type GameState } from "../src/index.ts";
import { newFuzzGame, walk } from "./fuzz.ts";

/** First state of a seeded walk satisfying `pred` (main phase, live). */
function findState(pred: (s: GameState) => boolean, seed = 4): GameState {
  let found: GameState | null = null;
  for (let k = seed; k < seed + 40 && !found; k++) {
    try {
      walk(newFuzzGame(k), k * 13 + 1, { biased: true, maxSteps: 3000 }, (s) => {
        if (!found && s.phase === "main" && pred(s)) {
          found = structuredClone(s);
          throw new Error("found");
        }
      });
    } catch (e) {
      if ((e as Error).message !== "found") throw e;
    }
  }
  if (!found) throw new Error("no state matched the predicate");
  return found;
}

const has = (state: GameState, re: RegExp, opts?: { cardCount?: number }): boolean =>
  checkInvariants(state, opts).some((m) => re.test(m));

describe("checkInvariants", () => {
  const base = findState((s) => s.players[0].hand.length > 0 && s.players[1].hand.length > 0);

  it("reports nothing on a real mid-game state", () => {
    expect(checkInvariants(base, { cardCount: countCards(base) })).toEqual([]);
    expect(() => assertInvariants(base)).not.toThrow();
  });

  it("flags a duplicated card iid (and the broken card count)", () => {
    const s = structuredClone(base);
    const n = countCards(s);
    s.players[0].discard.push({ ...s.players[0].hand[0]! });
    expect(has(s, /iid \d+ .* is in BOTH P0 hand and P0 discard/)).toBe(true);
    expect(has(s, /card count \d+ != expected/, { cardCount: n })).toBe(true);
    expect(() => assertInvariants(s, "corrupt")).toThrow(/corrupt: engine invariants violated/);
  });

  it("flags a lost card via the conservation count", () => {
    const s = structuredClone(base);
    const n = countCards(s);
    s.players[1].hand.pop();
    expect(checkInvariants(s)).toEqual([]); // uniqueness alone can't see a loss
    expect(has(s, /card count \d+ != expected/, { cardCount: n })).toBe(true);
  });

  it("flags a ward at 0 HP", () => {
    const s = structuredClone(base);
    s.players[1].wards.push({ wid: s.nextIid++, hp: 0 });
    expect(has(s, /ward \d+ has hp 0/)).toBe(true);
  });

  it("flags out-of-range numbers", () => {
    const s = structuredClone(base);
    s.players[0].level = 0;
    s.players[0].burn = -1;
    s.players[1].hp = Number.NaN;
    s.players[1].slotsUsedThisRound = -2;
    const bad = checkInvariants(s).join("\n");
    expect(bad).toMatch(/P0 level 0 outside/);
    expect(bad).toMatch(/P0 burn -1/);
    expect(bad).toMatch(/P1 hp is not finite/);
    expect(bad).toMatch(/P1 slotsUsedThisRound = -2/);
  });

  it("flags terminal inconsistencies", () => {
    const live = structuredClone(base);
    live.players[0].hp = 0;
    live.winner = 1;
    expect(has(live, /P0 is at 0 HP but the game is not over/)).toBe(true);
    expect(has(live, /winner 1 set on a live game/)).toBe(true);
    const over = structuredClone(base);
    over.phase = "gameover";
    expect(has(over, /phase gameover but endReason null/)).toBe(true);
  });

  it("flags an id reused across cards / wards / stack", () => {
    const s = structuredClone(base);
    s.players[0].wards.push({ wid: s.players[0].hand[0]!.iid, hp: 3 });
    expect(has(s, /id \d+ used by both card iid in P0 hand and P0 ward wid/)).toBe(true);
  });

  it("flags stack items whose slot or target doesn't resolve", () => {
    const s = findState((st) => st.stack.length > 0);
    expect(checkInvariants(s)).toEqual([]);
    const bad = structuredClone(s);
    const top = bad.stack[bad.stack.length - 1]!;
    top.preparedIndex = 99;
    top.targetSid = 123_456;
    const msgs = checkInvariants(bad).join("\n");
    expect(msgs).toMatch(/preparedIndex 99 is not a prepared slot/);
    expect(msgs).toMatch(/targetSid 123456 is not on the stack/);
    const swapped = structuredClone(s);
    swapped.stack[0]!.defId = "NOT-A-CARD";
    expect(has(swapped, /holds /)).toBe(true);
  });

  it("flags a pending choice that is stale or deadlocked", () => {
    const s = findState((st) => st.pendingChoice !== null && st.pendingChoice.candidates.length > 0);
    expect(checkInvariants(s)).toEqual([]);
    const ghost = structuredClone(s);
    const pc = ghost.pendingChoice!;
    // a candidate that lives in no zone (aliased modes) / a duplicate (staged modes)
    pc.candidates.push({ iid: 999_999, defId: "CMP-V" });
    ghost.nextIid = 1_000_000;
    if (["takeToHand", "orderToTop", "millFromTop"].includes(pc.mode)) {
      pc.candidates.push({ ...ghost.players[0].spellbook[0] ?? ghost.players[1].spellbook[0] ?? pc.candidates[0]! });
      expect(has(ghost, /is in BOTH|card count/, { cardCount: countCards(s) })).toBe(true);
    } else if (pc.mode === "sealPrepared") {
      // Synthetic descriptors: the ghost maps to no slot of the target.
      expect(has(ghost, /candidate 999999 \(CMP-V\) maps to no prepared slot/)).toBe(true);
    } else {
      expect(has(ghost, /candidate 999999 \(CMP-V\) is in no zone/)).toBe(true);
    }
    const dead = structuredClone(s);
    dead.pendingChoice!.candidates = [];
    dead.pendingChoice!.optional = false;
    expect(has(dead, /deadlocked/)).toBe(true);
  });
});

describe("engine bugs found by the checker (fixed 2026-10-06)", () => {
  it("a Flame-Mirror-redirected Burn the Letter keeps cards in exactly one zone", async () => {
    // DIV-039 redirected onto its caster (DIV-026 sets item.redirected): context.ts
    // stages candidates from the CASTER'S hand, but apply's discardFromOpponentHand
    // pushes the pick into otherPlayer(chooser)'s discard — the card ends up in P0's
    // hand AND P1's discard. Same root cause: ABJ-010/030 sealPrepared seal nothing.
    const { apply, getEffect, makeContext } = await import("../src/index.ts");
    const { emptyState, prepare, stackItem, card } = await import("./handbuilt.ts");
    const s = emptyState();
    s.players[0].hand.push(card(s, "CMP-V"));
    s.players[1].hand.push(card(s, "CMP-S"));
    const slot = prepare(s, 0, "DIV-039");
    s.players[0].prepared[slot]!.cast = true;
    const item = stackItem(s, 0, slot, { redirected: true });
    const spell = s.players[0].prepared[slot]!.spell;
    getEffect("DIV-039")!(makeContext(s, 0, spell, [], item), spell);
    expect(s.pendingChoice?.mode).toBe("discardFromOpponentHand");
    const pick = s.pendingChoice!.candidates[0]!;
    const after = apply(s, { type: "choose", iid: pick.iid }, 0).state;
    expect(checkInvariants(after, { cardCount: countCards(s) })).toEqual([]);
  });
});
