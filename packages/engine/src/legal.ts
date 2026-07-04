/** Enumerate the legal actions for the player who holds priority. */
import { getCard, getComponent, type ComponentDef, type Cost } from "@ibokki/cards";
import { addCost, combinedSymbols, emptyCost, meetsCost, reactionCost } from "./cost.ts";
import { tierForLevel } from "./levels.ts";
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

function symbolTotal(def: ComponentDef): number {
  return def.symbols.V + def.symbols.S + def.symbols.M;
}

/**
 * Find a canonical set of hand components (≤ capRemaining cards) that, together with
 * `attached`, satisfies `cost`. Returns [] if already met, the iids to spend, or null
 * if it cannot be paid. Prefers spending fewer/cheaper cards so duals aren't wasted.
 */
function findHandPayment(
  cost: Cost,
  attached: ComponentDef[],
  hand: CardInstance[],
  capRemaining: number,
): number[] | null {
  if (meetsCost(cost, combinedSymbols(attached))) return [];
  if (capRemaining <= 0) return null;
  const comps = hand
    .filter((c) => isComponentDefId(c.defId))
    .map((c) => ({ iid: c.iid, def: getComponent(c.defId) }))
    .filter((c): c is { iid: number; def: ComponentDef } => c.def !== undefined);

  const singles = [...comps].sort((a, b) => symbolTotal(a.def) - symbolTotal(b.def));
  for (const s of singles) {
    if (meetsCost(cost, combinedSymbols([...attached, s.def]))) return [s.iid];
  }
  if (capRemaining < 2) return null;
  for (let i = 0; i < comps.length; i++) {
    for (let j = i + 1; j < comps.length; j++) {
      if (meetsCost(cost, combinedSymbols([...attached, comps[i]!.def, comps[j]!.def]))) {
        return [comps[i]!.iid, comps[j]!.iid];
      }
    }
  }
  return null;
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
    if (playerId !== state.pendingChoice.player) return [];
    return state.pendingChoice.candidates.map((c) => ({ type: "choose", iid: c.iid }));
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
    if (p.prepared.length >= tier.prepared && p.replacementsThisRound < 1) {
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

  if (state.stack.length === 0) {
    if (playerId !== state.activePlayer) return actions; // only active acts at sorcery speed

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
    if (p.slotsUsedThisRound < tier.slots && !p.noCastThisTurn && !p.spellCastThisTurn) {
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
    for (const card of p.hand) {
      const def = getCard(card.defId);
      if (!def) continue;
      if (def.type === "Item" || (def.type === "Gambit" && !p.gambitPlayedThisTurn)) {
        actions.push({ type: "playTrainer", handIid: card.iid });
      }
    }
  } else {
    // Stack non-empty. You may take back your own just-cast spell while you still hold
    // priority and nobody has responded yet (passStreak 0).
    const top = state.stack[state.stack.length - 1]!;
    if (top.controller === playerId && !top.isReaction && state.passStreak === 0) {
      actions.push({ type: "retractCast" });
    }
    // Reaction window: cast a prepared Reaction in response (no slot needed), unless the
    // opponent has locked your Reactions (Arcane Anchor / Absolute Defense). Cost may be
    // paid from hand now — Stone Stance discounts it, the opponent's Aetheric Lock taxes it.
    if (sumOngoing(state.players[otherPlayer(playerId)], "reactionsLocked") === 0) {
      const discount = sumOngoing(p, "reactionDiscountS");
      const tax = sumOngoing(state.players[otherPlayer(playerId)], "reactionTax");
      for (let i = 0; i < p.prepared.length; i++) {
        const prep = p.prepared[i]!;
        if (prep.cast || prep.sealed) continue;
        const def = getCard(prep.spell.defId);
        if (!def || !def.cost || def.type !== "Reaction") continue;
        if ((def.level ?? 1) > tier.maxSpellLevel) continue;
        const cost = reactionCost(def.cost, discount, tax);
        const pay = findHandPayment(cost, attachedComponents(prep), p.hand, 2 - prep.attached.length);
        if (pay === null) continue;
        if (pay.length === 0) actions.push({ type: "castReaction", preparedIndex: i });
        else actions.push({ type: "castReaction", preparedIndex: i, payIids: pay });
      }
    }
  }

  return actions;
}
