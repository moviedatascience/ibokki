import type { MatchState } from "../api.ts";

/**
 * The floating right-side prompt from the mockup. Two "respond to something" moments:
 *  - a pending look/loot/scry choice → click a revealed candidate;
 *  - a reaction window on the OPPONENT's spell → click your glowing prepared Reaction (on the board)
 *    or Pass here.
 * (When your OWN spell is on the stack, that's confirm/retract — handled by the action bar, not here.)
 */
export function Prompt({ state, onAction, cardName }: { state: MatchState | null; onAction: (i: number) => void; cardName: (defId: string) => string }) {
  if (!state || !state.yourTurn) return null;
  const legal = state.legal;

  const pc = state.view.pendingChoice;
  if (pc && pc.mine) {
    const title = pc.mode === "bankToDeckTop" ? "Put a card on top of your deck" : pc.reason || "Choose a card";
    return (
      <div className="prompt">
        <h4>CHOOSE{pc.picksRemaining > 1 ? ` (${pc.picksRemaining} left)` : ""}</h4>
        <p>{title}</p>
        <div className="choices">
          {pc.candidates.map((def, i) => {
            const a = legal.find((x) => x.type === "choose" && x.defId === def);
            return (
              <span key={i} className="choice" onClick={() => a && onAction(a.index)}>
                {cardName(def)}
              </span>
            );
          })}
        </div>
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
