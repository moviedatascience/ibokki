/** Agent interface — anything that can choose an action from a redacted view. */
import { getCard, getComponent, type CardDef, type Cost } from "@ibokki/cards";
import { combinedSymbols, emptyCost, rngInt, type Action, type PlayerView, type PreparedView } from "@ibokki/engine";

export interface Agent {
  readonly name: string;
  /** Given what this player can see and the legal actions, pick one. */
  chooseAction(view: PlayerView, legal: Action[]): Action;
}

/** Picks uniformly at random — the fuzz tester / rules-robustness baseline. */
export class RandomBot implements Agent {
  readonly name = "random";
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  chooseAction(_view: PlayerView, legal: Action[]): Action {
    let idx: number;
    [idx, this.state] = rngInt(this.state, legal.length);
    return legal[idx]!;
  }
}

/**
 * A greedy heuristic that pilots every part of a deck: it keeps a Reaction
 * prepared and fueled, plays its trainers, resolves look/loot/scry choices by
 * card value instead of blindly, fuels its biggest spell before casting, and
 * only fires Reactions when the trade pays. The balance-matrix baseline and
 * the rollout policy for any future search bot.
 */
export class HeuristicBot implements Agent {
  readonly name = "heuristic";
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  chooseAction(view: PlayerView, legal: Action[]): Action {
    // Resolve a pending look/loot/scry choice by candidate value (see chooseFromPending).
    const choices = legal.filter((a) => a.type === "choose");
    if (choices.length > 0) return chooseFromPending(view, choices);

    // After casting you keep priority over your own spell — proceed (pass) rather than
    // react to yourself or retract.
    const top = view.stack[view.stack.length - 1];
    if (top && top.controller === view.you) {
      const pass = legal.find((a) => a.type === "pass");
      if (pass) return pass;
    }

    // Prepare phase: deliberately mix the slots — reserve one (two at 5+ slots) for the
    // cheapest Reaction so there is something to pre-attach fuel to, fill the rest with
    // the strongest castable spells.
    const prepares = legal.filter((a) => a.type === "prepareSpell");
    if (prepares.length > 0) return this.choosePrepare(view, prepares);
    const done = legal.find((a) => a.type === "donePreparing");
    if (done) return done;

    // Trainers first: they are pre-filtered to have an effect (the engine's no-op guard),
    // and damage amps / extra casts / tutors all want to land before this turn's cast.
    const trainer = legal.find((a) => a.type === "playTrainer");
    if (trainer) return trainer;

    // Fuel before casting: an attach that progresses an uncast spell/Reaction may upgrade
    // this turn's cast (Spark → Fireball) or arm a Reaction for the opponent's turn.
    const attaches = legal.filter((a) => a.type === "attach");
    const usefulAttach = this.pickUsefulAttach(view, attaches);
    if (usefulAttach) return usefulAttach;

    const casts = legal.filter((a) => a.type === "cast");
    if (casts.length > 0) {
      // Prefer casting the higher-level (bigger) prepared spell.
      let best = casts[0]!;
      let bestLvl = -1;
      for (const c of casts) {
        if (c.type !== "cast") continue;
        const prep = view.self.prepared[c.preparedIndex];
        const lvl = prep ? estimateLevel(prep.spellDefId) : 0;
        if (lvl > bestLvl) {
          bestLvl = lvl;
          best = c;
        }
      }
      return best;
    }

    // Reaction timing: a Reaction's fuel cost real cards, so make the trade pay.
    // Fire the CHEAPEST ready reaction whose card cost the threat's value beats
    // (a 1-S Echo Shield happily eats a 2-damage Spark; an SS cancel holds for
    // bigger spells). When desperate (low HP), fire anything at anything.
    const reactions = legal.filter((a) => a.type === "castReaction");
    if (reactions.length > 0 && top) {
      const threat = top.spellDefId ? threatValue(top.spellDefId) : 1;
      const desperate = view.self.hp <= 10;
      let best: Action | undefined;
      let bestCost = Infinity;
      for (const r of reactions) {
        if (r.type !== "castReaction") continue;
        const defId = view.self.prepared[r.preparedIndex]?.spellDefId;
        const cost = defId ? symbolCost(defId) : 1;
        if (cost < bestCost) {
          bestCost = cost;
          best = r;
        }
      }
      if (best && (desperate || threat >= bestCost + 1)) return best;
      // else: hold the Reactions, fall through to pass and let the small spell resolve.
    }

    // Leftover components: attach somewhere random rather than letting them rot.
    if (attaches.length > 0) {
      let idx: number;
      [idx, this.state] = rngInt(this.state, attaches.length);
      return attaches[idx]!;
    }

    return { type: "pass" };
  }

  /** Prepare a Reaction until the reserve target is met, otherwise the strongest spell. */
  private choosePrepare(view: PlayerView, prepares: Action[]): Action {
    const defOf = (a: Action): CardDef | undefined => {
      if (a.type !== "prepareSpell") return undefined;
      const i = view.self.spellbookIids.indexOf(a.spellIid);
      return i >= 0 ? getCard(view.self.spellbook[i]!) : undefined;
    };
    const reactionsPrepared = view.self.prepared.filter(
      (p) => p.spellDefId && getCard(p.spellDefId)?.type === "Reaction",
    ).length;
    const reactionTarget = view.self.preparedLimit >= 5 ? 2 : 1;

    let bestSpell: Action | undefined;
    let bestSpellScore = -1;
    let bestReaction: Action | undefined;
    let bestReactionCost = Infinity;
    for (const a of prepares) {
      const def = defOf(a);
      if (!def) continue;
      if (def.type === "Reaction") {
        const cost = def.cost ? def.cost.V + def.cost.S + def.cost.M : 1;
        if (cost < bestReactionCost) {
          bestReactionCost = cost;
          bestReaction = a;
        }
      } else {
        // Level first, then board impact (damage/dooms OR wards/prevention), then book
        // order: pure utility (draw/sculpt) fills leftover slots. Threat-only here breaks
        // Abjuration (it stops preparing walls); order-only buries Divination's prophecy
        // spells behind its draw engine and the bot never plays its win condition.
        const score = (def.level ?? 1) * 100 + threatValue(def.id) + defenseValue(def.id);
        if (score > bestSpellScore) {
          bestSpellScore = score;
          bestSpell = a;
        }
      }
    }
    if (reactionsPrepared < reactionTarget && bestReaction) return bestReaction;
    return bestSpell ?? bestReaction ?? prepares[0]!;
  }

  /**
   * An attach that progresses an uncast prepared card, or undefined. Reactions first
   * (their cost must be pre-attached before the reaction window), then the highest-level
   * unfueled spell.
   */
  private pickUsefulAttach(view: PlayerView, attaches: Action[]): Action | undefined {
    let best: Action | undefined;
    let bestScore = -1;
    for (const a of attaches) {
      if (a.type !== "attach") continue;
      const prep = view.self.prepared[a.preparedIndex];
      const handIdx = view.self.handIids.indexOf(a.handIid);
      const comp = handIdx >= 0 ? getComponent(view.self.hand[handIdx]!) : undefined;
      if (!prep || !comp || prep.cast || prep.sealed) continue;
      const def = prep.spellDefId ? getCard(prep.spellDefId) : undefined;
      if (!def || !def.cost) continue;
      const missing = missingCost(def.cost, prep);
      const helps = comp.symbols.V * missing.V + comp.symbols.S * missing.S + comp.symbols.M * missing.M;
      if (helps <= 0) continue;
      // Reactions outrank spells; bigger spells outrank smaller.
      const score = (def.type === "Reaction" ? 100 : 0) + (def.level ?? 1);
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    }
    return best;
  }
}

/**
 * Score a pending-choice candidate by what the pick DOES with it: gains (take/bank/
 * bounce/order) want the most valuable card, self-discards want the least valuable —
 * except discardForDamage (Wild Surge), where symbols ARE the damage.
 */
const DISCARD_MODES = new Set(["discardForSearch", "discardThenDraw", "discardToDeckTop"]);

function chooseFromPending(view: PlayerView, choices: Action[]): Action {
  const pc = view.pendingChoice;
  if (!pc || pc.candidateIids.length === 0) return choices[0]!;
  const iidToDef = new Map<number, string>();
  pc.candidateIids.forEach((iid, i) => iidToDef.set(iid, pc.candidates[i]!));
  const wantLow = DISCARD_MODES.has(pc.mode);
  let best = choices[0]!;
  let bestScore = -Infinity;
  for (const a of choices) {
    if (a.type !== "choose") continue;
    const defId = iidToDef.get(a.iid);
    if (defId === undefined) continue;
    const v = cardValue(defId, view);
    const score = wantLow ? -v : v;
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return best;
}

/**
 * Rough worth of a resource card: a component is its symbol count, +1 when it pays
 * toward an unfueled prepared card right now; trainers sit between duals and tris.
 */
function cardValue(defId: string, view: PlayerView): number {
  const comp = getComponent(defId);
  if (comp) {
    let v = comp.symbols.V + comp.symbols.S + comp.symbols.M;
    for (const prep of view.self.prepared) {
      if (prep.cast || prep.sealed || !prep.spellDefId) continue;
      const cost = getCard(prep.spellDefId)?.cost;
      if (!cost) continue;
      const missing = missingCost(cost, prep);
      if (comp.symbols.V * missing.V + comp.symbols.S * missing.S + comp.symbols.M * missing.M > 0) {
        v += 1;
        break;
      }
    }
    return v;
  }
  const card = getCard(defId);
  if (card?.type === "Item" || card?.type === "Gambit") return 2.5;
  return 1;
}

/** Symbols a prepared spell still needs beyond what's already attached. */
function missingCost(cost: Cost, prep: PreparedView): Cost {
  const comps = prep.attached.map((defId) => getComponent(defId)).filter((c) => c !== undefined);
  const have = comps.length > 0 ? combinedSymbols(comps) : emptyCost();
  return {
    V: Math.max(0, cost.V - have.V),
    S: Math.max(0, cost.S - have.S),
    M: Math.max(0, cost.M - have.M),
  };
}

/** The spell's level (used as a tie-breaker to cast the bigger spell first). */
function estimateLevel(spellDefId: string | null): number {
  if (!spellDefId) return 0;
  return getCard(spellDefId)?.level ?? 1;
}

/** Total symbols in a card's cost — the cards a Reaction's fuel is worth. */
function symbolCost(defId: string): number {
  const cost = getCard(defId)?.cost;
  return cost ? cost.V + cost.S + cost.M : 1;
}

/** Rough defensive worth of a spell: ward HP it creates or adds, healing, prevention. */
function defenseValue(defId: string): number {
  const def = getCard(defId);
  if (!def) return 0;
  let v = 0;
  for (const m of def.text.matchAll(/ward with (\d+) hp/gi)) v += Number(m[1]);
  for (const m of def.text.matchAll(/add (\d+) hp/gi)) v += Number(m[1]);
  for (const m of def.text.matchAll(/gains? (\d+) hp/gi)) v += Number(m[1]);
  for (const m of def.text.matchAll(/prevent (\d+)/gi)) v += Number(m[1]);
  return v;
}

/** Rough worth of an incoming spell: its biggest "deal N damage", plus a burn
 *  engine bump; non-damage utility spells scale with level. */
function threatValue(defId: string): number {
  const def = getCard(defId);
  if (!def) return 1;
  let v = 0;
  for (const m of def.text.matchAll(/deal (\d+)/gi)) v = Math.max(v, Number(m[1]));
  if (/burn marker/i.test(def.text)) v += 2;
  if (v === 0) v = (def.level ?? 1) >= 2 ? 3 : 1;
  return v;
}

export type AgentKind = "random" | "heuristic";

export function makeAgent(kind: AgentKind, seed: number): Agent {
  return kind === "random" ? new RandomBot(seed) : new HeuristicBot(seed);
}
