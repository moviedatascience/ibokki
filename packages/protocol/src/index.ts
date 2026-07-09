/**
 * @ibokki/protocol — the single client-facing contract both servers speak.
 *
 * A server holds full `GameState` truth; a client only ever receives the
 * `MatchStatePayload` built here for one viewer. Three concerns live here:
 *
 *  1. `buildCardCatalog()` — the static id → card-info map the UI renders from.
 *  2. `buildMatchState()` — one player's full frame: redacted view, enriched
 *     legal actions, log tail, and the events since the last action (for animation).
 *  3. Per-viewer redaction of the *dynamic* channel: engine events and transcript
 *     labels can leak hidden info (a face-down prepare names its spell; a private
 *     choice names its pick) even though `redact()` guards the state snapshot.
 *     `eventForViewer()` / `actionLabelFor()` close that channel.
 *
 * `relative: true` additionally remaps every PlayerId in the payload so 0 = the
 * viewer — the web client is written as "0 = you / bottom of the board", which the
 * online server satisfies for both seats this way. The local play server keeps
 * absolute ids (its human is always P0, so they coincide).
 */
import {
  isTerminal,
  legalActions,
  redact,
  type Action,
  type GameEvent,
  type GameState,
  type PlayerId,
  type PlayerView,
} from "@ibokki/engine";
import { CARDS, COMPONENTS } from "@ibokki/cards";
import { describeAction } from "@ibokki/sim";

// ---------------------------------------------------------------------------
// Static card catalog
// ---------------------------------------------------------------------------

/** Static card info for the UI: id -> { name, school, type, level, cost, text }. */
export interface CardInfo {
  name: string;
  school: string;
  type: string;
  level: number | null;
  cost: string | null;
  text: string;
}

export function buildCardCatalog(): Record<string, CardInfo> {
  const catalog: Record<string, CardInfo> = {};
  for (const c of CARDS) {
    catalog[c.id] = { name: c.name, school: c.school, type: c.type, level: c.level, cost: c.costText, text: c.text };
  }
  for (const c of COMPONENTS) {
    const sym = "V".repeat(c.symbols.V) + "S".repeat(c.symbols.S) + "M".repeat(c.symbols.M);
    catalog[c.id] = { name: c.name, school: "Component", type: "Component", level: null, cost: sym, text: `Resource component — provides ${sym}.` };
  }
  return catalog;
}

// ---------------------------------------------------------------------------
// Legal actions, enriched for click-wiring
// ---------------------------------------------------------------------------

/** The card defId an action centers on (for mapping clicks to rendered cards). */
export function actionCardDefId(state: GameState, side: PlayerId, action: Action): string | null {
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
export interface LegalActionPayload {
  index: number;
  type: Action["type"];
  label: string;
  defId: string | null;
  preparedIndex: number | null;
  handIid: number | null;
}

export function legalForClient(state: GameState, side: PlayerId): LegalActionPayload[] {
  return legalActions(state, side).map((a, index) => ({
    index,
    type: a.type,
    label: describeAction(state, a, side),
    defId: actionCardDefId(state, side, a),
    preparedIndex: "preparedIndex" in a ? a.preparedIndex : null,
    handIid: "handIid" in a ? a.handIid : null,
  }));
}

// ---------------------------------------------------------------------------
// Per-viewer redaction of events and transcript labels
// ---------------------------------------------------------------------------

function relSide(viewer: PlayerId, p: PlayerId): PlayerId {
  return (p === viewer ? 0 : 1) as PlayerId;
}

/**
 * An engine event as one viewer may see it. Same shape as `GameEvent`, except
 * defIds of hidden information are nulled and (when `relative`) PlayerId fields
 * are remapped so 0 = viewer.
 */
export type ViewerEvent = { type: GameEvent["type"]; [k: string]: unknown };

export function eventForViewer(e: GameEvent, viewer: PlayerId, relative: boolean): ViewerEvent {
  const out: Record<string, unknown> = { ...e };
  // Hidden information: a face-down prepare/replace and a private choice must not
  // name the card to the other player (the redacted state view already hides them).
  const actor = "player" in e ? e.player : null;
  if (actor !== null && actor !== viewer) {
    if (e.type === "spellPrepared") out.spellDefId = null;
    if (e.type === "spellReplaced") {
      out.outDefId = null;
      out.inDefId = null;
    }
    if (e.type === "chose") out.defId = null;
  }
  if (relative) {
    for (const k of ["player", "target", "controller", "winner"]) {
      const v = out[k];
      if (v === 0 || v === 1) out[k] = relSide(viewer, v as PlayerId);
    }
  }
  return out as ViewerEvent;
}

/**
 * Transcript label for `action` (about to be applied by `actor`), as `viewer`
 * may see it. The actor sees the full `describeAction` label; the opponent
 * gets a generic label for actions whose specifics are hidden.
 */
export function actionLabelFor(viewer: PlayerId, state: GameState, action: Action, actor?: PlayerId): string {
  const who = actor ?? state.priorityPlayer;
  if (who !== viewer) {
    switch (action.type) {
      case "prepareSpell":
        return "prepare a spell";
      case "replacePrepared":
        return `replace prepared[${action.preparedIndex}] with a spell`;
      case "choose":
        return "choose a card";
      default:
        break;
    }
  }
  return describeAction(state, action, who);
}

// ---------------------------------------------------------------------------
// The full per-viewer frame
// ---------------------------------------------------------------------------

/** What a server must hold about one match to build client frames from. */
export interface MatchSnapshot {
  state: GameState;
  schools: [string, string];
  /** Sides played by a server-side bot (empty for online PvP). */
  bots: PlayerId[];
  /** Transcript lines appropriate for the receiving viewer. */
  log: string[];
  /** Monotonic counter bumped per state-mutating request; clients animate on change. */
  epoch: number;
  /** Raw engine events since the last action (redacted per viewer here). */
  events: GameEvent[];
}

export interface MatchStatePayload {
  schools: [string, string];
  side: PlayerId;
  phase: GameState["phase"];
  round: number;
  turnCount: number;
  activePlayer: PlayerId;
  priorityPlayer: PlayerId;
  reactionWindow: boolean;
  yourTurn: boolean;
  gameOver: boolean;
  winner: PlayerId | null;
  endReason: GameState["endReason"];
  bots: PlayerId[];
  view: PlayerView;
  legal: LegalActionPayload[];
  log: string[];
  epoch: number;
  events: ViewerEvent[];
}

export interface BuildOptions {
  /** Remap all PlayerIds so 0 = viewer (the web client's "you"). Default false. */
  relative?: boolean;
  /** Include the full log instead of the last-100 tail (post-game summary). Default: full when game over. */
  fullLog?: boolean;
}

export function buildMatchState(snap: MatchSnapshot, side: PlayerId, opts: BuildOptions = {}): MatchStatePayload {
  const st = snap.state;
  const relative = opts.relative ?? false;
  const over = isTerminal(st);
  // Prepare is simultaneous: each un-done player may act regardless of priority.
  const myTurnNow =
    st.phase === "prepare" && !st.pendingChoice ? !st.players[side].prepareDone : st.priorityPlayer === side;
  const yourTurn = !over && myTurnNow && !snap.bots.includes(side);
  const rel = (p: PlayerId): PlayerId => (relative ? relSide(side, p) : p);
  const view = redact(st, side);
  if (relative) {
    view.you = rel(view.you);
    view.activePlayer = rel(view.activePlayer);
    view.priorityPlayer = rel(view.priorityPlayer);
    view.winner = view.winner === null ? null : rel(view.winner);
    for (const item of view.stack) item.controller = rel(item.controller);
    view.self.id = rel(view.self.id);
    view.opponent.id = rel(view.opponent.id);
  }
  const other = (side ^ 1) as PlayerId;
  return {
    schools: relative ? [snap.schools[side], snap.schools[other]] : snap.schools,
    side,
    phase: st.phase,
    round: st.round,
    turnCount: st.turnCount,
    activePlayer: rel(st.activePlayer),
    priorityPlayer: rel(st.priorityPlayer),
    reactionWindow: st.stack.length > 0,
    yourTurn,
    gameOver: over,
    winner: st.winner === null ? null : rel(st.winner),
    endReason: st.endReason,
    bots: snap.bots.map(rel),
    view,
    legal: yourTurn ? legalForClient(st, side) : [],
    log: over || opts.fullLog ? snap.log : snap.log.slice(-100),
    epoch: snap.epoch,
    events: snap.events.map((e) => eventForViewer(e, side, relative)),
  };
}

// ---------------------------------------------------------------------------
// Online wire protocol (WebSocket messages)
// ---------------------------------------------------------------------------

export type SchoolName = "Evocation" | "Abjuration" | "Divination";
export const SCHOOLS: SchoolName[] = ["Evocation", "Abjuration", "Divination"];

/**
 * Which deck a player brings to a match: a named preset (Emberworks/Bastion/
 * Riptide) or one of their saved decks by id (requires the session cookie the
 * WS handshake carries). `school` is the legacy pre-deck field — it maps to
 * that school's archetype preset.
 */
export interface DeckChoice {
  preset?: string;
  deckId?: number;
}

/** Client → server. `bot: true` fills seat 1 with a server-side bot (solo play);
 *  `botDeck` picks its deck (preset only), defaulting to a random archetype. */
export type ClientMessage =
  | { t: "create"; school?: SchoolName; deck?: DeckChoice; bot?: boolean; botDeck?: DeckChoice }
  | { t: "join"; code: string; school?: SchoolName; deck?: DeckChoice }
  | { t: "rejoin"; code: string; token: string }
  | { t: "act"; indices: number[] }
  | { t: "rematch" };

/** Server → client. `build` lets a tab that outlived a redeploy detect it is
 *  running an outdated bundle and prompt for a refresh. `notice` is an out-of-band
 *  informational message (e.g. the server is shutting down for a redeploy). */
export type ServerMessage =
  | { t: "created"; code: string; side: PlayerId; token: string; catalog: Record<string, CardInfo>; build?: string }
  | { t: "joined"; code: string; side: PlayerId; token: string; catalog: Record<string, CardInfo>; build?: string }
  | { t: "state"; state: MatchStatePayload; error?: string }
  | { t: "presence"; opponentConnected: boolean }
  | { t: "notice"; message: string }
  | { t: "error"; message: string };
