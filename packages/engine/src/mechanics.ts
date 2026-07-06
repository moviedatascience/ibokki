/**
 * Turn / round machinery. Casting now goes through the LIFO stack (see ./stack);
 * this module owns the per-turn hooks (Burn, ongoing effects, the draw) and the
 * round → level-up transition.
 */
import { MAX_LEVEL, tierForLevel } from "./levels.ts";
import { dealDamageToPlayer, drawN, endGame, sumOngoing, winnerByHp } from "./state-ops.ts";
import { otherPlayer, type GameEvent, type GameState, type PlayerId } from "./types.ts";

/**
 * Hard safety cap so a pathological game can never loop forever. Real games end
 * far sooner (HP, helped along by escalating exhaustion damage); this should never trigger in practice.
 */
export const TURN_CAP = 1000;

/** A round also ends once BOTH wizards have taken this many turns in it — two passive
 * wizards can otherwise stall a round forever (rounds normally end on slot exhaustion,
 * which requires someone to cast; playtest cvc6 sat in one round for 60+ turns). */
export const ROUND_TURN_LIMIT = 8;

/** End-of-turn maximum hand size; excess cards are discarded (lowest-value first). */
export const MAX_HAND_SIZE = 10;

/**
 * Who takes the first turn of `round`: the coin-flip winner leads round 1, then
 * the lead ALTERNATES every round — leading is an advantage (first cast, first
 * slot pressure), so neither wizard keeps it all game.
 */
export function roundLeader(state: GameState): PlayerId {
  return ((state.startingPlayer + (state.round - 1)) % 2) as PlayerId;
}

/** Enter the Prepare phase (simultaneous; priority marker parks on the round leader). */
export function enterPrepare(state: GameState): void {
  state.phase = "prepare";
  state.priorityPlayer = roundLeader(state);
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
      drawN(state, player.id, 5, events);
      events.push({ type: "drew", player: player.id, count: 5 });
    }
  }
  state.activePlayer = roundLeader(state);
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
  player.extraCastsThisTurn = 0;
  player.gambitPlayedThisTurn = false;
  player.noCastThisTurn = false;
  // "Next spell THIS TURN" buffs (Battle Trance / Empowered Chalk) die at the
  // turn boundary for both players — unspent means wasted.
  state.players[0].nextSpellBonus = 0;
  state.players[1].nextSpellBonus = 0;

  // Burn markers tick at the start of the burned player's turn: deal damage equal to the
  // marker count, then remove ONE marker. Burns persist across rounds (no round-clear) and
  // decay one per tick. The opponent owns any amplifier (Conflagration/Phoenix +1 per marker).
  const opp = state.players[otherPlayer(player.id)];
  if (player.burn > 0) {
    const dmg = player.burn * (1 + sumOngoing(opp, "burnDoubleDamage"));
    events.push({ type: "burnTick", player: player.id, amount: dmg });
    dealDamageToPlayer(state, player.id, dmg, events);
    player.burn--;
    if (state.phase === "gameover") return;
  }
  // Wildfire: while the active player owns this, the opponent's Burn also ticks (and decays) now.
  if (sumOngoing(player, "burnAlsoTicksOwnTurn") > 0 && opp.burn > 0) {
    const dmg = opp.burn * (1 + sumOngoing(player, "burnDoubleDamage"));
    events.push({ type: "burnTick", player: opp.id, amount: dmg });
    dealDamageToPlayer(state, opp.id, dmg, events);
    opp.burn--;
    if (state.phase === "gameover") return;
  }

  // Prophecies tick after Burn: every doom on the active player counts down one turn;
  // any that reach 0 fire. The payload was fixed at inscription (no amps); it's normal,
  // Ward-soakable damage unless the doom pierces (Oblivion — exhaustion-style direct HP).
  if (player.prophecies.length > 0) {
    const firing: typeof player.prophecies = [];
    player.prophecies = player.prophecies.filter((p) => {
      p.turnsLeft--;
      if (p.turnsLeft > 0) return true;
      firing.push(p);
      return false;
    });
    for (const p of firing) {
      events.push({ type: "prophecyFired", player: player.id, amount: p.amount, defId: p.defId });
      if (p.pierce) {
        player.hp -= p.amount; // the death you cannot ward: no wards, no reduction, no heal-conversion
        events.push({ type: "damage", target: player.id, amount: p.amount });
        if (player.hp <= 0) endGame(state, otherPlayer(player.id), "hp", events);
      } else {
        dealDamageToPlayer(state, player.id, p.amount, events);
      }
      if (state.phase === "gameover") return;
    }
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
  // an extra draw; every turn after that — this round and all later rounds — draws 1. An empty
  // deck is NOT a loss: drawN reshuffles the discard back in at the cost of escalating
  // exhaustion damage (the game's slow clock).
  const openingTurn = state.round === 1 && player.turnsTakenThisRound === 0;
  if (!openingTurn) {
    const drawn = drawN(state, player.id, 1, events);
    if (state.phase === "gameover") return; // exhaustion damage can be lethal
    if (drawn > 0) events.push({ type: "drew", player: player.id, count: drawn });
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
  state.finalTurnFor = null;

  for (const player of state.players) {
    player.level = Math.min(player.level + 1, MAX_LEVEL);
    player.slotsUsedThisRound = 0;
    player.spellsCastThisRound = 0;
    player.damageHealedThisRound = 0;
    player.turnsTakenThisRound = 0;
    player.componentPlayedThisTurn = false;
    player.noCastThisTurn = false;
    // Burn persists across rounds — it decays one marker per tick in beginTurn instead.
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
