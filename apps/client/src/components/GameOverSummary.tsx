import type { MatchState } from "../api.ts";
import { LogLines } from "./LogLines.tsx";

const END_REASON: Record<string, string> = {
  hp: "hit points reduced to 0",
  deckout: "Resource Deck ran out",
  "turn-limit": "turn limit reached",
};

interface SideStats {
  cast: number;
  reactions: number;
  trainers: number;
  damageTaken: number;
  healed: number;
}

/**
 * Tally per-player stats from the match transcript. The transcript's event lines are the
 * describeEvent() strings from @ibokki/sim (e.g. "P0 takes 3 damage"), indented under each action.
 */
function tally(log: string[]): [SideStats, SideStats] {
  const stats: [SideStats, SideStats] = [
    { cast: 0, reactions: 0, trainers: 0, damageTaken: 0, healed: 0 },
    { cast: 0, reactions: 0, trainers: 0, damageTaken: 0, healed: 0 },
  ];
  for (const raw of log) {
    const line = raw.trim();
    const m = /^P([01]) (takes|burns for|heals|casts|reacts with|plays) ?(\d+)?/.exec(line);
    if (!m) continue;
    const s = stats[Number(m[1]) as 0 | 1]!;
    const n = m[3] ? parseInt(m[3], 10) : 0;
    if (m[2] === "takes" || m[2] === "burns for") s.damageTaken += n;
    else if (m[2] === "heals") s.healed += n;
    else if (m[2] === "casts") s.cast++;
    else if (m[2] === "reacts with") s.reactions++;
    else if (m[2] === "plays") s.trainers++;
  }
  return stats;
}

/** Full-board overlay once the game ends: result, per-player stats, and the match log. */
export function GameOverSummary({ state, onDismiss, onRematch }: { state: MatchState | null; onDismiss: () => void; onRematch: () => void }) {
  if (!state || !state.gameOver) return null;

  const verdict = state.winner === null ? "Draw" : state.winner === 0 ? "You win! 🎉" : "Opponent wins";
  const reason = state.endReason ? (END_REASON[state.endReason] ?? state.endReason) : "";
  const [you, opp] = tally(state.log);
  const rows: [string, number | string, number | string][] = [
    ["Final HP", state.view.self.hp, state.view.opponent.hp],
    ["Level reached", state.view.self.level, state.view.opponent.level],
    ["Spells cast", you.cast, opp.cast],
    ["Reactions", you.reactions, opp.reactions],
    ["Items / Gambits", you.trainers, opp.trainers],
    ["Damage taken", you.damageTaken, opp.damageTaken],
    ["HP healed", you.healed, opp.healed],
    ["Deck remaining", state.view.self.resourceDeckCount, state.view.opponent.resourceDeckCount],
  ];

  return (
    <div className="gameover">
      <div className="gopanel">
        <h2 className={state.winner === 0 ? "win" : state.winner === 1 ? "loss" : ""}>{verdict}</h2>
        <p className="goreason">
          {reason && `Game over — ${reason}. `}
          {state.round} round{state.round === 1 ? "" : "s"}, {state.turnCount} turns.
        </p>
        <table className="gostats">
          <thead>
            <tr>
              <th></th>
              <th>You · {state.schools[0]}</th>
              <th>Opponent · {state.schools[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, a, b]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="golog">
          <LogLines lines={state.log} />
        </div>
        <div className="gorow">
          <button className="primary" onClick={onRematch}>
            Rematch
          </button>
          <button onClick={onDismiss}>View final board</button>
        </div>
      </div>
    </div>
  );
}
