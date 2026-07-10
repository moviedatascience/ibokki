import { Assets, Rectangle, Texture } from "pixi.js";
import { cardArtUrl, hasCardArt } from "../cardArtManifest.ts";

/**
 * Pixi-side card illustration cache. Textures load lazily the first time a card is
 * shown; `onReady` lets the board repaint once the file lands (cards render their
 * procedural face in the meantime — never a blank card).
 */

const tex = new Map<string, Texture>();
const pending = new Set<string>();

export function cardArtTexture(defId: string, onReady?: () => void): Texture | null {
  const t = tex.get(defId);
  if (t) return t;
  if (!hasCardArt(defId) || pending.has(defId)) return null;
  pending.add(defId);
  Assets.load(cardArtUrl(defId))
    .then((loaded) => {
      tex.set(defId, loaded as Texture);
      onReady?.();
    })
    .catch(() => {
      /* keep the procedural face */
    });
  return null;
}

/** A centered crop of `t` matching the w:h aspect of the card's art window. */
export function coverCrop(t: Texture, w: number, h: number): Texture {
  const tw = t.width;
  const th = t.height;
  const want = w / h;
  let cw = tw;
  let ch = th;
  if (tw / th > want) cw = th * want;
  else ch = tw / want;
  return new Texture({ source: t.source, frame: new Rectangle((tw - cw) / 2, (th - ch) / 2, cw, ch) });
}
