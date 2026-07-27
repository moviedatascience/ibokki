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
};

function sideScore(state: GameState, id: PlayerId, w: EvalWeights): number {
  const p: PlayerState = state.players[id];
  const tier = tierForLevel(p.level);
  let score = p.hp * w.hp;
  if (p.hp < w.lowHpLine) score -= (w.lowHpLine - p.hp) * w.lowHp;

  for (const ward of p.wards) score += ward.hp * w.wardHp;

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
    if (def.type === "Reaction" && castable && meetsCost(def.cost, have)) score += w.armedReaction;
  }

  score += Math.max(0, tier.slots - p.slotsUsedThisRound) * w.slotRemaining;

  // The next reshuffle deals 2·(reshuffles+1); it looms larger as the deck thins.
  const nextExhaustion = 2 * (p.reshuffles + 1);
  score -= nextExhaustion * Math.max(0, 1 - p.resourceDeck.length / 8) * w.exhaustion;

  for (const o of p.ongoing) score += o.value * w.ongoingValue;

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
