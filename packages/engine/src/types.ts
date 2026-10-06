/** Core state, action, and event types for the Ibokki engine. */
import type { Cost } from "@ibokki/cards";

export type PlayerId = 0 | 1;

/** A concrete card in play. `defId` references a CardDef or ComponentDef (CMP-*). */
export interface CardInstance {
  iid: number;
  defId: string;
}

export interface PreparedSpell {
  spell: CardInstance;
  /** Hidden from the opponent until cast (or otherwise revealed). */
  faceDown: boolean;
  /** Attached component cards (face-up, public). Max 2 (the 2-card cap). */
  attached: CardInstance[];
  /** Already cast this round (returned face-up to the prepared area). */
  cast: boolean;
  /** Sealed spells cannot be cast this round (Iron Brand / Welded Shut). */
  sealed: boolean;
  /** Phantom symbols counted toward this spell's cost (Attune); additive-only. */
  bonus?: Cost;
}

/** A persistent defensive object with HP (Abjuration). */
export interface Ward {
  wid: number;
  hp: number;
  /** Fires when this ward is destroyed: refill cards / spawn a replacement / heal. */
  onDestroy?: "draw2" | "replace2" | "heal5";
  /** The rider lapses at round end (Cinder Crust: "destroyed THIS ROUND" — live-bug m4). */
  onDestroyExpires?: boolean;
  /** When this ward absorbs damage, deal this much to the opponent (Searing Ward). */
  reflectOnPrevent?: number;
  /** Cannot be targeted or destroyed by opponent *effects* (still absorbs combat damage) (Fortress/The Adamant). */
  protected?: boolean;
  /** While this ward lives, its owner can't be targeted by Level 1 spells (Kilnwarden). */
  level1Immunity?: boolean;
  /** The first time each round the opponent casts a spell, this ward's owner draws (Watchfire). */
  firstOppCastDraw?: boolean;
}

export type OngoingExpiry = "endOfRound" | "startOfOwnNextTurn";

export type OngoingKind =
  | "damageBuff" // your damaging spells deal +value (Catalyst, Channel Pyromancy, Phoenix)
  | "selfDamageEachTurn" // take value at the start of each of your turns (Channel Pyromancy)
  | "reactionTax" // opponent's Reactions cost +value (inert until the stack exists)
  | "reactionPunish" // opponent loses value HP per Reaction (inert until the stack exists)
  | "burnDoubleDamage" // your Burn markers deal +value each tick this round (Conflagration/Phoenix)
  | "burnAlsoTicksOwnTurn" // your opponent's Burn also ticks at the start of YOUR turns (Wildfire)
  | "untargetableBySingle" // can't be targeted by spells with only 1 component attached (Aegis)
  | "reactionDiscountS" // your next Reaction costs value fewer S (min 1 component) (Ash Mantle)
  | "reactionsLocked" // YOUR opponent cannot play Reactions while you own this (Furnace Roar/Cold Iron)
  | "spellsUncounterable" // your spells can't be cancelled/redirected/reduced by the opponent (Resolve/Omniscience)
  | "damageToHeal" // incoming spell damage heals you instead, up to value total this round (Salamander's Skin)
  | "cannotBeForcedToDiscard" // the opponent can't make you discard or strip your hand/prepared (Iron Will)
  | "drawLock" // YOUR opponent can't draw via effects (only their normal turn-draw) (Mana Sickness)
  | "attuneBonus" // your next attached component counts as +1 needed symbol (Attune)
  | "damageReduction" // reduce incoming damage by value (Hearth Eternal, Cold Iron)
  | "wardsProtected"; // ALL your wards: opponent can't target/destroy/shatter them this round (Fortress)

/** A lasting effect tracked with a marker until its expiry (design doc: "Ongoing Effects"). */
export interface OngoingEffect {
  id: number;
  owner: PlayerId;
  kind: OngoingKind;
  value: number;
  expiry: OngoingExpiry;
}

/**
 * A delayed doom inscribed on a player (Divination's win condition). Public to both
 * players. `turnsLeft` counts down at the start of the doomed player's turn (the same
 * hook where Burn ticks); at 0 it fires for `amount` damage. Exp-8 (2026-08-17):
 * exp-2's blanket pierce is REVERTED — dooms are soakable damage that engages
 * wards/reduction (and charges the defender's prevention ledger); Div's edge vs the
 * wall comes from ward interaction (Unbind + the exp-8 unraveling suite), not damage
 * immunity. No current card inscribes `pierce: true`; the engine still honors it for
 * a future printed-immunity card. The payload is fixed at inscription — amps and
 * buffs never touch it (the future is already written).
 */
export interface Prophecy {
  amount: number;
  turnsLeft: number;
  pierce: boolean;
  /** Non-damage payload variant (exp-8 unraveling suite): at zero, destroy the
   *  doomed player's largest unprotected Ward instead of dealing damage.
   *  `amount` stays 0 for these. Counterplay is printed on the card: spend or
   *  shrink the ward before the fuse runs out. */
  payload?: "collapseLargestWard";
  /** The spell/trainer that inscribed it (public: it was cast openly). */
  defId: string;
}

export interface PlayerState {
  id: PlayerId;
  hp: number;
  level: number;
  /** Draw from the end (pop). Order is secret. */
  resourceDeck: CardInstance[];
  /** The wizard's spellbook: the collection of spells they own (one of each). You
   * choose which to prepare each round — it is NOT a shuffled draw pile. */
  spellbook: CardInstance[];
  hand: CardInstance[];
  prepared: PreparedSpell[];
  discard: CardInstance[];
  /** Persistent Wards this player controls. */
  wards: Ward[];
  /** Burn markers on this player (tick at the start of their turns, then one decays; persist across rounds). */
  burn: number;
  /** Delayed dooms inscribed on this player (tick down / fire at the start of their turns). */
  prophecies: Prophecy[];
  /** Times this player's discard has been reshuffled into their Resource Deck. Each
   * reshuffle deals escalating exhaustion damage (2 x reshuffle count) — the game's slow clock. */
  reshuffles: number;
  /** Active ongoing effects this player owns. */
  ongoing: OngoingEffect[];
  /** Pending instant-speed attaches granted by Phase Shift's rider ("you may immediately
   *  attach 1 component"); usable out of turn / mid-stack, forfeited by passing. */
  freeAttach?: number;
  /** Transmuter's Stone: per-instance symbol overrides ("treat it as a different basic
   *  component"), read by every cost computation; cleared when this player's turn ends. */
  treatAs?: { iid: number; sym: "V" | "S" | "M" }[];
  /** Reactions this player has cast this round (read by reaction-punish/scaling cards). */
  reactionsCastThisRound: number;
  /** Damage prevented/reduced this round (read by Searing Riposte's trap delta). */
  damagePreventedThisRound: number;
  /** Lifetime damage prevented this MATCH. Broader vocabulary than the round
   *  counter: active reduction / Inversion / Reaction reduction AND ward soaks
   *  (exp-1g, 2026-07-28 — weathering chip on the shield charges the card's
   *  printed fantasy). Read by Reckoning's match window. Optional: absent = 0. */
  damagePreventedTotal?: number;
  /** Whether a Gambit has been played this turn (Items are unlimited; Gambits ≤1/turn). */
  gambitPlayedThisTurn: boolean;
  /** Whether this player has finished their Prepare step this round. */
  prepareDone: boolean;
  /** Prepared-spell replacements used this round (the design allows one per level-up). */
  replacementsThisRound: number;
  slotsUsedThisRound: number;
  /** Non-Reaction spells this player has cast this round (read by first-cast triggers). */
  spellsCastThisRound: number;
  /** HP healed by damage-to-heal replacement this round (caps Salamander's Skin). */
  damageHealedThisRound: number;
  /** Turns this player has begun in the current round (gates the per-turn draw). */
  turnsTakenThisRound: number;
  /** True once you've attached a component this turn (used only to gate the mulligan). */
  componentPlayedThisTurn: boolean;
  /** True once you've cast a (non-Reaction) spell this turn — you may cast only one per turn. */
  spellCastThisTurn: boolean;
  /** Extra casts granted this turn beyond the one-per-turn rule (Overclock). Each
   *  still consumes a spell slot; reset at every turn boundary. */
  extraCastsThisTurn: number;
  /** One-shot "+N damage to the next spell you cast this turn" (Battle Trance,
   *  Empowered Chalk). Consumed into StackItem.damageBonus at cast; expires at
   *  the next turn boundary. */
  nextSpellBonus: number;
  /** Set by Dead Fire: this player may not cast more spells until their next turn. */
  noCastThisTurn: boolean;
}

/**
 * A spell (or Reaction) on the LIFO stack, awaiting resolution. Components stay
 * attached to the prepared spell until the item resolves; flags below are set by
 * Reactions that respond to it before it resolves.
 */
export interface StackItem {
  sid: number;
  controller: PlayerId;
  preparedIndex: number;
  defId: string;
  isReaction: boolean;
  /** Captured at cast time (components are discarded on resolution). */
  level: number;
  componentCount: number;
  /** For a Reaction: the stack item it is responding to. */
  targetSid: number | null;
  /** Set by a counter — the item resolves with no effect. */
  cancelled: boolean;
  /** Damage this item deals on resolution is reduced by this much (prevention). */
  damageReduction: number;
  /** Dealt back to this item's controller after it resolves (reflection). */
  reflect: number;
  /** Multiplier on the damage this spell ACTUALLY deals its victim, mirrored back onto
   *  its caster after resolution (Final Riposte ×2, Pyromancer's Retort ×3). */
  reflectFactor?: number;
  /** Misdirection: this spell has been turned on its own caster — every opponent-facing
   *  primitive in its effect targets the controller instead when it resolves. */
  redirected?: boolean;
  /** Absorb: when this item's damageReduction is consumed, heal this player half of it. */
  healHalfPreventedTo?: PlayerId;
  /** Cannot be cancelled / redirected / reduced by Reactions (Unstoppable Bolt, Apocalypse, Resolve, Omniscience). */
  unstoppable: boolean;
  /** "Cannot be prevented": damage bypasses ongoing reduction + Salamander's Skin (Apocalypse). */
  unpreventable?: boolean;
  /** Cannot be the target of Reactions (Hex Bolt). */
  reactionProof: boolean;
  /** This item's damage can't be reduced below this floor (White Flame). */
  minDamage: number;
  /** One-shot bonus consumed from the caster's nextSpellBonus at cast time. */
  damageBonus: number;
  /** The prepared spell's face-down state before this cast (restored if the cast is retracted). */
  wasFaceDown: boolean;
  /** This cast consumed an Overclock extra cast (refunded on retract). */
  usedExtraCast?: boolean;
  /**
   * True only in the take-back window right after casting: the moment the caster
   * passes or ANYTHING else joins the stack, the cast is committed. Prevents
   * dodging a Reaction by retracting after seeing the response.
   */
  retractable: boolean;
}

/**
 * A choice the controller must make mid-effect (look-at-top / loot / scry). While
 * one is pending, `legalActions` offers only `choose` actions for `player` and all
 * other flow is blocked until it resolves.
 */
export interface PendingChoice {
  player: PlayerId;
  reason: string;
  /** "takeToHand": candidates are staged out of the deck; pick some into hand.
   *  "bankToDeckTop": candidates are hand cards; pick one to put on top of the deck.
   *  "discardForDamage": candidates are hand cards; the pick is discarded and the
   *   opponent takes 1 damage per component symbol on it (Wild Surge).
   *  "discardForSearch": pick a hand card to discard, then a search choice for
   *   any one deck card follows (Mentor's Guidance).
   *  "orderToTop": candidates are the staged top N; picks go back on top of the
   *   deck, FIRST pick topmost (Index / Premonition Charm).
   *  "bounceToOwnersDeckTop": candidates are the OPPONENT'S hand (revealed to
   *   the chooser); the pick goes on top of its owner's deck (Disarm).
   *  "millFromTop": candidates are staged off the OPPONENT'S deck top; the pick
   *   goes to their discard, leftovers return on top in order (Short Wick).
   *  "reveal": pure information — candidates are shown to the chooser (nothing is
   *   pickable, nothing moves); pass = Done (Lantern Glare / Read by Firelight / Perfect Info).
   *  "discardThenDraw": pick ANY NUMBER of hand cards to discard, then draw that
   *   many when the choice ends (Alchemy).
   *  "discardFromOpponentHand": candidates are the OPPONENT'S hand (revealed to
   *   the chooser); the pick goes to its owner's discard (Burn the Letter).
   *  "discardToDeckTop": candidates are components in YOUR discard; the pick goes
   *   on top of your Resource Deck (Mnemonic Charm).
   *  "discardToHand": candidates are components in YOUR discard; picks return to
   *   your hand (Recover / Salvage / Reclaim).
   *  "sealPrepared": candidates are the OPPONENT'S uncast, unsealed prepared spells;
   *   face-down ones are shown as FACEDOWN-<slot> descriptors (sealing targets a
   *   slot, it does NOT reveal); the pick is sealed for the round (Runic/Welded Shut).
   *  "treatAsComponent": candidates are the basic components in YOUR hand; pick the one
   *   Transmuter's Stone will transmute (a symbol choice follows).
   *  "treatAsSymbol": candidates are synthetic CMP-X descriptors for the other two basic
   *   symbols; the pick becomes the carried component's treat-as symbol until end of turn. */
  mode:
    | "takeToHand"
    | "bankToDeckTop"
    | "discardForDamage"
    | "discardForSearch"
    | "orderToTop"
    | "bounceToOwnersDeckTop"
    | "millFromTop"
    | "reveal"
    | "discardThenDraw"
    | "discardFromOpponentHand"
    | "discardToDeckTop"
    | "discardToHand"
    | "sealPrepared"
    | "treatAsComponent"
    | "treatAsSymbol";
  candidates: CardInstance[];
  picksRemaining: number;
  /** Where unchosen staged cards go when a takeToHand choice finishes. */
  leftover: "top" | "bottom";
  /** discardForDamage: prevention already applied to the casting stack item. */
  damageReduction?: number;
  /** Deck searches (Recharge/Seek/…): shuffle the deck once the choice ends, and
   *  picks are REVEALED (public `tutored` event) rather than private. */
  shuffleAfter?: boolean;
  /** When present, only these candidate iids may be picked; the rest are shown
   *  for information only (Omen's non-M cards, Disarm's non-components). */
  eligibleIids?: number[];
  /** "Up to N" / "you may": `pass` is legal and ends the choice early. */
  optional?: boolean;
  /** orderToTop / discardThenDraw: picks accumulate here until the choice completes. */
  picked?: CardInstance[];
  /** Draw this many cards for the chooser once the choice completes (Lamp in the Dark). */
  drawAfter?: number;
  /** treatAsSymbol: the hand component (iid + printed defId) chosen in the first step. */
  carryIid?: number;
  carryDefId?: string;
  /** The card whose effect paused for this choice — events emitted while the choice
   *  resolves are attributed to it (`EventSource` kind "choice"). */
  sourceDefId?: string;
  /** Whose zones the candidates of an opponent-facing mode (bounce / discardFromOpponentHand /
   *  sealPrepared / reveal) alias. Defaults to the chooser's opponent; a spell turned on its
   *  caster (Misdirection / Flame Mirror) stages the CASTER'S cards, and resolving against
   *  the other player would move a card that isn't there (duplication bug, 2026-10-06). */
  target?: PlayerId;
  /** sealPrepared: candidates are SYNTHETIC descriptors (a real iid would identify the
   *  face-down spell — iids are dealt in decklist order); this maps each to its slot. */
  slotByIid?: Record<number, number>;
}

export type Phase = "prepare" | "main" | "gameover";

/** "deckout" no longer occurs (an empty deck reshuffles with exhaustion damage) but stays
 * in the union so persisted playtest sessions/replays from older engines still typecheck.
 * "forfeit" is a match-layer outcome (a player conceded, disconnected, or timed out) — it is
 * never produced by `apply`, only by the out-of-band `concede()` helper, so it does not appear
 * in a deterministic {seed, actions} replay. */
export type EndReason = "hp" | "deckout" | "turn-limit" | "forfeit";

export interface GameState {
  seed: number;
  rngState: number;
  round: number;
  /** Total turns elapsed across the match (metrics + safety cap). */
  turnCount: number;
  /** Who takes the first turn each round (chosen randomly at game start). */
  startingPlayer: PlayerId;
  activePlayer: PlayerId;
  /** Who currently holds priority (may be the non-active player during a cast). */
  priorityPlayer: PlayerId;
  /** Consecutive priority passes; two in a row resolves the top of the stack. */
  passStreak: number;
  /** The LIFO spell stack (top = last element). */
  stack: StackItem[];
  phase: Phase;
  players: [PlayerState, PlayerState];
  nextIid: number;
  winner: PlayerId | null;
  endReason: EndReason | null;
  /** A look/loot/scry choice awaiting the controller's input, or null. */
  pendingChoice: PendingChoice | null;
  /** Set when a wizard exhausts their slots: the OTHER wizard gets one final turn, then the
   * round ends. Removes the first-player bias of slot-exhaustion round-ending. */
  finalTurnFor: PlayerId | null;
}

/** Player intents. iid-keyed where order could otherwise drift. */
export type Action =
  // Prepare phase
  | { type: "prepareSpell"; spellIid: number }
  | { type: "replacePrepared"; preparedIndex: number; spellIid: number }
  | { type: "donePreparing" }
  // Main phase
  | { type: "mulligan" }
  | { type: "attach"; preparedIndex: number; handIid: number }
  // Take a component back off one of your prepared spells (returns it to hand).
  | { type: "detach"; preparedIndex: number; componentIid: number }
  | { type: "cast"; preparedIndex: number }
  // Take back a spell you just cast, while you still hold priority (before anyone responds).
  | { type: "retractCast" }
  // A Reaction's cost must already be attached (same rule as a normal cast —
  // "holding components in reserve" means attaching them on your own turns).
  | { type: "castReaction"; preparedIndex: number }
  | { type: "playTrainer"; handIid: number }
  // Resolve a pending look/loot/scry choice by picking the card with this iid.
  | { type: "choose"; iid: number }
  | { type: "pass" };

/**
 * What caused an event (2026-10-06). Every event emitted while a card's effect runs
 * is stamped with that card (innermost cause wins: a ward's on-destroy draw inside a
 * spell's damage says "ward", the damage itself says the spell). Clients group a
 * frame's events by cause to animate "Fireball resolves → -4, ward -2"; telemetry
 * credits damage dealt / soaked to the right card. `player` is whose card or
 * marker it is (the controller / owner), never the victim.
 */
export type EventSource =
  | { kind: "spell"; defId: string; player: PlayerId; sid: number; isReaction: boolean }
  | { kind: "trainer"; defId: string; player: PlayerId }
  /** An armed trap Reaction firing on its printed trigger (no stack). */
  | { kind: "trap"; defId: string; player: PlayerId }
  /** The continuation of a card's effect after a pending choice (defId null if unknown). */
  | { kind: "choice"; defId: string | null; player: PlayerId }
  | { kind: "burn"; player: PlayerId }
  | { kind: "prophecy"; defId: string; player: PlayerId }
  /** A ward's own trigger: reflect-on-absorb, on-destroy draw/replace/heal, first-cast draw. */
  | { kind: "ward"; player: PlayerId; wid: number }
  | { kind: "ongoing"; effect: OngoingKind; player: PlayerId }
  /** Exhaustion damage from reshuffling an empty Resource Deck. */
  | { kind: "exhaustion"; player: PlayerId };

/** The event union proper; `GameEvent` adds the optional cause to every member. */
export type GameEventBody =
  | { type: "turnBegan"; player: PlayerId; round: number }
  | { type: "drew"; player: PlayerId; count: number }
  | { type: "mulliganed"; player: PlayerId; newHandSize: number }
  | { type: "attached"; player: PlayerId; preparedIndex: number; componentDefId: string }
  | { type: "cast"; player: PlayerId; preparedIndex: number; spellDefId: string }
  | { type: "trainerPlayed"; player: PlayerId; defId: string }
  | { type: "reactionCast"; player: PlayerId; spellDefId: string; targetSid: number | null }
  /** Opens a stack item's resolution; everything until its `spellResolved` /
   *  `spellCancelled` / `targetImmune` is that spell's doing (also stamped via `src`). */
  | { type: "resolveBegin"; controller: PlayerId; spellDefId: string; sid: number; isReaction: boolean }
  | { type: "spellResolved"; controller: PlayerId; spellDefId: string }
  | { type: "spellCancelled"; controller: PlayerId; spellDefId: string }
  | { type: "spellRedirected"; player: PlayerId; spellDefId: string }
  | { type: "targetImmune"; player: PlayerId; spellDefId: string }
  | { type: "priorityPassed"; player: PlayerId }
  | { type: "damage"; target: PlayerId; amount: number }
  | { type: "burnTick"; player: PlayerId; amount: number }
  | { type: "burnApplied"; target: PlayerId; amount: number }
  | { type: "prophecyCreated"; target: PlayerId; amount: number; turns: number; defId: string }
  | { type: "prophecyFired"; player: PlayerId; amount: number; defId: string }
  | { type: "healed"; player: PlayerId; amount: number }
  | { type: "discarded"; player: PlayerId; count: number }
  | { type: "reshuffled"; player: PlayerId; count: number; damage: number }
  | { type: "milled"; player: PlayerId; count: number }
  | { type: "recovered"; player: PlayerId; count: number }
  | { type: "searched"; player: PlayerId; count: number }
  /** A revealed search pick (Recharge/Seek/…) — public, unlike private `chose` picks. */
  | { type: "tutored"; player: PlayerId; defId: string }
  /** A card bounced to the top of its owner's deck (Disarm) — public. */
  | { type: "bounced"; player: PlayerId; defId: string }
  | { type: "shuffledIn"; player: PlayerId; count: number }
  /** `wid` identifies the ward so later soak/destroy events can be credited to the card that made it. */
  | { type: "wardCreated"; player: PlayerId; hp: number; wid: number }
  | { type: "wardDamaged"; player: PlayerId; amount: number; wid: number }
  | { type: "wardDestroyed"; player: PlayerId; wid: number }
  | { type: "ongoingAdded"; player: PlayerId; kind: OngoingKind }
  | { type: "ongoingRemoved"; player: PlayerId }
  | { type: "choicePending"; player: PlayerId; reason: string }
  | { type: "chose"; player: PlayerId; defId: string }
  | { type: "detached"; player: PlayerId; componentDefId: string }
  | { type: "retracted"; player: PlayerId; spellDefId: string }
  | { type: "spellPrepared"; player: PlayerId; spellDefId: string }
  | { type: "spellReplaced"; player: PlayerId; outDefId: string; inDefId: string }
  | { type: "prepareComplete"; round: number }
  | { type: "passed"; player: PlayerId }
  | { type: "roundEnded"; round: number }
  | { type: "finalTurn"; player: PlayerId }
  | { type: "handCapDiscard"; player: PlayerId; count: number }
  | { type: "leveledUp"; player: PlayerId; level: number }
  | { type: "gameOver"; winner: PlayerId | null; reason: EndReason };

export type GameEvent = GameEventBody & { src?: EventSource };

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
}

export function otherPlayer(p: PlayerId): PlayerId {
  return (p ^ 1) as PlayerId;
}

export function isComponentDefId(defId: string): boolean {
  return defId.startsWith("CMP-");
}
