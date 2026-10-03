import { describe, expect, it } from "vitest";
import { CARDS, CARD_TAGS, KEYWORDS, KEYWORD_BY_TAG, keywordsFor } from "../src/index.ts";

describe("keyword vocabulary", () => {
  it("covers every engine tag exactly once", () => {
    for (const t of CARD_TAGS) expect(KEYWORD_BY_TAG.get(t), t).toBeDefined();
    const all = KEYWORDS.flatMap((k) => k.tags);
    expect(new Set(all).size).toBe(all.length);
  });

  it("gives every card at least one keyword, in vocabulary order", () => {
    const order = new Map(KEYWORDS.map((k, i) => [k.id, i]));
    for (const c of CARDS) {
      const ks = keywordsFor(c.tags);
      expect(ks.length, c.id).toBeGreaterThan(0);
      const idx = ks.map((k) => order.get(k.id)!);
      expect(idx, c.id).toEqual([...idx].sort((a, b) => a - b));
    }
  });

  it("dedupes keywords shared by several tags", () => {
    expect(keywordsFor(["damage", "reflect"]).map((k) => k.id)).toEqual(["damage"]);
    expect(keywordsFor([]).length).toBe(0);
  });

  it("keeps the icon strip short: no card needs more than 4 keywords", () => {
    const wide = CARDS.filter((c) => keywordsFor(c.tags).length > 4).map((c) => c.id);
    expect(wide).toEqual([]);
  });
});
