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
  /** Times the discard has been reshuffled into the deck (exhaustion clock). */
  reshuffles: number;
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

// ---- accounts & decks (the online server's HTTP API; cookie-session) ----

export interface User {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
}

/** A deck in the shared DeckDefinition shape; saved decks carry an id, presets don't. */
export interface Deck {
  id?: number;
  name: string;
  spellbook: string[];
  resourceDeck: string[];
}

/** Deck-construction limits, served by the backend so UI counters match the validator. */
export interface DeckRules {
  resourceDeckSize: number;
  maxTrainers: number;
  maxTrainerCopies: number;
  maxSameSymbolDuals: number;
  maxTriComponents: number;
  spellbookMin: number;
  spellbookMax: number;
  minLevel1Spells: number;
}

export interface DeckListResponse {
  rules: DeckRules;
  presets: Deck[];
  decks: Deck[];
}

export interface DeckError {
  zone: "spellbook" | "resourceDeck" | "deck";
  message: string;
}

/** Non-2xx API responses carry {error} (and deck saves may add {errors}). */
export class ApiError extends Error {
  errors?: DeckError[];
  constructor(message: string, errors?: DeckError[]) {
    super(message);
    this.errors = errors;
  }
}

const SIDE: Side = 0; // the human always plays P0 in local (vs bot) mode

/**
 * Deployment base path ("/" in dev, "/play/" when built into the site).
 * Every API/WS path is prefixed so the same bundle works at either mount point.
 */
export const BASE = import.meta.env.BASE_URL;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  const body = (await r.json().catch(() => null)) as (T & { error?: string; errors?: DeckError[] }) | null;
  if (!r.ok) throw new ApiError(body?.error ?? `${url} -> ${r.status}`, body?.errors);
  return body as T;
}

const getJson = <T>(url: string) => request<T>(url);
const postJson = <T>(url: string, body: unknown) =>
  request<T>(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export const api = {
  cards: () => getJson<CardCatalog>(`${BASE}api/cards`),
  state: () => getJson<MatchState>(`${BASE}api/state?side=${SIDE}`),
  act: (index: number) => postJson<MatchState>(`${BASE}api/act?side=${SIDE}`, { index }),
  newGame: (p0: School, p1: School, mode: "bot" | "agent") =>
    postJson<MatchState>(`${BASE}api/new`, { p0, p1, bots: mode === "bot" ? [1] : [] }),

  authConfig: () => getJson<{ oidcEnabled: boolean }>(`${BASE}api/auth/config`),
  me: () => getJson<{ user: User | null }>(`${BASE}api/auth/me`),
  register: (email: string, username: string, password: string) =>
    postJson<{ user: User }>(`${BASE}api/auth/register`, { email, username, password }),
  login: (usernameOrEmail: string, password: string) =>
    postJson<{ user: User }>(`${BASE}api/auth/login`, { usernameOrEmail, password }),
  logout: () => postJson<{ ok: true }>(`${BASE}api/auth/logout`, {}),
  forgot: (email: string) => postJson<{ ok: true }>(`${BASE}api/auth/forgot`, { email }),
  resetPassword: (token: string, password: string) => postJson<{ user: User }>(`${BASE}api/auth/reset`, { token, password }),

  decks: () => getJson<DeckListResponse>(`${BASE}api/decks`),
  saveDeck: (deck: Deck) => postJson<{ deck: Deck & { id: number } }>(`${BASE}api/decks`, deck),
  deleteDeck: (id: number) => request<{ ok: true }>(`${BASE}api/decks/${id}`, { method: "DELETE" }),
};

export const MY_SIDE = SIDE;
