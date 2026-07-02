/**
 * Ibokki playtest MCP server.
 *
 * Exposes the deterministic engine over MCP so Claude can play matches (vs a bot
 * or controlling both sides) and run balance simulations. Register it with Claude
 * Code via .mcp.json (see packages/mcp/README or the repo README).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getCard, CARDS } from "@ibokki/cards";
import { runMatchup } from "@ibokki/sim";
import { act, autoPlayBots, createMatch, getMatch, renderState, savePlaytest } from "./matches.ts";

const SCHOOL = z.enum(["Evocation", "Abjuration", "Divination"]);
const CONTROLS = z.enum(["0", "1", "both"]);

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

const server = new McpServer({ name: "ibokki-playtest", version: "0.1.0" });

server.tool(
  "new_match",
  "Start a new Ibokki match between two schools. `controls` picks which side(s) you (Claude) play: \"0\", \"1\", or \"both\". Returns the opening position and your numbered legal actions.",
  {
    school1: SCHOOL.describe("Player 0's school"),
    school2: SCHOOL.describe("Player 1's school"),
    controls: CONTROLS.optional().describe("Which side you control (default \"0\")"),
    seed: z.number().int().optional().describe("Deterministic seed (default random)"),
  },
  async ({ school1, school2, controls, seed }) => {
    const match = createMatch(school1, school2, seed ?? Math.floor(Math.random() * 2_000_000_000), controls ?? "0");
    autoPlayBots(match);
    const header = `Started ${match.id}: P0=${school1} vs P1=${school2}; you control ${controls ?? "0"}.`;
    return text(`${header}\n${renderState(match)}`);
  },
);

server.tool(
  "match_state",
  "Show the current position and numbered legal actions for a match.",
  { matchId: z.string() },
  async ({ matchId }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    return text(renderState(match));
  },
);

server.tool(
  "act",
  "Take the legal action at the given index (from the most recent state listing). Pass an optional `note` to record your reasoning in the playtest log. The bot side then auto-plays until it is your decision again. Returns the action log and the new position.",
  { matchId: z.string(), index: z.number().int(), note: z.string().optional() },
  async ({ matchId, index, note }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    return text(act(match, index, note));
  },
);

server.tool(
  "save_playtest",
  "Write this match's full transcript (moves, events, and your notes) plus an optional written analysis to a markdown file in playtests/. Returns the saved path.",
  { matchId: z.string(), analysis: z.string().optional() },
  async ({ matchId, analysis }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    const path = savePlaytest(match, analysis);
    return text(`Saved playtest log to ${path}`);
  },
);

server.tool(
  "simulate",
  "Run a batch of bot-vs-bot games and report win rates, end reasons, and average length. Useful for quick balance checks.",
  {
    school1: SCHOOL,
    school2: SCHOOL,
    games: z.number().int().min(1).max(20000).optional().describe("default 1000"),
    agent: z.enum(["random", "heuristic"]).optional().describe("default heuristic"),
    hp: z.number().int().optional().describe("starting HP (default 30)"),
    seed: z.number().int().optional(),
  },
  async ({ school1, school2, games, agent, hp, seed }) => {
    const stats = runMatchup({
      school1,
      school2,
      agent1: agent ?? "heuristic",
      agent2: agent ?? "heuristic",
      games: games ?? 1000,
      baseSeed: seed ?? 1,
      ...(hp !== undefined ? { startingHp: hp } : {}),
    });
    const pct = (x: number) => ((x / stats.games) * 100).toFixed(1) + "%";
    return text(
      `${school1} (P1) vs ${school2} (P2), ${stats.games} games, agent=${agent ?? "heuristic"}\n` +
        `P1 wins: ${stats.p1Wins} (${pct(stats.p1Wins)})\n` +
        `P2 wins: ${stats.p2Wins} (${pct(stats.p2Wins)})\n` +
        `Draws:   ${stats.draws}\n` +
        `End reasons: ${JSON.stringify(stats.endReasons)}\n` +
        `Avg rounds: ${stats.avgRounds.toFixed(2)} | Avg turns: ${stats.avgTurns.toFixed(1)}`,
    );
  },
);

server.tool(
  "card",
  "Look up a card's rules text by id (e.g. EVO-017), or list a school/type with no id.",
  {
    id: z.string().optional(),
    school: SCHOOL.optional(),
    type: z.enum(["Spell", "Reaction", "Item", "Gambit"]).optional(),
  },
  async ({ id, school, type }) => {
    if (id) {
      const c = getCard(id);
      if (!c) return text(`No card ${id}.`);
      return text(
        `${c.name} [${c.id}] — ${c.school} ${c.type}${c.level ? ` L${c.level}` : ""}${c.costText ? ` cost ${c.costText}` : ""}\n${c.text}`,
      );
    }
    const list = CARDS.filter((c) => (!school || c.school === school) && (!type || c.type === type));
    return text(list.map((c) => `${c.id} ${c.name}${c.costText ? ` (${c.costText})` : ""}`).join("\n") || "(none)");
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is the JSON-RPC channel; log to stderr only.
  console.error("ibokki-playtest MCP server running on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
