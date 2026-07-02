import { describe, expect, it } from "vitest";
import { deckFor } from "@ibokki/engine";
import { makeAgent, runMatch, runMatchup } from "../src/index.ts";

describe("runMatch", () => {
  it("produces a terminal result", () => {
    const result = runMatch({
      seed: 1,
      decks: [deckFor("Evocation"), deckFor("Abjuration")],
      agents: [makeAgent("heuristic", 10), makeAgent("heuristic", 20)],
    });
    expect([0, 1, null]).toContain(result.winner);
    expect(result.endReason).not.toBeNull();
    expect(result.turns).toBeGreaterThan(0);
  });

  it("is deterministic for a fixed seed and agents", () => {
    const cfg = () => ({
      seed: 99,
      decks: [deckFor("Evocation"), deckFor("Divination")] as const,
      agents: [makeAgent("heuristic", 1), makeAgent("heuristic", 2)] as const,
    });
    const a = runMatch({ ...cfg(), decks: [...cfg().decks], agents: [...cfg().agents] });
    const b = runMatch({ ...cfg(), decks: [...cfg().decks], agents: [...cfg().agents] });
    expect(a.hash).toBe(b.hash);
  });
});

describe("runMatchup", () => {
  it("plays a batch and tallies wins that sum to the game count", () => {
    const stats = runMatchup({
      school1: "Evocation",
      school2: "Abjuration",
      agent1: "heuristic",
      agent2: "heuristic",
      games: 50,
      baseSeed: 1,
    });
    expect(stats.p1Wins + stats.p2Wins + stats.draws).toBe(50);
    expect(stats.avgTurns).toBeGreaterThan(0);
  });
});
