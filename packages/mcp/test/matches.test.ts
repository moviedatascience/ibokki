import { describe, expect, it } from "vitest";
import { presetDeck } from "@ibokki/engine";
import { act, createMatch, renderState, resolveDeck } from "../src/matches.ts";

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

  it("opens in the Prepare phase with numbered prepare actions", () => {
    const m = createMatch("Evocation", "Divination", 1, "0");
    const text = renderState(m);
    expect(text).toContain("PREPARE phase");
    expect(text).toContain("Legal actions");
    // Listings carry stable [slug] ids alongside the index (2026-07-08 CLI ergonomics fix).
    expect(text).toMatch(/0 \[done\]: done preparing/);
    expect(text).toMatch(/\d+ \[prep-[a-z0-9-]+\]: prepare /); // at least one spell can be prepared
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
