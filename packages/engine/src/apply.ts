/** The pure reducer: apply one action to a state, producing a new state + events. */
import { getCard, getComponent, type ComponentDef } from "@ibokki/cards";
import { addCost, combinedSymbols, emptyCost, meetsCost, reactionCost } from "./cost.ts";
import { ATTACH_M_TRAPS, trainerHasEffect } from "./cardFlags.ts";
import { replacementLimit, tierForLevel } from "./levels.ts";
import { beginTurn, completePrepare, endRoundAndLevelUp, MAX_HAND_SIZE, ROUND_TURN_LIMIT } from "./mechanics.ts";
import { getEffect, makeContext } from "./effects/index.ts";
import { dealDamageToPlayer, drawN, sculptValue, shuffleHandIntoDeck, sumOngoing, symbolCount } from "./state-ops.ts";
import { shuffleInPlace } from "./rng.ts";
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
/**
 * Trap Reactions (Volatile Bolt): while prepared face-down and fueled, they fire
 * AUTOMATICALLY when the opponent attaches an M component — no reaction window,
 * no stack. The trap flips face-up, spends itself and its components, and stings.
 */
function fireAttachTraps(state: GameState, attacher: PlayerId, events: GameEvent[]): void {
  const owner = state.players[otherPlayer(attacher)];
  if (sumOngoing(state.players[attacher], "reactionsLocked") > 0) return; // Arcane Anchor etc. silence traps too
  for (const prep of owner.prepared) {
    const dmg = ATTACH_M_TRAPS[prep.spell.defId];
    if (dmg === undefined || prep.cast || prep.sealed) continue;
    const def = getCard(prep.spell.defId);
    if (!def?.cost) continue;
    if ((def.level ?? 1) > tierForLevel(owner.level).maxSpellLevel) continue;
    if (!meetsCost(def.cost, combinedSymbols(attachedComponents(prep)))) continue; // must be armed
    prep.cast = true;
    prep.faceDown = false;
    owner.discard.push(...prep.attached);
    prep.attached = [];
    events.push({ type: "reactionCast", player: owner.id, spellDefId: prep.spell.defId, targetSid: null });
    dealDamageToPlayer(state, attacher, dmg + sumOngoing(owner, "damageBuff"), events);
    events.push({ type: "spellResolved", controller: owner.id, spellDefId: prep.spell.defId });
  }
}

/** Wrap up the pending choice: return/lay out leftovers, shuffle searches, resume flow. */
function finishPendingChoice(state: GameState, events: GameEvent[]): void {
  const pc = state.pendingChoice!;
  const p = state.players[pc.player];
  if (pc.mode === "takeToHand" && pc.candidates.length > 0) {
    if (pc.leftover === "top") p.resourceDeck.push(...pc.candidates);
    else p.resourceDeck.unshift(...pc.candidates);
  }
  if (pc.mode === "orderToTop") {
    p.resourceDeck.push(...pc.candidates); // safety: unpicked stage stays on top
    p.resourceDeck.push(...[...(pc.picked ?? [])].reverse()); // first pick ends topmost
  }
  if (pc.mode === "millFromTop" && pc.candidates.length > 0) {
    // Unpicked stage returns to the OPPONENT'S deck top in its original order.
    state.players[otherPlayer(pc.player)].resourceDeck.push(...pc.candidates);
  }
  if (pc.shuffleAfter) state.rngState = shuffleInPlace(p.resourceDeck, state.rngState);
  // Alchemy: "discard any number, THEN draw that many" — draws land after the picks.
  if (pc.mode === "discardThenDraw" && (pc.picked?.length ?? 0) > 0) {
    drawN(state, pc.player, pc.picked!.length, events);
  }
  // Calculated Draw: the follow-up draws happen once the deck is whole again.
  if (pc.drawAfter) drawN(state, pc.player, pc.drawAfter, events);
  state.pendingChoice = null;
  resumeAfterChoice(state, events);
}

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
    // "Up to N" / "you may" choices end early on pass ("Done").
    if (action.type === "pass" && state.pendingChoice.optional && me === state.pendingChoice.player) {
      finishPendingChoice(state, events);
      return { state, events };
    }
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
      if (p.replacementsThisRound >= replacementLimit(p.level)) {
        throw new Error("No prepared-spell replacements left this round");
      }
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
      // Volatile Bolt: an armed opposing trap fires the moment this attach carries an M symbol.
      if ((getComponent(card.defId)?.symbols.M ?? 0) > 0) fireAttachTraps(state, me, events);

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
      if (p.spellCastThisTurn && p.extraCastsThisTurn <= 0) throw new Error("You may cast only one spell per turn");
      const def = getCard(prep.spell.defId);
      if (!def || !def.cost) throw new Error(`${prep.spell.defId} is not a castable spell`);
      if (def.type === "Reaction") throw new Error("Reactions are cast with castReaction");
      if ((def.level ?? 1) > tier.maxSpellLevel) throw new Error("Spell level too high");
      if (!costMet(prep)) throw new Error("Cost not met");

      pushToStack(state, me, action.preparedIndex, false, null, events);
      // One non-Reaction spell per turn; Overclock grants extras (still slot-bound).
      if (p.spellCastThisTurn) {
        p.extraCastsThisTurn--;
        state.stack[state.stack.length - 1]!.usedExtraCast = true;
      } else {
        p.spellCastThisTurn = true;
      }
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
      if (!top.retractable) throw new Error("Too late to retract — the cast was committed");
      state.stack.pop();
      const prep = p.prepared[top.preparedIndex];
      if (prep) {
        prep.cast = false;
        prep.faceDown = top.wasFaceDown; // re-hide if it was face-down
      }
      p.slotsUsedThisRound = Math.max(0, p.slotsUsedThisRound - 1);
      p.spellsCastThisRound = Math.max(0, p.spellsCastThisRound - 1);
      if (top.usedExtraCast) p.extraCastsThisTurn++; // refund the Overclock grant
      else p.spellCastThisTurn = false; // taking it back frees your one cast this turn
      p.nextSpellBonus += top.damageBonus; // an unspent next-spell buff returns with the cast
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

      // Like any cast, a Reaction's cost must ALREADY be attached (no hand payment).
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
      if (!trainerHasEffect(state, me, card.defId)) throw new Error(`${def.name} would have no effect right now`);

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
      if (pc.eligibleIids && !pc.eligibleIids.includes(action.iid)) {
        throw new Error("That card cannot be chosen (shown for information only)");
      }
      const card = pc.candidates.splice(cidx, 1)[0]!;
      switch (pc.mode) {
        case "takeToHand":
          p.hand.push(card); // staged card -> hand
          break;
        case "bankToDeckTop": {
          const hidx = p.hand.findIndex((c) => c.iid === card.iid); // hand card -> deck top
          if (hidx >= 0) p.hand.splice(hidx, 1);
          p.resourceDeck.push(card);
          break;
        }
        case "discardForDamage": {
          // Wild Surge: discard the pick, opponent takes 1 per symbol.
          const hidx = p.hand.findIndex((c) => c.iid === card.iid);
          if (hidx >= 0) p.hand.splice(hidx, 1);
          p.discard.push(card);
          events.push({ type: "discarded", player: me, count: 1 });
          const base = symbolCount(card.defId) + sumOngoing(p, "damageBuff");
          const dmg = Math.max(0, base - (pc.damageReduction ?? 0));
          dealDamageToPlayer(state, otherPlayer(me), dmg, events);
          break;
        }
        case "discardForSearch": {
          // Mentor's Guidance: discard the pick, then search the whole deck for any one card.
          const hidx = p.hand.findIndex((c) => c.iid === card.iid);
          if (hidx >= 0) p.hand.splice(hidx, 1);
          p.discard.push(card);
          events.push({ type: "discarded", player: me, count: 1 });
          events.push({ type: "chose", player: me, defId: card.defId });
          if (p.resourceDeck.length === 0) {
            state.pendingChoice = null;
            resumeAfterChoice(state, events);
            return { state, events };
          }
          state.pendingChoice = {
            player: me,
            reason: "Search: take any one card from your deck",
            mode: "takeToHand",
            candidates: p.resourceDeck.splice(0, p.resourceDeck.length),
            picksRemaining: 1,
            leftover: "top",
            shuffleAfter: true,
          };
          events.push({ type: "choicePending", player: me, reason: "search" });
          return { state, events }; // the follow-up choice replaces this one
        }
        case "orderToTop":
          (pc.picked ??= []).push(card); // laid back on top at completion, first pick topmost
          break;
        case "bounceToOwnersDeckTop": {
          // Disarm: the pick is in the OPPONENT'S hand; it goes on top of their deck.
          const owner = state.players[otherPlayer(pc.player)];
          const hidx = owner.hand.findIndex((c) => c.iid === card.iid);
          if (hidx >= 0) owner.hand.splice(hidx, 1);
          owner.resourceDeck.push(card);
          events.push({ type: "bounced", player: owner.id, defId: card.defId });
          break;
        }
        case "millFromTop": {
          // Far Sight: the pick was staged off the OPPONENT'S deck top; discard it.
          const owner = state.players[otherPlayer(pc.player)];
          owner.discard.push(card);
          events.push({ type: "milled", player: owner.id, count: 1 });
          break;
        }
        case "reveal":
          break; // information only — nothing is pickable, so this never runs
        case "discardThenDraw": {
          // Alchemy: each pick is discarded now; the draws land when the choice ends.
          const hidx = p.hand.findIndex((c) => c.iid === card.iid);
          if (hidx >= 0) p.hand.splice(hidx, 1);
          p.discard.push(card);
          (pc.picked ??= []).push(card);
          events.push({ type: "discarded", player: me, count: 1 });
          break;
        }
        case "discardFromOpponentHand": {
          // Mind Theft: the pick is in the OPPONENT'S hand; it goes to their discard.
          const owner = state.players[otherPlayer(pc.player)];
          const hidx = owner.hand.findIndex((c) => c.iid === card.iid);
          if (hidx >= 0) owner.hand.splice(hidx, 1);
          owner.discard.push(card);
          events.push({ type: "discarded", player: owner.id, count: 1 });
          break;
        }
        case "discardToDeckTop": {
          // Mnemonic Charm: the pick is in YOUR discard; it goes on top of your deck.
          const didx = p.discard.findIndex((c) => c.iid === card.iid);
          if (didx >= 0) p.discard.splice(didx, 1);
          p.resourceDeck.push(card);
          break;
        }
        case "discardToHand": {
          // Recover / Salvage / Reclaim: the pick returns from YOUR discard to hand.
          const didx = p.discard.findIndex((c) => c.iid === card.iid);
          if (didx >= 0) p.discard.splice(didx, 1);
          p.hand.push(card);
          break;
        }
      }
      events.push({ type: "chose", player: me, defId: card.defId });
      if (pc.shuffleAfter) events.push({ type: "tutored", player: me, defId: card.defId }); // searches reveal the pick
      pc.picksRemaining--;
      if (pc.picksRemaining <= 0 || pc.candidates.length === 0) {
        finishPendingChoice(state, events); // hand priority back; round may end if slots were exhausted
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
        // Passing over a live stack commits every cast on it (see StackItem.retractable).
        for (const it of state.stack) it.retractable = false;
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
