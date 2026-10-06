/**
 * Text-implemented ledger: the exact card text each engine effect was last
 * verified against. Reads cards.json directly (NOT the @ibokki/cards loader,
 * which refuses to start on a broken cards.json).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanFlags, scanRegistrations } from "../../derive-tags/src/derive.ts";

export interface Ledger {
  $note: string;
  cards: Record<string, string>;
}
export interface CardRow {
  id: string;
  name: string;
  text: string;
}
export interface Drift {
  id: string;
  name: string;
  before: string;
  after: string;
  where: string[];
}
export interface Report {
  drift: Drift[];
  missing: { id: string; name: string; where: string[] }[];
  orphanLedger: string[];
  /** register("ID") whose id is not a card: ERROR. */
  orphanRegisters: { id: string; where: string }[];
  /** card with no register() and no cardFlags entry: WARNING. */
  textWithoutEffect: string[];
}

export const LEDGER_NOTE =
  "Per-card text the engine effect was last verified against (tokenized form, as in cards.json). " +
  "When a card's text in cards.json differs, re-verify the engine against the new text, then " +
  "`npm run text-implemented -- stamp <id>`. Baselined 2026-10-06 from the 2026-10-03 keyword pass.";

export const ledgerPath = (root: string) => join(root, "packages/cards/data/text-implemented.json");

export function readCards(root: string): CardRow[] {
  return JSON.parse(readFileSync(join(root, "packages/cards/data/cards.json"), "utf8")) as CardRow[];
}
export function readLedger(root: string): Ledger {
  return JSON.parse(readFileSync(ledgerPath(root), "utf8")) as Ledger;
}
export function writeLedger(root: string, cards: Record<string, string>): void {
  const sorted: Record<string, string> = {};
  for (const k of Object.keys(cards).sort()) sorted[k] = cards[k]!;
  writeFileSync(ledgerPath(root), JSON.stringify({ $note: LEDGER_NOTE, cards: sorted }, null, 2) + "\n", "utf8");
}

/** Blank out comments but keep offsets/newlines so line numbers stay true. */
function mask(src: string): string {
  return src
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}
function lineOf(masked: string, re: RegExp): number | undefined {
  const m = re.exec(masked);
  return m ? masked.slice(0, m.index).split("\n").length : undefined;
}

export interface Sources {
  /** id -> "file:line" of its register() */
  registers: Map<string, string>;
  /** id -> "cardFlags.ts:line" of its first mention */
  flags: Map<string, string>;
}

export function scanSources(root: string): Sources {
  const effectsDir = join(root, "packages/engine/src/effects");
  const registers = new Map<string, string>();
  for (const f of readdirSync(effectsDir).filter((x) => x.endsWith(".ts")).sort()) {
    const src = readFileSync(join(effectsDir, f), "utf8");
    const masked = mask(src);
    for (const id of Object.keys(scanRegistrations(src))) {
      if (registers.has(id)) continue;
      const line = lineOf(masked, new RegExp(`register\\(\\s*"${id}"`));
      registers.set(id, `packages/engine/src/effects/${f}:${line ?? "?"}`);
    }
  }
  const flagSrc = readFileSync(join(root, "packages/engine/src/cardFlags.ts"), "utf8");
  const masked = mask(flagSrc);
  const flags = new Map<string, string>();
  for (const ids of Object.values(scanFlags(flagSrc))) {
    for (const id of ids) {
      if (flags.has(id)) continue;
      flags.set(id, `packages/engine/src/cardFlags.ts:${lineOf(masked, new RegExp(`"${id}"`)) ?? "?"}`);
    }
  }
  return { registers, flags };
}

export function whereOf(src: Sources, id: string): string[] {
  return [src.registers.get(id), src.flags.get(id)].filter((x): x is string => !!x);
}

export function buildReport(root: string): Report {
  const cards = readCards(root);
  const ledger = readLedger(root).cards;
  const src = scanSources(root);
  const ids = new Set(cards.map((c) => c.id));
  const report: Report = { drift: [], missing: [], orphanLedger: [], orphanRegisters: [], textWithoutEffect: [] };
  for (const c of cards) {
    const where = whereOf(src, c.id);
    if (!(c.id in ledger)) report.missing.push({ id: c.id, name: c.name, where });
    else if (ledger[c.id] !== c.text) report.drift.push({ id: c.id, name: c.name, before: ledger[c.id]!, after: c.text, where });
    if (!src.registers.has(c.id) && !src.flags.has(c.id)) report.textWithoutEffect.push(c.id);
  }
  for (const id of Object.keys(ledger)) if (!ids.has(id)) report.orphanLedger.push(id);
  for (const [id, where] of src.registers) if (!ids.has(id)) report.orphanRegisters.push({ id, where });
  return report;
}

export function hasFailures(r: Report): boolean {
  return r.drift.length + r.missing.length + r.orphanLedger.length + r.orphanRegisters.length > 0;
}
