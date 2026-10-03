import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CARD_TAGS } from "../../../packages/cards/src/types.ts";
import { derive, readInputs, scanContextMethods, scanRegistrations } from "../src/derive.ts";
import { PRIMITIVE_TAGS, READ_ONLY } from "../src/primitives.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("derive-tags", () => {
  const input = readInputs(REPO_ROOT);
  const result = derive(input);

  it("maps every public EffectContext primitive (a new primitive must declare a tag or be read-only)", () => {
    const methods = scanContextMethods(input.contextSource);
    expect(methods.length).toBeGreaterThan(80);
    const undeclared = methods.filter((m) => !(m in PRIMITIVE_TAGS) && !READ_ONLY.has(m));
    expect(undeclared).toEqual([]);
    const phantom = Object.keys(PRIMITIVE_TAGS).filter((m) => !methods.includes(m));
    expect(phantom).toEqual([]);
  });

  it("finds no unmapped primitive calls in any registration", () => {
    expect(result.unmapped).toEqual([]);
  });

  it("gives every card at least one tag", () => {
    const empty = Object.entries(result.tags)
      .filter(([, t]) => t.length === 0)
      .map(([id]) => id);
    expect(empty).toEqual([]);
  });

  it("uses only the closed vocabulary", () => {
    const vocab = new Set<string>(CARD_TAGS);
    for (const t of Object.values(result.tags).flat()) expect(vocab.has(t), t).toBe(true);
  });

  it("matches the committed tags.json (run `npm run derive-tags` after engine effect changes)", () => {
    const committed = JSON.parse(readFileSync(resolve(REPO_ROOT, "packages/cards/data/tags.json"), "utf8"));
    expect(result.tags).toEqual(committed);
  });

  it("reads known cards the way their effects are written", () => {
    expect(result.tags["EVO-001"]).toEqual(["damage"]); // Spark
    expect(result.tags["EVO-003"]).toEqual(["burn", "damage"]); // Burning Hands
    expect(result.tags["ABJ-002"]).toEqual(["ward"]); // Arcane Shell
    expect(result.tags["ABJ-014"]).toEqual(["cancel", "tempo"]); // Phase Shift
    expect(result.tags["DIV-012"]).toEqual(["prophecy"]); // Omen
    expect(result.tags["EVO-035"]).toContain("immune"); // Unstoppable Bolt — cardFlags rider
    expect(result.tags["ABJ-009"]).toEqual(["disrupt", "trap"]); // Mana Drain — bounce trap, no registry entry
    expect(result.tags["EVO-014"]).toEqual(["damage", "trap"]); // Searing Riposte — prevent trap
  });

  it("ignores primitive names that only appear in comments", () => {
    const src = 'register("XXX-001", (c) => { /* c.dealDamage(9) */ c.draw(1); // c.heal(2)\n});';
    expect(scanRegistrations(src)).toEqual({ "XXX-001": ["draw"] });
  });

  it("applies overrides and rejects bad ones", () => {
    const base = { effectSources: ['register("XXX-001", (c) => c.draw(1));'], cardFlagsSource: "", cardIds: ["XXX-001"] };
    const r = derive({ ...base, overrides: { cards: { "XXX-001": { add: ["heal"], remove: ["draw"], why: "test" } } } });
    expect(r.tags["XXX-001"]).toEqual(["heal"]);
    expect(() => derive({ ...base, overrides: { cards: { "XXX-001": { add: ["heal"], why: "" } } } })).toThrow(/why/);
    expect(() => derive({ ...base, overrides: { cards: { "NOPE-1": { why: "x" } } } })).toThrow(/not a card/);
  });
});
