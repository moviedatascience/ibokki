/**
 * Abjuration (Somatic) — wards, prevention, ward-to-damage. Non-Reaction spells.
 *
 * Ward "when destroyed / when it prevents damage" triggers, forced-targeting, and
 * the various Reaction-locking riders need the stack/trigger system and are
 * deferred (noted DEFERRED). Damage reduction (Aegis Eternal, Absolute Defense)
 * and seals are implemented. Reactions (006-009,011,013-016,021,023,026,028,037,041) deferred.
 */
import { register } from "./registry.ts";

// ---- Level 1 ----
// Fortify — ward sustain + the anti-burn rider (2026-07-04 balance: taxes Evo's
// Kindle plan every round; zero effect vs burn-less schools, so Div>Abj is untouched).
register("ABJ-001", (c) => { c.buffOneOwnWardOrCreate(2, 1); c.removeOwnBurn(1); });
register("ABJ-002", (c) => c.createWardForSelfWith(1, { onDestroy: "draw2" })); // Arcane Shell
register("ABJ-003", (c) => {
  c.buffAllOwnWards(1); // Ward Pulse
  if (c.selfHasWard()) c.dealDamage(1); // ward-thorn: Abjuration's slow clock scales with keeping wards alive
});
register("ABJ-004", (c) => c.addUntargetableBySingle()); // Aegis
register("ABJ-005", (c) => c.addReactionDiscountS(1)); // Stone Stance
register("ABJ-010", (c) => {
  c.sealOneOpponentPrepared(); // Runic Seal
});

// ---- Level 2 ----
register("ABJ-012", (c) => c.createWardForSelfWith(3, { reflectOnPrevent: 1 })); // Reflective Ward
register("ABJ-017", (c) => c.lockOpponentReactionsUntilMyNextTurn()); // Arcane Anchor
register("ABJ-018", (c) => c.addReactionTax(1)); // Aetheric Lock
register("ABJ-019", (c) => c.createWardForSelfWith(2, { level1Immunity: true })); // Stonewarden
register("ABJ-020", (c) => c.createWardForSelfWith(3, { firstOppCastDraw: true })); // Sentinel Rune

// ---- Level 3 ----
register("ABJ-022", (c) => {
  c.createWardForSelf(6); // Aegis Eternal
  c.addDamageReductionThisRound(1);
});
register("ABJ-024", (c) => c.addDamageToHeal(5)); // Inversion Field (incoming damage heals you, max 5/round)
register("ABJ-025", (c) => c.buffAllOwnWards(2)); // Sanctum (forced "wards first" is satisfied by ward-absorption)
register("ABJ-027", (c) => c.createWardForSelfWith(5, { onDestroy: "replace2" })); // Ritual Ward
register("ABJ-029", (c) => c.createWardForSelfWith(4, { protected: true })); // Fortress
register("ABJ-030", (c) => {
  c.sealOneOpponentPrepared(); // Penumbral Seal (exile ~ seal)
});
register("ABJ-031", (c) => {
  const hp = c.destroyOwnLargestWard(); // Ward Collapse
  c.dealRawDamage(hp);
});
register("ABJ-032", (c) => c.dealRawDamage(c.damagePreventedThisRound())); // Reckoning
register("ABJ-033", (c) => c.dealRawDamage(3 * c.reactionsCastThisRound())); // Backlash
register("ABJ-034", (c) => c.addReactionPunish(3)); // Exhausting Aura
register("ABJ-035", (c) => c.dealRawDamage(c.selfHasWard() ? 7 : 5)); // Banishing Bolt
register("ABJ-036", (c) => {
  const hp = c.destroyAllOwnWards(); // Overcharge
  c.dealRawDamage(2 * hp);
});
register("ABJ-038", (c) => {
  if (c.opponentHasWard()) {
    c.destroyOneOpponentWard(); // Shieldbreaker Pulse
    c.dealRawDamage(8);
  } else {
    c.dealRawDamage(4);
  }
});

// ---- Reactions (counters & prevention — the school's identity) ----
register("ABJ-006", (c) => c.reduceTargetDamage(1)); // Dampen
register("ABJ-007", (c) => c.reduceTargetDamage(c.selfHasWard() ? 2 : 1)); // Echo Shield
register("ABJ-008", (c) => {
  c.reduceTargetDamage(1); // Grounding
  c.draw(1);
});
register("ABJ-009", (c) => {
  c.returnOneTargetComponent(); // Mana Drain (attach-trigger SIMPLIFIED to remove a component)
  if (!c.targetMeetsCost()) c.cancelTarget();
});
register("ABJ-011", (c) => {
  c.preventAllTargetDamage(); // Absorb
  c.heal(2); // half-of-prevented SIMPLIFIED
});
register("ABJ-013", (c) => {
  c.stripAllTargetComponents(); // Interrupt
  if (!c.targetMeetsCost()) c.cancelTarget();
  c.opponentDraws(1);
});
register("ABJ-014", (c) => c.cancelTarget()); // Phase Shift (free-attach rider DEFERRED)
register("ABJ-015", (c) => {
  if (c.targetRequiresSymbol("M")) c.cancelTarget(); // Counterbind
});
register("ABJ-016", (c) => {
  if (c.targetRequiresSymbol("S")) c.cancelTarget(); // Break Form
});
register("ABJ-021", (c) => {
  if (c.selfHasWard()) {
    c.destroyOwnLargestWard(); // Shatter Ward — sacrifice a ward
    c.preventAllTargetDamage();
  }
});
register("ABJ-023", (c) => {
  c.cancelTarget(); // Total Negation — and the opponent can't cast more this turn
  c.lockOpponentCastsThisTurn();
});
register("ABJ-026", (c) => {
  const n = c.targetComponentCount(); // Abjure the Wicked
  c.cancelTarget();
  c.dealDamage(2 * n);
});
register("ABJ-028", (c) => {
  const n = c.stripAllOpponentPreparedComponents(); // Unraveling
  if (!c.targetMeetsCost()) c.cancelTarget();
  c.opponentDraws(n);
});
register("ABJ-037", (c) => {
  c.cancelTarget(); // Retributive Strike
  c.dealDamage(2 * c.targetLevel()); // doubled-damage SIMPLIFIED
});
register("ABJ-041", (c) => {
  c.cancelEntireStack(); // Archmage's Seal — wipe the stack and lock the opponent out
  c.lockOpponentReactionsUntilMyNextTurn();
  c.lockOpponentCastsThisTurn();
});

// ---- Level 4 ----
register("ABJ-039", (c) => {
  c.addDamageReductionThisRound(999); // Absolute Defense — can't be damaged by spells + lock reactions
  c.lockOpponentReactionsThisRound();
});
register("ABJ-040", (c) => c.createWardForSelfWith(10, { protected: true, onDestroy: "heal5" })); // Ward Eternal
register("ABJ-042", (c) => c.dealRawDamage(c.selfHp())); // Warden's Wrath
register("ABJ-043", (c) => c.dealRawDamage(4 * c.roundNumber())); // Final Reckoning
register("ABJ-044", (c) => {
  const n = c.cancelOpponentStackSpells(); // Null Burst — cancel all opponent spells, 3 damage each
  c.dealRawDamage(3 * n);
});
register("ABJ-045", (c) => {
  const n = c.destroyAllWardsEverywhere(); // Collapse the Veil
  c.dealRawDamage(3 * n);
});
