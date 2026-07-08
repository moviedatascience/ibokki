<!-- Generated 2026-07-06 by a Claude multi-agent audit of the codebase. Regenerate by asking Claude to re-audit art assets; update by hand as assets are chosen (see art/chosen.json). -->

> **Art direction lives in [STYLE_BIBLE.md](STYLE_BIBLE.md)** (2026-07-07) — it supersedes
> the §2 style seeds below and adds scope this manifest predates: battle-pass
> **alternate-scene variants** for every card (`{defId}__alt`, +174 pieces), sellable
> **venue** boards (candlelit study first), and the arena end-state.

# Ibokki Art-Asset Manifest (merged audit)

**Ground truth:** the entire game ships with **zero image files** — no favicon, no textures, no card art, no webfonts. Everything is procedural PixiJS vectors (`Container`/`Graphics`/`Text` only), CSS gradients, and emoji. The codebase was explicitly built for art drop-in: `cardSprite.ts` says "*real art drops into this same footprint later (swap the body fill for a Sprite, keep the layout)*", `styles.css` `.sbart` says "*real art drops into .sbart later*", and `PixiBoard.buildStatic()` says "*placeholder rings only*". The universal asset key is card `defId` (174 catalog entries: 164 cards in `cards.json` + 10 code-defined `CMP-*` components); no schema change is required if files are named by defId.

---

## 1. Prioritized manifest

### P1 — transforms the game's look; explicit drop-in points already exist

| # | Asset | Plugs in at | Current state | Target size / aspect | Count |
|---|---|---|---|---|---|
| 1 | **Board background (table felt) + arcane ritual circle** | `PixiBoard.ts` `buildStatic()` — `bgLayer` Container is ready and empty; circle at world (640,300) r=168 in a 1280×800 world; `flashStack()` gold pulse overlays it | Flat `#0e1411` + 3 stroked placeholder circles | Full-bleed 2560×1600 (2× world, 16:10); circle as separate transparent PNG ~700×700 (1:1), optionally a glow-state variant | 2 |
| 2 | **Card back** | `cardSprite.ts` `drawBack()` — both decks, opponent hand, face-down prepared spells; also `playvsclaude` `.back` divs | Procedural hatch + circle / stripe gradient + ✦ | 5:7, ~460×640 (2× the 92×128 world footprint, corner radius 9); must read at 92×128 | 1 |
| 3 | **Card frame templates** | `cardSprite.ts` `drawBody()` (board 92×128, hand 88×122) + `.sbcard` CSS frame (spellbook 5:7) | Procedural rounded rect + 20px school-tinted title band (`SCHOOL_COLOR`: 7 keys) | 5:7, ~460×640, transparent art window; radius 9 | 5–7 (Evo / Abj / Div / Neutral-Component / Item-Gambit, ± variants) |
| 4 | **Component card art (CMP-V…CMP-VSM)** | Same card pipeline, keyed by defId — components are **33 of every 40-card resource deck**, the most-seen cards in the game | Procedural rect + monospace letters | 2:1 landscape master ~1024×512 (see #8 convention); glyph-centric art is fine | 10 |
| 5 | **V / S / M cost glyphs** | Cost text in `cardSprite.ts` `costT`, `.sbcost`, attached-component chips (`setAttached()`), ActionBar detach buttons, playvsclaude `.pip` circles | Plain monospace letters ("VV", "SM") | 1:1, 64×64 with alpha, legible at 9–13px; tint anchors `--v #f0b352` / `--s #5bc8c0` / `--m #b98cf0` | 3 (+7 optional dual/tri combos) |
| 6 | **School icons / crests** | Nameplate labels, TopBar, Home & SidePanels school selects, DeckBuilder `s-<school>` tabs, spellbook title bands — school-name strings already flow through `SCHOOL_COLOR`/`SCHOOL_VAR` maps, so an icon map keys identically | Missing (color + text only) | 1:1 SVG or 256×256 PNG, legible at 16–24px | 3 (+1 Neutral optional) |
| 7 | **Status marker icons (Burn, Ward, Prophecy, HP, Cancelled)** | `PixiBoard.ts:217–220` nameplate status line, `animations.ts` floating combat text, spellbook vitals, playvsclaude chips | Emoji (🔥 🛡 🔮 ♥) + procedural red ✕ — cross-platform inconsistent | 1:1, 64×64 with alpha, tintable, rendered at 11–26px | 5 (+3 if Spent/Channel/Delayed markers from the design doc get physical form) |
| 8 | **Per-card illustrations — Tier 1** (~45: the 15 preset trainers + ~30 L1–L2 school spells cast every match) | Pixi board card (`cardSprite.ts`, art window ~92×74) + DOM spellbook `.sbart` (`SpellbookTray.tsx:87`, aspect 2/1) + deck-builder thumbnails | Placeholder (flat fill / school-tinted CSS gradient) | **2:1 landscape master, 1024×512**, named `art/cards/{defId}.webp` — covers the .sbart 2:1 crop directly; board window takes a ~5:4 center crop | ~45 of 174 total |
| 9 | **Favicon + OG/social image** | `apps/client/index.html` `<head>` — currently has NO icon link, NO meta/OG tags; ibokki.com/play shares render blank | Missing | Favicon: 1:1 master 512×512 (+32, +180 apple-touch); OG: 1200×630 | 2 sets |
| 10 | **Logo / IBOKKI wordmark** | `TopBar.tsx` `.brand` (15px), `Home.tsx` `h1.logo` (34px), playvsclaude header | Placeholder — letterspaced text tinted `#d7c4ff` | Wide SVG (~5:1) + square mark-only variant; must scale 15px→40px height | 1–2 |

### P2 — completes the experience

| # | Asset | Plugs in at | Current state | Target size / aspect | Count |
|---|---|---|---|---|---|
| 11 | **Per-card illustrations — Tiers 2–3** (remaining ~106 school spells/reactions, then 13 off-preset trainers) | Same pipeline as #8 | Placeholder | 2:1, 1024×512, defId-named | ~119 |
| 12 | **Home screen hero / background** | `Home.tsx` landing shell over flat `--felt` | Missing | ~2560×1440, dark and low-contrast so auth/deck panels stay readable | 1 |
| 13 | **Preset deck cover art (Emberworks / Bastion / Riptide)** | Deck `<select>` + decklist on Home; names from `packages/engine/src/decks.ts` | Missing (text options) | ~2:1 or 1:1 thumbnails, school-color coded | 3 |
| 14 | **Victory / defeat banners** | `GameOverSummary.tsx` `.gopanel` — currently "You win! 🎉" text | Missing | ~1120×400 wide banner (2× atop 560px panel) | 2–3 |
| 15 | **Player avatars / school portraits** | `PixiBoard.makePlate()` 224×74 nameplates at (20,16)/(20,470) — fits a ~56–64px square | Missing (text plates) | 128×128 portrait | 3+ (one per school minimum) |

### P3 — polish / nice-to-have

| # | Asset | Plugs in at | Current state | Target size / aspect | Count |
|---|---|---|---|---|---|
| 16 | **FX textures (soft glow, ring burst, cancel stamp/seal)** | `flashStack`/`flashPlate` stroke fades, `HL_STYLE` outlines, cancelled ✕ | Procedural strokes | 256×256, alpha, tintable white | 3–5 |
| 17 | **Item / Gambit type icons** | Card type lines + "TR" badges (trainer tan-gold `0xcaa46a`) | Text labels | 1:1, legible at 14px | 2 |
| 18 | **Lobby / waiting empty-state spot illustration** | SidePanels OnlinePanel ("waiting for an opponent…"), Connecting state | Text only | ~1:1, fits 300px rail | 1 |
| 19 | **Display webfont for wordmark/headers** | All headers — currently system-ui only | Missing | 1 woff2, arcane-but-legible; body stays system | 1 |

**Total card-art scope:** 174 illustrations (164 cards: EVO 47, ABJ 45, DIV 44, ITM 8, GAM 20 — note DIV-013 does not exist — plus 10 CMP components), tiered: components (10) → preset trainers (15) → L1–L2 workhorses (~30) → remaining school cards (~106) → off-preset trainers (13).

---

## 2. Style seeds (paste into image-gen prompts)

**Overall game:** *A cerebral 1v1 wizard duel — grandmaster chess, not action fireworks. Dark arcane study / dueling table: deep green-black felt (#0e1411), charcoal panels, glowing gold accents (#ffd36b) marking where the game waits on you, pale-violet brand tint (#d7c4ff). Spells contest each other mid-air over a glowing ritual circle; face-down prepared spells, wards, and delayed prophecies create a mood of preparation, bluff, and inevitability. D&D-flavored aspiration: a puny level-1 wizard climbing toward True Archmage. Painterly fantasy, low clutter, strong silhouettes that read at 92×128 px, consistent three-school color coding.*

**Evocation — "The School of Energy" (red-orange #e0533d, Verbal, deck: Emberworks):** *Raw energy unleashed through incanted words — fire, lightning, sparks, roaring mouths of flame, embers and burn-scorched sigils. Aggressive, fast, burning resources faster than they recover; imagery of overload, detonation, phoenix heat. Palette: ember reds and oranges against the dark table, Verbal motifs of voice, breath, and spoken runes glowing in the air.*

**Abjuration — "The School of Protection" (blue #4a90e2, Somatic, deck: Bastion):** *Discipline made stone — layered wards, translucent shields, carved runes, fortress walls and sentinel monoliths conjured by precise hand gestures. Defensive, reactive, patient; energy held in reserve then reflected back. Palette: cold blues and steel greys with rune-light edges, Somatic motifs of poised hands, interlocking geometric barriers, seals and anchors.*

**Divination — "The School of Manipulation" (purple #a070e0, Material, deck: Riptide):** *Fate already read — eyes, stars, tarot-like cards, hourglasses, tide-pull currents of time; the seer has already seen how you die. Delayed dooms (Prophecy) arrive on schedule; imagery of ominous foresight, threads of destiny, mirrored futures. Palette: deep purples and teals, Material motifs of crystals, reagents, lenses, and scrying pools.*

**Components (V/S/M):** *Abstract arcane glyphs — mouth/soundwave for Verbal (gold #f0b352), stylized hand for Somatic (teal #5bc8c0), crystal/reagent for Material (lavender #b98cf0). Iconographic, flat-lit, instantly distinguishable at 13px.* **Neutral trainers:** *mundane wizard gear — tomes, pouches, chalk, charms, lenses — in the tan-gold trainer accent (#caa46a).*

---

## 3. Integration path

**Where files go (convention — establish it, none exists):**
```
apps/client/public/art/
  cards/{defId}.webp        # ABJ-001.webp … CMP-VSM.webp (2:1 masters, 1024x512)
  frames/{school-or-type}.png
  board/table.webp  board/circle.png  board/cardback.png
  icons/{school|vsm|status}/*.svg|png
  brand/logo.svg  favicon.svg|png  og.png
```
Vite copies `public/` into `dist/` at build; `apps/server/src/app.ts` static handler already maps `.png/.svg/.ico` MIME types — **zero server work needed**.

**Critical URL rule:** production mounts at `/play/` (`IBOKKI_BASE=/play/`, `vite.config.ts:14`). Every asset URL MUST be prefixed with `import.meta.env.BASE_URL` — already exported as `BASE` from `apps/client/src/api.ts:166`. Author raster assets at 2× logical size (renderer runs at `resolution: min(2, devicePixelRatio)`, `PixiBoard.ts:128`).

**Code touches, by asset:**

1. **Pixi card faces** — `apps/client/src/board/cardSprite.ts`: swap the `drawBody()` fill for a `Sprite` (`Assets.load(\`${BASE}art/cards/${defId}.webp\`)`), keep the existing text layout. One small plumbing change: `setFace(f: CardFace)` doesn't currently receive the defId — `PixiBoard.applyFace()` has it as `d.faceDef`, pass it through. `drawBack()` is the card-back swap point.
2. **Spellbook / DOM cards** — `apps/client/src/components/SpellbookTray.tsx:87`: give the existing `<div className="sbart" />` an inline `style={{backgroundImage: \`url(${BASE}art/cards/${defId}.webp)\`}}` — it's already inside a defId-keyed map; the `.sbart` div is already `aspect-ratio: 2/1`.
3. **Board bg + circle** — `PixiBoard.buildStatic()`: add a full-bleed Sprite to the existing empty `bgLayer` and a circle Sprite at (640,300) replacing the stroked rings; keep `flashStack()` as a tinted overlay.
4. **Icons (school/VSM/status)** — small maps keyed the same as `SCHOOL_COLOR` (`cardSprite.ts`) / `SCHOOL_VAR` (`SpellbookTray.tsx`); replace emoji strings in `PixiBoard.ts:208–220` and `animations.ts:31–43` with Sprites, and letter pips in `.sbcost`/`ActionBar` with `<img>`.
5. **Favicon/OG** — add `<link rel="icon">`, apple-touch, and OG/Twitter meta to `apps/client/index.html` (currently bare `<title>` only).
6. **Schema:** none required — `CardInfo` in `packages/protocol/src/index.ts` has no art field, and none is needed if the client resolves art by defId convention. Optionally add `art?: string` to `CardInfo`/`buildCardCatalog()` later for per-card overrides.
7. **Optional:** `apps/playvsclaude/public/index.html` (dev board) can reference the same files but is not user-facing.

**Key files:** `apps/client/src/board/cardSprite.ts`, `apps/client/src/board/PixiBoard.ts`, `apps/client/src/board/animations.ts`, `apps/client/src/components/SpellbookTray.tsx`, `apps/client/src/styles.css` (`.sbart`, lines 237–242), `apps/client/index.html`, `apps/client/src/api.ts` (`BASE`), `packages/protocol/src/index.ts`, `packages/cards/data/cards.json`, `packages/cards/src/components.ts`, `packages/engine/src/decks.ts`, `Design_Doc.md`.