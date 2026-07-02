/**
 * Minimal, zero-dependency .xlsx reader.
 *
 * An .xlsx file is a ZIP archive of XML parts. We only need enough of the ZIP
 * and SpreadsheetML formats to pull cell text out of each worksheet, so this
 * implements just the slice we use (deflate/stored entries, shared strings,
 * and the value of each <c> cell). It is not a general-purpose xlsx library.
 */
import { inflateRawSync } from "node:zlib";

const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

/** Unzip a ZIP buffer into a map of entry name -> uncompressed bytes. */
export function unzip(buf: Buffer): Map<string, Buffer> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a ZIP archive: end-of-central-directory record not found");

  const count = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const entries = new Map<string, Buffer>();

  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== SIG_CENTRAL) throw new Error("Corrupt ZIP: bad central directory header");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);

    if (buf.readUInt32LE(localOffset) !== SIG_LOCAL) throw new Error("Corrupt ZIP: bad local header for " + name);
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(dataStart, dataStart + compSize);

    let data: Buffer;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) data = inflateRawSync(raw);
    else throw new Error(`Unsupported ZIP compression method ${method} for ${name}`);

    entries.set(name, data);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Parse xl/sharedStrings.xml into an indexed array of strings. */
export function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const inner = m[1] ?? "";
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let t: RegExpExecArray | null;
    let s = "";
    while ((t = tRe.exec(inner))) s += decodeXmlEntities(t[1] ?? "");
    out.push(s);
  }
  return out;
}

function columnIndex(cellRef: string): number {
  const letters = /^([A-Z]+)/.exec(cellRef)?.[1] ?? "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function rowIndex(cellRef: string): number {
  return parseInt(/(\d+)$/.exec(cellRef)?.[1] ?? "1", 10);
}

/** Parse a worksheet XML into a dense 2D array of strings (row-major, header at index 0). */
export function parseSheet(xml: string, shared: string[]): string[][] {
  const cells: Record<number, Record<number, string>> = {};
  let maxCol = 0;

  const cRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m: RegExpExecArray | null;
  while ((m = cRe.exec(xml))) {
    const attrs = m[1] ?? "";
    const inner = m[2];
    const ref = /\br="([^"]+)"/.exec(attrs)?.[1];
    if (!ref) continue;
    const type = /\bt="([^"]+)"/.exec(attrs)?.[1];

    let value = "";
    if (inner) {
      if (type === "inlineStr") {
        const isInner = /<is\b[^>]*>([\s\S]*?)<\/is>/.exec(inner)?.[1] ?? inner;
        const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
        let t: RegExpExecArray | null;
        while ((t = tRe.exec(isInner))) value += decodeXmlEntities(t[1] ?? "");
      } else {
        const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(inner)?.[1] ?? "";
        if (type === "s") value = shared[parseInt(v, 10)] ?? "";
        else value = decodeXmlEntities(v);
      }
    }

    const c = columnIndex(ref);
    const r = rowIndex(ref);
    (cells[r] ??= {})[c] = value;
    if (c > maxCol) maxCol = c;
  }

  const rows: string[][] = [];
  const rowNums = Object.keys(cells)
    .map(Number)
    .sort((a, b) => a - b);
  for (const r of rowNums) {
    const row: string[] = [];
    for (let c = 0; c <= maxCol; c++) row.push(cells[r]?.[c] ?? "");
    rows.push(row);
  }
  return rows;
}

export interface Workbook {
  /** sheet display name -> rows (header at index 0) */
  sheets: Map<string, string[][]>;
}

/** Read an .xlsx buffer into named worksheets, preserving workbook sheet order. */
export function readWorkbook(buf: Buffer): Workbook {
  const parts = unzip(buf);

  const sharedXml = parts.get("xl/sharedStrings.xml")?.toString("utf8") ?? "";
  const shared = parseSharedStrings(sharedXml);

  const wbXml = parts.get("xl/workbook.xml")?.toString("utf8") ?? "";
  const relsXml = parts.get("xl/_rels/workbook.xml.rels")?.toString("utf8") ?? "";

  // rId -> target path (e.g. "worksheets/sheet1.xml")
  const relTarget = new Map<string, string>();
  const relRe = /<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"/g;
  let rm: RegExpExecArray | null;
  while ((rm = relRe.exec(relsXml))) relTarget.set(rm[1]!, rm[2]!);

  const sheets = new Map<string, string[][]>();
  const sheetRe = /<sheet\b[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"[^>]*\/?>/g;
  let sm: RegExpExecArray | null;
  while ((sm = sheetRe.exec(wbXml))) {
    const name = decodeXmlEntities(sm[1]!);
    const rid = sm[2]!;
    const target = relTarget.get(rid);
    if (!target) continue;
    const path = target.startsWith("/") ? target.slice(1) : "xl/" + target;
    const sheetXml = parts.get(path)?.toString("utf8");
    if (!sheetXml) continue;
    sheets.set(name, parseSheet(sheetXml, shared));
  }
  return { sheets };
}
