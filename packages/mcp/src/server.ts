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
import { act, autoplay, autoPlayBots, createMatch, getMatch, pvpState, renderState, savePlaytest } from "./matches.ts";
import type { PlayerId } from "@ibokki/engine";

const SCHOOL = z.enum(["Evocation", "Abjuration", "Divination"]);
const CONTROLS = z.enum(["0", "1", "both", "pvp"]);
const SEAT = z.enum(["0", "1"]);
const asSeat = (s?: "0" | "1"): PlayerId | undefined => (s === undefined ? undefined : (Number(s) as PlayerId));

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

const server = new McpServer({ name: "ibokki-playtest", version: "0.1.0" });

server.tool(
  "new_match",
  "Start a new Ibokki match between two schools. `controls` picks which side(s) you (Claude) play: \"0\", \"1\", \"both\", or \"pvp\" (two separately-sighted pilots share the match: every act/match_state call then REQUIRES a `seat`, views are redacted per seat, autoplay is disabled). `deck1`/`deck2` optionally override a side's deck: a preset name (Emberworks/Bastion/Riptide) or a JSON DeckDefinition {name?, spellbook, resourceDeck} validated against the construction rules. `bot` picks the strength of the non-controlled side (default heuristic; greedy is much stronger, search strongest but ~1s/move; unused in pvp). Returns the opening position and your numbered legal actions.",
  {
    school1: SCHOOL.describe("Player 0's school"),
    school2: SCHOOL.describe("Player 1's school"),
    controls: CONTROLS.optional().describe("Which side you control (default \"0\")"),
    seed: z.number().int().optional().describe("Deterministic seed (default random)"),
    deck1: z.string().optional().describe("Player 0's deck: preset name or JSON DeckDefinition (default: school archetype)"),
    deck2: z.string().optional().describe("Player 1's deck: preset name or JSON DeckDefinition (default: school archetype)"),
    bot: z.enum(["heuristic", "greedy", "search"]).optional().describe("Bot strength for the side(s) you don't control (default heuristic)"),
    verbose: z.boolean().optional().describe("Full board render instead of the compact one (all tools default to compact)"),
  },
  async ({ school1, school2, controls, seed, deck1, deck2, bot, verbose }) => {
    let match;
    try {
      match = createMatch(school1, school2, seed ?? Math.floor(Math.random() * 2_000_000_000), controls ?? "0", deck1, deck2, bot);
    } catch (err) {
      return text(`Could not start match: ${err instanceof Error ? err.message : String(err)}`);
    }
    autoPlayBots(match);
    const header = `Started ${match.id}: P0=${match.labels[0]} vs P1=${match.labels[1]}; you control ${controls ?? "0"}.`;
    const legend = verbose
      ? ""
      : "Compact legend — prep `slot:DEF(cost)[attached]flag`: c=cast, S=sealed, ??=face-down; doom `4!@2t`=4 dmg (!=pierce) in 2 turns; act by `index` or stable `slug`; `card` tool for rules text; `verbose:true` for the full board.\n";
    return text(`${header}\n${legend}${renderState(match, verbose)}`);
  },
);

server.tool(
  "match_state",
  "Show the current position and numbered legal actions for a match. In a pvp match, pass your `seat`: while the other pilot is deciding this returns a single cheap WAITING line (poll it); when it is your decision you get the transcript delta since your last look plus your redacted board.",
  { matchId: z.string(), verbose: z.boolean().optional(), seat: SEAT.optional().describe("your seat in a pvp match") },
  async ({ matchId, verbose, seat }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    if (match.controls === "pvp") {
      const s = asSeat(seat);
      if (s === undefined) return text(`This is a PILOT-vs-PILOT match — pass your seat ("0" or "1").`);
      return text(pvpState(match, s));
    }
    return text(renderState(match, verbose));
  },
);

server.tool(
  "act",
  "Take a legal action by `index` (from the most recent listing) or by stable `slug` (never shifts between listings — prefer it when acting on an older listing). Pass an optional `note` to record your reasoning in the playtest log. The bot side then auto-plays until it is your decision again. Returns the action log and the new position.",
  {
    matchId: z.string(),
    index: z.number().int().optional(),
    slug: z.string().optional().describe("Stable action id from the listing, e.g. cast-evo-017"),
    note: z.string().optional(),
    verbose: z.boolean().optional(),
    seat: SEAT.optional().describe("your seat in a pvp match (required there; the call is rejected when it is not your decision)"),
  },
  async ({ matchId, index, slug, note, verbose, seat }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    if (index === undefined && slug === undefined) return text("Pass `index` or `slug`.");
    return text(act(match, index, note, slug, verbose, asSeat(seat)));
  },
);

server.tool(
  "autoplay",
  "Hand your controlled side(s) to a bot pilot until a stop condition, so you spend tokens only on decisions that matter. `until`: roundEnd (default — next round's prepare phase), myTurn (your next main turn), reactionWindow (you can actually react to something), choice (a look/loot/scry pick of yours), gameOver (play it out). Stops at game over regardless. Returns what happened plus the new position.",
  {
    matchId: z.string(),
    until: z.enum(["gameOver", "roundEnd", "reactionWindow", "choice", "myTurn"]).optional().describe("default roundEnd"),
    bot: z.enum(["heuristic", "greedy", "search"]).optional().describe("pilot strength for YOUR side (default greedy)"),
    maxPlies: z.number().int().min(1).max(2000).optional().describe("safety cap on pilot decisions (default 400)"),
    verbose: z.boolean().optional(),
  },
  async ({ matchId, until, bot, maxPlies, verbose }) => {
    const match = getMatch(matchId);
    if (!match) return text(`No match ${matchId}.`);
    return text(autoplay(match, until ?? "roundEnd", bot ?? "greedy", maxPlies ?? 400, verbose));
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
    agent: z
      .enum(["random", "heuristic", "greedy", "search"])
      .optional()
      .describe(
        "default heuristic; greedy = simulation-scored bot (~10s/game — keep games ≤ 200); search = ISMCTS (~1s/move, minutes/game — keep games ≤ 10, spot checks only)",
      ),
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
