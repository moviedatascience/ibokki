/**
 * The engine-primitive → card-tag map. Every public method of EffectContext
 * (`packages/engine/src/effects/context.ts`) must appear EITHER here or in
 * READ_ONLY, and the derive test enforces that — so a new primitive cannot be
 * added to the engine without deciding what it means on the card face.
 *
 * Tags are the ENGINE-facing vocabulary (what a card actually does). The
 * player-facing keyword/icon vocabulary (issue #37) is a projection of these —
 * several tags may share one glyph — so this set can stay precise.
 */
import type { CardTag } from "../../../packages/cards/src/types.ts";

export const PRIMITIVE_TAGS: Readonly<Record<string, readonly CardTag[]>> = {
  // ---- damage ----
  dealDamage: ["damage"],
  dealRawDamage: ["damage"],
  requestDiscardForDamage: ["discard", "damage"],
  reflectActualOntoTarget: ["reflect"],
  reflectOntoTarget: ["reflect"],
  takeSelfDamage: ["self-damage"],
  addSelfDamageEachTurn: ["self-damage"],
  // ---- burn ----
  addBurnToOpponent: ["burn"],
  addBurnAmplifier: ["burn"],
  addBurnAlsoTicksOwnTurn: ["burn"],
  removeOwnBurn: ["cleanse"],
  removeOwnBurnGainHp: ["cleanse", "heal"],
  // ---- wards ----
  createWardForSelf: ["ward"],
  createWardForSelfWith: ["ward"],
  buffAllOwnWards: ["ward"],
  buffOneOwnWardOrCreate: ["ward"],
  addWardsProtectedThisRound: ["ward"],
  damageOneOpponentWard: ["ward-break"],
  damageEachOpponentWard: ["ward-break"],
  damageOpponentWeakestWard: ["ward-break"],
  destroyOneOpponentWard: ["ward-break"],
  destroyOpponentWards: ["ward-break"],
  destroyAllWardsEverywhere: ["ward-break", "ward-sacrifice"],
  halveOpponentLargestWard: ["ward-break"],
  destroyOneOpponentOngoing: ["ward-break"],
  prophesyWardCollapse: ["prophecy", "ward-break"],
  destroyOwnLargestWard: ["ward-sacrifice"],
  destroyAllOwnWards: ["ward-sacrifice"],
  // ---- prophecy / seal ----
  prophesy: ["prophecy"],
  requestSealOpponentPrepared: ["seal"],
  sealTargetPrepared: ["seal"],
  // ---- the stack ----
  cancelTarget: ["cancel"],
  cancelEntireStack: ["cancel"],
  cancelOpponentStackSpells: ["cancel"],
  uncastTarget: ["cancel"],
  redirectTarget: ["redirect"],
  reduceTargetDamage: ["prevent"],
  preventAllTargetDamage: ["prevent"],
  preventAllTargetDamageHealingHalf: ["prevent", "heal"],
  addDamageReductionThisRound: ["prevent"],
  addDamageToHeal: ["prevent", "heal"],
  addUntargetableBySingle: ["immune"],
  // ---- cards: draw / discard / disrupt / recover / scry / reveal ----
  draw: ["draw"],
  drawUntil: ["draw"],
  opponentDraws: ["opponent-draws"],
  discardSelfRandom: ["discard"],
  discardSelfHand: ["discard"],
  requestDiscardThenDraw: ["discard", "draw"],
  requestDiscardThenSearch: ["discard", "scry"],
  discardOpponentRandom: ["disrupt"],
  discardOpponentRandomComponent: ["disrupt"],
  requestOpponentDiscardChoice: ["disrupt", "reveal"], // the caster sees the hand to pick
  opponentShuffleHandIntoDeck: ["disrupt"],
  requestBounceOpponentComponent: ["disrupt", "reveal"], // Disarm: look, then bounce
  bounceOpponentComponentToTheirTop: ["disrupt"],
  stripAllOpponentPreparedComponents: ["disrupt"],
  stripAllTargetComponents: ["disrupt"],
  returnOneTargetComponent: ["disrupt"],
  scryOpponentTopToBottom: ["disrupt"],
  requestReturnDiscardComponentsToHand: ["recover"],
  requestReturnDiscardComponentToTop: ["recover"],
  returnAllComponentsFromDiscard: ["recover"],
  returnVComponentsFromDiscard: ["recover"],
  returnOwnAttachedComponent: ["recover"],
  shuffleOwnDiscardIntoDeck: ["recover"],
  reshuffleEverythingAndDraw: ["recover", "draw"],
  requestTakeFromTop: ["scry"],
  requestOrderTopOfDeck: ["scry"],
  requestSearchDeck: ["scry"],
  requestTutorAnyThenDraw: ["scry", "draw"],
  tutorAnyToTop: ["scry"],
  lookSelectComponentToHand: ["scry"],
  lookSelectMaterialToHand: ["scry"],
  lookSelectToHand: ["scry"],
  requestPickMaterialFromTop: ["scry"],
  requestBankToDeckTop: ["scry"],
  reorderTop: ["scry"],
  lootDrawThenBank: ["draw", "scry"],
  requestRevealOpponentHand: ["reveal"],
  // ---- locks / immunity / buffs / tempo ----
  lockOpponentCastsThisTurn: ["lock"],
  lockOpponentExtraDraw: ["lock"],
  lockOpponentReactionsThisRound: ["lock"],
  lockOpponentReactionsUntilMyNextTurn: ["lock"],
  addReactionTax: ["lock"],
  addReactionPunish: ["lock"],
  makeMySpellsUncounterable: ["immune"],
  protectMyHandFromDiscard: ["immune"],
  addDamageBuffThisRound: ["buff"],
  addNextSpellDamage: ["buff"],
  addAttuneBonus: ["tempo"],
  addReactionDiscountS: ["tempo"],
  grantExtraCast: ["tempo"],
  grantExtraAttach: ["tempo"],
  grantFreeAttach: ["tempo"],
  attachTopComponentElseDraw: ["tempo"],
  requestTreatAsComponent: ["tempo"],
  // ---- misc ----
  heal: ["heal"],
  recastPreparedSpell: ["recast"],
  spendPrevented: ["ledger"],
  damagePreventedTotal: ["ledger"],
};

/** Pure reads (conditions / scaling inputs) — they never change what a card DOES. */
export const READ_ONLY: ReadonlySet<string> = new Set([
  "damagePreventedThisRound",
  "handCount",
  "hasTarget",
  "opponentAttachedComponentCount",
  "opponentBurn",
  "opponentHasWard",
  "opponentReactionsThisRound",
  "reactionsCastThisRound",
  "roundNumber",
  "selfHasWard",
  "selfHp",
  "selfWardCount",
  "targetComponentCount",
  "targetLevel",
  "targetMeetsCost",
  "targetPredictedDamage",
  "targetRequiresSymbol",
]);

/** Cast-time riders in cardFlags.ts: the exported set/record name → tags for every id listed in it. */
export const FLAG_TAGS: Readonly<Record<string, readonly CardTag[]>> = {
  REACTION_PROOF: ["immune"],
  UNSTOPPABLE: ["immune"],
  UNPREVENTABLE: ["immune"],
  MIN_DAMAGE: ["immune"],
  ATTACH_TRAPS: ["trap"],
  PREVENT_TRAPS: ["trap", "damage"],
  LEDGER_MIN: ["ledger"],
};
