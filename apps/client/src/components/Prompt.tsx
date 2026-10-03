import type { CardCatalog, MatchState, PendingChoiceView } from "../api.ts";
import { Pips, SchoolCrest } from "./Pips.tsx";
import { KeywordStrip } from "./RulesText.tsx";

/** Human titles per choice mode; the engine's `reason` (already player-facing copy) is the subtitle. */
const MODE_TITLE: Record<PendingChoiceView["mode"], string> = {
  takeToHand: "Take a card into your hand",
  bankToDeckTop: "Put a card on top of your deck",
  discardForDamage: "Discard a card — 1 damage per symbol on it",
  discardForSearch: "Discard, then search your deck",
  orderToTop: "Order the top of your deck",
  bounceToOwnersDeckTop: "Put a component on top of their deck",
};

/**
 * The floating right-side prompt from the mockup. Two "respond to something" moments:
 *  - a pending look/loot/scry choice → click a revealed candidate;
 *  - a reaction window on the OPPONENT's spell → click your glowing prepared Reaction (on the board)
 *    or Pass here.
 * (When your OWN spell is on the stack, that's confirm/retract — handled by the action bar, not here.)
 */
export function Prompt({
  state,
  cards,
  onAction,
  cardName,
  onHover,
}: {
  state: MatchState | null;
  cards: CardCatalog;
  onAction: (i: number) => void;
  cardName: (defId: string) => string;
  onHover?: (defId: string | null) => void;
}) {
  if (!state || !state.yourTurn) return null;
  const legal = state.legal;

  const pc = state.view.pendingChoice;
  if (pc && pc.mine) {
    const title = MODE_TITLE[pc.mode] ?? "Choose a card";
    // The engine reason is the subtitle unless it just restates the title (same opening words).
    const head = (t: string) => t.toLowerCase().split(/s+/).slice(0, 4).join(" ");
    const subtitle = pc.reason && head(pc.reason) !== head(title) ? pc.reason : null;
    // "Up to N" / "you may" choices offer pass = Done. (While a choice is
    // pending the only legal actions are choose + this pass, so no ambiguity.)
    const done = legal.find((x) => x.type === "pass");
    // Each choose action is consumed once, so duplicate defIds map to distinct actions.
    const used = new Set<number>();
    return (
      <div className="prompt">
        <h4>CHOOSE{pc.picksRemaining > 1 ? ` (${pc.picksRemaining} left)` : ""}</h4>
        <p>
          {title}
          {subtitle && <span className="subreason"> — {subtitle}</span>}
        </p>
        <div className="choices">
          {pc.candidates.map((def, i) => {
            const a = legal.find((x) => x.type === "choose" && x.defId === def && !used.has(x.index));
            if (a) used.add(a.index);
            return (
              <span
                key={i}
                className={a ? "choice" : "choice ineligible"}
                title={a ? undefined : "Shown for information — can't be picked"}
                onClick={() => a && onAction(a.index)}
                onMouseEnter={() => onHover?.(def)}
                onMouseLeave={() => onHover?.(null)}
              >
                <SchoolCrest school={cards[def]?.school} size={10} /> {cardName(def)}
                {cards[def]?.cost && (
                  <>
                    {" "}
                    <Pips cost={cards[def]?.cost} />
                  </>
                )}
                <KeywordStrip tags={cards[def]?.tags} label={false} size={10} />
              </span>
            );
          })}
        </div>
        {done && (
          <div className="row">
            <button className="primary" onClick={() => onAction(done.index)}>
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  const top = state.view.stack[state.view.stack.length - 1];
  if (state.reactionWindow && top && top.controller === 1) {
    const ready = legal.filter((a) => a.type === "castReaction").length;
    const pass = legal.find((a) => a.type === "pass");
    return (
      <div className="prompt">
        <h4>REACTION WINDOW</h4>
        <p>
          The opponent's spell (glowing) resolves next.{" "}
          {ready > 0 ? `Click a glowing prepared Reaction to respond (${ready} ready), or pass.` : "You have no castable Reaction — pass to let it resolve."}
        </p>
        <div className="row">{pass && <button className="primary" onClick={() => onAction(pass.index)}>Pass</button>}</div>
      </div>
    );
  }

  return null;
}
