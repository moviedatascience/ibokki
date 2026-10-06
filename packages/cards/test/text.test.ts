import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARDS,
  KEYWORDS,
  TEXT_WARNINGS,
  TextTokenError,
  cardErrors,
  cardTextErrors,
  keywordsInText,
  plainText,
  textOptionsFor,
  tokenizeText,
  validateCards,
  type TextOptions,
} from "../src/index.ts";

const opts: TextOptions = {
  keywordIds: new Set(["burn", "cancel", "ward"]),
  labels: new Map([
    ["burn", "Burn"],
    ["cancel", "Cancel"],
    ["ward", "Ward"],
  ]),
  cardIds: new Set(["EVO-017"]),
  cardName: (id) => (id === "EVO-017" ? "Fireball" : undefined),
};

function errorOf(text: string, o: TextOptions = opts): TextTokenError {
  try {
    tokenizeText(text, o);
  } catch (e) {
    expect(e).toBeInstanceOf(TextTokenError);
    return e as TextTokenError;
  }
  throw new Error(`expected "${text}" to fail`);
}

describe("tokenizeText", () => {
  it("splits literals, keywords, display overrides, pips and card refs", () => {
    expect(tokenizeText("Add 2 {burn}. {cancel|Cancelled} by {card:EVO-017}; pay {V}{S|s}.", opts)).toEqual([
      { kind: "text", text: "Add 2 " },
      { kind: "keyword", id: "burn", display: "Burn" },
      { kind: "text", text: ". " },
      { kind: "keyword", id: "cancel", display: "Cancelled" },
      { kind: "text", text: " by " },
      { kind: "card", defId: "EVO-017", display: "Fireball" },
      { kind: "text", text: "; pay " },
      { kind: "pip", sym: "V", display: "V" },
      { kind: "pip", sym: "S", display: "s" },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps plain text as one literal and empty text as no tokens", () => {
    expect(tokenizeText("Deal 3 damage.", opts)).toEqual([{ kind: "text", text: "Deal 3 damage." }]);
    expect(tokenizeText("", opts)).toEqual([]);
  });

  it("allows | inside a display after the first one", () => {
    expect(tokenizeText("{ward|a|b}", opts)).toEqual([{ kind: "keyword", id: "ward", display: "a|b" }]);
  });

  it("rejects an unknown keyword, naming the token", () => {
    const e = errorOf("Add {brun}.");
    expect(e.message).toContain('unknown keyword "{brun}"');
    expect(e.token).toBe("{brun}");
    expect(e.index).toBe(4);
  });

  it("rejects malformed and unresolved card refs", () => {
    expect(errorOf("{card:EVO-999}").message).toContain("unknown card reference");
    expect(errorOf("{card:fireball}").message).toContain("unknown card reference");
  });

  it("rejects stray braces, unterminated, nested and empty tokens", () => {
    expect(errorOf("oops } here").message).toContain('stray "}"');
    expect(errorOf("Deal {burn").message).toContain("unterminated");
    expect(errorOf("{burn {ward}}").message).toContain("unterminated");
    expect(errorOf("{}").message).toContain("empty token");
    expect(errorOf("{|x}").message).toContain("empty token");
    expect(errorOf("{burn|}").message).toContain("empty display");
    expect(errorOf("{Burn}").message).toContain("unknown keyword");
  });

  it("without a vocabulary accepts any lower-case id lexically", () => {
    // Explicit undefined overrides the configured default vocabulary.
    expect(tokenizeText("{anything|x}", { keywordIds: undefined })).toEqual([{ kind: "keyword", id: "anything", display: "x" }]);
  });
});

describe("plainText / keywordsInText", () => {
  it("round-trips displays and drops braces", () => {
    expect(plainText("{cancel|Cancel} target spell; add 1 {burn|burn} to {card:EVO-017}.", opts)).toBe(
      "Cancel target spell; add 1 burn to Fireball.",
    );
    expect(plainText("{ward} up", opts)).toBe("Ward up");
  });

  it("lists keyword ids in order of first appearance", () => {
    expect(keywordsInText("{ward} {burn|burn} {ward|wards} {V} {cancel}", opts)).toEqual(["ward", "burn", "cancel"]);
  });

  it("uses the real vocabulary by default once @ibokki/cards is loaded", () => {
    expect(plainText("Deal 3 {damage|damage}. {damage} {card:EVO-017}")).toBe(`Deal 3 damage. Damage ${CARDS.find((c) => c.id === "EVO-017")!.name}`);
  });
});

describe("card data", () => {
  it("every card in cards.json tokenizes with zero errors", () => {
    expect(cardTextErrors(CARDS)).toEqual([]);
    const o = textOptionsFor(CARDS);
    for (const c of CARDS) expect(() => tokenizeText(c.text, o), c.id).not.toThrow();
  });

  it("only uses vocabulary keywords in card text", () => {
    const ids = new Set(KEYWORDS.map((k) => k.id));
    for (const c of CARDS) for (const k of keywordsInText(c.text)) expect(ids.has(k), `${c.id} {${k}}`).toBe(true);
  });

  it("exports text/tag mismatches as a non-fatal report", () => {
    expect(Array.isArray(TEXT_WARNINGS)).toBe(true);
    for (const w of TEXT_WARNINGS) expect(w.message).toContain(w.id);
  });

  it("the loader collects every error across cards into one throw", () => {
    const good = structuredClone(CARDS[0]!);
    const bad = [
      { ...structuredClone(good), id: "X-001", text: "Deal {brun}." },
      { ...structuredClone(good), id: "X-002", text: "See {card:NOPE-1}." },
      { ...structuredClone(good), id: "X-003", school: "Necromancy", text: "stray }" },
    ];
    const tags = { "X-001": ["damage"], "X-002": ["damage"], "X-003": ["damage"] };
    const errors = cardErrors(bad, tags);
    expect(errors).toHaveLength(4);
    expect(errors.join("\n")).toMatch(/X-001: unknown keyword "\{brun\}"/);
    expect(errors.join("\n")).toMatch(/X-002: unknown card reference "\{card:NOPE-1\}"/);
    expect(errors.join("\n")).toMatch(/X-003 has invalid school/);
    expect(errors.join("\n")).toMatch(/X-003: stray "\}"/);
    expect(() => validateCards(bad, tags)).toThrow(/4 error\(s\)[\s\S]*X-001[\s\S]*X-002[\s\S]*X-003/);
  });
});

describe("client mirror", () => {
  it("apps/client/src/textTokens.ts is a byte-identical copy of packages/cards/src/text.ts", () => {
    const root = resolve(__dirname, "../../..");
    const norm = (p: string) => readFileSync(resolve(root, p), "utf8").replace(/\r\n/g, "\n");
    expect(norm("apps/client/src/textTokens.ts")).toBe(norm("packages/cards/src/text.ts"));
  });
});
