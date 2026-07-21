/**
 * Abjuration (Somatic) — wards, prevention, ward-to-damage.
 *
 * Reactions are implemented: counters/prevention resolve on the stack; Mana Drain
 * (ABJ-009) is an attach-trap that fires from cardFlags.ATTACH_TRAPS, not from
 * this registry; Absorb heals half of what its prevention actually stops; Phase
 * Shift's rider grants an instant-speed free attach.
 */
import { register } from "./registry.ts";

// ---- Level 1 ----
// Fortify — ward sustain + the anti-burn rider (2026-07-04 balance: taxes Evo's
// Kindle plan every round; zero effect vs burn-less schools, so Div>Abj is untouched).
register("ABJ-001", (c) => { c.buffOneOwnWardOrCreate(2, 1); c.removeOwnBurn(1); });
register("ABJ-002", (c) => c.createWardForSelfWith(1, { onDestroy: "draw2", onDestroyExpires: true })); // Arcane Shell — rider is round-scoped per text
register("ABJ-003", (c) => {
  c.buffAllOwnWards(1); // Ward Pulse
  if (c.selfHasWard()) c.dealDamage(1); // ward-thorn: Abjuration's slow clock scales with keeping wards alive
});
register("ABJ-004", (c) => c.addUntargetableBySingle()); // Aegis
register("ABJ-005", (c) => c.addReactionDiscountS(1)); // Stone Stance
register("ABJ-010", (c) => {
  c.requestSealOpponentPrepared(); // Runic Seal — "target": the caster picks the slot
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
  c.requestSealOpponentPrepared(); // Penumbral Seal (exile ~ seal; "Choose" — caster picks)
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
// ABJ-009 Mana Drain is an attach-TRAP (fires automatically when the opponent
// attaches, bouncing the component) — see cardFlags.ATTACH_TRAPS, not this registry.
register("ABJ-011", (c) => c.preventAllTargetDamageHealingHalf()); // Absorb — heals half of what it actually stops
register("ABJ-013", (c) => {
  c.stripAllTargetComponents(); // Interrupt
  if (!c.targetMeetsCost()) c.cancelTarget();
  c.opponentDraws(1);
});
register("ABJ-014", (c) => {
  c.cancelTarget(); // Phase Shift
  c.grantFreeAttach(); // "you may immediately attach 1 component" — instant-speed window
});
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
  // Retributive Strike — the spell never resolves, so "that spell's damage" is a
  // dry-run prediction (buffs/prevention included), measured BEFORE cancelling.
  const dmg = c.targetPredictedDamage();
  c.cancelTarget();
  c.dealDamage(2 * dmg);
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
