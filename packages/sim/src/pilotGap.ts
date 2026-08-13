/**
 * Pilot-gap benchmark (tier 3, 2026-08-13).
 *
 * The piloted series (Div-vs-Evo m1-m4, Abj-vs-Div m5-m7, Evo-Abj m8-m15)
 * proved that bot-level winrates are LOWER BOUNDS on the losing school's
 * potential, not balance targets. This benchmark quantifies how far the bots still sit from
 * piloted play on those edges: for each matchup with a piloted reference,
 * run the bot-vs-bot matchup and print the gap. Re-run after every bot
 * improvement — the program's progress metric is this table's gaps closing.
 *
 *   npm run pilot-gap              # n=10 per edge (~30-60 min)
 *   npm run pilot-gap -- -n 30     # canonical-weight run
 *
 * References are PILOTED RECORDS (tiny n, directional): treat single-digit
 * game counts as "the line exists", not as a winrate estimate.
 */
import { runMatchup, type PlayableSchool } from "./report.ts";

interface Benchmark {
  /** The school a human/subagent pilot played. */
  pilotSide: PlayableSchool;
  opponent: PlayableSchool;
  seed: number;
  /** Piloted record for pilotSide (wins-losses) and where it's logged. */
  pilotRecord: { wins: number; losses: number; logs: string };
}

const BENCHMARKS: Benchmark[] = [
  {
    pilotSide: "Divination",
    opponent: "Evocation",
    seed: 300,
    pilotRecord: { wins: 4, losses: 0, logs: "playtests/2026-08-12-m1..m4" },
  },
  {
    pilotSide: "Abjuration",
    opponent: "Divination",
    seed: 200,
    pilotRecord: { wins: 3, losses: 0, logs: "playtests/2026-08-13-m5..m7" },
  },
  {
    pilotSide: "Abjuration",
    opponent: "Evocation",
    seed: 100,
    pilotRecord: { wins: 3, losses: 0, logs: "playtests/2026-08-13-m8..m10" },
  },
  // Evo side of the same edge: 2-3, both losses at the Reckoning wall (R10+);
  // m14/m15 are post-gating-fix re-runs of the m12/m13 seeds.
  {
    pilotSide: "Evocation",
    opponent: "Abjuration",
    seed: 100,
    pilotRecord: { wins: 2, losses: 3, logs: "playtests/2026-08-13-m11..m15" },
  },
];

function parseN(argv: string[]): number {
  const i = argv.findIndex((a) => a === "-n" || a === "--games");
  return i >= 0 ? Number(argv[i + 1] ?? 10) : 10;
}

function main(): void {
  const n = parseN(process.argv.slice(2));
  console.log(`Pilot-gap benchmark — greedy bots, ${n} games/edge, paired seats\n`);
  console.log("edge                       bot (pilot side)   piloted record   gap");
  console.log("-".repeat(72));
  for (const b of BENCHMARKS) {
    const stats = runMatchup({
      school1: b.pilotSide,
      school2: b.opponent,
      agent1: "greedy",
      agent2: "greedy",
      games: n,
      baseSeed: b.seed,
      paired: true,
      greedy: { rolloutTurns: 2 },
    });
    const botRate = stats.p1Wins / stats.games;
    const pilotRate = b.pilotRecord.wins / (b.pilotRecord.wins + b.pilotRecord.losses);
    const label = `${b.pilotSide.slice(0, 3)} vs ${b.opponent.slice(0, 3)} (s${b.seed})`;
    console.log(
      `${label.padEnd(27)}${(botRate * 100).toFixed(0).padStart(5)}%             ` +
        `${b.pilotRecord.wins}-${b.pilotRecord.losses} (${(pilotRate * 100).toFixed(0)}%)        ` +
        `${((pilotRate - botRate) * 100).toFixed(0).padStart(4)} pts`,
    );
  }
  console.log("\nGaps are directional (piloted n is tiny). A closing gap means the bots");
  console.log("are learning the piloted lines; see the balance journal for the ledger.");
}

main();
