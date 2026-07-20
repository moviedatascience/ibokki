/**
 * Display copy for ongoing-effect chips (engine `OngoingKind`). `mine` phrases the
 * description from the viewer's seat — the effect's OWNER is "you" on your plate and
 * "opponent" on theirs. Unknown kinds (engine ahead of client) fall back to the raw
 * kind string so a new effect is never invisible.
 */

export interface OngoingChip {
  kind: string;
  value: number;
  expiry: "endOfRound" | "startOfOwnNextTurn";
}

interface Info {
  label: (v: number) => string;
  desc: (v: number, mine: boolean) => string;
}

const INFO: Record<string, Info> = {
  damageBuff: {
    label: (v) => `+${v} DMG`,
    desc: (v, mine) => (mine ? `Your damaging spells deal +${v}.` : `Opponent's damaging spells deal +${v}.`),
  },
  selfDamageEachTurn: {
    label: (v) => `${v} RECOIL`,
    desc: (v, mine) =>
      mine ? `You take ${v} damage at the start of each of your turns.` : `Opponent takes ${v} damage at the start of each of their turns.`,
  },
  reactionTax: {
    label: (v) => `R TAX +${v}`,
    desc: (v, mine) => (mine ? `Opponent's Reactions cost ${v} more component(s).` : `Your Reactions cost ${v} more component(s).`),
  },
  reactionPunish: {
    label: (v) => `R PUNISH ${v}`,
    desc: (v, mine) =>
      mine ? `Opponent loses ${v} HP whenever they play a Reaction.` : `You lose ${v} HP whenever you play a Reaction.`,
  },
  burnDoubleDamage: {
    label: (v) => `BURN +${v}`,
    desc: (v, mine) => (mine ? `Burn you inflict deals +${v} damage per tick.` : `Burn they inflict deals +${v} damage per tick.`),
  },
  burnAlsoTicksOwnTurn: {
    label: () => `BURN 2×`,
    desc: (_v, mine) =>
      mine ? `Opponent's Burn also ticks at the start of your turns.` : `Your Burn also ticks at the start of their turns.`,
  },
  untargetableBySingle: {
    label: () => `VEILED`,
    desc: (_v, mine) =>
      mine
        ? `You can't be targeted by spells with only one attached component.`
        : `Opponent can't be targeted by spells with only one attached component.`,
  },
  reactionDiscountS: {
    label: (v) => `R −${v}S`,
    desc: (v, mine) =>
      mine
        ? `Your next Reaction costs ${v} fewer Somatic (min 1 component).`
        : `Opponent's next Reaction costs ${v} fewer Somatic (min 1 component).`,
  },
  reactionsLocked: {
    label: () => `R LOCK`,
    desc: (_v, mine) => (mine ? `Opponent can't play Reactions.` : `You can't play Reactions.`),
  },
  spellsUncounterable: {
    label: () => `RESOLVE`,
    desc: (_v, mine) =>
      mine
        ? `Your spells can't be cancelled, redirected, or reduced.`
        : `Opponent's spells can't be cancelled, redirected, or reduced.`,
  },
  damageToHeal: {
    label: (v) => `INVERT ${v}`,
    desc: (v, mine) =>
      mine
        ? `Incoming spell damage heals you instead (up to ${v} this round).`
        : `Incoming spell damage heals the opponent instead (up to ${v} this round).`,
  },
  cannotBeForcedToDiscard: {
    label: () => `IRON WILL`,
    desc: (_v, mine) =>
      mine
        ? `You can't be forced to discard or have your hand or prepared spells stripped.`
        : `Opponent can't be forced to discard or have their hand or prepared spells stripped.`,
  },
  drawLock: {
    label: () => `DRAW LOCK`,
    desc: (_v, mine) =>
      mine
        ? `Opponent can't draw cards with effects (their turn draw only).`
        : `You can't draw cards with effects (your turn draw only).`,
  },
  attuneBonus: {
    label: () => `ATTUNE`,
    desc: (_v, mine) =>
      mine
        ? `Your next attached component counts as +1 needed symbol.`
        : `Opponent's next attached component counts as +1 needed symbol.`,
  },
  damageReduction: {
    label: (v) => `DR ${v}`,
    desc: (v, mine) => (mine ? `Damage you take is reduced by ${v}.` : `Damage the opponent takes is reduced by ${v}.`),
  },
};

const EXPIRY: Record<OngoingChip["expiry"], (mine: boolean) => string> = {
  endOfRound: () => "until end of round",
  startOfOwnNextTurn: (mine) => (mine ? "until the start of your next turn" : "until the start of their next turn"),
};

export function ongoingLabel(o: OngoingChip): string {
  return INFO[o.kind]?.label(o.value) ?? o.kind;
}

export function ongoingDesc(o: OngoingChip, mine: boolean): string {
  const body = INFO[o.kind]?.desc(o.value, mine) ?? o.kind;
  const expiry = EXPIRY[o.expiry]?.(mine);
  return expiry ? `${body} Lasts ${expiry}.` : body;
}
