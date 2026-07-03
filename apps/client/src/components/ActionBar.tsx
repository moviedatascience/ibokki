import type { CardCatalog, MatchState } from "../api.ts";

interface Props {
  state: MatchState | null;
  cards: CardCatalog;
  selectionActive: boolean;
  onAction: (index: number) => void;
  onCancel: () => void;
  error: string | null;
}

/** Floating status + contextual buttons over the bottom of the table (mirrors the old board's status bar). */
export function ActionBar({ state, cards, selectionActive, onAction, onCancel, error }: Props) {
  if (!state) return <div className="actionbar"><span className="status wait">Connecting…</span></div>;

  if (state.gameOver) {
    const msg = state.winner === null ? "Draw" : state.winner === 0 ? "YOU WIN 🎉" : "Opponent wins";
    return (
      <div className="actionbar">
        <span className="status over">Game over — {msg}</span>
        {state.endReason && <span className="hint">({state.endReason})</span>}
      </div>
    );
  }

  if (!state.yourTurn) {
    return (
      <div className="actionbar">
        <span className="status wait">Waiting for {state.bots.includes(1) ? "the bot" : "the opponent"}…</span>
      </div>
    );
  }

  const by = (t: string) => state.legal.find((a) => a.type === t);
  const retract = by("retractCast");
  const mulligan = by("mulligan");
  const done = by("donePreparing");
  const pass = by("pass");
  // Take an attached component back to hand: "↩ VV ← Fireball". Only offered at sorcery speed.
  const detaches = state.legal.filter((a) => a.type === "detach");
  const detachLabel = (a: (typeof detaches)[number]) => {
    const sym = (a.defId && cards[a.defId]?.cost) || cards[a.defId ?? ""]?.name || "component";
    const spellDef = a.preparedIndex != null ? state.view.self.prepared[a.preparedIndex]?.spellDefId : undefined;
    const spell = spellDef ? (cards[spellDef]?.name ?? spellDef) : `slot ${a.preparedIndex}`;
    return `↩ ${sym} ← ${spell}`;
  };
  const top = state.view.stack[state.view.stack.length - 1];
  const reacting = state.reactionWindow && top?.controller === 1;

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
      {error && <span className="err">{error}</span>}
      {mulligan && <button onClick={() => onAction(mulligan.index)}>Mulligan</button>}
      {detaches.map((a) => (
        <button key={a.index} className="detach" title="Return this component to your hand" onClick={() => onAction(a.index)}>
          {detachLabel(a)}
        </button>
      ))}
      {done && <button className="primary" onClick={() => onAction(done.index)}>Done preparing ✓</button>}
      {retract && <button onClick={() => onAction(retract.index)}>↩ Retract</button>}
      {selectionActive && <button onClick={onCancel}>Cancel</button>}
      {pass && <button className="primary" onClick={() => onAction(pass.index)}>{passLabel}</button>}
    </div>
  );
}
