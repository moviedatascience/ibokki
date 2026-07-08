import { Assets, Sprite, Texture } from "pixi.js";
import { BASE } from "../api.ts";

/**
 * Woodcut glyph textures (art/glyphs — approved set, shipped white so Pixi's
 * multiplicative tint can color them per token). Loaded once at board mount;
 * every consumer keeps a text fallback for the load-failed case, so a missing
 * asset degrades to the old letters/emoji instead of a blank board.
 */

export type IconName =
  | "v" | "s" | "m"
  | "burn" | "ward" | "prophecy" | "hp" | "cancelled"
  | "eye" | "bow" | "key" | "item" | "gambit";

const ICONS: IconName[] = ["v", "s", "m", "burn", "ward", "prophecy", "hp", "cancelled", "eye", "bow", "key", "item", "gambit"];

/** Component pip tints — the V/S/M tokens (adopted client-wide; see style bible §4). */
export const PIP_TINT: Record<string, number> = { V: 0xf0b352, S: 0x5bc8c0, M: 0xb98cf0 };

const tex = new Map<string, Texture>();

export async function loadIcons(): Promise<void> {
  const jobs: Promise<void>[] = ICONS.map(async (n) => {
    tex.set(n, (await Assets.load(`${BASE}art/icons/${n}.svg`)) as Texture);
  });
  jobs.push(
    (async () => {
      tex.set("cardback", (await Assets.load(`${BASE}art/cardback-small.svg`)) as Texture);
    })(),
  );
  await Promise.all(jobs);
}

export function cardbackTexture(): Texture | null {
  return tex.get("cardback") ?? null;
}

/** A sized, tinted glyph sprite — or null if assets never loaded (caller falls back to text). */
export function icon(name: IconName, size: number, tint?: number): Sprite | null {
  const t = tex.get(name);
  if (!t) return null;
  const sp = new Sprite(t);
  sp.width = size;
  sp.height = size;
  if (tint != null) sp.tint = tint;
  return sp;
}
