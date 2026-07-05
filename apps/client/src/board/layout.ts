/**
 * Logical board geometry. Everything is authored in a fixed WORLD_W x WORLD_H space (the "table");
 * PixiBoard scales that world to fit the actual canvas. All returned coordinates are CARD CENTERS
 * (card visuals set their pivot to center), so positioning = one {x,y} per card.
 *
 * Spatial map (matches the provided mockup):
 *   opponent nameplate + prepared-slot row + deck ....... across the TOP
 *   arcane circle + the stack ........................... DEAD CENTER
 *   your nameplate + prepared-slot row .................. mid-lower LEFT
 *   your hand, fanned ................................... across the BOTTOM
 *   your deck + discard ................................. bottom RIGHT
 */

export const WORLD_W = 1280;
export const WORLD_H = 800;

export const CARD_W = 92;
export const CARD_H = 128;
export const HAND_W = 88;
export const HAND_H = 122;

const ROW_START_X = 250;
const ROW_STEP = 108;

export const CIRCLE = { cx: WORLD_W / 2, cy: 300, r: 168 };

export const OPP_NAME = { x: 132, y: 56 };
export const YOU_NAME = { x: 132, y: 528 };
export const OPP_DECK = { x: WORLD_W - 72, y: 72 };
export const YOU_DECK = { x: WORLD_W - 72, y: 560 };
export const YOU_DISCARD = { x: WORLD_W - 72, y: 694 };

const OPP_ROW_Y = 100;
const YOU_ROW_Y = 528;

export interface Pt {
  x: number;
  y: number;
}
export interface FanPt extends Pt {
  rot: number;
}

/** Center of the i-th prepared slot for a side. */
export function preparedCenter(side: "you" | "opp", i: number): Pt {
  return { x: ROW_START_X + i * ROW_STEP + CARD_W / 2, y: side === "opp" ? OPP_ROW_Y : YOU_ROW_Y };
}

/** Center of the i-th card on the stack (newest offset up-and-right so the top card reads clearly). */
export function stackCenter(i: number, n: number): Pt {
  const spread = Math.min(26, 60 / Math.max(n, 1));
  const off = i - (n - 1) / 2;
  return { x: CIRCLE.cx + off * spread * 1.4, y: CIRCLE.cy - off * spread };
}

/** Fanned hand: center-anchored, edges tilt out and dip down, middle rides highest. */
export function handLayout(n: number): FanPt[] {
  const cx = WORLD_W / 2;
  const baseY = 720; // low enough to read as "your hand", high enough that the fan's dip stays inside the world
  const spacing = n <= 1 ? 0 : Math.min(96, 760 / n);
  const out: FanPt[] = [];
  for (let i = 0; i < n; i++) {
    const off = i - (n - 1) / 2;
    out.push({ x: cx + off * spacing, y: baseY + off * off * 2.2, rot: off * 0.08 });
  }
  return out;
}
