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
  /** Sealed spells cannot be cast this round (Runic Seal / Penumbral Seal). */
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
  /** When this ward absorbs damage, deal this much to the opponent (Reflective Ward). */
  reflectOnPrevent?: number;
  /** Cannot be targeted or destroyed by opponent *effects* (still absorbs combat damage) (Fortress/Ward Eternal). */
  protected?: boolean;
  /** While this ward lives, its owner can't be targeted by Level 1 spells (Stonewarden). */
  level1Immunity?: boolean;
  /** The first time each round the opponent casts a spell, this ward's owner draws (Sentinel Rune). */
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
  | "reactionDiscountS" // your next Reaction costs value fewer S (min 1 component) (Stone Stance)
  | "reactionsLocked" // YOUR opponent cannot play Reactions while you own this (Arcane Anchor/Absolute Defense)
  | "spellsUncounterable" // your spells can't be cancelled/redirected/reduced by the opponent (Resolve/Omniscience)
  | "damageToHeal" // incoming spell damage heals you instead, up to value total this round (Inversion Field)
  | "cannotBeForcedToDiscard" // the opponent can't make you discard or strip your hand/prepared (Iron Will)
  | "drawLock" // YOUR opponent can't draw via effects (only their normal turn-draw) (Mana Sickness)
  | "attuneBonus" // your next attached component counts as +1 needed symbol (Attune)
  | "damageReduction"; // reduce incoming damage by value (Aegis Eternal, Absolute Defense)

/** A lasting effect tracked with a marker until its expiry (design doc: "Ongoing Effects"). */
export interface OngoingEffect {
  id: number;
  owner: PlayerId;
  kind: OngoingKind;
  value: number;
  expiry: OngoingExpiry;
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
  /** Times this player's discard has been reshuffled into their Resource Deck. Each
   * reshuffle deals escalating exhaustion damage (2 x reshuffle count) — the game's slow clock. */
  reshuffles: number;
  /** Active ongoing effects this player owns. */
  ongoing: OngoingEffect[];
  /** Reactions this player has cast this round (read by reaction-punish/scaling cards). */
  reactionsCastThisRound: number;
  /** Damage prevented/reduced this round (read by Reckoning). */
  damagePreventedThisRound: number;
  /** Whether a Gambit has been played this turn (Items are unlimited; Gambits ≤1/turn). */
  gambitPlayedThisTurn: boolean;
  /** Whether this player has finished their Prepare step this round. */
  prepareDone: boolean;
  /** Prepared-spell replacements used this round (the design allows one per level-up). */
  replacementsThisRound: number;
  slotsUsedThisRound: number;
  /** Non-Reaction spells this player has cast this round (read by first-cast triggers). */
  spellsCastThisRound: number;
  /** HP healed by damage-to-heal replacement this round (caps Inversion Field). */
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
  /** Set by Total Negation: this player may not cast more spells until their next turn. */
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
  /** Cannot be cancelled / redirected / reduced by Reactions (Unstoppable Bolt, Apocalypse, Resolve, Omniscience). */
  unstoppable: boolean;
  /** Cannot be the target of Reactions (Hex Bolt). */
  reactionProof: boolean;
  /** This item's damage can't be reduced below this floor (Lightning Bolt). */
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
   *   goes to their discard, leftovers return on top in order (Far Sight).
   *  "reveal": pure information — candidates are shown to the chooser (nothing is
   *   pickable, nothing moves); pass = Done (Foretell / Foreknowledge / Perfect Info).
   *  "discardThenDraw": pick ANY NUMBER of hand cards to discard, then draw that
   *   many when the choice ends (Alchemy).
   *  "discardFromOpponentHand": candidates are the OPPONENT'S hand (revealed to
   *   the chooser); the pick goes to its owner's discard (Mind Theft).
   *  "discardToDeckTop": candidates are components in YOUR discard; the pick goes
   *   on top of your Resource Deck (Mnemonic Charm).
   *  "discardToHand": candidates are components in YOUR discard; picks return to
   *   your hand (Recover / Salvage / Reclaim). */
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
    | "discardToHand";
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
  /** Draw this many cards for the chooser once the choice completes (Calculated Draw). */
  drawAfter?: number;
}

export type Phase = "prepare" | "main" | "gameover";

/** "deckout" no longer occurs (an empty deck reshuffles with exhaustion damage) but stays
 * in the union so persisted playtest sessions/replays from older engines still typecheck. */
export type EndReason = "hp" | "deckout" | "turn-limit";

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

export type GameEvent =
  | { type: "turnBegan"; player: PlayerId; round: number }
  | { type: "drew"; player: PlayerId; count: number }
  | { type: "mulliganed"; player: PlayerId; newHandSize: number }
  | { type: "attached"; player: PlayerId; preparedIndex: number; componentDefId: string }
  | { type: "cast"; player: PlayerId; preparedIndex: number; spellDefId: string }
  | { type: "trainerPlayed"; player: PlayerId; defId: string }
  | { type: "reactionCast"; player: PlayerId; spellDefId: string; targetSid: number | null }
  | { type: "spellResolved"; controller: PlayerId; spellDefId: string }
  | { type: "spellCancelled"; controller: PlayerId; spellDefId: string }
  | { type: "targetImmune"; player: PlayerId; spellDefId: string }
  | { type: "priorityPassed"; player: PlayerId }
  | { type: "damage"; target: PlayerId; amount: number }
  | { type: "burnTick"; player: PlayerId; amount: number }
  | { type: "burnApplied"; target: PlayerId; amount: number }
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
  | { type: "wardCreated"; player: PlayerId; hp: number }
  | { type: "wardDamaged"; player: PlayerId; amount: number }
  | { type: "wardDestroyed"; player: PlayerId }
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
