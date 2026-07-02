/**
 * Imports ibokki_spell_cards.xlsx -> packages/cards/data/cards.json
 *
 * The spreadsheet is the editable design source; cards.json is the canonical,
 * version-controlled card database that @ibokki/cards loads and validates, and
 * that tools/server consume. Re-run whenever the spreadsheet changes:
 *   npm run import-cards
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readWorkbook } from "./xlsx.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const XLSX_PATH = resolve(REPO_ROOT, "ibokki_spell_cards.xlsx");
const OUT_PATH = resolve(REPO_ROOT, "packages/cards/data/cards.json");

type School = "Abjuration" | "Evocation" | "Divination" | "Neutral";
type CardType = "Spell" | "Reaction" | "Item" | "Gambit";

interface Cost {
  V: number;
  S: number;
  M: number;
}

interface CardDef {
  id: string;
  name: string;
  school: School;
  type: CardType;
  level: number | null;
  costText: string | null;
  cost: Cost | null;
  text: string;
  role?: string;
  comment?: string;
}

/** Cards retired from the game — skipped on import even if still in the spreadsheet. */
const RETIRED = new Set<string>([
  "DIV-013", // Quicken — redundant once attaching is unlimited per turn
]);

/** Parse a cost string like "VSM" or "SS" into symbol counts. */
function parseCost(raw: string): Cost | null {
  const text = raw.trim().toUpperCase();
  if (!text) return null;
  const cost: Cost = { V: 0, S: 0, M: 0 };
  for (const ch of text) {
    if (ch === "V") cost.V++;
    else if (ch === "S") cost.S++;
    else if (ch === "M") cost.M++;
    else throw new Error(`Unexpected character '${ch}' in cost "${raw}"`);
  }
  return cost;
}

function headerMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  header.forEach((h, i) => {
    map[h.trim().toLowerCase()] = i;
  });
  return map;
}

function cell(row: string[], idx: number | undefined): string {
  if (idx === undefined) return "";
  return (row[idx] ?? "").trim();
}

function main(): void {
  const buf = readFileSync(XLSX_PATH);
  const wb = readWorkbook(buf);

  const cards: CardDef[] = [];
  const perSheet: Record<string, number> = {};

  for (const [sheetName, rows] of wb.sheets) {
    if (rows.length < 2) continue;
    const cols = headerMap(rows[0]!);
    const idC = cols["card id"];
    const nameC = cols["name"];
    const schoolC = cols["school"];
    const typeC = cols["type"];
    const lvlC = cols["lvl"];
    const costC = cols["cost"];
    const effectC = cols["effect"];
    const roleC = cols["role"];
    const commentC = cols["comment"];

    let n = 0;
    for (const row of rows.slice(1)) {
      const id = cell(row, idC);
      if (!id) continue; // skip blank rows
      if (RETIRED.has(id)) continue; // retired cards are dropped from the database
      const lvlText = cell(row, lvlC);
      const costText = cell(row, costC);
      const role = cell(row, roleC);
      const comment = cell(row, commentC);

      const card: CardDef = {
        id,
        name: cell(row, nameC),
        school: (cell(row, schoolC) || "Neutral") as School,
        type: cell(row, typeC) as CardType,
        level: lvlText ? Number(lvlText) : null,
        costText: costText || null,
        cost: parseCost(costText),
        text: cell(row, effectC),
      };
      if (role) card.role = role;
      if (comment) card.comment = comment;

      cards.push(card);
      n++;
    }
    perSheet[sheetName] = n;
  }

  // Sanity checks
  const ids = new Set<string>();
  for (const c of cards) {
    if (ids.has(c.id)) throw new Error(`Duplicate card id: ${c.id}`);
    ids.add(c.id);
  }
  if (cards.length === 0) throw new Error("No cards imported — check the spreadsheet path/format.");

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(cards, null, 2) + "\n", "utf8");

  const summary = Object.entries(perSheet)
    .map(([s, c]) => `${s}: ${c}`)
    .join(", ");
  console.log(`Imported ${cards.length} cards (${summary})`);
  console.log(`Wrote ${OUT_PATH}`);
}

main();
