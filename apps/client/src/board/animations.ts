import { Container, Text } from "pixi.js";
import { easeOutCubic, lerp, type Tweener } from "./tween.ts";
import type { GameEvent } from "../api.ts";

/**
 * Maps engine events to floating combat text over the affected player's nameplate — the same
 * semantics as the old board's animateEvents(), so damage/burn/heal/ward all read consistently.
 * Events carry ABSOLUTE PlayerIds (0 = you/bottom, 1 = opponent/top).
 */

const RED = 0xff6a6a;
const ORANGE = 0xff9a4d;
const GREEN = 0x7df29a;
const BLUE = 0x8fd0ff;

export interface Floater {
  side: 0 | 1;
  text: string;
  color: number;
  /** true = a hit (shake/flash target), false = heal/ward (soft flash). */
  struck: boolean;
}

export function eventToFloater(e: GameEvent): Floater | null {
  const n = (v: unknown) => (typeof v === "number" ? v : 0);
  switch (e.type) {
    case "damage":
      return n(e.amount) > 0 ? { side: e.target as 0 | 1, text: `-${n(e.amount)}`, color: RED, struck: true } : null;
    case "burnTick":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `🔥 ${n(e.amount)}`, color: ORANGE, struck: true } : null;
    case "healed":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `+${n(e.amount)}`, color: GREEN, struck: false } : null;
    case "wardCreated":
      return { side: e.player as 0 | 1, text: `🛡 +${n(e.hp)}`, color: BLUE, struck: false };
    case "wardDamaged":
      return n(e.amount) > 0 ? { side: e.player as 0 | 1, text: `🛡 -${n(e.amount)}`, color: BLUE, struck: false } : null;
    case "wardDestroyed":
      return { side: e.player as 0 | 1, text: "🛡 ✕", color: BLUE, struck: false };
    default:
      return null;
  }
}

/** True when an event implies the stack changed (cast / react / resolve / cancel) → flash the stack. */
export function isStackEvent(e: GameEvent): boolean {
  return e.type === "cast" || e.type === "reactionCast" || e.type === "spellResolved" || e.type === "spellCancelled";
}

/**
 * Spawn one floating number in `layer`, drifting `dir` (-1 = up, +1 = down) and fading over ~1.2s.
 * `stagger` offsets stacked hits. Opponent-side floaters drift DOWN — their plate hugs the top edge,
 * so rising text would leave the canvas.
 */
export function spawnFloater(layer: Container, tweener: Tweener, x: number, y: number, text: string, color: number, stagger: number, dir: 1 | -1 = -1): void {
  const t = new Text({
    text,
    style: { fill: color, fontSize: 26, fontFamily: "system-ui", fontWeight: "800", dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.8 } },
  });
  t.anchor.set(0.5);
  t.position.set(x, y - dir * stagger * 6);
  layer.addChild(t);
  const y0 = t.y;
  tweener.add({
    duration: 1200,
    delay: stagger * 110,
    ease: easeOutCubic,
    onUpdate: (p) => {
      t.y = lerp(y0, y0 + dir * 52, p);
      t.alpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      const s = p < 0.2 ? lerp(0.7, 1.15, p / 0.2) : 1.05;
      t.scale.set(s);
    },
    onComplete: () => t.destroy(),
  });
}
