import type { CSSProperties, ReactNode } from "react";
import { KEYWORDS, KEYWORD_GLYPHS, keywordsFor, type Keyword } from "../keywords.ts";
import { useGlyphs } from "../glyphProbe.ts";
import { Icon } from "./Pips.tsx";

/**
 * Keyworded card text — the one way card rules render in the DOM (spellbook, detail
 * rail, builder preview, prompt chips). Two parts, both driven by the catalog's
 * `tags` through the keyword vocabulary:
 *   • a strip of keyword chips (glyph + label; abbreviation until the glyph ships)
 *   • the rules text with keyword terms set in bold, each carrying its reminder
 *     line as a tooltip.
 */

/** One keyword chip: tinted glyph (or abbr fallback) + optional label, reminder on hover. */
export function KeywordChip({ kw, label = true, size = 12 }: { kw: Keyword; label?: boolean; size?: number }) {
  const has = useGlyphs(KEYWORD_GLYPHS);
  return (
    <span className="kwchip" style={{ "--kw": kw.tint } as CSSProperties} title={`${kw.label} — ${kw.reminder}`}>
      {has(kw.glyph) ? <Icon name={kw.glyph} color={kw.tint} size={size} /> : <span className="kwabbr">{kw.abbr}</span>}
      {label && <span className="kwlabel">{kw.label}</span>}
    </span>
  );
}

/** The keyword strip for a card's tags; renders nothing for untagged entries (components). */
export function KeywordStrip({ tags, label = true, size }: { tags?: string[]; label?: boolean; size?: number }) {
  const ks = keywordsFor(tags);
  if (ks.length === 0) return null;
  return (
    <span className="kwstrip" aria-label={`keywords ${ks.map((k) => k.label).join(", ")}`}>
      {ks.map((k) => (
        <KeywordChip key={k.id} kw={k} label={label} size={size} />
      ))}
    </span>
  );
}

// Longest terms first so "look at your opponent's hand" wins over "look at".
const TERM_INDEX: { term: string; kw: Keyword }[] = KEYWORDS.flatMap((kw) => kw.terms.map((term) => ({ term, kw }))).sort(
  (a, b) => b.term.length - a.term.length,
);
const TERM_RE = TERM_INDEX.length
  ? new RegExp(`\\b(${TERM_INDEX.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi")
  : null;

/** Card text with keyword terms in bold + reminder tooltips. Pure text in, inline nodes out. */
export function RulesText({ text, className = "rules" }: { text: string; className?: string }) {
  if (!TERM_RE || !text) return <span className={className}>{text}</span>;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TERM_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const hit = TERM_INDEX.find((t) => t.term.toLowerCase() === m[0].toLowerCase());
    out.push(
      <b key={i++} className="kw" style={{ "--kw": hit?.kw.tint } as CSSProperties} title={hit ? `${hit.kw.label} — ${hit.kw.reminder}` : undefined}>
        {m[0]}
      </b>,
    );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <span className={className}>{out}</span>;
}
