import { Application, Assets, Container, Graphics, Sprite as PixiSprite, Text, type Texture } from "pixi.js";
import { BASE } from "../api.ts";
import { CardVisual, type CardFace, type EdgeSide, type Highlight } from "./cardSprite.ts";
import { Tweener, easeInOutCubic, easeOutCubic, lerp } from "./tween.ts";
import { eventToFloater, isStackEvent, spawnFloater } from "./animations.ts";
import { icon, loadIcons, type IconName } from "./icons.ts";
import { SCHOOL_CREST, SCHOOL_TINT, schoolOf } from "../schools.ts";
import {
  CARD_H,
  CARD_W,
  CIRCLE,
  HAND_H,
  HAND_W,
  OPP_DECK,
  YOU_DECK,
  YOU_DISCARD,
  WORLD_H,
  WORLD_W,
  handLayout,
  preparedCenter,
  stackCenter,
  type Pt,
} from "./layout.ts";
import type { CardCatalog, LegalAction, MatchState, PlayerView } from "../api.ts";

const HP_MAX = 30;

interface Sprite {
  visual: CardVisual;
  layer: Container;
  /**
   * The defId currently shown. Sprites are keyed by POSITION (`p0:2`, `h:5`),
   * so the card at a key can change (prep replace, hand shifting); hover must
   * read this live value, never a creation-time closure.
   */
  faceDef: string | null;
}

interface Desired {
  key: string;
  layer: Container;
  faceDef: string | null; // defId to show face-up; null = face-down back
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  z: number;
  highlight: Highlight;
  dim: boolean;
  attached: string[];
  /** Controller strip for stack cards (bottom = yours, top = opponent's). */
  edge: EdgeSide;
  /** Cancelled ✕ stamp. */
  stamp: boolean;
  /** Sealed banner (prepared spell locked by Runic Seal & co). */
  sealed: boolean;
  onTap: (() => void) | null;
  spawn: Pt | null; // enter-from position for new sprites
  spawnScale: boolean; // scale-up on enter (hand draw / cast)
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Plate {
  root: Container;
  glow: Graphics;
  bar: Graphics;
  crest: Container; // school crest glyph (Eye/Bow/Key), left of the name
  name: Text;
  hp: Text;
  hpMark: PixiSprite | Text; // heart glyph (Text "♥" fallback)
  stats: Text;
  status: Container; // ward / burn / prophecy markers + counts
  /** Last rendered hp / status signature — updatePlate runs on EVERY sync, so skip unchanged rebuilds. */
  lastHp: number;
  statusKey: string;
  crestKey: string | null;
  box: Box;
  anchor: Pt; // floater anchor (center of plate, world coords)
}

export interface BoardCallbacks {
  onAction: (index: number) => void;
  onHover: (defId: string | null) => void;
  /** Fired when an attach selection starts/clears, so the shell can show a Cancel affordance. */
  onSelection?: (active: boolean) => void;
  /** Tap on a card with no action available — pin it into the card-detail panel. */
  onInspect?: (defId: string) => void;
}

/**
 * The Pixi "table". Renders the redacted match state as neutral placeholder cards laid out per the
 * mockup, and animates transitions (draw → hand, cast → stack, damage floaters). All game
 * interactions that live on the board (attach, cast, react, retract, play trainer) are handled here;
 * prepare-phase spellbook selection + reaction "pass" / choices live in the React overlays.
 */
export class PixiBoard {
  private app: Application | null = null;
  private world = new Container();
  private bgLayer = new Container();
  /** Venue background sprite (null = load failed, procedural rings shown instead). */
  private venue: PixiSprite | null = null;
  private slotG = new Graphics();
  private oppLayer = new Container();
  private stackLayer = new Container();
  private youLayer = new Container();
  private pileLayer = new Container();
  private handLayer = new Container();
  private fxLayer = new Container();
  private tweener = new Tweener();
  private sprites = new Map<string, Sprite>();
  private youPlate!: Plate;
  private oppPlate!: Plate;
  private youDeckL!: Text;
  private oppDeckL!: Text;
  private oppHandL!: Text;

  private cards: CardCatalog = {};
  private last: MatchState | null = null;
  private lastEpoch = -1;
  /** mount() awaits asset loads; sync() calls that arrive earlier are buffered and replayed. */
  private mounted = false;
  private selHandDef: string | null = null;
  /** Position key of the sprite under the cursor, so hover detail can be cleared/refreshed when that sprite changes. */
  private hoverKey: string | null = null;
  private ro: ResizeObserver | null = null;

  constructor(private host: HTMLElement, private cb: BoardCallbacks) {}

  async mount(): Promise<void> {
    const app = new Application();
    await app.init({
      background: 0x0e1411,
      antialias: true,
      resizeTo: this.host,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
    });
    this.app = app;
    this.host.appendChild(app.canvas);

    // Venue background (filed venue master, art/board). By far the largest asset,
    // so it must not gate board paint: it fades in whenever it lands. A failed
    // load falls back to the procedural placeholder rings — never a blank board.
    Assets.load(`${BASE}art/board/table.png`).then(
      (t) => {
        if (!this.app) return; // board destroyed while loading
        const v = new PixiSprite(t as Texture);
        v.anchor.set(0.5);
        // World center, cover-scaled past the world bounds by relayout() — the
        // venue's 16:9 master bleeds under the letterbox bars at any aspect.
        // Center is composed as the open arena (no ritual circle per the bible).
        v.position.set(WORLD_W / 2, WORLD_H / 2);
        v.alpha = 0;
        this.venue = v;
        this.bgLayer.addChildAt(v, 0);
        this.relayout();
        this.tweener.add({ duration: 260, onUpdate: (p) => (v.alpha = p) });
      },
      () => {
        if (!this.app) return;
        const ring = new Graphics();
        ring.circle(CIRCLE.cx, CIRCLE.cy, CIRCLE.r).stroke({ width: 2, color: 0x3a4250, alpha: 0.9 });
        ring.circle(CIRCLE.cx, CIRCLE.cy, CIRCLE.r - 14).stroke({ width: 1, color: 0x2a303c, alpha: 0.8 });
        ring.circle(CIRCLE.cx, CIRCLE.cy, CIRCLE.r * 0.62).stroke({ width: 1, color: 0x2a303c, alpha: 0.6 });
        ring.circle(CIRCLE.cx, CIRCLE.cy, 4).fill(0x3a4250);
        this.bgLayer.addChildAt(ring, 0);
      },
    );

    // Woodcut glyph textures (markers, pips, card back). A failed load degrades
    // every consumer to its text/procedural fallback — never a blank board.
    try {
      await loadIcons();
    } catch (e) {
      console.warn("icon assets failed to load — using text fallbacks", e);
    }

    // Pixi rasterizes Text with whatever fonts are loaded at draw time — wait for the
    // card face (Alegreya). Bounded so a hung font fetch can't stall the board.
    try {
      await Promise.race([document.fonts.load('700 12px "Alegreya"'), new Promise((r) => setTimeout(r, 1500))]);
    } catch {
      /* font unavailable — Text falls back to the serif stack */
    }

    this.stackLayer.sortableChildren = true;
    this.handLayer.sortableChildren = true;
    this.world.addChild(this.bgLayer, this.slotG, this.oppLayer, this.stackLayer, this.youLayer, this.pileLayer, this.handLayer, this.fxLayer);
    app.stage.addChild(this.world);

    this.buildStatic();
    app.ticker.add((t) => this.tweener.update(t.deltaMS));

    this.ro = new ResizeObserver(() => {
      app.resize();
      this.relayout();
    });
    this.ro.observe(this.host);
    this.relayout();
    this.mounted = true;
    // A match can start (and finish its opening sync burst) while we were loading
    // textures — paint the buffered state now instead of waiting for the next change.
    if (this.last) this.draw();
  }

  private relayout(): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;
    const s = Math.min(width / WORLD_W, height / WORLD_H);
    if (!(s > 0)) return;
    this.world.scale.set(s);
    this.world.position.set((width - WORLD_W * s) / 2, (height - WORLD_H * s) / 2);
    if (this.venue) {
      // Cover the SCREEN rect (expressed in world units), not just the world:
      // the venue bleeds under the letterbox bars at non-16:10 aspects.
      const t = this.venue.texture;
      const k = Math.max(width / s / t.width, height / s / t.height);
      this.venue.scale.set(k);
    }
  }

  private buildStatic(): void {

    this.oppPlate = this.makePlate({ x: 20, y: 16, w: 224, h: 74 });
    this.youPlate = this.makePlate({ x: 20, y: 470, w: 224, h: 74 });
    this.bgLayer.addChild(this.oppPlate.root, this.youPlate.root);

    // Pile counters live AT the piles, not in the nameplate stat line.
    this.oppDeckL = this.makePileLabel(OPP_DECK.x, OPP_DECK.y + CARD_H / 2 + 6);
    this.oppHandL = this.makePileLabel(OPP_DECK.x, OPP_DECK.y + CARD_H / 2 + 24);
    this.youDeckL = this.makePileLabel(YOU_DECK.x, YOU_DECK.y - CARD_H / 2 - 20);
  }

  private makePileLabel(x: number, y: number): Text {
    const t = new Text({ text: "", style: { fill: 0x9aa0ad, fontSize: 11.5, fontFamily: "system-ui", fontWeight: "700" } });
    t.anchor.set(0.5, 0);
    t.position.set(x, y);
    this.bgLayer.addChild(t);
    return t;
  }

  private makePlate(box: Box): Plate {
    const root = new Container();
    root.position.set(box.x, box.y);
    const glow = new Graphics();
    glow.roundRect(-3, -3, box.w + 6, box.h + 6, 12).stroke({ width: 2, color: 0xffd36b, alpha: 0.85 });
    glow.visible = false;
    const bg = new Graphics();
    bg.roundRect(0, 0, box.w, box.h, 10).fill(0x161b22).stroke({ width: 1, color: 0x2b313c });
    const crest = new Container();
    crest.position.set(12, 8);
    const name = new Text({ text: "", style: { fill: 0xe6e7ea, fontSize: 13, fontFamily: "system-ui", fontWeight: "700" } });
    name.position.set(12, 9);
    const hpMark: PixiSprite | Text = icon("hp", 13, 0xffffff) ?? new Text({ text: "♥", style: { fill: 0xffffff, fontSize: 13, fontFamily: "system-ui" } });
    hpMark.position.set(box.w - 66, 10);
    const hp = new Text({ text: "", style: { fill: 0xffffff, fontSize: 13, fontFamily: "ui-monospace, monospace", fontWeight: "700" } });
    hp.position.set(box.w - 48, 9);
    const bar = new Graphics();
    const stats = new Text({ text: "", style: { fill: 0x9aa0ad, fontSize: 11.5, fontFamily: "system-ui" } });
    stats.position.set(12, box.h - 19);
    const status = new Container();
    status.position.set(12, 25);
    root.addChild(glow, bg, crest, name, hpMark, hp, bar, stats, status);
    return { root, glow, bar, crest, name, hp, hpMark, stats, status, lastHp: NaN, statusKey: "\0", crestKey: "\0", box, anchor: { x: box.x + box.w / 2, y: box.y + box.h / 2 } };
  }

  private updatePlate(plate: Plate, label: string, seatLabel: string, v: PlayerView, active: boolean): void {
    const box = plate.box;
    plate.name.text = label;
    // School crest (Eye/Bow/Key), left of the name — resolved from the seat label (a school
    // name locally, a deck name online; custom online decks resolve to none → no crest).
    if (seatLabel !== plate.crestKey) {
      plate.crestKey = seatLabel;
      for (const ch of plate.crest.removeChildren()) ch.destroy();
      const school = schoolOf(seatLabel);
      const crestName = school ? SCHOOL_CREST[school] : null;
      if (crestName) {
        const sp = icon(crestName, 14, SCHOOL_TINT[school!] ?? 0xffffff);
        if (sp) plate.crest.addChild(sp);
      }
      plate.name.position.x = plate.crest.children.length ? 32 : 12;
    }
    // Pixi Text/fill setters no-op on unchanged values, but the Graphics bar re-triangulates
    // on every clear+draw — gate the hp block so it only runs when hp actually moved.
    if (v.hp !== plate.lastHp) {
      plate.lastHp = v.hp;
      plate.hp.text = String(v.hp);
      const hpColor = v.hp <= 10 ? 0xff8b8b : 0xffffff;
      plate.hp.style.fill = hpColor;
      if (plate.hpMark instanceof PixiSprite) plate.hpMark.tint = hpColor;
      else plate.hpMark.style.fill = hpColor;
      const bw = box.w - 24;
      const pct = Math.max(0, Math.min(1, v.hp / HP_MAX));
      plate.bar.clear();
      plate.bar.roundRect(12, 26, bw, 8, 4).fill(0x0c0f14).stroke({ width: 1, color: 0x333a47 });
      plate.bar.roundRect(12, 26, bw * pct, 8, 4).fill(v.hp <= 10 ? 0xff7849 : 0x5fce76);
    }
    // Deck/hand counts render at the piles; prepared cards are visible on the board.
    plate.stats.text = `Lv ${v.level} · slots ${v.slotsUsedThisRound}/${v.slots}`;
    // Status markers: woodcut glyph + count segments, right-aligned over the HP bar.
    // Each rebuild rasterizes new Text objects, so skip it while the markers are unchanged.
    const wardsLabel = v.wards && v.wards.length ? v.wards.join("/") : "";
    // Dooms show as payload@turns-left; "!" marks the unwardable one (Oblivion).
    const doomLabels = (v.prophecies ?? []).map((p) => `${p.amount}${p.pierce ? "!" : ""}@${p.turnsLeft}`);
    const statusKey = `${wardsLabel}|${v.burn}|${doomLabels.join(" ")}`;
    if (statusKey !== plate.statusKey) {
      plate.statusKey = statusKey;
      const st = plate.status;
      for (const c of st.removeChildren()) c.destroy({ children: true });
      let x = 0;
      const seg = (name: IconName, tint: number, label2: string) => {
        const mark = icon(name, 12, tint);
        if (mark) {
          mark.position.set(x, 0.5);
          st.addChild(mark);
          x += 14;
        }
        const t = new Text({ text: mark ? label2 : `${name} ${label2}`, style: { fill: tint, fontSize: 11, fontFamily: "system-ui", fontWeight: "700" } });
        t.position.set(x, 0);
        st.addChild(t);
        x += t.width + 8;
      };
      if (wardsLabel) seg("ward", 0x8fd0ff, wardsLabel);
      if (v.burn > 0) seg("burn", 0xffa04d, String(v.burn));
      for (const label2 of doomLabels) seg("prophecy", 0xc9a0f0, label2);
      if (x > 0) x -= 8;
      st.position.set(box.w - 12 - x, 25);
    }
    plate.glow.visible = active;
  }

  private face(defId: string): CardFace {
    const c = this.cards[defId];
    return c
      ? { name: c.name, school: c.school, type: c.type, level: c.level, cost: c.cost }
      : { name: defId, school: "Neutral", type: "?", level: null, cost: null };
  }

  sync(state: MatchState, cards: CardCatalog): void {
    this.cards = cards;
    this.last = state;
    if (this.mounted && this.lastEpoch !== -1 && state.epoch !== this.lastEpoch) {
      if (this.selHandDef) {
        this.selHandDef = null;
        this.cb.onSelection?.(false);
      }
      this.runEvents(state);
    }
    this.lastEpoch = state.epoch;
    if (this.mounted) this.draw();
  }

  /** Recompute desired card views from the last state (+ local selection) and reconcile. */
  private draw(): void {
    const state = this.last;
    if (!state) return;
    const you = state.view.self;
    const opp = state.view.opponent;
    const legal = state.yourTurn ? state.legal : [];

    this.updatePlate(this.oppPlate, `Opponent · ${state.schools[1]}`, state.schools[1], opp, !state.gameOver && state.activePlayer === 1);
    this.updatePlate(this.youPlate, `You · ${state.schools[0]}`, state.schools[0], you, !state.gameOver && state.activePlayer === 0);
    // "↻N" = exhaustion clock: the discard has recycled N times (each reshuffle dealt 2×N damage).
    this.oppDeckL.text = `Deck ${opp.resourceDeckCount}${opp.reshuffles ? ` · ↻${opp.reshuffles}` : ""}`;
    this.oppHandL.text = `Hand ${opp.handCount ?? 0}`;
    this.youDeckL.text = `Deck ${you.resourceDeckCount}${you.reshuffles ? ` · ↻${you.reshuffles}` : ""}`;

    const byType = (t: string) => legal.filter((a) => a.type === t);
    const attachTargets = (def: string) => byType("attach").filter((a) => a.defId === def);
    const castFor = (i: number): LegalAction | undefined => [...byType("cast"), ...byType("castReaction")].find((a) => a.preparedIndex === i);
    const trainerFor = (def: string) => byType("playTrainer").find((a) => a.defId === def);
    const retract = byType("retractCast")[0];

    const desired: Desired[] = [];
    const push = (d: Partial<Desired> & Pick<Desired, "key" | "layer" | "x" | "y">) =>
      desired.push({ faceDef: null, w: CARD_W, h: CARD_H, rot: 0, z: 0, highlight: "none", dim: false, attached: [], edge: null, stamp: false, sealed: false, onTap: null, spawn: null, spawnScale: false, ...d });

    // --- opponent prepared (face-down until cast/revealed) + deck ---
    opp.prepared.forEach((p, i) => {
      const c = preparedCenter("opp", i);
      push({ key: `p1:${i}`, layer: this.oppLayer, x: c.x, y: c.y, faceDef: p.spellDefId ?? null, dim: p.cast, sealed: p.sealed, attached: this.symsOf(p.attached) });
    });
    push({ key: "deck1", layer: this.oppLayer, x: OPP_DECK.x, y: OPP_DECK.y, faceDef: null });

    // --- the stack ---
    const n = state.view.stack.length;
    state.view.stack.forEach((it, i) => {
      const c = stackCenter(i, n);
      const top = i === n - 1;
      const canRetract = it.controller === 0 && !!retract && top;
      const isReactTarget = it.controller !== 0 && top && state.reactionWindow;
      push({
        key: `s:${i}`,
        layer: this.stackLayer,
        x: c.x,
        y: c.y,
        z: i,
        faceDef: it.spellDefId,
        dim: it.cancelled,
        stamp: it.cancelled,
        edge: it.controller === 0 ? "bottom" : "top",
        // Both retract-or-confirm and react-or-pass are "the game is waiting on this" — loud gold.
        highlight: canRetract || isReactTarget ? "react" : "none",
        onTap: canRetract ? () => this.cb.onAction(retract!.index) : null,
        spawn: this.stackSpawn(state, it.controller, it.spellDefId),
        spawnScale: true,
      });
    });

    // --- your prepared spells ---
    you.prepared.forEach((p, i) => {
      const c = preparedCenter("you", i);
      const cast = castFor(i);
      const isTarget = !!this.selHandDef && attachTargets(this.selHandDef).some((a) => a.preparedIndex === i);
      let highlight: Highlight = "none";
      let onTap: (() => void) | null = null;
      if (isTarget) {
        highlight = "target";
        const a = attachTargets(this.selHandDef!).find((x) => x.preparedIndex === i)!;
        onTap = () => this.doAttach(a.index);
      } else if (cast) {
        highlight = cast.type === "castReaction" ? "react" : "actionable";
        onTap = () => this.cb.onAction(cast.index);
      }
      push({
        key: `p0:${i}`,
        layer: this.youLayer,
        x: c.x,
        y: c.y,
        faceDef: p.spellDefId ?? null,
        dim: p.cast && !cast,
        sealed: p.sealed,
        highlight,
        onTap,
        attached: this.symsOf(p.attached),
      });
    });

    // --- your piles ---
    push({ key: "deck0", layer: this.pileLayer, x: YOU_DECK.x, y: YOU_DECK.y, faceDef: null });
    if (you.discard.length) push({ key: "disc0", layer: this.pileLayer, x: YOU_DISCARD.x, y: YOU_DISCARD.y, faceDef: you.discard[you.discard.length - 1]!, dim: true });

    // --- your hand (main phase only; prepare uses the React spellbook tray) ---
    if (state.phase !== "prepare") {
      const hand = you.hand ?? [];
      const fan = handLayout(hand.length);
      hand.forEach((def, i) => {
        const f = fan[i]!;
        const info = this.cards[def];
        const isComp = info?.type === "Component";
        let highlight: Highlight = "none";
        let onTap: (() => void) | null = null;
        let dim = false;
        if (isComp) {
          const targets = attachTargets(def);
          if (this.selHandDef === def) highlight = "target";
          else if (targets.length) highlight = "actionable";
          else dim = true;
          if (targets.length) onTap = () => this.onHandComponent(def);
        } else {
          const tr = trainerFor(def);
          if (tr) {
            highlight = "actionable";
            onTap = () => this.cb.onAction(tr.index);
          } else dim = true;
        }
        push({ key: `h:${i}`, layer: this.handLayer, x: f.x, y: f.y, rot: f.rot, z: i, w: HAND_W, h: HAND_H, faceDef: def, highlight, dim, onTap, spawn: YOU_DECK, spawnScale: true });
      });
    }

    this.reconcile(desired);
  }

  private symsOf(defIds: string[]): string[] {
    return defIds.map((d) => this.cards[d]?.cost ?? "?");
  }

  /** Where a newly-cast stack card should fly in from: the caster's matching prepared slot. */
  private stackSpawn(state: MatchState, controller: number, defId: string): Pt {
    const arr = controller === 0 ? state.view.self.prepared : state.view.opponent.prepared;
    const idx = arr.findIndex((p) => p.spellDefId === defId);
    if (idx >= 0) return preparedCenter(controller === 0 ? "you" : "opp", idx);
    return { x: CIRCLE.cx, y: controller === 0 ? CIRCLE.cy + 150 : CIRCLE.cy - 150 };
  }

  private reconcile(desired: Desired[]): void {
    const keys = new Set(desired.map((d) => d.key));
    // Exit sprites no longer wanted.
    for (const [key, sp] of [...this.sprites]) {
      if (keys.has(key)) continue;
      this.sprites.delete(key);
      if (this.hoverKey === key) {
        // The hovered card is leaving the board — pointerout will never fire for it.
        this.hoverKey = null;
        this.cb.onHover(null);
      }
      const v = sp.visual;
      const x0 = v.root.x;
      const y0 = v.root.y;
      this.tweener.add({
        duration: 220,
        tag: key + ":move",
        onUpdate: (p) => {
          v.root.alpha = 1 - p;
          v.root.y = lerp(y0, y0 - 18, p);
        },
        onComplete: () => v.destroy(),
      });
    }
    // Create / update.
    for (const d of desired) {
      let sp = this.sprites.get(d.key);
      if (!sp) {
        // A previous card may still be fading out under this key. enter()'s same-tag tween
        // would silently cancel that exit fade WITHOUT its onComplete — leaking the old
        // visual into the layer forever — so complete the exit (and its destroy) now.
        this.tweener.finish(d.key + ":move");
        const visual = new CardVisual(d.w, d.h);
        d.layer.addChild(visual.root);
        const created: Sprite = { visual, layer: d.layer, faceDef: d.faceDef };
        // Read the LIVE face at hover time — the card at this position changes.
        const key = d.key;
        visual.onHover(
          () => {
            this.hoverKey = key;
            if (created.faceDef) this.cb.onHover(created.faceDef);
          },
          () => {
            // Guard: with over/out interleaving across cards, only clear if we still own the hover.
            if (this.hoverKey !== key) return;
            this.hoverKey = null;
            this.cb.onHover(null);
          },
        );
        sp = created;
        this.sprites.set(d.key, sp);
        const from = d.spawn ?? { x: d.x, y: d.y };
        visual.root.position.set(from.x, from.y);
        visual.root.rotation = d.rot;
        this.applyFace(sp, d);
        this.enter(sp, from, d);
      } else {
        this.applyFace(sp, d);
        this.moveTo(sp, d);
      }
      sp.visual.root.zIndex = d.z;
      sp.visual.setHighlight(d.highlight);
      sp.visual.setDim(d.dim);
      sp.visual.setEdge(d.edge);
      sp.visual.setStamp(d.stamp);
      sp.visual.setSealed(d.sealed);
      // No action on this card? A tap pins it into the card-detail panel instead.
      const owner = sp;
      const inspect = () => {
        if (owner.faceDef) this.cb.onInspect?.(owner.faceDef);
      };
      sp.visual.setInteractive(!!d.onTap, d.onTap ?? inspect);
    }
  }

  private applyFace(sp: Sprite, d: Desired): void {
    // The card at a position can change under a stationary cursor — refresh the hover detail too.
    if (this.hoverKey === d.key && sp.faceDef !== d.faceDef) this.cb.onHover(d.faceDef);
    sp.faceDef = d.faceDef; // keep the live hover face in sync with what's painted
    if (d.faceDef) sp.visual.setFace(this.face(d.faceDef), d.faceDef);
    else sp.visual.setFaceDown(true);
    // Attached chips render on face-down cards too — the opponent's attachments are public info.
    sp.visual.setAttached(d.attached);
  }

  private enter(sp: Sprite, from: Pt, d: Desired): void {
    const v = sp.visual;
    v.root.alpha = 0;
    this.tweener.add({
      duration: 380,
      ease: easeOutCubic,
      tag: d.key + ":move",
      onUpdate: (p) => {
        v.root.x = lerp(from.x, d.x, p);
        v.root.y = lerp(from.y, d.y, p);
        v.root.rotation = lerp(0, d.rot, p);
        v.root.alpha = Math.min(1, p * 1.6);
        if (d.spawnScale) v.root.scale.set(lerp(0.72, 1, p));
      },
    });
  }

  private moveTo(sp: Sprite, d: Desired): void {
    const v = sp.visual;
    const x0 = v.root.x;
    const y0 = v.root.y;
    const r0 = v.root.rotation;
    const moved = Math.abs(x0 - d.x) > 0.5 || Math.abs(y0 - d.y) > 0.5 || Math.abs(r0 - d.rot) > 0.001;
    if (!moved) return;
    this.tweener.add({
      duration: 220,
      ease: easeInOutCubic,
      tag: d.key + ":move",
      onUpdate: (p) => {
        v.root.x = lerp(x0, d.x, p);
        v.root.y = lerp(y0, d.y, p);
        v.root.rotation = lerp(r0, d.rot, p);
        v.root.alpha = 1;
        v.root.scale.set(1);
      },
    });
  }

  // ---- board-local interactions ----
  private onHandComponent(def: string): void {
    const legal = this.last?.legal ?? [];
    const targets = legal.filter((a) => a.type === "attach" && a.defId === def);
    if (targets.length === 0) return;
    if (targets.length === 1) {
      this.doAttach(targets[0]!.index);
      return;
    }
    this.setSel(this.selHandDef === def ? null : def); // toggle, then pick a prepared target
  }

  private setSel(def: string | null, redraw = true): void {
    if (this.selHandDef === def) return;
    this.selHandDef = def;
    this.cb.onSelection?.(!!def);
    if (redraw) this.draw();
  }

  private doAttach(index: number): void {
    this.setSel(null, false);
    this.cb.onAction(index);
  }

  /** Public: let the React "Cancel" button clear an in-progress attach selection. */
  clearSelection(): void {
    this.setSel(null);
  }

  hasSelection(): boolean {
    return this.selHandDef !== null;
  }

  // ---- event-driven floaters / flashes ----
  private runEvents(state: MatchState): void {
    const stagger: [number, number] = [0, 0];
    let stackMoved = false;
    for (const e of state.events) {
      if (isStackEvent(e)) stackMoved = true;
      const f = eventToFloater(e);
      if (!f) continue;
      const plate = f.side === 0 ? this.youPlate : this.oppPlate;
      spawnFloater(this.fxLayer, this.tweener, plate.anchor.x, plate.anchor.y, f.text, f.color, stagger[f.side]++, f.side === 0 ? -1 : 1, f.icon);
      this.flashPlate(plate, f.struck);
    }
    if (stackMoved) this.flashStack();
  }

  private flashPlate(plate: Plate, struck: boolean): void {
    const { x, y, w, h } = plate.box;
    const flash = new Graphics();
    flash.roundRect(x - 3, y - 3, w + 6, h + 6, 12).stroke({ width: 3, color: struck ? 0xff5050 : 0x78f096 });
    this.fxLayer.addChild(flash);
    this.tweener.add({ duration: 520, onUpdate: (p) => (flash.alpha = 1 - p), onComplete: () => flash.destroy() });
  }

  private flashStack(): void {
    const ring = new Graphics();
    ring.circle(CIRCLE.cx, CIRCLE.cy, CIRCLE.r + 6).stroke({ width: 3, color: 0xffd36b });
    this.fxLayer.addChild(ring);
    this.tweener.add({ duration: 600, onUpdate: (p) => (ring.alpha = 1 - p), onComplete: () => ring.destroy() });
  }

  destroy(): void {
    this.ro?.disconnect();
    this.tweener.clear();
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}
