/**
 * IsmctsBot — single-tree Information-Set MCTS (SO-ISMCTS with availability
 * counts), the strong search bot and the human-facing "hard" opponent.
 *
 * Each iteration samples a fresh hidden-information world at the root (engine
 * `determinize()`), then walks ONE tree shared across worlds. Edges are keyed
 * by action SLUG (the information-set identity of an action — stable across
 * worlds, unlike instance ids), and an edge's UCB exploration term uses its
 * availability count: how often the action was even legal when its parent was
 * visited. Leaves are scored by a TURN-BOUNDED heuristic-policy rollout — play
 * both sides to the next quiescent turn boundary (`rolloutTurns` boundaries,
 * default 2, the same horizon the greedy measurement regime uses) — followed by
 * `evaluateState`, squashed to [-1, 1]. Blind-spot plan 3c (2026-08-12): the
 * old flat 24-ply rollouts wandered through partial turns of heuristic misplay,
 * and that noise overrode the greedy root priors; stopping at the boundary
 * makes leaf values greedy-quality so the tree spends its budget on lookahead.
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
import { castPriorValue, evaluateState, isProphecySpell } from "./evaluate.ts";
import { slugFor } from "./render.ts";
import { otherPlayer, tierForLevel } from "@ibokki/engine";

export interface MctsOptions {
  /** Search iterations per decision (one sampled world each). Default 300. */
  iterations?: number;
  /** UCB exploration constant (values live in [-1, 1]). Default 0.4. */
  exploration?: number;
  /** Turn boundaries a rollout plays past the expanded node before scoring
   * (quiescent stop, like GreedyOptions.rolloutTurns). Default 2 — the
   * measurement-regime horizon: the opponent's reply turn is scored, so
   * reactions, fuel denial, and doom timing price correctly. */
  rolloutTurns?: number;
  /** Hard rollout cap in plies past the expanded node. Default 30 × rolloutTurns. */
  rolloutPlies?: number;
  /** Scale on the tactic-informed edge priors (progressive bias). Default 1;
   *  0 disables — the A/B knob for measuring what tree guidance buys. */
  policyBias?: number;
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

/* Progressive-bias design note (tier 4, 2026-08-13): policyPrior() returns
 * HP-ish magnitudes; squashed through tanh(x / evalScale) they land in the
 * same [-1, 1] space as q, then decay as 1/(1+visits) so evidence overrides
 * guidance. The iterations sweep showed budget alone buys nothing — the tree
 * needs FOCUS toward the lines the piloted series proved matter (doom
 * answers, prior casts, no idle passes). Scale via MctsOptions.policyBias. */

interface Edge {
  /** A concrete instance of this slug's action (root edges hold TRUE-state actions). */
  action: Action;
  child: TreeNode;
  visits: number;
  /** Summed leaf values from the perspective of the player who acts at the parent. */
  total: number;
  /** Times this action was legal when the parent was UCB-selected over. */
  availability: number;
  /** Tactic-informed policy prior, squashed to [-1, 1] (progressive bias). */
  bias: number;
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
  private readonly rolloutTurns: number;
  private readonly rolloutPlies: number;
  private readonly evalNoise: number;
  private readonly maxMillis: number | undefined;
  private readonly evalScale: number;
  private readonly policyBias: number;

  constructor(seed: number, opts?: MctsOptions) {
    this.rng = seed | 0;
    this.fallback = new HeuristicBot((seed ^ 0xc2b2ae35) | 0);
    this.iterations = opts?.iterations ?? 300;
    this.exploration = opts?.exploration ?? 0.4;
    this.rolloutTurns = Math.max(1, opts?.rolloutTurns ?? 2);
    this.rolloutPlies = opts?.rolloutPlies ?? 30 * this.rolloutTurns;
    this.evalNoise = opts?.evalNoise ?? 0;
    this.maxMillis = opts?.maxMillis;
    this.evalScale = opts?.evalScale ?? 12;
    this.policyBias = opts?.policyBias ?? 1;
  }

  chooseAction(view: PlayerView, legal: Action[], state?: GameState): Action {
    if (legal.length === 1) return legal[0]!;
    if (!state) return this.fallback.chooseAction(view, legal);
    const me = view.you;

    // Detach-rescue cleanup mode (tier-1 valve, shared with GreedySimBot): on
    // the round-final turn with the cast spent, rescue sweep-bound fuel and
    // end the turn. No search needed — the line is strictly good.
    if (state.phase === "main" && state.stack.length === 0 && !state.pendingChoice) {
      const opp = state.players[otherPlayer(me)];
      const oppDone = opp.slotsUsedThisRound >= tierForLevel(opp.level).slots;
      const p = state.players[me];
      const meDone = p.spellCastThisTurn || p.slotsUsedThisRound >= tierForLevel(p.level).slots;
      if (oppDone && meDone) {
        const rescue = legal.find((a) => a.type === "detach");
        if (rescue) return rescue;
        const pass = legal.find((a) => a.type === "pass");
        if (pass) return pass;
      }
    }

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
        bias: this.biasFor(state, action, me),
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
        const edge: Edge = { action, child: newNode(), visits: 0, total: 0, availability: 1, bias: this.biasFor(s, action, actor) };
        node.edges.set(slug, edge);
        path.push({ edge, actor });
        const rolled = this.rollout(applied);
        leaf = rolled.state;
        leafPlies = path.length + rolled.plies;
        break;
      }

      // All available actions tried before: UCB1 over the AVAILABLE edges only,
      // plus the tactic-informed progressive bias (decays as evidence arrives).
      let chosen: { slug: string; edge: Edge } | undefined;
      let bestScore = -Infinity;
      for (const [slug, edge] of node.edges) {
        if (!avail.has(slug)) continue;
        edge.availability++;
        const q = edge.total / edge.visits;
        const u = this.exploration * Math.sqrt(Math.log(edge.availability) / edge.visits);
        const b = edge.bias / (1 + edge.visits);
        if (q + u + b > bestScore) {
          bestScore = q + u + b;
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

  /**
   * Tactic-informed action prior (tier 4): HP-ish score nudging the tree
   * toward the lines the piloted series proved out. Guidance only — the
   * progressive-bias decay lets rollout evidence override it.
   */
  private policyPrior(s: GameState, a: Action, actor: PlayerId): number {
    switch (a.type) {
      case "cast": {
        const defId = s.players[actor].prepared[a.preparedIndex]?.spell.defId;
        return defId ? castPriorValue(defId) : 0;
      }
      case "castReaction": {
        // Fire on an enemy prophecy = the m5-m7 cancel discipline; firing
        // while enemy dooms sit prepped spends the answer they needed.
        const enemyProphecyOnStack = s.stack.some((it) => it.controller !== actor && isProphecySpell(it.defId));
        if (enemyProphecyOnStack) return 2.5;
        const oppLiveDooms = s.players[otherPlayer(actor)].prepared.some(
          (pr) => !pr.cast && !pr.sealed && isProphecySpell(pr.spell.defId),
        );
        return oppLiveDooms ? -1.0 : 0;
      }
      case "prepareSpell":
      case "replacePrepared": {
        const iid = a.spellIid;
        const defId = s.players[actor].spellbook.find((c) => c.iid === iid)?.defId;
        return defId ? 0.5 * castPriorValue(defId) : 0;
      }
      case "pass": {
        // Idle pass with a live board = the armed-cancel freeze. Small nudge;
        // the slot-waste rollout term does the heavy lifting.
        if (s.phase !== "main" || s.stack.length > 0) return 0;
        const p = s.players[actor];
        const slotsLeft = p.slotsUsedThisRound < tierForLevel(p.level).slots;
        return slotsLeft && !p.spellCastThisTurn && p.prepared.some((pr) => !pr.cast && !pr.sealed) ? -0.5 : 0;
      }
      default:
        return 0;
    }
  }

  private biasFor(s: GameState, a: Action, actor: PlayerId): number {
    if (this.policyBias === 0) return 0;
    return Math.tanh(this.policyPrior(s, a, actor) / this.evalScale) * this.policyBias;
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
   * stack resolution, hand cap) to a quiescent boundary `rolloutTurns` turns
   * out — the SAME horizon the rollouts and the greedy measurement regime use —
   * and evaluate from P0's perspective, squashed like every other leaf. Null
   * when the action is a hidden-info no-op quirk in this sampled world.
   */
  private forcedLineValue(world: GameState, action: Action, me: PlayerId): number | null {
    const applied = this.tryApply(world, action, me);
    if (applied === null) return null;
    let s: GameState = applied;
    let seed: number;
    [seed, this.rng] = rngInt(this.rng, 2 ** 31);
    const policy: [HeuristicBot, HeuristicBot] = [new HeuristicBot(seed), new HeuristicBot((seed ^ 0x9e3779b9) | 0)];
    for (let ply = 0; ply < this.rolloutPlies && !isTerminal(s); ply++) {
      if (s.phase === "main" && s.stack.length === 0 && !s.pendingChoice && s.turnCount > world.turnCount + this.rolloutTurns - 1) break;
      const actor: PlayerId = s.priorityPlayer;
      const legal = legalActions(s, actor);
      if (legal.length === 0) break;
      s = apply(s, policy[actor].chooseAction(redact(s, actor), legal), actor).state;
    }
    return Math.tanh(evaluateState(s, 0) / this.evalScale);
  }

  /** Turn-bounded heuristic-policy playout from `s`: play both sides until the
   *  position is quiescent at a turn boundary `rolloutTurns` past the leaf's
   *  turn (greedy's stopping rule — the same estimator the root priors use), or
   *  the hard ply cap. A few extra plies past the cap reach quiescence if the
   *  cap lands mid-stack — evaluating mid-stack misprices a position (fuel
   *  spent, damage not yet dealt). */
  private rollout(s: GameState): { state: GameState; plies: number } {
    let rolloutSeed: number;
    [rolloutSeed, this.rng] = rngInt(this.rng, 2 ** 31);
    const policy: [HeuristicBot, HeuristicBot] = [
      new HeuristicBot(rolloutSeed),
      new HeuristicBot((rolloutSeed ^ 0x27d4eb2f) | 0),
    ];
    const startTurn = s.turnCount;
    let ply = 0;
    const step = (): boolean => {
      const actor: PlayerId = s.priorityPlayer;
      const legal = legalActions(s, actor);
      if (legal.length === 0) return false;
      s = apply(s, policy[actor].chooseAction(redact(s, actor), legal), actor).state;
      return true;
    };
    for (; ply < this.rolloutPlies && !isTerminal(s); ply++) {
      if (s.phase === "main" && s.stack.length === 0 && !s.pendingChoice && s.turnCount > startTurn + this.rolloutTurns - 1) break;
      if (!step()) break;
    }
    for (let extra = 0; extra < 10 && !isTerminal(s) && (s.stack.length > 0 || s.pendingChoice); extra++, ply++) {
      if (!step()) break;
    }
    return { state: s, plies: ply };
  }
}
