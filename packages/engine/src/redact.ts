/**
 * Per-player redacted views. The server sends each player only what they may
 * see: your own hand and face-down spells are visible to you; the opponent's
 * hand is a count, and their face-down prepared spells hide their identity.
 * Attached components are public (face-up) for both players.
 */
import { tierForLevel } from "./levels.ts";
import { otherPlayer, type GameState, type PlayerId, type PreparedSpell } from "./types.ts";

export interface PreparedView {
  /** The spell's defId, or null when hidden (opponent's face-down spell). */
  spellDefId: string | null;
  faceDown: boolean;
  attached: string[];
  cast: boolean;
  sealed: boolean;
}

interface SideCommon {
  id: PlayerId;
  hp: number;
  level: number;
  /** Public Ward HP values. */
  wards: number[];
  /** Burn markers on this player. */
  burn: number;
  slotsUsedThisRound: number;
  slots: number;
  maxSpellLevel: number;
  preparedLimit: number;
  resourceDeckCount: number;
  spellbookCount: number;
  discard: string[];
  prepared: PreparedView[];
}

export interface SelfView extends SideCommon {
  hand: string[];
  /** Your spellbook (defIds) — the spells you may prepare. */
  spellbook: string[];
  prepareDone: boolean;
}

export interface OpponentView extends SideCommon {
  handCount: number;
}

export interface StackItemView {
  sid: number;
  controller: PlayerId;
  spellDefId: string;
  isReaction: boolean;
  cancelled: boolean;
  targetSid: number | null;
}

export interface PendingChoiceView {
  /** True if this viewer is the one who must choose. */
  mine: boolean;
  mode: "takeToHand" | "bankToDeckTop";
  reason: string;
  picksRemaining: number;
  /** Candidate card defIds — only populated for the chooser (private information). */
  candidates: string[];
}

export interface PlayerView {
  you: PlayerId;
  round: number;
  turnCount: number;
  activePlayer: PlayerId;
  priorityPlayer: PlayerId;
  /** Whether this viewer currently holds priority (i.e. it's their action). */
  youHavePriority: boolean;
  /** The stack, bottom-to-top. Cast spells are public. */
  stack: StackItemView[];
  phase: GameState["phase"];
  winner: PlayerId | null;
  endReason: GameState["endReason"];
  pendingChoice: PendingChoiceView | null;
  self: SelfView;
  opponent: OpponentView;
}

function preparedView(prep: PreparedSpell, hideFaceDown: boolean): PreparedView {
  return {
    spellDefId: hideFaceDown && prep.faceDown ? null : prep.spell.defId,
    faceDown: prep.faceDown,
    attached: prep.attached.map((a) => a.defId),
    cast: prep.cast,
    sealed: prep.sealed,
  };
}

export function redact(state: GameState, viewer: PlayerId): PlayerView {
  const me = state.players[viewer];
  const opp = state.players[otherPlayer(viewer)];
  const myTier = tierForLevel(me.level);
  const oppTier = tierForLevel(opp.level);

  return {
    you: viewer,
    round: state.round,
    turnCount: state.turnCount,
    activePlayer: state.activePlayer,
    priorityPlayer: state.priorityPlayer,
    youHavePriority: state.priorityPlayer === viewer,
    stack: state.stack.map((s) => ({
      sid: s.sid,
      controller: s.controller,
      spellDefId: s.defId,
      isReaction: s.isReaction,
      cancelled: s.cancelled,
      targetSid: s.targetSid,
    })),
    phase: state.phase,
    winner: state.winner,
    endReason: state.endReason,
    pendingChoice: state.pendingChoice
      ? {
          mine: state.pendingChoice.player === viewer,
          mode: state.pendingChoice.mode,
          reason: state.pendingChoice.reason,
          picksRemaining: state.pendingChoice.picksRemaining,
          // candidates are private — only the chooser sees what was revealed
          candidates: state.pendingChoice.player === viewer ? state.pendingChoice.candidates.map((c) => c.defId) : [],
        }
      : null,
    self: {
      id: me.id,
      hp: me.hp,
      level: me.level,
      wards: me.wards.map((w) => w.hp),
      burn: me.burn,
      slotsUsedThisRound: me.slotsUsedThisRound,
      slots: myTier.slots,
      maxSpellLevel: myTier.maxSpellLevel,
      preparedLimit: myTier.prepared,
      resourceDeckCount: me.resourceDeck.length,
      spellbookCount: me.spellbook.length,
      discard: me.discard.map((c) => c.defId),
      prepared: me.prepared.map((prep) => preparedView(prep, false)),
      hand: me.hand.map((c) => c.defId),
      spellbook: me.spellbook.map((c) => c.defId),
      prepareDone: me.prepareDone,
    },
    opponent: {
      id: opp.id,
      hp: opp.hp,
      level: opp.level,
      wards: opp.wards.map((w) => w.hp),
      burn: opp.burn,
      slotsUsedThisRound: opp.slotsUsedThisRound,
      slots: oppTier.slots,
      maxSpellLevel: oppTier.maxSpellLevel,
      preparedLimit: oppTier.prepared,
      resourceDeckCount: opp.resourceDeck.length,
      spellbookCount: opp.spellbook.length,
      discard: opp.discard.map((c) => c.defId),
      prepared: opp.prepared.map((prep) => preparedView(prep, true)),
      handCount: opp.hand.length,
    },
  };
}
