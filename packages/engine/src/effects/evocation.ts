/**
 * Evocation (Verbal) — aggressive burst & Burn. Non-Reaction spells.
 *
 * Reaction cards (EVO-013..016, 028..031, 042..044, 047) are handled once the
 * stack/Reaction system lands. A few "can't be reduced / can't be countered"
 * riders are inert until prevention & the stack exist; noted inline.
 */
import { register } from "./registry.ts";

// ---- Level 1 ----
register("EVO-001", (c) => c.dealDamage(2)); // Spark
register("EVO-002", (c) => {
  c.dealDamage(3); // Firebolt
  c.discardSelfRandom(1);
});
register("EVO-003", (c) => {
  c.dealDamage(1); // Burning Hands
  c.addBurnToOpponent(1);
});
register("EVO-004", (c) => {
  c.dealDamage(2); // Searing Word
  c.discardOpponentRandomComponent(1);
});
register("EVO-005", (c) => c.addDamageBuffThisRound(1)); // Catalyst
register("EVO-006", (c) => c.addBurnToOpponent(1)); // Kindle (2→1: persistent burn made repeated Kindle compound to lethal-by-R4; playtests cvc3/cvc4)
// Wild Surge — the PLAYER picks the discard (interactive); damage resolves on the pick.
register("EVO-007", (c) => c.requestDiscardForDamage());
register("EVO-008", (c) => {
  c.takeSelfDamage(1); // Volatile Charge
  c.dealDamage(3);
});
register("EVO-009", (c) => {
  c.dealDamage(2); // Battery
  c.draw(1);
});
register("EVO-010", (c) => {
  c.dealDamage(1); // Crackle
  c.damageOneOpponentWard(2);
});
register("EVO-011", (c) => c.dealDamage(4)); // Inferno Lance
register("EVO-012", (c) => c.dealDamage(3)); // Hex Bolt (reaction-immunity inert)

// ---- Level 2 ----
register("EVO-017", (c) => c.dealDamage(5)); // Fireball
register("EVO-018", (c) => c.dealDamage(4)); // Lightning Bolt (min-1 rider inert)
register("EVO-019", (c) => {
  c.dealDamage(3); // Inferno
  c.addBurnToOpponent(2);
});
register("EVO-020", (c) => {
  // Scorching Ray — simplified split: chip a ward if present, else full to face.
  if (c.opponentHasWard()) {
    c.dealDamage(1);
    c.damageOneOpponentWard(1);
  } else {
    c.dealDamage(2);
  }
});
register("EVO-021", (c) => {
  const n = c.discardSelfHand(); // Detonate
  c.dealDamage(2 * n);
});
register("EVO-022", (c) => {
  c.addBurnToOpponent(3); // Wildfire — Burn also ticks at the start of your turns this round
  c.addBurnAlsoTicksOwnTurn();
});
register("EVO-023", (c) => {
  c.addDamageBuffThisRound(2); // Channel Pyromancy
  c.addSelfDamageEachTurn(1);
});
register("EVO-024", (c) => {
  c.dealDamage(4); // Wrath of the Mage
  c.draw(1);
});
register("EVO-025", (c) => c.dealDamage(c.opponentAttachedComponentCount())); // Ember Storm
register("EVO-026", (c) => {
  c.dealDamage(3); // Concussive Blast
  c.addReactionTax(1);
});
register("EVO-027", (c) => c.dealDamage(2 + c.opponentBurn())); // Maelstrom

// ---- Level 3 ----
register("EVO-032", (c) => c.dealDamage(7)); // Meteor
register("EVO-033", (c) => {
  c.dealDamage(4); // Chain Lightning
  c.damageEachOpponentWard(2);
});
register("EVO-034", (c) => {
  const n = c.discardSelfHand(); // Pyroclasm
  c.dealDamage(2 * n);
});
register("EVO-035", (c) => c.dealDamage(5)); // Unstoppable Bolt (unstoppable rider inert)
register("EVO-036", (c) => {
  c.addBurnToOpponent(4); // Conflagration — each Burn marker deals +1 when it triggers this round
  c.addBurnAmplifier(1);
});
register("EVO-037", (c) => c.dealDamage(3 + 2 * c.opponentReactionsThisRound())); // Elemental Wrath
register("EVO-038", (c) => {
  c.dealDamage(4); // Cataclysm
  c.draw(2);
});
register("EVO-039", (c) => {
  c.takeSelfDamage(3); // Voltaic Overload
  c.dealDamage(8);
});
register("EVO-040", (c) => {
  const hp = c.destroyOpponentWards(); // Sunburst
  c.dealDamage(hp);
});
register("EVO-041", (c) => c.addReactionPunish(3)); // Combustive Sigil

// ---- Reactions ----
// These respond to the spell on top of the stack; "still resolves" cards just
// deal damage without cancelling. Cards that mirror "that spell's damage" set a
// reflect multiplier — the resolver measures the ACTUAL damage the spell deals
// its victim (post-buff, post-ward-soak) and mirrors it back onto the caster.
register("EVO-013", (c) => c.dealDamage(2)); // Backdraft
register("EVO-014", (c) => c.dealDamage(2)); // Searing Riposte (prevention trigger SIMPLIFIED)
register("EVO-015", (c) => c.dealDamage(2)); // Volatile Bolt (M-attach trigger SIMPLIFIED)
register("EVO-016", (c) => c.dealDamage(4)); // Combust
register("EVO-028", (c) => c.dealDamage(c.targetComponentCount())); // Searing Backlash
register("EVO-029", (c) => {
  if (c.targetRequiresSymbol("M")) c.cancelTarget(); // Mana Burn
  c.dealDamage(2);
});
register("EVO-030", (c) => c.dealDamage(3)); // Flame Riposte
register("EVO-031", (c) => c.dealDamage(3)); // Combustive Counter
register("EVO-042", (c) => c.dealDamage(2 * c.targetLevel())); // Annihilation Strike ("twice that spell's LEVEL" — printed text, not debt)
register("EVO-043", (c) => c.reflectActualOntoTarget(2)); // Final Riposte — "that damage doubled"
register("EVO-044", (c) => c.dealDamage(6)); // Cinder Storm
register("EVO-047", (c) => c.reflectActualOntoTarget(3)); // Pyromancer's Reckoning — "that damage tripled"

// ---- Level 4 ----
register("EVO-045", (c) => c.dealDamage(12)); // Apocalypse (unpreventable rider inert)
register("EVO-046", (c) => {
  c.dealDamage(6); // Phoenix Ascendant
  c.addDamageBuffThisRound(2);
  c.addBurnAmplifier(1); // your Burn markers deal double (+1 per marker)
});
