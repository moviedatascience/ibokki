/** The Wizard level curve from the design doc (levels 1-21). */

export interface LevelTier {
  /** Highest spell level you may cast. */
  maxSpellLevel: number;
  /** Spell slots (casts) available per round. */
  slots: number;
  /** Number of prepared spells you may hold. */
  prepared: number;
}

/** Sentinel for the level-21 "unlimited" slot count (kept finite for serialization). */
export const UNLIMITED_SLOTS = 999;

/** Indexed by (level - 1). */
export const LEVEL_TABLE: LevelTier[] = [
  { maxSpellLevel: 1, slots: 2, prepared: 4 }, // 1
  { maxSpellLevel: 1, slots: 2, prepared: 4 }, // 2
  { maxSpellLevel: 1, slots: 3, prepared: 5 }, // 3
  { maxSpellLevel: 1, slots: 3, prepared: 5 }, // 4
  { maxSpellLevel: 2, slots: 3, prepared: 5 }, // 5
  { maxSpellLevel: 2, slots: 3, prepared: 6 }, // 6
  { maxSpellLevel: 2, slots: 3, prepared: 6 }, // 7
  { maxSpellLevel: 2, slots: 3, prepared: 6 }, // 8
  { maxSpellLevel: 2, slots: 3, prepared: 6 }, // 9
  { maxSpellLevel: 3, slots: 3, prepared: 7 }, // 10
  { maxSpellLevel: 3, slots: 3, prepared: 7 }, // 11
  { maxSpellLevel: 3, slots: 3, prepared: 7 }, // 12
  { maxSpellLevel: 3, slots: 4, prepared: 7 }, // 13
  { maxSpellLevel: 3, slots: 4, prepared: 7 }, // 14
  { maxSpellLevel: 4, slots: 4, prepared: 8 }, // 15
  { maxSpellLevel: 4, slots: 4, prepared: 8 }, // 16
  { maxSpellLevel: 4, slots: 4, prepared: 8 }, // 17
  { maxSpellLevel: 4, slots: 4, prepared: 8 }, // 18
  { maxSpellLevel: 4, slots: 4, prepared: 8 }, // 19
  { maxSpellLevel: 4, slots: 5, prepared: 8 }, // 20
  { maxSpellLevel: 4, slots: UNLIMITED_SLOTS, prepared: 10 }, // 21
];

export const MAX_LEVEL = LEVEL_TABLE.length;

export function tierForLevel(level: number): LevelTier {
  const idx = Math.min(Math.max(level, 1), MAX_LEVEL) - 1;
  return LEVEL_TABLE[idx]!;
}

/**
 * Prepared-spell replacements allowed during a round's prepare phase: normally 1,
 * but 2 on rounds where the level-up just RAISED your max castable spell level
 * (L5/L10/L15) — a whole new spell tier deserves more than one showcase slot.
 * (Ruling 2026-07-04.)
 */
export function replacementLimit(level: number): number {
  if (level <= 1) return 1;
  return tierForLevel(level).maxSpellLevel > tierForLevel(level - 1).maxSpellLevel ? 2 : 1;
}
