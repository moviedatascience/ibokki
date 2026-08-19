import { describe, expect, it } from "vitest";
import { legalActions, presetDeck } from "@ibokki/engine";
import { act, addNote, autoplay, autoPlayBots, createMatch, renderState, resolveDeck, transcriptView } from "../src/matches.ts";

describe("MCP match loop", () => {
  it("drives a vs-bot match to completion (index 0 is always 'pass')", () => {
    const m = createMatch("Evocation", "Abjuration", 7, "0");
    let guard = 0;
    while (m.state.phase !== "gameover" && guard < 8000) {
      act(m, 0);
      guard++;
    }
    expect(m.state.phase).toBe("gameover");
    expect([0, 1, null]).toContain(m.state.winner);
  });

  it("controls='both' lets one driver play both sides", () => {
    const m = createMatch("Divination", "Evocation", 3, "both");
    let guard = 0;
    while (m.state.phase !== "gameover" && guard < 8000) {
      act(m, 0);
      guard++;
    }
    expect(m.state.phase).toBe("gameover");
  });

  it("opens in the Prepare phase with numbered prepare actions (verbose render)", () => {
    const m = createMatch("Evocation", "Divination", 1, "0");
    const text = renderState(m, true);
    expect(text).toContain("PREPARE phase");
    expect(text).toContain("Legal actions");
    // Listings carry stable [slug] ids alongside the index (2026-07-08 CLI ergonomics fix).
    expect(text).toMatch(/0 \[done\]: done preparing/);
    expect(text).toMatch(/\d+ \[prep-[a-z0-9-]+\]: prepare /); // at least one spell can be prepared
  });

  it("compact render (the default) carries the same decision surface in far fewer tokens", () => {
    const m = createMatch("Evocation", "Divination", 1, "0");
    const compact = renderState(m);
    expect(compact).toContain("PREPARE");
    expect(compact).toMatch(/legal: 0:done/); // index:slug pairs
    expect(compact).toMatch(/\d+:prep-[a-z0-9-]+/);
    expect(compact.length).toBeLessThan(renderState(m, true).length / 2);
  });

  it("acts by stable slug, and rejects unknown slugs loudly", () => {
    const m = createMatch("Evocation", "Divination", 5, "0");
    autoPlayBots(m); // the new_match tool does this — the round leader (and so first priority) may be the bot
    const out = act(m, undefined, undefined, "done");
    expect(out).toContain("done preparing");
    expect(act(m, undefined, undefined, "no-such-slug")).toContain('No legal action with slug');
  });

  it("autoplay(gameOver) pilots the controlled side to termination", () => {
    const m = createMatch("Evocation", "Abjuration", 21, "0");
    const out = autoplay(m, "gameOver", "heuristic", 2000);
    expect(m.state.phase).toBe("gameover");
    expect(out).toContain("stopped: game over");
    expect(out).toContain(" auto:"); // pilot actions are tagged in the transcript
  });

  it("autoplay(roundEnd) stops at the next round's first decision", () => {
    const m = createMatch("Evocation", "Abjuration", 23, "0");
    expect(m.state.round).toBe(1);
    const out = autoplay(m, "roundEnd", "heuristic", 2000);
    expect(m.state.round).toBe(2);
    expect(m.state.phase).not.toBe("gameover");
    expect(out).toContain("stopped: round 2 begins");
  });

  it("resolves decks: default, preset name, custom JSON, and rejects bad specs", () => {
    expect(resolveDeck("Evocation").label).toBe("Evocation");
    expect(resolveDeck("Evocation", "Bastion").label).toBe("Bastion");

    const custom = { ...presetDeck("Riptide")!, name: "My Riptide" };
    const r = resolveDeck("Divination", JSON.stringify(custom));
    expect(r.label).toBe("My Riptide");
    expect(r.deck.resourceDeck).toHaveLength(40);

    expect(() => resolveDeck("Evocation", "NoSuchPreset")).toThrow(/preset name/);
    // legal JSON but violates construction rules (empty deck)
    expect(() => resolveDeck("Evocation", JSON.stringify({ spellbook: [], resourceDeck: [] }))).toThrow(/deck rules/);
  });

  it("plays a match with an overridden deck and labels it by deck name", () => {
    const m = createMatch("Evocation", "Abjuration", 11, "0", "Emberworks", "Bastion");
    expect(m.labels).toEqual(["Emberworks", "Bastion"]);
    expect(m.transcript[0]).toContain("Emberworks (P0) vs Bastion (P1)");
    act(m, 0);
    expect(m.state.phase).not.toBe("gameover");
  });
});

describe("pvp mode (exp-8d): two separately-sighted pilots on one match", () => {
  const prepOne = (m: ReturnType<typeof createMatch>, seat: 0 | 1): string => {
    const legal = legalActions(m.state, seat);
    const i = legal.findIndex((a) => a.type === "prepareSpell");
    expect(i).toBeGreaterThanOrEqual(0);
    return act(m, i, undefined, undefined, false, seat);
  };

  it("requires a seat and lets both seats prepare simultaneously", () => {
    const m = createMatch("Divination", "Abjuration", 42, "pvp");
    expect(act(m, 0)).toContain("PILOT-vs-PILOT");
    prepOne(m, 0);
    prepOne(m, 1); // the other seat acts in the SAME prepare phase
    expect(m.state.players[0].prepared.length).toBe(1);
    expect(m.state.players[1].prepared.length).toBe(1);
  });

  it("redacts the other pilot's face-down preps and private notes; the saved record keeps everything", () => {
    const m = createMatch("Divination", "Abjuration", 43, "pvp");
    prepOne(m, 1);
    addNote(m, "my secret plan", 1);
    const p0view = transcriptView(m, 0).join("\n");
    const p1view = transcriptView(m, 1).join("\n");
    const record = transcriptView(m).join("\n");
    expect(p0view).toContain("prepare a spell (face-down)");
    expect(p0view).not.toContain("my secret plan");
    expect(p1view).toContain("my secret plan");
    expect(p1view).not.toContain("(face-down)"); // your own preps stay named for you
    expect(record).toContain("my secret plan");
    expect(record).not.toContain("(face-down)"); // the record names the real spell
  });

  it("rejects acting out of turn with a cheap WAITING line and disables autoplay", () => {
    const m = createMatch("Evocation", "Abjuration", 44, "pvp");
    let guard = 0;
    while (m.state.phase === "prepare" && guard++ < 40) {
      for (const seat of [0, 1] as const) {
        const legal = legalActions(m.state, seat);
        const done = legal.findIndex((a) => a.type === "donePreparing");
        if (done >= 0) act(m, done, undefined, undefined, false, seat);
      }
    }
    expect(m.state.phase).toBe("main");
    const waiter = m.state.priorityPlayer === 0 ? 1 : 0;
    expect(act(m, 0, undefined, undefined, false, waiter)).toContain("WAITING");
    expect(autoplay(m, "roundEnd", "heuristic", 10)).toContain("disabled");
  });
});
