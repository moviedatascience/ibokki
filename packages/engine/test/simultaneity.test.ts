/**
 * Simultaneity twin tests (OPENSKY_REVIEW §D.21). Ibokki has no "simultaneous" damage:
 * every damage step is applied in sequence and the game ends the instant a wizard hits
 * 0 HP (state-ops endGame). These tests PIN today's behaviour so a rules change is a
 * deliberate decision, not a refactor accident. Rule text: Design_Doc.md, "Priority &
 * Stack Model" (pinned 2026-10-06). Changing an expectation here = a design change.
 */
import { describe, expect, it } from "vitest";
import { checkInvariants, type GameEvent } from "../src/index.ts";
import { beginTurn } from "../src/mechanics.ts";
import { resolveTop } from "../src/stack.ts";
import { card, emptyState, prepare, stackItem } from "./handbuilt.ts";

describe("damage is sequential, never simultaneous", () => {
  it("a reflect ward that kills the attacker mid-spell wins for the defender — the spell's overflow never lands", () => {
    // P0 (2-damage Spark) at 1 HP vs P1 at 1 HP behind a weathered Searing Ward (1 HP,
    // reflect 1). The ward soaks 1 and reflects 1 BEFORE the overflow reaches P1.
    const s = emptyState();
    s.players[0].hp = 1;
    s.players[1].hp = 1;
    s.players[1].wards.push({ wid: s.nextIid++, hp: 1, reflectOnPrevent: 1 });
    const slot = prepare(s, 0, "EVO-001"); // Spark: deal 2
    s.players[0].prepared[slot]!.cast = true;
    s.stack.push(stackItem(s, 0, slot));
    const events: GameEvent[] = [];
    resolveTop(s, events);

    expect(s.phase).toBe("gameover");
    expect(s.winner).toBe(1); // the defender wins
    expect(s.endReason).toBe("hp");
    expect(s.players[0].hp).toBe(0);
    expect(s.players[1].hp).toBe(1); // the second point of Spark never arrived
    // Terminal snapshot: the soaked ward is left at 0 HP (the game ended mid-step).
    expect(s.players[1].wards[0]?.hp).toBe(0);
    expect(checkInvariants(s)).toEqual([]);
  });

  it("twin: without the reflect, the same lethal spell wins for the attacker", () => {
    const s = emptyState();
    s.players[0].hp = 1;
    s.players[1].hp = 1;
    s.players[1].wards.push({ wid: s.nextIid++, hp: 1 });
    const slot = prepare(s, 0, "EVO-001");
    s.players[0].prepared[slot]!.cast = true;
    s.stack.push(stackItem(s, 0, slot));
    resolveTop(s, []);
    expect(s.winner).toBe(0);
    expect(s.players[1].hp).toBe(0);
  });

  it("at turn start, a lethal Burn tick resolves before a lethal Prophecy — the prophecy never fires", () => {
    const s = emptyState();
    s.players[0].hp = 2;
    s.players[0].burn = 2;
    s.players[0].prophecies.push({ amount: 5, turnsLeft: 1, pierce: false, defId: "DIV-012" });
    s.turnCount = 3;
    const events: GameEvent[] = [];
    beginTurn(s, events);

    expect(s.winner).toBe(1);
    const types = events.map((e) => e.type);
    expect(types).toContain("burnTick");
    expect(types).not.toContain("prophecyFired");
    expect(s.players[0].prophecies).toHaveLength(1); // still inscribed: the fuse never ticked
    expect(s.players[0].hp).toBe(0); // only the burn landed
  });

  it("at turn start, the active wizard's own Burn ticks before Wildfire ticks the opponent's — mutual lethal burn is NOT a draw", () => {
    // Twin of the above across players: both wizards at 1 HP with 1 Burn; P0 (active)
    // owns Wildfire, so P1's Burn would also tick now. P0's tick comes first.
    const s = emptyState();
    for (const p of s.players) {
      p.hp = 1;
      p.burn = 1;
    }
    s.players[0].ongoing.push({ id: s.nextIid++, owner: 0, kind: "burnAlsoTicksOwnTurn", value: 1, expiry: "endOfRound" });
    s.turnCount = 3;
    beginTurn(s, []);
    expect(s.winner).toBe(1); // the active player dies first
    expect(s.players[1].hp).toBe(1); // P1's burn never ticked
    expect(s.players[1].burn).toBe(1);
  });

  it("exhaustion damage from a draw mid-resolution ends the game at once; the spell's later steps still run but cannot change the winner", () => {
    // P0 resolves Anticipate (DIV-014: draw 1, then deal 1) with an empty deck: the
    // draw reshuffles the discard for 2 exhaustion damage, which kills P0 (2 HP). P1
    // sits at 1 HP — the spell's own damage step would have been lethal too.
    const s = emptyState();
    s.players[0].hp = 2;
    s.players[1].hp = 1;
    s.players[0].discard.push(card(s, "CMP-V"));
    const slot = prepare(s, 0, "DIV-014");
    s.players[0].prepared[slot]!.cast = true;
    s.stack.push(stackItem(s, 0, slot, { isReaction: true }));
    const events: GameEvent[] = [];
    resolveTop(s, events);

    expect(s.phase).toBe("gameover");
    expect(s.winner).toBe(1); // the first wizard to reach 0 loses
    expect(s.endReason).toBe("hp");
    expect(s.players[0].hp).toBe(0);
    const gameOverAt = events.findIndex((e) => e.type === "gameOver");
    expect(gameOverAt).toBeGreaterThanOrEqual(0);
    expect(events.filter((e) => e.type === "gameOver")).toHaveLength(1);
    // Pinned (2026-10-06): effects don't check for game over between steps, so the
    // `deal 1` after the lethal draw STILL LANDS — P1 finishes at 0 HP yet keeps the
    // win (endGame is first-call-wins). The OUTCOME is sequential; the final HP display
    // is not. A design change here means guarding effect steps on phase === "gameover".
    expect(s.players[1].hp).toBe(0);
    const p1Damage = events.findIndex((e) => e.type === "damage" && e.target === 1);
    expect(p1Damage).toBeGreaterThan(gameOverAt);
  });
});
