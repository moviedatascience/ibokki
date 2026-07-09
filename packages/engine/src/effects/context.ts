/**
 * The EffectContext is the API a card's effect program uses. It wraps the
 * low-level state-ops with caster-relative, intention-revealing primitives so
 * card definitions read close to their rules text:
 *
 *   register("EVO-017", (c) => c.dealDamage(5));            // Fireball
 *   register("EVO-009", (c) => { c.dealDamage(2); c.draw(1); }); // Battery
 */
import { getCard, getComponent, type Sym } from "@ibokki/cards";
import { combinedSymbols, meetsCost } from "../cost.ts";
import { getEffect } from "./registry.ts";
import {
  addBurn,
  addOngoing,
  createWard,
  damageAllWards,
  dealDamageToPlayer,
  dealDamageToWard,
  destroyAllWards,
  discardRandom,
  discardTopBySymbols,
  discardWholeHand,
  drawN,
  drawThenBankWorst,
  healPlayer,
  millPlayer,
  reorderTopByValue,
  returnFromDiscard,
  selectFromTop,
  shuffleDiscardIntoDeck,
  shuffleHandIntoDeck,
  sumOngoing,
  symbolCount,
  topCardToBottom,
  tutorBestToTop,
  tutorComponents,
  type WardFlags,
} from "../state-ops.ts";
import { shuffleInPlace } from "../rng.ts";
import {
  isComponentDefId,
  otherPlayer,
  type CardInstance,
  type GameEvent,
  type GameState,
  type OngoingExpiry,
  type PlayerId,
  type PlayerState,
  type StackItem,
  type Ward,
} from "../types.ts";

export interface EffectContext {
  readonly state: GameState;
  readonly events: GameEvent[];
  readonly selfId: PlayerId;
  readonly opponentId: PlayerId;
  readonly self: PlayerState;
  readonly opponent: PlayerState;
  readonly card: CardInstance;

  // ---- damage / life ----
  /** Deal damage to the opponent, including this caster's active damage buffs. */
  dealDamage(amount: number): void;
  /** Damage to the opponent with no buffs applied. */
  dealRawDamage(amount: number): void;
  /** Self-inflicted damage (no buffs). */
  takeSelfDamage(amount: number): void;
  heal(amount: number): void;

  // ---- cards / decks ----
  draw(n: number): number;
  opponentDraws(n: number): number;
  discardSelfRandom(n: number): number;
  discardSelfHand(): number;
  /** Discard the highest-symbol card in hand; returns its symbol count (auto, non-interactive). */
  discardSelfHighestSymbol(): number;
  /** Pause for the controller to pick a hand card to discard; the opponent then
   *  takes 1 damage per component symbol on it (Wild Surge, interactive). */
  requestDiscardForDamage(): void;
  discardOpponentRandomComponent(n: number): number;
  discardOpponentRandom(n: number): number;
  millOpponent(n: number): number;
  /** Inscribe a delayed doom on the opponent: deal `amount` at the start of their
   *  `turns`-th turn from now (Prophecy — Divination's win condition). The payload
   *  is fixed at inscription; `pierce` makes it exhaustion-style unpreventable (Oblivion). */
  prophesy(amount: number, turns: number, pierce?: boolean): void;

  // ---- Divination: deck sculpting (look at top N / select / reorder / loot) ----
  /** Pause for the controller to pick `takeN` of the top `lookN` cards into hand; rest go to `leftover` (interactive). */
  requestTakeFromTop(lookN: number, takeN: number, leftover: "top" | "bottom"): void;
  /** Pause for the controller to put one hand card on top of their deck (interactive loot). */
  requestBankToDeckTop(n: number): void;
  /** Look at top `lookN`, take the best `takeN` to hand; rest back on top (or to bottom). */
  lookSelectToHand(lookN: number, takeN: number, restToBottom?: boolean): number;
  /** Look at top `lookN`, take the best Material (M) component to hand; rest to the bottom. */
  lookSelectMaterialToHand(lookN: number): number;
  /** Reveal top `lookN`, take the best component card to hand; rest to the bottom. */
  lookSelectComponentToHand(lookN: number): number;
  /** Reorder the top `n` cards so the most useful are drawn first. */
  reorderTop(n: number): void;
  /** Draw `drawCount`, then bank the `bankCount` least-useful hand cards on top (loot). */
  lootDrawThenBank(drawCount: number, bankCount: number): void;
  /** Search the deck for the most useful card and put it on top (no shuffle). */
  tutorAnyToTop(): boolean;
  /** Put the opponent's top card on the bottom of their deck (soft disruption). */
  scryOpponentTopToBottom(): boolean;
  /** Your next attached component counts as +1 of the symbol the spell still needs (Attune). */
  addAttuneBonus(): void;
  /** Reveal your top card: if a component, attach it to a prepared spell; else draw it (Ritual Circle). */
  attachTopComponentElseDraw(): void;
  /** Bounce the opponent's most useful hand component onto the top of their deck (Disarm). */
  bounceOpponentComponentToTheirTop(): boolean;

  // ---- Divination: search / recursion / tempo ----
  drawUntil(target: number): number;
  tutorComponentsToHand(n: number): number;
  /** Pause for the controller to search their deck: matching cards are staged
   *  as choices, picks are revealed to hand, then the deck shuffles. `optional`
   *  = "up to N" (pass ends early). Recharge/Seek/Premeditate/Grand Design. */
  requestSearchDeck(opts: { filter: "any" | "component" | "sameSymbolDual"; takeN: number; optional?: boolean; reason: string }): void;
  /** Pause to look at the top N and put them back ON TOP in any order — the
   *  first pick ends up topmost (Index / Premonition Charm). */
  requestOrderTopOfDeck(n: number): void;
  /** Omen: look at the top N (all shown), pick one M component to hand; the
   *  rest go to the bottom. No M among them → all to the bottom, no pause. */
  requestPickMaterialFromTop(lookN: number): void;
  /** Mentor's Guidance: pick a hand card to discard, then search for any one card. */
  requestDiscardThenSearch(): void;
  /** Disarm: reveal the opponent's hand; MAY pick one component → owner's deck top. */
  requestBounceOpponentComponent(): void;
  /** Far Sight: look at the opponent's top `lookN`; MAY pick one → their discard,
   *  the rest return on top in order (interactive mill). */
  requestMillOpponentTop(lookN: number): void;
  /** Pure information: reveal the opponent's hand (plus their top `alsoTopN` deck
   *  cards) to the caster; nothing moves, Done dismisses (Foretell / Perfect Info). */
  requestRevealOpponentHand(alsoTopN?: number): void;
  /** Alchemy: pick ANY NUMBER of hand cards to discard, then draw that many. */
  requestDiscardThenDraw(): void;
  /** Mind Theft: see the opponent's hand and CHOOSE the card they discard. */
  requestOpponentDiscardChoice(): void;
  /** Mnemonic Charm: pick a component in your discard → top of your deck. */
  requestReturnDiscardComponentToTop(): void;
  /** Recover / Salvage / Reclaim: pick `n` components in your discard → hand.
   *  `optional` = "up to n" (Done may end early). */
  requestReturnDiscardComponentsToHand(n: number, optional?: boolean): void;
  /** Calculated Draw: search the WHOLE deck for any card to hand (order of the
   *  rest preserved — no shuffle), then draw `drawAfter` more. */
  requestTutorAnyThenDraw(drawAfter: number): void;
  returnComponentsFromDiscard(n: number): number;
  returnAllComponentsFromDiscard(): number;
  shuffleOwnDiscardIntoDeck(): number;
  opponentShuffleHandIntoDeck(): number;
  /** Time Spiral: both players shuffle hand + discard into deck and draw n. */
  reshuffleEverythingAndDraw(n: number): void;
  /** Grant one extra component attachment this turn (Quicken). */
  grantExtraAttach(): void;
  /** Pick a component already attached to one of your prepared spells back up (Refocus). */
  returnOwnAttachedComponent(): boolean;
  destroyOneOpponentWard(): void;

  // ---- burn / ongoing ----
  addBurnToOpponent(n: number): void;
  addDamageBuffThisRound(amount: number): void;
  /** One-shot: the NEXT spell you cast THIS TURN deals +amount (Battle Trance, Empowered Chalk). */
  addNextSpellDamage(amount: number): void;
  addSelfDamageEachTurn(amount: number): void;
  addReactionTax(amount: number): void;
  addReactionPunish(amount: number): void;
  /** Amplify your Burn: +amount damage per marker each tick this round (Conflagration/Phoenix). */
  addBurnAmplifier(amount: number): void;
  /** Your opponent's Burn also ticks at the start of your turns this round (Wildfire). */
  addBurnAlsoTicksOwnTurn(): void;
  /** Your opponent can't play Reactions until your next turn (Arcane Anchor). */
  lockOpponentReactionsUntilMyNextTurn(): void;
  /** Your opponent can't play Reactions for the rest of the round (Absolute Defense). */
  lockOpponentReactionsThisRound(): void;
  /** Your opponent can't cast more spells this turn (Total Negation). */
  lockOpponentCastsThisTurn(): void;
  /** Your spells can't be cancelled/redirected/reduced until your next turn (Resolve/Omniscience). */
  makeMySpellsUncounterable(): void;
  /** Convert incoming damage into healing this round, up to `max` HP total (Inversion Field). */
  addDamageToHeal(max: number): void;
  /** Until the start of your next turn, you can't be targeted by 1-component spells (Aegis). */
  addUntargetableBySingle(): void;
  /** Your first Reaction this round costs `amount` fewer S (min 1 component) (Stone Stance). */
  addReactionDiscountS(amount: number): void;

  // ---- wards ----
  createWardForSelf(hp: number): Ward;
  /** Create a ward carrying trigger flags (on-destroy / reflect / protected / immunity). */
  createWardForSelfWith(hp: number, flags: WardFlags): Ward;
  damageOneOpponentWard(amount: number): void;
  damageEachOpponentWard(amount: number): void;
  /** Destroy all opponent wards; returns the total HP destroyed. */
  destroyOpponentWards(): number;
  opponentHasWard(): boolean;

  // ---- Abjuration: ward sustain, seals, damage reduction ----
  selfWardCount(): number;
  selfHasWard(): boolean;
  /** Add HP to one ward you control, or create one with createHp if you have none (Fortify). */
  buffOneOwnWardOrCreate(addHp: number, createHp: number): void;
  buffAllOwnWards(amount: number): void;
  /** Destroy your largest ward; returns its HP (Ward Collapse). */
  destroyOwnLargestWard(): number;
  /** Destroy all your wards; returns their total HP (Overcharge). */
  destroyAllOwnWards(): number;
  /** Destroy every ward on the board; returns how many were destroyed (Collapse the Veil). */
  destroyAllWardsEverywhere(): number;
  addDamageReductionThisRound(amount: number): void;
  damagePreventedThisRound(): number;
  /** Stage a "seal target prepared spell" choice: the caster picks which opponent
   *  prepared spell (uncast, unsealed) gains the Seal. Face-down candidates appear
   *  as FACEDOWN-<slot> — targeting a slot never reveals its identity. No-op when
   *  nothing is sealable. (Was SIMPLIFIED auto-first-slot until 2026-07-08, m4.) */
  requestSealOpponentPrepared(): void;

  // ---- misc queries ----
  selfHp(): number;
  roundNumber(): number;
  reactionsCastThisRound(): number;

  // ---- trainers ----
  /** Allow one cast beyond the one-per-turn rule THIS turn; it still needs a
   *  free spell slot and attached components (Overclock). */
  grantExtraCast(): void;
  /** Remove all your Burn markers and gain 1 HP per marker removed (Quenching Salts). */
  removeOwnBurnGainHp(): void;
  /** Remove up to `n` of your own Burn markers (Fortify's anti-burn rider). */
  removeOwnBurn(n: number): void;

  // ---- Reactions (operate on the stack item this Reaction targets) ----
  hasTarget(): boolean;
  cancelTarget(): void;
  reduceTargetDamage(amount: number): void;
  preventAllTargetDamage(): void;
  /** Target's controller takes `amount` after the target spell resolves (reflection). */
  reflectOntoTarget(amount: number): void;
  targetLevel(): number;
  targetComponentCount(): number;
  targetRequiresSymbol(sym: Sym): boolean;
  /** Return one component attached to the target spell to its owner's hand. */
  returnOneTargetComponent(): boolean;
  stripAllTargetComponents(): number;
  targetMeetsCost(): boolean;
  /** Mark the target spell castable again this round (Rewind). */
  uncastTarget(): void;
  /** Seal the target spell so it can't be cast again this round (Spellbind). */
  sealTargetPrepared(): void;
  /** Cancel every item remaining on the stack (Archmage's Seal). */
  cancelEntireStack(): void;
  /** Cancel every opponent spell on the stack; returns how many (Null Burst). */
  cancelOpponentStackSpells(): number;
  /** Strip components off all opponent prepared spells; returns spells affected (Unraveling). */
  stripAllOpponentPreparedComponents(): number;
  /** Destroy one of the opponent's ongoing effects; true if one was removed (Unbind/Dispelling Powder). */
  destroyOneOpponentOngoing(): boolean;
  /** Recast a copy of an already-cast prepared spell (≤ maxLevel) for free; true if one ran. */
  recastPreparedSpell(maxLevel: number, includeOpponent: boolean): boolean;
  /** The opponent can't make you discard or strip your hand/prepared until your next turn (Iron Will). */
  protectMyHandFromDiscard(): void;
  /** Your opponent can't draw via effects until your next turn (Mana Sickness). */
  lockOpponentExtraDraw(): void;

  // ---- queries (scaling) ----
  opponentBurn(): number;
  opponentAttachedComponentCount(): number;
  opponentReactionsThisRound(): number;
  handCount(): number;
}

export function makeContext(
  state: GameState,
  selfId: PlayerId,
  card: CardInstance,
  events: GameEvent[],
  item?: StackItem,
): EffectContext {
  const opponentId = otherPlayer(selfId);
  const self = state.players[selfId];
  const opponent = state.players[opponentId];

  const findTarget = (): StackItem | undefined =>
    item?.targetSid == null ? undefined : state.stack.find((s) => s.sid === item.targetSid);

  const targetPrepared = () => {
    const t = findTarget();
    if (!t) return undefined;
    return state.players[t.controller].prepared[t.preparedIndex];
  };

  /** Apply this resolving item's prevention to an outgoing damage amount. */
  const applyItemReduction = (amount: number): number => {
    if (!item || item.damageReduction <= 0) return amount;
    const reduced = Math.min(item.damageReduction, amount);
    item.damageReduction -= reduced;
    if (reduced > 0) opponent.damagePreventedThisRound += reduced;
    return amount - reduced;
  };

  return {
    state,
    events,
    selfId,
    opponentId,
    self,
    opponent,
    card,

    dealDamage(amount) {
      const base = amount + sumOngoing(self, "damageBuff") + (item ? item.damageBonus : 0);
      let dmg = applyItemReduction(base);
      if (item && item.minDamage > 0) dmg = Math.max(dmg, Math.min(base, item.minDamage)); // Lightning Bolt
      dealDamageToPlayer(state, opponentId, dmg, events);
    },
    dealRawDamage(amount) {
      dealDamageToPlayer(state, opponentId, applyItemReduction(amount), events);
    },
    takeSelfDamage(amount) {
      dealDamageToPlayer(state, selfId, amount, events);
    },
    heal(amount) {
      healPlayer(state, selfId, amount, events);
    },

    draw(n) {
      if (sumOngoing(opponent, "drawLock") > 0) return 0; // Mana Sickness: only your normal turn-draw
      const drawn = drawN(state, selfId, n, events);
      if (drawn > 0) events.push({ type: "drew", player: selfId, count: drawn });
      return drawn;
    },
    opponentDraws(n) {
      const drawn = drawN(state, opponentId, n, events);
      if (drawn > 0) events.push({ type: "drew", player: opponentId, count: drawn });
      return drawn;
    },
    discardSelfRandom(n) {
      return discardRandom(state, selfId, n, events);
    },
    discardSelfHand() {
      return discardWholeHand(state, selfId, events);
    },
    discardSelfHighestSymbol() {
      const removed = discardTopBySymbols(state, selfId, 1, events);
      const card = removed[0];
      return card ? symbolCount(card.defId) : 0;
    },
    discardOpponentRandomComponent(n) {
      if (sumOngoing(opponent, "cannotBeForcedToDiscard") > 0) return 0; // Iron Will
      return discardRandom(state, opponentId, n, events, (defId) => isComponentDefId(defId));
    },
    discardOpponentRandom(n) {
      if (sumOngoing(opponent, "cannotBeForcedToDiscard") > 0) return 0; // Iron Will
      return discardRandom(state, opponentId, n, events);
    },
    millOpponent(n) {
      return millPlayer(state, opponentId, n, events);
    },
    prophesy(amount, turns, pierce) {
      opponent.prophecies.push({ amount, turnsLeft: turns, pierce: !!pierce, defId: card.defId });
      events.push({ type: "prophecyCreated", target: opponentId, amount, turns, defId: card.defId });
    },

    requestSearchDeck({ filter, takeN, optional, reason }) {
      const deck = self.resourceDeck;
      const DUALS = new Set(["CMP-VV", "CMP-SS", "CMP-MM"]);
      const matches = (defId: string): boolean =>
        filter === "any" ? true : filter === "component" ? isComponentDefId(defId) : DUALS.has(defId);
      const staged: typeof deck = [];
      for (let i = deck.length - 1; i >= 0; i--) {
        if (matches(deck[i]!.defId)) staged.push(...deck.splice(i, 1));
      }
      if (staged.length === 0) {
        // Searched and found nothing — the deck still gets shuffled.
        state.rngState = shuffleInPlace(deck, state.rngState);
        events.push({ type: "searched", player: selfId, count: 0 });
        return;
      }
      state.pendingChoice = {
        player: selfId,
        reason,
        mode: "takeToHand",
        candidates: staged,
        picksRemaining: Math.min(takeN, staged.length),
        leftover: "top",
        shuffleAfter: true, // it's a search — the deck shuffles when the choice ends
        optional,
      };
      events.push({ type: "choicePending", player: selfId, reason: "search" });
    },
    requestOrderTopOfDeck(n) {
      const deck = self.resourceDeck;
      const look = Math.min(n, deck.length);
      if (look === 0) return;
      const staged = deck.splice(deck.length - look, look); // top `look` (top = end)
      state.pendingChoice = {
        player: selfId,
        reason: `Put these ${look} back on top — your FIRST pick ends up topmost`,
        mode: "orderToTop",
        candidates: staged,
        picksRemaining: look,
        leftover: "top",
        picked: [],
      };
      events.push({ type: "choicePending", player: selfId, reason: "reorder" });
    },
    requestPickMaterialFromTop(lookN) {
      const deck = self.resourceDeck;
      const look = Math.min(lookN, deck.length);
      if (look === 0) return;
      const staged = deck.splice(deck.length - look, look);
      const withM = staged.filter((c) => (getComponent(c.defId)?.symbols.M ?? 0) > 0);
      if (withM.length === 0) {
        deck.unshift(...staged); // nothing to take — all to the bottom
        events.push({ type: "searched", player: selfId, count: 0 });
        return;
      }
      state.pendingChoice = {
        player: selfId,
        reason: "Take one Material (M) component — the rest go to the bottom",
        mode: "takeToHand",
        candidates: staged, // all shown (you looked at them); only M's pickable
        picksRemaining: 1,
        leftover: "bottom",
        eligibleIids: withM.map((c) => c.iid),
      };
      events.push({ type: "choicePending", player: selfId, reason: "take" });
    },
    requestDiscardThenSearch() {
      if (self.hand.length === 0) {
        // Nothing to discard — go straight to the search.
        this.requestSearchDeck({ filter: "any", takeN: 1, reason: "Search: take any one card from your deck" });
        return;
      }
      state.pendingChoice = {
        player: selfId,
        reason: "Discard a card — then search your deck for any one card",
        mode: "discardForSearch",
        candidates: [...self.hand],
        picksRemaining: 1,
        leftover: "top",
      };
      events.push({ type: "choicePending", player: selfId, reason: "discard" });
    },
    requestBounceOpponentComponent() {
      if (opponent.hand.length === 0) return; // nothing to look at
      const components = opponent.hand.filter((c) => isComponentDefId(c.defId));
      state.pendingChoice = {
        player: selfId,
        reason: "Opponent's hand — you MAY put one component on top of their deck",
        mode: "bounceToOwnersDeckTop",
        candidates: [...opponent.hand], // the whole hand is revealed to you
        picksRemaining: 1,
        leftover: "top",
        eligibleIids: components.map((c) => c.iid),
        optional: true,
      };
      events.push({ type: "choicePending", player: selfId, reason: "disarm" });
    },
    requestRevealOpponentHand(alsoTopN = 0) {
      const deck = opponent.resourceDeck;
      const top = alsoTopN > 0 ? deck.slice(Math.max(0, deck.length - alsoTopN)) : [];
      const candidates = [...opponent.hand, ...top]; // aliases — nothing moves
      if (candidates.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason:
          alsoTopN > 0
            ? `Opponent's hand and their top ${top.length} deck card${top.length === 1 ? "" : "s"} — Done to continue`
            : "Opponent's hand — Done to continue",
        mode: "reveal",
        candidates,
        picksRemaining: 0,
        leftover: "top",
        eligibleIids: [], // information only — nothing is pickable
        optional: true,
      };
      events.push({ type: "choicePending", player: selfId, reason: "reveal" });
    },
    requestDiscardThenDraw() {
      if (self.hand.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason: "Discard any number of cards — you draw that many when done",
        mode: "discardThenDraw",
        candidates: [...self.hand],
        picksRemaining: self.hand.length,
        leftover: "top",
        optional: true,
        picked: [],
      };
      events.push({ type: "choicePending", player: selfId, reason: "discard" });
    },
    requestOpponentDiscardChoice() {
      if (opponent.hand.length === 0) return;
      if (sumOngoing(opponent, "cannotBeForcedToDiscard") > 0) return; // Iron Will
      state.pendingChoice = {
        player: selfId,
        reason: "Opponent's hand — choose the card they discard",
        mode: "discardFromOpponentHand",
        candidates: [...opponent.hand],
        picksRemaining: 1,
        leftover: "top",
      };
      events.push({ type: "choicePending", player: selfId, reason: "discard" });
    },
    requestReturnDiscardComponentToTop() {
      const components = self.discard.filter((c) => isComponentDefId(c.defId));
      if (components.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason: "Your discard — choose a component to put on top of your deck",
        mode: "discardToDeckTop",
        candidates: components,
        picksRemaining: 1,
        leftover: "top",
      };
      events.push({ type: "choicePending", player: selfId, reason: "return" });
    },
    requestReturnDiscardComponentsToHand(n, optional) {
      const components = self.discard.filter((c) => isComponentDefId(c.defId));
      if (components.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason:
          n > 1
            ? `Your discard — return up to ${n} components to your hand`
            : "Your discard — choose a component to return to your hand",
        mode: "discardToHand",
        candidates: components,
        picksRemaining: Math.min(n, components.length),
        leftover: "top",
        ...(optional ? { optional: true } : {}),
      };
      events.push({ type: "choicePending", player: selfId, reason: "return" });
    },
    requestTutorAnyThenDraw(drawAfter) {
      const deck = self.resourceDeck;
      if (deck.length === 0) {
        drawN(state, selfId, drawAfter + 1, events); // nothing to search — just the draws
        return;
      }
      state.pendingChoice = {
        player: selfId,
        reason: "Search: take ANY card from your deck to hand (the rest keep their order)",
        mode: "takeToHand",
        candidates: deck.splice(0, deck.length),
        picksRemaining: 1,
        leftover: "top", // leftovers return in original order — deliberately NO shuffle
        drawAfter,
      };
      events.push({ type: "choicePending", player: selfId, reason: "search" });
    },
    requestMillOpponentTop(lookN) {
      const deck = opponent.resourceDeck;
      const look = Math.min(lookN, deck.length);
      if (look === 0) return;
      const staged = deck.splice(deck.length - look, look); // top `look` cards (top = end)
      state.pendingChoice = {
        player: selfId,
        reason: `Opponent's top ${look} — you MAY put one into their discard`,
        mode: "millFromTop",
        candidates: staged,
        picksRemaining: 1,
        leftover: "top",
        optional: true,
      };
      events.push({ type: "choicePending", player: selfId, reason: "mill" });
    },
    requestDiscardForDamage() {
      if (self.hand.length === 0) return; // nothing to discard, no damage
      state.pendingChoice = {
        player: selfId,
        reason: "Discard a card — deal 1 damage per component symbol on it",
        mode: "discardForDamage",
        candidates: [...self.hand],
        picksRemaining: 1,
        leftover: "top",
        // Prevention applied to the casting item carries into the deferred damage.
        damageReduction: item?.damageReduction ?? 0,
      };
      events.push({ type: "choicePending", player: selfId, reason: "discard" });
    },
    requestTakeFromTop(lookN, takeN, leftover) {
      const deck = self.resourceDeck;
      const look = Math.min(lookN, deck.length);
      if (look === 0) return;
      const staged = deck.splice(deck.length - look, look); // top `look` cards (top = end)
      state.pendingChoice = {
        player: selfId,
        reason: takeN > 1 ? `Take ${Math.min(takeN, look)} of these ${look}` : `Take one of these ${look}`,
        mode: "takeToHand",
        candidates: staged,
        picksRemaining: Math.min(takeN, look),
        leftover,
      };
      events.push({ type: "choicePending", player: selfId, reason: "take" });
    },
    requestBankToDeckTop(n) {
      if (self.hand.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason: "Put a card on top of your Resource Deck",
        mode: "bankToDeckTop",
        candidates: [...self.hand],
        picksRemaining: Math.min(n, self.hand.length),
        leftover: "top",
      };
      events.push({ type: "choicePending", player: selfId, reason: "bank" });
    },
    lookSelectToHand(lookN, takeN, restToBottom) {
      return selectFromTop(state, selfId, lookN, takeN, events, { restToBottom: restToBottom ?? false });
    },
    lookSelectMaterialToHand(lookN) {
      return selectFromTop(state, selfId, lookN, 1, events, {
        filter: (d) => (getComponent(d)?.symbols.M ?? 0) > 0,
        restToBottom: true,
      });
    },
    lookSelectComponentToHand(lookN) {
      return selectFromTop(state, selfId, lookN, 1, events, {
        filter: (d) => isComponentDefId(d),
        restToBottom: true,
      });
    },
    reorderTop(n) {
      reorderTopByValue(state, selfId, n);
    },
    lootDrawThenBank(drawCount, bankCount) {
      drawThenBankWorst(state, selfId, drawCount, bankCount, events);
    },
    tutorAnyToTop() {
      return tutorBestToTop(state, selfId, events);
    },
    scryOpponentTopToBottom() {
      return topCardToBottom(state, opponentId);
    },
    addAttuneBonus() {
      addOngoing(state, selfId, "attuneBonus", 1, "endOfRound", events);
    },
    attachTopComponentElseDraw() {
      const top = self.resourceDeck[self.resourceDeck.length - 1];
      if (top && isComponentDefId(top.defId)) {
        const idx = self.prepared.findIndex((p) => !p.cast && !p.sealed && p.attached.length < 2);
        if (idx >= 0) {
          self.resourceDeck.pop();
          self.prepared[idx]!.attached.push(top);
          events.push({ type: "attached", player: selfId, preparedIndex: idx, componentDefId: top.defId });
          return;
        }
      }
      const drawn = drawN(state, selfId, 1, events); // not a component, or nowhere to attach -> draw it
      if (drawn > 0) events.push({ type: "drew", player: selfId, count: drawn });
    },
    bounceOpponentComponentToTheirTop() {
      let best = -1;
      let bestVal = -Infinity;
      opponent.hand.forEach((card, i) => {
        if (!isComponentDefId(card.defId)) return;
        const v = componentSymbols(card.defId);
        if (v > bestVal) {
          bestVal = v;
          best = i;
        }
      });
      if (best < 0) return false;
      opponent.resourceDeck.push(opponent.hand.splice(best, 1)[0]!);
      return true;
    },

    drawUntil(target) {
      const need = Math.max(0, target - self.hand.length);
      const drawn = drawN(state, selfId, need, events);
      if (drawn > 0) events.push({ type: "drew", player: selfId, count: drawn });
      return drawn;
    },
    tutorComponentsToHand(n) {
      return tutorComponents(state, selfId, n, events);
    },
    returnComponentsFromDiscard(n) {
      return returnFromDiscard(state, selfId, n, events, (defId) => isComponentDefId(defId));
    },
    returnAllComponentsFromDiscard() {
      return returnFromDiscard(state, selfId, self.discard.length, events, (defId) =>
        isComponentDefId(defId),
      );
    },
    shuffleOwnDiscardIntoDeck() {
      return shuffleDiscardIntoDeck(state, selfId, events);
    },
    opponentShuffleHandIntoDeck() {
      return shuffleHandIntoDeck(state, opponentId, events);
    },
    reshuffleEverythingAndDraw(n) {
      for (const id of [selfId, opponentId] as PlayerId[]) {
        shuffleHandIntoDeck(state, id, events);
        shuffleDiscardIntoDeck(state, id, events);
        const drawn = drawN(state, id, n, events);
        if (drawn > 0) events.push({ type: "drew", player: id, count: drawn });
      }
    },
    grantExtraAttach() {
      self.componentPlayedThisTurn = false;
    },
    returnOwnAttachedComponent() {
      for (const prep of self.prepared) {
        if (prep.attached.length > 0) {
          const card = prep.attached.pop()!;
          self.hand.push(card);
          events.push({ type: "recovered", player: selfId, count: 1 });
          return true;
        }
      }
      return false;
    },
    destroyOneOpponentWard() {
      const ward = opponent.wards.find((w) => !w.protected);
      if (ward) dealDamageToWard(state, opponentId, ward, ward.hp, events);
    },

    addBurnToOpponent(n) {
      addBurn(state, opponentId, n, events);
    },
    addDamageBuffThisRound(amount) {
      addOngoing(state, selfId, "damageBuff", amount, "endOfRound", events);
    },
    addNextSpellDamage(amount) {
      self.nextSpellBonus += amount;
    },
    addSelfDamageEachTurn(amount) {
      addOngoing(state, selfId, "selfDamageEachTurn", amount, "endOfRound", events);
    },
    addReactionTax(amount) {
      addOngoing(state, selfId, "reactionTax", amount, "endOfRound", events);
    },
    addReactionPunish(amount) {
      addOngoing(state, selfId, "reactionPunish", amount, "endOfRound", events);
    },
    addBurnAmplifier(amount) {
      addOngoing(state, selfId, "burnDoubleDamage", amount, "endOfRound", events);
    },
    addBurnAlsoTicksOwnTurn() {
      addOngoing(state, selfId, "burnAlsoTicksOwnTurn", 1, "endOfRound", events);
    },
    lockOpponentReactionsUntilMyNextTurn() {
      addOngoing(state, selfId, "reactionsLocked", 1, "startOfOwnNextTurn", events);
    },
    lockOpponentReactionsThisRound() {
      addOngoing(state, selfId, "reactionsLocked", 1, "endOfRound", events);
    },
    lockOpponentCastsThisTurn() {
      opponent.noCastThisTurn = true;
    },
    makeMySpellsUncounterable() {
      addOngoing(state, selfId, "spellsUncounterable", 1, "startOfOwnNextTurn", events);
    },
    addDamageToHeal(max) {
      addOngoing(state, selfId, "damageToHeal", max, "endOfRound", events);
    },
    addUntargetableBySingle() {
      addOngoing(state, selfId, "untargetableBySingle", 1, "startOfOwnNextTurn", events);
    },
    addReactionDiscountS(amount) {
      addOngoing(state, selfId, "reactionDiscountS", amount, "endOfRound", events);
    },

    createWardForSelf(hp) {
      return createWard(state, selfId, hp, events);
    },
    createWardForSelfWith(hp, flags) {
      return createWard(state, selfId, hp, events, flags);
    },
    damageOneOpponentWard(amount) {
      const ward = opponent.wards.find((w) => !w.protected);
      if (ward) dealDamageToWard(state, opponentId, ward, amount, events);
    },
    damageEachOpponentWard(amount) {
      damageAllWards(state, opponentId, amount, events, true);
    },
    destroyOpponentWards() {
      return destroyAllWards(state, opponentId, events, true);
    },
    opponentHasWard() {
      return opponent.wards.length > 0;
    },

    selfWardCount() {
      return self.wards.length;
    },
    selfHasWard() {
      return self.wards.length > 0;
    },
    buffOneOwnWardOrCreate(addHp, createHp) {
      const ward = self.wards[0];
      if (ward) {
        ward.hp += addHp;
        events.push({ type: "wardCreated", player: selfId, hp: ward.hp }); // reuse as ward-changed marker
      } else {
        createWard(state, selfId, createHp, events);
      }
    },
    buffAllOwnWards(amount) {
      for (const ward of self.wards) ward.hp += amount;
    },
    destroyOwnLargestWard() {
      if (self.wards.length === 0) return 0;
      const ward = self.wards.reduce((a, b) => (b.hp > a.hp ? b : a));
      const hp = Math.max(0, ward.hp);
      dealDamageToWard(state, selfId, ward, ward.hp, events);
      return hp;
    },
    destroyAllOwnWards() {
      return destroyAllWards(state, selfId, events);
    },
    destroyAllWardsEverywhere() {
      const count = self.wards.length + opponent.wards.filter((w) => !w.protected).length;
      destroyAllWards(state, selfId, events);
      destroyAllWards(state, opponentId, events, true);
      return count;
    },
    addDamageReductionThisRound(amount) {
      addOngoing(state, selfId, "damageReduction", amount, "endOfRound", events);
    },
    damagePreventedThisRound() {
      return self.damagePreventedThisRound;
    },
    requestSealOpponentPrepared() {
      const targets = opponent.prepared
        .map((p, slot) => ({ p, slot }))
        .filter(({ p }) => !p.cast && !p.sealed);
      if (targets.length === 0) return;
      state.pendingChoice = {
        player: selfId,
        reason: "Seal target prepared spell — it cannot be cast this round",
        mode: "sealPrepared",
        // Targeting is by SLOT: face-down spells stay hidden behind a positional descriptor.
        candidates: targets.map(({ p, slot }) => ({
          iid: p.spell.iid,
          defId: p.faceDown ? `FACEDOWN-${slot}` : p.spell.defId,
        })),
        picksRemaining: 1,
        leftover: "top",
      };
      events.push({ type: "choicePending", player: selfId, reason: "seal" });
    },

    selfHp() {
      return self.hp;
    },
    roundNumber() {
      return state.round;
    },
    reactionsCastThisRound() {
      return self.reactionsCastThisRound;
    },

    grantExtraCast() {
      self.extraCastsThisTurn += 1;
    },
    removeOwnBurnGainHp() {
      const n = self.burn;
      self.burn = 0;
      if (n > 0) healPlayer(state, selfId, n, events);
    },
    removeOwnBurn(n) {
      self.burn = Math.max(0, self.burn - n);
    },

    opponentBurn() {
      return opponent.burn;
    },
    opponentAttachedComponentCount() {
      return opponent.prepared.reduce((acc, p) => acc + p.attached.length, 0);
    },
    opponentReactionsThisRound() {
      return opponent.reactionsCastThisRound;
    },
    handCount() {
      return self.hand.length;
    },

    hasTarget() {
      return findTarget() !== undefined;
    },
    cancelTarget() {
      const t = findTarget();
      if (t && !t.unstoppable && !t.reactionProof) t.cancelled = true;
    },
    reduceTargetDamage(amount) {
      const t = findTarget();
      if (t && !t.unstoppable && !t.reactionProof) t.damageReduction += amount;
    },
    preventAllTargetDamage() {
      const t = findTarget();
      if (t && !t.unstoppable && !t.reactionProof) t.damageReduction += 999;
    },
    reflectOntoTarget(amount) {
      const t = findTarget();
      if (t && !t.unstoppable && !t.reactionProof) t.reflect += amount;
    },
    targetLevel() {
      return findTarget()?.level ?? 0;
    },
    targetComponentCount() {
      return findTarget()?.componentCount ?? 0;
    },
    targetRequiresSymbol(sym) {
      const t = findTarget();
      const cost = t ? getCard(t.defId)?.cost : undefined;
      return cost ? cost[sym] > 0 : false;
    },
    returnOneTargetComponent() {
      const t = findTarget();
      const prep = targetPrepared();
      if (!t || t.unstoppable || t.reactionProof || !prep || prep.attached.length === 0) return false;
      if (sumOngoing(state.players[t.controller], "cannotBeForcedToDiscard") > 0) return false; // Iron Will
      const card = prep.attached.pop()!;
      state.players[t.controller].hand.push(card);
      return true;
    },
    stripAllTargetComponents() {
      const t = findTarget();
      const prep = targetPrepared();
      if (!t || t.unstoppable || t.reactionProof || !prep) return 0;
      if (sumOngoing(state.players[t.controller], "cannotBeForcedToDiscard") > 0) return 0; // Iron Will
      const n = prep.attached.length;
      state.players[t.controller].hand.push(...prep.attached);
      prep.attached = [];
      return n;
    },
    targetMeetsCost() {
      const t = findTarget();
      const prep = targetPrepared();
      if (!t || !prep) return false;
      const cost = getCard(t.defId)?.cost;
      if (!cost) return false;
      const comps = [];
      for (const a of prep.attached) {
        const comp = getComponent(a.defId);
        if (comp) comps.push(comp);
      }
      return meetsCost(cost, combinedSymbols(comps));
    },
    uncastTarget() {
      const t = findTarget();
      const prep = targetPrepared();
      if (prep && t && !t.unstoppable && !t.reactionProof) prep.cast = false;
    },
    sealTargetPrepared() {
      const t = findTarget();
      const prep = targetPrepared();
      if (prep && t && !t.unstoppable && !t.reactionProof) prep.sealed = true;
    },
    cancelEntireStack() {
      for (const s of state.stack) if (!s.unstoppable && !s.reactionProof) s.cancelled = true;
    },
    cancelOpponentStackSpells() {
      let n = 0;
      for (const s of state.stack) {
        if (s.controller === opponentId && !s.unstoppable && !s.reactionProof && !s.cancelled) {
          s.cancelled = true;
          n++;
        }
      }
      return n;
    },
    stripAllOpponentPreparedComponents() {
      if (sumOngoing(opponent, "cannotBeForcedToDiscard") > 0) return 0; // Iron Will
      let affected = 0;
      for (const prep of opponent.prepared) {
        if (prep.attached.length > 0) {
          opponent.hand.push(...prep.attached);
          prep.attached = [];
          affected++;
        }
      }
      return affected;
    },
    destroyOneOpponentOngoing() {
      if (opponent.ongoing.length === 0) return false;
      opponent.ongoing.shift();
      events.push({ type: "ongoingRemoved", player: opponentId });
      return true;
    },
    recastPreparedSpell(maxLevel, includeOpponent) {
      const sides: PlayerId[] = includeOpponent ? [selfId, opponentId] : [selfId];
      const candidates: { defId: string; level: number }[] = [];
      for (const pid of sides) {
        for (const prep of state.players[pid].prepared) {
          const def = getCard(prep.spell.defId);
          if (!prep.cast || !def || def.type === "Reaction" || (def.level ?? 1) > maxLevel) continue;
          candidates.push({ defId: prep.spell.defId, level: def.level ?? 1 });
        }
      }
      if (candidates.length === 0) return false;
      candidates.sort((a, b) => b.level - a.level); // recur the biggest spell available
      const fn = getEffect(candidates[0]!.defId);
      if (!fn) return false;
      const copy: CardInstance = { iid: state.nextIid++, defId: candidates[0]!.defId };
      fn(makeContext(state, selfId, copy, events), copy);
      return true;
    },
    protectMyHandFromDiscard() {
      addOngoing(state, selfId, "cannotBeForcedToDiscard", 1, "startOfOwnNextTurn", events);
    },
    lockOpponentExtraDraw() {
      addOngoing(state, selfId, "drawLock", 1, "startOfOwnNextTurn", events);
    },
  };
}

/** Symbol count of a component card (for Wild Surge-style scaling). 0 for non-components. */
export function componentSymbols(defId: string): number {
  const comp = getComponent(defId);
  return comp ? comp.symbols.V + comp.symbols.S + comp.symbols.M : 0;
}
