/**
 * Card-text validation against the real vocabulary: every token in a card's text
 * must name a keyword in keywords.json, a pip, or an existing card. Shared by the
 * loader (fails the load) and tools/import-cards (fails the import before
 * cards.json is written). Deliberately does NOT import the loader, so the import
 * tool can validate a fresh card list while cards.json is stale.
 */
import { KEYWORDS, keywordsFor } from "./keywords.ts";
import { TextTokenError, keywordsInText, tokenizeText, type TextOptions } from "./text.ts";

/** Tokenizer options bound to the real keyword vocabulary and the given card list. */
export function textOptionsFor(cards: readonly { id: string; name: string }[]): TextOptions {
  const names = new Map(cards.map((c) => [c.id, c.name]));
  return {
    keywordIds: new Set(KEYWORDS.map((k) => k.id)),
    labels: new Map(KEYWORDS.map((k) => [k.id, k.label])),
    cardIds: new Set(names.keys()),
    cardName: (id) => names.get(id),
  };
}

/** Every token error across the cards, one line each ("EVO-017: unknown keyword "{brun}" at 6"). Empty = valid. */
export function cardTextErrors(cards: readonly { id: string; name: string; text: unknown }[], opts: TextOptions = textOptionsFor(cards)): string[] {
  const errors: string[] = [];
  for (const c of cards) {
    if (typeof c.text !== "string") continue; // the shape check reports this
    try {
      tokenizeText(c.text, opts);
    } catch (e) {
      if (e instanceof TextTokenError) errors.push(`${c.id}: ${e.message}`);
      else throw e;
    }
  }
  return errors;
}

export interface TextWarning {
  id: string;
  keyword: string;
  message: string;
}

/**
 * Non-fatal report: keywords a card's text mentions that its tags don't project to
 * (e.g. "{heal|remove 1} {burn}" on a heal card). Often legitimate — a REPORT for
 * whoever next touches derive-tags or the text, never an error.
 */
export function cardTextWarnings(cards: readonly { id: string; text: string; tags: readonly string[] }[], opts: TextOptions): TextWarning[] {
  const out: TextWarning[] = [];
  for (const c of cards) {
    let mentioned: string[];
    try {
      mentioned = keywordsInText(c.text, opts);
    } catch {
      continue; // errors are reported by cardTextErrors
    }
    const shown = new Set(keywordsFor(c.tags).map((k) => k.id));
    for (const k of mentioned) {
      if (!shown.has(k)) out.push({ id: c.id, keyword: k, message: `${c.id}: text mentions {${k}} but its tags don't show that keyword` });
    }
  }
  return out;
}
