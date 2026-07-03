import type { CardCatalog, MatchState, School } from "../api.ts";
import type { OnlineApi } from "../useMatch.ts";

const SCHOOLS: School[] = ["Evocation", "Abjuration", "Divination"];

interface Props {
  state: MatchState | null;
  cards: CardCatalog;
  hoverDef: string | null;
  p0: School;
  p1: School;
  mode: "bot" | "agent";
  setP0: (s: School) => void;
  setP1: (s: School) => void;
  setMode: (m: "bot" | "agent") => void;
  onNewGame: () => void;
  online: OnlineApi;
}

/** Live room status while online (create/join live on the Home screen). */
function OnlinePanel({ online }: { online: OnlineApi }) {
  if (online.status === "idle") return null;
  return (
    <div className="panel">
      <h3>Online</h3>
      {online.status === "connecting" && <div className="hint">Connecting…</div>}
      {online.status === "waiting" && (
        <>
          <div className="dname" data-testid="online-room-code">{online.code}</div>
          <div className="hint">Share this code — waiting for an opponent to join.</div>
        </>
      )}
      {online.status === "playing" && (
        <>
          <div className="dmeta" data-testid="online-room-code">Room {online.code}</div>
          <div className="hint" data-testid="online-presence">
            Opponent: {online.opponentConnected ? "connected" : "disconnected"}
          </div>
        </>
      )}
      <button style={{ width: "100%" }} onClick={online.leave} data-testid="online-leave">
        Leave
      </button>
    </div>
  );
}

/** Right rail: match controls, hovered-card detail, and the match log. */
export function SidePanels({ state, cards, hoverDef, p0, p1, mode, setP0, setP1, setMode, onNewGame, online }: Props) {
  const c = hoverDef ? cards[hoverDef] : null;
  const inOnline = online.status !== "idle";
  return (
    <div className="rail">
      <div className="panel">
        <h3>Match</h3>
        <label className="field">
          You
          <select value={p0} onChange={(e) => setP0(e.target.value as School)}>
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {!inOnline && (
          <>
            <label className="field">
              Opponent
              <select value={p1} onChange={(e) => setP1(e.target.value as School)}>
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value as "bot" | "agent")}>
                <option value="bot">vs Bot</option>
                <option value="agent">vs Agent (API)</option>
              </select>
            </label>
            <button className="primary" style={{ width: "100%" }} onClick={onNewGame}>
              New game
            </button>
          </>
        )}
      </div>

      <OnlinePanel online={online} />

      <div className="panel detail">
        <h3>Card detail</h3>
        {c ? (
          <>
            <div className="dname">{c.name}</div>
            <div className="dmeta">{[c.cost ? `cost ${c.cost}` : null, c.level ? `L${c.level}` : null, c.type].filter(Boolean).join(" · ")}</div>
            <div className="dtext">{c.text}</div>
          </>
        ) : (
          <div className="hint">Hover a card to inspect it.</div>
        )}
      </div>

      <div className="panel">
        <h3>Match log</h3>
        <pre className="log">{(state?.log ?? []).join("\n")}</pre>
      </div>
    </div>
  );
}
