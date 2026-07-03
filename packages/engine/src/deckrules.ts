/**
 * Deck construction rules + validator (the ruleset approved 2026-07-03).
 *
 * A DeckDefinition is what users build, save, and bring to a match; the three
 * playtest archetypes in decks.ts are presets in this same format. The server
 * validates on save AND at match start (never trust a stored deck), the
 * deckbuilder UI validates live, and sims can validate authored decks.
 *
 * Spell Deck (spellbook):
 *  - singleton (max 1 copy of each spell)
 *  - size 15..SPELLBOOK_MAX, where SPELLBOOK_MAX = the largest school's spell
 *    count (computed from card data so new cards move the cap automatically)
 *  - at least 4 Level-1 spells (round one must be playable)
 *  - any school mix (the design doc's "soft constraint" rule — bricking is the cost)
 *
 * Resource Deck:
 *  - exactly 40 cards (deck size IS the exhaustion clock — fixed keeps
 *    mill/deckout balance uniform)
 *  - trainers (Items + Gambits) ≤ 13 total, max 2 copies of any one trainer
 *  - same-symbol duals (VV/SS/MM) ≤ 8 total (the ramp dial's ceiling)
 *  - tri components (VSM) ≤ 2
 *  - basics and cross-duals unlimited
 */
import { getCard, getComponent, SPELLS, type School } from "@ibokki/cards";

export interface DeckDefinition {
  name: string;
  /** Spell/Reaction card ids — the spells this wizard may prepare. */
  spellbook: string[];
  /** Component/Item/Gambit card ids — exactly RESOURCE_DECK_SIZE of them. */
  resourceDeck: string[];
}

export const RESOURCE_DECK_SIZE = 40;
export const MAX_TRAINERS = 13;
export const MAX_TRAINER_COPIES = 2;
export const MAX_SAME_SYMBOL_DUALS = 8;
export const MAX_TRI_COMPONENTS = 2;
export const SPELLBOOK_MIN = 15;
export const MIN_LEVEL1_SPELLS = 4;

const SCHOOLS: School[] = ["Evocation", "Abjuration", "Divination"];

/** Upper spellbook bound = the largest school's spell count (47 as of 2026-07). */
export const SPELLBOOK_MAX = Math.max(...SCHOOLS.map((s) => SPELLS.filter((c) => c.school === s).length));

const SAME_SYMBOL_DUALS = new Set(["CMP-VV", "CMP-SS", "CMP-MM"]);

/** One rule violation, tied to the zone it occurred in (for deckbuilder UI). */
export interface DeckError {
  zone: "spellbook" | "resourceDeck" | "deck";
  message: string;
}

export interface DeckValidation {
  ok: boolean;
  errors: DeckError[];
}

export function validateDeck(deck: DeckDefinition): DeckValidation {
  const errors: DeckError[] = [];
  const err = (zone: DeckError["zone"], message: string) => errors.push({ zone, message });

  if (!deck.name || deck.name.trim().length === 0) err("deck", "deck needs a name");
  if (deck.name && deck.name.length > 40) err("deck", "deck name is longer than 40 characters");

  // ---- spellbook ----
  const seen = new Set<string>();
  let level1 = 0;
  for (const id of deck.spellbook) {
    const card = getCard(id);
    if (!card || (card.type !== "Spell" && card.type !== "Reaction")) {
      err("spellbook", `${id} is not a spell`);
      continue;
    }
    if (seen.has(id)) err("spellbook", `${card.name} (${id}) appears more than once — spellbooks are singleton`);
    seen.add(id);
    if (card.level === 1) level1++;
  }
  if (deck.spellbook.length < SPELLBOOK_MIN) {
    err("spellbook", `spellbook has ${deck.spellbook.length} spells — minimum is ${SPELLBOOK_MIN}`);
  }
  if (deck.spellbook.length > SPELLBOOK_MAX) {
    err("spellbook", `spellbook has ${deck.spellbook.length} spells — maximum is ${SPELLBOOK_MAX}`);
  }
  if (level1 < MIN_LEVEL1_SPELLS) {
    err("spellbook", `spellbook has ${level1} Level-1 spells — at least ${MIN_LEVEL1_SPELLS} are required to play round one`);
  }

  // ---- resource deck ----
  const trainerCopies = new Map<string, number>();
  let trainers = 0;
  let sameSymbolDuals = 0;
  let tris = 0;
  for (const id of deck.resourceDeck) {
    const comp = getComponent(id);
    if (comp) {
      if (SAME_SYMBOL_DUALS.has(id)) sameSymbolDuals++;
      if (comp.kind === "tri") tris++;
      continue;
    }
    const card = getCard(id);
    if (!card || (card.type !== "Item" && card.type !== "Gambit")) {
      err("resourceDeck", `${id} is not a component or trainer`);
      continue;
    }
    trainers++;
    trainerCopies.set(id, (trainerCopies.get(id) ?? 0) + 1);
  }
  if (deck.resourceDeck.length !== RESOURCE_DECK_SIZE) {
    err("resourceDeck", `resource deck has ${deck.resourceDeck.length} cards — it must be exactly ${RESOURCE_DECK_SIZE}`);
  }
  if (trainers > MAX_TRAINERS) {
    err("resourceDeck", `${trainers} trainers — maximum is ${MAX_TRAINERS} (about a third of the deck)`);
  }
  for (const [id, n] of trainerCopies) {
    if (n > MAX_TRAINER_COPIES) {
      err("resourceDeck", `${getCard(id)?.name ?? id} appears ${n} times — maximum ${MAX_TRAINER_COPIES} copies of a trainer`);
    }
  }
  if (sameSymbolDuals > MAX_SAME_SYMBOL_DUALS) {
    err("resourceDeck", `${sameSymbolDuals} same-symbol duals (VV/SS/MM) — maximum is ${MAX_SAME_SYMBOL_DUALS}`);
  }
  if (tris > MAX_TRI_COMPONENTS) {
    err("resourceDeck", `${tris} tri components (VSM) — maximum is ${MAX_TRI_COMPONENTS}`);
  }

  return { ok: errors.length === 0, errors };
}
