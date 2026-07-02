/**
 * Turn / round machinery. Casting now goes through the LIFO stack (see ./stack);
 * this module owns the per-turn hooks (Burn, ongoing effects, the draw) and the
 * round → level-up transition.
 */
import { MAX_LEVEL, tierForLevel } from "./levels.ts";
import { dealDamageToPlayer, drawN, endGame, sumOngoing, winnerByHp } from "./state-ops.ts";
import { otherPlayer, type GameEvent, type GameState } from "./types.ts";

/**
 * Hard safety cap so a pathological game can never loop forever. Real games end
 * far sooner (HP or deck-out); this should never trigger in practice.
 */
export const TURN_CAP = 1000;

/** Enter the Prepare phase: the starting player chooses/adjusts prepared spells first. */
export function enterPrepare(state: GameState): void {
  state.phase = "prepare";
  state.priorityPlayer = state.startingPlayer;
  for (const player of state.players) {
    player.prepareDone = false;
    player.replacementsThisRound = 0;
  }
}

/** Both players have prepared: move to Main. The opening hand of 5 is drawn once, at game start. */
export function completePrepare(state: GameState, events: GameEvent[]): void {
  state.phase = "main";
  events.push({ type: "prepareComplete", round: state.round });
  if (state.round === 1) {
    // Opening hand: each Wizard draws 5 from the Resource Deck a single time, at the start of the
    // game. Later rounds have NO bulk draw — the hand persists and grows one card per turn.
    for (const player of state.players) {
      drawN(player, 5);
      events.push({ type: "drew", player: player.id, count: 5 });
    }
  }
  state.activePlayer = state.startingPlayer;
  beginTurn(state, events);
}

/** Start the active player's turn: grant priority, expiries, Burn tick, recurring effects, draw. */
export function beginTurn(state: GameState, events: GameEvent[]): void {
  state.turnCount++;
  if (state.turnCount > TURN_CAP) {
    endGame(state, winnerByHp(state), "turn-limit", events);
    return;
  }

  state.priorityPlayer = state.activePlayer;
  state.passStreak = 0;

  const player = state.players[state.activePlayer];

  // "Until the start of your next turn" effects this player owns expire now.
  player.ongoing = player.ongoing.filter((o) => o.expiry !== "startOfOwnNextTurn");
  player.componentPlayedThisTurn = false;
  player.spellCastThisTurn = false;
  player.gambitPlayedThisTurn = false;
  player.noCastThisTurn = false;

  // Burn markers tick at the start of the player's turn. The opponent owns any
  // amplifier (Conflagration/Phoenix add +1 damage per marker).
  const opp = state.players[otherPlayer(player.id)];
  if (player.burn > 0) {
    const dmg = player.burn * (1 + sumOngoing(opp, "burnDoubleDamage"));
    events.push({ type: "burnTick", player: player.id, amount: dmg });
    dealDamageToPlayer(state, player.id, dmg, events);
    if (state.phase === "gameover") return;
  }
  // Wildfire: while the active player owns this, the opponent's Burn also ticks now.
  if (sumOngoing(player, "burnAlsoTicksOwnTurn") > 0 && opp.burn > 0) {
    const dmg = opp.burn * (1 + sumOngoing(player, "burnDoubleDamage"));
    events.push({ type: "burnTick", player: opp.id, amount: dmg });
    dealDamageToPlayer(state, opp.id, dmg, events);
    if (state.phase === "gameover") return;
  }

  // Recurring self-damage (e.g. Channel Pyromancy).
  const selfDmg = player.ongoing
    .filter((o) => o.kind === "selfDamageEachTurn")
    .reduce((acc, o) => acc + o.value, 0);
  if (selfDmg > 0) {
    dealDamageToPlayer(state, player.id, selfDmg, events);
    if (state.phase === "gameover") return;
  }

  // Per-turn draw of 1. You open the game with a 5-card hand and act on your first turn without
  // an extra draw; every turn after that — this round and all later rounds — draws 1 (there is no
  // per-round bulk draw anymore).
  const openingTurn = state.round === 1 && player.turnsTakenThisRound === 0;
  if (!openingTurn) {
    if (player.resourceDeck.length === 0) {
      endGame(state, otherPlayer(player.id), "deckout", events);
      return;
    }
    drawN(player, 1);
    events.push({ type: "drew", player: player.id, count: 1 });
  }
  player.turnsTakenThisRound++;
  events.push({ type: "turnBegan", player: player.id, round: state.round });
}

/**
 * End the round and level both players up: clear round-scoped state, make
 * prepared spells re-castable (they PERSIST across rounds), then enter the next
 * Prepare phase. No bulk draw next round — the first turn of the new round draws 1 like any turn.
 */
export function endRoundAndLevelUp(state: GameState, events: GameEvent[]): void {
  events.push({ type: "roundEnded", round: state.round });
  state.round++;

  for (const player of state.players) {
    player.level = Math.min(player.level + 1, MAX_LEVEL);
    player.slotsUsedThisRound = 0;
    player.spellsCastThisRound = 0;
    player.damageHealedThisRound = 0;
    player.turnsTakenThisRound = 0;
    player.componentPlayedThisTurn = false;
    player.noCastThisTurn = false;
    player.burn = 0; // Burns expire at end of round.
    player.ongoing = player.ongoing.filter((o) => o.expiry !== "endOfRound");
    player.reactionsCastThisRound = 0;
    player.damagePreventedThisRound = 0;
    for (const prep of player.prepared) {
      prep.cast = false; // re-castable next round
      prep.sealed = false; // seals last only for the round
      delete prep.bonus; // Attune bonus is round-scoped
      // Components left attached at end of round are discarded — you rebuild each round.
      if (prep.attached.length > 0) {
        player.discard.push(...prep.attached);
        prep.attached = [];
      }
    }
    events.push({ type: "leveledUp", player: player.id, level: player.level });
  }

  enterPrepare(state);
}
