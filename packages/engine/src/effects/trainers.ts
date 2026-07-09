/**
 * Trainers — Items and Gambits. No-cost utility cards played from hand on your
 * own turn, then discarded. Items are unlimited per turn; Gambits are capped at
 * one per turn (enforced in legalActions/apply, not here).
 *
 * Cards with real decisions pause for the player via pendingChoice (search/order/
 * return/bounce modes); decision-free conditionals (Component Pouch) auto-resolve.
 * Transmuter's Stone approximates its treat-as-another-symbol wording with an
 * Attune-style bonus on the next attach (SIMPLIFIED — same practical effect).
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
register("ITM-006", (c) => c.requestReturnDiscardComponentToTop()); // Mnemonic Charm — pick the component, to deck TOP per text
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
register("GAM-003", (c) => c.requestDiscardThenSearch()); // Mentor's Guidance — YOUR discard, then search ANY card
register("GAM-004", (c) => c.requestSearchDeck({ filter: "sameSymbolDual", takeN: 1, reason: "Search: take a same-symbol dual (VV / SS / MM) to hand" })); // Recharge
register("GAM-005", (c) => c.requestReturnDiscardComponentsToHand(1)); // Salvage — YOU pick the component
register("GAM-006", (c) => c.requestOrderTopOfDeck(4)); // Premonition Charm — interactive reorder
register("GAM-007", (c) => c.attachTopComponentElseDraw()); // Ritual Circle (attach top component, else draw)
register("GAM-008", (c) => {
  // Overclock — repriced 2026-07-08 (m5 finding): the free double-cast could exhaust
  // your slots early and truncate the round, stealing the opponent's remaining slot
  // (~3 HP + a card of tempo). The strain now costs 2 HP up front.
  c.takeSelfDamage(2);
  c.grantExtraCast();
});
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
register("GAM-019", (c) => c.prophesy(2, 2)); // Saboteur's Kit — a planted time-bomb
register("GAM-020", (c) => c.requestBounceOpponentComponent()); // Disarm — reveals their hand; YOU pick the bounce (or decline)
