/**
 * Engine invariant checker (OPENSKY_REVIEW §D.19). `checkInvariants` inspects one
 * state and lists every violated structural rule; `assertInvariants` throws on any.
 * Called after every apply by the engine fuzz tests and by `runMatch({ checkInvariants })`
 * / `npm run sim -- --check`. Every check here CAN fail (see the negative tests in
 * packages/engine/test/invariants.test.ts) — an assert that can't fire is worse than none.
 *
 * Pure and read-only. Cost: one pass over all zones plus 1–2 legalActions calls.
 */
import { legalActions } from "./legal.ts";
import { MAX_LEVEL } from "./levels.ts";
import { otherPlayer, type CardInstance, type GameState } from "./types.ts";

/** Choice modes whose candidates (and `picked`) are STAGED OUT of a zone — the choice
 *  owns those cards until it finishes. All other modes alias cards still in a zone
 *  (hand / discard / opponent's prepared), except treatAsSymbol's synthetic descriptors. */
const STAGED_MODES: ReadonlySet<string> = new Set(["takeToHand", "orderToTop", "millFromTop"]);

export interface InvariantOptions {
  /** Expected total number of real cards (conservation across zones). Capture it from
   *  the initial state with `countCards`; omit to check uniqueness only. */
  cardCount?: number;
}

/** Number of real cards in all zones (incl. cards staged by a pending choice). */
export function countCards(state: GameState): number {
  let n = 0;
  for (const p of state.players) {
    n += p.hand.length + p.resourceDeck.length + p.discard.length + p.spellbook.length;
    for (const prep of p.prepared) n += 1 + prep.attached.length;
  }
  const pc = state.pendingChoice;
  if (pc && STAGED_MODES.has(pc.mode)) n += pc.candidates.length + (pc.picked?.length ?? 0);
  return n;
}

const nonNegInt = (v: number | undefined): boolean => v === undefined || (Number.isInteger(v) && v >= 0);

export function checkInvariants(state: GameState, opts: InvariantOptions = {}): string[] {
  const out: string[] = [];
  const v = (msg: string): void => {
    out.push(msg);
  };

  // ── 1. Card conservation: every real card iid lives in exactly one zone. ──────────
  const where = new Map<number, string>();
  let cards = 0;
  const zone = (list: readonly (CardInstance | null | undefined)[], name: string): void => {
    for (const c of list) {
      if (!c) {
        v(`undefined card in ${name}`);
        continue;
      }
      cards++;
      const prev = where.get(c.iid);
      if (prev !== undefined) v(`iid ${c.iid} (${c.defId}) is in BOTH ${prev} and ${name}`);
      else where.set(c.iid, name);
      if (!(c.iid >= 0 && c.iid < state.nextIid)) v(`iid ${c.iid} (${c.defId}) in ${name} is outside [0, nextIid=${state.nextIid})`);
    }
  };
  for (const p of state.players) {
    zone(p.hand, `P${p.id} hand`);
    zone(p.resourceDeck, `P${p.id} deck`);
    zone(p.discard, `P${p.id} discard`);
    zone(p.spellbook, `P${p.id} spellbook`);
    p.prepared.forEach((prep, i) => {
      zone([prep.spell], `P${p.id} prepared[${i}]`);
      zone(prep.attached, `P${p.id} prepared[${i}].attached`);
      if (prep.attached.length > 2) v(`P${p.id} prepared[${i}] has ${prep.attached.length} attached (cap 2)`);
    });
  }
  const pc = state.pendingChoice;
  if (pc && STAGED_MODES.has(pc.mode)) {
    zone(pc.candidates, `pendingChoice(${pc.mode}).candidates`);
    zone(pc.picked ?? [], `pendingChoice(${pc.mode}).picked`);
  }
  if (opts.cardCount !== undefined && cards !== opts.cardCount) {
    v(`card count ${cards} != expected ${opts.cardCount} (a card was lost or duplicated)`);
  }

  // ── 2. Unique non-card ids (sids / wids / ongoing ids share the nextIid counter). ──
  const ids = new Map<number, string>();
  const id = (n: number, name: string): void => {
    const prev = ids.get(n) ?? (where.has(n) ? `card iid in ${where.get(n)}` : undefined);
    if (prev !== undefined) v(`id ${n} used by both ${prev} and ${name}`);
    else ids.set(n, name);
    if (!(n >= 0 && n < state.nextIid)) v(`${name} id ${n} is outside [0, nextIid=${state.nextIid})`);
  };
  for (const s of state.stack) id(s.sid, `stack sid`);
  for (const p of state.players) {
    for (const w of p.wards) id(w.wid, `P${p.id} ward wid`);
    for (const o of p.ongoing) id(o.id, `P${p.id} ongoing ${o.kind}`);
  }

  // ── 3. Stack items reference real prepared slots; reaction targets are live. ──────
  const liveSids = new Set(state.stack.map((s) => s.sid));
  state.stack.forEach((s, i) => {
    const prep = state.players[s.controller]?.prepared[s.preparedIndex];
    if (!prep) v(`stack[${i}] ${s.defId}: preparedIndex ${s.preparedIndex} is not a prepared slot of P${s.controller}`);
    else if (prep.spell.defId !== s.defId) {
      v(`stack[${i}] ${s.defId}: P${s.controller} prepared[${s.preparedIndex}] holds ${prep.spell.defId}`);
    }
    if (s.targetSid !== null && !liveSids.has(s.targetSid)) v(`stack[${i}] ${s.defId}: targetSid ${s.targetSid} is not on the stack`);
    if (s.targetSid === s.sid) v(`stack[${i}] ${s.defId} targets itself`);
  });

  // ── 4. Numeric ranges. ───────────────────────────────────────────────────────────
  for (const p of state.players) {
    const P = `P${p.id}`;
    if (!Number.isFinite(p.hp)) v(`${P} hp is not finite (${p.hp})`);
    if (!(Number.isInteger(p.level) && p.level >= 1 && p.level <= MAX_LEVEL)) v(`${P} level ${p.level} outside 1..${MAX_LEVEL}`);
    if (!nonNegInt(p.burn)) v(`${P} burn ${p.burn} is negative / non-integer`);
    // Live-board shape only: a lethal hit ends the game mid-step (e.g. a reflect ward
    // kills the attacker before the soaked ward is removed), so a terminal snapshot may
    // legitimately hold a 0-HP ward or an un-ticked fuse.
    if (state.phase !== "gameover") {
      for (const w of p.wards) if (!(w.hp > 0)) v(`${P} ward ${w.wid} has hp ${w.hp} (dead wards must be removed)`);
      for (const pr of p.prophecies) {
        if (!(pr.turnsLeft >= 1)) v(`${P} prophecy ${pr.defId} has turnsLeft ${pr.turnsLeft} (should have fired)`);
      }
    }
    for (const pr of p.prophecies) if (!(pr.amount >= 0)) v(`${P} prophecy ${pr.defId} has negative amount ${pr.amount}`);
    const counters: [string, number | undefined][] = [
      ["reshuffles", p.reshuffles],
      ["slotsUsedThisRound", p.slotsUsedThisRound],
      ["spellsCastThisRound", p.spellsCastThisRound],
      ["reactionsCastThisRound", p.reactionsCastThisRound],
      ["damagePreventedThisRound", p.damagePreventedThisRound],
      ["damagePreventedTotal", p.damagePreventedTotal],
      ["damageHealedThisRound", p.damageHealedThisRound],
      ["turnsTakenThisRound", p.turnsTakenThisRound],
      ["replacementsThisRound", p.replacementsThisRound],
      ["extraCastsThisTurn", p.extraCastsThisTurn],
      ["nextSpellBonus", p.nextSpellBonus],
      ["freeAttach", p.freeAttach],
    ];
    for (const [name, val] of counters) if (!nonNegInt(val)) v(`${P} ${name} = ${val} (must be a non-negative integer)`);
  }

  // ── 5. Terminal consistency. ─────────────────────────────────────────────────────
  const terminal = state.phase === "gameover";
  if (terminal !== (state.endReason !== null)) v(`phase ${state.phase} but endReason ${state.endReason}`);
  if (!terminal && state.winner !== null) v(`winner ${state.winner} set on a live game`);
  if (!terminal) {
    for (const p of state.players) if (p.hp <= 0) v(`P${p.id} is at ${p.hp} HP but the game is not over`);
  }

  // ── 6. Pending choice: candidates exist; only the chooser acts, and can. ──────────
  if (pc) {
    if (!nonNegInt(pc.picksRemaining)) v(`pendingChoice.picksRemaining = ${pc.picksRemaining}`);
    const target = pc.target ?? otherPlayer(pc.player);
    if (pc.mode === "sealPrepared") {
      // Synthetic descriptors (no zone); each must map to a live, uncast, unsealed slot of the target.
      for (const c of pc.candidates) {
        const slot = pc.slotByIid?.[c.iid];
        const prep = slot === undefined ? undefined : state.players[target].prepared[slot];
        if (!prep) v(`pendingChoice(sealPrepared) candidate ${c.iid} (${c.defId}) maps to no prepared slot of P${target}`);
        else if (prep.cast || prep.sealed) v(`pendingChoice(sealPrepared) candidate ${c.iid} points at a slot that is already cast/sealed`);
        else if (prep.faceDown && !c.defId.startsWith("FACEDOWN-")) v(`pendingChoice(sealPrepared) candidate ${c.iid} names a face-down spell (${c.defId})`);
      }
    } else if (!STAGED_MODES.has(pc.mode) && pc.mode !== "treatAsSymbol") {
      // Aliased candidates must sit in the zone the resolving `choose` handler reads
      // (apply.ts) — otherwise the pick moves a card that isn't there and duplicates it.
      const me = `P${pc.player}`;
      const opp = `P${target}`;
      const expected: Partial<Record<string, RegExp>> = {
        bankToDeckTop: new RegExp(`^${me} hand$`),
        discardForDamage: new RegExp(`^${me} hand$`),
        discardForSearch: new RegExp(`^${me} hand$`),
        discardThenDraw: new RegExp(`^${me} (hand|discard)$`), // picks are discarded as they're made
        treatAsComponent: new RegExp(`^${me} hand$`),
        bounceToOwnersDeckTop: new RegExp(`^${opp} hand$`),
        discardFromOpponentHand: new RegExp(`^${opp} hand$`),
        reveal: new RegExp(`^${opp} (hand|deck)$`),
        discardToDeckTop: new RegExp(`^${me} discard$`),
        discardToHand: new RegExp(`^${me} discard$`),
      };
      const want = expected[pc.mode];
      for (const c of pc.candidates) {
        const at = where.get(c.iid);
        if (at === undefined) v(`pendingChoice(${pc.mode}) candidate ${c.iid} (${c.defId}) is in no zone`);
        else if (want && !want.test(at)) v(`pendingChoice(${pc.mode}) candidate ${c.iid} (${c.defId}) is in ${at}, not where the pick resolves`);
      }
    }
    if (pc.mode === "treatAsSymbol" && pc.carryIid !== undefined && !state.players[pc.player].hand.some((c) => c.iid === pc.carryIid)) {
      v(`pendingChoice(treatAsSymbol) carryIid ${pc.carryIid} is not in the chooser's hand`);
    }
    for (const e of pc.eligibleIids ?? []) {
      if (!pc.candidates.some((c) => c.iid === e)) v(`pendingChoice eligibleIid ${e} is not a candidate`);
    }
    if (!terminal) {
      if (legalActions(state, otherPlayer(pc.player)).length !== 0) v(`non-chooser P${otherPlayer(pc.player)} has actions during a pending choice`);
      if (legalActions(state, pc.player).length === 0) v(`chooser P${pc.player} is deadlocked (no legal actions)`);
    }
  } else if (!terminal) {
    // ── 7. No deadlock: whoever must act can. ─────────────────────────────────────
    if (state.phase === "prepare") {
      const undone = state.players.filter((p) => !p.prepareDone);
      if (undone.length === 0) v(`prepare phase with both players done`);
      for (const p of undone) if (legalActions(state, p.id).length === 0) v(`P${p.id} has no prepare actions`);
    } else if (legalActions(state, state.priorityPlayer).length === 0) {
      v(`priority player P${state.priorityPlayer} has no legal actions`);
    }
  }

  return out;
}

/** Throw if any invariant is violated. `label` (e.g. "seed 7 step 312") prefixes the message. */
export function assertInvariants(state: GameState, label?: string, opts?: InvariantOptions): void {
  const bad = checkInvariants(state, opts);
  if (bad.length > 0) {
    throw new Error(`${label ? `${label}: ` : ""}engine invariants violated:\n  - ${bad.join("\n  - ")}`);
  }
}

