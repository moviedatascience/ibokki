import type { CSSProperties, ReactNode } from "react";
import { KEYWORD_BY_ID, KEYWORD_GLYPHS, keywordsFor, type Keyword } from "../keywords.ts";
import { plainText, tokenizeText, type TextToken } from "../textTokens.ts";
import type { CardCatalog } from "../api.ts";
import { useGlyphs } from "../glyphProbe.ts";
import { Icon, Pip } from "./Pips.tsx";

/**
 * Keyworded card text — the one way card rules render in the DOM (spellbook, detail
 * rail, builder preview, prompt chips). Two parts:
 *   • a strip of keyword chips from the catalog `tags` (glyph + label; abbreviation
 *     until the glyph ships)
 *   • the rules text, authored with tokens ({burn}, {cancel|cancelled}, {V},
 *     {card:EVO-017}; grammar in textTokens.ts): keywords set in bold with their
 *     glyph and reminder tooltip, pips as pip glyphs, card refs by name.
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

/** Card text with keyword tokens in bold + reminder tooltips (see textTokens.ts for the grammar). */
export function RulesText({ text, className = "rules", catalog }: { text: string; className?: string; catalog?: CardCatalog }) {
  const has = useGlyphs(KEYWORD_GLYPHS);
  if (!text) return <span className={className}>{text}</span>;
  let tokens: TextToken[];
  try {
    tokens = tokenizeText(text, { cardName: (id) => catalog?.[id]?.name });
  } catch {
    // Cards are validated at import, so this is a stale/foreign catalog: show it raw rather than crash.
    return <span className={className}>{text}</span>;
  }
  const out: ReactNode[] = tokens.map((t, i) => {
    if (t.kind === "text") return t.text;
    if (t.kind === "pip") return <Pip key={i} sym={t.sym} />;
    if (t.kind === "card") {
      const ref = catalog?.[t.defId];
      let title = ref?.name ?? t.display;
      if (ref?.text) {
        try {
          title = `${ref.name} — ${plainText(ref.text)}`;
        } catch {
          /* keep the name */
        }
      }
      return (
        <b key={i} className="cardref" title={title}>
          {t.display}
        </b>
      );
    }
    const kw = KEYWORD_BY_ID.get(t.id);
    return (
      <b key={i} className="kw" style={{ "--kw": kw?.tint } as CSSProperties} title={kw ? `${kw.label} — ${kw.reminder}` : undefined}>
        {kw && has(kw.glyph) && <Icon name={kw.glyph} color={kw.tint} size={11} />}
        {t.display}
      </b>
    );
  });
  return <span className={className}>{out}</span>;
}
