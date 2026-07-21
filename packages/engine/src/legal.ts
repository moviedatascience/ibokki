/** Enumerate the legal actions for the player who holds priority. */
import { getCard, getComponent, type ComponentDef, type Cost } from "@ibokki/cards";
import { addCost, combinedSymbols, emptyCost, meetsCost, reactionCost } from "./cost.ts";
import { TRAP_REACTIONS, trainerHasEffect } from "./cardFlags.ts";
import { replacementLimit, tierForLevel } from "./levels.ts";
import { sumOngoing } from "./state-ops.ts";
import {
  isComponentDefId,
  otherPlayer,
  type Action,
  type CardInstance,
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

function costMet(prep: PreparedSpell): boolean {
  const def = getCard(prep.spell.defId);
  if (!def || !def.cost) return false;
  const have = addCost(combinedSymbols(attachedComponents(prep)), prep.bonus ?? emptyCost());
  return meetsCost(def.cost, have);
}

/**
 * Only the priority holder has actions. `pass` is always available, so the loop
 * can never deadlock. With an empty stack the active player acts at sorcery
 * speed (attach / cast); with a non-empty stack, any priority holder may cast a
 * Reaction in response.
 */
export function legalActions(state: GameState, playerId: PlayerId): Action[] {
  if (state.phase === "gameover") return [];
  // A pending look/loot/scry choice blocks everything else until it's resolved.
  if (state.pendingChoice) {
    const pc = state.pendingChoice;
    if (playerId !== pc.player) return [];
    const pickable = pc.eligibleIids ? pc.candidates.filter((c) => pc.eligibleIids!.includes(c.iid)) : pc.candidates;
    const actions: Action[] = pickable.map((c) => ({ type: "choose", iid: c.iid }));
    if (pc.optional) actions.push({ type: "pass" }); // "up to N" / "you may": done early
    return actions;
  }
  // Prepare phase is SIMULTANEOUS (spells go down face-down, so there is no
  // information to wait for): each player acts independently until they are
  // done, regardless of who holds priority.
  if (state.phase === "prepare") {
    const p = state.players[playerId];
    const tier = tierForLevel(p.level);
    if (p.prepareDone) return [];
    const prep: Action[] = [{ type: "donePreparing" }];
    const castable = (defId: string): boolean => {
      const def = getCard(defId);
      return !!def && (def.level ?? 1) <= tier.maxSpellLevel;
    };
    if (p.prepared.length < tier.prepared) {
      for (const s of p.spellbook) {
        if (castable(s.defId)) prep.push({ type: "prepareSpell", spellIid: s.iid });
      }
    }
    // When full, you may swap one prepared spell for a book spell (once per round).
    if (p.prepared.length >= tier.prepared && p.replacementsThisRound < replacementLimit(p.level)) {
      for (let i = 0; i < p.prepared.length; i++) {
        for (const s of p.spellbook) {
          if (castable(s.defId)) prep.push({ type: "replacePrepared", preparedIndex: i, spellIid: s.iid });
        }
      }
    }
    return prep;
  }

  if (playerId !== state.priorityPlayer) return [];

  const p = state.players[playerId];
  const tier = tierForLevel(p.level);

  const actions: Action[] = [{ type: "pass" }];

  // Phase Shift's rider: an instant-speed attach, offered in ANY window you hold
  // priority out of turn or mid-stack (forfeited by passing).
  const pushFreeAttaches = () => {
    if ((p.freeAttach ?? 0) <= 0) return;
    for (const card of p.hand) {
      if (!isComponentDefId(card.defId)) continue;
      for (let i = 0; i < p.prepared.length; i++) {
        if (p.prepared[i]!.attached.length >= 2) continue; // 2-card cap
        actions.push({ type: "attach", preparedIndex: i, handIid: card.iid });
      }
    }
  };

  if (state.stack.length === 0) {
    if (playerId !== state.activePlayer) {
      pushFreeAttaches();
      return actions; // only active acts at sorcery speed
    }

    // Mulligan: only for your OPENING hand — the very start of your first turn of the game
    // (round 1), before acting. Shuffle your hand back and draw one fewer; repeatable (each draw is
    // one smaller). Later rounds have no bulk draw, so there is nothing to mulligan.
    if (state.round === 1 && p.turnsTakenThisRound === 1 && !p.componentPlayedThisTurn && p.slotsUsedThisRound === 0 && p.hand.length > 0) {
      actions.push({ type: "mulligan" });
    }

    // Attach: any number of components per turn (the 2-card cap per spell still applies).
    for (const card of p.hand) {
      if (!isComponentDefId(card.defId)) continue;
      for (let i = 0; i < p.prepared.length; i++) {
        const prep = p.prepared[i]!;
        if (prep.attached.length >= 2) continue; // 2-card cap
        actions.push({ type: "attach", preparedIndex: i, handIid: card.iid });
      }
    }
    // Detach: take any attached component back to your hand (e.g. to re-aim it).
    for (let i = 0; i < p.prepared.length; i++) {
      for (const comp of p.prepared[i]!.attached) {
        actions.push({ type: "detach", preparedIndex: i, componentIid: comp.iid });
      }
    }

    // Cast a (non-Reaction) spell: one per turn, if a slot is free and you aren't cast-locked.
    if (p.slotsUsedThisRound < tier.slots && !p.noCastThisTurn && (!p.spellCastThisTurn || p.extraCastsThisTurn > 0)) {
      for (let i = 0; i < p.prepared.length; i++) {
        const prep = p.prepared[i]!;
        if (prep.cast || prep.sealed) continue;
        const def = getCard(prep.spell.defId);
        if (!def || !def.cost || def.type === "Reaction") continue;
        if ((def.level ?? 1) > tier.maxSpellLevel) continue;
        if (costMet(prep)) actions.push({ type: "cast", preparedIndex: i });
      }
    }

    // Play trainers from hand (Items unlimited; at most one Gambit per turn).
    // Plays that would deterministically do nothing are not offered (feel-bad guard).
    for (const card of p.hand) {
      const def = getCard(card.defId);
      if (!def) continue;
      if (def.type === "Item" || (def.type === "Gambit" && !p.gambitPlayedThisTurn)) {
        if (!trainerHasEffect(state, playerId, card.defId)) continue;
        actions.push({ type: "playTrainer", handIid: card.iid });
      }
    }
  } else {
    pushFreeAttaches(); // Phase Shift's rider works mid-stack too
    // Stack non-empty. You may take back your own just-cast spell only in the
    // window right after casting — once you pass (or anything responds), the
    // cast is committed, so you can't retract after seeing a Reaction.
    const top = state.stack[state.stack.length - 1]!;
    if (top.controller === playerId && !top.isReaction && top.retractable && state.passStreak === 0) {
      actions.push({ type: "retractCast" });
    }
    // Reaction window: cast a prepared Reaction in response (no slot needed), unless the
    // opponent has locked your Reactions (Arcane Anchor / Absolute Defense). Like any
    // spell, its cost must ALREADY be attached — holding components in reserve means
    // attaching them to your Reactions on your own turns, not paying from hand mid-window.
    // Stone Stance discounts the cost; the opponent's Aetheric Lock taxes it.
    // Reactions answer the OPPONENT'S cast on top of the stack only (ruling 2026-07-08) —
    // never your own spell, and never your own reaction: a second reaction of yours waits
    // for the first to resolve, when the opponent's spell surfaces again.
    if (top.controller !== playerId && sumOngoing(state.players[otherPlayer(playerId)], "reactionsLocked") === 0) {
      const discount = sumOngoing(p, "reactionDiscountS");
      const tax = sumOngoing(state.players[otherPlayer(playerId)], "reactionTax");
      for (let i = 0; i < p.prepared.length; i++) {
        const prep = p.prepared[i]!;
        if (prep.cast || prep.sealed) continue;
        const def = getCard(prep.spell.defId);
        if (!def || !def.cost || def.type !== "Reaction") continue;
        // Trap reactions (Volatile Bolt, Mana Drain, Searing Riposte) fire
        // automatically on their trigger — never cast from a reaction window.
        if (TRAP_REACTIONS.has(prep.spell.defId)) continue;
        if ((def.level ?? 1) > tier.maxSpellLevel) continue;
        const cost = reactionCost(def.cost, discount, tax);
        if (!meetsCost(cost, combinedSymbols(attachedComponents(prep)))) continue;
        actions.push({ type: "castReaction", preparedIndex: i });
      }
    }
  }

  return actions;
}
