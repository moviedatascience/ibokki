/**
 * Divination (Material) — tempo, card advantage, recursion, PROPHECY, and DECK SCULPTING.
 *
 * The school's identity is "look at the top N / select / reorder" — every card with
 * a real decision now PAUSES for the player via pendingChoice (take/order/search/
 * reveal modes); only decision-free conditionals (Augury, Component Pouch — a rule
 * decides, not the player) resolve automatically. "Look at your opponent's hand"
 * halves use the `reveal` mode (information shown, nothing moves).
 * The WIN CONDITION is Prophecy (2026-07-05 rework, replacing mill): delayed dooms
 * that fire at the start of the opponent's Nth turn — counter the setup or eat the
 * payload. Normal ward-soakable damage except Oblivion (pierces, like exhaustion).
 * Recast-from-discard (Borrowed Spell/Power, Convergence) is a documented SPEC
 * ADAPTATION — cast spells return to `prepared`, never to discard, so these recast
 * an already-cast prepared spell instead.
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
register("DIV-006", (c) => c.requestReturnDiscardComponentsToHand(1)); // Recover — YOU pick the component
register("DIV-007", (c) => {
  c.returnOwnAttachedComponent(); // Refocus
});
register("DIV-008", (c) => c.scryOpponentTopToBottom()); // Scry Glyph (bottom opponent's top)
register("DIV-009", (c) => c.addAttuneBonus()); // Attune — next attach counts as +1 needed symbol
register("DIV-010", (c) => { c.draw(1); c.requestBankToDeckTop(1); }); // Mind's Eye (draw 1, choose 1 to bank on top)
register("DIV-011", (c) => { c.dealDamage(2); c.requestRevealOpponentHand(); }); // Foretell — the "intel" half is real now
// Omen — the L1 starter doom (m12 finding: L2+ dooms left rounds 1-4 empty). Back to the
// original 2-in-2 spec (m3 finding): at 3 the guaranteed every-round clock outpaced
// Abjuration's entire wall economy — Div>Abj went from knife-edge to a structural bleed.
// vs Foretell (2 NOW plus intel, same cost): the doom's value is that it is announced,
// re-preparable pressure the opponent must schedule around, not the raw number.
register("DIV-012", (c) => c.prophesy(2, 2));
// DIV-013 Quicken RETIRED — redundant now that attaching is unlimited per turn.

// ---- Level 2 ----
register("DIV-015", (c) => c.requestReturnDiscardComponentsToHand(2, true)); // Reclaim — up to 2, your picks
register("DIV-016", (c) => c.requestSearchDeck({ filter: "component", takeN: 1, reason: "Search: take a component to hand" })); // Seek
register("DIV-017", (c) => { c.draw(1); c.requestRevealOpponentHand(); }); // Foreknowledge — see their hand, draw 1
register("DIV-018", (c) => c.requestDiscardThenDraw()); // Alchemy — YOU pick which (and how many) to churn
register("DIV-019", (c) => {
  if (c.opponentHasWard()) c.destroyOneOpponentWard(); // Unbind — destroy a Ward or an ongoing effect
  else c.destroyOneOpponentOngoing();
  c.draw(1);
});
register("DIV-020", (c) => c.prophesy(4, 2)); // Foreclosure — the debt comes due in 2 turns
register("DIV-021", (c) => { c.draw(2); c.requestBankToDeckTop(1); }); // Quick Study (draw 2, choose 1 to bank on top)
register("DIV-022", (c) => c.requestOrderTopOfDeck(5)); // Index — interactive reorder
register("DIV-023", (c) => { c.prophesy(2, 1); c.requestOrderTopOfDeck(3); }); // Far Sight — self-scry 3 + short-fuse doom

// ---- Level 3 ----
// Recast cards: the doc says "a spell in your discard," but cast spells return to
// `prepared` (never discard) in this engine — so we recast an already-cast prepared
// spell instead (documented adaptation of the spec mismatch).
register("DIV-027", (c) => c.recastPreparedSpell(1, false)); // Borrowed Spell (own L1)
register("DIV-028", (c) => {
  c.shuffleOwnDiscardIntoDeck(); // Echoes of the Past
  c.draw(2);
});
// Calculated Draw: "search any card to top, then draw 3" ≡ pick any card to hand
// (rest keep their order — sculpted tops survive, no shuffle), then draw 2 more.
register("DIV-029", (c) => c.requestTutorAnyThenDraw(2));
register("DIV-030", (c) => c.requestTakeFromTop(5, 2, "top")); // Manipulate Fate (look 5, choose 2, rest on top)
register("DIV-031", (c) => { c.draw(2); c.requestRevealOpponentHand(3); }); // Perfect Information — hand + their top 3, draw 2
register("DIV-032", (c) => c.prophesy(7, 3)); // Entropy — inevitable decay on a 3-turn fuse
register("DIV-033", (c) => c.requestSearchDeck({ filter: "component", takeN: 2, optional: true, reason: "Search: take up to 2 components to hand" })); // Premeditate
register("DIV-034", (c) => c.drawUntil(7)); // Convergent Future
register("DIV-037", (c) => c.recastPreparedSpell(2, true)); // Borrowed Power (any L1-2, either side)
register("DIV-038", (c) => {
  c.draw(2); // Foretold Strike
  c.dealRawDamage(Math.max(0, c.self.hand.length - 5));
});
register("DIV-039", (c) => c.requestOpponentDiscardChoice()); // Mind Theft — the caster picks the discard

// ---- Reactions ----
register("DIV-014", (c) => {
  c.draw(1); // Anticipate (spell still resolves; +1 sting added 2026-07-04 so Div's L1 reaction threatens)
  c.dealDamage(1);
});
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
register("DIV-043", (c) => c.prophesy(9, 3, true)); // Oblivion — the death you cannot ward (pierces)
register("DIV-044", (c) => c.reshuffleEverythingAndDraw(5)); // Time Spiral
register("DIV-045", (c) => {
  c.recastPreparedSpell(4, true); // Convergence — recur the biggest spell and take an extra cast
  c.grantExtraCast();
});
