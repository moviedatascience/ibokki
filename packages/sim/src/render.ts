/**
 * Shared, human-readable rendering of a game position, action labels, and events.
 * Used by the MCP server and the playtest CLI so they format identically.
 */
import { getCard, getComponent } from "@ibokki/cards";
import {
  legalActions,
  redact,
  type Action,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@ibokki/engine";

export function cardName(defId: string): string {
  const card = getCard(defId);
  if (card) return `${card.name} [${defId}]`;
  const comp = getComponent(defId);
  if (comp) return `${comp.name} [${defId}]`;
  return defId;
}

export function describeAction(state: GameState, action: Action, actor?: PlayerId): string {
  // Prepare is simultaneous, so the actor may not be the priority holder.
  const p = state.players[actor ?? state.priorityPlayer];
  switch (action.type) {
    case "prepareSpell": {
      const s = p.spellbook.find((c) => c.iid === action.spellIid);
      return `prepare ${s ? cardName(s.defId) : "?"}`;
    }
    case "replacePrepared": {
      const s = p.spellbook.find((c) => c.iid === action.spellIid);
      const out = p.prepared[action.preparedIndex];
      return `replace ${out ? cardName(out.spell.defId) : "?"} with ${s ? cardName(s.defId) : "?"}`;
    }
    case "donePreparing":
      return "done preparing";
    case "mulligan":
      return `mulligan (shuffle ${p.hand.length} back, draw ${Math.max(0, p.hand.length - 1)})`;
    case "pass":
      return state.stack.length === 0 ? "pass (end turn)" : "pass priority";
    case "attach": {
      const card = p.hand.find((c) => c.iid === action.handIid);
      return `attach ${card ? cardName(card.defId) : "?"} → prepared[${action.preparedIndex}]`;
    }
    case "cast": {
      const prep = p.prepared[action.preparedIndex];
      return `CAST ${prep ? cardName(prep.spell.defId) : "?"} (prepared[${action.preparedIndex}])`;
    }
    case "castReaction": {
      const prep = p.prepared[action.preparedIndex];
      const pay = action.payIids?.length
        ? " paying " +
          action.payIids
            .map((iid) => {
              const c = p.hand.find((h) => h.iid === iid);
              return c ? cardName(c.defId) : "?";
            })
            .join(" + ")
        : "";
      return `REACT with ${prep ? cardName(prep.spell.defId) : "?"} (prepared[${action.preparedIndex}])${pay}`;
    }
    case "playTrainer": {
      const card = p.hand.find((c) => c.iid === action.handIid);
      return `PLAY ${card ? cardName(card.defId) : "?"} (trainer)`;
    }
    case "choose": {
      const c = state.pendingChoice?.candidates.find((x) => x.iid === action.iid);
      return `choose ${c ? cardName(c.defId) : "?"}`;
    }
    case "detach": {
      const comp = p.prepared[action.preparedIndex]?.attached.find((c) => c.iid === action.componentIid);
      return `detach ${comp ? cardName(comp.defId) : "component"}`;
    }
    case "retractCast": {
      const top = state.stack[state.stack.length - 1];
      return `RETRACT ${top ? cardName(top.defId) : "cast"}`;
    }
  }
}

export function describeEvent(e: GameEvent): string | null {
  switch (e.type) {
    case "cast":
      return `P${e.player} casts ${cardName(e.spellDefId)}`;
    case "reactionCast":
      return `P${e.player} reacts with ${cardName(e.spellDefId)}`;
    case "trainerPlayed":
      return `P${e.player} plays ${cardName(e.defId)}`;
    case "spellResolved":
      return `→ ${cardName(e.spellDefId)} resolves`;
    case "spellCancelled":
      return `→ ${cardName(e.spellDefId)} CANCELLED`;
    case "targetImmune":
      return `→ ${cardName(e.spellDefId)} FIZZLES (P${e.player} untargetable by 1-component spells)`;
    case "damage":
      return `P${e.target} takes ${e.amount} damage`;
    case "burnTick":
      return `P${e.player} burns for ${e.amount}`;
    case "healed":
      return `P${e.player} heals ${e.amount}`;
    case "wardCreated":
      return `P${e.player} ward → ${e.hp} HP`;
    case "wardDestroyed":
      return `P${e.player} ward destroyed`;
    case "milled":
      return `P${e.player} mills ${e.count}`;
    case "tutored":
      return `P${e.player} searches out ${cardName(e.defId)}`;
    case "bounced":
      return `P${e.player}'s ${cardName(e.defId)} is put on top of their deck`;
    case "reshuffled":
      return `P${e.player} reshuffles discard into deck (#${e.count}) — exhaustion ${e.damage}`;
    case "mulliganed":
      return `P${e.player} mulligans to ${e.newHandSize} cards`;
    case "roundEnded":
      return `round ${e.round} ends — level up`;
    case "finalTurn":
      return `slots exhausted — P${e.player} gets one final turn`;
    case "handCapDiscard":
      return `P${e.player} discards ${e.count} (hand cap)`;
    case "gameOver":
      return `GAME OVER — ${e.winner === null ? "draw" : `P${e.winner} wins`} (${e.reason})`;
    default:
      return null;
  }
}

/** One-line state digest (handy as a log breadcrumb). */
export function stateLine(state: GameState): string {
  return (
    `P0 HP ${state.players[0].hp} | P1 HP ${state.players[1].hp} | round ${state.round} | ` +
    `turn ${state.turnCount} | stack ${state.stack.length}`
  );
}

/**
 * Readable position from `viewer`'s perspective (defaults to the priority player).
 * Legal actions are only listed when it's the viewer's turn; the opponent's
 * hidden information is never shown. This lets a player's UI render their own
 * board even while waiting for the opponent.
 */
export function renderDecision(state: GameState, schools?: [string, string], viewer?: 0 | 1): string {
  if (state.phase === "gameover") {
    return `GAME OVER — ${state.winner === null ? "draw" : `P${state.winner} wins`} (${state.endReason}). ` +
      `Final HP: P0 ${state.players[0].hp}, P1 ${state.players[1].hp}, round ${state.round}.`;
  }

  const view = viewer ?? state.priorityPlayer;
  const yourTurn = state.priorityPlayer === view;
  const v = redact(state, view);
  const label = (id: 0 | 1): string => (schools ? schools[id] : `P${id}`);
  const lines: string[] = [];

  const listLegal = (): void => {
    if (!yourTurn) return;
    const legal = legalActions(state, view);
    lines.push("Legal actions:");
    legal.forEach((a, i) => lines.push(`  ${i}: ${describeAction(state, a)}`));
  };

  // Prepare phase.
  if (state.phase === "prepare") {
    const self = v.self;
    lines.push(`Round ${v.round} — PREPARE phase`);
    if (yourTurn) {
      lines.push(
        `Your turn to prepare (P${view} ${label(view)}). Max spell level L${self.maxSpellLevel}; ` +
          `prepared ${self.prepared.length}/${self.preparedLimit}; replacements left ${1 - state.players[view].replacementsThisRound}.`,
      );
    } else {
      lines.push(`Waiting: P${state.priorityPlayer} (${label(state.priorityPlayer)}) is preparing.`);
    }
    lines.push(
      `Your prepared so far: ${self.prepared.map((p) => cardName(p.spellDefId ?? "?")).join(", ") || "(none)"}`,
    );
    listLegal();
    return lines.join("\n");
  }

  lines.push(`Round ${v.round} | turn ${v.turnCount}`);
  if (yourTurn) {
    const mode = state.stack.length > 0 ? "REACTION WINDOW" : view === v.activePlayer ? "your main turn" : "your priority";
    lines.push(`Your turn (P${view} ${label(view)}) — ${mode}.`);
  } else {
    lines.push(
      `Waiting: P${state.priorityPlayer} (${label(state.priorityPlayer)}) to act${state.stack.length > 0 ? " (stack pending)" : ""}.`,
    );
  }

  if (v.stack.length > 0) {
    lines.push("Stack (top resolves first):");
    for (let i = v.stack.length - 1; i >= 0; i--) {
      const s = v.stack[i]!;
      lines.push(`  • ${cardName(s.spellDefId)} by P${s.controller}${s.cancelled ? " [CANCELLED]" : ""}`);
    }
  }

  const self = v.self;
  lines.push(
    `── YOU P${view} (${label(view)}): HP ${self.hp} | Lv ${self.level} (max L${self.maxSpellLevel}) | ` +
      `slots ${self.slotsUsedThisRound}/${self.slots} | wards [${self.wards.join(", ")}] | burn ${self.burn} | deck ${self.resourceDeckCount}`,
  );
  lines.push(`   Hand: ${self.hand.map(cardName).join(", ") || "(empty)"}`);
  lines.push("   Prepared:");
  self.prepared.forEach((p, i) => {
    const card = p.spellDefId ? getCard(p.spellDefId) : undefined;
    const cost = card?.costText ? ` cost ${card.costText}` : "";
    const flags = `${p.cast ? " (cast)" : ""}${p.sealed ? " (SEALED)" : ""}`;
    const att = p.attached.length ? ` attached[${p.attached.map(cardName).join(", ")}]` : "";
    lines.push(`     [${i}] ${p.spellDefId ? cardName(p.spellDefId) : "??"}${cost}${flags}${att}`);
  });

  const opp = v.opponent;
  lines.push(
    `── OPP P${opp.id} (${label(opp.id)}): HP ${opp.hp} | Lv ${opp.level} | slots ${opp.slotsUsedThisRound}/${opp.slots} | ` +
      `wards [${opp.wards.join(", ")}] | burn ${opp.burn} | hand ${opp.handCount} | deck ${opp.resourceDeckCount}`,
  );
  const oppVisible = opp.prepared.filter((p) => p.spellDefId !== null);
  if (oppVisible.length > 0) {
    lines.push(`   Revealed prepared: ${oppVisible.map((p) => cardName(p.spellDefId!)).join(", ")}`);
  }

  listLegal();
  return lines.join("\n");
}
