import { describe, expect, it } from "vitest";
import { apply, createGame, deckFor, legalActions, type Action, type PlayerView } from "@ibokki/engine";
import { HeuristicBot, makeAgent, runMatch, runMatchup } from "../src/index.ts";
import { describeAction, slugFor } from "../src/render.ts";

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

describe("action slugs (stable playtest-CLI addressing)", () => {
  it("every legal action gets a slug, and equal slugs are interchangeable actions", () => {
    // Walk a few random-ish states and check the invariants on each decision point.
    let s = createGame({ seed: 7, players: [deckFor("Evocation"), deckFor("Divination")] });
    for (let step = 0; step < 60 && s.phase !== "gameover"; step++) {
      const actor = s.priorityPlayer;
      const legal = legalActions(s, actor);
      const byslug = new Map<string, string>(); // slug -> label
      for (const a of legal) {
        const slug = slugFor(s, a, actor);
        expect(slug).toMatch(/^[a-z0-9?-]+$/); // lowercase, typable, no spaces
        const label = describeAction(s, a, actor);
        // Same slug must mean the same effect: identical human label.
        const prior = byslug.get(slug);
        if (prior !== undefined) expect(label).toBe(prior);
        else byslug.set(slug, label);
      }
      s = apply(s, legal[step % legal.length]!, actor).state;
    }
  });
});

describe("HeuristicBot reaction timing", () => {
  /** A minimal reaction-window view: opponent's spell on top, our reaction(s) ready. */
  function windowView(threatDefId: string, hp: number, reactionDefIds: string[]): PlayerView {
    const view = {
      you: 0,
      stack: [{ sid: 1, controller: 1, spellDefId: threatDefId, isReaction: false, cancelled: false, targetSid: null }],
      self: {
        hp,
        prepared: reactionDefIds.map((defId) => ({ spellDefId: defId, faceDown: true, attached: [], cast: false, sealed: false })),
        hand: [],
        handIids: [],
      },
    };
    return view as unknown as PlayerView;
  }
  const legalFor = (n: number): Action[] => [
    { type: "pass" },
    ...Array.from({ length: n }, (_, i) => ({ type: "castReaction", preparedIndex: i }) as Action),
  ];

  it("a cheap 1-S prevent happily eats a 2-damage Spark", () => {
    const action = new HeuristicBot(1).chooseAction(windowView("EVO-001", 30, ["ABJ-007"]), legalFor(1));
    expect(action.type).toBe("castReaction");
  });

  it("holds a 2-card cancel (Phase Shift) against a Spark — a losing trade", () => {
    const action = new HeuristicBot(1).chooseAction(windowView("EVO-001", 30, ["ABJ-014"]), legalFor(1));
    expect(action.type).toBe("pass");
  });

  it("fires the 2-card cancel at a 5-damage Fireball", () => {
    const action = new HeuristicBot(1).chooseAction(windowView("EVO-017", 30, ["ABJ-014"]), legalFor(1));
    expect(action.type).toBe("castReaction");
  });

  it("with both ready, fires the CHEAPEST sufficient reaction", () => {
    const action = new HeuristicBot(1).chooseAction(windowView("EVO-017", 30, ["ABJ-014", "ABJ-007"]), legalFor(2));
    expect(action).toEqual({ type: "castReaction", preparedIndex: 1 }); // Echo Shield (S), not Phase Shift (SS)
  });

  it("desperation: at low HP it fires even a losing trade at a cantrip", () => {
    const action = new HeuristicBot(1).chooseAction(windowView("EVO-001", 8, ["ABJ-014"]), legalFor(1));
    expect(action.type).toBe("castReaction");
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
