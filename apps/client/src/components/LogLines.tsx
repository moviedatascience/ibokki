/**
 * Player-readable match log. The transcript arrives as engine/dev prose — absolute
 * "P0:" prefixes locally, "You:"/"Opp:" online (P0 always means the viewer in both),
 * defIds like [ABJ-001], and 0-indexed prepared[N] refs. This formats it for humans
 * at display time only; GameOverSummary's stat tally still parses the RAW log.
 */

const NEW_MATCH = /^New match: P0 (\S+) \(you\) vs P1 (\S+) \((\w+)\) — seed (\d+)$/;

/** Third-person → second-person verbs for lines rewritten to start with "You". */
const DEVERB: Record<string, string> = {
  takes: "take",
  burns: "burn",
  heals: "heal",
  casts: "cast",
  reacts: "react",
  plays: "play",
  mills: "mill",
  searches: "search",
  discards: "discard",
  draws: "draw",
  reshuffles: "reshuffle",
  mulligans: "mulligan",
  wins: "win",
  gets: "get",
};

function humanize(s: string): string {
  return s
    .replace(/\s*\[[A-Z]{2,4}-[A-Z0-9]+\]/g, "") // defIds: [ABJ-001], [CMP-VSM]
    .replace(/\(prepared\[(\d+)\]\)/g, (_, n: string) => `(slot ${Number(n) + 1})`)
    .replace(/prepared\[(\d+)\]/g, (_, n: string) => `slot ${Number(n) + 1}`)
    .replace(/\bP0 ward\b/g, "your ward")
    .replace(/\bP1 ward\b/g, "opponent's ward")
    .replace(/\bP0's\b/g, "your")
    .replace(/\bP1's\b/g, "opponent's")
    .replace(/\bP0(\s+)(\w+)/g, (_, sp: string, w: string) => `you${sp}${DEVERB[w] ?? w}`)
    .replace(/\bP0\b/g, "you")
    .replace(/\bP1\b/g, "opponent");
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

interface FmtLine {
  kind: "you" | "opp" | "event" | "info";
  who?: string;
  text: string;
}

export function formatLogLine(raw: string): FmtLine {
  const nm = NEW_MATCH.exec(raw);
  if (nm) return { kind: "info", text: `New match — you (${nm[1]}) vs ${nm[3]} (${nm[2]}) · seed ${nm[4]}` };
  if (/^\s/.test(raw)) return { kind: "event", text: cap(humanize(raw.trim())) };
  const m = /^(P0|P1|You|Opp): (.*)$/.exec(raw);
  if (m) {
    const mine = m[1] === "P0" || m[1] === "You";
    return { kind: mine ? "you" : "opp", who: mine ? "You" : "Opponent", text: humanize(m[2]!) };
  }
  return { kind: "info", text: humanize(raw) };
}

export function LogLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((raw, i) => {
        const f = formatLogLine(raw);
        return (
          <div key={i} className={`ll ll-${f.kind}`}>
            {f.who && <span className="llwho">{f.who}: </span>}
            {f.text}
          </div>
        );
      })}
    </>
  );
}
