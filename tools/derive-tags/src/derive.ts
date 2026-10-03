/**
 * Static derivation of per-card tags from the engine source.
 *
 * Why static: the effect registry is code (`register("ID", (c) => { c.x(); ... })`),
 * not data, and importing it would pull in @ibokki/cards — whose loader refuses to
 * start without a complete tags.json. Scanning the source keeps the tool
 * dependency-free and makes the derivation reproducible in a test.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CARD_TAGS, type CardTag } from "../../../packages/cards/src/types.ts";
import { FLAG_TAGS, PRIMITIVE_TAGS, READ_ONLY } from "./primitives.ts";

export interface TagOverride {
  add?: CardTag[];
  remove?: CardTag[];
  /** Required: why the derived read is wrong or incomplete for this card. */
  why: string;
}
export interface TagOverrides {
  cards: Record<string, TagOverride>;
}

export type TagMap = Record<string, CardTag[]>;

const TAG_SET: ReadonlySet<string> = new Set(CARD_TAGS);

/** Strip line and block comments so prose never reads as a primitive call. */
export function stripComments(src: string): string {
  return src
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

/** `{ "EVO-001": ["dealDamage"], … }` — the primitive calls inside each registration body. */
export function scanRegistrations(src: string): Record<string, string[]> {
  const clean = stripComments(src);
  const out: Record<string, string[]> = {};
  const re = /register\(\s*"([A-Z]+-\d+)"/g;
  const starts: { id: string; at: number }[] = [];
  for (let m = re.exec(clean); m; m = re.exec(clean)) starts.push({ id: m[1]!, at: m.index });
  starts.forEach((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1]!.at : clean.length;
    const body = clean.slice(s.at, end);
    const calls = new Set<string>();
    const callRe = /\bc\.([A-Za-z0-9_]+)\s*\(/g;
    for (let m = callRe.exec(body); m; m = callRe.exec(body)) calls.add(m[1]!);
    out[s.id] = [...calls];
  });
  return out;
}

/** The ids listed in each exported set/record of cardFlags.ts, by export name. */
export function scanFlags(src: string): Record<string, string[]> {
  const clean = stripComments(src);
  const out: Record<string, string[]> = {};
  const re = /export const ([A-Z_]+)\b[^=]*=\s*([\s\S]*?);\n/g;
  for (let m = re.exec(clean); m; m = re.exec(clean)) {
    const ids = [...m[2]!.matchAll(/"([A-Z]+-\d+)"/g)].map((x) => x[1]!);
    if (ids.length) out[m[1]!] = ids;
  }
  return out;
}

/** Public method names of EffectContext: every 2-space-indented `name(` member
 *  (the interface signatures and the class implementations dedupe into one set). */
export function scanContextMethods(src: string): string[] {
  const clean = stripComments(src);
  const skip = new Set(["constructor", "if", "for", "while", "switch", "return", "catch"]);
  const names = new Set<string>();
  for (const m of clean.matchAll(/^  (?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<[^>]*>)?\(/gm)) {
    const n = m[1]!;
    if (!skip.has(n)) names.add(n);
  }
  return [...names];
}

export interface DeriveInput {
  effectSources: string[];
  cardFlagsSource: string;
  cardIds: string[];
  overrides?: TagOverrides;
}

export interface DeriveResult {
  tags: TagMap;
  /** Primitives that appeared in a registration but are neither mapped nor read-only. */
  unmapped: string[];
}

export function derive(input: DeriveInput): DeriveResult {
  const tags: Record<string, Set<CardTag>> = {};
  const unmapped = new Set<string>();
  for (const id of input.cardIds) tags[id] = new Set();

  for (const src of input.effectSources) {
    for (const [id, calls] of Object.entries(scanRegistrations(src))) {
      const set = (tags[id] ??= new Set());
      for (const call of calls) {
        const mapped = PRIMITIVE_TAGS[call];
        if (mapped) for (const t of mapped) set.add(t);
        else if (!READ_ONLY.has(call)) unmapped.add(call);
      }
    }
  }
  for (const [flag, ids] of Object.entries(scanFlags(input.cardFlagsSource))) {
    const mapped = FLAG_TAGS[flag];
    if (!mapped) continue;
    for (const id of ids) {
      const set = (tags[id] ??= new Set());
      for (const t of mapped) set.add(t);
    }
  }
  // Attach traps that bounce rather than sting are disruption, not damage.
  const attachTrapBody = stripComments(input.cardFlagsSource).match(/ATTACH_TRAPS[\s\S]*?\};/)?.[0] ?? "";
  for (const m of attachTrapBody.matchAll(/"([A-Z]+-\d+)":\s*\{[^}]*fire:\s*\{\s*(damage|bounce)/g)) {
    tags[m[1]!]?.add(m[2] === "damage" ? "damage" : "disrupt");
  }

  for (const [id, o] of Object.entries(input.overrides?.cards ?? {})) {
    if (!tags[id]) throw new Error(`tag-overrides: ${id} is not a card`);
    if (!o.why) throw new Error(`tag-overrides: ${id} needs a "why"`);
    for (const t of o.add ?? []) {
      if (!TAG_SET.has(t)) throw new Error(`tag-overrides: ${id} adds unknown tag "${t}"`);
      tags[id]!.add(t);
    }
    for (const t of o.remove ?? []) tags[id]!.delete(t);
  }

  const out: TagMap = {};
  for (const id of Object.keys(tags).sort()) out[id] = [...tags[id]!].sort();
  return { tags: out, unmapped: [...unmapped].sort() };
}

/** Repo-relative inputs, resolved from a repo root. */
export function readInputs(repoRoot: string): DeriveInput & { contextSource: string } {
  const effectsDir = join(repoRoot, "packages/engine/src/effects");
  const skip = new Set(["context.ts", "index.ts", "registry.ts"]);
  const effectFiles = readdirSync(effectsDir).filter((f) => f.endsWith(".ts") && !skip.has(f)).sort();
  const cards = JSON.parse(readFileSync(join(repoRoot, "packages/cards/data/cards.json"), "utf8")) as { id: string }[];
  const overrides = JSON.parse(readFileSync(join(repoRoot, "packages/cards/data/tag-overrides.json"), "utf8")) as TagOverrides;
  return {
    effectSources: effectFiles.map((f) => readFileSync(join(effectsDir, f), "utf8")),
    cardFlagsSource: readFileSync(join(repoRoot, "packages/engine/src/cardFlags.ts"), "utf8"),
    contextSource: readFileSync(join(effectsDir, "context.ts"), "utf8"),
    cardIds: cards.map((c) => c.id),
    overrides,
  };
}
