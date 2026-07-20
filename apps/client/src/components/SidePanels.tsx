import { useEffect, useRef } from "react";
import type { CardCatalog, MatchState, School } from "../api.ts";
import type { OnlineApi } from "../useMatch.ts";
import { LogLines } from "./LogLines.tsx";
import { Pips, SchoolCrest, TypeIcon } from "./Pips.tsx";

const SCHOOLS: School[] = ["Evocation", "Abjuration", "Divination"];

interface Props {
  state: MatchState | null;
  cards: CardCatalog;
  hoverDef: string | null;
  /** Hovered ongoing-effect chip description (takes precedence — the pointer is on the chip). */
  statusHover: string | null;
  /** Card pinned into the detail panel by clicking it (hover previews take precedence). */
  pinnedDef: string | null;
  onUnpin: () => void;
  p0: School;
  p1: School;
  mode: "bot" | "agent";
  setP0: (s: School) => void;
  setP1: (s: School) => void;
  setMode: (m: "bot" | "agent") => void;
  onNewGame: () => void;
  online: OnlineApi;
  /** Leave the match and return to the menu (App owns the forfeit confirmation). */
  onLeave: () => void;
}

/** Live room status while online (create/join live on the Home screen). */
function OnlinePanel({ online, onLeave }: { online: OnlineApi; onLeave: () => void }) {
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
      <button style={{ width: "100%" }} onClick={onLeave} data-testid="online-leave">
        Leave
      </button>
    </div>
  );
}

/** Right rail: match controls, hovered-card detail, and the match log. */
export function SidePanels({ state, cards, hoverDef, statusHover, pinnedDef, onUnpin, p0, p1, mode, setP0, setP1, setMode, onNewGame, online, onLeave }: Props) {
  const shownDef = hoverDef ?? pinnedDef;
  const c = shownDef ? cards[shownDef] : null;
  const isPinned = !hoverDef && !!pinnedDef && !!c;
  const inOnline = online.status !== "idle";
  const liveMatch = !!state && !state.gameOver;
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state?.log.length]);
  return (
    <div className="rail">
      {/* Online matches have no local setup — the OnlinePanel below is the whole story. */}
      {!inOnline && (
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
          <button
            className="primary"
            style={{ width: "100%" }}
            onClick={() => {
              if (liveMatch && !window.confirm("Start a new game? The current match will be abandoned.")) return;
              onNewGame();
            }}
          >
            New game
          </button>
        </div>
      )}

      <OnlinePanel online={online} onLeave={onLeave} />

      <div className="panel detail">
        <h3>
          Card detail
          {isPinned && (
            <button className="unpin" title="Unpin" onClick={onUnpin}>
              Unpin ✕
            </button>
          )}
        </h3>
        {statusHover ? (
          <>
            <div className="dname">Ongoing effect</div>
            <div className="dtext" data-testid="ongoing-detail">{statusHover}</div>
          </>
        ) : c ? (
          <>
            <div className="dname">
              <SchoolCrest school={c.school} /> {c.name}
            </div>
            <div className="dmeta">
              {c.cost && (
                <>
                  <Pips cost={c.cost} /> ·{" "}
                </>
              )}
              {[c.level ? `L${c.level}` : null, c.type].filter(Boolean).join(" · ")}
              {(c.type === "Item" || c.type === "Gambit") && <> <TypeIcon type={c.type} /></>}
            </div>
            <div className="dtext">{c.text}</div>
          </>
        ) : (
          <div className="hint">Hover a card to inspect it — click a card with no action to pin it here.</div>
        )}
      </div>

      <div className="panel">
        <h3>Match log</h3>
        <div className="log" ref={logRef}>
          <LogLines lines={state?.log ?? []} />
        </div>
      </div>
    </div>
  );
}
