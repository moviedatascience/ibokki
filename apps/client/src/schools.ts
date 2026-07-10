/**
 * School ↔ woodcut-crest glyph (eye = Divination, bow = Evocation, key = Abjuration —
 * the approved art/glyphs set), plus the preset-deck → school mapping.
 *
 * Online match frames label a seat by its DECK name ("Emberworks"/"Bastion"/"Riptide"),
 * not its school, so any crest lookup on a seat label must resolve the school first.
 * Local (vs-bot) frames already carry the school name directly. A custom online deck
 * usually resolves to no school → `schoolOf` returns null and callers render no crest.
 * (Known cosmetic quirk: a custom deck named exactly "Evocation"/"Abjuration"/"Divination"
 * resolves to that school's crest regardless of contents — the real fix is a per-seat
 * school field on the protocol frame, tracked in UI_POLISH_PLAN §4.)
 *
 * Shared by both the DOM components (via <SchoolCrest> in Pips.tsx) and the Pixi board
 * (via icon(SCHOOL_CREST[...]) in cardSprite/PixiBoard) — pure data, no rendering deps.
 */

export type CrestName = "eye" | "bow" | "key";

export const SCHOOL_CREST: Record<string, CrestName> = {
  Evocation: "bow",
  Abjuration: "key",
  Divination: "eye",
};

/** School accent as a CSS custom-property reference (DOM crest tint). */
export const SCHOOL_VAR: Record<string, string> = {
  Evocation: "var(--evo)",
  Abjuration: "var(--abj)",
  Divination: "var(--div)",
};

/** School accent as a 0xRRGGBB number (Pixi crest tint); mirrors the CSS tokens. */
export const SCHOOL_TINT: Record<string, number> = {
  Evocation: 0xe0533d,
  Abjuration: 0x4a90e2,
  Divination: 0xa070e0,
};

const PRESET_SCHOOL: Record<string, string> = {
  Emberworks: "Evocation",
  Bastion: "Abjuration",
  Riptide: "Divination",
};

/** Resolve a seat label (a school name locally, a deck name online) to its school, or null. */
export function schoolOf(label: string | null | undefined): string | null {
  if (!label) return null;
  if (SCHOOL_CREST[label]) return label;
  return PRESET_SCHOOL[label] ?? null;
}
