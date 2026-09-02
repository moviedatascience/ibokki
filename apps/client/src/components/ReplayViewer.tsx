/**
 * Standalone replay screen (rendered by main.tsx instead of App when the URL
 * carries ?replay=<token> or ?rewatch=<matchId>). Frames arrive pre-built and
 * pre-redacted from the server — always the sharing seat's own view, so a link
 * shows nothing its owner didn't see live. Each frame's `log` is only the lines
 * that step ADDED; the viewer accumulates them into the running transcript.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { api, BASE, type CardCatalog, type MatchState, type ReplayMeta, type ReplaySource } from "../api.ts";
import { Board } from "../board/Board.tsx";
import { LogLines } from "./LogLines.tsx";

const END_REASON: Record<string, string> = {
  hp: "hit points reduced to 0",
  deckout: "Resource Deck ran out",
  "turn-limit": "turn limit reached",
  abandoned: "match abandoned",
};

const FORFEIT_CAUSE: Record<string, string> = {
  disconnected: "disconnected",
  idle: "was idle too long",
  conceded: "conceded",
};

const PLAY_TICK_MS = 1100;
const noop = () => {};

/** The end card's verdict, preferring a terminal final frame (ground truth from the
 *  action log) over the stored meta result (which covers out-of-band endings). */
function verdictOf(meta: ReplayMeta, last: MatchState | undefined): { title: string; reason: string; tone: "win" | "loss" | "draw" } {
  const side = (w: 0 | 1) => `${meta.decks[w]} ${w === 0 ? "(this seat)" : "(opponent)"}`;
  const tone = (w: 0 | 1 | null) => (w === null ? "draw" : w === 0 ? "win" : "loss") as "win" | "loss" | "draw";
  if (last?.gameOver) {
    const reason = last.endReason ? (END_REASON[last.endReason] ?? last.endReason) : "";
    return { title: last.winner === null ? "Draw" : `${side(last.winner)} wins`, reason, tone: tone(last.winner) };
  }
  const r = meta.result;
  if (!r) return { title: "Recording ends here", reason: "no result was recorded", tone: "draw" };
  const f = r.forfeit;
  const cause = f ? `${f.by === null ? "both players" : f.by === 0 ? "this seat" : "opponent"} ${FORFEIT_CAUSE[f.cause] ?? f.cause}` : "";
  const reason = r.endReason === "forfeit" ? `forfeit — ${cause}` : r.endReason ? (END_REASON[r.endReason] ?? r.endReason) : "";
  return { title: r.winner === null ? "Draw" : `${side(r.winner)} wins`, reason, tone: tone(r.winner) };
}

export function ReplayViewer({ source }: { source: ReplaySource }) {
  const [cards, setCards] = useState<CardCatalog>({});
  const [meta, setMeta] = useState<ReplayMeta | null>(null);
  const [frames, setFrames] = useState<MatchState[]>([]);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endDismissed, setEndDismissed] = useState(false);
  const lastPosRef = useRef(0);
  const logRef = useRef<HTMLDivElement | null>(null);

  // Meta + catalog, once (cancel-guarded for StrictMode's dev double-mount).
  useEffect(() => {
    let cancelled = false;
    api.replayCatalog().then((c) => !cancelled && setCards(c)).catch(noop); // board falls back to defIds
    api
      .replayMeta(source)
      .then((m) => !cancelled && setMeta(m))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Frame chunks, sequentially until we hold the whole match. The offset-checked
  // append keeps a StrictMode-doubled loop idempotent.
  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    void (async () => {
      try {
        for (let have = frames.length; have < meta.total && !cancelled; ) {
          const chunk = await api.replayFrames(source, have, 100);
          if (cancelled || chunk.frames.length === 0) return;
          setFrames((prev) => (prev.length === chunk.from ? [...prev, ...chunk.frames] : prev));
          have = chunk.from + chunk.frames.length;
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  // Autoplay: advance while more frames exist (waits at the loading edge).
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (meta && p >= meta.total - 1) {
          setPlaying(false);
          return p;
        }
        return Math.min(p + 1, Math.max(0, frames.length - 1));
      });
    }, PLAY_TICK_MS);
    return () => clearInterval(t);
  }, [playing, frames.length, meta]);

  // One flat transcript + per-frame cumulative line counts (no per-frame copies).
  const { allLines, counts } = useMemo(() => {
    const allLines: string[] = [];
    const counts: number[] = [];
    for (const f of frames) {
      for (const line of f.log) allLines.push(line);
      counts.push(allLines.length);
    }
    return { allLines, counts };
  }, [frames]);

  const visibleLines = useMemo(() => allLines.slice(0, counts[pos] ?? 0), [allLines, counts, pos]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleLines.length]);

  // Only a single forward step keeps its events — scrubbing or jumping backward
  // must not re-fire that frame's damage floaters. The ref write happens in an
  // effect (post-commit), never during render: StrictMode double-invokes render
  // bodies, and an inline write would make the committed pass always see
  // pos === lastPos and strip every step's events in dev.
  const frame = frames[pos];
  const singleStep = pos === lastPosRef.current + 1;
  useEffect(() => {
    lastPosRef.current = pos;
  }, [pos]);
  const shown = frame && !singleStep ? { ...frame, events: [] } : frame;

  const atEnd = meta !== null && pos >= meta.total - 1 && frames.length >= meta.total;
  const verdict = meta && atEnd ? verdictOf(meta, frames[meta.total - 1]) : null;
  const seek = (n: number) => {
    setPlaying(false);
    setPos(Math.max(0, Math.min(n, frames.length - 1)));
  };

  if (error) {
    return (
      <div className="app">
        <div className="home">
          <div className="panel" style={{ maxWidth: 420 }}>
            <h3>Replay unavailable</h3>
            <div className="hint" data-testid="replay-error">{error}</div>
            <a className="ssobtn" href={BASE} style={{ marginTop: 10 }}>
              Back to Ibokki
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">Ibokki</span>
        <span className="seg" data-testid="replay-title">
          Replay — <b>{meta ? `${meta.decks[0]} vs ${meta.decks[1]}` : "loading…"}</b>
          {meta?.bot ? ` · vs bot (${meta.botLevel ?? "easy"})` : ""}
        </span>
        <span className="seg">watching from the shared seat</span>
        <span className="grow" />
        <button className="menubtn" onClick={() => location.assign(BASE)} data-testid="replay-exit">
          Exit replay
        </button>
      </div>
      <div className="main">
        <div className="stage">
          <div className="boardwrap">
            <Board
              state={shown ?? null}
              cards={cards}
              onAction={noop}
              onHover={noop}
              onStatusHover={noop}
              onSelection={noop}
              onInspect={noop}
              onBrowseDiscard={noop}
              onReady={noop}
            />
            {verdict && !endDismissed && (
              <div className="gameover">
                <div className="gopanel">
                  <h2 className={verdict.tone} data-testid="replay-verdict">
                    {verdict.title}
                  </h2>
                  <p className="goreason">{verdict.reason}</p>
                  <div className="gorow">
                    <button onClick={() => seek(0)}>Watch again</button>
                    <button onClick={() => setEndDismissed(true)}>View final board</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="actionbar replaybar">
            <button onClick={() => seek(0)} title="Jump to start" data-testid="replay-start">
              ⏮
            </button>
            <button onClick={() => seek(pos - 1)} disabled={pos === 0} data-testid="replay-prev">
              ◀
            </button>
            <button className="primary" onClick={() => setPlaying((p) => !p)} data-testid="replay-play">
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={() => seek(pos + 1)} disabled={pos >= frames.length - 1} data-testid="replay-next">
              ▶
            </button>
            <button onClick={() => seek(frames.length - 1)} title="Jump to end" data-testid="replay-end">
              ⏭
            </button>
            <input
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={pos}
              onChange={(e) => seek(Number(e.target.value))}
              data-testid="replay-slider"
            />
            <span className="rpos" data-testid="replay-pos">
              {pos + 1} / {meta?.total ?? "?"}
              {meta && frames.length < meta.total ? ` (loaded ${frames.length})` : ""}
            </span>
          </div>
        </div>
        <div className="rail">
          <div className="panel" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <h3>Match log</h3>
            <div className="log" style={{ maxHeight: "none", flex: 1 }} ref={logRef}>
              <LogLines lines={visibleLines} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
