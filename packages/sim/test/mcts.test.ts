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
import { HeuristicBot, IsmctsBot } from "../src/index.ts";
import { runMatch } from "../src/runMatch.ts";
import { RandomBot } from "../src/agent.ts";

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

/** A real mid-game decision point where P0 can legally cast a damaging spell for the win. */
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
  const state = structuredClone(mid);
  state.players[1].hp = 1;
  state.players[1].wards = [];
  state.players[1].prepared = state.players[1].prepared.filter((p) => p.cast);
  return { state, legal: legalActions(state, 0) };
}

describe("IsmctsBot", () => {
  const budget = { iterations: 80, rolloutPlies: 16 };

  it("finds the lethal line", () => {
    const { state, legal } = lethalSetup();
    const action = new IsmctsBot(7, budget).chooseAction(redact(state, 0), legal, state);
    expect(action.type).toBe("cast");
  });

  it("is deterministic for a fixed seed (no maxMillis)", () => {
    const { state, legal } = lethalSetup();
    const a = new IsmctsBot(19, budget).chooseAction(redact(state, 0), legal, state);
    const b = new IsmctsBot(19, budget).chooseAction(redact(state, 0), legal, state);
    expect(a).toEqual(b);
  });

  it("plays a full short game against the random bot and wins", () => {
    const result = runMatch({
      seed: 77,
      startingHp: 8,
      decks: [deckFor("Evocation"), deckFor("Divination")],
      agents: [new IsmctsBot(3, { iterations: 30, rolloutPlies: 12 }), new RandomBot(4)],
    });
    expect(result.endReason).not.toBeNull();
    expect(result.winner).toBe(0);
  });
});
