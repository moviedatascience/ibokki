/**
 * Loads and validates the canonical card database (data/cards.json), generated
 * from ibokki_spell_cards.xlsx by `npm run import-cards`. The JSON is bundled at
 * build time — not queried from a runtime DB — so the deterministic engine
 * resolves identically on client, server, and sim.
 */
import rawCards from "../data/cards.json";
import rawTags from "../data/tags.json";
import { cardTextErrors, cardTextWarnings, textOptionsFor, type TextWarning } from "./cardtext.ts";
import { CARD_TAGS, ELEMENTS, type CardDef, type CardTag, type CardType, type School } from "./types.ts";

const SCHOOLS: ReadonlySet<string> = new Set<School>(["Abjuration", "Evocation", "Divination", "Neutral"]);
const TYPES: ReadonlySet<string> = new Set<CardType>(["Spell", "Reaction", "Item", "Gambit"]);
const ELEMENT_SET: ReadonlySet<string> = new Set(ELEMENTS);
const TAGS: ReadonlySet<string> = new Set<CardTag>(CARD_TAGS);
const TAG_MAP = rawTags as Record<string, string[]>;

/** Every problem found in a raw card list, one line each (empty = valid). Attaches tags as it goes. */
export function cardErrors(data: unknown, tagMap: Record<string, string[]> = TAG_MAP): string[] {
  if (!Array.isArray(data)) return ["cards.json: expected a top-level array"];
  const errors: string[] = [];
  const err = (m: string) => errors.push(m);
  const seen = new Set<string>();
  for (const card of data as CardDef[]) {
    const id = card?.id;
    if (typeof id !== "string" || id.length === 0) {
      err("cards.json: a card is missing its id");
      continue;
    }
    if (seen.has(id)) err(`cards.json: duplicate card id ${id}`);
    seen.add(id);
    if (!SCHOOLS.has(card.school)) err(`cards.json: ${id} has invalid school "${card.school}"`);
    if (!TYPES.has(card.type)) err(`cards.json: ${id} has invalid type "${card.type}"`);
    if (card.school === "Neutral") {
      if (card.element !== null) err(`cards.json: neutral ${id} must have a null element`);
    } else if (!ELEMENT_SET.has(card.element as string)) {
      err(`cards.json: ${id} has invalid element "${card.element}"`);
    }
    if (typeof card.text !== "string") err(`cards.json: ${id} is missing effect text`);
    const tags = tagMap[id];
    if (!Array.isArray(tags) || tags.length === 0) err(`tags.json: ${id} has no effect tags — run npm run derive-tags`);
    else {
      for (const t of tags) if (!TAGS.has(t)) err(`tags.json: ${id} has unknown tag "${t}"`);
      card.tags = tags as CardTag[];
    }
    const isTrainer = card.type === "Item" || card.type === "Gambit";
    if (isTrainer) {
      if (card.level !== null || card.cost !== null) err(`cards.json: trainer ${id} must have null level/cost`);
    } else {
      if (typeof card.level !== "number") err(`cards.json: spell ${id} needs a numeric level`);
      if (card.cost == null) err(`cards.json: spell ${id} needs a parsed cost`);
    }
  }
  const named = (data as CardDef[]).filter((c) => typeof c?.id === "string");
  for (const e of cardTextErrors(named)) err(`cards.json: ${e}`);
  return errors;
}

/** Validate the raw JSON into typed CardDefs, throwing ONE error that lists every problem. */
export function validateCards(data: unknown, tagMap: Record<string, string[]> = TAG_MAP): CardDef[] {
  const errors = cardErrors(data, tagMap);
  if (errors.length) throw new Error(`card data has ${errors.length} error(s):\n  ${errors.join("\n  ")}`);
  return data as CardDef[];
}

export const CARDS: CardDef[] = validateCards(rawCards);

/** Non-fatal: card texts that mention a keyword their tags don't show (see cardTextWarnings). */
export const TEXT_WARNINGS: TextWarning[] = cardTextWarnings(CARDS, textOptionsFor(CARDS));
