import { useEffect, useState, type CSSProperties } from "react";
import type { CardCatalog, MatchState } from "../api.ts";
import { cardArtUrl, hasCardArt } from "../cardArtManifest.ts";
import { Icon, Pips, SchoolCrest } from "./Pips.tsx";

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
 *
 * Preparing moves the card out of the spellbook (engine rule), and the sheet covers the board's
 * prepared row — so a numbered "Prepared" strip at the bottom shows what's already in each slot.
 */
export function SpellbookTray({ state, cards, onAction, onHover, onInspect }: { state: MatchState | null; cards: CardCatalog; onAction: (i: number) => void; onHover: (d: string | null) => void; onInspect: (d: string) => void }) {
  const [page, setPage] = useState(0);
  const open = !!state && state.yourTurn && state.phase === "prepare";
  // The sheet can close while the cursor is over a card (Done preparing, phase flip) and
  // mouseleave never fires — clear the card-detail hover ourselves when we hide.
  useEffect(() => {
    if (!open) onHover(null);
  }, [open, onHover]);
  if (!open || !state) return null;

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

  const prepared = state.view.self.prepared;
  const preparedLimit = state.view.self.preparedLimit;

  return (
    <div className="spellbook">
      <div className="sbhead">
        <span>
          {prepared.length >= preparedLimit
            ? "Spellbook — slots full: hover a card to swap it in"
            : `Spellbook — click to prepare (max spell L${state.view.self.maxSpellLevel})`}
        </span>
        {/* The sheet covers your nameplate, so surface the vitals that inform prep choices here. */}
        <span className="sbyou">
          <Icon name="hp" color="var(--bad)" title="HP" /> {state.view.self.hp} · Lv {state.view.self.level} · deck {state.view.self.resourceDeckCount}
        </span>
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
                onClick={() => (prep ? onAction(prep.index) : onInspect(def))}
              >
                <div className="sbband">
                  <span className="sbname">{info?.name ?? def}</span>
                  <span className="sbcost"><Pips cost={info?.cost} /></span>
                </div>
                {/* Illustration lands over the gradient placeholder once art ships for this card. */}
                <div className="sbart" style={hasCardArt(def) ? { backgroundImage: `url(${cardArtUrl(def)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                <div className="sbtypeline">
                  <SchoolCrest school={info?.school} size={11} /> {[info?.type, info?.level ? `L${info.level}` : ""].filter(Boolean).join(" · ")}
                </div>
                <div className="sbtext">{info?.text ?? ""}</div>
                {!prep && repl.length > 0 && (
                  <div className="sbslots">
                    {repl.map((a) => {
                      const curDef = a.preparedIndex != null ? prepared[a.preparedIndex]?.spellDefId : undefined;
                      const cur = curDef ? (cards[curDef]?.name ?? curDef) : `slot ${(a.preparedIndex ?? 0) + 1}`;
                      return (
                        <button key={a.index} title={`Replace ${cur} with this spell`} onClick={(e) => { e.stopPropagation(); onAction(a.index); }}>
                          swap: {cur}
                        </button>
                      );
                    })}
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
      <div className="sbprep">
        <span className="sbpreplabel">
          Prepared {prepared.length}/{preparedLimit}
        </span>
        {Array.from({ length: preparedLimit }, (_, i) => {
          const def = prepared[i]?.spellDefId;
          if (!def) {
            return (
              <div key={i} className="sbprepslot empty">
                <span className="sbprepno">{i + 1}</span> empty
              </div>
            );
          }
          const info = cards[def];
          return (
            <div
              key={i}
              className="sbprepslot"
              style={{ "--school": SCHOOL_VAR[info?.school ?? ""] ?? "var(--neu)" } as CSSProperties}
              onMouseEnter={() => onHover(def)}
              onMouseLeave={() => onHover(null)}
            >
              <span className="sbprepno">{i + 1}</span>
              <span className="sbprepname">{info?.name ?? def}</span>
              <span className="sbprepmeta">
                {info?.level ? `L${info.level}` : ""} <Pips cost={info?.cost} />
              </span>
              {prepared[i]?.sealed && (
                <span className="sbsealed">
                  <Icon name="seal" color="#c9a0f0" size={10} /> sealed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
