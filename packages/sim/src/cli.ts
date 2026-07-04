/**
 * Balance-report CLI.
 *
 *   npm run sim -- -n 2000 --p1 heuristic --p2 heuristic --s1 Evocation --s2 Abjuration
 *   npm run sim -- --matrix -n 500
 *
 * --matrix runs the full 3x3 school grid (the RPS-triangle check from the design doc).
 */
import { SPELLS, TRAINERS } from "@ibokki/cards";
import { implementedIds } from "@ibokki/engine";
import type { AgentKind } from "./agent.ts";
import {
  runMatchup,
  runSchoolMatrix,
  SCHOOLS,
  type PlayableSchool,
} from "./report.ts";

function coverageLine(): string {
  const implemented = new Set(implementedIds());
  const spellsDone = SPELLS.filter((c) => implemented.has(c.id)).length;
  const trainersDone = TRAINERS.filter((c) => implemented.has(c.id)).length;
  return `Effects implemented: ${spellsDone}/${SPELLS.length} spells, ${trainersDone}/${TRAINERS.length} trainers`;
}

interface Args {
  n: number;
  p1: AgentKind;
  p2: AgentKind;
  s1: PlayableSchool;
  s2: PlayableSchool;
  seed: number;
  hp: number | undefined;
  matrix: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    n: 1000,
    p1: "heuristic",
    p2: "heuristic",
    s1: "Evocation",
    s2: "Abjuration",
    seed: 1,
    hp: undefined,
    matrix: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = (): string => argv[++i] ?? "";
    switch (a) {
      case "-n":
      case "--games":
        args.n = Number(next());
        break;
      case "--p1":
        args.p1 = next() as AgentKind;
        break;
      case "--p2":
        args.p2 = next() as AgentKind;
        break;
      case "--s1":
        args.s1 = next() as PlayableSchool;
        break;
      case "--s2":
        args.s2 = next() as PlayableSchool;
        break;
      case "--seed":
        args.seed = Number(next());
        break;
      case "--hp":
        args.hp = Number(next());
        break;
      case "--matrix":
        args.matrix = true;
        break;
      default:
        if (a && a.startsWith("-")) console.warn(`Unknown flag: ${a}`);
    }
  }
  return args;
}

function pct(x: number): string {
  return (x * 100).toFixed(1).padStart(5) + "%";
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.matrix) {
    console.log(`School win-rate matrix — ${args.n} games/cell, agent="${args.p1}" (mirror)`);
    console.log("Rows = P1 school, Cols = P2 school, cell = P1 win rate\n");
    const matrix = runSchoolMatrix(args.p1, args.n, args.seed, args.hp);

    const header = "            " + SCHOOLS.map((s) => s.slice(0, 8).padStart(9)).join(" ");
    console.log(header);
    for (const s1 of SCHOOLS) {
      const row = SCHOOLS.map((s2) => pct(matrix[s1][s2])).join(" ");
      console.log(s1.padEnd(12) + row);
    }
    console.log("\n(Design intent: Evo>Div, Div>Abj, Abj>Evo — the rock-paper-scissors triangle.)");
    console.log(coverageLine());
    console.log(
      "NOTE: all spells + Reactions are implemented. The heuristic bot fuels its\n" +
        "Reactions and fires the cheapest one whose cost the threat's value beats\n" +
        "(economic timing), but it can't pilot Divination's card advantage or plan\n" +
        "multi-turn defenses, so the intended triangle (Abj>Evo, Div>Abj) does not\n" +
        "emerge from naive self-play. Surfacing it needs a stronger agent — e.g.\n" +
        "Claude via the MCP server (npm run mcp).",
    );
    return;
  }

  const stats = runMatchup({
    school1: args.s1,
    school2: args.s2,
    agent1: args.p1,
    agent2: args.p2,
    games: args.n,
    baseSeed: args.seed,
    ...(args.hp !== undefined ? { startingHp: args.hp } : {}),
  });

  console.log(`Matchup: P1 ${args.s1} (${args.p1}) vs P2 ${args.s2} (${args.p2})`);
  console.log(`Games:   ${stats.games}`);
  console.log(`P1 wins: ${stats.p1Wins} (${pct(stats.p1Wins / stats.games).trim()})`);
  console.log(`P2 wins: ${stats.p2Wins} (${pct(stats.p2Wins / stats.games).trim()})`);
  console.log(`Draws:   ${stats.draws}`);
  console.log(`End reasons: ${JSON.stringify(stats.endReasons)}`);
  console.log(`Avg rounds: ${stats.avgRounds.toFixed(2)}   Avg turns: ${stats.avgTurns.toFixed(1)}`);
}

main();
