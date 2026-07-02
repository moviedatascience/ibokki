/** @ibokki/cards — the card data catalog for Ibokki. */
export * from "./types.ts";
export * from "./components.ts";

import type { CardDef, School } from "./types.ts";
import { CARDS } from "./loader.ts";

/** Every designed card (spells, reactions, items, gambits), loaded from cards.json. */
export { CARDS };

export const CARDS_BY_ID: Map<string, CardDef> = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): CardDef | undefined {
  return CARDS_BY_ID.get(id);
}

export const SPELLS: CardDef[] = CARDS.filter((c) => c.type === "Spell" || c.type === "Reaction");
export const ITEMS: CardDef[] = CARDS.filter((c) => c.type === "Item");
export const GAMBITS: CardDef[] = CARDS.filter((c) => c.type === "Gambit");
export const TRAINERS: CardDef[] = CARDS.filter((c) => c.type === "Item" || c.type === "Gambit");

export function spellsForSchool(school: School): CardDef[] {
  return SPELLS.filter((c) => c.school === school);
}
