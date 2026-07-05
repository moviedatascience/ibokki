import type { MatchState } from "../api.ts";

/** The mockup's header strip: menu · round · phase · priority. */
export function TopBar({ state, onMenu }: { state: MatchState | null; onMenu?: () => void }) {
  const prio = !state ? null : state.gameOver ? "over" : state.yourTurn ? "you" : "wait";
  return (
    <div className="topbar">
      {onMenu && (
        <button className="menubtn" onClick={onMenu} data-testid="to-menu">
          ‹ Menu
        </button>
      )}
      <span className="brand">IBOKKI</span>
      {state && (
        <>
          <span className="seg">
            Round <b>{state.round}</b>
          </span>
          <span className="seg">{String(state.phase).toUpperCase()} PHASE</span>
          <span className="grow" />
          <span className={`prio ${prio}`}>
            {state.gameOver ? "GAME OVER" : `PRIORITY: ${state.yourTurn ? "YOU" : "OPPONENT"}`}
          </span>
        </>
      )}
    </div>
  );
}
