/** The pure reducer: apply one action to a state, producing a new state + events. */
import { getCard, getComponent, type ComponentDef } from "@ibokki/cards";
import { addCost, combinedSymbols, emptyCost, meetsCost, reactionCost } from "./cost.ts";
import { tierForLevel } from "./levels.ts";
import { beginTurn, completePrepare, endRoundAndLevelUp, MAX_HAND_SIZE, ROUND_TURN_LIMIT } from "./mechanics.ts";
import { getEffect, makeContext } from "./effects/index.ts";
import { drawN, sculptValue, shuffleHandIntoDeck, sumOngoing } from "./state-ops.ts";
import { pushToStack, resolveTop, topOpposingStackItem } from "./stack.ts";
import {
  isComponentDefId,
  otherPlayer,
  type Action,
  type ApplyResult,
  type GameEvent,
  type GameState,
  type PlayerId,
  type PreparedSpell,
} from "./types.ts";

function attachedComponents(prep: PreparedSpell): ComponentDef[] {
  const comps: ComponentDef[] = [];
  for (const a of prep.attached) {
    const c = getComponent(a.defId);
    if (c) comps.push(c);
  }
  return comps;
}

/**
 * A wizard just spent their last spell slot. The round does NOT end on the spot — the
 * OTHER wizard gets one final turn first (otherwise slot-exhaustion round-ending is a
 * first-player tempo weapon: dump your slots fast and strip the opponent's remaining
 * ones). The flag is consumed at the end of that final turn.
 */
function flagRoundEnd(state: GameState, events: GameEvent[]): void {
  if (state.finalTurnFor !== null) return; // already flagged
  state.finalTurnFor = otherPlayer(state.activePlayer);
  events.push({ type: "finalTurn", player: state.finalTurnFor });
}

/** After a pending choice resolves, return priority to the active player and flag round end if slots are spent. */
function resumeAfterChoice(state: GameState, events: GameEvent[]): void {
  state.priorityPlayer = state.activePlayer;
  if (state.phase === "main" && state.stack.length === 0) {
    const tier = tierForLevel(state.players[state.activePlayer].level);
    if (state.players[state.activePlayer].slotsUsedThisRound >= tier.slots) {
      flagRoundEnd(state, events);
    }
  }
}

/** End-of-turn hand cap: discard lowest-value cards down to MAX_HAND_SIZE. */
function enforceHandCap(state: GameState, id: PlayerId, events: GameEvent[]): void {
  const player = state.players[id];
  let count = 0;
  while (player.hand.length > MAX_HAND_SIZE) {
    let worst = 0;
    for (let i = 1; i < player.hand.length; i++) {
      if (sculptValue(player.hand[i]!.defId) < sculptValue(player.hand[worst]!.defId)) worst = i;
    }
    player.discard.push(player.hand.splice(worst, 1)[0]!);
    count++;
  }
  if (count > 0) events.push({ type: "handCapDiscard", player: id, count });
}

/** True if a prepared spell's attached components (plus any Attune bonus) satisfy its cost. */
function costMet(prep: PreparedSpell): boolean {
  const def = getCard(prep.spell.defId);
  if (!def || !def.cost) return false;
  const have = addCost(combinedSymbols(attachedComponents(prep)), prep.bonus ?? emptyCost());
  return meetsCost(def.cost, have);
}

/**
 * Apply `action`. The actor is the priority holder, except in the SIMULTANEOUS
 * prepare phase, where servers pass `actor` explicitly so both players can lay
 * spells concurrently (they're face-down — there is nothing to wait for).
 * Pure: clones state, never mutates the input. Throws on an illegal action
 * (callers should only submit actions from legalActions()).
 */
export function apply(prev: GameState, action: Action, actor?: PlayerId): ApplyResult {
  const state: GameState = structuredClone(prev);
  const events: GameEvent[] = [];
  if (state.phase === "gameover") return { state, events };

  // Outside prepare, the actor is always the priority holder — an explicit
  // `actor` there must agree (it exists only for concurrent preparing).
  const me = state.phase === "prepare" ? (actor ?? state.priorityPlayer) : state.priorityPlayer;
  if (actor !== undefined && actor !== me) throw new Error("Only the priority holder may act outside the prepare phase");
  const p = state.players[me];

  if (state.pendingChoice && action.type !== "choose") {
    throw new Error("Resolve the pending choice first");
  }

  const isPrepareAction =
    action.type === "prepareSpell" || action.type === "replacePrepared" || action.type === "donePreparing";
  if (isPrepareAction && state.phase !== "prepare") throw new Error("Prepare actions only valid in the Prepare phase");
  if (isPrepareAction && p.prepareDone) throw new Error("You have already finished preparing");
  if (!isPrepareAction && state.phase !== "main") throw new Error("Main actions only valid in the Main phase");

  switch (action.type) {
    case "prepareSpell": {
      const tier = tierForLevel(p.level);
      if (p.prepared.length >= tier.prepared) throw new Error("Prepared slots are full");
      const idx = p.spellbook.findIndex((s) => s.iid === action.spellIid);
      if (idx < 0) throw new Error("Spell not in spellbook");
      const spell = p.spellbook[idx]!;
      const def = getCard(spell.defId);
      if (!def) throw new Error("Unknown spell");
      if ((def.level ?? 1) > tier.maxSpellLevel) throw new Error("Spell level above your max castable level");

      p.spellbook.splice(idx, 1);
      p.prepared.push({ spell, faceDown: true, attached: [], cast: false, sealed: false });
      events.push({ type: "spellPrepared", player: me, spellDefId: spell.defId });
      break;
    }

    case "replacePrepared": {
      if (p.replacementsThisRound >= 1) throw new Error("Only one prepared-spell replacement per round");
      const tier = tierForLevel(p.level);
      const prep = p.prepared[action.preparedIndex];
      if (!prep) throw new Error(`No prepared spell at ${action.preparedIndex}`);
      const idx = p.spellbook.findIndex((s) => s.iid === action.spellIid);
      if (idx < 0) throw new Error("Spell not in spellbook");
      const incoming = p.spellbook[idx]!;
      const def = getCard(incoming.defId);
      if (!def) throw new Error("Unknown spell");
      if ((def.level ?? 1) > tier.maxSpellLevel) throw new Error("Spell level above your max castable level");

      p.spellbook.splice(idx, 1);
      p.discard.push(...prep.attached); // any attached components are spent
      p.spellbook.push(prep.spell); // the swapped-out spell returns to the book
      const outDefId = prep.spell.defId;
      p.prepared[action.preparedIndex] = { spell: incoming, faceDown: true, attached: [], cast: false, sealed: false };
      p.replacementsThisRound++;
      events.push({ type: "spellReplaced", player: me, outDefId, inDefId: incoming.defId });
      break;
    }

    case "donePreparing": {
      p.prepareDone = true;
      const other = otherPlayer(me);
      if (state.players[other].prepareDone) {
        completePrepare(state, events);
      } else {
        state.priorityPlayer = other;
      }
      break;
    }

    case "mulligan": {
      if (state.stack.length !== 0) throw new Error("Cannot mulligan with a pending stack");
      if (me !== state.activePlayer) throw new Error("Only the active player may mulligan");
      if (state.round !== 1 || p.turnsTakenThisRound !== 1 || p.componentPlayedThisTurn || p.slotsUsedThisRound !== 0) {
        throw new Error("Mulligan is only available for your opening hand (start of your first turn of the game)");
      }
      const newSize = Math.max(0, p.hand.length - 1);
      shuffleHandIntoDeck(state, me, events); // hand back into the Resource Deck (reshuffled)
      const drawn = drawN(state, me, newSize, events); // draw a fresh hand of one fewer
      if (drawn > 0) events.push({ type: "drew", player: me, count: drawn });
      events.push({ type: "mulliganed", player: me, newHandSize: drawn });
      break;
    }

    case "attach": {
      if (state.stack.length !== 0) throw new Error("Can only attach with an empty stack");
      if (me !== state.activePlayer) throw new Error("Only the active player can attach");
      const handIdx = p.hand.findIndex((c) => c.iid === action.handIid);
      if (handIdx < 0) throw new Error(`Card ${action.handIid} not in hand`);
      const card = p.hand[handIdx]!;
      if (!isComponentDefId(card.defId)) throw new Error(`${card.defId} is not a component`);
      const prep = p.prepared[action.preparedIndex];
      if (!prep) throw new Error(`No prepared spell at ${action.preparedIndex}`);
      if (prep.attached.length >= 2) throw new Error("2-card cap reached");

      p.hand.splice(handIdx, 1);
      prep.attached.push(card);
      p.componentPlayedThisTurn = true; // (only gates the mulligan; attaching is unlimited per turn)
      events.push({
        type: "attached",
        player: p.id,
        preparedIndex: action.preparedIndex,
        componentDefId: card.defId,
      });
      // Attune: the next component you attach counts as +1 of the symbol the spell still needs.
      const attuneIdx = p.ongoing.findIndex((o) => o.kind === "attuneBonus");
      if (attuneIdx >= 0) {
        p.ongoing.splice(attuneIdx, 1);
        const def = getCard(prep.spell.defId);
        if (def?.cost) {
          const have = addCost(combinedSymbols(attachedComponents(prep)), prep.bonus ?? emptyCost());
          const deficit = { V: def.cost.V - have.V, S: def.cost.S - have.S, M: def.cost.M - have.M };
          const pick = (["V", "S", "M"] as const).reduce((b, t) => (deficit[t] > deficit[b] ? t : b), "V" as "V" | "S" | "M");
          const bonus = prep.bonus ?? emptyCost();
          bonus[pick] += 1;
          prep.bonus = bonus;
        }
      }
      break;
    }

    case "detach": {
      if (state.stack.length !== 0) throw new Error("Can only detach with an empty stack");
      if (me !== state.activePlayer) throw new Error("Only the active player can detach");
      const prep = p.prepared[action.preparedIndex];
      const aidx = prep ? prep.attached.findIndex((c) => c.iid === action.componentIid) : -1;
      if (!prep || aidx < 0) throw new Error("That component is not attached there");
      const card = prep.attached.splice(aidx, 1)[0]!;
      p.hand.push(card);
      events.push({ type: "detached", player: me, componentDefId: card.defId });
      break;
    }

    case "cast": {
      if (state.stack.length !== 0) throw new Error("Normal spells are cast at sorcery speed (empty stack)");
      if (me !== state.activePlayer) throw new Error("Only the active player may cast");
      const tier = tierForLevel(p.level);
      if (p.slotsUsedThisRound >= tier.slots) throw new Error("No spell slots remaining");
      const prep = p.prepared[action.preparedIndex];
      if (!prep) throw new Error(`No prepared spell at ${action.preparedIndex}`);
      if (prep.cast || prep.sealed) throw new Error("Spell is not castable");
      if (p.noCastThisTurn) throw new Error("You cannot cast more spells this turn");
      if (p.spellCastThisTurn) throw new Error("You may cast only one spell per turn");
      const def = getCard(prep.spell.defId);
      if (!def || !def.cost) throw new Error(`${prep.spell.defId} is not a castable spell`);
      if (def.type === "Reaction") throw new Error("Reactions are cast with castReaction");
      if ((def.level ?? 1) > tier.maxSpellLevel) throw new Error("Spell level too high");
      if (!costMet(prep)) throw new Error("Cost not met");

      pushToStack(state, me, action.preparedIndex, false, null, events);
      p.spellCastThisTurn = true; // one non-Reaction spell per turn (Reactions are separate)
      state.priorityPlayer = me; // you keep priority — you may retract or pass to let it proceed
      state.passStreak = 0;
      break;
    }

    case "retractCast": {
      if (state.stack.length === 0) throw new Error("Nothing to retract");
      if (state.passStreak !== 0) throw new Error("Too late to retract — priority has passed");
      const top = state.stack[state.stack.length - 1]!;
      if (top.controller !== me) throw new Error("You can only retract your own spell");
      if (top.isReaction) throw new Error("Reactions cannot be retracted");
      state.stack.pop();
      const prep = p.prepared[top.preparedIndex];
      if (prep) {
        prep.cast = false;
        prep.faceDown = top.wasFaceDown; // re-hide if it was face-down
      }
      p.slotsUsedThisRound = Math.max(0, p.slotsUsedThisRound - 1);
      p.spellsCastThisRound = Math.max(0, p.spellsCastThisRound - 1);
      p.spellCastThisTurn = false; // taking it back frees your one cast this turn
      events.push({ type: "retracted", player: me, spellDefId: top.defId });
      // priority stays with you; passStreak is still 0.
      break;
    }

    case "castReaction": {
      if (state.stack.length === 0) throw new Error("A Reaction needs something to respond to");
      if (sumOngoing(state.players[otherPlayer(me)], "reactionsLocked") > 0) throw new Error("Your Reactions are locked");
      const tier = tierForLevel(p.level);
      const prep = p.prepared[action.preparedIndex];
      if (!prep) throw new Error(`No prepared spell at ${action.preparedIndex}`);
      if (prep.cast || prep.sealed) throw new Error("Reaction is not castable");
      const def = getCard(prep.spell.defId);
      if (!def || !def.cost) throw new Error(`${prep.spell.defId} is not a castable spell`);
      if (def.type !== "Reaction") throw new Error("Only Reactions can be cast in response");
      if ((def.level ?? 1) > tier.maxSpellLevel) throw new Error("Reaction level too high");

      // Fuel the Reaction from hand right now (you needn't have pre-attached components).
      if (action.payIids && action.payIids.length > 0) {
        if (prep.attached.length + action.payIids.length > 2) throw new Error("2-card cap reached");
        for (const iid of action.payIids) {
          const handIdx = p.hand.findIndex((c) => c.iid === iid);
          if (handIdx < 0) throw new Error(`Component ${iid} not in hand`);
          const card = p.hand[handIdx]!;
          if (!isComponentDefId(card.defId)) throw new Error(`${card.defId} is not a component`);
          p.hand.splice(handIdx, 1);
          prep.attached.push(card);
          events.push({
            type: "attached",
            player: p.id,
            preparedIndex: action.preparedIndex,
            componentDefId: card.defId,
          });
        }
      }

      // Stone Stance discounts the S cost of your first Reaction; Aetheric Lock taxes it.
      const cost = reactionCost(
        def.cost,
        sumOngoing(p, "reactionDiscountS"),
        sumOngoing(state.players[otherPlayer(me)], "reactionTax"),
      );
      if (!meetsCost(cost, combinedSymbols(attachedComponents(prep)))) throw new Error("Cost not met");
      const discIdx = p.ongoing.findIndex((o) => o.kind === "reactionDiscountS");
      if (discIdx >= 0) p.ongoing.splice(discIdx, 1); // consumed by the first Reaction played

      const target = topOpposingStackItem(state, me);
      pushToStack(state, me, action.preparedIndex, true, target?.sid ?? null, events);
      state.priorityPlayer = otherPlayer(me);
      state.passStreak = 0;
      break;
    }

    case "playTrainer": {
      // No cost, played from hand on your own turn, resolves immediately (no stack).
      if (state.stack.length !== 0) throw new Error("Trainers are played at sorcery speed (empty stack)");
      if (me !== state.activePlayer) throw new Error("Trainers are played only on your own turn");
      const handIdx = p.hand.findIndex((c) => c.iid === action.handIid);
      if (handIdx < 0) throw new Error(`Card ${action.handIid} not in hand`);
      const card = p.hand[handIdx]!;
      const def = getCard(card.defId);
      if (!def || (def.type !== "Item" && def.type !== "Gambit")) throw new Error(`${card.defId} is not a trainer`);
      if (def.type === "Gambit" && p.gambitPlayedThisTurn) throw new Error("Already played a Gambit this turn");

      p.hand.splice(handIdx, 1);
      events.push({ type: "trainerPlayed", player: me, defId: card.defId });
      const effect = getEffect(card.defId);
      if (effect) effect(makeContext(state, me, card, events), card);
      p.discard.push(card);
      if (def.type === "Gambit") p.gambitPlayedThisTurn = true;
      break;
    }

    case "choose": {
      const pc = state.pendingChoice;
      if (!pc) throw new Error("No choice is pending");
      if (me !== pc.player) throw new Error("Not your choice to make");
      const cidx = pc.candidates.findIndex((c) => c.iid === action.iid);
      if (cidx < 0) throw new Error(`Card ${action.iid} is not among the choices`);
      const card = pc.candidates.splice(cidx, 1)[0]!;
      if (pc.mode === "takeToHand") {
        p.hand.push(card); // staged card -> hand
      } else {
        const hidx = p.hand.findIndex((c) => c.iid === card.iid); // bankToDeckTop: hand card -> deck top
        if (hidx >= 0) p.hand.splice(hidx, 1);
        p.resourceDeck.push(card);
      }
      events.push({ type: "chose", player: me, defId: card.defId });
      pc.picksRemaining--;
      if (pc.picksRemaining <= 0 || pc.candidates.length === 0) {
        if (pc.mode === "takeToHand" && pc.candidates.length > 0) {
          if (pc.leftover === "top") p.resourceDeck.push(...pc.candidates);
          else p.resourceDeck.unshift(...pc.candidates);
        }
        state.pendingChoice = null;
        resumeAfterChoice(state, events); // hand priority back; round may end if slots were exhausted
      }
      break;
    }

    case "pass": {
      events.push({ type: "priorityPassed", player: me });
      if (state.stack.length === 0) {
        // Active player passing with an empty stack ends their turn.
        enforceHandCap(state, me, events);
        state.passStreak = 0;
        const bothAtTurnLimit =
          state.players[0].turnsTakenThisRound >= ROUND_TURN_LIMIT &&
          state.players[1].turnsTakenThisRound >= ROUND_TURN_LIMIT;
        if (state.finalTurnFor === state.activePlayer) {
          endRoundAndLevelUp(state, events); // the post-exhaustion final turn just finished
        } else if (bothAtTurnLimit) {
          endRoundAndLevelUp(state, events); // stalemate valve: neither wizard is casting
        } else {
          state.activePlayer = otherPlayer(state.activePlayer);
          beginTurn(state, events);
        }
      } else {
        state.passStreak++;
        if (state.passStreak >= 2) {
          resolveTop(state, events);
          state.passStreak = 0;
          if (state.pendingChoice) {
            state.priorityPlayer = state.pendingChoice.player; // pause for a look/loot/scry choice
          } else {
            state.priorityPlayer = state.activePlayer;
            if (state.phase === "main" && state.stack.length === 0) {
              // First wizard to exhaust spell slots flags the round (opponent gets a final turn).
              const tier = tierForLevel(state.players[state.activePlayer].level);
              if (state.players[state.activePlayer].slotsUsedThisRound >= tier.slots) {
                flagRoundEnd(state, events);
              }
            }
          }
        } else {
          state.priorityPlayer = otherPlayer(me);
        }
      }
      break;
    }

    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${JSON.stringify(_exhaustive)}`);
    }
  }

  return { state, events };
}
