import { useEffect } from "react";
import type { CardCatalog, MatchState } from "../api.ts";
import { Pips, SchoolCrest, TypeIcon } from "./Pips.tsx";

interface Props {
  /** Whose pile: 0 = yours, 1 = opponent's (both are public information). */
  side: 0 | 1;
  state: MatchState;
  cards: CardCatalog;
  onClose: () => void;
  onHover: (defId: string | null) => void;
  onInspect: (defId: string) => void;
}

/** Overlay listing a discard pile, newest first. Opened by tapping the pile on the board. */
export function DiscardBrowser({ side, state, cards, onClose, onHover, onInspect }: Props) {
  const view = side === 0 ? state.view.self : state.view.opponent;
  const list = [...view.discard].reverse();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="gameover" onClick={onClose} data-testid="discard-browser">
      <div className="gopanel browsepanel" onClick={(e) => e.stopPropagation()}>
        <h2>
          {side === 0 ? "Your discard" : "Opponent's discard"} · {list.length}
        </h2>
        {list.length === 0 ? (
          <div className="hint">Empty.</div>
        ) : (
          <ul className="browselist">
            {list.map((def, i) => {
              const c = cards[def];
              return (
                <li key={i} onMouseEnter={() => onHover(def)} onMouseLeave={() => onHover(null)} onClick={() => onInspect(def)}>
                  <span>
                    <SchoolCrest school={c?.school ?? null} size={12} /> {c?.name ?? def}
                  </span>
                  <em>
                    {c?.cost && (
                      <>
                        <Pips cost={c.cost} />{" "}
                      </>
                    )}
                    {[c?.level ? `L${c.level}` : null, c?.type].filter(Boolean).join(" · ")}
                    {(c?.type === "Item" || c?.type === "Gambit") && <TypeIcon type={c.type} />}
                  </em>
                </li>
              );
            })}
          </ul>
        )}
        <div className="gorow">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
