/**
 * IsmctsBot — single-tree Information-Set MCTS (SO-ISMCTS with availability
 * counts), the strong search bot and the human-facing "hard" opponent.
 *
 * Each iteration samples a fresh hidden-information world at the root (engine
 * `determinize()`), then walks ONE tree shared across worlds. Edges are keyed
 * by action SLUG (the information-set identity of an action — stable across
 * worlds, unlike instance ids), and an edge's UCB exploration term uses its
 * availability count: how often the action was even legal when its parent was
 * visited. Leaves are scored by a truncated heuristic-policy rollout followed
 * by `evaluateState`, squashed to [-1, 1].
 *
 * Difficulty knobs: `iterations` (strength), `evalNoise` (blunder dial),
 * `exploration`, `rolloutPlies`, and `maxMillis` (server latency cap — leave
 * unset in sims/tests, where budgets must be deterministic).
 *
 * Built entirely on Phase 1 pieces: determinize (sampler), HeuristicBot
 * (rollout policy), evaluateState (leaf evaluator).
 */
import {
  apply,
  determinize,
  isTerminal,
  legalActions,
  redact,
  rngInt,
  rngNext,
  type Action,
  type GameState,
  type PlayerId,
  type PlayerView,
} from "@ibokki/engine";
import { HeuristicBot, type Agent } from "./agent.ts";
import { evaluateState } from "./evaluate.ts";
import { slugFor } from "./render.ts";

export interface MctsOptions {
  /** Search iterations per decision (one sampled world each). Default 300. */
  iterations?: number;
  /** UCB exploration constant (values live in [-1, 1]). Default 0.4. */
  exploration?: number;
  /** Rollout length in plies past the expanded node. Default 24. */
  rolloutPlies?: number;
  /** Uniform noise added to leaf values — the blunder dial for lower difficulties. Default 0. */
  evalNoise?: number;
  /** Wall-clock cap per decision, ms. NON-DETERMINISTIC — for live servers only. */
  maxMillis?: number;
  /** tanh(score/evalScale) squashing: lower = sharper value signal vs exploration
   * noise; higher = more exploration in close positions. Default 12. */
  evalScale?: number;
}

/** Virtual visits seeding each ROOT edge with its greedy forced-line value, so
 * UCB starts from exact one-ply estimates instead of zero. The tree then spends
 * its budget REFINING a greedy-strength read (search ≥ greedy by construction
 * at low budgets) rather than rediscovering it through noisy rollouts. */
const PRIOR_VISITS = 8;

interface Edge {
  /** A concrete instance of this slug's action (root edges hold TRUE-state actions). */
  action: Action;
  child: TreeNode;
  visits: number;
  /** Summed leaf values from the perspective of the player who acts at the parent. */
  total: number;
  /** Times this action was legal when the parent was UCB-selected over. */
  availability: number;
}

interface TreeNode {
  edges: Map<string, Edge>;
}

const newNode = (): TreeNode => ({ edges: new Map() });

export class IsmctsBot implements Agent {
  readonly name = "search";
  private rng: number;
  private readonly fallback: HeuristicBot;
  private readonly iterations: number;
  private readonly exploration: number;
  private readonly rolloutPlies: number;
  private readonly evalNoise: number;
  private readonly maxMillis: number | undefined;
  private readonly evalScale: number;

  constructor(seed: number, opts?: MctsOptions) {
    this.rng = seed | 0;
    this.fallback = new HeuristicBot((seed ^ 0xc2b2ae35) | 0);
    this.iterations = opts?.iterations ?? 300;
    this.exploration = opts?.exploration ?? 0.4;
    this.rolloutPlies = opts?.rolloutPlies ?? 24;
    this.evalNoise = opts?.evalNoise ?? 0;
    this.maxMillis = opts?.maxMillis;
    this.evalScale = opts?.evalScale ?? 12;
  }

  chooseAction(view: PlayerView, legal: Action[], state?: GameState): Action {
    if (legal.length === 1) return legal[0]!;
    if (!state) return this.fallback.chooseAction(view, legal);
    const me = view.you;

    // Root candidates come from the TRUE legal list (world legality can differ,
    // e.g. a trainer that is a no-op against some sampled hands) so the returned
    // action is guaranteed valid in the real game. retractCast is excluded — a
    // human take-back affordance that lets a bot livelock in cast→retract→cast
    // (retracting never advances the turn counter, so no cap ever fires). detach
    // is a one-way valve — only before any attach this turn — for the same
    // reason: it makes a turn's ply count strictly bounded (see greedy.ts).
    const rootActions = new Map<string, Action>();
    for (const a of legal) {
      if (a.type === "retractCast") continue;
      if (a.type === "detach" && state.players[me].componentPlayedThisTurn) continue;
      const slug = slugFor(state, a, me);
      if (!rootActions.has(slug)) rootActions.set(slug, a);
    }
    if (rootActions.size === 0) return this.fallback.chooseAction(view, legal);
    if (rootActions.size === 1) return rootActions.values().next().value!;

    // Decisive-move probe: if an action wins OUTRIGHT with everyone passing,
    // take it before searching. Value saturation otherwise spreads visits evenly
    // across "all roads win" positions and the bot fiddles while holding lethal.
    // (If the opponent holds an answer they get to use it — taking the shot is
    // still the percentage play.)
    let probeSeed: number;
    [probeSeed, this.rng] = rngInt(this.rng, 2 ** 31);
    const probeWorld = determinize(state, me, probeSeed);
    for (const [, action] of rootActions) {
      if (action.type === "pass") continue;
      if (this.winsOutright(probeWorld, action, me)) return action;
    }

    // Seed every root edge with its forced-line value in two shared sample
    // worlds — the same estimate GreedySimBot acts on, as PRIOR_VISITS of
    // virtual evidence. Sharing worlds across candidates pairs the comparison.
    const root = newNode();
    let priorSeedA: number, priorSeedB: number;
    [priorSeedA, this.rng] = rngInt(this.rng, 2 ** 31);
    [priorSeedB, this.rng] = rngInt(this.rng, 2 ** 31);
    const priorWorlds = [determinize(state, me, priorSeedA), determinize(state, me, priorSeedB)];
    for (const [slug, action] of rootActions) {
      let sum = 0;
      let n = 0;
      for (const w of priorWorlds) {
        const v = this.forcedLineValue(w, action, me);
        if (v !== null) {
          sum += v;
          n++;
        }
      }
      const v0 = n > 0 ? sum / n : 0;
      root.edges.set(slug, {
        action,
        child: newNode(),
        visits: PRIOR_VISITS,
        total: (me === 0 ? v0 : -v0) * PRIOR_VISITS,
        availability: PRIOR_VISITS,
      });
    }

    const started = Date.now();
    for (let i = 0; i < this.iterations; i++) {
      if (this.maxMillis !== undefined && i > 0 && Date.now() - started >= this.maxMillis) break;
      let worldSeed: number;
      [worldSeed, this.rng] = rngInt(this.rng, 2 ** 31);
      this.iterate(determinize(state, me, worldSeed), root, me, rootActions);
    }

    // Robust child: most visits, ties by mean value.
    let best: Action | undefined;
    let bestVisits = -1;
    let bestQ = -Infinity;
    for (const [slug, edge] of root.edges) {
      const q = edge.visits > 0 ? edge.total / edge.visits : -Infinity;
      if (edge.visits > bestVisits || (edge.visits === bestVisits && q > bestQ)) {
        bestVisits = edge.visits;
        bestQ = q;
        best = rootActions.get(slug);
      }
    }
    return best ?? this.fallback.chooseAction(view, legal);
  }

  /** One ISMCTS iteration in one sampled world: select → expand → rollout → backprop. */
  private iterate(world: GameState, root: TreeNode, me: PlayerId, rootActions: Map<string, Action>): void {
    let s = world;
    let node = root;
    // Ply 0 is the bot's own decision; deeper plies belong to whoever holds priority.
    const path: { edge: Edge; actor: PlayerId }[] = [];
    let leaf: GameState | null = null;
    let leafPlies = 0; // distance from root to the evaluated state (discounting)

    for (let depth = 0; depth < 60; depth++) {
      if (isTerminal(s)) {
        leaf = s;
        break;
      }
      const actor = depth === 0 ? me : s.priorityPlayer;
      // Available actions at this node IN THIS WORLD, keyed by info-set slug.
      let avail: Map<string, Action>;
      if (depth === 0) {
        avail = rootActions;
      } else {
        const actorLegal = legalActions(s, actor);
        if (actorLegal.length === 0) {
          leaf = s; // defensive: engine guarantees pass exists outside prepare stalls
          break;
        }
        avail = new Map();
        for (const a of actorLegal) {
          const slug = slugFor(s, a, actor);
          if (!avail.has(slug)) avail.set(slug, a);
        }
      }

      // Expand the first untried available action.
      const untried: string[] = [];
      for (const slug of avail.keys()) if (!node.edges.has(slug)) untried.push(slug);
      if (untried.length > 0) {
        let pick: number;
        [pick, this.rng] = rngInt(this.rng, untried.length);
        const slug = untried[pick]!;
        const action = avail.get(slug)!;
        const applied = this.tryApply(s, action, actor);
        if (applied === null) return; // world-illegal quirk: skip this iteration
        const edge: Edge = { action, child: newNode(), visits: 0, total: 0, availability: 1 };
        node.edges.set(slug, edge);
        path.push({ edge, actor });
        const rolled = this.rollout(applied);
        leaf = rolled.state;
        leafPlies = path.length + rolled.plies;
        break;
      }

      // All available actions tried before: UCB1 over the AVAILABLE edges only.
      let chosen: { slug: string; edge: Edge } | undefined;
      let bestScore = -Infinity;
      for (const [slug, edge] of node.edges) {
        if (!avail.has(slug)) continue;
        edge.availability++;
        const q = edge.total / edge.visits;
        const u = this.exploration * Math.sqrt(Math.log(edge.availability) / edge.visits);
        if (q + u > bestScore) {
          bestScore = q + u;
          chosen = { slug, edge };
        }
      }
      if (!chosen) {
        leaf = s;
        break;
      }
      const applied = this.tryApply(s, avail.get(chosen.slug)!, actor);
      if (applied === null) return;
      s = applied;
      path.push({ edge: chosen.edge, actor });
      node = chosen.edge.child;
    }

    if (leaf === null) leaf = s; // descent depth cap hit
    if (leafPlies === 0) leafPlies = path.length;
    // Mild per-ply discount: sooner outcomes count for more, so equal-value wins
    // prefer the direct line and losses prefer the longest road.
    let v0 = Math.tanh(evaluateState(leaf, 0) / this.evalScale) * Math.pow(0.997, leafPlies);
    if (this.evalNoise > 0) {
      let f: number;
      [f, this.rng] = rngNext(this.rng);
      v0 += (f - 0.5) * this.evalNoise;
    }
    for (const step of path) {
      step.edge.visits++;
      step.edge.total += step.actor === 0 ? v0 : -v0;
    }
  }

  /** apply() that treats world-illegal actions (hidden-info legality quirks) as a skip. */
  private tryApply(s: GameState, action: Action, actor: PlayerId): GameState | null {
    try {
      return apply(s, action, actor).state;
    } catch {
      return null;
    }
  }

  /** True if `action` reaches a terminal win for `me` with every player only passing
   * afterwards (the cast resolves unanswered). Cheap: ≤ 8 forced plies. */
  private winsOutright(world: GameState, action: Action, me: PlayerId): boolean {
    let s = this.tryApply(world, action, me);
    if (s === null) return false;
    for (let i = 0; i < 8; i++) {
      if (isTerminal(s)) return s.winner === me;
      if (s.pendingChoice || s.stack.length === 0) return false; // choices/next-turn: not a forced line
      const next = this.tryApply(s, { type: "pass" }, s.priorityPlayer);
      if (next === null) return false;
      s = next;
    }
    return false;
  }

  /**
   * Greedy-style estimate of a root action: apply it in `world`, play the
   * heuristic policy for both sides through the forced continuation (reactions,
   * stack resolution, hand cap) to the next turn boundary, and evaluate — from
   * P0's perspective, squashed like every other leaf. Null when the action is a
   * hidden-info no-op quirk in this sampled world.
   */
  private forcedLineValue(world: GameState, action: Action, me: PlayerId): number | null {
    const applied = this.tryApply(world, action, me);
    if (applied === null) return null;
    let s: GameState = applied;
    let seed: number;
    [seed, this.rng] = rngInt(this.rng, 2 ** 31);
    const policy: [HeuristicBot, HeuristicBot] = [new HeuristicBot(seed), new HeuristicBot((seed ^ 0x9e3779b9) | 0)];
    for (let ply = 0; ply < 30 && !isTerminal(s); ply++) {
      if (s.phase === "main" && s.stack.length === 0 && !s.pendingChoice && s.turnCount > world.turnCount) break;
      const actor: PlayerId = s.priorityPlayer;
      const legal = legalActions(s, actor);
      if (legal.length === 0) break;
      s = apply(s, policy[actor].chooseAction(redact(s, actor), legal), actor).state;
    }
    return Math.tanh(evaluateState(s, 0) / this.evalScale);
  }

  /** Truncated heuristic-policy playout from `s`; returns the end state + plies used.
   *  Runs a few extra plies past the cap if needed to reach quiescence — evaluating
   *  mid-stack misprices a position (fuel spent, damage not yet dealt). */
  private rollout(s: GameState): { state: GameState; plies: number } {
    let rolloutSeed: number;
    [rolloutSeed, this.rng] = rngInt(this.rng, 2 ** 31);
    const policy: [HeuristicBot, HeuristicBot] = [
      new HeuristicBot(rolloutSeed),
      new HeuristicBot((rolloutSeed ^ 0x27d4eb2f) | 0),
    ];
    let ply = 0;
    const step = (): boolean => {
      const actor: PlayerId = s.priorityPlayer;
      const legal = legalActions(s, actor);
      if (legal.length === 0) return false;
      s = apply(s, policy[actor].chooseAction(redact(s, actor), legal), actor).state;
      return true;
    };
    for (; ply < this.rolloutPlies && !isTerminal(s); ply++) {
      if (!step()) break;
    }
    for (let extra = 0; extra < 10 && !isTerminal(s) && (s.stack.length > 0 || s.pendingChoice); extra++, ply++) {
      if (!step()) break;
    }
    return { state: s, plies: ply };
  }
}
