/**
 * Loads and validates the canonical card database (data/cards.json), generated
 * from ibokki_spell_cards.xlsx by `npm run import-cards`. The JSON is bundled at
 * build time — not queried from a runtime DB — so the deterministic engine
 * resolves identically on client, server, and sim.
 */
import rawCards from "../data/cards.json";
import type { CardDef, CardType, School } from "./types.ts";

const SCHOOLS: ReadonlySet<string> = new Set<School>(["Abjuration", "Evocation", "Divination", "Neutral"]);
const TYPES: ReadonlySet<string> = new Set<CardType>(["Spell", "Reaction", "Item", "Gambit"]);

/** Validate the raw JSON into typed CardDefs, throwing on any malformed entry. */
function validateCards(data: unknown): CardDef[] {
  if (!Array.isArray(data)) throw new Error("cards.json: expected a top-level array");
  const seen = new Set<string>();
  for (const card of data as CardDef[]) {
    const id = card?.id;
    if (typeof id !== "string" || id.length === 0) throw new Error("cards.json: a card is missing its id");
    if (seen.has(id)) throw new Error(`cards.json: duplicate card id ${id}`);
    seen.add(id);
    if (!SCHOOLS.has(card.school)) throw new Error(`cards.json: ${id} has invalid school "${card.school}"`);
    if (!TYPES.has(card.type)) throw new Error(`cards.json: ${id} has invalid type "${card.type}"`);
    if (typeof card.text !== "string") throw new Error(`cards.json: ${id} is missing effect text`);
    const isTrainer = card.type === "Item" || card.type === "Gambit";
    if (isTrainer) {
      if (card.level !== null || card.cost !== null) throw new Error(`cards.json: trainer ${id} must have null level/cost`);
    } else {
      if (typeof card.level !== "number") throw new Error(`cards.json: spell ${id} needs a numeric level`);
      if (card.cost == null) throw new Error(`cards.json: spell ${id} needs a parsed cost`);
    }
  }
  return data as CardDef[];
}

export const CARDS: CardDef[] = validateCards(rawCards);
