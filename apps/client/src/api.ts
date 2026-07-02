/**
 * Typed client for the local play server's HTTP contract (apps/playvsclaude/src/server.ts).
 * The client is a pure view over this contract — it never imports the engine. Shapes mirror
 * `stateJson()` + `redact()` on the server; anything the UI doesn't consume is left loose.
 */

export type School = "Evocation" | "Abjuration" | "Divination";
export type Side = 0 | 1;

/** One card in the static catalog from GET /api/cards. */
export interface CardInfo {
  name: string;
  school: string; // School | "Component" | "Neutral"
  type: string;
  level: number | null;
  cost: string | null; // symbol string like "VV", "SM", ...
  text: string;
}
export type CardCatalog = Record<string, CardInfo>;

/** A prepared-spell slot as seen in a redacted view. `spellDefId` is absent when face-down (opponent). */
export interface PreparedView {
  spellDefId?: string;
  attached: string[]; // component defIds
  cast: boolean;
  sealed: boolean;
}

/** Per-player redacted view. Your own has `hand`; the opponent exposes only `handCount`. */
export interface PlayerView {
  hp: number;
  wards: number[];
  burn: number;
  level: number;
  maxSpellLevel: number;
  slots: number;
  slotsUsedThisRound: number;
  prepared: PreparedView[];
  preparedLimit: number;
  hand?: string[]; // self only (defIds)
  handCount?: number; // opponent only (self carries `hand`)
  resourceDeckCount: number;
  discard: string[];
  spellbook?: string[]; // self only
}

export interface StackItemView {
  spellDefId: string;
  controller: Side;
  cancelled: boolean;
}

export interface PendingChoiceView {
  mine: boolean;
  mode: "takeToHand" | "bankToDeckTop";
  reason: string;
  picksRemaining: number;
  candidates: string[]; // defIds
}

export interface RedactedView {
  self: PlayerView;
  opponent: PlayerView;
  stack: StackItemView[];
  pendingChoice: PendingChoiceView | null;
}

/** A legal action, enriched by the server with the fields needed to wire clicks. */
export interface LegalAction {
  index: number;
  type: string;
  label: string;
  defId: string | null;
  preparedIndex: number | null;
  handIid: string | null;
}

/** Engine events since the last human action (for animation). Loose — only `type` is guaranteed. */
export interface GameEvent {
  type: string;
  [k: string]: unknown;
}

/** Full state payload from GET /api/state / POST /api/act / POST /api/new. */
export interface MatchState {
  schools: [School, School];
  side: Side;
  phase: "prepare" | "main" | string;
  round: number;
  turnCount: number;
  activePlayer: Side;
  priorityPlayer: Side;
  reactionWindow: boolean;
  yourTurn: boolean;
  gameOver: boolean;
  winner: Side | null;
  endReason: string | null;
  bots: number[];
  view: RedactedView;
  legal: LegalAction[];
  log: string[];
  epoch: number;
  events: GameEvent[];
  error?: string;
}

const SIDE: Side = 0; // the human always plays P0 in this client

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return (await r.json()) as T;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return (await r.json()) as T;
}

export const api = {
  cards: () => getJson<CardCatalog>("/api/cards"),
  state: () => getJson<MatchState>(`/api/state?side=${SIDE}`),
  act: (index: number) => postJson<MatchState>(`/api/act?side=${SIDE}`, { index }),
  newGame: (p0: School, p1: School, mode: "bot" | "agent") =>
    postJson<MatchState>("/api/new", { p0, p1, bots: mode === "bot" ? [1] : [] }),
};

export const MY_SIDE = SIDE;
