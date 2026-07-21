/**
 * Low-level, leaf-level state mutators. Everything here mutates a working draft
 * of GameState and appends events. No imports from mechanics/effects, so the
 * effect DSL and the turn machinery can both build on it without import cycles.
 */
import { getCard, getComponent } from "@ibokki/cards";
import { rngInt, shuffleInPlace } from "./rng.ts";
import {
  otherPlayer,
  type CardInstance,
  type GameEvent,
  type GameState,
  type OngoingExpiry,
  type OngoingKind,
  type PlayerId,
  type PlayerState,
  type Ward,
} from "./types.ts";

export function winnerByHp(state: GameState): PlayerId | null {
  const [a, b] = state.players;
  if (a.hp > b.hp) return 0;
  if (b.hp > a.hp) return 1;
  return null;
}

export function endGame(
  state: GameState,
  winner: PlayerId | null,
  reason: GameState["endReason"],
  events: GameEvent[],
): void {
  if (state.phase === "gameover") return;
  state.phase = "gameover";
  state.winner = winner;
  state.endReason = reason;
  events.push({ type: "gameOver", winner, reason: reason! });
}

/**
 * Draw up to n cards from the resource deck into hand. When the deck runs empty the
 * discard pile is shuffled back in and the player takes escalating exhaustion damage
 * (2 x their reshuffle count) — the deck is a cycling engine, not a loss condition,
 * and exhaustion is the game's slow clock (also what makes milling a pressure plan).
 * Exhaustion is internal strain, not an attack: it BYPASSES wards, reduction, and
 * prevention entirely and hits HP directly (otherwise ward walls stretch the clock
 * into hundreds of turns — playtest cvc6).
 * Returns the count drawn (short only if deck AND discard are empty, or the game ends).
 */
export function drawN(state: GameState, playerId: PlayerId, n: number, events: GameEvent[]): number {
  const player = state.players[playerId];
  let drawn = 0;
  while (drawn < n) {
    if (player.resourceDeck.length === 0) {
      if (player.discard.length === 0) break; // nothing anywhere to draw
      player.resourceDeck = player.discard;
      player.discard = [];
      state.rngState = shuffleInPlace(player.resourceDeck, state.rngState);
      player.reshuffles++;
      const damage = 2 * player.reshuffles;
      events.push({ type: "reshuffled", player: playerId, count: player.reshuffles, damage });
      player.hp -= damage; // unpreventable: no wards, no reduction, no heal-conversion
      events.push({ type: "damage", target: playerId, amount: damage });
      if (player.hp <= 0) {
        endGame(state, otherPlayer(playerId), "hp", events);
        return drawn;
      }
      continue;
    }
    player.hand.push(player.resourceDeck.pop()!);
    drawn++;
  }
  return drawn;
}

/** Apply damage to a player, applying damage reduction, emitting the event, and ending on lethal. */
export function dealDamageToPlayer(
  state: GameState,
  targetId: PlayerId,
  amount: number,
  events: GameEvent[],
): void {
  if (amount <= 0) return;
  const target = state.players[targetId];
  const reduction = sumOngoing(target, "damageReduction");
  let dealt = Math.max(0, amount - reduction);
  if (amount - dealt > 0) target.damagePreventedThisRound += amount - dealt;
  if (dealt <= 0) return;

  // Inversion Field: convert incoming damage into healing, up to a per-round cap.
  const healCap = sumOngoing(target, "damageToHeal");
  if (healCap > 0) {
    const healed = Math.min(Math.max(0, healCap - target.damageHealedThisRound), dealt);
    if (healed > 0) {
      target.hp += healed;
      target.damageHealedThisRound += healed;
      target.damagePreventedThisRound += healed;
      events.push({ type: "healed", player: targetId, amount: healed });
      dealt -= healed;
    }
  }
  if (dealt <= 0) return;

  // Wards are HP objects: damage soaks into them (oldest first) before reaching the
  // wizard. A ward may reflect when it absorbs and may fire an on-destroy trigger.
  while (dealt > 0 && target.wards.length > 0) {
    const ward = target.wards[0]!;
    const absorbed = Math.min(dealt, ward.hp);
    ward.hp -= absorbed;
    dealt -= absorbed;
    events.push({ type: "wardDamaged", player: targetId, amount: absorbed });
    if (ward.reflectOnPrevent && absorbed > 0) {
      const oid = otherPlayer(targetId); // chip damage (no further ward routing) avoids reflect loops
      state.players[oid].hp -= ward.reflectOnPrevent;
      events.push({ type: "damage", target: oid, amount: ward.reflectOnPrevent });
      if (state.players[oid].hp <= 0) {
        endGame(state, targetId, "hp", events);
        return;
      }
    }
    if (ward.hp <= 0) {
      target.wards.shift();
      events.push({ type: "wardDestroyed", player: targetId });
      fireWardDestroyed(state, targetId, ward, events);
      if (state.phase === "gameover") return;
    }
  }
  if (dealt <= 0) return;
  target.hp -= dealt;
  events.push({ type: "damage", target: targetId, amount: dealt });
  if (target.hp <= 0) endGame(state, otherPlayer(targetId), "hp", events);
}

/** Fire a ward's on-destroy trigger (combat destruction only): refuel / replace / heal. */
function fireWardDestroyed(state: GameState, ownerId: PlayerId, ward: Ward, events: GameEvent[]): void {
  if (ward.onDestroy === "draw2") {
    const d = drawN(state, ownerId, 2, events);
    if (d > 0) events.push({ type: "drew", player: ownerId, count: d });
  } else if (ward.onDestroy === "replace2") {
    createWard(state, ownerId, 2, events);
  } else if (ward.onDestroy === "heal5") {
    healPlayer(state, ownerId, 5, events);
  }
}

export function healPlayer(state: GameState, id: PlayerId, amount: number, events: GameEvent[]): void {
  if (amount <= 0) return;
  state.players[id].hp += amount;
  events.push({ type: "healed", player: id, amount });
}

export function addBurn(state: GameState, targetId: PlayerId, amount: number, events: GameEvent[]): void {
  if (amount <= 0) return;
  state.players[targetId].burn += amount;
  events.push({ type: "burnApplied", target: targetId, amount });
}

// ---- Wards -------------------------------------------------------------------

export type WardFlags = Partial<Pick<Ward, "onDestroy" | "onDestroyExpires" | "reflectOnPrevent" | "protected" | "level1Immunity" | "firstOppCastDraw">>;

export function createWard(
  state: GameState,
  ownerId: PlayerId,
  hp: number,
  events: GameEvent[],
  flags?: WardFlags,
): Ward {
  const ward: Ward = { wid: state.nextIid++, hp, ...flags };
  state.players[ownerId].wards.push(ward);
  events.push({ type: "wardCreated", player: ownerId, hp });
  return ward;
}

export function dealDamageToWard(
  state: GameState,
  ownerId: PlayerId,
  ward: Ward,
  amount: number,
  events: GameEvent[],
): void {
  if (amount <= 0) return;
  ward.hp -= amount;
  events.push({ type: "wardDamaged", player: ownerId, amount });
  if (ward.hp <= 0) {
    const player = state.players[ownerId];
    player.wards = player.wards.filter((w) => w.wid !== ward.wid);
    events.push({ type: "wardDestroyed", player: ownerId });
  }
}

export function damageAllWards(
  state: GameState,
  ownerId: PlayerId,
  amount: number,
  events: GameEvent[],
  skipProtected = false,
): void {
  for (const ward of [...state.players[ownerId].wards]) {
    if (skipProtected && ward.protected) continue;
    dealDamageToWard(state, ownerId, ward, amount, events);
  }
}

/** Destroy every ward a player controls (optionally skipping opponent-protected ones); returns total HP destroyed. */
export function destroyAllWards(
  state: GameState,
  ownerId: PlayerId,
  events: GameEvent[],
  skipProtected = false,
): number {
  const player = state.players[ownerId];
  const doomed = skipProtected ? player.wards.filter((w) => !w.protected) : player.wards;
  let total = 0;
  for (const ward of doomed) total += Math.max(0, ward.hp);
  if (doomed.length > 0) {
    for (let i = 0; i < doomed.length; i++) events.push({ type: "wardDestroyed", player: ownerId });
    const doomedIds = new Set(doomed.map((w) => w.wid));
    player.wards = player.wards.filter((w) => !doomedIds.has(w.wid));
  }
  return total;
}

// ---- Ongoing effects ---------------------------------------------------------

export function addOngoing(
  state: GameState,
  ownerId: PlayerId,
  kind: OngoingKind,
  value: number,
  expiry: OngoingExpiry,
  events: GameEvent[],
): void {
  state.players[ownerId].ongoing.push({ id: state.nextIid++, owner: ownerId, kind, value, expiry });
  events.push({ type: "ongoingAdded", player: ownerId, kind });
}

export function sumOngoing(player: PlayerState, kind: OngoingKind): number {
  return player.ongoing.filter((o) => o.kind === kind).reduce((acc, o) => acc + o.value, 0);
}

// ---- Deck / hand manipulation ------------------------------------------------
// (millPlayer was deleted 2026-07-20 with the opponent-mill primitives — mill lost
//  the identity fight to Prophecy; see Design_Doc "prophecies replaced milling".)

export function discardWholeHand(state: GameState, id: PlayerId, events: GameEvent[]): number {
  const player = state.players[id];
  const n = player.hand.length;
  if (n > 0) {
    player.discard.push(...player.hand);
    player.hand = [];
    events.push({ type: "discarded", player: id, count: n });
  }
  return n;
}

/** Discard n random cards from a player's hand, optionally filtered (e.g. components only). */
export function discardRandom(
  state: GameState,
  id: PlayerId,
  n: number,
  events: GameEvent[],
  filter?: (defId: string) => boolean,
): number {
  const player = state.players[id];
  let count = 0;
  for (let i = 0; i < n; i++) {
    const candidates: number[] = [];
    player.hand.forEach((c, idx) => {
      if (!filter || filter(c.defId)) candidates.push(idx);
    });
    if (candidates.length === 0) break;
    let r: number;
    [r, state.rngState] = rngInt(state.rngState, candidates.length);
    const handIdx = candidates[r]!;
    player.discard.push(player.hand[handIdx]!);
    player.hand.splice(handIdx, 1);
    count++;
  }
  if (count > 0) events.push({ type: "discarded", player: id, count });
  return count;
}

/** Discard the n highest-symbol cards from a player's hand (auto-resolved choice). */
export function discardTopBySymbols(state: GameState, id: PlayerId, n: number, events: GameEvent[]): CardInstance[] {
  const player = state.players[id];
  const ranked = [...player.hand].sort((a, b) => symbolCount(b.defId) - symbolCount(a.defId));
  const chosen = ranked.slice(0, n);
  for (const c of chosen) {
    const idx = player.hand.findIndex((h) => h.iid === c.iid);
    if (idx >= 0) {
      player.discard.push(player.hand[idx]!);
      player.hand.splice(idx, 1);
    }
  }
  if (chosen.length > 0) events.push({ type: "discarded", player: id, count: chosen.length });
  return chosen;
}

/** Return up to n cards from the discard pile to hand (most-recent first), optionally filtered. */
export function returnFromDiscard(
  state: GameState,
  id: PlayerId,
  n: number,
  events: GameEvent[],
  filter?: (defId: string) => boolean,
): number {
  const player = state.players[id];
  let count = 0;
  for (let i = 0; i < n; i++) {
    let idx = -1;
    for (let j = player.discard.length - 1; j >= 0; j--) {
      if (!filter || filter(player.discard[j]!.defId)) {
        idx = j;
        break;
      }
    }
    if (idx < 0) break;
    player.hand.push(player.discard[idx]!);
    player.discard.splice(idx, 1);
    count++;
  }
  if (count > 0) events.push({ type: "recovered", player: id, count });
  return count;
}

/** Tutor: move up to n components from the resource deck to hand, then shuffle. */
export function tutorComponents(state: GameState, id: PlayerId, n: number, events: GameEvent[]): number {
  const player = state.players[id];
  let count = 0;
  for (let i = 0; i < n; i++) {
    const idx = player.resourceDeck.findIndex((c) => getComponent(c.defId) !== undefined);
    if (idx < 0) break;
    player.hand.push(player.resourceDeck[idx]!);
    player.resourceDeck.splice(idx, 1);
    count++;
  }
  if (count > 0) {
    state.rngState = shuffleInPlace(player.resourceDeck, state.rngState);
    events.push({ type: "searched", player: id, count });
  }
  return count;
}

export function shuffleDiscardIntoDeck(state: GameState, id: PlayerId, events: GameEvent[]): number {
  const player = state.players[id];
  const n = player.discard.length;
  if (n > 0) {
    player.resourceDeck.push(...player.discard);
    player.discard = [];
    state.rngState = shuffleInPlace(player.resourceDeck, state.rngState);
    events.push({ type: "shuffledIn", player: id, count: n });
  }
  return n;
}

export function shuffleHandIntoDeck(state: GameState, id: PlayerId, events: GameEvent[]): number {
  const player = state.players[id];
  const n = player.hand.length;
  if (n > 0) {
    player.resourceDeck.push(...player.hand);
    player.hand = [];
    state.rngState = shuffleInPlace(player.resourceDeck, state.rngState);
    events.push({ type: "shuffledIn", player: id, count: n });
  }
  return n;
}

// ---- Deck sculpting (Divination) ---------------------------------------------
// The Resource Deck draws from the END (drawN pops), so the END is the TOP of the
// deck and index 0 is the bottom. These primitives implement "look at the top N /
// select / reorder" faithfully; the *choice* is auto-resolved by a deterministic
// value heuristic (more symbols = more useful; trainers are mild utility) so bots
// and replays stay deterministic. A real UI can later surface the choice instead.

/** Heuristic usefulness of a Resource-Deck card for sculpting decisions. */
export function sculptValue(defId: string): number {
  const comp = getComponent(defId);
  if (comp) return comp.symbols.V + comp.symbols.S + comp.symbols.M; // 1 (basic) .. 3 (tri)
  const card = getCard(defId);
  if (card && (card.type === "Item" || card.type === "Gambit")) return 1.5;
  return 1;
}

/**
 * Look at the top `lookN` cards; move the best `takeN` (matching `filter`) to hand.
 * The remainder goes back on top best-first (default) or to the bottom. Returns the
 * number taken into hand.
 */
export function selectFromTop(
  state: GameState,
  id: PlayerId,
  lookN: number,
  takeN: number,
  events: GameEvent[],
  opts?: { filter?: (defId: string) => boolean; restToBottom?: boolean },
): number {
  const player = state.players[id];
  const deck = player.resourceDeck;
  const look = Math.min(lookN, deck.length);
  if (look === 0) return 0;
  const window = deck.splice(deck.length - look, look); // [deepest .. topmost]
  const eligible = window
    .filter((c) => !opts?.filter || opts.filter(c.defId))
    .sort((a, b) => sculptValue(b.defId) - sculptValue(a.defId));
  const taken = eligible.slice(0, takeN);
  const takenIids = new Set(taken.map((c) => c.iid));
  for (const c of taken) player.hand.push(c);
  const rest = window.filter((c) => !takenIids.has(c.iid));
  if (opts?.restToBottom) {
    player.resourceDeck.unshift(...rest); // bottom = front
  } else {
    rest.sort((a, b) => sculptValue(a.defId) - sculptValue(b.defId)); // best ends last = on top
    player.resourceDeck.push(...rest);
  }
  if (taken.length > 0) events.push({ type: "drew", player: id, count: taken.length });
  return taken.length;
}

/** Reorder the top `n` cards so the most useful are drawn first (pure sculpt, no card gain). */
export function reorderTopByValue(state: GameState, id: PlayerId, n: number): void {
  const deck = state.players[id].resourceDeck;
  const look = Math.min(n, deck.length);
  if (look <= 1) return;
  const window = deck.splice(deck.length - look, look);
  window.sort((a, b) => sculptValue(a.defId) - sculptValue(b.defId)); // best last = top
  deck.push(...window);
}

/** Draw `drawCount`, then bank the `bankCount` least-useful hand cards on top of the deck (loot). */
export function drawThenBankWorst(
  state: GameState,
  id: PlayerId,
  drawCount: number,
  bankCount: number,
  events: GameEvent[],
): void {
  const player = state.players[id];
  const drawn = drawN(state, id, drawCount, events);
  if (drawn > 0) events.push({ type: "drew", player: id, count: drawn });
  for (let i = 0; i < bankCount && player.hand.length > 0; i++) {
    let worst = 0;
    for (let j = 1; j < player.hand.length; j++) {
      if (sculptValue(player.hand[j]!.defId) < sculptValue(player.hand[worst]!.defId)) worst = j;
    }
    player.resourceDeck.push(player.hand.splice(worst, 1)[0]!);
  }
}

/** Search the deck for the most useful card (matching `filter`) and move it to the top. */
export function tutorBestToTop(
  state: GameState,
  id: PlayerId,
  events: GameEvent[],
  filter?: (defId: string) => boolean,
): boolean {
  const deck = state.players[id].resourceDeck;
  let bestIdx = -1;
  let bestVal = -Infinity;
  for (let i = 0; i < deck.length; i++) {
    if (filter && !filter(deck[i]!.defId)) continue;
    const v = sculptValue(deck[i]!.defId);
    if (v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) return false;
  deck.push(deck.splice(bestIdx, 1)[0]!);
  events.push({ type: "searched", player: id, count: 1 });
  return true;
}

/** Move a player's top card to the bottom of their deck (Scry Glyph-style soft disruption). */
export function topCardToBottom(state: GameState, id: PlayerId): boolean {
  const deck = state.players[id].resourceDeck;
  if (deck.length < 2) return false;
  deck.unshift(deck.pop()!);
  return true;
}

/** Count of V/S/M symbols on a card (component contribution or spell cost). */
export function symbolCount(defId: string): number {
  const comp = getComponent(defId);
  if (comp) return comp.symbols.V + comp.symbols.S + comp.symbols.M;
  const card = getCard(defId);
  if (card?.cost) return card.cost.V + card.cost.S + card.cost.M;
  return 0;
}
