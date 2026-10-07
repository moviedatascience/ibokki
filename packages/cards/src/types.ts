/** Shared card-data types for Ibokki. */

export type School = "Abjuration" | "Evocation" | "Divination" | "Neutral";

/**
 * Elements are the game's horizontal axis (ELEMENTS_PLAN.md, 2026-10-05): every element
 * ships the same three schools. 1.0 is Fire only; the type chart between elements is a
 * post-1.0 system. Neutral trainers have no element.
 */
export type Element = "Fire";
export const ELEMENTS: readonly Element[] = ["Fire"];

export type CardType = "Spell" | "Reaction" | "Item" | "Gambit";

export type Sym = "V" | "S" | "M";

/** Counts of each component symbol — used for both spell costs and component contributions. */
export interface Cost {
  V: number;
  S: number;
  M: number;
}

/**
 * Effect tags — what a card DOES, derived from the engine's effect registrations
 * by `npm run derive-tags` (tools/derive-tags) and stored in data/tags.json so the
 * icons on a card face can never disagree with the engine. Engine-facing and
 * precise; the player-facing keyword/icon vocabulary is a projection of these.
 */
export const CARD_TAGS = [
  "damage", // deals damage to the opponent
  "self-damage", // costs the caster HP
  "reflect", // mirrors the target spell's damage back
  "burn", // adds or amplifies Burn on the opponent
  "cleanse", // removes the caster's Burn
  "ward", // creates, grows or protects the caster's Wards
  "ward-break", // damages, halves, destroys or unravels opponent Wards / ongoing effects
  "ward-sacrifice", // destroys the caster's own Wards for value
  "prophecy", // inscribes a delayed doom
  "seal", // seals a prepared spell
  "cancel", // cancels / uncasts spells on the stack
  "redirect", // turns a spell on its caster
  "prevent", // reduces or prevents incoming damage
  "immune", // makes something uncounterable, untargetable or unreducible
  "draw", // the caster draws
  "opponent-draws", // the opponent draws (a cost)
  "discard", // the caster discards
  "disrupt", // strips, bounces or discards the opponent's cards / components
  "recover", // returns components or cards from the discard
  "scry", // looks at / orders / searches the caster's deck
  "reveal", // shows the opponent's hand
  "lock", // restricts or taxes the opponent's casts / reactions / draws
  "buff", // raises the caster's spell damage
  "tempo", // extra casts / attaches / component tricks
  "heal", // restores the caster's HP
  "recast", // casts a copy of another spell
  "ledger", // reads or spends the prevention bank
  "trap", // fires automatically on its printed trigger while prepared
] as const;

export type CardTag = (typeof CARD_TAGS)[number];

/** A designed card from the spreadsheet (spell, reaction, item, or gambit). */
export interface CardDef {
  id: string;
  name: string;
  school: School;
  /** The card's element (type); null for Neutral trainers. */
  element: Element | null;
  type: CardType;
  /** Spell level (1-4) for spells/reactions; null for trainers. */
  level: number | null;
  /** Raw cost string, e.g. "VSM"; null for trainers. */
  costText: string | null;
  /** Parsed cost; null for trainers. */
  cost: Cost | null;
  /** Effect text (rules text to be implemented by the effect engine). */
  text: string;
  /** Effect tags (see CARD_TAGS) — attached by the loader from data/tags.json. */
  tags: CardTag[];
  role?: string;
  comment?: string;
}

export type ComponentKind = "basic" | "dual" | "tri";

/**
 * A component (Resource Deck) card providing V/S/M symbols. These are defined by
 * the design doc's component model, not the spreadsheet, so they live in code.
 */
export interface ComponentDef {
  id: string;
  name: string;
  kind: ComponentKind;
  /** Symbols this component contributes when attached. */
  symbols: Cost;
}
