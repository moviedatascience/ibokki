/**
 * Static evaluation of a full GameState from one player's perspective. The
 * scoring backbone of the simulation bots: GreedySimBot compares candidate
 * actions by the evaluation of where each one leads, so every point of "what is
 * a ward worth / how bad is burn" lives HERE, in one tunable table — not in
 * regex guesses about card text.
 *
 * Scores are roughly HP-denominated: 1.0 ≈ one point of life. Symmetric by
 * construction (my side minus opponent's side), so evaluate(s, 0) === -evaluate(s, 1).
 */
import { getCard } from "@ibokki/cards";
import {
  addCost,
  attachedSymbols,
  emptyCost,
  meetsCost,
  otherPlayer,
  tierForLevel,
  type GameState,
  type PlayerId,
  type PlayerState,
} from "@ibokki/engine";

/** Terminal score magnitude; nudged by turn count so faster wins score higher. */
export const WIN_SCORE = 10_000;

export interface EvalWeights {
  hp: number;
  /** Extra penalty per HP below the danger line (makes the bot defend when low). */
  lowHp: number;
  lowHpLine: number;
  wardHp: number;
  /** Multiplies the triangular total of remaining burn damage (n·(n+1)/2, capped at HP). */
  burn: number;
  /** Multiplies a doom's payload, discounted per turn of fuse remaining. */
  doom: number;
  doomDecay: number;
  doomPierce: number;
  handCard: number;
  /** Prepared-spell worth: (base + level·perLevel) scaled by fuel progress. */
  prepBase: number;
  prepPerLevel: number;
  /** A fully-fueled, uncast Reaction deters the opponent all round. */
  armedReaction: number;
  /** Already-cast prepared spells return next round — small residual value. */
  castResidualPerLevel: number;
  slotRemaining: number;
  /** Imminent-reshuffle pressure: next exhaustion hit scaled by deck thinness. */
  exhaustion: number;
  ongoingValue: number;
  /** Round-long damage reduction priced per expected remaining enemy hit (ward-like). */
  damageReductionPerHit: number;
  /** Reckoning's banked payload (ceil(match prevention / 2)) while it sits prepared. */
  reckoningCharge: number;
}

export const DEFAULT_WEIGHTS: EvalWeights = {
  hp: 1.0,
  lowHp: 0.6,
  lowHpLine: 10,
  wardHp: 0.8,
  burn: 0.8,
  doom: 0.9,
  doomDecay: 0.85,
  doomPierce: 1.15,
  handCard: 0.6,
  prepBase: 0.5,
  prepPerLevel: 0.7,
  armedReaction: 1.5,
  castResidualPerLevel: 0.2,
  slotRemaining: 0.4,
  exhaustion: 0.5,
  ongoingValue: 0.4,
  damageReductionPerHit: 0.8,
  reckoningCharge: 0.8,
};

/**
 * Cast-payoff worth the card-blind prep term cannot see (exp-3b, 2026-07-29 —
 * the THIRD instance of the blind-spot law after Stone Stance and Reckoning).
 * The generic prep worth is (prepBase + level·perLevel): identical for every
 * L1 spell, so prep candidates tie and enumeration order decides. Divination's
 * spellbook sorts DIV-001..005 first, which starved its actual L1 pressure —
 * Omen (the designed "L1 starter doom") and Foretell had 0 preps across the
 * ENTIRE balance series. Entries are the card's approximate cast payoff in HP
 * (Omen: 2 dmg doom decayed ≈ 1.7; Foretell: 2 dmg + intel, ward-soakable).
 * Deliberately Div-only: Evocation's id order already fronts its cantrips, and
 * touching its prep behavior would destabilize every tuned edge for no gain.
 */
const PREP_THREAT: Record<string, number> = {
  "DIV-012": 1.7, // Omen — prophesy(2,2), re-preparable clock
  "DIV-011": 1.6, // Foretell — 2 damage now + hand reveal
  "DIV-008": 1.2, // Cut the Thread — targeted component denial (~a cantrip of enemy fuel)
};

function sideScore(state: GameState, id: PlayerId, w: EvalWeights): number {
  const p: PlayerState = state.players[id];
  const tier = tierForLevel(p.level);
  let score = p.hp * w.hp;
  if (p.hp < w.lowHpLine) score -= (w.lowHpLine - p.hp) * w.lowHp;

  // Ward doom discount (exp-3c, 2026-07-29): piercing dooms bypass wards
  // entirely (exp-2), so flat ward pricing is wrong exactly when the opponent
  // kills through the clock. Once the prep fix let Div actually spam Omen,
  // Abj poured its whole S economy into walls — Ward Pulse 133 casts at 3%
  // WR-used, 29–1 — while counters and Final Reckoning went unfueled. Same
  // pending-pierce-doom signal as the reduction discount below, floored at
  // 0.3 because wards persist past the round and still stop the soakable
  // minority (Foretell, reflect value). Doom-less matchups: factor exactly 1.
  const pierceDoomThreat = p.prophecies.reduce((sum, d) => sum + (d.pierce ? d.amount : 0), 0);
  {
    const opp = state.players[otherPlayer(id)];
    const oppHitsLeft = Math.max(0, tierForLevel(opp.level).slots - opp.slotsUsedThisRound);
    const soakShare = pierceDoomThreat > 0 ? Math.max(0.3, oppHitsLeft / (oppHitsLeft + pierceDoomThreat)) : 1;
    for (const ward of p.wards) score += ward.hp * w.wardHp * soakShare;
  }

  // Burn n deals n, n-1, … over coming turns: n·(n+1)/2 total, but never more than remaining HP.
  if (p.burn > 0) score -= Math.min((p.burn * (p.burn + 1)) / 2, p.hp) * w.burn;

  for (const doom of p.prophecies) {
    const discounted = doom.amount * Math.pow(w.doomDecay, Math.max(0, doom.turnsLeft - 1));
    score -= discounted * w.doom * (doom.pierce ? w.doomPierce : 1);
  }

  score += p.hand.length * w.handCard;

  for (const prep of p.prepared) {
    const def = getCard(prep.spell.defId);
    if (!def) continue;
    const level = def.level ?? 1;
    if (prep.cast) {
      score += level * w.castResidualPerLevel; // spent this round, back next round
      continue;
    }
    if (prep.sealed) continue; // dead for the round
    if (!def.cost) continue;
    const have = addCost(attachedSymbols(p, prep), prep.bonus ?? emptyCost());
    const need = def.cost.V + def.cost.S + def.cost.M;
    const paid = Math.min(have.V, def.cost.V) + Math.min(have.S, def.cost.S) + Math.min(have.M, def.cost.M);
    const progress = need > 0 ? paid / need : 1;
    const castable = (def.level ?? 1) <= tier.maxSpellLevel;
    const worth = (w.prepBase + level * w.prepPerLevel) * (0.35 + 0.65 * progress) * (castable ? 1 : 0.3);
    score += worth;
    const threat = PREP_THREAT[prep.spell.defId];
    if (threat) score += threat * (0.35 + 0.65 * progress) * (castable ? 1 : 0.3);
    if (def.type === "Reaction" && castable && meetsCost(def.cost, have)) score += w.armedReaction;
    if (prep.spell.defId === "ABJ-032") {
      // Reckoning's banked payload: cast deals ceil(match prevention / 2) raw.
      // The generic prep term prices it like any other L3, so the greedy bot
      // never swapped it in — 0 casts across the whole 2026-07-28 triangle
      // despite the exp-1d match-window rework (same blind-spot class as
      // Stone Stance before damageReductionPerHit).
      const payload = Math.min(Math.ceil((p.damagePreventedTotal ?? 0) / 2), state.players[otherPlayer(id)].hp);
      score += payload * (0.35 + 0.65 * progress) * (castable ? 1 : 0.3) * w.reckoningCharge;
    }
  }

  score += Math.max(0, tier.slots - p.slotsUsedThisRound) * w.slotRemaining;

  // The next reshuffle deals 2·(reshuffles+1); it looms larger as the deck thins.
  const nextExhaustion = 2 * (p.reshuffles + 1);
  score -= nextExhaustion * Math.max(0, 1 - p.resourceDeck.length / 8) * w.exhaustion;

  for (const o of p.ongoing) {
    if (o.kind === "damageReduction") {
      // Prevention against every remaining hit this round — price by the
      // opponent's leftover hit budget (slots), like ward HP, not the flat
      // marker term. Under the flat term the greedy bot could not express
      // Stone Stance at all: 1 cast in 30 games while the engine said it was
      // good (experiment 1b, 2026-07-27).
      // Doom discount (exp-3a, 2026-07-29): piercing dooms bypass reduction
      // entirely, so when my incoming damage is doom-shaped an opponent slot is
      // mostly a clock tick, not a reducible hit. Scale by the share of visible
      // threat reduction actually touches — vs doom-less schools the factor is
      // exactly 1 (control legs replay byte-identical). Without it the bot
      // overcast dead stances vs Div all game: 142 casts at 10% WR-used.
      const opp = state.players[otherPlayer(id)];
      const hitsLeft = Math.max(0, tierForLevel(opp.level).slots - opp.slotsUsedThisRound);
      const reducibleShare = hitsLeft > 0 ? hitsLeft / (hitsLeft + pierceDoomThreat) : 0;
      score += o.value * hitsLeft * reducibleShare * w.damageReductionPerHit;
    } else {
      score += o.value * w.ongoingValue;
    }
  }

  return score;
}

/** Higher is better for `me`. Terminal states dominate all positional scores. */
export function evaluateState(state: GameState, me: PlayerId, w: EvalWeights = DEFAULT_WEIGHTS): number {
  if (state.phase === "gameover") {
    if (state.winner === null) return 0;
    // turnCount nudge: reach wins sooner, losses later.
    return state.winner === me ? WIN_SCORE - state.turnCount : -WIN_SCORE + state.turnCount;
  }
  return sideScore(state, me, w) - sideScore(state, otherPlayer(me), w);
}
