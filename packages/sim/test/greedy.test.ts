import { describe, expect, it } from "vitest";
import { getCard } from "@ibokki/cards";
import {
  apply,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  redact,
  type Action,
  type GameState,
} from "@ibokki/engine";
import { GreedySimBot, HeuristicBot } from "../src/index.ts";
import { DEFAULT_WEIGHTS, evaluateState, WIN_SCORE } from "../src/evaluate.ts";
import { CardStatsCollector } from "../src/telemetry.ts";
import { runMatch } from "../src/runMatch.ts";
import { runMatchup } from "../src/report.ts";

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

describe("evaluateState", () => {
  const start = createGame({ seed: 3, players: [deckFor("Evocation"), deckFor("Abjuration")] });

  it("is antisymmetric (my score is the negative of the opponent's)", () => {
    expect(evaluateState(start, 0)).toBeCloseTo(-evaluateState(start, 1), 9);
  });

  it("more HP is better, burn and dooms are worse", () => {
    const hurt = structuredClone(start);
    hurt.players[0].hp -= 5;
    expect(evaluateState(hurt, 0)).toBeLessThan(evaluateState(start, 0));

    const burned = structuredClone(start);
    burned.players[0].burn = 3;
    expect(evaluateState(burned, 0)).toBeLessThan(evaluateState(start, 0));

    const doomed = structuredClone(start);
    doomed.players[0].prophecies.push({ amount: 6, turnsLeft: 2, pierce: false, defId: "DIV-001" });
    expect(evaluateState(doomed, 0)).toBeLessThan(evaluateState(start, 0));
  });

  it("terminal outcomes dominate every positional score", () => {
    const done = playUntil(
      createGame({ seed: 5, startingHp: 10, players: [deckFor("Evocation"), deckFor("Divination")] }),
      () => false,
    );
    expect(isTerminal(done)).toBe(true);
    if (done.winner !== null) {
      expect(Math.abs(evaluateState(done, done.winner))).toBeGreaterThan(WIN_SCORE / 2);
      expect(evaluateState(done, done.winner)).toBeGreaterThan(0);
    }
    expect(DEFAULT_WEIGHTS.hp).toBeGreaterThan(0); // weights stay exported/tunable
  });
});

describe("GreedySimBot", () => {
  /** A real mid-game decision point where P0 can legally cast a damaging spell. */
  function lethalSetup(): { state: GameState; legal: Action[] } {
    const damagingCastAvailable = (s: GameState): boolean => {
      if (s.phase !== "main" || s.priorityPlayer !== 0 || s.stack.length > 0 || s.pendingChoice) return false;
      return legalActions(s, 0).some((a) => {
        if (a.type !== "cast") return false;
        const defId = s.players[0].prepared[a.preparedIndex]?.spell.defId;
        return defId !== undefined && /deal \d+/i.test(getCard(defId)?.text ?? "");
      });
    };
    const mid = playUntil(
      createGame({ seed: 42, players: [deckFor("Evocation"), deckFor("Abjuration")] }),
      damagingCastAvailable,
    );
    expect(damagingCastAvailable(mid)).toBe(true); // the walk found such a spot
    const state = structuredClone(mid);
    state.players[1].hp = 1; // opponent on the ropes...
    state.players[1].wards = []; // ...with nothing to soak
    state.players[1].prepared = state.players[1].prepared.filter((p) => p.cast); // and no reactions held
    return { state, legal: legalActions(state, 0) };
  }

  it("takes the lethal line when the engine says it kills", () => {
    const { state, legal } = lethalSetup();
    const bot = new GreedySimBot(7);
    const action = bot.chooseAction(redact(state, 0), legal, state);
    expect(action.type).toBe("cast");
  });

  it("is deterministic and beats the random bot from either seat", () => {
    const cfg = (seed: number) => ({
      seed,
      startingHp: 10,
      decks: [deckFor("Evocation"), deckFor("Abjuration")] as [ReturnType<typeof deckFor>, ReturnType<typeof deckFor>],
    });
    const fast = { determinizations: 2, rolloutPlies: 20 };
    const a = runMatch({ ...cfg(31), agents: [new GreedySimBot(1, fast), new HeuristicBot(2)] });
    const b = runMatch({ ...cfg(31), agents: [new GreedySimBot(1, fast), new HeuristicBot(2)] });
    expect(a.hash).toBe(b.hash); // same seeds -> byte-identical game

    const vsRandom = runMatchup({
      school1: "Evocation",
      school2: "Abjuration",
      agent1: "greedy",
      agent2: "random",
      games: 2,
      baseSeed: 60,
      startingHp: 10,
      paired: true, // one game per seat
    });
    expect(vsRandom.p1Wins).toBe(2);
  });
});

describe("CardStatsCollector", () => {
  it("tallies casts and win correlation across a batch", () => {
    const collector = new CardStatsCollector();
    const stats = runMatchup({
      school1: "Evocation",
      school2: "Divination",
      agent1: "heuristic",
      agent2: "heuristic",
      games: 3,
      baseSeed: 9,
      collector,
    });
    expect(stats.p1Wins + stats.p2Wins + stats.draws).toBe(3);
    expect(collector.games).toBe(3);
    const cards = collector.toJSON();
    const used = Object.values(cards);
    expect(used.length).toBeGreaterThan(0);
    expect(used.some((c) => c.casts > 0)).toBe(true);
    for (const c of used) expect(c.gamesWon).toBeLessThanOrEqual(c.gamesUsed);
    expect(collector.table()).toContain("WR-used");
  });

  it("paired mode replays each seed with seats swapped and still sums correctly", () => {
    const stats = runMatchup({
      school1: "Evocation",
      school2: "Abjuration",
      agent1: "heuristic",
      agent2: "heuristic",
      games: 10,
      baseSeed: 1,
      paired: true,
    });
    expect(stats.p1Wins + stats.p2Wins + stats.draws).toBe(10);
  });
});
