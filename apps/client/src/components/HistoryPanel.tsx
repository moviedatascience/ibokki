/**
 * Signed-in Home panel: lifetime W-L record + recent finished matches, each
 * watchable (own authenticated replay route — no public link minted) and
 * shareable (mints an unguessable replay link, copied to the clipboard).
 * Self-contained: fetches /api/matches itself, keyed on the signed-in user, and
 * swallows failures quietly — Home must keep working when the server is down.
 */
import { useEffect, useState } from "react";
import { api, BASE, type HistoryEntry, type MatchHistoryResponse, type WinLoss } from "../api.ts";
import type { UseAuth } from "../useAuth.ts";

const END_REASON: Record<string, string> = {
  hp: "KO",
  deckout: "deckout",
  "turn-limit": "turn limit",
  forfeit: "forfeit",
};

const fmtWhen = (ms: number | null) =>
  ms === null ? "" : new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const fmtRecord = (r: WinLoss) => `${r.wins}–${r.losses}${r.draws ? `–${r.draws}` : ""}`;

function opponentLabel(m: HistoryEntry): string {
  if (m.mode === "solo") return `Bot (${m.botLevel ?? "easy"}) · ${m.opponentDeck}`;
  return `${m.opponentName} · ${m.opponentDeck}`;
}

export function HistoryPanel({ auth }: { auth: UseAuth }) {
  const [data, setData] = useState<MatchHistoryResponse | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const userId = auth.user?.id;

  useEffect(() => {
    setData(null);
    if (userId === undefined) return;
    let cancelled = false;
    api
      .matches()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {}); // server down / route missing — the panel just stays quiet
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!auth.user || !data) return null;

  const { record, matches } = data;
  const played = record.pvp.wins + record.pvp.losses + record.pvp.draws + record.solo.wins + record.solo.losses + record.solo.draws;

  const copyLink = async (m: HistoryEntry) => {
    try {
      const token = m.shareToken ?? (await api.shareMatch(m.id)).token;
      await navigator.clipboard.writeText(new URL(`${BASE}?replay=${token}`, location.origin).href);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((prev) => (prev === m.id ? null : prev)), 1600);
    } catch {
      /* clipboard denied or server down — nothing sensible to show in a panel */
    }
  };

  return (
    <div className="panel" data-testid="history-panel">
      <h3>Match history</h3>
      {played === 0 ? (
        <div className="hint">Finished matches land here — wins, losses, and shareable replays.</div>
      ) : (
        <div className="record" data-testid="history-record">
          <span>
            PvP <b>{fmtRecord(record.pvp)}</b>
          </span>
          <span>
            Solo <b>{fmtRecord(record.solo)}</b>
          </span>
        </div>
      )}
      <ul className="historylist">
        {matches.map((m) => (
          <li key={m.id}>
            <span className={`hout ${m.outcome}`} title={m.endReason ? (END_REASON[m.endReason] ?? m.endReason) : ""}>
              {m.outcome === "win" ? "W" : m.outcome === "loss" ? "L" : "D"}
            </span>
            <span className="hwho" title={`${m.yourDeck} vs ${opponentLabel(m)}`}>
              vs {opponentLabel(m)}
            </span>
            <span className="hwhen">{fmtWhen(m.endedAt)}</span>
            <span className="deckactions">
              <button onClick={() => location.assign(`${BASE}?rewatch=${m.id}`)} title="Watch this match again" data-testid={`history-watch-${m.id}`}>
                Watch
              </button>
              {!!navigator.clipboard && (
                <button onClick={() => void copyLink(m)} title="Copy a shareable replay link" data-testid={`history-share-${m.id}`}>
                  {copiedId === m.id ? "Copied!" : "Share"}
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
