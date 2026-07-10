import type { ReactNode } from "react";
import type { CardCatalog, MatchState } from "../api.ts";
import type { OnlineStatus } from "../useMatch.ts";
import { Pips } from "./Pips.tsx";

interface Props {
  state: MatchState | null;
  cards: CardCatalog;
  selectionActive: boolean;
  onAction: (index: number) => void;
  onCancel: () => void;
  error: string | null;
  onlineStatus?: OnlineStatus;
}

/** Floating status + contextual buttons over the bottom of the table (mirrors the old board's status bar). */
export function ActionBar({ state, cards, selectionActive, onAction, onCancel, error, onlineStatus }: Props) {
  // Errors can arrive in any phase — connection loss and rate limits land while
  // WAITING on the opponent — so the error slot lives in the single wrapper, not
  // per-branch (where the next new slot would inevitably be forgotten in one).
  const err = error ? <span className="err">{error}</span> : null;
  const bar = (inner: ReactNode) => (
    <div className="actionbar">
      {inner}
      {err}
    </div>
  );

  if (!state) {
    return bar(<span className="status wait">{onlineStatus === "waiting" ? "Waiting for an opponent to join…" : "Connecting…"}</span>);
  }

  if (state.gameOver) {
    const msg = state.winner === null ? "Draw" : state.winner === 0 ? "YOU WIN" : "Opponent wins";
    return bar(
      <>
        <span className="status over">Game over — {msg}</span>
        {state.endReason && <span className="hint">({state.endReason})</span>}
      </>,
    );
  }

  if (!state.yourTurn) {
    return bar(<span className="status wait">Waiting for {state.bots.includes(1) ? "the bot" : "the opponent"}…</span>);
  }

  const by = (t: string) => state.legal.find((a) => a.type === t);
  const retract = by("retractCast");
  const mulligan = by("mulligan");
  const done = by("donePreparing");
  const pass = by("pass");
  // Take an attached component back to hand: "↩ [VV] ← Fireball". Only offered at sorcery speed.
  const detaches = state.legal.filter((a) => a.type === "detach");
  const detachParts = (a: (typeof detaches)[number]) => {
    const comp = a.defId ? cards[a.defId] : undefined;
    const spellDef = a.preparedIndex != null ? state.view.self.prepared[a.preparedIndex]?.spellDefId : undefined;
    const spell = spellDef ? (cards[spellDef]?.name ?? spellDef) : `slot ${(a.preparedIndex ?? 0) + 1}`;
    return { cost: comp?.cost ?? null, compName: comp?.name ?? "component", spell };
  };
  const top = state.view.stack[state.view.stack.length - 1];
  const reacting = state.reactionWindow && top?.controller === 1;
  // The Prompt overlay shows its own Pass/Done for these moments — don't offer a second one here.
  const promptOwnsPass = reacting || !!state.view.pendingChoice?.mine;

  let status = `Your turn — ${state.schools[0]} · ${state.phase}`;
  let cls = "you";
  if (retract) {
    status = "Your spell is on the stack — confirm or retract.";
    cls = "react";
  } else if (reacting) {
    status = "Reaction window — respond or pass.";
    cls = "react";
  }

  const passLabel = retract ? "Confirm ▶" : reacting ? "Pass priority" : "End turn";

  return (
    <div className="actionbar">
      <span className={`status ${cls}`}>{status}</span>
      {err}
      {mulligan && <button onClick={() => onAction(mulligan.index)}>Mulligan</button>}
      {detaches.map((a) => {
        const { cost, compName, spell } = detachParts(a);
        return (
          <button key={a.index} className="detach" title="Return this component to your hand" onClick={() => onAction(a.index)}>
            ↩ {cost ? <Pips cost={cost} /> : compName} ← {spell}
          </button>
        );
      })}
      {done && <button className="primary" onClick={() => onAction(done.index)}>Done preparing ✓</button>}
      {retract && <button onClick={() => onAction(retract.index)}>↩ Retract</button>}
      {selectionActive && <button onClick={onCancel}>Cancel</button>}
      {pass && !promptOwnsPass && <button className="primary" onClick={() => onAction(pass.index)}>{passLabel}</button>}
    </div>
  );
}
