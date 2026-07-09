/**
 * Static, cast-time card properties read by pushToStack — immutable per card and
 * active *before* the reaction window (so Reactions can't strip them). Effect-time
 * behavior still lives in the effect registry; these are only the "what kind of
 * spell is this on the stack" flags.
 */

/** Cannot be the target of Reactions. */
export const REACTION_PROOF: ReadonlySet<string> = new Set([
  "EVO-012", // Hex Bolt
]);

/** Cannot be cancelled / redirected / reduced by Reactions. */
export const UNSTOPPABLE: ReadonlySet<string> = new Set([
  "EVO-035", // Unstoppable Bolt
  "EVO-045", // Apocalypse
]);

/** This spell's damage cannot be reduced below the given floor. */
export const MIN_DAMAGE: Readonly<Record<string, number>> = {
  "EVO-018": 1, // Lightning Bolt
};

/**
 * Trap-style Reactions that fire AUTOMATICALLY on their printed trigger while
 * prepared face-down and fueled — they are never cast in a reaction window.
 * Value = damage dealt to the triggering opponent.
 */
export const ATTACH_M_TRAPS: Readonly<Record<string, number>> = {
  "EVO-015": 2, // Volatile Bolt — fires when the OPPONENT attaches an M component
};

import { getCard } from "@ibokki/cards";
import { tierForLevel } from "./levels.ts";
import { isComponentDefId, otherPlayer, type GameState, type PlayerId } from "./types.ts";

/**
 * False when playing this trainer right now would deterministically do NOTHING
 * (Bulwark Shard with no ward, Quenching Salts with no burn, …). legalActions
 * doesn't offer such plays and apply refuses them — a feel-bad-whiff guard for
 * human players (playtest m10 finding). Trainers whose value merely MIGHT whiff
 * stay playable: that's a gamble, not a no-op. Overclock USED to be that gamble,
 * but since it costs 2 HP (2026-07-08 reprice) a cast-less Overclock is
 * deterministic self-harm, so it now requires a live extra-cast target.
 */
export function trainerHasEffect(state: GameState, me: PlayerId, defId: string): boolean {
  const p = state.players[me];
  const opp = state.players[otherPlayer(me)];
  switch (defId) {
    case "ITM-001": // Scrying Lens — nothing to look at
    case "ITM-002": // Component Pouch — nothing to reveal
    case "GAM-004": // Recharge — nothing to search
    case "GAM-006": // Premonition Charm — nothing to reorder
      return p.resourceDeck.length > 0;
    case "ITM-006": // Mnemonic Charm — needs a component in your discard
    case "GAM-005": // Salvage — same
      return p.discard.some((c) => isComponentDefId(c.defId));
    case "ITM-008": // Bulwark Shard — buffs a ward you must already control
      return p.wards.length > 0;
    case "GAM-003": // Mentor's Guidance — needs another hand card to discard or a deck to search
      return p.hand.length > 1 || p.resourceDeck.length > 0;
    case "GAM-012": // Dispelling Powder — needs an opposing ward or ongoing effect
      return opp.wards.length > 0 || opp.ongoing.length > 0;
    case "GAM-013": // Quenching Salts — needs your own burn to cleanse
      return p.burn > 0;
    case "GAM-016": // Sealed Vault — needs a discard pile to recycle
      return p.discard.length > 0;
    case "GAM-020": // Disarm — needs an opposing hand to look at
      return opp.hand.length > 0;
    case "GAM-008": {
      // Overclock — costs 2 HP now: require a free slot and SOME castable non-Reaction
      // prepared spell (fueled or not — fuel may be attached later this turn), and
      // never offer a lethal self-hit.
      if (p.hp <= 2) return false;
      const tier = tierForLevel(p.level);
      if (p.slotsUsedThisRound >= tier.slots) return false;
      return p.prepared.some((prep) => {
        if (prep.cast || prep.sealed) return false;
        const def = getCard(prep.spell.defId);
        return !!def && !!def.cost && def.type !== "Reaction" && (def.level ?? 1) <= tier.maxSpellLevel;
      });
    }
    default:
      return true;
  }
}
