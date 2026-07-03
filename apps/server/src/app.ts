/**
 * Ibokki online server — the M5 vertical slice.
 *
 * Authoritative model: clients send action *intents* ({t:"act", indices}); the
 * server validates them against `legalActions`, applies them via the engine, and
 * pushes each seat a `MatchStatePayload` built by @ibokki/protocol — redacted to
 * that viewer and with all PlayerIds remapped so 0 = "you" (the client renders
 * itself at the bottom of the board). The full GameState never leaves this process.
 *
 * Rooms: P0 creates one and gets a 5-letter join code; P1 joins with the code.
 * Each seat gets a secret token; a dropped tab can `rejoin` with code+token and
 * resume from its redacted snapshot. No accounts, no matchmaking — two browser
 * tabs playing a full network match is the whole point of the slice.
 *
 * This module is the wiring (`createOnlineServer()`); `server.ts` is the
 * listening entry point (`npm run online`, ws://localhost:7788/ws).
 */
import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from "node:http";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";
import {
  apply,
  createGame,
  isTerminal,
  legalActions,
  presetDeck,
  PRESET_SCHOOLS,
  validateDeck,
  type Action,
  type DeckDefinition,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";
import {
  actionLabelFor,
  buildCardCatalog,
  buildMatchState,
  eventForViewer,
  type ClientMessage,
  type DeckChoice,
  type SchoolName,
  type ServerMessage,
} from "@ibokki/protocol";
import { describeEvent } from "@ibokki/sim";
import { Db } from "./db.ts";
import { createMailer, type Mailer } from "./mail.ts";
import { handleApi, oidcFromEnv, userFromRequest, type ApiContext, type OidcConfig } from "./api.ts";

const CATALOG = buildCardCatalog();

/** Join codes avoid ambiguous glyphs (0/O, 1/I/L). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

interface Seat {
  /** Secret rejoin token, known only to this player's tab. */
  token: string;
  /** Display label (preset name or the user's deck name). */
  deckName: string;
  deck: Pick<DeckDefinition, "spellbook" | "resourceDeck">;
  ws: WebSocket | null;
}

interface Room {
  code: string;
  seats: [Seat, Seat | null];
  /** Null until both seats are filled. */
  state: GameState | null;
  /** Per-viewer transcripts — labels are redacted for the non-actor. */
  logs: [string[], string[]];
  epoch: number;
  /** Raw events since the last act batch; redacted per viewer at push time. */
  recentEvents: GameEvent[];
  rematchVotes: Set<PlayerId>;
  /** For idle-room cleanup. */
  lastActivity: number;
}

const rooms = new Map<string, Room>();

function newCode(): string {
  for (;;) {
    let code = "";
    for (let i = 0; i < 5; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    if (!rooms.has(code)) return code;
  }
}

function newSeed(): number {
  return randomBytes(4).readUInt32BE(0) % 2_000_000_000;
}

function send(ws: WebSocket | null, msg: ServerMessage): void {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

function deckNamesOf(room: Room): [string, string] {
  return [room.seats[0].deckName, room.seats[1]?.deckName ?? "?"];
}

/**
 * Resolve which deck a create/join brings: a saved deck by id (must belong to
 * the session's user and still be legal) or a preset by name; the legacy
 * `school` field maps to that school's archetype preset.
 */
function resolveDeck(
  db: Db,
  msg: { school?: SchoolName; deck?: DeckChoice },
  userId: number | undefined,
): { name: string; deck: Pick<DeckDefinition, "spellbook" | "resourceDeck"> } | { error: string } {
  const choice = msg.deck ?? {};
  if (choice.deckId !== undefined) {
    if (userId === undefined) return { error: "sign in to play a saved deck" };
    const row = db.deckById(choice.deckId);
    if (!row || row.user_id !== userId) return { error: "no such deck" };
    const deck = {
      name: row.name,
      spellbook: JSON.parse(row.spellbook) as string[],
      resourceDeck: JSON.parse(row.resource_deck) as string[],
    };
    const v = validateDeck(deck); // never trust a stored deck at match start
    if (!v.ok) return { error: `deck "${row.name}" is no longer legal: ${v.errors[0]!.message}` };
    return { name: row.name, deck };
  }
  const byLegacySchool = msg.school
    ? Object.entries(PRESET_SCHOOLS).find(([, school]) => school === msg.school)?.[0]
    : undefined;
  const presetName = choice.preset ?? byLegacySchool ?? "Emberworks";
  const preset = presetDeck(presetName);
  if (!preset) return { error: `unknown preset deck "${presetName}"` };
  return { name: preset.name, deck: preset };
}

function startMatch(room: Room): void {
  const seed = newSeed();
  const [d0, d1] = deckNamesOf(room);
  room.state = createGame({ seed, players: [room.seats[0].deck, room.seats[1]!.deck] });
  room.recentEvents = [];
  room.rematchVotes.clear();
  const intro = `Match start: ${d0} vs ${d1} — room ${room.code}, seed ${seed}`;
  room.logs = [[intro], [intro]];
  room.epoch++;
}

/** Push the current frame to one seat (viewer-relative, redacted). */
function pushState(room: Room, side: PlayerId, error?: string): void {
  const seat = room.seats[side];
  if (!seat?.ws || !room.state) return;
  const state = buildMatchState(
    {
      state: room.state,
      schools: deckNamesOf(room),
      bots: [],
      log: room.logs[side],
      epoch: room.epoch,
      events: room.recentEvents,
    },
    side,
    { relative: true },
  );
  send(seat.ws, { t: "state", state, ...(error ? { error } : {}) });
}

function pushBoth(room: Room): void {
  pushState(room, 0);
  pushState(room, 1);
}

/** Apply one action for `side`, appending per-viewer transcript lines. */
function applyAction(room: Room, side: PlayerId, action: Action): void {
  const state = room.state!;
  const labels: [string, string] = [actionLabelFor(0, state, action), actionLabelFor(1, state, action)];
  const { state: next, events } = apply(state, action);
  room.state = next;
  room.recentEvents.push(...events);
  for (const viewer of [0, 1] as PlayerId[]) {
    room.logs[viewer].push(`${side === viewer ? "You" : "Opp"}: ${labels[viewer]}`);
    for (const e of events) {
      // Describe the viewer-relative, redacted event so "P0" always means "you"
      // in that player's log and hidden identities stay hidden.
      const line = describeEvent(eventForViewer(e, viewer, true) as GameEvent);
      if (line) room.logs[viewer].push(`   ${line}`);
    }
  }
}

/** Handle {t:"act"} — validate priority + indices, apply, broadcast. */
function handleAct(room: Room, side: PlayerId, indices: number[]): void {
  if (!room.state) {
    pushError(room.seats[side]?.ws ?? null, "waiting for an opponent to join");
    return;
  }
  room.recentEvents = [];
  room.epoch++;
  room.lastActivity = Date.now();
  let error: string | null = null;
  for (const idx of indices) {
    if (isTerminal(room.state) || room.state.priorityPlayer !== side) break;
    const legal = legalActions(room.state, side);
    if (!Number.isInteger(idx) || idx < 0 || idx >= legal.length) {
      error = `invalid action index ${idx} (0..${legal.length - 1})`;
      break;
    }
    applyAction(room, side, legal[idx]!);
  }
  pushState(room, side, error ?? undefined);
  pushState(room, (side ^ 1) as PlayerId);
}

function handleRematch(room: Room, side: PlayerId): void {
  if (!room.state || !isTerminal(room.state)) return;
  room.rematchVotes.add(side);
  room.lastActivity = Date.now();
  if (room.rematchVotes.size === 2) {
    startMatch(room);
    pushBoth(room);
  } else {
    // Let the other player know a rematch is on offer via their log.
    const other = (side ^ 1) as PlayerId;
    room.logs[other].push("Opp: wants a rematch — hit Rematch to accept");
    room.logs[side].push("You: rematch requested — waiting for opponent");
    pushBoth(room);
  }
}

function pushError(ws: WebSocket | null, message: string): void {
  send(ws, { t: "error", message });
}

/** The (room, side) a connected socket is seated at. */
const seatBySocket = new WeakMap<WebSocket, { room: Room; side: PlayerId }>();

function seatSocket(room: Room, side: PlayerId, ws: WebSocket): void {
  const seat = room.seats[side]!;
  if (seat.ws && seat.ws !== ws) seat.ws.close(4000, "seat taken over by a new connection");
  seat.ws = ws;
  seatBySocket.set(ws, { room, side });
  send(room.seats[(side ^ 1) as PlayerId]?.ws ?? null, { t: "presence", opponentConnected: true });
}

function handleMessage(ws: WebSocket, msg: ClientMessage, db: Db, userId: number | undefined): void {
  switch (msg.t) {
    case "create": {
      const resolved = resolveDeck(db, msg, userId);
      if ("error" in resolved) return pushError(ws, resolved.error);
      const room: Room = {
        code: newCode(),
        seats: [{ token: randomUUID(), deckName: resolved.name, deck: resolved.deck, ws: null }, null],
        state: null,
        logs: [[], []],
        epoch: 0,
        recentEvents: [],
        rematchVotes: new Set(),
        lastActivity: Date.now(),
      };
      rooms.set(room.code, room);
      seatSocket(room, 0, ws);
      send(ws, { t: "created", code: room.code, side: 0, token: room.seats[0].token, catalog: CATALOG });
      return;
    }
    case "join": {
      const room = rooms.get((msg.code ?? "").toUpperCase().trim());
      if (!room) return pushError(ws, `no room with code ${msg.code}`);
      if (room.seats[1]) return pushError(ws, "room is full");
      const resolved = resolveDeck(db, msg, userId);
      if ("error" in resolved) return pushError(ws, resolved.error);
      room.seats[1] = { token: randomUUID(), deckName: resolved.name, deck: resolved.deck, ws: null };
      seatSocket(room, 1, ws);
      send(ws, { t: "joined", code: room.code, side: 1, token: room.seats[1].token, catalog: CATALOG });
      startMatch(room);
      pushBoth(room);
      // The creator has been waiting — tell them their opponent is here.
      send(room.seats[0].ws, { t: "presence", opponentConnected: true });
      return;
    }
    case "rejoin": {
      const room = rooms.get((msg.code ?? "").toUpperCase().trim());
      if (!room) return pushError(ws, "no seat matches that code/token");
      const idx = room.seats.findIndex((s) => s?.token === msg.token);
      if (idx !== 0 && idx !== 1) return pushError(ws, "no seat matches that code/token");
      const side = idx as PlayerId;
      seatSocket(room, side, ws);
      send(ws, { t: "joined", code: room.code, side, token: msg.token, catalog: CATALOG });
      if (room.state) pushState(room, side);
      const opp = room.seats[(side ^ 1) as PlayerId];
      send(ws, { t: "presence", opponentConnected: !!opp?.ws });
      return;
    }
    case "act": {
      const at = seatBySocket.get(ws);
      if (!at) return pushError(ws, "not seated in a room");
      handleAct(at.room, at.side, Array.isArray(msg.indices) ? msg.indices : []);
      return;
    }
    case "rematch": {
      const at = seatBySocket.get(ws);
      if (!at) return pushError(ws, "not seated in a room");
      handleRematch(at.room, at.side);
      return;
    }
    default:
      pushError(ws, `unknown message type`);
  }
}

// Sweep rooms idle for an hour (both tabs gone or match abandoned).
const SWEEP_MS = 60_000;
const IDLE_MS = 60 * 60_000;

export interface ServerOptions {
  /** SQLite file (":memory:" for tests). Default: env IBOKKI_DB or ./data/ibokki.db. */
  dbFile?: string;
  /** Public origin used in mail links. Default: env IBOKKI_BASE_URL or http://localhost:7788. */
  baseUrl?: string;
  /** Mark cookies Secure (behind TLS). Default: env IBOKKI_SECURE_COOKIES === "1". */
  secureCookies?: boolean;
  /** Injectable for tests; defaults to the ProtonMail SMTP / console mailer. */
  mailer?: Mailer;
  /** SSO against the ibokki.com site; defaults to IBOKKI_OIDC_* env vars. */
  oidc?: OidcConfig;
}

export interface OnlineServer {
  http: HttpServer;
  db: Db;
}

// ---- static client (production single-process deploy) ----

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * Serve the built web client (vite build output) when present, so production
 * is one process behind Caddy: /api + /ws + the app itself. SPA fallback:
 * extensionless paths (/, /reset) get index.html. In dev the Vite server does
 * this job and the dist directory simply doesn't exist.
 */
function serveClient(req: IncomingMessage, res: ServerResponse, distDir: string): boolean {
  if (req.method !== "GET") return false;
  const urlPath = (req.url ?? "/").split("?")[0]!;
  const rel = normalize(urlPath).replace(/^([/\\]|\.\.)+/, "");
  let file = join(distDir, rel);
  if (!extname(file)) file = join(distDir, "index.html");
  if (!file.startsWith(distDir) || !existsSync(file)) return false;
  res.writeHead(200, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
    "cache-control": extname(file) === ".html" ? "no-cache" : "public, max-age=86400",
  });
  res.end(readFileSync(file));
  return true;
}

const DEFAULT_DIST = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../client/dist");

/** Build the HTTP + WebSocket server (not yet listening). */
export function createOnlineServer(opts: ServerOptions = {}): OnlineServer {
  const db = new Db(opts.dbFile ?? process.env.IBOKKI_DB ?? "data/ibokki.db");
  const ctx: ApiContext = {
    db,
    mailer: opts.mailer ?? createMailer(),
    baseUrl: opts.baseUrl ?? process.env.IBOKKI_BASE_URL ?? "http://localhost:7788",
    secureCookies: opts.secureCookies ?? process.env.IBOKKI_SECURE_COOKIES === "1",
    oidc: opts.oidc ?? oidcFromEnv(),
  };

  const distDir = resolve(process.env.IBOKKI_CLIENT_DIST ?? DEFAULT_DIST);
  const http = createServer((req, res) => {
    void (async () => {
      if (req.url === "/health") {
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("ok");
        return;
      }
      if (await handleApi(req, res, ctx)) return;
      if (serveClient(req, res, distDir)) return;
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Ibokki online server — connect via WebSocket at /ws");
    })().catch((err) => {
      console.error("http error:", err);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });

  const wss = new WebSocketServer({ server: http, path: "/ws" });

  wss.on("connection", (ws, req) => {
    // The session cookie rides the WS handshake — saved-deck picks are checked
    // against this user. Resolved once per connection.
    const userId = userFromRequest(req, db)?.id;
    ws.on("message", (data) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(String(data)) as ClientMessage;
      } catch {
        return pushError(ws, "malformed JSON");
      }
      try {
        handleMessage(ws, msg, db, userId);
      } catch (err) {
        pushError(ws, String(err));
      }
    });
    ws.on("close", () => {
      const at = seatBySocket.get(ws);
      if (!at) return;
      const seat = at.room.seats[at.side];
      if (seat?.ws === ws) {
        seat.ws = null;
        at.room.lastActivity = Date.now();
        send(at.room.seats[(at.side ^ 1) as PlayerId]?.ws ?? null, { t: "presence", opponentConnected: false });
      }
    });
  });

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
      const anyConnected = room.seats.some((s) => s?.ws && s.ws.readyState === s.ws.OPEN);
      if (!anyConnected && now - room.lastActivity > IDLE_MS) rooms.delete(code);
    }
  }, SWEEP_MS);
  sweep.unref();
  http.on("close", () => {
    clearInterval(sweep);
    db.close();
  });

  return { http, db };
}
