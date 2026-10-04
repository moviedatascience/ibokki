/**
 * Rewrite card Effect text in ibokki_spell_cards.xlsx from a JSON map.
 *
 *   npm run retext -- packages/cards/data/rewrites/<pass>.json
 *   npm run import-cards            # then regenerate cards.json + tags.json
 *
 * Why a tool: the spreadsheet stays the authoring source, but editing it by hand
 * (or through adm-zip, which chokes on this file's zip descriptors) is where
 * past passes lost time. This reads the archive with our own unzip, appends ONE
 * new shared string per rewritten card and repoints that card's Effect cell at
 * it — never editing an existing shared string, since identical texts are shared
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

interface Pass {
  texts: Record<string, string>;
}

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

export function applyPass(xlsx: Buffer, texts: Record<string, string>): { out: Buffer; applied: string[]; missing: string[] } {
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

  const applied: string[] = [];
  const pending = new Set(Object.keys(texts));
  for (const [name, buf] of entries) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue;
    let xml = buf.toString("utf8");
    // Locate the header row's "Card ID" and "Effect" columns.
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
    let idCol = -1;
    let effectCol = -1;
    for (const m of cells) {
      const ref = /\br="([A-Z]+)(\d+)"/.exec(m[1] ?? "");
      if (!ref || ref[2] !== "1") continue;
      const t = cellText(m[1] ?? "", m[2]).trim().toLowerCase();
      if (t === "card id") idCol = colIndex(ref[1]!);
      if (t === "effect") effectCol = colIndex(ref[1]!);
    }
    if (idCol < 0 || effectCol < 0) continue;
    const rowsById = new Map<string, number>();
    for (const m of cells) {
      const ref = /\br="([A-Z]+)(\d+)"/.exec(m[1] ?? "");
      if (!ref || colIndex(ref[1]!) !== idCol) continue;
      const id = cellText(m[1] ?? "", m[2]).trim();
      if (texts[id] !== undefined) rowsById.set(id, parseInt(ref[2]!, 10));
    }
    for (const [id, row] of rowsById) {
      const ref = `${colLetters(effectCol)}${row}`;
      const idx = addShared(texts[id]!);
      const cellRe = new RegExp(`<c\\b([^>]*?\\br="${ref}"[^>]*?)(?:/>|>([\\s\\S]*?)</c>)`);
      const m = cellRe.exec(xml);
      if (!m) throw new Error(`${id}: Effect cell ${ref} not found`);
      const attrs = (m[1] ?? "").replace(/\s+t="[^"]*"/, "") + ` t="s"`;
      xml = xml.replace(m[0], `<c${attrs}><v>${idx}</v></c>`);
      applied.push(id);
      pending.delete(id);
    }
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
  const { out, applied, missing } = applyPass(xlsx, pass.texts);
  if (missing.length) throw new Error(`cards not found in the spreadsheet: ${missing.join(", ")}`);
  copyFileSync(XLSX_PATH, XLSX_PATH + ".bak");
  writeFileSync(XLSX_PATH, out);
  console.log(`Rewrote ${applied.length} Effect cells in ${XLSX_PATH} (previous copy at .bak). Now run: npm run import-cards`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
