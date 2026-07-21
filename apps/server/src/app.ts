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
  abandon,
  apply,
  concede,
  createGame,
  isTerminal,
  legalActions,
  presetDeck,
  PRESET_DECKS,
  PRESET_SCHOOLS,
  redact,
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
  type ForfeitInfo,
  type SchoolName,
  type ServerMessage,
} from "@ibokki/protocol";
import { describeEvent, makeAgent, type Agent } from "@ibokki/sim";
import { Db } from "./db.ts";
import { createMailer, type Mailer } from "./mail.ts";
import { handleApi, oidcFromEnv, userFromRequest, type ApiContext, type OidcConfig } from "./api.ts";

const CATALOG = buildCardCatalog();
const BUILD = process.env.IBOKKI_BUILD ?? "dev";

/** Join codes avoid ambiguous glyphs (0/O, 1/I/L). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

type Timer = ReturnType<typeof setTimeout>;

function envInt(name: string): number | undefined {
  const v = process.env[name];
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Tunable robustness knobs (all overridable via ServerOptions or env). */
interface Config {
  /** A dropped seat has this long to rejoin before the match is resolved. */
  disconnectGraceMs: number;
  /** A connected player who takes no action for this long forfeits (anti-softlock). */
  inactivityMs: number;
  /** Main-turn clock budget (PvP only; 0 disables all turn clocks). */
  turnMs: number;
  /** Budget for stack/priority windows (reactions, mid-stack choices). */
  reactionMs: number;
  /** Hard cap on concurrent rooms (memory-exhaustion backstop). */
  maxRooms: number;
  /** Per-connection message rate limit: burst capacity + steady refill/sec. */
  msgBurst: number;
  msgRefillPerSec: number;
  /** Allowed WebSocket Origins (CSWSH guard). null ⇒ allow all (permissive default). */
  allowedOrigins: string[] | null;
}

function resolveConfig(opts: ServerOptions): Config {
  const origins = process.env.IBOKKI_ALLOWED_ORIGINS;
  return {
    disconnectGraceMs: opts.disconnectGraceMs ?? envInt("IBOKKI_DISCONNECT_GRACE_MS") ?? 45_000,
    inactivityMs: opts.inactivityMs ?? envInt("IBOKKI_INACTIVITY_MS") ?? 300_000,
    turnMs: opts.turnMs ?? envInt("IBOKKI_TURN_MS") ?? 75_000,
    reactionMs: opts.reactionMs ?? envInt("IBOKKI_REACTION_MS") ?? 20_000,
    maxRooms: opts.maxRooms ?? envInt("IBOKKI_MAX_ROOMS") ?? 5_000,
    // Generous: this is a coarse flood-breaker (the real DoS guards are reject-if-seated,
    // the room cap, and maxPayload). Legit clients — even the machine-speed e2e driver
    // (~100 msg/s per tab) — must never trip it; only a pathological single-socket flood does.
    msgBurst: opts.msgBurst ?? envInt("IBOKKI_MSG_BURST") ?? 200,
    msgRefillPerSec: opts.msgRefillPerSec ?? envInt("IBOKKI_MSG_REFILL_PER_SEC") ?? 100,
    allowedOrigins: origins ? origins.split(",").map((s) => s.trim()).filter(Boolean) : null,
  };
}

/** Per-server state (rooms + config + persistence), so multiple servers in one process stay isolated. */
interface Hub {
  rooms: Map<string, Room>;
  cfg: Config;
  db: Db;
}

interface Seat {
  /** Secret rejoin token, known only to this player's tab. */
  token: string;
  /** Display label (preset name or the user's deck name). */
  deckName: string;
  deck: Pick<DeckDefinition, "spellbook" | "resourceDeck">;
  ws: WebSocket | null;
  /** Signed-in account at this seat, if any (persisted for match history). */
  userId?: number;
}

/** Seat fields persisted to the matches table (everything but the live socket). */
interface SeatRecord {
  token: string;
  deckName: string;
  deck: Pick<DeckDefinition, "spellbook" | "resourceDeck">;
  userId?: number;
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
  /** Server-side bot piloting seat 1 (solo rooms); null for PvP. */
  bot: Agent | null;
  /** For idle-room cleanup. */
  lastActivity: number;
  /** The server this room belongs to (rooms map + config). */
  hub: Hub;
  /** Per-seat disconnect-grace timers; the inactivity clock for the on-turn player. */
  graceTimers: [Timer | null, Timer | null];
  inactivityTimer: Timer | null;
  /** Who forfeited and why, when the current game ended by forfeit; reset on rematch. */
  forfeitInfo: ForfeitInfo | null;
  /** Persistence row for the CURRENT game (a rematch opens a new row); null before both seats fill. */
  matchId: number | null;
  /** Ordered actions of the current game — with the seed, the whole deterministic match. */
  actionLog: { s: PlayerId; a: Action }[];
  /** Turn-clock state (PvP only; transient — not persisted, restarts reset banks/strikes). */
  clock: RoomClock;
}

interface RoomClock {
  /** Absolute ms each seat times out at; null = no running clock for that seat. */
  deadlines: [number | null, number | null];
  /** Identity of the window each running clock was armed for (so a player's own
   *  actions inside their turn never reset their budget). */
  keys: [string | null, string | null];
  timers: [Timer | null, Timer | null];
  /** Carry-over thinking time earned by ending turns without timing out. */
  bank: [number, number];
  /** Timeout strikes; the third forfeits. */
  timeouts: [number, number];
  lastTurnCount: number;
  lastActivePlayer: PlayerId | null;
  /** turnCount of each seat's last timeout — that turn earns no bank credit. */
  timedOutOnTurn: [number, number];
}

const BANK_PER_TURN_MS = 10_000;
const BANK_CAP_MS = 60_000;
const TIMEOUTS_TO_FORFEIT = 3;

function newClock(): RoomClock {
  return {
    deadlines: [null, null],
    keys: [null, null],
    timers: [null, null],
    bank: [0, 0],
    timeouts: [0, 0],
    lastTurnCount: -1,
    lastActivePlayer: null,
    timedOutOnTurn: [-1, -1],
  };
}

function newCode(rooms: Map<string, Room>): string {
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
  room.forfeitInfo = null;
  clearRoomTimers(room);
  room.clock = newClock(); // fresh banks + strikes per game
  const intro = `Match start: ${d0} vs ${d1} — room ${room.code}, seed ${seed}`;
  room.logs = [[intro], [intro]];
  room.epoch++;
  // Persist so the match survives a redeploy/crash (rehydrated on boot). A rematch
  // opens a fresh row; the finished one stays behind as history.
  room.actionLog = [];
  room.matchId = null;
  try {
    const seats: SeatRecord[] = room.seats.map((s) => ({ token: s!.token, deckName: s!.deckName, deck: s!.deck, userId: s!.userId }));
    room.matchId = room.hub.db.createMatch(room.code, seed, JSON.stringify(seats), !!room.bot);
  } catch (err) {
    console.error(`failed to persist match for room ${room.code}:`, err); // the match still plays, it just won't survive a restart
  }
}

/** Record the final result on the match row (no-op unless terminal; idempotent at the DB). */
function recordResult(room: Room): void {
  if (room.matchId === null || !room.state || !isTerminal(room.state)) return;
  try {
    room.hub.db.finishMatch(
      room.matchId,
      JSON.stringify({ winner: room.state.winner, endReason: room.state.endReason, forfeit: room.forfeitInfo }),
    );
  } catch (err) {
    console.error(`failed to record result for room ${room.code}:`, err);
  }
}

/** A room is being deleted with its game unfinished — close out the row so it never rehydrates. */
function abandonRow(room: Room): void {
  if (room.matchId === null || (room.state && isTerminal(room.state))) return;
  try {
    room.hub.db.finishMatch(room.matchId, JSON.stringify({ winner: null, endReason: "abandoned", forfeit: null }));
  } catch (err) {
    console.error(`failed to abandon match row for room ${room.code}:`, err);
  }
}

/** Push the current frame to one seat (viewer-relative, redacted). */
function pushState(room: Room, side: PlayerId, error?: string): void {
  const seat = room.seats[side];
  if (!seat?.ws || !room.state) return;
  const clocksOn = room.hub.cfg.turnMs > 0 && !room.bot && !isTerminal(room.state);
  const state = buildMatchState(
    {
      state: room.state,
      schools: deckNamesOf(room),
      bots: room.bot ? [1] : [],
      log: room.logs[side],
      epoch: room.epoch,
      events: room.recentEvents,
      forfeit: room.forfeitInfo,
      ...(clocksOn ? { clock: { deadlines: room.clock.deadlines, now: Date.now() } } : {}),
    },
    side,
    { relative: true },
  );
  send(seat.ws, { t: "state", state, ...(error ? { error } : {}) });
}

/** Let a solo room's bot (seat 1) act until only the human can move. */
function autoPlayBot(room: Room): void {
  if (!room.bot || !room.state) return;
  let guard = 0;
  while (!isTerminal(room.state) && ++guard < 1000) {
    const legal = legalActions(room.state, 1);
    if (legal.length === 0) break;
    const action = room.bot.chooseAction(redact(room.state, 1), legal);
    applyAction(room, 1, action);
  }
}

function pushBoth(room: Room): void {
  pushState(room, 0);
  pushState(room, 1);
}

/** Apply one action for `side`, appending per-viewer transcript lines.
 *  `record=false` replays a persisted action during rehydration (already in actionLog). */
function applyAction(room: Room, side: PlayerId, action: Action, record = true): void {
  const state = room.state!;
  const labels: [string, string] = [actionLabelFor(0, state, action, side), actionLabelFor(1, state, action, side)];
  const { state: next, events } = apply(state, action, side);
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
  if (record && room.matchId !== null) {
    room.actionLog.push({ s: side, a: action });
    try {
      room.hub.db.updateMatchActions(room.matchId, JSON.stringify(room.actionLog));
    } catch (err) {
      console.error(`failed to persist action for room ${room.code}:`, err);
    }
    if (isTerminal(next)) recordResult(room);
  }
}

/** Handle {t:"act"} — validate priority + indices, apply, broadcast. */
function handleAct(room: Room, side: PlayerId, indices: number[]): void {
  if (!room.state) {
    pushError(room.seats[side]?.ws ?? null, "waiting for an opponent to join");
    return;
  }
  // Ignore acts outside this side's window (over, or not their turn) WITHOUT bumping the
  // epoch or wiping pending events — just resync the confused sender. Otherwise an opponent
  // spamming "act" during your turn would churn empty frames and desync animations.
  if (isTerminal(room.state) || legalActions(room.state, side).length === 0) {
    pushState(room, side);
    return;
  }
  room.recentEvents = [];
  room.epoch++;
  room.lastActivity = Date.now();
  let error: string | null = null;
  for (const idx of indices) {
    if (isTerminal(room.state)) break;
    // legalActions is the authority on whether it's this side's window —
    // during the simultaneous prepare phase both sides can have actions.
    const legal = legalActions(room.state, side);
    if (legal.length === 0) break;
    if (!Number.isInteger(idx) || idx < 0 || idx >= legal.length) {
      error = `invalid action index ${idx} (0..${legal.length - 1})`;
      break;
    }
    applyAction(room, side, legal[idx]!);
  }
  autoPlayBot(room);
  armClocks(room); // deadlines must be current BEFORE the frames below carry them
  pushState(room, side, error ?? undefined);
  pushState(room, (side ^ 1) as PlayerId);
  armInactivity(room); // any action resets the idle clock for whoever is now on the clock
}

function handleRematch(room: Room, side: PlayerId): void {
  if (!room.state || !isTerminal(room.state)) return;
  room.rematchVotes.add(side);
  if (room.bot) room.rematchVotes.add(1); // the bot always accepts
  room.lastActivity = Date.now();
  if (room.rematchVotes.size === 2) {
    startMatch(room);
    autoPlayBot(room);
    armClocks(room);
    pushBoth(room);
    armInactivity(room);
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

// ---- match-layer safety timers (disconnect grace + inactivity → forfeit) ----

/** Stop every pending timer on a room (game over, forfeit, deletion, shutdown). */
function clearRoomTimers(room: Room): void {
  if (room.inactivityTimer) clearTimeout(room.inactivityTimer);
  room.inactivityTimer = null;
  for (const side of [0, 1] as PlayerId[]) {
    const t = room.graceTimers[side];
    if (t) clearTimeout(t);
    room.graceTimers[side] = null;
    stopClock(room, side);
  }
}

// ---- turn clocks (per-window budgets; timeout = canonical pass; 3 strikes = forfeit) ----

function stopClock(room: Room, side: PlayerId): void {
  const t = room.clock.timers[side];
  if (t) clearTimeout(t);
  room.clock.timers[side] = null;
  room.clock.deadlines[side] = null;
  room.clock.keys[side] = null;
}

/**
 * (Re)arm per-seat clocks for whoever must act. A window is identified by a key of the
 * state components that define it — re-pushes inside the SAME window (e.g. the player's
 * own attaches during their turn) keep the running clock instead of resetting it.
 * Main turns get turnMs + the seat's carry-over bank; stack/choice windows get reactionMs.
 * Solo bot rooms run no clocks (a learning game should never be lost to a timer).
 */
function armClocks(room: Room): void {
  const st = room.state;
  const cfg = room.hub.cfg;
  if (!st || isTerminal(st) || cfg.turnMs <= 0 || room.bot) {
    stopClock(room, 0);
    stopClock(room, 1);
    return;
  }
  // Bank credit on turn rollover: the player whose turn just ended earns thinking time,
  // unless that turn ended by their own timeout.
  if (st.turnCount !== room.clock.lastTurnCount) {
    const ended = room.clock.lastActivePlayer;
    if (ended !== null && room.clock.timedOutOnTurn[ended] !== room.clock.lastTurnCount) {
      room.clock.bank[ended] = Math.min(BANK_CAP_MS, room.clock.bank[ended] + BANK_PER_TURN_MS);
    }
    room.clock.lastTurnCount = st.turnCount;
  }
  room.clock.lastActivePlayer = st.activePlayer;
  const onClock = new Set(onClockHumans(room));
  for (const side of [0, 1] as PlayerId[]) {
    if (!onClock.has(side)) {
      stopClock(room, side);
      continue;
    }
    const reaction = st.stack.length > 0;
    const key = `${st.turnCount}:${st.phase}:${st.priorityPlayer}:${st.stack.length}:${st.pendingChoice ? "c" : "-"}`;
    if (room.clock.keys[side] === key && room.clock.deadlines[side] !== null) continue; // same window — keep ticking
    stopClock(room, side);
    const budget = reaction ? cfg.reactionMs : cfg.turnMs + room.clock.bank[side];
    room.clock.keys[side] = key;
    room.clock.deadlines[side] = Date.now() + budget;
    const t = setTimeout(() => {
      try {
        onClockTimeout(room, side);
      } catch (err) {
        console.error("turn clock error:", err);
      }
    }, budget);
    t.unref();
    room.clock.timers[side] = t;
  }
}

/** The seat's window expired: force the canonical pass line (or forfeit on the third strike). */
function onClockTimeout(room: Room, side: PlayerId): void {
  room.clock.timers[side] = null;
  const st = room.state;
  if (!st || isTerminal(st)) return;
  if (!onClockHumans(room).includes(side)) return; // window closed while the timer was in flight
  room.clock.timeouts[side]++;
  room.clock.timedOutOnTurn[side] = st.turnCount;
  room.clock.bank[side] = 0;
  stopClock(room, side);
  if (room.clock.timeouts[side] >= TIMEOUTS_TO_FORFEIT) {
    forfeit(room, side, "idle");
    return;
  }
  room.recentEvents = [];
  room.epoch++;
  room.lastActivity = Date.now();
  const strikes = `(${room.clock.timeouts[side]}/${TIMEOUTS_TO_FORFEIT} — the third forfeits)`;
  for (const viewer of [0, 1] as PlayerId[]) {
    room.logs[viewer].push(`${side === viewer ? "You" : "Opp"}: out of time ${strikes}`);
  }
  // Canonical pass line: resolve any forced choices with the first candidate, then
  // pass/donePreparing. Flows through applyAction so persistence + transcripts hold.
  for (let guard = 0; guard < 50 && room.state && !isTerminal(room.state); guard++) {
    const legal = legalActions(room.state, side);
    if (legal.length === 0) break;
    const pick =
      legal.find((a) => a.type === "pass") ??
      legal.find((a) => a.type === "donePreparing") ??
      legal.find((a) => a.type === "choose") ??
      legal[0]!;
    applyAction(room, side, pick);
    if (pick.type === "pass" || pick.type === "donePreparing") break;
  }
  armClocks(room);
  pushBoth(room);
  armInactivity(room);
}

/**
 * Connected human seats that must act right now — the priority holder, or un-done players
 * during the simultaneous prepare phase — whose opponent is also present. Bots act
 * synchronously; a dropped seat is covered by disconnect grace (and a seat whose OPPONENT
 * dropped is excluded, so inactivity never forfeits the present player while the opponent's
 * grace is still resolving — that would award the win to the absent player).
 */
function onClockHumans(room: Room): PlayerId[] {
  const st = room.state;
  if (!st || isTerminal(st)) return [];
  const out: PlayerId[] = [];
  for (const side of [0, 1] as PlayerId[]) {
    const seat = room.seats[side];
    if (!seat || !seat.ws || (room.bot && side === 1)) continue; // absent / disconnected / this-is-the-bot
    const opp = room.seats[(side ^ 1) as PlayerId];
    const oppPresent = (room.bot && (side ^ 1) === 1) || !!opp?.ws;
    if (!oppPresent) continue; // opponent dropped → grace resolves this, not inactivity
    const mustAct = st.phase === "prepare" && !st.pendingChoice ? !st.players[side].prepareDone : st.priorityPlayer === side;
    if (mustAct && legalActions(st, side).length > 0) out.push(side);
  }
  return out;
}

/**
 * (Re)start the inactivity clock. A connected player who is on the clock and takes no
 * action within cfg.inactivityMs forfeits — this stops a connected-but-idle match from
 * softlocking forever (the idle sweep can't reap a room while a socket is open). Called
 * after every state change, so any action resets the clock. Also proactively clears all
 * timers once the match is over.
 */
function armInactivity(room: Room): void {
  if (room.inactivityTimer) clearTimeout(room.inactivityTimer);
  room.inactivityTimer = null;
  if (!room.state) return;
  if (isTerminal(room.state)) {
    clearRoomTimers(room); // game over by any means — drop any lingering grace timers too
    return;
  }
  if (onClockHumans(room).length === 0) return;
  const t = setTimeout(() => {
    try {
      // Recompute at fire time: exactly one dawdler forfeits; a simultaneous-prepare
      // mutual stall (both idle, neither singled out) is a draw, not an arbitrary loss.
      const idle = onClockHumans(room);
      if (idle.length === 1) forfeit(room, idle[0]!, "idle");
      else if (idle.length >= 2) {
        room.forfeitInfo = { by: null, cause: "idle" };
        endMatch(room, abandon(room.state!, null), () => "— match abandoned (both idle)");
      }
    } catch (err) {
      console.error("inactivity timer error:", err);
    }
  }, room.hub.cfg.inactivityMs);
  t.unref();
  room.inactivityTimer = t;
}

/**
 * A seat dropped: give it cfg.disconnectGraceMs to rejoin before resolving. If the match
 * never started (creator dropped before an opponent joined) the dead room is reaped rather
 * than left to squat until the 1h idle sweep. Otherwise PvP → the present player wins by
 * forfeit; a solo bot room → reap it. A rejoin cancels the timer.
 */
function startGrace(room: Room, side: PlayerId): void {
  const existing = room.graceTimers[side];
  if (existing) clearTimeout(existing);
  room.graceTimers[side] = null;
  if (room.state && isTerminal(room.state)) return; // finished match — nothing to protect
  const t = setTimeout(() => {
    try {
      const seat = room.seats[side];
      if (!seat || seat.ws) return; // rejoined
      if (!room.state) {
        // Never-started room whose creator is gone: reap it if no one is still connected.
        if (!room.seats.some((s) => s?.ws)) {
          clearRoomTimers(room);
          room.hub.rooms.delete(room.code);
        }
        return;
      }
      if (isTerminal(room.state)) return; // already over
      if (room.bot) {
        abandonRow(room); // close the row out or it would rehydrate as a zombie on next boot
        clearRoomTimers(room);
        room.hub.rooms.delete(room.code);
      } else {
        forfeit(room, side, "disconnected");
      }
    } catch (err) {
      console.error("grace timer error:", err);
    }
  }, room.hub.cfg.disconnectGraceMs);
  t.unref();
  room.graceTimers[side] = t;
}

function cancelGrace(room: Room, side: PlayerId): void {
  const t = room.graceTimers[side];
  if (t) clearTimeout(t);
  room.graceTimers[side] = null;
}

/**
 * Apply an out-of-band terminal result (from `concede`/`abandon`) to the room: swap in the
 * terminal state, fold a per-viewer line into both transcripts, broadcast the game-over
 * frame, and stop all timers. A no-op on an already-finished game, so it is safe to call
 * from racing timers.
 */
function endMatch(room: Room, result: { state: GameState; events: GameEvent[] }, logLine: (viewer: PlayerId) => string): void {
  if (!room.state || isTerminal(room.state)) return;
  room.state = result.state;
  room.recentEvents = result.events;
  room.epoch++;
  room.lastActivity = Date.now();
  for (const viewer of [0, 1] as PlayerId[]) {
    room.logs[viewer].push(logLine(viewer));
    for (const e of result.events) {
      const line = describeEvent(eventForViewer(e, viewer, true) as GameEvent);
      if (line) room.logs[viewer].push(`   ${line}`);
    }
  }
  recordResult(room); // concede/abandon endings are out-of-band (not in the action log) — record here
  clearRoomTimers(room);
  pushBoth(room);
}

/** End the match against `loser` (the other player wins by forfeit). */
function forfeit(room: Room, loser: PlayerId, cause: ForfeitInfo["cause"]): void {
  if (!room.state || isTerminal(room.state)) return;
  const why = cause === "idle" ? "was idle too long" : cause;
  room.forfeitInfo = { by: loser, cause };
  endMatch(room, concede(room.state, loser), (v) => (v === loser ? `You: forfeited — ${why}` : `Opp: forfeited — ${why}`));
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

function handleMessage(hub: Hub, ws: WebSocket, msg: ClientMessage, db: Db, userId: number | undefined): void {
  const { rooms } = hub;
  switch (msg.t) {
    case "create": {
      // One connection = one seat: reject a second create/join so a client can't spray
      // orphan rooms (each would leak until the 1h idle sweep). Global cap backstops memory.
      if (seatBySocket.has(ws)) return pushError(ws, "already in a room — leave it first");
      if (rooms.size >= hub.cfg.maxRooms) return pushError(ws, "the server is at capacity — try again shortly");
      const resolved = resolveDeck(db, msg, userId);
      if ("error" in resolved) return pushError(ws, resolved.error);
      // Solo room: seat 1 is a server-side bot playing a preset (random archetype by default).
      let botSeat: Seat | null = null;
      let bot: Agent | null = null;
      if (msg.bot) {
        const preset = presetDeck(msg.botDeck?.preset ?? "") ?? PRESET_DECKS[randomInt(PRESET_DECKS.length)]!;
        botSeat = { token: randomUUID(), deckName: preset.name, deck: preset, ws: null };
        bot = makeAgent("heuristic", newSeed());
      }
      const room: Room = {
        code: newCode(rooms),
        seats: [{ token: randomUUID(), deckName: resolved.name, deck: resolved.deck, ws: null, userId }, botSeat],
        state: null,
        logs: [[], []],
        epoch: 0,
        recentEvents: [],
        rematchVotes: new Set(),
        bot,
        lastActivity: Date.now(),
        hub,
        graceTimers: [null, null],
        inactivityTimer: null,
        forfeitInfo: null,
        matchId: null,
        actionLog: [],
        clock: newClock(),
      };
      rooms.set(room.code, room);
      seatSocket(room, 0, ws);
      send(ws, { t: "created", code: room.code, side: 0, token: room.seats[0].token, catalog: CATALOG, build: BUILD });
      if (room.bot) {
        startMatch(room);
        autoPlayBot(room); // bot lays its prepare-phase spells before the first frame
        send(ws, { t: "presence", opponentConnected: true });
        pushState(room, 0);
        armInactivity(room);
        armClocks(room);
      }
      return;
    }
    case "join": {
      if (seatBySocket.has(ws)) return pushError(ws, "already in a room — leave it first");
      const room = rooms.get((msg.code ?? "").toUpperCase().trim());
      if (!room) return pushError(ws, `no room with code ${msg.code}`);
      if (room.seats[1]) return pushError(ws, "room is full");
      const resolved = resolveDeck(db, msg, userId);
      if ("error" in resolved) return pushError(ws, resolved.error);
      room.seats[1] = { token: randomUUID(), deckName: resolved.name, deck: resolved.deck, ws: null, userId };
      seatSocket(room, 1, ws);
      send(ws, { t: "joined", code: room.code, side: 1, token: room.seats[1].token, catalog: CATALOG, build: BUILD });
      startMatch(room);
      armClocks(room);
      pushBoth(room);
      // The creator has been waiting — tell them their opponent is here.
      send(room.seats[0].ws, { t: "presence", opponentConnected: true });
      armInactivity(room);
      return;
    }
    case "rejoin": {
      if (seatBySocket.has(ws)) return pushError(ws, "already in a room — leave it first");
      const room = rooms.get((msg.code ?? "").toUpperCase().trim());
      if (!room) return pushError(ws, "no seat matches that code/token");
      const idx = room.seats.findIndex((s) => s?.token === msg.token);
      if (idx !== 0 && idx !== 1) return pushError(ws, "no seat matches that code/token");
      const side = idx as PlayerId;
      seatSocket(room, side, ws);
      cancelGrace(room, side); // back before the grace deadline — the match survives
      send(ws, { t: "joined", code: room.code, side, token: msg.token, catalog: CATALOG, build: BUILD });
      armClocks(room);
      if (room.state) pushState(room, side);
      const opp = room.seats[(side ^ 1) as PlayerId];
      send(ws, { t: "presence", opponentConnected: !!opp?.ws });
      // A rehydrated room has no running timers: the opponent's socket died with the old
      // process, so no close event ever started their grace. First returner arms it —
      // the absent side gets the usual window to come back before forfeiting. The guard
      // on an already-running timer keeps a mid-game rejoin from extending a live grace.
      const oppSide = (side ^ 1) as PlayerId;
      if (room.state && !isTerminal(room.state) && opp && !opp.ws && !(room.bot && oppSide === 1) && !room.graceTimers[oppSide]) {
        startGrace(room, oppSide);
      }
      armInactivity(room);
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

/**
 * Boot-time recovery: rebuild every unfinished match from its persisted
 * {seed, decks, actions} by replaying the deterministic engine. Players resume
 * through the normal rejoin path — their sessionStorage tokens still match the
 * restored seats. Rows idle past the room sweep window, or whose replay fails
 * (e.g. engine rules changed between deploys), are closed out as abandoned.
 */
function rehydrateRooms(hub: Hub): void {
  const abandonedResult = JSON.stringify({ winner: null, endReason: "abandoned", forfeit: null });
  try {
    hub.db.abandonMatchesBefore(Date.now() - IDLE_MS);
  } catch (err) {
    console.error("failed to sweep stale match rows:", err);
    return; // a broken matches table must not stop the server from booting
  }
  for (const row of hub.db.liveMatches()) {
    try {
      const seats = JSON.parse(row.seats) as SeatRecord[];
      if (!seats[0] || !seats[1]) throw new Error("row predates both seats");
      const room: Room = {
        code: row.code,
        seats: [
          { ...seats[0], ws: null },
          { ...seats[1], ws: null },
        ],
        state: createGame({ seed: row.seed, players: [seats[0].deck, seats[1].deck] }),
        logs: [[], []],
        epoch: 0,
        recentEvents: [],
        rematchVotes: new Set(),
        // A fresh agent seed only affects FUTURE bot moves; the played ones replay from the log.
        bot: row.bot ? makeAgent("heuristic", newSeed()) : null,
        lastActivity: Date.now(),
        hub,
        graceTimers: [null, null],
        inactivityTimer: null,
        forfeitInfo: null,
        matchId: row.id,
        actionLog: JSON.parse(row.actions) as { s: PlayerId; a: Action }[],
        clock: newClock(),
      };
      const intro = `Match start: ${seats[0].deckName} vs ${seats[1].deckName} — room ${row.code}, seed ${row.seed}`;
      room.logs = [[intro], [intro]];
      for (const { s, a } of room.actionLog) applyAction(room, s, a, false);
      for (const log of room.logs) log.push("— match restored after a server update —");
      room.recentEvents = []; // rejoiners get a snapshot, not the whole history as animations
      room.epoch = room.actionLog.length + 1;
      if (isTerminal(room.state!)) {
        recordResult(room); // the stored tail already ended the game — history only, no room
        continue;
      }
      hub.rooms.set(row.code, room);
    } catch (err) {
      console.error(`failed to restore match ${row.id} (room ${row.code}):`, err);
      try {
        hub.db.finishMatch(row.id, abandonedResult);
      } catch {
        /* already logged the root cause */
      }
    }
  }
  if (hub.rooms.size > 0) console.log(`restored ${hub.rooms.size} live match(es) from the database`);
}

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
  /** Grace (ms) a dropped seat has to rejoin before it forfeits. Default 45s. */
  disconnectGraceMs?: number;
  /** Idle (ms) before a connected but inactive player forfeits. Default 5min. */
  inactivityMs?: number;
  /** Main-turn clock budget (PvP only; 0 disables clocks). Default 75s. */
  turnMs?: number;
  /** Stack/priority window budget. Default 20s. */
  reactionMs?: number;
  /** Hard cap on concurrent rooms. Default 5000. */
  maxRooms?: number;
  /** Per-connection message rate limit: burst capacity + steady refill/sec. Default 200 / 100. */
  msgBurst?: number;
  msgRefillPerSec?: number;
}

export interface OnlineServer {
  http: HttpServer;
  db: Db;
  /** Notify clients, stop timers, and close the WS + HTTP servers gracefully. */
  shutdown: () => Promise<void>;
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

/** WebSocket cap: our JSON messages are tiny, so a small ceiling shuts down memory-abuse
 *  payloads. ws otherwise defaults to ~100 MiB per frame. */
const WS_MAX_PAYLOAD = 64 * 1024;

/** CSWSH guard: allow handshakes with no Origin (native clients / tests) or an allow-listed
 *  one. Enforced only when IBOKKI_ALLOWED_ORIGINS is set, so the default stays permissive. */
function originAllowed(origin: string | undefined, allow: string[]): boolean {
  if (!origin) return true;
  return allow.includes(origin);
}

/** Build the HTTP + WebSocket server (not yet listening). */
export function createOnlineServer(opts: ServerOptions = {}): OnlineServer {
  const db = new Db(opts.dbFile ?? process.env.IBOKKI_DB ?? "data/ibokki.db");
  const cfg = resolveConfig(opts);
  const hub: Hub = { rooms: new Map<string, Room>(), cfg, db };
  const { rooms } = hub;
  rehydrateRooms(hub);
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

  const wss = new WebSocketServer({
    server: http,
    path: "/ws",
    maxPayload: WS_MAX_PAYLOAD,
    ...(cfg.allowedOrigins
      ? { verifyClient: (info: { origin: string; secure: boolean; req: IncomingMessage }) => originAllowed(info.origin, cfg.allowedOrigins!) }
      : {}),
  });

  // Set once shutdown() begins, so the close handler doesn't re-arm grace/inactivity timers
  // for sockets we are deliberately closing.
  let closing = false;

  wss.on("connection", (ws, req) => {
    // The session cookie rides the WS handshake — saved-deck picks are checked
    // against this user. Resolved once per connection.
    const userId = userFromRequest(req, db)?.id;
    // Per-connection token bucket: the single event loop is the scarce resource, so a
    // flood (create/act spam) must be shed here — no per-IP limit can see past the proxy.
    let tokens = cfg.msgBurst;
    let last = Date.now();
    let warned = false;
    let drops = 0;
    ws.on("message", (data) => {
      const now = Date.now();
      tokens = Math.min(cfg.msgBurst, tokens + ((now - last) / 1000) * cfg.msgRefillPerSec);
      last = now;
      if (tokens < 1) {
        if (!warned) {
          pushError(ws, "slow down — too many messages");
          warned = true;
        }
        if (++drops > 200) ws.close(4008, "rate limit exceeded");
        return;
      }
      tokens -= 1;
      warned = false;
      drops = 0; // a processed message means this isn't a sustained flood — don't accumulate
      let msg: ClientMessage;
      try {
        msg = JSON.parse(String(data)) as ClientMessage;
      } catch {
        return pushError(ws, "malformed JSON");
      }
      try {
        handleMessage(hub, ws, msg, db, userId);
      } catch (err) {
        // Sanitized: log the real error, never echo internals (stack-ish strings) to a client.
        console.error("ws message error:", err);
        pushError(ws, "server error");
      }
    });
    ws.on("close", () => {
      if (closing) return; // deliberate shutdown close — don't re-arm timers we just cleared
      const at = seatBySocket.get(ws);
      if (!at) return;
      const seat = at.room.seats[at.side];
      if (seat?.ws === ws) {
        seat.ws = null;
        at.room.lastActivity = Date.now();
        send(at.room.seats[(at.side ^ 1) as PlayerId]?.ws ?? null, { t: "presence", opponentConnected: false });
        // Start the rejoin grace clock; if they don't come back the match resolves.
        startGrace(at.room, at.side);
        armInactivity(at.room); // the dropped seat is no longer "on the clock"
        armClocks(at.room);
      }
    });
  });

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
      const anyConnected = room.seats.some((s) => s?.ws && s.ws.readyState === s.ws.OPEN);
      if (!anyConnected && now - room.lastActivity > IDLE_MS) {
        abandonRow(room);
        clearRoomTimers(room);
        rooms.delete(code);
      }
    }
  }, SWEEP_MS);
  sweep.unref();
  http.on("close", () => {
    clearInterval(sweep);
    for (const room of rooms.values()) clearRoomTimers(room);
    db.close();
  });

  const shutdown = async (): Promise<void> => {
    if (closing) return;
    closing = true;
    clearInterval(sweep);
    for (const room of rooms.values()) {
      clearRoomTimers(room);
      for (const seat of room.seats) {
        send(seat?.ws ?? null, { t: "notice", message: "The server is updating — reconnect in a moment." });
      }
    }
    for (const client of wss.clients) client.close(1001, "server shutting down");
    await new Promise<void>((res) => wss.close(() => res()));
    await new Promise<void>((res) => {
      http.close(() => res()); // fires http "close" → sweep clear + db.close
      http.closeAllConnections?.(); // force-drop any straggler so close() can't hang
    });
  };

  return { http, db, shutdown };
}
