/** Shared card-data types for Ibokki. */

export type School = "Abjuration" | "Evocation" | "Divination" | "Neutral";

export type CardType = "Spell" | "Reaction" | "Item" | "Gambit";

export type Sym = "V" | "S" | "M";

/** Counts of each component symbol — used for both spell costs and component contributions. */
export interface Cost {
  V: number;
  S: number;
  M: number;
}

/** A designed card from the spreadsheet (spell, reaction, item, or gambit). */
export interface CardDef {
  id: string;
  name: string;
  school: School;
  type: CardType;
  /** Spell level (1-4) for spells/reactions; null for trainers. */
  level: number | null;
  /** Raw cost string, e.g. "VSM"; null for trainers. */
  costText: string | null;
  /** Parsed cost; null for trainers. */
  cost: Cost | null;
  /** Effect text (rules text to be implemented by the effect engine). */
  text: string;
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
