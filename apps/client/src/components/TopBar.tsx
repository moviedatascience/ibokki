import type { MatchState } from "../api.ts";

/** The mockup's header strip: round · phase · priority. */
export function TopBar({ state }: { state: MatchState | null }) {
  const prio = !state ? null : state.gameOver ? "over" : state.yourTurn ? "you" : "wait";
  return (
    <div className="topbar">
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
