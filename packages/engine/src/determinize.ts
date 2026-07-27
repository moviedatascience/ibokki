/**
 * Determinization: resample the zones hidden from `viewer` into one concrete,
 * fully-known world consistent with everything the viewer can see. This is the
 * information-set sampler for search bots (greedy simulation, later ISMCTS): a
 * bot given the true state must simulate on determinized copies instead, so it
 * can never act on information a real player wouldn't have.
 *
 * Resampled:
 *  - Opponent's hand + resource deck: pooled and redealt (the viewer knows only
 *    the counts; the discard is public and untouched).
 *  - Opponent's face-down prepared spells + remaining spellbook: identities are
 *    swapped within that pool. Slot legality is respected (a sampled prepared
 *    spell must be castable at the opponent's current tier — an upper bound,
 *    since tiers only rise after a spell was legally prepared). Attached
 *    components, cast/sealed flags, and Attune bonuses are public and stay with
 *    the slot.
 *
 * Deliberately NOT resampled (v1 simplifications a future knowledge-tracking
 * pass can tighten):
 *  - The viewer's own deck order. The true order is one legitimate sample from
 *    the viewer's information set, and keeping it preserves scry/bank knowledge
 *    (orderToTop / bankToDeckTop) without tracking what the viewer has seen.
 *    Cost: simulations are clairvoyant about the viewer's own future draws.
 *  - Cards the viewer has SEEN in hidden zones (Disarm/Omen reveals, public
 *    bounces to the opponent's deck top): revealed-card knowledge is untracked,
 *    so they shuffle like unseen cards.
 *  - A pending choice's candidates. At the viewer's own decision points the
 *    choice is either theirs (candidates visible) or absent (a pending choice
 *    blocks all other actions), so this never matters when sampling to act.
 *
 * Pure like `apply`: clones, never mutates the input. Deterministic in `seed`.
 */
import { getCard } from "@ibokki/cards";
import { tierForLevel } from "./levels.ts";
import { rngNext, shuffleInPlace } from "./rng.ts";
import { otherPlayer, type GameState, type PlayerId } from "./types.ts";

export function determinize(state: GameState, viewer: PlayerId, seed: number): GameState {
  const next = structuredClone(state);
  if (next.phase === "gameover") return next;

  // Local PRNG for the resampling itself; warmed once (mulberry32's first
  // output correlates strongly across small consecutive seeds).
  let s = (seed | 0) ^ 0x9e3779b9;
  [, s] = rngNext(s);

  const opp = next.players[otherPlayer(viewer)];

  // 1. Opponent's hand + resource deck: pool and redeal at the same counts.
  const handCount = opp.hand.length;
  const cardPool = [...opp.hand, ...opp.resourceDeck];
  s = shuffleInPlace(cardPool, s);
  opp.hand = cardPool.slice(0, handCount);
  opp.resourceDeck = cardPool.slice(handCount);

  // 2. Opponent's hidden spell identities: face-down prepared slots swap freely
  // with the remaining spellbook, filling each slot with a tier-legal spell.
  const hiddenSlots = opp.prepared.filter((prep) => prep.faceDown);
  if (hiddenSlots.length > 0) {
    const spellPool = [...hiddenSlots.map((prep) => prep.spell), ...opp.spellbook];
    s = shuffleInPlace(spellPool, s);
    const maxLevel = tierForLevel(opp.level).maxSpellLevel;
    for (const slot of hiddenSlots) {
      let i = spellPool.findIndex((c) => (getCard(c.defId)?.level ?? 1) <= maxLevel);
      if (i < 0) i = 0; // unreachable: the true hidden spells qualify and are in the pool
      slot.spell = spellPool.splice(i, 1)[0]!;
    }
    opp.spellbook = spellPool;
  }

  // Decorrelate future in-game randomness (reshuffles, searches) across samples —
  // otherwise every world would share identical downstream shuffle outcomes.
  next.rngState = (next.rngState ^ s) | 0;

  return next;
}
