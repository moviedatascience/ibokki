import { useState, type CSSProperties } from "react";
import type { CardCatalog, MatchState } from "../api.ts";

/** Cards shown per book page (2 rows x 6 columns; see .sbpage in styles.css). */
const PAGE_SIZE = 12;

/** School accent for the title band + art placeholder; mirrors SCHOOL_COLOR in board/cardSprite.ts. */
const SCHOOL_VAR: Record<string, string> = {
  Evocation: "var(--evo)",
  Abjuration: "var(--abj)",
  Divination: "var(--div)",
};

/**
 * Prepare-phase spellbook picker (a bottom sheet). The spellbook can be large and list-like, so it
 * lives in the DOM rather than the Pixi board. It reads like a book: pages of spells ordered from
 * lowest to highest level, with prev/next buttons on either side. Click a card to prepare it into
 * the next free slot, or use its slot buttons to replace an already-prepared spell.
 */
export function SpellbookTray({ state, cards, onAction, onHover }: { state: MatchState | null; cards: CardCatalog; onAction: (i: number) => void; onHover: (d: string | null) => void }) {
  const [page, setPage] = useState(0);
  if (!state || !state.yourTurn || state.phase !== "prepare") return null;

  const uniq = [...new Set(state.view.self.spellbook ?? [])].sort((a, b) => {
    const la = cards[a]?.level ?? 0;
    const lb = cards[b]?.level ?? 0;
    return la - lb || (cards[a]?.name ?? a).localeCompare(cards[b]?.name ?? b);
  });
  const pageCount = Math.max(1, Math.ceil(uniq.length / PAGE_SIZE));
  const cur = Math.min(page, pageCount - 1);
  const visible = uniq.slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE);
  const levels = visible.map((d) => cards[d]?.level).filter((l): l is number => l != null);
  const lvlSpan = levels.length ? (levels[0] === levels[levels.length - 1] ? `L${levels[0]}` : `L${levels[0]}–${levels[levels.length - 1]}`) : "";

  const prepareFor = (def: string) => state.legal.find((a) => a.type === "prepareSpell" && a.defId === def);
  const replaceFor = (def: string) => state.legal.filter((a) => a.type === "replacePrepared" && a.defId === def);

  return (
    <div className="spellbook">
      <div className="sbhead">
        <span>Spellbook — click to prepare (level ≤ your max)</span>
        <span className="sbpageno">{lvlSpan && `${lvlSpan} · `}page {cur + 1}/{pageCount}</span>
      </div>
      <div className="sbbook">
        <button className="sbturn" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="Previous page">
          ◀
        </button>
        <div className="sbpage">
          {visible.map((def) => {
            const info = cards[def];
            const prep = prepareFor(def);
            const repl = replaceFor(def);
            const playable = !!prep || repl.length > 0;
            return (
              <div
                key={def}
                className={`sbcard${playable ? " playable" : " dim"}`}
                style={{ "--school": SCHOOL_VAR[info?.school ?? ""] ?? "var(--neu)" } as CSSProperties}
                onMouseEnter={() => onHover(def)}
                onMouseLeave={() => onHover(null)}
                onClick={() => prep && onAction(prep.index)}
              >
                <div className="sbband">
                  <span className="sbname">{info?.name ?? def}</span>
                  <span className="sbcost">{info?.cost ?? ""}</span>
                </div>
                <div className="sbart" />
                <div className="sbtypeline">
                  {[info?.type, info?.level ? `L${info.level}` : ""].filter(Boolean).join(" · ")}
                </div>
                <div className="sbtext">{info?.text ?? ""}</div>
                {!prep && repl.length > 0 && (
                  <div className="sbslots">
                    {repl.map((a) => (
                      <button key={a.index} onClick={(e) => { e.stopPropagation(); onAction(a.index); }}>
                        swap→{a.preparedIndex}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button className="sbturn" disabled={cur >= pageCount - 1} onClick={() => setPage(cur + 1)} aria-label="Next page">
          ▶
        </button>
      </div>
    </div>
  );
}
