/**
 * Trainers — Items and Gambits. No-cost utility cards played from hand on your
 * own turn, then discarded. Items are unlimited per turn; Gambits are capped at
 * one per turn (enforced in legalActions/apply, not here).
 *
 * Deck-sculpting cards ("look at the top N, reorder") are simplified to their net
 * card flow (SIMPLIFIED); a few protective/anti-disruption riders need systems
 * that don't exist yet and are no-ops (DEFERRED).
 */
import { register } from "./registry.ts";

// ---- Items (unlimited per turn) ----
register("ITM-001", (c) => c.requestTakeFromTop(2, 1, "top")); // Scrying Lens (look 2, choose 1 to hand, other on top)
register("ITM-002", (c) => c.lookSelectComponentToHand(1)); // Component Pouch (top: take if component, else bottom)
register("ITM-003", (c) => { c.draw(1); c.requestBankToDeckTop(1); }); // Cantrip Scroll (draw 1, choose 1 to bank on top)
register("ITM-004", (c) => {
  c.discardSelfRandom(1); // Spare Reagents
  c.draw(1);
});
register("ITM-005", (c) => c.addAttuneBonus()); // Transmuter's Stone (color-fix ~ next attach counts as a needed symbol)
register("ITM-006", (c) => c.returnComponentsFromDiscard(1)); // Mnemonic Charm (to hand vs top SIMPLIFIED)
register("ITM-007", (c) => c.addNextSpellDamage(1)); // Empowered Chalk — next spell THIS turn
register("ITM-008", (c) => {
  if (c.selfHasWard()) c.buffOneOwnWardOrCreate(2, 0); // Bulwark Shard
});

// ---- Gambits (one per turn) ----
register("GAM-001", (c) => { c.draw(2); c.requestBankToDeckTop(1); }); // Arcane Study (draw 2, choose 1 to bank -> net +1)
register("GAM-002", (c) => {
  c.discardSelfHand(); // Forbidden Tome
  c.draw(4);
});
register("GAM-003", (c) => {
  c.discardSelfRandom(1); // Mentor's Guidance (SIMPLIFIED: tutor any -> component)
  c.tutorComponentsToHand(1);
});
register("GAM-004", (c) => c.requestSearchSameSymbolDual()); // Recharge — interactive: pick a VV/SS/MM, reveal, shuffle
register("GAM-005", (c) => c.returnComponentsFromDiscard(1)); // Salvage
register("GAM-006", (c) => c.reorderTop(4)); // Premonition Charm (look at top 4, reorder)
register("GAM-007", (c) => c.attachTopComponentElseDraw()); // Ritual Circle (attach top component, else draw)
register("GAM-008", (c) => c.grantExtraCast()); // Overclock
register("GAM-009", (c) => c.heal(5)); // Second Wind
register("GAM-010", (c) => {
  c.takeSelfDamage(2); // Battle Trance — ONE spell, THIS turn (was wrongly round-long)
  c.addNextSpellDamage(3);
});
register("GAM-011", (c) => c.createWardForSelf(3)); // Aegis Charm
register("GAM-012", (c) => {
  if (c.opponentHasWard()) c.destroyOneOpponentWard(); // Dispelling Powder — Ward or ongoing effect
  else c.destroyOneOpponentOngoing();
});
register("GAM-013", (c) => c.removeOwnBurnGainHp()); // Quenching Salts
register("GAM-014", (c) => c.makeMySpellsUncounterable()); // Resolve
register("GAM-015", (c) => c.protectMyHandFromDiscard()); // Iron Will
register("GAM-016", (c) => c.shuffleOwnDiscardIntoDeck()); // Sealed Vault
register("GAM-017", (c) => c.lockOpponentExtraDraw()); // Mana Sickness
register("GAM-018", (c) => c.addReactionPunish(2)); // Spite (expiry SIMPLIFIED to end of round)
register("GAM-019", (c) => c.millOpponent(3)); // Saboteur's Kit
register("GAM-020", (c) => c.bounceOpponentComponentToTheirTop()); // Disarm (bounce a component to their deck top)
