/**
 * Deterministic replay builder for finished matches. A persisted row's
 * {seed, decks, actions} rebuilds the whole game (same walk `rehydrateRooms`
 * does for live rooms); each step becomes one client-renderable frame built by
 * @ibokki/protocol for the SHARING seat — so a replay shows exactly what that
 * player saw live (opponent hand hidden, face-down preparations hidden), and a
 * share link can never leak more than its owner's own screen did.
 *
 * Frames carry only the transcript lines their step ADDED (`log` is a delta,
 * not the running log) — the viewer accumulates. A 2000-action match otherwise
 * ships ~100 repeated lines per frame.
 *
 * Out-of-band endings (concede/disconnect/idle) are match-layer, not actions:
 * the walk ends on a non-terminal state and the row's `result` JSON carries the
 * outcome — the replay meta endpoint serves it for the viewer's end card. The
 * inverse crash-window shape (a terminal action tail under an "abandoned"
 * result) is fine too: the viewer trusts a terminal final frame over the meta.
 *
 * Throws when the stored actions no longer replay under the current engine
 * (rules changed between deploys) — structurally (apply throws) or by outcome
 * (a natural ending that replays to a different winner/reason). Callers map
 * that to 410, and `ReplayTooLong` (a crafted/degenerate action log) to 413.
 */
import { apply, createGame, isTerminal, type Action, type DeckDefinition, type GameEvent, type GameState, type PlayerId } from "@ibokki/engine";
import { actionLabelFor, buildMatchState, eventForViewer, type MatchStatePayload } from "@ibokki/protocol";
import { describeEvent } from "@ibokki/sim";
import type { MatchRow } from "./db.ts";

/** The persisted per-seat record (see SeatRecord in app.ts / MatchRow.seats). */
export interface StoredSeat {
  token: string;
  deckName: string;
  deck: Pick<DeckDefinition, "spellbook" | "resourceDeck">;
  userId?: number;
}

/**
 * Refuse to replay rows past this many actions. Organic matches top out around
 * ~2600 plies; longer logs are degenerate (e.g. a clockless attach/detach loop)
 * and each build costs ~0.1ms per action of synchronous CPU.
 */
export const MAX_REPLAY_ACTIONS = 4000;

export class ReplayTooLong extends Error {
  constructor(count: number) {
    super(`action log too long to replay (${count} > ${MAX_REPLAY_ACTIONS})`);
  }
}

export function parseSeats(row: MatchRow): [StoredSeat, StoredSeat] {
  const seats = JSON.parse(row.seats) as StoredSeat[];
  if (!seats[0] || !seats[1]) throw new Error("row predates both seats");
  return [seats[0], seats[1]];
}

/** Frames of `row` as seen by `viewer` (viewer-relative: 0 = the sharing seat). */
export function buildReplayFrames(row: MatchRow, viewer: PlayerId, fallbackHp?: number): MatchStatePayload[] {
  const seats = parseSeats(row);
  const actions = JSON.parse(row.actions) as { s: PlayerId; a: Action }[];
  if (actions.length > MAX_REPLAY_ACTIONS) throw new ReplayTooLong(actions.length);
  const schools: [string, string] = [seats[0].deckName, seats[1].deckName];
  const bots: PlayerId[] = row.bot ? [1] : [];
  const hp = row.starting_hp ?? fallbackHp;
  const frames: MatchStatePayload[] = [];
  const push = (state: GameState, log: string[], events: GameEvent[], epoch: number) => {
    // fullLog: the -100 tail must never truncate a big cascade's delta lines.
    const frame = buildMatchState({ state, schools, bots, log, epoch, events, forfeit: null }, viewer, { relative: true, fullLog: true });
    frame.legal = []; // a replay is inert — nothing to click
    frames.push(frame);
  };
  let state = createGame({ seed: row.seed, players: [seats[0].deck, seats[1].deck], ...(hp ? { startingHp: hp } : {}) });
  push(state, [`Match start: ${schools[0]} vs ${schools[1]} — seed ${row.seed}`], [], 0);
  actions.forEach(({ s, a }, i) => {
    // Same per-viewer transcript the live server writes in applyAction.
    const log = [`${s === viewer ? "You" : "Opp"}: ${actionLabelFor(viewer, state, a, s)}`];
    const { state: next, events } = apply(state, a, s);
    for (const e of events) {
      const line = describeEvent(eventForViewer(e, viewer, true) as GameEvent);
      if (line) log.push(`   ${line}`);
    }
    state = next;
    push(state, log, events, i + 1);
  });
  // Outcome checksum against silent drift: apply() validates structure, so a
  // values-only rules change can replay cleanly to a game that never happened.
  // A natural (in-game) stored ending must reproduce exactly; forfeit/abandoned
  // rows are out-of-band, so their non-terminal (or crash-window terminal) tails
  // prove nothing and are served as-is.
  const stored = row.result ? (JSON.parse(row.result) as { winner: PlayerId | null; endReason: string | null }) : null;
  if (stored?.endReason && stored.endReason !== "forfeit" && stored.endReason !== "abandoned") {
    if (!isTerminal(state) || state.winner !== stored.winner || state.endReason !== stored.endReason) {
      throw new Error(
        `replay outcome drift: stored ${stored.endReason}/${String(stored.winner)}, replayed ${String(state.endReason)}/${String(state.winner)}`,
      );
    }
  }
  return frames;
}
