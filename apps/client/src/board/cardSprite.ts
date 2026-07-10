import { Container, Graphics, Sprite, Text } from "pixi.js";
import { PIP_TINT, cardbackTexture, icon } from "./icons.ts";
import { cardArtTexture, coverCrop } from "./cardArt.ts";

/**
 * A neutral placeholder card: rounded-rect body, a school-tinted title band, name / type+level /
 * cost text, and a highlight outline. NO art — real card/frame art drops into this same footprint
 * later (swap the body fill for a Sprite, keep the layout). Pivot is centered so the board positions,
 * rotates, and scales each card by its center point.
 */

const SCHOOL_COLOR: Record<string, number> = {
  Evocation: 0xe0533d,
  Abjuration: 0x4a90e2,
  Divination: 0xa070e0,
  Component: 0x8a90a0,
  Neutral: 0x8a90a0,
  Item: 0xcaa46a,
  Gambit: 0xcaa46a,
};

export type Highlight = "none" | "actionable" | "target" | "react";

/**
 * Highlight grammar: "actionable" is a quiet cue (most cards are playable most of the time —
 * a bright outline on all of them means nothing); it brightens on hover. "react" is the loud
 * one, reserved for the thing the game is waiting on (reaction target, confirm/retract).
 * "target" is the green attach-destination cue.
 */
const HL_STYLE: Record<Exclude<Highlight, "none">, { color: number; width: number; alpha: number }> = {
  actionable: { color: 0xffd36b, width: 1.5, alpha: 0.38 },
  target: { color: 0x8ce99a, width: 2.5, alpha: 0.95 },
  react: { color: 0xffd36b, width: 3, alpha: 1 },
};

/** Controller edge strip colors match the log's You/Opponent colors. */
const EDGE_COLOR = { bottom: 0x8ce99a, top: 0xff8b8b };

export type EdgeSide = "top" | "bottom" | null;

export interface CardFace {
  name: string;
  school: string;
  type: string;
  level: number | null;
  cost: string | null;
}

export class CardVisual {
  readonly root = new Container();
  readonly w: number;
  readonly h: number;
  private body = new Graphics();
  private artC = new Container(); // per-card illustration window (empty until art ships)
  private band = new Graphics();
  private edgeG = new Graphics();
  private hl = new Graphics();
  private stampC = new Container();
  private sealC = new Container();
  private nameT: Text;
  private metaT: Text;
  private costC = new Container();
  private attC = new Container();
  private back = new Container();
  private hlKind: Highlight = "none";
  private hoverBoost = false;
  /** Last-applied signatures — applyFace() hits every sprite on every sync, so unchanged
   *  faces/chips/edges must be no-ops instead of Graphics + rasterized-Text rebuilds. */
  private faceKey: string | null = null;
  private attachedKey: string | null = null;
  private edgeKey: EdgeSide = null;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.root.pivot.set(w / 2, h / 2);

    this.nameT = new Text({
      text: "",
      // Card names are card identity, not UI chrome — Alegreya per the style bible;
      // PixiBoard.mount() awaits the font so first rasterization uses it.
      style: { fill: 0xf0f1f4, fontSize: 12, fontFamily: "Alegreya, Georgia, serif", fontWeight: "700", wordWrap: true, wordWrapWidth: w - 12 },
    });
    this.nameT.position.set(7, 6);
    this.metaT = new Text({ text: "", style: { fill: 0x9aa0ad, fontSize: 9.5, fontFamily: "system-ui" } });
    this.metaT.position.set(7, h - 16);

    this.drawBack();
    // Cancelled stamp (woodcut X glyph, procedural fallback), revealed via setStamp.
    const stampSize = Math.min(w, h) * 0.5;
    const stamp = icon("cancelled", stampSize, 0xff5050);
    if (stamp) {
      stamp.alpha = 0.9;
      stamp.position.set((w - stampSize) / 2, (h - stampSize) / 2);
      this.stampC.addChild(stamp);
    } else {
      const g = new Graphics();
      g.moveTo(w * 0.32, h * 0.34)
        .lineTo(w * 0.68, h * 0.66)
        .moveTo(w * 0.68, h * 0.34)
        .lineTo(w * 0.32, h * 0.66)
        .stroke({ width: 4, color: 0xff5050, alpha: 0.85 });
      this.stampC.addChild(g);
    }
    this.stampC.visible = false;
    this.sealC.visible = false;
    // attC sits above `back` so attached-component chips stay visible on face-down cards
    // (the opponent's attachments are public information). sealC likewise — a Runic Seal
    // on a face-down spell is public.
    this.root.addChild(this.body, this.artC, this.band, this.edgeG, this.nameT, this.metaT, this.costC, this.back, this.attC, this.sealC, this.stampC, this.hl);
    this.setHighlight("none");
  }

  private drawBody(color: number): void {
    const { w, h } = this;
    this.body.clear();
    this.body.roundRect(0, 0, w, h, 9).fill(0x1b2029).stroke({ width: 1, color: 0x2b313c });
    this.band.clear();
    this.band.roundRect(0, 0, w, 20, 9).fill({ color, alpha: 0.32 });
    this.band.rect(0, 12, w, 8).fill({ color, alpha: 0.32 });
  }

  private drawBack(): void {
    const { w, h } = this;
    // The Invocation card back (art/cardback-small.svg); procedural hatch fallback.
    const tex = cardbackTexture();
    if (tex) {
      const sp = new Sprite(tex);
      sp.width = w;
      sp.height = h;
      this.back.addChild(sp);
      return;
    }
    const g = new Graphics();
    g.roundRect(0, 0, w, h, 9).fill(0x141a24).stroke({ width: 1, color: 0x2b313c });
    for (let d = -h; d < w; d += 12) g.moveTo(Math.max(0, d), Math.max(0, -d)).lineTo(Math.min(w, d + h), Math.min(h, w - d));
    g.stroke({ width: 1, color: 0x222b39, alpha: 0.8 });
    g.circle(w / 2, h / 2, 12).stroke({ width: 1.5, color: 0x39435a });
    this.back.addChild(g);
  }

  setFace(f: CardFace, defId?: string | null): void {
    const key = `${defId ?? ""}|${f.school}|${f.name}|${f.type}|${f.level ?? ""}|${f.cost ?? ""}`;
    if (key !== this.faceKey) {
      this.faceKey = key;
      this.drawBody(SCHOOL_COLOR[f.school] ?? SCHOOL_COLOR.Neutral!);
      this.applyArt(defId ?? null, key);
      this.nameT.text = f.name;
      const lvl = f.level ? `L${f.level}` : f.type === "Item" || f.type === "Gambit" ? "Trainer" : "";
      this.metaT.text = [f.type, lvl].filter(Boolean).join(" · ");
      this.drawCost(f.cost ?? "");
    }
    this.setFaceDown(false);
  }

  /** Illustration window between the title band and the meta line ("swap the body fill
   *  for a Sprite, keep the layout"). No-op until the manifest lists art for this card;
   *  the texture loads lazily and repaints when it lands (if this face is still shown). */
  private applyArt(defId: string | null, key: string): void {
    for (const c of this.artC.removeChildren()) c.destroy();
    if (!defId) return;
    const t = cardArtTexture(defId, () => {
      if (this.faceKey === key) this.applyArt(defId, key);
    });
    if (!t) return;
    const y = 20; // below the title band
    const artH = this.h - y - 18; // above the meta line
    const sp = new Sprite(coverCrop(t, this.w - 2, artH));
    sp.width = this.w - 2;
    sp.height = artH;
    sp.position.set(1, y);
    this.artC.addChild(sp);
  }

  /** Cost as woodcut V/S/M pips, right-aligned in the bottom corner; letter fallback. */
  private drawCost(cost: string): void {
    for (const c of this.costC.removeChildren()) c.destroy({ children: true });
    if (!cost) return;
    const size = 11;
    const gap = 2;
    let ok = true;
    const sprites = [...cost].map((sym) => {
      const sp = icon(sym.toLowerCase() as "v" | "s" | "m", size, PIP_TINT[sym]);
      if (!sp) ok = false;
      return sp;
    });
    if (ok) {
      sprites.forEach((sp, i) => {
        sp!.position.set(i * (size + gap), 0);
        this.costC.addChild(sp!);
      });
      this.costC.position.set(this.w - (cost.length * (size + gap) - gap) - 6, this.h - 17);
    } else {
      const t = new Text({ text: cost, style: { fill: 0xffe6a6, fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: "700" } });
      this.costC.addChild(t);
      this.costC.position.set(this.w - t.width - 6, this.h - 17);
    }
  }

  setFaceDown(down: boolean): void {
    this.back.visible = down;
    this.body.visible = this.artC.visible = this.band.visible = this.nameT.visible = this.metaT.visible = this.costC.visible = !down;
  }

  /** Show attached component symbols (e.g. ["V","SM"]) as small pip chips; [] clears them. */
  setAttached(syms: string[]): void {
    const key = syms.join(",");
    if (key === this.attachedKey) return;
    this.attachedKey = key;
    for (const c of this.attC.removeChildren()) c.destroy({ children: true });
    let x = 6;
    for (const sym of syms) {
      const chip = new Container();
      const pipSize = 9;
      const gap = 1.5;
      const pips = [...sym].map((ch) => icon(ch.toLowerCase() as "v" | "s" | "m", pipSize, PIP_TINT[ch]));
      let w: number;
      if (pips.every((p) => p !== null)) {
        w = 8 + sym.length * pipSize + (sym.length - 1) * gap;
        const g = new Graphics();
        g.roundRect(0, 0, w, 14, 4).fill(0x10151d).stroke({ width: 1, color: 0x6b5c22 });
        chip.addChild(g);
        pips.forEach((p, i) => {
          p!.position.set(4 + i * (pipSize + gap), 2.5);
          chip.addChild(p!);
        });
      } else {
        const t = new Text({ text: sym, style: { fill: 0xffe6a6, fontSize: 9, fontFamily: "ui-monospace, monospace", fontWeight: "700" } });
        w = Math.ceil(t.width) + 8;
        const g = new Graphics();
        g.roundRect(0, 0, w, 14, 4).fill(0x10151d).stroke({ width: 1, color: 0x6b5c22 });
        t.position.set(4, 2);
        chip.addChild(g, t);
      }
      chip.position.set(x, this.h - 34);
      this.attC.addChild(chip);
      x += w + 4;
    }
  }

  /** Controller cue for stack cards: a strip along the owner's table edge (bottom = you). */
  setEdge(side: EdgeSide): void {
    if (side === this.edgeKey) return;
    this.edgeKey = side;
    this.edgeG.clear();
    if (!side) return;
    const y = side === "bottom" ? this.h - 5 : 2;
    this.edgeG.roundRect(5, y, this.w - 10, 3, 1.5).fill({ color: EDGE_COLOR[side], alpha: 0.9 });
  }

  /** Cancelled ✕ stamp (pairs with setDim so a countered spell reads at a glance). */
  setStamp(on: boolean): void {
    this.stampC.visible = on;
  }

  /** Sealed banner: the spell can't be cast until the seal lifts (Runic Seal & co).
   *  Wax-seal glyph + label (approved 2026-07-09); text-only when assets failed. */
  setSealed(on: boolean): void {
    // Built lazily on first seal; the container is the single source of truth for
    // "already built" (a stray flag could desync from the actual children).
    if (on && this.sealC.children.length === 0) {
      const { w, h } = this;
      const g = new Graphics();
      g.rect(0, h / 2 - 10, w, 20).fill({ color: 0x1c1426, alpha: 0.92 });
      g.moveTo(0, h / 2 - 10).lineTo(w, h / 2 - 10).moveTo(0, h / 2 + 10).lineTo(w, h / 2 + 10)
        .stroke({ width: 1, color: 0xa070e0, alpha: 0.9 });
      const t = new Text({
        text: "SEALED",
        style: { fill: 0xc9a0f0, fontSize: 9, fontFamily: "system-ui", fontWeight: "800", letterSpacing: 2 },
      });
      t.anchor.set(0.5);
      const mark = icon("seal", 15, 0xc9a0f0);
      if (mark) {
        const total = 15 + 4 + t.width;
        mark.position.set(w / 2 - total / 2, h / 2 - 7.5);
        t.position.set(w / 2 - total / 2 + 15 + 4 + t.width / 2, h / 2);
        this.sealC.addChild(g, mark, t);
      } else {
        t.position.set(w / 2, h / 2);
        this.sealC.addChild(g, t);
      }
    }
    this.sealC.visible = on;
  }

  setHighlight(kind: Highlight): void {
    if (kind === this.hlKind) return;
    this.hlKind = kind;
    this.drawHl();
  }

  private drawHl(): void {
    this.hl.clear();
    if (this.hlKind === "none") {
      this.hl.visible = false;
      return;
    }
    const s = HL_STYLE[this.hlKind];
    const boost = this.hoverBoost && this.hlKind === "actionable";
    this.hl.visible = true;
    this.hl.roundRect(-2, -2, this.w + 4, this.h + 4, 10).stroke({
      width: boost ? 2.5 : s.width,
      color: s.color,
      alpha: boost ? 0.95 : s.alpha,
    });
  }

  setDim(dim: boolean): void {
    this.root.alpha = dim ? 0.5 : 1;
  }

  private tapHandler: (() => void) | null = null;

  /**
   * `actionable` drives the pointer cursor; `onTap` fires regardless (non-actionable cards
   * get an inspect/pin tap). Hover always fires for the card-detail panel.
   */
  setInteractive(actionable: boolean, onTap?: () => void): void {
    this.root.eventMode = "static";
    this.root.cursor = actionable && onTap ? "pointer" : "default";
    if (this.tapHandler) this.root.off("pointertap", this.tapHandler);
    this.tapHandler = onTap ?? null;
    if (this.tapHandler) this.root.on("pointertap", this.tapHandler);
  }

  /** Persistent hover hook for the card-detail panel; attached once at creation. */
  onHover(over: () => void, out: () => void): void {
    this.root.on("pointerover", () => {
      this.hoverBoost = true;
      this.drawHl();
      over();
    });
    this.root.on("pointerout", () => {
      this.hoverBoost = false;
      this.drawHl();
      out();
    });
  }

  destroy(): void {
    this.root.destroy({ children: true });
  }
}
