/**
 * Hand-built state helpers for the invariant / simultaneity / repro tests. Built FROM
 * createGame (then emptied) rather than as PlayerState literals, so new PlayerState
 * fields never need adding here (cf. the literal helpers in effects.test.ts /
 * interactions.test.ts).
 */
import { createGame, deckFor, type CardInstance, type GameState, type PlayerId, type StackItem } from "../src/index.ts";

/** A main-phase, round-1 state with empty zones; P0 active with priority, 30 HP each. */
export function emptyState(): GameState {
  const s = createGame({ seed: 1, players: [deckFor("Evocation"), deckFor("Abjuration")] });
  s.phase = "main";
  s.turnCount = 1;
  s.startingPlayer = 0;
  s.activePlayer = 0;
  s.priorityPlayer = 0;
  for (const p of s.players) {
    p.spellbook = [];
    p.resourceDeck = [];
    p.prepareDone = true;
    p.turnsTakenThisRound = 1;
  }
  return s;
}

export function card(s: GameState, defId: string): CardInstance {
  return { iid: s.nextIid++, defId };
}

/** Put `defId` into a new prepared slot of `who` (face-up, nothing attached); returns the slot index. */
export function prepare(s: GameState, who: PlayerId, defId: string): number {
  s.players[who].prepared.push({ spell: card(s, defId), faceDown: false, attached: [], cast: false, sealed: false });
  return s.players[who].prepared.length - 1;
}

/** A stack item for `who`'s prepared slot (fields mirror stack.ts pushToStack defaults). */
export function stackItem(s: GameState, who: PlayerId, preparedIndex: number, extra: Partial<StackItem> = {}): StackItem {
  const defId = s.players[who].prepared[preparedIndex]!.spell.defId;
  return {
    sid: s.nextIid++,
    controller: who,
    preparedIndex,
    defId,
    isReaction: false,
    level: 1,
    componentCount: 0,
    targetSid: null,
    cancelled: false,
    damageReduction: 0,
    reflect: 0,
    unstoppable: false,
    reactionProof: false,
    minDamage: 0,
    damageBonus: 0,
    wasFaceDown: false,
    retractable: false,
    ...extra,
  };
}
