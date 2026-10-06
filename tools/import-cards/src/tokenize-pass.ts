/**
 * One-off conversion pass (2026-10-06, issue "Convert all 167 card texts to tokens"):
 * rewrites every card's plain-English text into authored tokens, using EXACTLY the
 * matching semantics of the old RulesText `TERM_RE` (every keyword term, longest
 * first, whole-word, case-insensitive) so the rendered card text is unchanged.
 *
 *   npx tsx tools/import-cards/src/tokenize-pass.ts [cards-snapshot.json]
 *   npm run retext -- packages/cards/data/rewrites/2026-10-06-tokens.json
 *   npm run import-cards
 *
 * Writes the pass file plus a review list (…tokens.review.md) of matches where the
 * term may be prose rather than the keyword. Idempotent: text already inside a
 * token is never re-tokenized, so re-running over converted text is a no-op.
 * Asserts, for every card, that plainText(new) === old and that the keyword spans
 * equal the old regex's bold spans.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { plainText, tokenizeText, type TextOptions } from "../../../packages/cards/src/text.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
/** Optional argv[2]: a cards.json snapshot to convert (e.g. the pre-conversion one) instead of the live file. */
const CARDS_PATH = resolve(process.argv[2] ?? resolve(REPO_ROOT, "packages/cards/data/cards.json"));
const KEYWORDS_PATH = resolve(REPO_ROOT, "packages/cards/data/keywords.json");
const PASS_PATH = resolve(REPO_ROOT, "packages/cards/data/rewrites/2026-10-06-tokens.json");
const REVIEW_PATH = resolve(REPO_ROOT, "packages/cards/data/rewrites/2026-10-06-tokens.review.md");

interface Kw {
  id: string;
  label: string;
  terms: string[];
}
interface Card {
  id: string;
  name: string;
  text: string;
}

const keywords = (JSON.parse(readFileSync(KEYWORDS_PATH, "utf8")) as { keywords: Kw[] }).keywords;
const cards = JSON.parse(readFileSync(CARDS_PATH, "utf8")) as Card[];
const names = new Map(cards.map((c) => [c.id, c.name]));
const opts: TextOptions = {
  keywordIds: new Set(keywords.map((k) => k.id)),
  labels: new Map(keywords.map((k) => [k.id, k.label])),
  cardIds: new Set(names.keys()),
  cardName: (id) => names.get(id),
};

// The old RulesText matcher, same semantics (longest term first, \b-bounded, case-insensitive).
const TERM_INDEX = keywords.flatMap((kw) => kw.terms.map((term) => ({ term, kw }))).sort((a, b) => b.term.length - a.term.length);
const TERM_RE = new RegExp(`\\b(${TERM_INDEX.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
const hitFor = (s: string): Kw => TERM_INDEX.find((t) => t.term.toLowerCase() === s.toLowerCase())!.kw;

/** The old renderer's bold spans for a plain text: [keyword id, text as written]. */
function oldSpans(text: string): [string, string][] {
  return [...text.matchAll(TERM_RE)].map((m) => [hitFor(m[0]).id, m[0]]);
}

const COST_TERMS = new Set(keywords.find((k) => k.id === "cost")?.terms ?? []);
const OPPONENT_SUBJECT = /\b(opponent|opponent's|they|their|each player|both players|target player)\b/i;

interface Review {
  id: string;
  why: string;
  before: string;
  after: string;
}
const review: Review[] = [];

/** Start offset of the sentence containing `at`, and that sentence's text. */
function sentenceAt(text: string, at: number, len: number): { start: number; s: string } {
  const before = text.slice(0, at);
  const start = Math.max(before.lastIndexOf(". "), before.lastIndexOf("; "), before.lastIndexOf(": ")) + 1;
  const rest = text.slice(at + len);
  const m = /[.;](\s|$)/.exec(rest);
  const end = m ? at + len + m.index + 1 : text.length;
  return { start, s: text.slice(start, end) };
}

/** Tokenize one literal segment (no braces inside), recording review items. */
function convertLiteral(id: string, seg: string): string {
  let out = "";
  let last = 0;
  const all = [...seg.matchAll(TERM_RE)];
  for (const m of all) {
    const at = m.index ?? 0;
    const kw = hitFor(m[0]);
    const tok = m[0] === kw.label ? `{${kw.id}}` : `{${kw.id}|${m[0]}}`;
    out += seg.slice(last, at) + tok;
    last = at + m[0].length;

    // ---- review heuristics: is this word prose rather than the keyword? ----
    const { start, s } = sentenceAt(seg, at, m[0].length);
    const lead = seg.slice(start, at);
    let why: string | null = null;
    const costInSentence = all.some((o) => COST_TERMS.has(o[0].toLowerCase()) && sentenceAt(seg, o.index ?? 0, o[0].length).start === start);
    if (kw.id === "damage" && costInSentence) why = "damage in a sentence that also pays a cost";
    else if ((kw.id === "draw" || kw.id === "discard") && OPPONENT_SUBJECT.test(lead.slice(lead.lastIndexOf(",") + 1))) why = `${kw.id} whose subject may be the opponent`;
    else if (kw.id === "discard" && /\beach card\s+$/i.test(lead)) why = "discard as a passive (whose card?)";
    else if (kw.id === "cost") why = "cost-keyword phrase — check it is a cost, not a drawback/effect";
    else if (kw.id === "burn" && /\bremove\b[^.]*$/i.test(lead)) why = "burn being removed (heal/cleanse, not a burn effect)";
    else if (kw.id === "cancel" && /^redirect/i.test(m[0])) why = "redirect rendered as the Cancel keyword";
    else if (kw.id === "ward" && /\b(opponent's|their|enemy)\s+(\w+\s+)?$/i.test(lead)) why = "the opponent's ward (keyword reminder speaks of yours)";
    else if (kw.id === "damage" && /\b(no|prevent\w*|reduc\w*|less|cannot|soak\w*|absorb\w*)\b/i.test(s)) why = "damage inside a prevention/negation sentence";
    else if (kw.id === "seal" && /\b(break|unseal|remove)\w*\s+(the\s+|a\s+)?$/i.test(lead)) why = "seal being broken/removed";
    else if (kw.id === "prophecy" && /\b(opponent's|their)\s+$/i.test(lead)) why = "the opponent's prophecy";
    if (why) {
      const local = at - start;
      const after = s.slice(0, local) + tok + s.slice(local + m[0].length);
      review.push({ id, why, before: s.trim(), after: after.trim() });
    }
  }
  return out + seg.slice(last);
}

/** Convert a card text, leaving existing tokens untouched (idempotent). */
function convert(id: string, text: string): string {
  let out = "";
  for (const t of tokenizeText(text, opts)) {
    if (t.kind === "text") {
      out += convertLiteral(id, t.text);
      continue;
    }
    const head = t.kind === "keyword" ? t.id : t.kind === "card" ? `card:${t.defId}` : t.sym;
    const label = t.kind === "keyword" ? opts.labels!.get(t.id) : t.kind === "card" ? opts.cardName!(t.defId) : t.sym;
    out += t.display === label ? `{${head}}` : `{${head}|${t.display}}`;
  }
  return out;
}

const texts: Record<string, string> = {};
const perKeyword = new Map<string, number>();
let failures = 0;
for (const c of cards) {
  const old = plainText(c.text, opts);
  const next = convert(c.id, c.text);
  // Rendering-preservation assertions against the pre-conversion snapshot.
  if (plainText(next, opts) !== old) {
    failures++;
    console.error(`MISMATCH ${c.id}:\n  old: ${old}\n  new: ${plainText(next, opts)}`);
  }
  const spans = tokenizeText(next, opts).flatMap((t) => (t.kind === "keyword" ? [[t.id, t.display]] : []));
  if (c.text === old && JSON.stringify(spans) !== JSON.stringify(oldSpans(old))) {
    failures++;
    console.error(`SPAN MISMATCH ${c.id}: ${JSON.stringify(spans)} vs ${JSON.stringify(oldSpans(old))}`);
  }
  const reviewLen = review.length;
  if (convert(c.id, next) !== next) {
    failures++;
    console.error(`NOT IDEMPOTENT ${c.id}`);
  }
  review.length = reviewLen; // the idempotency re-run must not double-report
  if (next !== c.text) {
    texts[c.id] = next;
    for (const [k] of spans) perKeyword.set(k!, (perKeyword.get(k!) ?? 0) + 1);
  }
}
if (failures) {
  console.error(`${failures} assertion failure(s) — pass NOT written.`);
  process.exit(1);
}

if (Object.keys(texts).length === 0) {
  // Already converted: the committed pass + review files stay the record.
  console.log(`All ${cards.length} card texts are already tokenized — nothing to write.`);
  process.exit(0);
}

const pass = {
  $note:
    "Token conversion, 2026-10-06 (issues 'Card text tokens' / 'Convert all 167 card texts to tokens'): every keyword term the old RulesText TERM_RE bolded becomes {kwId} or {kwId|as written}. Mechanical and rendering-preserving (plainText(new) === old for every card, asserted by tools/import-cards/src/tokenize-pass.ts). Apply with: npm run retext -- packages/cards/data/rewrites/2026-10-06-tokens.json && npm run import-cards",
  texts,
};
writeFileSync(PASS_PATH, JSON.stringify(pass, null, 2) + "\n", "utf8");

const counts = [...perKeyword].sort((a, b) => b[1] - a[1]);
const tokenTotal = counts.reduce((n, [, v]) => n + v, 0);
const lines = [
  "# 2026-10-06 token conversion — review list",
  "",
  `Generated by \`tools/import-cards/src/tokenize-pass.ts\`: ${Object.keys(texts).length} of ${cards.length} cards converted, ${tokenTotal} keyword tokens.`,
  "Each item is a match where the term may be prose rather than the keyword. The conversion kept the old",
  "rendering exactly (these words were already bold before); this list is for a human edit pass.",
  "",
  `Tokens per keyword: ${counts.map(([k, n]) => `${k} ${n}`).join(", ")}`,
  "",
  `## ${review.length} items`,
  "",
  "`ID | why | before | after`",
  "",
  ...review.map((r) => `- ${r.id} | ${r.why} | ${r.before} | ${r.after}`),
  "",
];
writeFileSync(REVIEW_PATH, lines.join("\n"), "utf8");
console.log(lines.join("\n"));
console.log(`Wrote ${PASS_PATH}\nWrote ${REVIEW_PATH}`);
