/**
 * Rewrite card cells in ibokki_spell_cards.xlsx from a JSON pass file.
 *
 *   npm run retext -- packages/cards/data/rewrites/<pass>.json
 *   npm run import-cards            # then regenerate cards.json + tags.json
 *
 * A pass maps card ids to new cell values, one map per column:
 *   { "texts": {id: effect}, "names": {id: name}, "flavors": {id: flavor}, "elements": {id: element} }
 * Columns that a sheet does not have yet (Flavor / Element, added 2026-10-05) are
 * created: a header cell is appended to row 1 and the new cells go at the end of
 * each written row, so the sheet's dimension grows to the right.
 *
 * Why a tool: the spreadsheet stays the authoring source, but editing it by hand
 * (or through adm-zip, which chokes on this file's zip descriptors) is where
 * past passes lost time. This reads the archive with our own unzip, appends ONE
 * new shared string per written value and repoints that card's cell at it —
 * never editing an existing shared string, since identical texts are shared
 * between cells — then writes a fresh, standard ZIP. A `.bak` of the previous
 * file is kept beside it.
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateRawSync } from "node:zlib";
import { parseSharedStrings, unzip } from "./xlsx.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const XLSX_PATH = resolve(REPO_ROOT, "ibokki_spell_cards.xlsx");

/** Pass-file key → spreadsheet header (matched case-insensitively). */
export const PASS_COLUMNS: Record<string, string> = {
  texts: "Effect",
  names: "Name",
  flavors: "Flavor",
  elements: "Element",
};

export type Pass = Partial<Record<keyof typeof PASS_COLUMNS, Record<string, string>>>;

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Column letters → 0-based index. */
function colIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}
function colLetters(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Minimal ZIP writer (deflate, no descriptors) — enough for Excel. */
export function zip(entries: Map<string, Buffer>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const comp = deflateRawSync(data);
    const crc = crc32(data) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12); // 1980-01-01 00:01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, comp);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.size, 8);
  eocd.writeUInt16LE(entries.size, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, eocd]);
}

export interface PassResult {
  out: Buffer;
  /** `${column}:${id}` for every cell written. */
  applied: string[];
  /** `${column}:${id}` for every requested cell whose card row was not found. */
  missing: string[];
}

export function applyPass(xlsx: Buffer, pass: Pass): PassResult {
  const entries = unzip(xlsx);
  const ssName = "xl/sharedStrings.xml";
  let ssXml = entries.get(ssName)?.toString("utf8");
  if (!ssXml) throw new Error("no sharedStrings.xml");
  const shared = parseSharedStrings(ssXml);
  const added: string[] = [];
  const indexOf = new Map<string, number>();
  const addShared = (text: string): number => {
    const hit = indexOf.get(text);
    if (hit !== undefined) return hit;
    const idx = shared.length + added.length;
    added.push(`<si><t xml:space="preserve">${xmlEscape(text)}</t></si>`);
    indexOf.set(text, idx);
    return idx;
  };

  // Keys starting with "$" (e.g. "$note") are documentation, not columns.
  const columns = (Object.keys(pass) as (keyof Pass)[]).filter((k) => !k.startsWith("$") && pass[k] && Object.keys(pass[k]!).length > 0);
  for (const k of columns) if (!PASS_COLUMNS[k]) throw new Error(`unknown pass key "${k}" (expected ${Object.keys(PASS_COLUMNS).join("/")})`);

  const applied: string[] = [];
  const pending = new Set<string>();
  for (const k of columns) for (const id of Object.keys(pass[k]!)) pending.add(`${PASS_COLUMNS[k]}:${id}`);

  for (const [name, buf] of entries) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue;
    let xml = buf.toString("utf8");
    const cells = [...xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)];
    const cellText = (attrs: string, inner: string | undefined): string => {
      if (!inner) return "";
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
      if (type === "inlineStr") {
        // Rows added by scripts (the ledger family) carry inline strings, not shared ones.
        return [...inner.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1] ?? "").join("");
      }
      const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(inner)?.[1] ?? "";
      return type === "s" ? (shared[parseInt(v, 10)] ?? "") : v;
    };

    // Header row: column index by lowercased header, plus the rightmost used column.
    const headerCol = new Map<string, number>();
    let headerStyle = "";
    let maxCol = -1;
    for (const m of cells) {
      const ref = /\br="([A-Z]+)(\d+)"/.exec(m[1] ?? "");
      if (!ref) continue;
      const c = colIndex(ref[1]!);
      if (c > maxCol) maxCol = c;
      if (ref[2] !== "1") continue;
      const t = cellText(m[1] ?? "", m[2]).trim().toLowerCase();
      if (t) headerCol.set(t, c);
      if (t === "name") headerStyle = /\bs="(\d+)"/.exec(m[1] ?? "")?.[1] ?? "";
    }
    const idCol = headerCol.get("card id");
    if (idCol === undefined) continue;
    const textStyle = (() => {
      const effectCol = headerCol.get("effect");
      if (effectCol === undefined) return "";
      const m = cells.find((c) => new RegExp(`\\br="${colLetters(effectCol)}2"`).test(c[1] ?? ""));
      return /\bs="(\d+)"/.exec(m?.[1] ?? "")?.[1] ?? "";
    })();

    const rowOfId = new Map<string, number>();
    for (const m of cells) {
      const ref = /\br="([A-Z]+)(\d+)"/.exec(m[1] ?? "");
      if (!ref || colIndex(ref[1]!) !== idCol) continue;
      const id = cellText(m[1] ?? "", m[2]).trim();
      if (id) rowOfId.set(id, parseInt(ref[2]!, 10));
    }

    const styleAttr = (s: string) => (s ? ` s="${s}"` : "");
    const appendToRow = (row: number, cell: string): void => {
      const rowRe = new RegExp(`(<row\\b[^>]*\\br="${row}"[^>]*>[\\s\\S]*?)(</row>)`);
      const m = rowRe.exec(xml);
      if (!m) throw new Error(`${name}: row ${row} not found`);
      xml = xml.replace(m[0], `${m[1]}${cell}${m[2]}`);
    };

    for (const k of columns) {
      const header = PASS_COLUMNS[k]!;
      const values = pass[k]!;
      const ids = Object.keys(values).filter((id) => rowOfId.has(id));
      if (ids.length === 0) continue;
      let col = headerCol.get(header.toLowerCase());
      if (col === undefined) {
        // New column: header cell at the right edge, and every written row grows a cell.
        col = ++maxCol;
        headerCol.set(header.toLowerCase(), col);
        appendToRow(1, `<c r="${colLetters(col)}1"${styleAttr(headerStyle)} t="s"><v>${addShared(header)}</v></c>`);
      }
      for (const id of ids) {
        const row = rowOfId.get(id)!;
        const ref = `${colLetters(col)}${row}`;
        const idx = addShared(values[id]!);
        const cellRe = new RegExp(`<c\\b([^>]*?\\br="${ref}"[^>]*?)(?:/>|>([\\s\\S]*?)</c>)`);
        const m = cellRe.exec(xml);
        if (m) {
          const attrs = (m[1] ?? "").replace(/\s+t="[^"]*"/, "") + ` t="s"`;
          xml = xml.replace(m[0], `<c${attrs}><v>${idx}</v></c>`);
        } else {
          appendToRow(row, `<c r="${ref}"${styleAttr(textStyle)} t="s"><v>${idx}</v></c>`);
        }
        applied.push(`${header}:${id}`);
        pending.delete(`${header}:${id}`);
      }
    }
    // Keep the sheet's declared extent honest after adding columns.
    xml = xml.replace(/<dimension ref="([A-Z]+)1:[A-Z]+(\d+)"\/>/, (_, a, r) => `<dimension ref="${a}1:${colLetters(maxCol)}${r}"/>`);
    entries.set(name, Buffer.from(xml, "utf8"));
  }
  if (added.length) {
    const total = shared.length + added.length;
    ssXml = ssXml
      .replace(/\bcount="\d+"/, `count="${total}"`)
      .replace(/\buniqueCount="\d+"/, `uniqueCount="${total}"`)
      .replace(/<\/sst>\s*$/, added.join("") + "</sst>");
    entries.set(ssName, Buffer.from(ssXml, "utf8"));
  }
  return { out: zip(entries), applied, missing: [...pending] };
}

function main(): void {
  const passPath = process.argv[2];
  if (!passPath) throw new Error("usage: retext <pass.json>");
  const pass = JSON.parse(readFileSync(resolve(REPO_ROOT, passPath), "utf8")) as Pass;
  const xlsx = readFileSync(XLSX_PATH);
  const { out, applied, missing } = applyPass(xlsx, pass);
  if (missing.length) throw new Error(`cells not found in the spreadsheet: ${missing.join(", ")}`);
  copyFileSync(XLSX_PATH, XLSX_PATH + ".bak");
  writeFileSync(XLSX_PATH, out);
  const byCol = new Map<string, number>();
  for (const a of applied) {
    const col = a.split(":")[0]!;
    byCol.set(col, (byCol.get(col) ?? 0) + 1);
  }
  const summary = [...byCol].map(([c, n]) => `${n} ${c}`).join(", ");
  console.log(`Rewrote ${summary} cells in ${XLSX_PATH} (previous copy at .bak). Now run: npm run import-cards`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
