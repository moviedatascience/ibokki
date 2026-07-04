/** Agent interface — anything that can choose an action from a redacted view. */
import { getCard, getComponent, type Cost } from "@ibokki/cards";
import { combinedSymbols, emptyCost, rngInt, type Action, type PlayerView, type PreparedView } from "@ibokki/engine";

export interface Agent {
  readonly name: string;
  /** Given what this player can see and the legal actions, pick one. */
  chooseAction(view: PlayerView, legal: Action[]): Action;
}

/** Picks uniformly at random — the fuzz tester / rules-robustness baseline. */
export class RandomBot implements Agent {
  readonly name = "random";
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  chooseAction(_view: PlayerView, legal: Action[]): Action {
    let idx: number;
    [idx, this.state] = rngInt(this.state, legal.length);
    return legal[idx]!;
  }
}

/**
 * A simple greedy heuristic: cast the biggest available spell, otherwise make
 * progress by attaching a component, otherwise pass. Exercises the cast/damage
 * paths and produces meaningful HP-based outcomes for balance sampling.
 */
export class HeuristicBot implements Agent {
  readonly name = "heuristic";
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  chooseAction(view: PlayerView, legal: Action[]): Action {
    // Resolve a pending look/loot/scry choice (take the first candidate).
    const choices = legal.filter((a) => a.type === "choose");
    if (choices.length > 0) return choices[0]!;

    // After casting you keep priority over your own spell — proceed (pass) rather than
    // react to yourself or retract.
    const top = view.stack[view.stack.length - 1];
    if (top && top.controller === view.you) {
      const pass = legal.find((a) => a.type === "pass");
      if (pass) return pass;
    }

    // Prepare phase: fill prepared slots (book is sorted strongest-first), then finish.
    const prepares = legal.filter((a) => a.type === "prepareSpell");
    if (prepares.length > 0) return prepares[0]!;
    const done = legal.find((a) => a.type === "donePreparing");
    if (done) return done;

    const casts = legal.filter((a) => a.type === "cast");
    if (casts.length > 0) {
      // Prefer casting the higher-level (bigger) prepared spell.
      let best = casts[0]!;
      let bestLvl = -1;
      for (const c of casts) {
        if (c.type !== "cast") continue;
        const prep = view.self.prepared[c.preparedIndex];
        const lvl = prep ? estimateLevel(prep.spellDefId) : 0;
        if (lvl > bestLvl) {
          bestLvl = lvl;
          best = c;
        }
      }
      return best;
    }

    // Greedily fire a Reaction when one is ready (cheap way to exercise counters).
    const reactions = legal.filter((a) => a.type === "castReaction");
    if (reactions.length > 0) return reactions[0]!;

    const attaches = legal.filter((a) => a.type === "attach");
    if (attaches.length > 0) {
      // Reactions must be fueled BEFORE the reaction window (their cost is
      // pre-attached, never paid from hand mid-window), so aim attaches first at
      // unfueled prepared Reactions the component actually helps pay, then at
      // unfueled castable spells, then fall back to a random attach.
      const useful = (a: Action, wantReaction: boolean): boolean => {
        if (a.type !== "attach") return false;
        const prep = view.self.prepared[a.preparedIndex];
        const handIdx = view.self.handIids.indexOf(a.handIid);
        const comp = handIdx >= 0 ? getComponent(view.self.hand[handIdx]!) : undefined;
        if (!prep || !comp) return false;
        const def = prep.spellDefId ? getCard(prep.spellDefId) : undefined;
        if (!def || !def.cost || prep.cast || prep.sealed) return false;
        if ((def.type === "Reaction") !== wantReaction) return false;
        const missing = missingCost(def.cost, prep);
        return comp.symbols.V * missing.V + comp.symbols.S * missing.S + comp.symbols.M * missing.M > 0;
      };
      const reactionFuel = attaches.find((a) => useful(a, true));
      if (reactionFuel) return reactionFuel;
      const spellFuel = attaches.find((a) => useful(a, false));
      if (spellFuel) return spellFuel;
      let idx: number;
      [idx, this.state] = rngInt(this.state, attaches.length);
      return attaches[idx]!;
    }

    return { type: "pass" };
  }
}

/** Symbols a prepared spell still needs beyond what's already attached. */
function missingCost(cost: Cost, prep: PreparedView): Cost {
  const comps = prep.attached.map((defId) => getComponent(defId)).filter((c) => c !== undefined);
  const have = comps.length > 0 ? combinedSymbols(comps) : emptyCost();
  return {
    V: Math.max(0, cost.V - have.V),
    S: Math.max(0, cost.S - have.S),
    M: Math.max(0, cost.M - have.M),
  };
}

/** The spell's level (used as a tie-breaker to cast the bigger spell first). */
function estimateLevel(spellDefId: string | null): number {
  if (!spellDefId) return 0;
  return getCard(spellDefId)?.level ?? 1;
}

export type AgentKind = "random" | "heuristic";

export function makeAgent(kind: AgentKind, seed: number): Agent {
  return kind === "random" ? new RandomBot(seed) : new HeuristicBot(seed);
}
