/**
 * GreedySimBot — the simulation-scored balance baseline.
 *
 * Instead of guessing what cards do from their text (the HeuristicBot's fatal
 * flaw), it asks the engine: for every distinct legal action, apply it to
 * sampled hidden-information worlds (engine `determinize()`), roll the
 * consequences forward with the heuristic policy for BOTH sides until the next
 * turn boundary, and score where things ended up (`evaluateState`). Reaction
 * economics, ward math, burn stacking, and prophecy timers all price themselves
 * through the real rules.
 *
 * One-ply lookahead + policy rollout: strong enough to make matrix numbers
 * meaningful, cheap enough to run in bulk. Also the leaf evaluator / rollout
 * harness a future ISMCTS bot builds on.
 */
import {
  apply,
  determinize,
  isTerminal,
  legalActions,
  redact,
  rngInt,
  type Action,
  type GameState,
  type PlayerId,
  type PlayerView,
} from "@ibokki/engine";
import { HeuristicBot, RandomBot, type Agent } from "./agent.ts";
import { evaluateState } from "./evaluate.ts";
import { IsmctsBot, type MctsOptions } from "./mcts.ts";
import { slugFor } from "./render.ts";

export interface GreedyOptions {
  /** Hidden-information worlds sampled per decision (default 3). */
  determinizations?: number;
  /** Rollout cap in plies (priority actions) after the candidate action (default 30 per rollout turn). */
  rolloutPlies?: number;
  /** Turn boundaries to roll past before scoring (default 1 = my turn plays
   *  out). 2 also plays the opponent's reply turn, making delayed payoffs —
   *  fuel denial, round-long defense — visible at ~2x cost. Blind-spot plan
   *  3a (2026-07-29): the horizon gap is ledger entry #5. */
  rolloutTurns?: number;
  /** FORCING PROBE (blind-spot plan 1b): bias action selection toward this
   *  card — prep/cast/react/swap-in actions for the defId get `forceBonus`
   *  added to their score, so the bot expresses the card whenever plausible.
   *  Run the canonical seeds with and without: winrate UP under forcing =
   *  the bot undervalues the card (verdict quarantined, ledger entry);
   *  winrate flat/down = a real card verdict at bot level. */
  forceDefId?: string;
  /** Score bonus for forced-card actions, HP-denominated (default 3 — wins
   *  ordinary prep/cast auctions; terminal lines still dominate). */
  forceBonus?: number;
}

/** Tiny per-ply cost so equal outcomes prefer the DIRECT line (cast lethal now,
 * don't fiddle first) without ever outweighing a real evaluation difference. */
const PLY_PENALTY = 0.01;

export class GreedySimBot implements Agent {
  readonly name = "greedy";
  private rng: number;
  private readonly fallback: HeuristicBot;
  private readonly worlds: number;
  private readonly maxPlies: number;
  private readonly turns: number;
  private readonly forceSuffix: string | undefined;
  private readonly forceBonus: number;

  constructor(seed: number, opts?: GreedyOptions) {
    this.rng = seed | 0;
    this.fallback = new HeuristicBot((seed ^ 0x85ebca6b) | 0);
    this.worlds = opts?.determinizations ?? 3;
    this.turns = Math.max(1, opts?.rolloutTurns ?? 1);
    this.maxPlies = opts?.rolloutPlies ?? 30 * this.turns;
    // Slugs are kebab-cased defIds (`prep-evo-006`, `swap-div-005-div-020` —
    // the trailing segment is the incoming card), so a "-<defid>" suffix match
    // catches prep/cast/react and swap-IN without matching swap-OUT.
    this.forceSuffix = opts?.forceDefId ? `-${opts.forceDefId.toLowerCase()}` : undefined;
    this.forceBonus = opts?.forceBonus ?? 3;
  }

  chooseAction(view: PlayerView, legal: Action[], state?: GameState): Action {
    if (legal.length === 1) return legal[0]!;
    // Without the true state there is nothing to simulate on — play the policy.
    if (!state) return this.fallback.chooseAction(view, legal);
    const me = view.you;

    // Interchangeable actions share a slug (e.g. attaching either of two identical
    // components to the same slot) — evaluate one representative of each.
    // retractCast is excluded: it exists so a HUMAN can take back a misclick. A
    // sim bot already evaluated the cast before making it; letting it second-guess
    // opens a cast→retract→cast livelock (a real match once burned 6.9 CPU-hours).
    // detach is a one-way valve — allowed only BEFORE any attach this turn, so a
    // turn's plies are strictly bounded (detaches ≤ attached, then attaches ≤ hand)
    // and attach↔detach livelocks are impossible (seed 5000 oscillated at turn 114).
    const bySlug = new Map<string, Action>();
    for (const a of legal) {
      if (a.type === "retractCast") continue;
      if (a.type === "detach" && state.players[me].componentPlayedThisTurn) continue;
      const slug = slugFor(state, a, me);
      if (!bySlug.has(slug)) bySlug.set(slug, a);
    }
    const candidates = [...bySlug.values()];
    if (candidates.length === 1) return candidates[0]!;

    // Sample the worlds and rollout seeds ONCE, reused across candidates, so
    // actions are compared on paired samples (variance reduction).
    const samples: { world: GameState; rolloutSeed: number }[] = [];
    for (let k = 0; k < this.worlds; k++) {
      let worldSeed: number, rolloutSeed: number;
      [worldSeed, this.rng] = rngInt(this.rng, 2 ** 31);
      [rolloutSeed, this.rng] = rngInt(this.rng, 2 ** 31);
      samples.push({ world: determinize(state, me, worldSeed), rolloutSeed });
    }

    let best = candidates[0]!;
    let bestScore = -Infinity;
    for (const a of candidates) {
      let total = 0;
      for (const s of samples) total += this.simulate(s.world, a, me, s.rolloutSeed);
      let score = total / samples.length;
      // Forcing probe (1b): forced-card actions win ordinary auctions.
      if (this.forceSuffix !== undefined && slugFor(state, a, me).endsWith(this.forceSuffix)) score += this.forceBonus;
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    }
    return best;
  }

  /** Apply `action` in `world`, roll forward with the heuristic policy for both
   * sides until the next turn boundary (or terminal / ply cap), and score it. */
  private simulate(world: GameState, action: Action, me: PlayerId, seed: number): number {
    let s: GameState;
    try {
      s = apply(world, action, me).state;
    } catch {
      // Legal in the true state but a no-op in this sampled world (e.g. a trainer
      // whose effect depends on hidden cards): treat as a wasted action.
      return evaluateState(world, me) - 0.5;
    }
    const startTurn = world.turnCount;
    const policy: [HeuristicBot, HeuristicBot] = [new HeuristicBot(seed), new HeuristicBot((seed ^ 0x27d4eb2f) | 0)];
    let ply = 0;
    for (; ply < this.maxPlies; ply++) {
      if (isTerminal(s)) break;
      // Quiescent at a LATER turn boundary: the candidate action's whole turn —
      // opposing reactions, stack resolution, hand cap — has played out.
      // (rolloutTurns > 1 rolls past additional boundaries so the opponent's
      // reply turn is scored too — the delayed-payoff horizon.)
      if (s.phase === "main" && s.stack.length === 0 && !s.pendingChoice && s.turnCount > startTurn + this.turns - 1) break;
      const actor = s.priorityPlayer;
      const legal = legalActions(s, actor);
      if (legal.length === 0) break; // defensive: engine guarantees pass exists
      s = apply(s, policy[actor].chooseAction(redact(s, actor), legal), actor).state;
    }
    return evaluateState(s, me) - Math.min(ply, this.maxPlies) * PLY_PENALTY;
  }
}

export type AgentKind = "random" | "heuristic" | "greedy" | "search";

export function makeAgent(kind: AgentKind, seed: number, greedyOpts?: GreedyOptions, mctsOpts?: MctsOptions): Agent {
  if (kind === "random") return new RandomBot(seed);
  if (kind === "greedy") return new GreedySimBot(seed, greedyOpts);
  if (kind === "search") return new IsmctsBot(seed, mctsOpts);
  return new HeuristicBot(seed);
}
