/**
 * Starter deck builders for the skeleton / sim harness.
 *
 * Returns arrays of defIds (not instances) — createGame instantiates them.
 * Composition is deliberately simple and deterministic for now; the real
 * deckbuilder and balance-tuned resource ratios come later.
 */
import { spellsForSchool, type School, type Sym } from "@ibokki/cards";

export interface DeckList {
  /** The spellbook (collection of owned spells), not a draw pile. */
  spellbook: string[];
  resourceDeck: string[];
}

const PRIMARY_SYMBOL: Record<Exclude<School, "Neutral">, Sym> = {
  Evocation: "V",
  Abjuration: "S",
  Divination: "M",
};

/**
 * One of each spell/reaction in the school (the design doc's spellbook rule).
 * Sorted by level descending so that filling prepared slots naturally offers the
 * strongest castable spell first.
 */
export function spellbookFor(school: Exclude<School, "Neutral">): string[] {
  return spellsForSchool(school)
    .slice()
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || a.id.localeCompare(b.id))
    .map((c) => c.id);
}

/** A component-heavy resource deck weighted toward the school's primary symbol. */
export function resourceDeckFor(school: Exclude<School, "Neutral">): string[] {
  const primary = PRIMARY_SYMBOL[school];
  const others = (["V", "S", "M"] as Sym[]).filter((s) => s !== primary);
  const deck: string[] = [];
  const push = (id: string, n: number): void => {
    for (let i = 0; i < n; i++) deck.push(id);
  };

  push(`CMP-${primary}`, 14); // primary basics
  for (const o of others) push(`CMP-${o}`, 5); // off-color basics
  push(`CMP-${primary}${primary}`, 5); // same-symbol dual (ramp)
  push("CMP-VS", 2);
  push("CMP-VM", 2);
  push("CMP-SM", 2);
  push("CMP-VSM", 1);

  // A light splash of neutral trainers (~ a third or less, per the doc).
  push("GAM-001", 2); // Arcane Study (draw)
  push("ITM-001", 2); // Scrying Lens (filter)
  push("GAM-004", 1); // Recharge (ramp tutor)

  return deck;
}

export function deckFor(school: Exclude<School, "Neutral">): DeckList {
  return { spellbook: spellbookFor(school), resourceDeck: resourceDeckFor(school) };
}
