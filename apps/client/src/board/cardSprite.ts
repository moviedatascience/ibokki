import { Container, Graphics, Text } from "pixi.js";

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
  private band = new Graphics();
  private edgeG = new Graphics();
  private hl = new Graphics();
  private stampG = new Graphics();
  private nameT: Text;
  private metaT: Text;
  private costT: Text;
  private attC = new Container();
  private back = new Graphics();
  private hlKind: Highlight = "none";
  private hoverBoost = false;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.root.pivot.set(w / 2, h / 2);

    this.nameT = new Text({
      text: "",
      style: { fill: 0xf0f1f4, fontSize: 12, fontFamily: "system-ui", fontWeight: "700", wordWrap: true, wordWrapWidth: w - 12 },
    });
    this.nameT.position.set(7, 6);
    this.metaT = new Text({ text: "", style: { fill: 0x9aa0ad, fontSize: 9.5, fontFamily: "system-ui" } });
    this.metaT.position.set(7, h - 16);
    this.costT = new Text({ text: "", style: { fill: 0xffe6a6, fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: "700" } });

    this.drawBack();
    // Cancelled ✕ stamp, revealed via setStamp.
    this.stampG
      .moveTo(w * 0.32, h * 0.34)
      .lineTo(w * 0.68, h * 0.66)
      .moveTo(w * 0.68, h * 0.34)
      .lineTo(w * 0.32, h * 0.66)
      .stroke({ width: 4, color: 0xff5050, alpha: 0.85 });
    this.stampG.visible = false;
    // attC sits above `back` so attached-component chips stay visible on face-down cards
    // (the opponent's attachments are public information).
    this.root.addChild(this.body, this.band, this.edgeG, this.nameT, this.metaT, this.costT, this.back, this.attC, this.stampG, this.hl);
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
    this.back.clear();
    this.back.roundRect(0, 0, w, h, 9).fill(0x141a24).stroke({ width: 1, color: 0x2b313c });
    for (let d = -h; d < w; d += 12) this.back.moveTo(Math.max(0, d), Math.max(0, -d)).lineTo(Math.min(w, d + h), Math.min(h, w - d));
    this.back.stroke({ width: 1, color: 0x222b39, alpha: 0.8 });
    this.back.circle(w / 2, h / 2, 12).stroke({ width: 1.5, color: 0x39435a });
  }

  setFace(f: CardFace): void {
    this.drawBody(SCHOOL_COLOR[f.school] ?? SCHOOL_COLOR.Neutral!);
    this.nameT.text = f.name;
    const lvl = f.level ? `L${f.level}` : f.type === "Item" || f.type === "Gambit" ? "Trainer" : "";
    this.metaT.text = [f.type, lvl].filter(Boolean).join(" · ");
    this.costT.text = f.cost ?? "";
    this.costT.position.set(this.w - this.costT.width - 6, this.h - 17);
    this.setFaceDown(false);
  }

  setFaceDown(down: boolean): void {
    this.back.visible = down;
    this.body.visible = this.band.visible = this.nameT.visible = this.metaT.visible = this.costT.visible = !down;
  }

  /** Show attached component symbols (e.g. ["V","SM"]) as small chips; [] clears them. */
  setAttached(syms: string[]): void {
    for (const c of this.attC.removeChildren()) c.destroy({ children: true });
    let x = 6;
    for (const sym of syms) {
      const t = new Text({ text: sym, style: { fill: 0xffe6a6, fontSize: 9, fontFamily: "ui-monospace, monospace", fontWeight: "700" } });
      const w = Math.ceil(t.width) + 8;
      const g = new Graphics();
      g.roundRect(0, 0, w, 14, 4).fill(0x10151d).stroke({ width: 1, color: 0x6b5c22 });
      t.position.set(4, 2);
      const chip = new Container();
      chip.addChild(g, t);
      chip.position.set(x, this.h - 34);
      this.attC.addChild(chip);
      x += w + 4;
    }
  }

  /** Controller cue for stack cards: a strip along the owner's table edge (bottom = you). */
  setEdge(side: EdgeSide): void {
    this.edgeG.clear();
    if (!side) return;
    const y = side === "bottom" ? this.h - 5 : 2;
    this.edgeG.roundRect(5, y, this.w - 10, 3, 1.5).fill({ color: EDGE_COLOR[side], alpha: 0.9 });
  }

  /** Cancelled ✕ stamp (pairs with setDim so a countered spell reads at a glance). */
  setStamp(on: boolean): void {
    this.stampG.visible = on;
  }

  setHighlight(kind: Highlight): void {
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
