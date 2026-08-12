/**
 * Auto-derived cast priors (blind-spot plan workstream 2, 2026-08-12).
 *
 * Replaces the hand-maintained PREP_THREAT table: for every implemented Spell,
 * measure its cast payoff by ASKING THE ENGINE — inject the spell fully paid
 * (via PreparedSpell.bonus, Attune's phantom-symbol field) into deterministic
 * midgame snapshots (its school vs each opponent school × 2 seeds), cast it,
 * force resolution (both sides pass priority; pendingChoice resolved by the
 * heuristic policy), and record the eval delta on the "cast payoff in HP"
 * scale the hand table used. Cached to data/cast-priors.json; evaluate.ts
 * loads it at import time. Hand overrides remain only for banked/conditional
 * cards whose payoff a snapshot delta cannot see (see HAND_OVERRIDES there).
 *
 * Scale discipline (the plan's stated risk): priors are context-averaged
 * tiebreakers, never dominant — clamped to [0, 2], rounded to 0.1, and values
 * under 0.3 are omitted (those spells keep the generic card-blind prep term).
 *
 *   npm run derive-priors        # regenerate data/cast-priors.json
 *
 * Reactions are excluded (armedReaction already prices a fueled reaction and
 * they cannot be cast from the main phase); trainers are hand-played, never
 * prepped. Snapshots advance until the spell's tier is castable on the
 * caster's turn — spells whose tier is never reached in heuristic self-play
 * (short games) yield no samples and are omitted rather than guessed at.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getCard, SPELLS } from "@ibokki/cards";
import {
  apply,
  createGame,
  deckFor,
  implementedIds,
  isTerminal,
  legalActions,
  redact,
  tierForLevel,
  type Action,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";
import { HeuristicBot } from "./agent.ts";
import { _overridePrepThreat, _sideScore, DEFAULT_WEIGHTS, evaluateState } from "./evaluate.ts";

const OPPONENTS = ["Evocation", "Abjuration", "Divination"] as const;
const SEEDS = [4001, 4002];
const CLAMP_MAX = 2;
const MIN_PRIOR = 0.3;
const MIN_SAMPLES = 2;

type School = (typeof OPPONENTS)[number];

/** Advance a fresh game with heuristic self-play until the caster (P0) holds a
 *  quiet main-phase turn at a level whose tier can cast `spellLevel`. L3/L4
 *  bands walk with boosted HP — most heuristic games END below those tiers
 *  (short games are the balance finding; here we just need a late-game board,
 *  and the snapshot is measurement scaffolding, not a balance number). */
function walkToSnapshot(school: School, opp: School, seed: number, spellLevel: number): GameState | null {
  let s = createGame({
    seed,
    ...(spellLevel >= 3 ? { startingHp: 60 } : {}),
    players: [deckFor(school), deckFor(opp)],
  });
  const bots: [HeuristicBot, HeuristicBot] = [new HeuristicBot(seed ^ 0x51ed), new HeuristicBot(seed ^ 0x2c9b)];
  for (let i = 0; i < 8000 && !isTerminal(s); i++) {
    if (
      s.phase === "main" &&
      s.priorityPlayer === 0 &&
      s.stack.length === 0 &&
      !s.pendingChoice &&
      tierForLevel(s.players[0].level).maxSpellLevel >= spellLevel
    ) {
      return s;
    }
    const actor: PlayerId = s.priorityPlayer;
    const legal = legalActions(s, actor);
    if (legal.length === 0) return null;
    s = apply(s, bots[actor].chooseAction(redact(s, actor), legal), actor).state;
  }
  return null; // game ended (or stalled) below the spell's tier
}

/** Snapshots are cached per (school, opp, seed, tier-band) — every spell in the
 *  same band reuses the same walk, so the whole book derives in one pass. */
const snapCache = new Map<string, GameState | null>();
function snapshotFor(school: School, opp: School, seed: number, spellLevel: number): GameState | null {
  const key = `${school}|${opp}|${seed}|${spellLevel}`;
  if (!snapCache.has(key)) snapCache.set(key, walkToSnapshot(school, opp, seed, spellLevel));
  return snapCache.get(key)!;
}

let nextIid = 900_000; // far above any engine-issued instance id

/** Inject `defId` fully paid, cast it, force resolution, return the gross cast
 *  payoff in HP (eval delta plus the fueled prep worth the cast consumed, so
 *  values land on the hand table's scale) plus its offense/defense kind.
 *  Null = uncastable in this world. */
export function measureCastPayoff(snapshot: GameState, defId: string): { payoff: number; defensive: boolean } | null {
  const def = getCard(defId);
  if (!def?.cost) return null;
  const s = structuredClone(snapshot);
  s.players[0].prepared.push({
    spell: { iid: nextIid++, defId },
    faceDown: true,
    attached: [],
    cast: false,
    sealed: false,
    bonus: { ...def.cost },
  });
  const idx = s.players[0].prepared.length - 1;
  const castAction = legalActions(s, 0).find((a) => a.type === "cast" && a.preparedIndex === idx);
  if (!castAction) return null;

  // Measure PRIOR-FREE: with the live table active, cards that already have a
  // prior inflate their own `before` and deflate to ~0 — the generator would
  // feed back on its own output (the first run's Omen/Foretell bug).
  _overridePrepThreat({});
  try {
    const before = evaluateState(s, 0);
    const beforeSelf = _sideScore(s, 0);
    const beforeOpp = _sideScore(s, 1);
    let cur: GameState;
    try {
      cur = apply(s, castAction, 0).state;
    } catch {
      return null;
    }
    // Force the resolution: pass on every priority window (no opponent
    // reactions — the prior measures the card's own effect, not the local
    // metagame), but let the heuristic policy make any pendingChoice for
    // whoever owns it.
    const choosers: [HeuristicBot, HeuristicBot] = [new HeuristicBot(7 ^ nextIid), new HeuristicBot(11 ^ nextIid)];
    for (let i = 0; i < 80 && !isTerminal(cur) && (cur.stack.length > 0 || cur.pendingChoice); i++) {
      const actor: PlayerId = cur.priorityPlayer;
      const legal = legalActions(cur, actor);
      if (legal.length === 0) break;
      const act: Action = cur.pendingChoice
        ? choosers[actor].chooseAction(redact(cur, actor), legal)
        : (legal.find((a) => a.type === "pass") ?? choosers[actor].chooseAction(redact(cur, actor), legal));
      try {
        cur = apply(cur, act, actor).state;
      } catch {
        return null;
      }
    }
    const delta = evaluateState(cur, 0) - before;
    const level = def.level ?? 1;
    // Gross payoff: add back the fueled prep worth the cast consumed
    // (progress 1, castable) net of the cast-residual it left behind — the
    // same constants evaluate.ts uses, so priors stay on the docstring's
    // payoff-in-HP scale.
    const consumed =
      DEFAULT_WEIGHTS.prepBase + level * DEFAULT_WEIGHTS.prepPerLevel - level * DEFAULT_WEIGHTS.castResidualPerLevel;
    // Kind decomposition: did the payoff come from the opponent losing value
    // (offense — damage, dooms, denial) or from our side gaining it (defense —
    // wards, reduction, heals, draw)? Defense priors take the pierce-doom
    // discount at consumption: a context-averaged defense payoff is exactly
    // wrong in matchups where the incoming damage bypasses defenses (the v2
    // re-baseline's reaction-starvation finding).
    const offenseShare = beforeOpp - _sideScore(cur, 1);
    const defenseShare = _sideScore(cur, 0) - beforeSelf;
    return { payoff: delta + consumed, defensive: defenseShare > offenseShare };
  } finally {
    _overridePrepThreat(null);
  }
}

/** Average gross payoff for one spell across opponents × seeds. */
export function deriveCastPrior(defId: string): { prior: number | null; samples: number; defensive: boolean } {
  const def = getCard(defId);
  if (!def || def.type !== "Spell" || !def.cost || !def.school || def.school === "Neutral") {
    return { prior: null, samples: 0, defensive: false };
  }
  const school = def.school as School;
  const level = def.level ?? 1;
  const payoffs: number[] = [];
  let defensiveVotes = 0;
  for (const opp of OPPONENTS) {
    for (const seed of SEEDS) {
      const snap = snapshotFor(school, opp, seed, level);
      if (!snap) continue;
      const p = measureCastPayoff(snap, defId);
      if (p !== null) {
        payoffs.push(p.payoff);
        if (p.defensive) defensiveVotes++;
      }
    }
  }
  if (payoffs.length < MIN_SAMPLES) return { prior: null, samples: payoffs.length, defensive: false };
  const avg = payoffs.reduce((a, b) => a + b, 0) / payoffs.length;
  const clamped = Math.min(CLAMP_MAX, Math.max(0, avg));
  return {
    prior: Math.round(clamped * 10) / 10,
    samples: payoffs.length,
    defensive: defensiveVotes * 2 > payoffs.length,
  };
}

function main(): void {
  const implemented = new Set(implementedIds());
  const priors: Record<string, number> = {};
  const defense: string[] = [];
  const skipped: string[] = [];
  for (const card of SPELLS) {
    if (card.type !== "Spell" || !implemented.has(card.id)) continue;
    const { prior, samples, defensive } = deriveCastPrior(card.id);
    if (prior !== null && prior >= MIN_PRIOR) {
      priors[card.id] = prior;
      if (defensive) defense.push(card.id);
    } else skipped.push(`${card.id} (${samples} samples${prior !== null ? `, prior ${prior}` : ""})`);
  }
  const sorted = Object.fromEntries(Object.entries(priors).sort(([a], [b]) => a.localeCompare(b)));
  const out = {
    _meta: {
      note: "AUTO-GENERATED by `npm run derive-priors` (packages/sim/src/derivePriors.ts) — do not hand-edit; hand overrides live in evaluate.ts HAND_OVERRIDES.",
      scale: "gross cast payoff in HP, clamped to [0,2], floor 0.3 (below it the generic prep term stands); consumed × EvalWeights.castPrior",
      kinds: "defense = payoff came mostly from own-side gain; those priors take the pierce-doom discount at consumption",
      seeds: SEEDS,
      opponents: [...OPPONENTS],
    },
    priors: sorted,
    defense: defense.sort(),
  };
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "cast-priors.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`cast-priors.json: ${Object.keys(sorted).length} priors written, ${skipped.length} spells below floor/unsampled`);
  for (const s of skipped) console.log(`  skipped: ${s}`);
}

// Run the generator only when invoked directly (`npm run derive-priors`) —
// tests import measureCastPayoff/deriveCastPrior without triggering a write.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
