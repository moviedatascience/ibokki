/** Deck construction rules: presets are legal; each rule catches its violation. */
import { describe, expect, it } from "vitest";
import {
  MAX_SAME_SYMBOL_DUALS,
  MAX_TRAINER_COPIES,
  MAX_TRAINERS,
  MIN_LEVEL1_SPELLS,
  PRESET_DECKS,
  RESOURCE_DECK_SIZE,
  SPELLBOOK_MAX,
  SPELLBOOK_MIN,
  validateDeck,
  type DeckDefinition,
} from "../src/index.ts";
import { SPELLS, TRAINERS } from "@ibokki/cards";

/** A known-legal starting point to mutate per test. */
function legalDeck(): DeckDefinition {
  const preset = PRESET_DECKS[0]!;
  return { name: "test", spellbook: [...preset.spellbook], resourceDeck: [...preset.resourceDeck] };
}

const messages = (d: DeckDefinition) => validateDeck(d).errors.map((e) => e.message).join(" | ");

describe("preset decks", () => {
  it("ship exactly the three named archetypes, all legal", () => {
    expect(PRESET_DECKS.map((d) => d.name).sort()).toEqual(["Bastion", "Emberworks", "Riptide"]);
    for (const preset of PRESET_DECKS) {
      const v = validateDeck(preset);
      expect(v.errors, preset.name).toEqual([]);
      expect(preset.resourceDeck.length).toBe(RESOURCE_DECK_SIZE);
    }
  });

  it("spellbook cap equals the biggest school's spell count", () => {
    const counts = ["Evocation", "Abjuration", "Divination"].map(
      (s) => SPELLS.filter((c) => c.school === s).length,
    );
    expect(SPELLBOOK_MAX).toBe(Math.max(...counts));
    expect(SPELLBOOK_MAX).toBeGreaterThanOrEqual(SPELLBOOK_MIN);
  });
});

describe("validateDeck violations", () => {
  it("rejects duplicate spells (singleton rule)", () => {
    const d = legalDeck();
    d.spellbook[1] = d.spellbook[0]!;
    expect(messages(d)).toContain("singleton");
  });

  it("rejects a spellbook below the minimum or above the school-size cap", () => {
    const small = legalDeck();
    small.spellbook = small.spellbook.slice(0, SPELLBOOK_MIN - 1);
    expect(messages(small)).toContain(`minimum is ${SPELLBOOK_MIN}`);

    const big = legalDeck();
    // Pad with other schools' spells (legal mixing) until one past the cap.
    const extra = SPELLS.filter((c) => !big.spellbook.includes(c.id)).map((c) => c.id);
    big.spellbook.push(...extra.slice(0, SPELLBOOK_MAX - big.spellbook.length + 1));
    expect(messages(big)).toContain(`maximum is ${SPELLBOOK_MAX}`);
  });

  it("allows cross-school mixing within the cap", () => {
    const d = legalDeck();
    const other = SPELLS.find((c) => c.school === "Divination" && !d.spellbook.includes(c.id))!;
    d.spellbook[d.spellbook.length - 1] = other.id;
    expect(validateDeck(d).ok).toBe(true);
  });

  it("requires enough Level-1 spells to play round one", () => {
    const d = legalDeck();
    d.spellbook = d.spellbook.filter((id) => SPELLS.find((c) => c.id === id)!.level !== 1);
    // Backfill with higher-level spells from other schools to stay above the minimum size.
    const fill = SPELLS.filter((c) => c.level !== 1 && !d.spellbook.includes(c.id)).map((c) => c.id);
    while (d.spellbook.length < SPELLBOOK_MIN) d.spellbook.push(fill.pop()!);
    expect(messages(d)).toContain(`at least ${MIN_LEVEL1_SPELLS}`);
  });

  it("rejects a resource deck that is not exactly the fixed size", () => {
    const d = legalDeck();
    d.resourceDeck.push("CMP-V");
    expect(messages(d)).toContain(`exactly ${RESOURCE_DECK_SIZE}`);
  });

  it("rejects too many trainers and too many copies of one trainer", () => {
    const flooded = legalDeck();
    // Replace basics with distinct trainers until over the cap (2 copies each stays legal per-copy).
    const pool = TRAINERS.map((t) => t.id);
    let i = 0;
    while (flooded.resourceDeck.filter((id) => pool.includes(id)).length <= MAX_TRAINERS) {
      const slot = flooded.resourceDeck.findIndex((id) => id === "CMP-V");
      flooded.resourceDeck[slot] = pool[i++ % pool.length]!;
    }
    expect(messages(flooded)).toContain("trainers");

    const copies = legalDeck();
    for (let k = 0; k < MAX_TRAINER_COPIES + 1; k++) {
      const slot = copies.resourceDeck.findIndex((id) => id === "CMP-V");
      copies.resourceDeck[slot] = "ITM-001";
    }
    expect(messages(copies)).toContain(`maximum ${MAX_TRAINER_COPIES} copies`);
  });

  it("caps same-symbol duals and tri components", () => {
    const ramp = legalDeck();
    while (ramp.resourceDeck.filter((id) => ["CMP-VV", "CMP-SS", "CMP-MM"].includes(id)).length <= MAX_SAME_SYMBOL_DUALS) {
      const slot = ramp.resourceDeck.findIndex((id) => id === "CMP-V");
      ramp.resourceDeck[slot] = "CMP-VV";
    }
    expect(messages(ramp)).toContain("same-symbol duals");

    const tri = legalDeck();
    const slot = tri.resourceDeck.findIndex((id) => id === "CMP-V");
    tri.resourceDeck[slot] = "CMP-VSM"; // presets already run 2
    expect(messages(tri)).toContain("tri components");
  });

  it("rejects unknown ids and cards in the wrong zone", () => {
    const d = legalDeck();
    d.spellbook[0] = "ITM-001"; // trainer in the spellbook
    d.resourceDeck[0] = d.spellbook[1]!; // spell in the resource deck
    d.resourceDeck[1] = "NOPE-999";
    const msg = messages(d);
    expect(msg).toContain("is not a spell");
    expect(msg).toContain("is not a component or trainer");
  });
});
