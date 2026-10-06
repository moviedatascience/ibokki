import { Container, Text } from "pixi.js";
import { easeOutCubic, lerp, type Tweener } from "./tween.ts";
import { icon, type IconName } from "./icons.ts";
import type { GameEvent } from "../api.ts";

/**
 * Maps engine events to floating combat text over the affected player's nameplate — the same
 * semantics as the old board's animateEvents(), so damage/burn/heal/ward all read consistently.
 * Events carry ABSOLUTE PlayerIds (0 = you/bottom, 1 = opponent/top).
 * Markers render as the woodcut glyphs (art/icons); text-only when assets failed to load.
 */

const RED = 0xff6a6a;
const ORANGE = 0xff9a4d;
const GREEN = 0x7df29a;
const BLUE = 0x8fd0ff;
const PURPLE = 0xc9a0f0;
const GOLD = 0xffd36b;

export interface Floater {
  side: 0 | 1;
  text: string;
  color: number;
  /** Woodcut marker drawn before the text (burn / ward / prophecy). */
  icon?: IconName;
  /** true = a hit (shake/flash target), false = heal/ward (soft flash). */
  struck: boolean;
}

export function eventToFloater(e: GameEvent): Floater | null {
  const n = (v: unknown) => (typeof v === "number" ? v : 0);
  switch (e.type) {
    case "damage":
      return n(e.amount) > 0 ? { side: e.target as 0 | 1, text: `-${n(e.amount)}`, color: RED, struck: true } : null;
    case "burnTick":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `${n(e.amount)}`, color: ORANGE, icon: "burn", struck: true } : null;
    case "prophecyCreated":
      return { side: e.target as 0 | 1, text: `${n(e.amount)} in ${n(e.turns)}`, color: PURPLE, icon: "prophecy", struck: false };
    case "prophecyFired":
      return { side: e.player as 0 | 1, text: "!", color: PURPLE, icon: "prophecy", struck: true };
    case "healed":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `+${n(e.amount)}`, color: GREEN, struck: false } : null;
    case "wardCreated":
      return { side: e.player as 0 | 1, text: `+${n(e.hp)}`, color: BLUE, icon: "ward", struck: false };
    case "wardDamaged":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `-${n(e.amount)}`, color: BLUE, icon: "ward", struck: false } : null;
    case "wardDestroyed":
      return { side: e.player as 0 | 1, text: "✕", color: BLUE, icon: "ward", struck: false };
    case "leveledUp":
      // The 1–21 ramp is the game's spine — give the level-up a visible beat.
      return { side: e.player as 0 | 1, text: `Lv ${n(e.level)}`, color: GOLD, struck: false };
    default:
      return null;
  }
}

/** True when an event implies the stack changed (cast / react / resolve / cancel) → flash the stack. */
export function isStackEvent(e: GameEvent): boolean {
  return e.type === "cast" || e.type === "reactionCast" || e.type === "spellResolved" || e.type === "spellCancelled";
}

/** Events that are pure bookkeeping — a frame made only of these needs no dwell. */
const SILENT = new Set(["priorityPassed", "passed", "choicePending", "prepareComplete", "turnBegan", "finalTurn"]);

/** Does this frame show the player anything that deserves a beat of their attention? */
export function isVisibleFrame(events: readonly GameEvent[]): boolean {
  return events.some((e) => !SILENT.has(e.type));
}

/** Events a player's ACTION emits first — whoever they name acted this frame. */
const ACTION_EVENTS = new Set([
  "cast", "reactionCast", "attached", "detached", "trainerPlayed", "spellPrepared", "spellReplaced",
  "priorityPassed", "passed", "chose", "retracted", "mulliganed",
]);

/**
 * Who acted to produce this frame (viewer-relative: 0 = you, 1 = opponent), or null when
 * it is a server-side beat (a timeout, a rematch start). Your own actions must never be
 * held back by a dwell — you clicked, you know what happened — only the opponent's are.
 */
export function frameActor(events: readonly GameEvent[]): 0 | 1 | null {
  for (const e of events) {
    if (ACTION_EVENTS.has(e.type) && (e.player === 0 || e.player === 1)) return e.player as 0 | 1;
  }
  return null;
}

/** One stack item's resolution (#80 brackets): the opener, what it did, how it closed. */
export interface ResolutionGroup {
  opener: GameEvent; // resolveBegin {controller, spellDefId, sid, isReaction}
  children: GameEvent[];
  closer: GameEvent | null; // spellResolved | spellCancelled | targetImmune
}

const CLOSERS = new Set(["spellResolved", "spellCancelled", "targetImmune"]);

/**
 * Split a frame's events into the resolutions it contains (each animated on the OLD
 * layout: pulse the stack card, play its consequences, let it leave) and everything
 * else (played once the new layout is on the table). Order within each list is kept.
 */
export function resolutionGroups(events: readonly GameEvent[]): { groups: ResolutionGroup[]; rest: GameEvent[] } {
  const groups: ResolutionGroup[] = [];
  const rest: GameEvent[] = [];
  let open: ResolutionGroup | null = null;
  for (const e of events) {
    if (e.type === "resolveBegin") {
      open = { opener: e, children: [], closer: null };
      groups.push(open);
      continue;
    }
    if (open) {
      if (CLOSERS.has(e.type)) {
        open.closer = e;
        open = null;
      } else open.children.push(e);
      continue;
    }
    rest.push(e);
  }
  return { groups, rest };
}

/**
 * Spawn one floating number in `layer`, drifting `dir` (-1 = up, +1 = down) and fading over ~1.2s.
 * `stagger` offsets stacked hits. Opponent-side floaters drift DOWN — their plate hugs the top edge,
 * so rising text would leave the canvas.
 */
export function spawnFloater(
  layer: Container,
  tweener: Tweener,
  x: number,
  y: number,
  text: string,
  color: number,
  stagger: number,
  dir: 1 | -1 = -1,
  iconName?: IconName,
): void {
  const root = new Container();
  const t = new Text({
    text,
    style: { fill: color, fontSize: 26, fontFamily: "system-ui", fontWeight: "800", dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.8 } },
  });
  let w = t.width;
  const mark = iconName ? icon(iconName, 24, color) : null;
  if (mark) {
    mark.position.set(0, (t.height - 24) / 2);
    t.position.set(29, 0);
    w += 29;
    root.addChild(mark, t);
  } else {
    root.addChild(t);
  }
  root.pivot.set(w / 2, t.height / 2);
  root.position.set(x, y - dir * stagger * 6);
  layer.addChild(root);
  const y0 = root.y;
  tweener.add({
    duration: 1200,
    delay: stagger * 110,
    ease: easeOutCubic,
    onUpdate: (p) => {
      root.y = lerp(y0, y0 + dir * 52, p);
      root.alpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      const s = p < 0.2 ? lerp(0.7, 1.15, p / 0.2) : 1.05;
      root.scale.set(s);
    },
    onComplete: () => root.destroy({ children: true }),
  });
}
