import { BASE } from "./api.ts";

/**
 * Which per-card illustrations actually ship (art/cards/{defId}.png). Gated by a
 * manifest so the client never fires 174 speculative requests per match: no entry →
 * no fetch, the procedural placeholder stays. `.claude/skills/art` appends a defId
 * here when the art director files a winner.
 */

let available: Set<string> | null = null;

/** Fetch the manifest once (boot). Missing/invalid manifest → no card art anywhere. */
export async function loadCardArtManifest(): Promise<void> {
  if (available) return;
  try {
    const r = await fetch(`${BASE}art/cards/manifest.json`);
    const ids = r.ok ? ((await r.json()) as unknown) : [];
    available = new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : []);
  } catch {
    available = new Set();
  }
}

export function hasCardArt(defId: string): boolean {
  return available?.has(defId) ?? false;
}

export function cardArtUrl(defId: string): string {
  return `${BASE}art/cards/${defId}.png`;
}
