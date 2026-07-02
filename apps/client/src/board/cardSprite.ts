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

const HL_COLOR = { actionable: 0xffd36b, target: 0x8ce99a, react: 0xffd36b };

export type Highlight = "none" | "actionable" | "target" | "react";

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
  private hl = new Graphics();
  private nameT: Text;
  private metaT: Text;
  private costT: Text;
  private attT: Text;
  private back = new Graphics();

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
    this.attT = new Text({ text: "", style: { fill: 0xaeb4c0, fontSize: 9.5, fontFamily: "ui-monospace, monospace" } });
    this.attT.position.set(7, h - 30);

    this.drawBack();
    this.root.addChild(this.body, this.band, this.nameT, this.metaT, this.costT, this.attT, this.back, this.hl);
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
    this.body.visible = this.band.visible = this.nameT.visible = this.metaT.visible = this.costT.visible = this.attT.visible = !down;
  }

  /** Show attached component symbols (e.g. ["V","SM"]) as a small line; [] clears it. */
  setAttached(syms: string[]): void {
    this.attT.text = syms.length ? "▪ " + syms.join(" ") : "";
  }

  setHighlight(kind: Highlight): void {
    this.hl.clear();
    if (kind === "none") {
      this.hl.visible = false;
      return;
    }
    this.hl.visible = true;
    this.hl.roundRect(-2, -2, this.w + 4, this.h + 4, 10).stroke({ width: 2.5, color: HL_COLOR[kind], alpha: 0.95 });
  }

  setDim(dim: boolean): void {
    this.root.alpha = dim ? 0.5 : 1;
  }

  private tapHandler: (() => void) | null = null;

  setInteractive(on: boolean, onTap?: () => void): void {
    // Interactive even when not tappable, so hover (card detail) still fires; cursor signals tappability.
    this.root.eventMode = "static";
    this.root.cursor = on && onTap ? "pointer" : "default";
    if (this.tapHandler) this.root.off("pointertap", this.tapHandler);
    this.tapHandler = on && onTap ? onTap : null;
    if (this.tapHandler) this.root.on("pointertap", this.tapHandler);
  }

  /** Persistent hover hook for the card-detail panel; attached once at creation. */
  onHover(over: () => void, out: () => void): void {
    this.root.on("pointerover", over);
    this.root.on("pointerout", out);
  }

  destroy(): void {
    this.root.destroy({ children: true });
  }
}
