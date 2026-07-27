/**
 * Balance-report CLI.
 *
 *   npm run sim -- -n 2000 --p1 heuristic --p2 heuristic --s1 Evocation --s2 Abjuration
 *   npm run sim -- --matrix -n 500
 *   npm run sim -- -n 200 --p1 greedy --p2 greedy --paired --cards
 *   npm run sim -- -n 400 --deck1 Emberworks --deck2 my-deck.json --json out.json
 *
 * --matrix runs the full 3x3 school grid (the RPS-triangle check from the design doc).
 * --paired plays each seed twice with the seats swapped (variance reduction) — with
 * the same base seed, two --paired runs are directly comparable A/B measurements.
 * --cards prints per-card telemetry (cast counts, resolve rates, win rate when used).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { SPELLS, TRAINERS } from "@ibokki/cards";
import { implementedIds, presetDeck, validateDeck, type PlayerConfig } from "@ibokki/engine";
import type { AgentKind } from "./greedy.ts";
import {
  runMatchup,
  runSchoolMatrix,
  SCHOOLS,
  type PlayableSchool,
} from "./report.ts";
import { CardStatsCollector } from "./telemetry.ts";

function coverageLine(): string {
  const implemented = new Set(implementedIds());
  const spellsDone = SPELLS.filter((c) => implemented.has(c.id)).length;
  const trainersDone = TRAINERS.filter((c) => implemented.has(c.id)).length;
  return `Effects implemented: ${spellsDone}/${SPELLS.length} spells, ${trainersDone}/${TRAINERS.length} trainers`;
}

/** A deck spec: a preset name (Emberworks/Bastion/Riptide) or a path to a deck JSON file. */
function resolveDeckSpec(spec: string): { deck: PlayerConfig; label: string } {
  const preset = presetDeck(spec);
  if (preset) return { deck: preset, label: preset.name };
  const parsed = JSON.parse(readFileSync(spec, "utf8")) as { name?: string; spellbook: string[]; resourceDeck: string[] };
  if (!Array.isArray(parsed.spellbook) || !Array.isArray(parsed.resourceDeck)) {
    throw new Error(`${spec}: deck JSON must have "spellbook" and "resourceDeck" arrays of card ids`);
  }
  const def = { name: parsed.name ?? spec, spellbook: parsed.spellbook, resourceDeck: parsed.resourceDeck };
  const v = validateDeck(def);
  if (!v.ok) throw new Error(`${def.name} violates deck rules: ${v.errors.map((e) => e.message).join("; ")}`);
  return { deck: def, label: def.name };
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
  paired: boolean;
  cards: boolean;
  json: string | undefined;
  deck1: string | undefined;
  deck2: string | undefined;
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
    paired: false,
    cards: false,
    json: undefined,
    deck1: undefined,
    deck2: undefined,
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
      case "--paired":
        args.paired = true;
        break;
      case "--cards":
        args.cards = true;
        break;
      case "--json":
        args.json = next();
        break;
      case "--deck1":
        args.deck1 = next();
        break;
      case "--deck2":
        args.deck2 = next();
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
    console.log(`School win-rate matrix — ${args.n} games/cell, agent="${args.p1}" (mirror)${args.paired ? ", paired seats" : ""}`);
    console.log("Rows = P1 school, Cols = P2 school, cell = P1 win rate\n");
    const matrix = runSchoolMatrix(args.p1, args.n, args.seed, args.hp, args.paired);

    const header = "            " + SCHOOLS.map((s) => s.slice(0, 8).padStart(9)).join(" ");
    console.log(header);
    for (const s1 of SCHOOLS) {
      const row = SCHOOLS.map((s2) => pct(matrix[s1][s2])).join(" ");
      console.log(s1.padEnd(12) + row);
    }
    console.log("\n(Design intent: Evo>Div, Div>Abj, Abj>Evo — the rock-paper-scissors triangle.)");
    console.log(coverageLine());
    if (args.p1 === "heuristic" || args.p1 === "random") {
      console.log(
        "NOTE: the heuristic bot is a greedy one-ply policy with no card-interplay model —\n" +
          "its matrix is a coarse smoke signal only. Run with --p1 greedy for the\n" +
          "simulation-scored agent (slower, but prices reactions/wards/dooms via the engine).",
      );
    }
    if (args.json) {
      writeFileSync(args.json, JSON.stringify({ mode: "matrix", agent: args.p1, games: args.n, seed: args.seed, paired: args.paired, matrix }, null, 2));
      console.log(`Wrote ${args.json}`);
    }
    return;
  }

  const d1 = args.deck1 ? resolveDeckSpec(args.deck1) : undefined;
  const d2 = args.deck2 ? resolveDeckSpec(args.deck2) : undefined;
  const collector = args.cards || args.json ? new CardStatsCollector() : undefined;
  const stats = runMatchup({
    school1: args.s1,
    school2: args.s2,
    agent1: args.p1,
    agent2: args.p2,
    games: args.n,
    baseSeed: args.seed,
    paired: args.paired,
    ...(args.hp !== undefined ? { startingHp: args.hp } : {}),
    ...(d1 ? { deck1: d1.deck } : {}),
    ...(d2 ? { deck2: d2.deck } : {}),
    ...(collector ? { collector } : {}),
  });

  const label1 = d1 ? d1.label : args.s1;
  const label2 = d2 ? d2.label : args.s2;
  console.log(`Matchup: P1 ${label1} (${args.p1}) vs P2 ${label2} (${args.p2})${args.paired ? " [paired seats]" : ""}`);
  console.log(`Games:   ${stats.games}`);
  console.log(`P1 wins: ${stats.p1Wins} (${pct(stats.p1Wins / stats.games).trim()})`);
  console.log(`P2 wins: ${stats.p2Wins} (${pct(stats.p2Wins / stats.games).trim()})`);
  console.log(`Draws:   ${stats.draws}`);
  console.log(`End reasons: ${JSON.stringify(stats.endReasons)}`);
  console.log(`Avg rounds: ${stats.avgRounds.toFixed(2)}   Avg turns: ${stats.avgTurns.toFixed(1)}`);
  if (collector && args.cards) {
    console.log("\n" + collector.table());
  }
  if (args.json) {
    writeFileSync(
      args.json,
      JSON.stringify(
        { mode: "matchup", args: { ...args }, stats, cards: collector ? collector.toJSON() : undefined },
        null,
        2,
      ),
    );
    console.log(`Wrote ${args.json}`);
  }
}

main();
