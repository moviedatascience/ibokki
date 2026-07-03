/**
 * The three playtest archetype decks, as named presets in the DeckDefinition
 * format users' saved decks share (see deckrules.ts). These are the balance
 * baselines — always selectable in the lobby alongside user decks.
 *
 * Returns arrays of defIds (not instances) — createGame instantiates them.
 */
import { spellsForSchool, type School, type Sym } from "@ibokki/cards";
import { RESOURCE_DECK_SIZE, validateDeck, type DeckDefinition } from "./deckrules.ts";

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

/** Canonical component id for a set of symbols (ids order symbols V < S < M: VS, VM, SM, VSM). */
function dualId(a: Sym, b: Sym): string {
  const order: Sym[] = ["V", "S", "M"];
  const [x, y] = order.indexOf(a) <= order.indexOf(b) ? [a, b] : [b, a];
  return `CMP-${x}${y}`;
}

/**
 * A component-heavy resource deck tuned to the school's actual symbol demand.
 *
 * Each school's spellbook demands ~90% of its primary symbol (measured across all
 * spell costs), so the old recipe's naked off-color basics (~28% of components)
 * were fully dead draws — playtests showed whole turns lost to them on both sides.
 * Rule now: EVERY component carries the primary symbol, so no draw is ever dead;
 * splash access (e.g. Evocation's Battery VM) comes from cross-duals instead of
 * off-color basics. Same-symbol duals are the ramp dial (how easily L2-4 costs
 * like VV/SSSS are paid within the 2-card cap) — raise/lower their count to tune.
 */
/**
 * Authored trainer package per school (the archetype identity), selected from the
 * trainer pool's Role data. ~17% of the deck — well under the doc's ≤⅓ guideline.
 */
const ARCHETYPE_TRAINERS: Record<Exclude<School, "Neutral">, string[]> = {
  // "Emberworks" — aggro/burn: damage amps, an extra cast, ramp to VV nukes, anti-ward tech.
  Evocation: [
    "ITM-007", // Empowered Chalk (+1 damage)
    "GAM-010", // Battle Trance (+3 damage burst)
    "GAM-008", // Overclock (one extra cast)
    "GAM-004", // Recharge (tutor a VV — Fireball/Inferno ramp)
    "GAM-012", // Dispelling Powder (destroy a Ward — the anti-Abjuration tech)
    "GAM-001", // Arcane Study (draw)
    "ITM-001", // Scrying Lens (consistency)
  ],
  // "Bastion" — wards/control: burn cleanse, lifegain, ward pumps. The anti-aggro package.
  Abjuration: [
    "GAM-013", // Quenching Salts (remove ALL burn + heal per marker) x2 — the burn answer
    "GAM-013",
    "ITM-008", // Bulwark Shard (Ward +2 HP) x2 — makes 1HP wards real walls
    "ITM-008",
    "GAM-009", // Second Wind (+5 HP)
    "GAM-011", // Aegis Charm (3HP Ward from nowhere)
    "GAM-001", // Arcane Study (draw)
  ],
  // "Riptide" — tempo/mill: push the opponent's exhaustion clock, protect your own.
  Divination: [
    "GAM-019", // Saboteur's Kit (mill 3) x2 — exhaustion pressure
    "GAM-019",
    "GAM-016", // Sealed Vault (free self-recycle — dodge your own exhaustion)
    "GAM-017", // Mana Sickness (lock their effect-draws)
    "GAM-020", // Disarm (hand peek + component bounce)
    "ITM-001", // Scrying Lens (consistency)
    "GAM-001", // Arcane Study (draw)
  ],
};

export function resourceDeckFor(school: Exclude<School, "Neutral">): string[] {
  const primary = PRIMARY_SYMBOL[school];
  const [offA, offB] = (["V", "S", "M"] as Sym[]).filter((s) => s !== primary);
  const deck: string[] = [];
  const push = (id: string, n: number): void => {
    for (let i = 0; i < n; i++) deck.push(id);
  };

  // 17 basics (was 18 before the exactly-40 deck rule) + 7 trainers = 40 total.
  push(`CMP-${primary}`, 17); // primary basics
  push(`CMP-${primary}${primary}`, 6); // same-symbol duals (the ramp dial)
  push(dualId(primary, offA!), 4); // cross-duals: splash symbols that still carry the primary
  push(dualId(primary, offB!), 4);
  push("CMP-VSM", 2); // tri: universal glue

  deck.push(...ARCHETYPE_TRAINERS[school]);
  if (deck.length !== RESOURCE_DECK_SIZE) throw new Error(`preset resource deck for ${school} is ${deck.length} cards, expected ${RESOURCE_DECK_SIZE}`);
  return deck;
}

export function deckFor(school: Exclude<School, "Neutral">): DeckList {
  return { spellbook: spellbookFor(school), resourceDeck: resourceDeckFor(school) };
}

/** The archetype names players saw in playtests, keyed for lobby/deck-picker use. */
export const PRESET_SCHOOLS: Record<string, Exclude<School, "Neutral">> = {
  Emberworks: "Evocation",
  Bastion: "Abjuration",
  Riptide: "Divination",
};

/** The locked preset decks, in the same DeckDefinition shape as user decks. */
export const PRESET_DECKS: DeckDefinition[] = Object.entries(PRESET_SCHOOLS).map(([name, school]) => ({
  name,
  ...deckFor(school),
}));

/** A preset by name, or undefined. */
export function presetDeck(name: string): DeckDefinition | undefined {
  return PRESET_DECKS.find((d) => d.name === name);
}

// Presets must always satisfy the construction rules users are held to.
for (const preset of PRESET_DECKS) {
  const v = validateDeck(preset);
  if (!v.ok) throw new Error(`preset deck ${preset.name} violates deck rules: ${v.errors.map((e) => e.message).join("; ")}`);
}
