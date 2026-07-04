/** Game setup: build the initial deterministic GameState. */
import { rngInt, shuffleInPlace } from "./rng.ts";
import type { CardInstance, GameState, PlayerId, PlayerState } from "./types.ts";

export interface PlayerConfig {
  /** The wizard's spellbook (collection of owned spells). */
  spellbook: string[];
  resourceDeck: string[];
}

export interface GameConfig {
  seed: number;
  startingHp?: number;
  players: [PlayerConfig, PlayerConfig];
}

export const DEFAULT_STARTING_HP = 30;

export function createGame(config: GameConfig): GameState {
  const hp = config.startingHp ?? DEFAULT_STARTING_HP;
  let iid = 0;
  let rngState = config.seed | 0;

  const buildPlayer = (id: PlayerId, cfg: PlayerConfig): PlayerState => {
    const spellbook: CardInstance[] = cfg.spellbook.map((defId) => ({ iid: iid++, defId }));
    const resourceDeck: CardInstance[] = cfg.resourceDeck.map((defId) => ({ iid: iid++, defId }));
    return {
      id,
      hp,
      level: 1,
      resourceDeck,
      spellbook,
      hand: [],
      prepared: [],
      discard: [],
      wards: [],
      burn: 0,
      reshuffles: 0,
      ongoing: [],
      reactionsCastThisRound: 0,
      damagePreventedThisRound: 0,
      gambitPlayedThisTurn: false,
      prepareDone: false,
      replacementsThisRound: 0,
      slotsUsedThisRound: 0,
      spellsCastThisRound: 0,
      damageHealedThisRound: 0,
      turnsTakenThisRound: 0,
      componentPlayedThisTurn: false,
      spellCastThisTurn: false,
      extraCastsThisTurn: 0,
      noCastThisTurn: false,
      nextSpellBonus: 0,
    };
  };

  const players: [PlayerState, PlayerState] = [
    buildPlayer(0, config.players[0]),
    buildPlayer(1, config.players[1]),
  ];

  // Only the Resource Deck is shuffled; the spellbook is a menu, not a draw pile.
  for (const p of players) {
    rngState = shuffleInPlace(p.resourceDeck, rngState);
  }

  const [coin, rngAfterCoin] = rngInt(rngState, 2);
  rngState = rngAfterCoin;
  const startingPlayer: PlayerId = coin === 0 ? 0 : 1;

  // The game opens in the Prepare phase; players choose their prepared spells
  // before the Main phase (opening draw of 5, then draw 1 per turn) begins.
  return {
    seed: config.seed,
    rngState,
    round: 1,
    turnCount: 0,
    startingPlayer,
    activePlayer: startingPlayer,
    priorityPlayer: startingPlayer,
    passStreak: 0,
    stack: [],
    phase: "prepare",
    players,
    nextIid: iid,
    winner: null,
    endReason: null,
    pendingChoice: null,
    finalTurnFor: null,
  };
}
