/**
 * The player-facing keyword vocabulary (data/keywords.json): each keyword projects
 * one or more engine tags (CARD_TAGS) onto a glyph, a tint, an abbreviation
 * fallback and one reminder line. Keywords are the language card text is written
 * in and the icons the card face shows; tags are what the engine actually does.
 * The two are kept consistent by the cards test (every tag → exactly one keyword).
 */
import rawKeywords from "../data/keywords.json";
import { CARD_TAGS, type CardTag } from "./types.ts";

export interface Keyword {
  id: string;
  label: string;
  /** SVG name in art/glyphs (may be unshipped — consumers fall back to `abbr`). */
  glyph: string;
  abbr: string;
  /** Hex color, e.g. "#e0533d". */
  tint: string;
  tags: CardTag[];
  /** Words/phrases in card text that render as this keyword (lower-case, matched case-insensitively). */
  terms: string[];
  reminder: string;
}

function validate(data: unknown): Keyword[] {
  const list = (data as { keywords?: unknown }).keywords;
  if (!Array.isArray(list)) throw new Error("keywords.json: expected { keywords: [...] }");
  const tagSet = new Set<string>(CARD_TAGS);
  const seenId = new Set<string>();
  const seenTag = new Map<string, string>();
  for (const k of list as Keyword[]) {
    if (!k.id || seenId.has(k.id)) throw new Error(`keywords.json: missing or duplicate id "${k.id}"`);
    seenId.add(k.id);
    for (const f of ["label", "glyph", "abbr", "tint", "reminder"] as const) {
      if (typeof k[f] !== "string" || !k[f]) throw new Error(`keywords.json: ${k.id} is missing ${f}`);
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(k.tint)) throw new Error(`keywords.json: ${k.id} tint must be #rrggbb`);
    if (!Array.isArray(k.tags) || k.tags.length === 0) throw new Error(`keywords.json: ${k.id} needs tags`);
    for (const t of k.tags) {
      if (!tagSet.has(t)) throw new Error(`keywords.json: ${k.id} maps unknown tag "${t}"`);
      const prev = seenTag.get(t);
      if (prev) throw new Error(`keywords.json: tag "${t}" belongs to both ${prev} and ${k.id}`);
      seenTag.set(t, k.id);
    }
    if (!Array.isArray(k.terms)) throw new Error(`keywords.json: ${k.id} terms must be an array`);
  }
  const unmapped = CARD_TAGS.filter((t) => !seenTag.has(t));
  if (unmapped.length) throw new Error(`keywords.json: tags without a keyword: ${unmapped.join(", ")}`);
  return list as Keyword[];
}

export const KEYWORDS: Keyword[] = validate(rawKeywords);

export const KEYWORD_BY_ID: Map<string, Keyword> = new Map(KEYWORDS.map((k) => [k.id, k]));

export const KEYWORD_BY_TAG: Map<CardTag, Keyword> = new Map(KEYWORDS.flatMap((k) => k.tags.map((t) => [t, k] as const)));

/** The keywords a card shows, in vocabulary order, each at most once. */
export function keywordsFor(tags: readonly string[]): Keyword[] {
  const want = new Set(tags.map((t) => KEYWORD_BY_TAG.get(t as CardTag)?.id).filter(Boolean));
  return KEYWORDS.filter((k) => want.has(k.id));
}
