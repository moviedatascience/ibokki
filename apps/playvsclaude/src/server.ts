/**
 * Local Ibokki play server — a real card-game board in the browser.
 *
 * Holds one match in memory. The human plays P0 in the browser (served at /).
 * Any side listed in `bots` is auto-played by the heuristic agent, so you can play
 * a full game solo vs the bot. The same endpoints also let an external agent (Claude)
 * drive a side via HTTP. Every state response is redacted to the requesting side, so
 * neither player sees the other's hand or face-down spells. Localhost only — no auth.
 *
 *   npm run play            # then open http://localhost:7777
 *   Agent API:  GET /api/state?side=1   and   POST /api/act?side=1  {"index":N}
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  apply,
  createGame,
  deckFor,
  isTerminal,
  legalActions,
  redact,
  type Action,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";
import { CARDS, COMPONENTS } from "@ibokki/cards";
import { describeAction, describeEvent, makeAgent, type Agent } from "@ibokki/sim";

const PORT = Number(process.env.PORT ?? 7777);
const HERE = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(HERE, "../public/index.html");

/** Static card catalog for the UI: id -> { name, school, type, level, cost, text }. */
interface CardInfo {
  name: string;
  school: string;
  type: string;
  level: number | null;
  cost: string | null;
  text: string;
}
const CARD_INFO: Record<string, CardInfo> = {};
for (const c of CARDS) {
  CARD_INFO[c.id] = { name: c.name, school: c.school, type: c.type, level: c.level, cost: c.costText, text: c.text };
}
for (const c of COMPONENTS) {
  const sym = "V".repeat(c.symbols.V) + "S".repeat(c.symbols.S) + "M".repeat(c.symbols.M);
  CARD_INFO[c.id] = { name: c.name, school: "Component", type: "Component", level: null, cost: sym, text: `Resource component — provides ${sym}.` };
}

type School = "Evocation" | "Abjuration" | "Divination";
const SCHOOLS: School[] = ["Evocation", "Abjuration", "Divination"];

interface Match {
  state: GameState;
  schools: [School, School];
  transcript: string[];
  bots: Set<PlayerId>;
  agents: Record<number, Agent>;
  /** Events produced since the last human action (for the client to animate). */
  recentEvents: GameEvent[];
}

let match: Match = newMatch("Evocation", "Abjuration", randomSeed(), [1]);

/**
 * Monotonic counter bumped on every state-mutating request (act/new). The client
 * animates `recentEvents` only when it sees a new epoch, so polling /api/state
 * (which leaves the epoch unchanged) never re-triggers the same animations.
 */
let actionEpoch = 0;

function randomSeed(): number {
  return Math.floor(Math.random() * 2_000_000_000);
}

function newMatch(s0: School, s1: School, seed: number, botSides: PlayerId[]): Match {
  const bots = new Set<PlayerId>(botSides);
  const agents: Record<number, Agent> = {};
  for (const side of bots) agents[side] = makeAgent("heuristic", seed + 1 + side);
  const m: Match = {
    state: createGame({ seed, players: [deckFor(s0), deckFor(s1)] }),
    schools: [s0, s1],
    transcript: [`New match: P0 ${s0} (you) vs P1 ${s1} (${bots.has(1) ? "bot" : "agent"}) — seed ${seed}`],
    bots,
    agents,
    recentEvents: [],
  };
  autoPlayBots(m);
  m.recentEvents = []; // don't animate the opening bot prepare
  return m;
}

/** Apply a concrete action (logging label + events into the transcript + recentEvents). */
function applyActionLogged(m: Match, side: PlayerId, action: Action): void {
  const label = describeAction(m.state, action);
  const { state, events } = apply(m.state, action);
  m.state = state;
  m.recentEvents.push(...events);
  m.transcript.push(`P${side}: ${label}`);
  for (const e of events) {
    const s = describeEvent(e);
    if (s) m.transcript.push(`   ${s}`);
  }
}

/** Apply the legal action at `index` for `side`. Returns an error string or null. */
function applyIndexLogged(m: Match, side: PlayerId, index: number): string | null {
  const legal = legalActions(m.state, side);
  if (index < 0 || index >= legal.length) return `invalid index ${index} (0..${legal.length - 1})`;
  applyActionLogged(m, side, legal[index]!);
  return null;
}

/** Let any bot-controlled side that holds priority play until it's a human's turn. */
function autoPlayBots(m: Match): void {
  let guard = 0;
  while (!isTerminal(m.state) && m.bots.has(m.state.priorityPlayer)) {
    const side = m.state.priorityPlayer;
    const legal = legalActions(m.state, side);
    if (legal.length === 0) break;
    const action = m.agents[side]!.chooseAction(redact(m.state, side), legal);
    applyActionLogged(m, side, action);
    if (++guard > 1000) break; // safety
  }
}

/** The card defId an action centers on (for mapping clicks to rendered cards). */
function actionCardDefId(state: GameState, side: PlayerId, action: Action): string | null {
  const p = state.players[side];
  switch (action.type) {
    case "prepareSpell":
      return p.spellbook.find((c) => c.iid === action.spellIid)?.defId ?? null;
    case "replacePrepared":
      return p.spellbook.find((c) => c.iid === action.spellIid)?.defId ?? null;
    case "attach":
      return p.hand.find((c) => c.iid === action.handIid)?.defId ?? null;
    case "playTrainer":
      return p.hand.find((c) => c.iid === action.handIid)?.defId ?? null;
    case "cast":
    case "castReaction":
      return p.prepared[action.preparedIndex]?.spell.defId ?? null;
    case "choose":
      return state.pendingChoice?.candidates.find((c) => c.iid === action.iid)?.defId ?? null;
    case "detach":
      return p.prepared[action.preparedIndex]?.attached.find((c) => c.iid === action.componentIid)?.defId ?? null;
    case "retractCast":
      return state.stack[state.stack.length - 1]?.defId ?? null;
    default:
      return null;
  }
}

/** Enriched legal action for the client: index + label + the fields needed to wire clicks. */
function legalForClient(state: GameState, side: PlayerId) {
  return legalActions(state, side).map((a, index) => ({
    index,
    type: a.type,
    label: describeAction(state, a),
    defId: actionCardDefId(state, side, a),
    preparedIndex: "preparedIndex" in a ? a.preparedIndex : null,
    handIid: "handIid" in a ? a.handIid : null,
  }));
}

function stateJson(m: Match, side: PlayerId): unknown {
  const st = m.state;
  const over = isTerminal(st);
  const yourTurn = !over && st.priorityPlayer === side && !m.bots.has(side);
  return {
    schools: m.schools,
    side,
    phase: st.phase,
    round: st.round,
    turnCount: st.turnCount,
    activePlayer: st.activePlayer,
    priorityPlayer: st.priorityPlayer,
    reactionWindow: st.stack.length > 0,
    yourTurn,
    gameOver: over,
    winner: st.winner,
    endReason: st.endReason,
    bots: [...m.bots],
    view: redact(st, side),
    legal: yourTurn ? legalForClient(st, side) : [],
    log: m.transcript.slice(-100),
    epoch: actionEpoch,
    events: m.recentEvents,
  };
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((res) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        res(data ? JSON.parse(data) : {});
      } catch {
        res({});
      }
    });
  });
}

function sendJson(res: ServerResponse, body: unknown, status = 200): void {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    if (req.method === "GET" && (path === "/" || path === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(readFileSync(HTML_PATH, "utf8")); // re-read per request so edits don't need a restart
      return;
    }

    if (req.method === "GET" && path === "/api/cards") {
      sendJson(res, CARD_INFO);
      return;
    }

    if (req.method === "GET" && path === "/api/state") {
      const side = (Number(url.searchParams.get("side")) === 1 ? 1 : 0) as PlayerId;
      sendJson(res, stateJson(match, side));
      return;
    }

    if (req.method === "POST" && path === "/api/act") {
      const side = (Number(url.searchParams.get("side")) === 1 ? 1 : 0) as PlayerId;
      const body = (await readBody(req)) as { index?: number; indices?: number[] };
      const indices = body.indices ?? (typeof body.index === "number" ? [body.index] : []);
      match.recentEvents = []; // fresh batch for this human action (+ any bot response)
      actionEpoch++;
      let error: string | null = null;
      for (const idx of indices) {
        if (isTerminal(match.state) || match.state.priorityPlayer !== side) break;
        error = applyIndexLogged(match, side, idx);
        if (error) break;
      }
      autoPlayBots(match); // let the bot respond
      sendJson(res, { ...(error ? { error } : {}), ...(stateJson(match, side) as object) });
      return;
    }

    if (req.method === "POST" && path === "/api/new") {
      const body = (await readBody(req)) as { p0?: School; p1?: School; seed?: number; bots?: number[] };
      const p0 = SCHOOLS.includes(body.p0 as School) ? (body.p0 as School) : "Evocation";
      const p1 = SCHOOLS.includes(body.p1 as School) ? (body.p1 as School) : "Abjuration";
      const botSides = (Array.isArray(body.bots) ? body.bots : [1]).filter((s): s is PlayerId => s === 0 || s === 1);
      match = newMatch(p0, p1, body.seed ?? randomSeed(), botSides);
      actionEpoch++;
      sendJson(res, stateJson(match, 0));
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  } catch (err) {
    sendJson(res, { error: String(err) }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Ibokki — open http://localhost:${PORT}  (you are P0; P1 is the bot by default)`);
});
