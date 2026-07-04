/**
 * Divination (Material) — tempo, card advantage, recursion, mill, and DECK SCULPTING.
 *
 * The school's identity is "look at the top N / select / reorder" — implemented via
 * the sculpting primitives in state-ops (selectFromTop / reorderTopByValue /
 * drawThenBankWorst / tutorBestToTop). The engine auto-resolves the *choice* with a
 * deterministic value heuristic; a UI can later make it interactive. Still SIMPLIFIED:
 * pure-information riders (Foretell, the "look at opp hand" halves) are mechanical
 * no-ops in a headless engine. Recast-from-discard (Borrowed Spell/Power, Convergence)
 * is a SPEC GAP — cast spells return to `prepared`, never to discard, so there is no
 * spell in discard to copy; left as placeholders. Attune (cost-fixing) deferred.
 */
import { register } from "./registry.ts";
import { componentSymbols } from "./context.ts";

// ---- Level 1 ----
register("DIV-001", (c) => c.draw(2)); // Insight (1→2: draw-1-for-M was strictly dominated by Foresight/Divine; balance 2026-07-03)
register("DIV-002", (c) => c.requestTakeFromTop(3, 1, "top")); // Foresight (look 3, choose 1, rest on top)
register("DIV-003", (c) => c.requestTakeFromTop(2, 1, "bottom")); // Divine (look 2, choose 1, other to bottom)
register("DIV-004", (c) => c.lookSelectMaterialToHand(1)); // Augury (top card: draw if M, else bottom)
register("DIV-005", (c) => {
  // Premonition — draw 2; if either is a multi-symbol component, draw a third.
  // (Bumped alongside Insight 1→2 so its gamble ceiling stays above the flat draw.)
  const before = c.self.hand.length;
  c.draw(2);
  const drawn = c.self.hand.slice(before);
  if (drawn.some((d) => componentSymbols(d.defId) >= 2)) c.draw(1);
});
register("DIV-006", (c) => c.returnComponentsFromDiscard(1)); // Recover
register("DIV-007", (c) => {
  c.returnOwnAttachedComponent(); // Refocus
});
register("DIV-008", (c) => c.scryOpponentTopToBottom()); // Scry Glyph (bottom opponent's top)
register("DIV-009", (c) => c.addAttuneBonus()); // Attune — next attach counts as +1 needed symbol
register("DIV-010", (c) => { c.draw(1); c.requestBankToDeckTop(1); }); // Mind's Eye (draw 1, choose 1 to bank on top)
register("DIV-011", (c) => c.dealDamage(1)); // Foretell (info + psychic sting — gives Div an L1 damage axis)
register("DIV-012", (c) => c.requestPickMaterialFromTop(4)); // Omen — interactive: see all 4, pick which M
// DIV-013 Quicken RETIRED — redundant now that attaching is unlimited per turn.

// ---- Level 2 ----
register("DIV-015", (c) => c.returnComponentsFromDiscard(2)); // Reclaim
register("DIV-016", (c) => c.requestSearchDeck({ filter: "component", takeN: 1, reason: "Search: take a component to hand" })); // Seek
register("DIV-017", (c) => c.draw(1)); // Foreknowledge (SIMPLIFIED: info + draw)
register("DIV-018", (c) => {
  const n = c.discardSelfHand(); // Alchemy (SIMPLIFIED: discard all, redraw same)
  c.draw(n);
});
register("DIV-019", (c) => {
  if (c.opponentHasWard()) c.destroyOneOpponentWard(); // Unbind — destroy a Ward or an ongoing effect
  else c.destroyOneOpponentOngoing();
  c.draw(1);
});
register("DIV-020", (c) => c.millOpponent(2)); // Foreclosure
register("DIV-021", (c) => { c.draw(2); c.requestBankToDeckTop(1); }); // Quick Study (draw 2, choose 1 to bank on top)
register("DIV-022", (c) => c.requestOrderTopOfDeck(5)); // Index — interactive reorder
register("DIV-023", (c) => { c.millOpponent(1); c.dealDamage(1); }); // Far Sight (mill-sting)

// ---- Level 3 ----
// Recast cards: the doc says "a spell in your discard," but cast spells return to
// `prepared` (never discard) in this engine — so we recast an already-cast prepared
// spell instead (documented adaptation of the spec mismatch).
register("DIV-027", (c) => c.recastPreparedSpell(1, false)); // Borrowed Spell (own L1)
register("DIV-028", (c) => {
  c.shuffleOwnDiscardIntoDeck(); // Echoes of the Past
  c.draw(2);
});
register("DIV-029", (c) => {
  c.tutorAnyToTop(); // Calculated Draw — search any card to the top, then draw 3 (drawing it)
  c.draw(3);
});
register("DIV-030", (c) => c.requestTakeFromTop(5, 2, "top")); // Manipulate Fate (look 5, choose 2, rest on top)
register("DIV-031", (c) => c.draw(2)); // Perfect Information (info on opp hand/deck is a no-op headless) + draw 2
register("DIV-032", (c) => c.millOpponent(4)); // Entropy
register("DIV-033", (c) => c.requestSearchDeck({ filter: "component", takeN: 2, optional: true, reason: "Search: take up to 2 components to hand" })); // Premeditate
register("DIV-034", (c) => c.drawUntil(7)); // Convergent Future
register("DIV-037", (c) => c.recastPreparedSpell(2, true)); // Borrowed Power (any L1-2, either side)
register("DIV-038", (c) => {
  c.draw(2); // Foretold Strike
  c.dealRawDamage(Math.max(0, c.self.hand.length - 5));
});
register("DIV-039", (c) => c.discardOpponentRandom(1)); // Mind Theft (SIMPLIFIED: random)

// ---- Reactions ----
register("DIV-014", (c) => c.draw(1)); // Anticipate (spell still resolves)
register("DIV-024", (c) => {
  c.returnOneTargetComponent(); // Counter-Plan
  if (!c.targetMeetsCost()) c.cancelTarget();
});
register("DIV-025", (c) => c.draw(1)); // Read the Signs (info + draw)
register("DIV-026", (c) => c.preventAllTargetDamage()); // Misdirection (redirect SIMPLIFIED to fizzle)
register("DIV-035", (c) => {
  c.cancelTarget(); // Spellbind
  c.sealTargetPrepared();
});
register("DIV-036", (c) => {
  c.cancelTarget(); // Rewind
  c.stripAllTargetComponents();
  c.uncastTarget();
});

// ---- Level 4 ----
register("DIV-040", (c) => {
  c.makeMySpellsUncounterable(); // Omniscience — your spells can't be countered/redirected this turn
  c.draw(4);
});
register("DIV-041", (c) => c.returnAllComponentsFromDiscard()); // Eternal Return
register("DIV-042", (c) => c.requestSearchDeck({ filter: "any", takeN: 3, optional: true, reason: "Search: take up to 3 cards to hand" })); // Grand Design
register("DIV-043", (c) => {
  c.opponentShuffleHandIntoDeck(); // Oblivion
  c.millOpponent(8);
});
register("DIV-044", (c) => c.reshuffleEverythingAndDraw(5)); // Time Spiral
register("DIV-045", (c) => {
  c.recastPreparedSpell(4, true); // Convergence — recur the biggest spell and take an extra cast
  c.grantExtraCast();
});
