/**
 * The LIFO spell stack. Casting pushes an item; when both players pass priority
 * in a row, the top item resolves. Reactions resolve before the spell they
 * respond to and can cancel it, reduce its damage, or set up reflection.
 */
import { getCard } from "@ibokki/cards";
import { MIN_DAMAGE, REACTION_PROOF, UNSTOPPABLE } from "./cardFlags.ts";
import { dealDamageToPlayer, drawN, sumOngoing } from "./state-ops.ts";
import { getEffect, makeContext } from "./effects/index.ts";
import { otherPlayer, type GameEvent, type GameState, type PlayerId, type StackItem } from "./types.ts";

/** Push a cast spell or Reaction onto the stack (marks it cast & revealed). */
export function pushToStack(
  state: GameState,
  controller: PlayerId,
  preparedIndex: number,
  isReaction: boolean,
  targetSid: number | null,
  events: GameEvent[],
): void {
  const player = state.players[controller];
  const opponent = state.players[otherPlayer(controller)];
  const prep = player.prepared[preparedIndex]!;
  const def = getCard(prep.spell.defId);
  const defId = prep.spell.defId;

  const item: StackItem = {
    sid: state.nextIid++,
    controller,
    preparedIndex,
    defId,
    isReaction,
    level: def?.level ?? 1,
    componentCount: prep.attached.length,
    targetSid,
    cancelled: false,
    damageReduction: 0,
    reflect: 0,
    unstoppable: UNSTOPPABLE.has(defId) || sumOngoing(player, "spellsUncounterable") > 0,
    reactionProof: REACTION_PROOF.has(defId),
    minDamage: MIN_DAMAGE[defId] ?? 0,
    damageBonus: player.nextSpellBonus, // one-shot next-spell buff rides this cast
    wasFaceDown: prep.faceDown,
    retractable: !isReaction,
  };
  player.nextSpellBonus = 0;

  // Anything joining the stack commits every earlier cast — no take-backs
  // once a response exists.
  for (const it of state.stack) it.retractable = false;
  prep.cast = true;
  prep.faceDown = false;
  state.stack.push(item);

  if (isReaction) {
    player.reactionsCastThisRound++;
    events.push({ type: "reactionCast", player: controller, spellDefId: item.defId, targetSid });
    // Reaction-punish: the opponent owns the punisher; the reactor pays the toll.
    const punish = sumOngoing(opponent, "reactionPunish");
    if (punish > 0) dealDamageToPlayer(state, controller, punish, events);
  } else {
    player.slotsUsedThisRound++;
    player.spellsCastThisRound++;
    events.push({ type: "cast", player: controller, preparedIndex, spellDefId: item.defId });
    // First-cast-each-round ward trigger (Sentinel Rune): the opponent's ward owner draws.
    if (player.spellsCastThisRound === 1 && opponent.wards.some((w) => w.firstOppCastDraw)) {
      const drawn = drawN(state, opponent.id, 1, events);
      if (drawn > 0) events.push({ type: "drew", player: opponent.id, count: drawn });
    }
  }
}

/** Resolve the top stack item: run its effect (unless cancelled), reflect, discard components. */
export function resolveTop(state: GameState, events: GameEvent[]): void {
  const item = state.stack.pop();
  if (!item) return;
  const controller = state.players[item.controller];
  const prep = controller.prepared[item.preparedIndex];

  // Targeting immunity fizzles a non-Reaction spell that can't legally target the
  // defender: Aegis (1-component spells) or Stonewarden's ward (Level 1 spells).
  // A redirected spell (Misdirection) targets its own caster.
  const targetId = item.redirected ? item.controller : otherPlayer(item.controller);
  const targetP = state.players[targetId];
  const fizzled =
    !item.cancelled &&
    !item.isReaction &&
    ((item.componentCount === 1 && sumOngoing(targetP, "untargetableBySingle") > 0) ||
      (item.level === 1 && targetP.wards.some((w) => w.level1Immunity)));

  if (item.cancelled) {
    events.push({ type: "spellCancelled", controller: item.controller, spellDefId: item.defId });
  } else if (fizzled) {
    events.push({ type: "targetImmune", player: targetId, spellDefId: item.defId });
  } else {
    const effect = getEffect(item.defId);
    const evBase = events.length;
    if (effect && prep) {
      effect(makeContext(state, item.controller, prep.spell, events, item), prep.spell);
    } else if (!effect && !item.isReaction) {
      // Fallback for not-yet-implemented spells: deal level (minus any prevention).
      dealDamageToPlayer(state, targetId, Math.max(0, item.level - item.damageReduction), events);
    }
    // Reflect-by-actual (Final Riposte / Pyromancer's Reckoning): the Reaction resolved
    // earlier and left a multiplier; mirror the damage this spell ACTUALLY dealt its
    // victim (post-buff, post-ward-soak "damage" events) back onto the caster.
    if (item.reflectFactor && item.reflectFactor > 0 && state.phase !== "gameover") {
      const victim = otherPlayer(item.controller);
      let dealtToVictim = 0;
      for (let i = evBase; i < events.length; i++) {
        const e = events[i]!;
        if (e.type === "damage" && e.target === victim) dealtToVictim += e.amount;
      }
      if (dealtToVictim > 0) item.reflect += item.reflectFactor * dealtToVictim;
    }
    // Reflection (a Reaction set item.reflect): the spell's controller takes it.
    if (item.reflect > 0 && state.phase !== "gameover") dealDamageToPlayer(state, item.controller, item.reflect, events);
    events.push({ type: "spellResolved", controller: item.controller, spellDefId: item.defId });
  }

  // Components used to cast are discarded; the spell stays in prepared, face-up.
  if (prep) {
    controller.discard.push(...prep.attached);
    prep.attached = [];
  }
}

/** The topmost stack item controlled by someone other than `playerId` (a Reaction's natural target). */
export function topOpposingStackItem(state: GameState, playerId: PlayerId): StackItem | undefined {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const item = state.stack[i]!;
    if (item.controller !== playerId) return item;
  }
  return undefined;
}
