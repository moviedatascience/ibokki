import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildReport } from "../../../tools/text-implemented/src/ledger.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const report = buildReport(ROOT);

describe("text-implemented ledger", () => {
  it("every card's text matches the text its engine effect was verified against", () => {
    const bad = [...report.drift.map((d) => d.id), ...report.missing.map((m) => m.id)];
    expect(
      bad,
      `Card text changed since the engine was last verified: ${bad.join(", ")}. ` +
        `Re-verify the engine effect against the new text, then run "npm run text-implemented -- stamp ${bad.join(" ")}". ` +
        `("npm run text-implemented -- status" shows before/after and the file to re-check.)`,
    ).toEqual([]);
  });
  it("ledger has no entries for removed cards", () => {
    expect(report.orphanLedger).toEqual([]);
  });
  it("every register() id is a card in cards.json", () => {
    expect(report.orphanRegisters, "register() for ids missing from cards.json").toEqual([]);
  });
  it("warns on card text without an effect", () => {
    if (report.textWithoutEffect.length)
      console.warn(`text-implemented: text without an effect (no register()/cardFlags): ${report.textWithoutEffect.join(", ")}`);
    expect(true).toBe(true);
  });
});
