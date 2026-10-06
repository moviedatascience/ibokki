/**
 * The player-facing keyword vocabulary, read straight from the canonical JSON in
 * packages/cards/data (one source of truth; the client mirrors the protocol rather
 * than importing workspace TS packages, but shared DATA is fine). Each keyword
 * projects engine tags (the `tags` on a catalog CardInfo) onto a glyph, a tint, an
 * abbreviation fallback and a reminder line. Shared by the Pixi card face (icon
 * strip) and the DOM (RulesText, prompt chips, builder rows).
 */
import raw from "../../../packages/cards/data/keywords.json";
import { configureText } from "./textTokens.ts";

export interface Keyword {
  id: string;
  label: string;
  glyph: string;
  abbr: string;
  tint: string;
  tags: string[];
  terms: string[];
  reminder: string;
}

export const KEYWORDS: Keyword[] = (raw as { keywords: Keyword[] }).keywords;

const BY_TAG = new Map<string, Keyword>(KEYWORDS.flatMap((k) => k.tags.map((t) => [t, k] as const)));

export const KEYWORD_BY_ID: Map<string, Keyword> = new Map(KEYWORDS.map((k) => [k.id, k]));

/** The keywords a card shows, in vocabulary order, each at most once. */
export function keywordsFor(tags: readonly string[] | undefined): Keyword[] {
  if (!tags || tags.length === 0) return [];
  const want = new Set(tags.map((t) => BY_TAG.get(t)?.id).filter(Boolean));
  return KEYWORDS.filter((k) => want.has(k.id));
}

/** "#rrggbb" → 0xrrggbb for Pixi tints. */
export function tintNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

/** Every glyph name the vocabulary references (for preloading / probing). */
export const KEYWORD_GLYPHS: string[] = [...new Set(KEYWORDS.map((k) => k.glyph))];

// Bare `{id}` tokens in card text display as the keyword's label; unknown ids are an error.
configureText({ keywordIds: new Set(KEYWORD_BY_ID.keys()), labels: new Map(KEYWORDS.map((k) => [k.id, k.label])) });
