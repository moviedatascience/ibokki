# Ibokki Style Bible

*v1 — drafted 2026-07-07 from the art-direction interrogation. The user is the art
director; every rule here was decided by him or is marked **PROPOSED** awaiting his sign-off.
This document overrides the style seeds in `art/MANIFEST.md` §2.*

---

## 0. North star

**Spellbook pages on a scholar's table, in a world whose sun is going out.**

Ibokki looks like a game published in an alternate 1981 by a small press with one brilliant
staff illustrator: pen-and-ink plates with muted gouache washes for the everyday spells,
full painted covers for the great ones, hand-set antique type, woodcut ornaments. The homage
targets D&D 1e–3e interior and cover art and original-era MtG cards — **heavy inking,
hand-drawn feeling** — with the *mood* of Vance's Dying Earth and Wolfe's Book of the New
Sun: an over-ripe, ancient world; magic as faded grandeur; wizards as vain scholars, not
action heroes.

The end-state presentation is a **duel arena**: two archmages facing off inside a diegetic
venue, with the game UI as chrome around the stage (see §11). Everything authored now must
survive that migration.

**The one-sentence test for any piece:** *could this have been printed in a rulebook found
in a used bookstore, and does it make the world feel old?*

## 1. Influence map — what we take, what we refuse

| Source | We take | We refuse |
|---|---|---|
| D&D interior plates (1e–3e) | Heavy confident ink line, hatched shadows, watercolor/gouache fill, art floating on the page, spot-illustration intimacy | Sloppy anatomy for its own sake; pure black-and-white (we always wash) |
| TSR painted covers (Elmore, Caldwell, BECMI era) | Gouache/oil matte finish, dramatic staging, saturated focal moments, trade-dress confidence | Square-jawed heroic idealization as the default figure canon |
| Original-era MtG (’93–’94) | Small-format discipline, strange/oblique subjects, art as artifact, quiet functional frames | Simulating 25 different artists — we are ONE hand (§14) |
| Vance, Dying Earth | Vanity, wit, ornate impractical costume, magic as salvage-scholarship, names with too many syllables | Full parody; the humor is wry, never zany |
| Wolfe, New Sun | Institutional solemnity, alien melancholy, the swollen old sun, formality of the duel | Unrelenting grimness; torture imagery; illegible obscurity |
| The user's reference scans | Register split (plate vs cover), muted-earth-plus-accent color, period print materiality | Halftone dots / scan damage at card size (§12) |

**Banned outright** (kill on sight, standing negative prompt, §13):
1. **Modern digital glow** — bloom, rim-light HDR, volumetric god-rays, particle soup, the
   ArtStation/Hearthstone look.
2. **Anime / manga stylization** — cel shading, anime facial canon, manga line conventions.

*Not* banned but constrained: photographic/3D rendering is excluded by the positive spec
(everything must read hand-made); 80s airbrush softness may appear **inside** cover-tier
paintings as a technique (the era used it) but never as the overall finish.

## 2. The two registers

Every illustrated asset belongs to exactly one register. The split is the collectible
hierarchy, the production system, and the homage itself (interiors vs covers).

### Register A — the Plate (pen-and-ink + wash)

- **Used for:** component cards (CMP-*), trainers (ITM/GAM), school spells **level 1–2**,
  and spot illustrations (empty states, marginalia). Status *markers* (Burn/Ward/…) are
  §10 woodcut glyphs, never plates.
- **Line:** heavy, confident, hand-drawn contour ink — the heaviest weight on the outer
  silhouette, medium on interior forms, lightest for hatching. Line is WARM near-black
  (§4), never pure #000, never uniform-width vector.
- **Shadow:** parallel hatching and cross-hatching in shadow cores only; stipple for
  texture. No smooth digital gradients anywhere — value moves in wash layers.
- **Fill:** muted gouache/watercolor wash, matte, flat, deliberately under-blended;
  dry-brush breaks at edges.
- **Ground:** vignette onto **aged parchment** — the art floats on the page like a book
  plate, edges dissolving into paper. The parchment is part of the artwork file.
- **Mood:** intimate, observed, wry. This is the register where the world lives its
  daily life.

### Register B — the Cover (matte gouache painting)

- **Used for:** school spells **level 3+** — every big spell is a cover moment (Meteor,
  Final Reckoning, Aegis Eternal…) — plus deck covers, venue art, victory/defeat banners,
  OG image, home hero.
- **Rendering:** gouache/oil matte finish, visible brushwork, hand-mixed color; drawing
  underneath still shows — edges are drawn, not lost in paint. Airbrush softness permitted
  within a painting (skies, glows of the *painted* kind), never as overall finish.
- **Light:** painted light — a glow is a shape with an edge, mixed on a palette, not a
  screen-space bloom. If it looks emitted by the monitor rather than reflected off paper,
  it fails.
- **Ground:** full-bleed scene, edge to edge. Value key mid-dark; the single vivid accent
  (§4) carries the focal point.
- **Mood:** dramatic but stable — the grandeur register. Heroic idealization is allowed
  here as a *rare deliberate note*, never the default.

### Tier map (mechanical rule)

| Card class | Register | Ground |
|---|---|---|
| CMP-* components | Plate | Parchment vignette |
| ITM / GAM trainers | Plate | Parchment vignette |
| School spells L1–L2 | Plate | Parchment vignette |
| School spells L3+ | Cover | Full-bleed |
| Deck covers, venues, banners, hero/OG | Cover | Full-bleed |
| Archmage avatars | Plate (line & wash, no parchment) | Transparent — matted after generation (§13) |
| Card back, frames, wordmark, favicon | Graphic design (§10) | — |
| Icons/glyphs | Woodcut (§10) | Transparent |

### Battle-pass alternate art (grindable cosmetics)

Every card eventually gets **one alternate-scene variant**: same register, same style laws,
**different moment** — base Fireball shows the casting, the alt shows the aftermath; base
Sanctum shows the ward raised, the alt shows the night it held. Variants are narrative
depth, not style departures. File convention: base `apps/client/public/art/cards/{defId}.png`,
variant `{defId}__alt.png` beside it (the manifest's `.webp` is a future bulk conversion).
For components and object-centric trainers — whose base art is the studied specimen — the
alt shows *the same apparatus in use in the world*. An alt is always QA'd side-by-side
with its own base: the pair must read as two plates from the same page. Alternate-art
cards also earn the engraved-border upgrade frame (§10, approved) as part of the
reward feel. Scope: 174 base + 174 alt = 348 illustrations, produced base-first.

## 3. Composition law

1. **One dominant subject.** Every piece answers "what is this a picture of?" in one word.
2. **Silhouette first.** The subject must read as a shape at **92×74 px** — the board art
   window. The review gallery renders this crop at true size; if it's mud, it's rejected
   regardless of how the full image looks.
3. **Master format:** 2:1 landscape, 1024×512 generation. The board window takes a ~5:4
   **center crop** — the subject's core must live in the middle ~62% of the width. Wings
   of the composition are for the spellbook tray (which shows the full 2:1) and full-art
   contexts.
4. **Camera:** Plates sit at eye level or gentle three-quarter, shallow staging — an
   observer sketching from across the room. Covers may go dramatic (low angle, deep
   space) but never disorienting; the era's covers were theatrical, not cinematic.
5. **Value structure:** Plates are light-ground (parchment) with dark accents; covers are
   mid-dark with one bright focal area. Either way: big simple value masses, details live
   inside them.
6. **Clutter budget:** backgrounds earn their place or dissolve into wash/paper. When in
   doubt, remove.

## 4. Palette law

**The world has gone slightly sepia; magic is the only vivid thing left in it.**
Each piece is muted earth + ONE saturated accent, and the accent is the school speaking.

### Base earths (both registers)

| Token | Hex | Use |
|---|---|---|
| ink | `#2b2320` | line work, deepest darks — never pure #000 |
| sepia | `#5a4a3a` | mid darks, secondary line |
| umber | `#7a5c3e` | wood, leather, shadow flesh |
| sienna | `#9c5a38` | warm mids, brick, robes |
| ochre | `#c9a45a` | highlights on earth, brass, candle warmth |
| olive | `#6b6b45` | vegetation, oxidized bronze, murk |
| sage | `#8a8a70` | cool mids, stone, fog |
| bone | `#efe8d8` | lights, paper lights |

### Paper (Plate register ground)

parchment-light `#e8dcc0` · parchment `#ddcfae` · parchment-deep `#c9b68d`

### School accents — print pigments (in artwork)

UI chrome keeps the existing school tokens (`#e0533d` / `#4a90e2` / `#a070e0`, trainer
`#caa46a`). The V/S/M pip colors (`#f0b352` / `#5bc8c0` / `#b98cf0`) today exist only in
the dev board — they are hereby **adopted** as the client tokens when the glyphs land.
**Inside artwork**, use their print-pigment cousins so art never looks backlit:

| School | Focal accent | Support | Deep |
|---|---|---|---|
| Evocation | ember `#c9472e` | flame `#e0763d` | scorch `#7e2a1c` |
| Abjuration | cobalt `#3e6fa3` | steel `#7d8fa3` | depth `#2c4a70` |
| Divination | violet `#7d5ba6` | dusk-teal `#4e7d7a` | umbra `#4d3766` |
| Trainer/neutral | gold-leaf `#c99a3f` | — | — |
| V / S / M in art | gold-leaf `#c99a3f` | verdigris `#4f9a90` | amethyst `#8f6bb5` |

**Rules:** one focal accent per piece (support/deep hues of the same school may assist);
never two schools' accents in one image unless the card is explicitly about the clash —
and then the clash IS the subject; V/S/M pigments count as *support* colors, never the
focal accent — multi-component cards (CMP-VS…CMP-VSM) take gold-leaf as their single
focal with the other component motifs desaturated; accent coverage ≤ ~20% of the canvas —
scarcity is what makes it read as magic.

## 5. Line & mark vocabulary

- Line weight hierarchy: silhouette > form > hatch. A plate with uniform line weight
  looks digital — reject it.
- Permitted marks: contour line, parallel hatch, cross-hatch (shadow cores only), stipple,
  dry-brush drag, wash bloom (watercolor back-run — welcome, it reads as hand-made).
- Forbidden marks: airbrush-smooth gradients as fills (cover-interior exceptions per §2B),
  digital smudge, lens effects, motion blur, soft-brush glow.
- Blacks pool in the plate register (spot blacks are period-true and help 92px legibility)
  but stay warm (`#2b2320`).

## 6. Figures & costume canon

**Characterful & weird.** People in ibokki are *interesting* before they are beautiful.

- Faces: lived-in, expressive, slightly caricatured — the potion-pouring wizard, not the
  barbarian. Age is visible and worn with vanity. Hands act (they cast, pinch reagents,
  gesture wards) and get drawing attention accordingly.
- Bodies: under robes. No heroic musculature, no pin-ups. Odd proportions welcome —
  tallness, gauntness, stoutness as character.
- Costume: ornate and slightly impractical — Vancian vanity. Layered robes, absurd
  sleeves, too many rings, school-accent silk linings glimpsed at cuffs. Fasteners are
  period-fantastic (frogs, pins, cords) — **no zippers, no modern tailoring, no
  athleisure silhouettes** (kill-on-sight tell).
- Grotesques allowed; content governed by tone, not caps (§9).
- Heroic idealization: a rare, deliberate note in Cover-tier pieces only.

## 7. The cast — three archmages (**CANON — signed off by the art director, 2026-07-07**)

The trio anchors school identity: they appear in trainer-card scenes, big cover moments,
avatars/nameplates, marketing, and eventually as the arena fighters (§11). **Most spell
plates stay phenomenon-centric** — the spell, the apparatus, the consequence — so the
trio seasons the set rather than saturating it (target: trio appears in ≲25% of a
school's pieces). **Cast reference art is always a full scene** — the character doing
something in the world, never an isolated figure on blank ground (art director,
2026-07-07). Canonical references live in `art/cast/` with prompts + seeds in chosen.json.

- **Evocation — Ashmalka, called “Grandmother Cinder.”** A tiny ancient woman in layered
  oxblood and ash-grey shawls with singed tassels, clay pipe in her teeth. Casual and
  terrifying: fire is an old appetite, not a performance. Canonical scene: kneeling to
  light her pipe from the last small flame of a duel circle that is otherwise entirely
  ablaze behind her, unimpressed (seed 1179008251). Iconography: the pipe's thread of
  living flame, smolder over blaze, appetite in the eyes.
- **Abjuration — Berenice the Adamant.** Broad, stoic, patient as masonry. Stone-grey
  layered vestments with cobalt silk beneath; keystone pendant of interlocked rings;
  carries no book — the wards are memorized. Canonical scene: alone in the breach of a
  crumbling gatehouse, both hands raised, a translucent cobalt ward filling the arch
  with arrows and rubble stopped mid-air against it (seed 1017935556; solo portrait for
  avatar crops: seed 530981142). Her weariness is the weariness of a wall that has held
  everything so far.
- **Divination — Vess of the Undertow.** Robes that hang dripping wet though the ground
  is dry; eyes pale as sea-glass; a cord of woven kelp hung with stoppered vials; moths
  at the waterline. Canonical scene: bowed over a black tide pool formed among fallen
  out-of-date star charts in a ruined observatory, water streaming from them into the
  pool, a violet current of fate in the water (seed 686338496). Iconography: tide pools,
  kelp and vials, the sea arriving where it shouldn't (the *Riptide* current).

## 8. World canon (CANON — set by the art director, 2026-07-07)

- **The world is a pocket dimension, and it exists by accident.** It has seen eons of
  creation and destruction. Inhabitants struggle to understand how they got there
  unless they were born there — and even they can't remember half the time. **Time and
  space are broken in some fundamental but imperceptible way**; the best the scholars
  manage is that they *fold in on themselves in a way they shouldn't.* Visual license:
  geography that quietly fails to add up — a horizon too close, stairs that return, two
  shadows from one light, ruins whose eras cannot be sequenced, architecture from
  histories that contradict each other. The wrongness is seasoning, never the subject;
  it should be missable at first glance.
- **Ibokki, the goddess.** She gives magic to certain chosen — in fits and spurts
  throughout history — in order to **create through chaos**. No one comprehends to what
  end. All practitioners know is that *Ibokki is looking for something, and she seems
  to smile upon them when they fight — so the fighting must help her find it.* Her
  invocation is phonetic: **"Eye, Bow, Key"** — Eye for Divination, Bow for Evocation,
  Key for Abjuration (§10).
- **The Late Sun:** swollen, amber, patient — the pocket dimension's sky is old and
  slightly wrong. Daylight is honeyed and slanted; night is when scholarship happens.
  The sun appears in art as an omen, never a cheerful sky.
- **The world is over-built:** every landscape carries the ruins of better centuries —
  towers of dead empires, roads to nowhere, libraries with more floors than readers.
  Magic is salvage, scholarship, and gift — never invention.
- **The duel is devotion.** Formal, attended, ancient — guild solemnity — and beneath
  the formality, votive: duelists fight because she watches, and finds. This is the
  fiction that makes the arena (§11) canonical: duels happen in *venues*, before
  witnesses, by old rules. The ritual circle is the regulation apparatus.
- Recurring props (use for continuity): the engraved ritual circle, the Eye/Bow/Key
  sigils, chained spellbooks, component pouches and reagent vials, candle stubs, moths,
  out-of-date star charts (out of date, and still correct — the sky folds too).

## 9. Tone rules

Global dial: **melancholy-weird** — wonder over horror, decay over gore, wry Vancian
humor permitted (a wizard's vanity, a familiar's disdain, a prophecy filed under the
wrong century). Never zany, never grimdark.

| School | Inflection | Feels like |
|---|---|---|
| Evocation | burns brash | appetite, showmanship, the joy of overdoing it |
| Abjuration | endures stoic | patience, weight, the dignity of refusal |
| Divination | unsettles | inevitability, moths, being read to from your own diary |

Content: **no caps — this is a game for adults** (art director, 2026-07-07). Gore,
horror, and cruelty are available tools wherever they serve the piece. The only governor
is taste, and taste means the tone above: dread, decay, and consequence in the
melancholy-weird key — shock deployed *for* the mood, not instead of it. (The earlier
period-book caps were the illustrator's guess, not a mandate. The image-generation
tooling may balk at the furthest extremes; treat that as a tool limit, not a design
rule.) Humor lives in expressions, marginalia, and titles — not in breaking the world's
reality.

## 10. Graphic design system

### Card frame — “quiet frame, inked corners”

- Structure: early-MtG functional — name band, art window, type line, rules box — on a
  school-tinted, paper-textured field. The frame **recedes**; art and text carry.
- Ornament budget: hand-inked corner pieces and a single rule under the title. Corner
  motifs are per-school (flame-tongue / keystone / star-point) but read as texture at
  board size.

### Card back — the Invocation

One universal back (both decks, opponent hand, face-down prepared spells — the
most-seen single image in the game): **the phonetic invocation of Ibokki, "Eye, Bow,
Key."** An Eye (Divination), a Bow (Evocation), and a Key (Abjuration) as engraved
emblems, arranged as a device within the ritual-circle geometry, in ochre/gold-leaf
line on a deep leather-brown field (`#2b2320`–`#3a2e26` range), quiet corner ornaments
matching the frame language. Every card in the game is dealt goddess-side down.
Treated as graphic design: authored vector (generated engraving as reference only),
instant read at 92×128, uncluttered — it is wallpaper, not a poster.
**APPROVED (2026-07-07):** built as `art/glyphs/cardback.svg` — 460×640 master: the Eye
presiding over Bow and Key in ringed medallions inside the regulation circle, a
still-point at the triangle's center, double rules, quiet corner diamonds — and
`art/glyphs/cardback-small.svg` — the 92×128 board variant: field, one rule, the three
sigils stacked. The Bow's string is thickened in the back's copies for small-scale read.
- Small-size law: at 92×128 the frame simplifies — corners drop, bands and school tint
  remain. Author frames as a 460×640 master + explicit 92×128 simplified variant.
- **APPROVED (2026-07-07):** battle-pass alternate-art cards earn a full **engraved border**: a dense
  hand-inked ornamental frame — fine engraving-weight line, the school motif woven
  continuously through it, two or three densities richer than the base corners — in the
  register of the old inked cave-mouth cover borders.
- **Production method:** frames are **authored vector/layout work** like the glyphs (all
  school/type variants, 460×640 master + simplified 92×128 variant each); diffusion
  cannot produce clean symmetric frames with text bands, and the standing negative
  prompt bans borders precisely so frames never appear inside artwork. Generated
  engraving output may serve as *reference* for the corner ornaments only.

### Typography

- **Display (card names, headers, labels): IM Fell English** — Igino Marini's OFL
  digitizations of the 1600s Fell types; rough edges and ink-spread are the point. Use
  **IM Fell English SC** for eyebrows/small labels. Large display/wordmark scaffolding:
  IM Fell French Canon.
- **Rules text: Alegreya** (OFL) — a humanist book face that reads at 11–13px where Fell
  gets crunchy. *(Fallback stance: if Alegreya feels too modern next to Fell in practice,
  test Sorts Mill Goudy.)*
- **UI utility (menus, buttons, numbers): system stack stays** — chrome should be quiet
  next to the antique display voice. `font-variant-numeric: tabular-nums` for HP/level.
- **Wordmark: hand-lettered**, unique — drawn display letterforms with era-logo
  confidence: heavy thick-and-thin strokes, slight hand irregularity, optional swash on
  the initial, white keyline when sitting on dark grounds (the register of the old boxed
  covers). Produced as SVG (drawn, not generated — diffusion cannot spell, see §13).

### Glyphs — woodcut stamps (authored SVG, never generated)

**CONFIRMED by concept probe 2026-07-07:** UI glyphs follow the solid woodcut treatment
(reference sheet seed 260943830); the card back's Invocation device alone uses the fine
**engraved** treatment (reference sheet seed 2076142635) — ceremony where there is room,
stamps where there is not.

V/S/M pips, school crests, status markers (Burn/Ward/Prophecy/HP/Cancelled), type icons:
solid-black hand-cut printer's-ornament shapes with deliberately rough edges, single
color, tinted by the existing UI tokens. Motifs (**APPROVED v1, 2026-07-07** — canonical SVGs in `art/glyphs/`): V = a
trident-rune with a breath-curl at its foot (the spoken rune, voice raised); S = a
fingers-together warding hand with a ring punched into the palm; M = a cut gem — table,
girdle, pavilion; **school crests are Ibokki's Invocation sigils — Evocation = the
heraldic strung Bow (no arrow), Abjuration = the horizontal Key whose bow is a keystone,
Divination = the heavy-lidded Eye with lash-rays** (flame-tongue and late-sun move to
secondary ornament vocabulary: frame corners, borders, marginalia). Must read at 11px.
**Status markers APPROVED v1 (2026-07-07):** Burn = solid wind-leant living flame; Ward
= heater shield with a keystone punched in the chief; Prophecy = an hourglass nearly run
out (doom on a schedule — deliberately not a crystal ball); HP = woodcut heart with
punched highlight; Cancelled = bold stamp X. All in `art/glyphs/`, all `currentColor`. These are **drawn as SVG by hand/vector
work**, not diffusion output — crispness at 11px and consistency across ~20 glyphs demand
it. Type icons **APPROVED (2026-07-07)**: Item = strapped satchel; Gambit = a pair of
thrown dice (the proposed wager coin read as a zero at pip size). Still **PROPOSED**:
Spent = snuffed candle; Channel = wick alight at both ends; Delayed = hourglass mid-turn.
The **favicon is the Invocation mark** — Eye, Bow, and Key combined into one small
device (**PROPOSED**; 512 master, 32/180 crops). The **OG/social image is
assembled**: a Cover-register painting with the vector wordmark composited over it —
never a generated image containing lettering.

## 11. The table, venues, and the arena end-state

**North star: the duel is staged.** Two archmages face off inside a diegetic venue —
Tekken framing — with the game UI as chrome around the stage. Boards are **venues**, and
venues are sellable cosmetics.

- **Venue 1 (ships first): the Candlelit Study.** Dark wood grain and a leather blotter
  in deep browns kept LOW-contrast and desaturated so school accents still pop (this is
  the reconciliation of warm-brown venue vs accent colors: the venue lives in the
  earth-palette shadows, `#2b2320`–`#5a4a3a` range, candle pools of `#c9a45a` warmth).
  The engraved ritual circle sits at regulation center; candle stubs, an inkwell, moth
  or two at the light.
- **Venue architecture (constant across all venues):** board world metrics stay fixed —
  1280×800 world, circle at (640,300) r=168, card footprints, nameplate zones. A venue =
  background art (2560×1600 master) + circle treatment + optional ambient props. Contrast
  contract: card faces and gold action highlights must clear the venue everywhere they
  can appear; venues are graded darker than any card face.
- **Migration-safe authoring rules (apply NOW):** archmage avatars are Plate-register
  line-and-wash, full-figure, matted to transparency (§13 matting rule); today's
  nameplates use a head-and-shoulders crop from the figure's upper third at 128×128,
  and the full figure survives for the arena. The ritual circle is a standalone
  transparent asset (engraved vector, or generated-then-matted). Markers/glyphs are
  venue-agnostic (§10). Nothing is baked into a venue background that will need to
  stand on a stage later.
- **Board FX are chrome, not artwork:** the glow ban (§1) governs *illustrations*; UI
  feedback FX (stack flash, highlight outlines, ring bursts, the cancel stamp) are
  exempt, but styled in the ink language — stamp and engraving shapes, authored vector,
  tinted by UI tokens, and never baked into artwork files.
- Until the arena rework, the confrontation reads through nameplate portraits facing
  each other and venue staging. The arena itself is a future engineering design doc, not
  this document.

## 12. Print materiality — “subtle press feel”

The finish evokes *a well-made book*, not *a bad scan*.

- **In:** paper tooth (subtle fiber texture in lights), slight ink spread at line edges,
  matte gouache flatness, gentle warm age-toning (≤ ~4% toward ochre), wash blooms.
- **Out:** halftone dot patterns, CMYK misregistration, scan yellowing, staple shadows,
  JPEG-artifact cosplay. (The reference scans have these because they are scans; we are
  the original plates, not the third printing.)
- Application: materiality is baked into the artwork by prompt (§13); do NOT add a global
  post-process texture overlay in the client — at 92px it turns to noise.

## 13. Prompt kit (Krea 2 Turbo)

Krea2 defaults to exactly the modern digital look we ban. Fight it by **leading with the
medium**, keeping subjects concrete, and never using trigger words. If probes show
prompt-only can't hold the line, escalate per the model plan: LoRA on curated era art or
IPAdapter reference conditioning — decision AFTER the probe session.

### Master block — Plate register (**CONFIRMED by probe round 2, 2026-07-07** — anchor: Augury, seed 1761527395)

> 1978 fantasy role-playing rulebook interior illustration, pen and ink drawing with
> fine etching-style crosshatched shading, muted gouache wash, heavy confident
> hand-drawn ink outlines, flat matte colors, vignette composition floating on aged
> parchment paper, the full subject inside the vignette and never cropped by the frame
> edges, printed book plate, muted earth palette of ochre, umber, olive and bone with a
> single [SCHOOL ACCENT] accent, [SUBJECT], [SCHOOL BLOCK], one dominant subject, strong
> readable silhouette, low clutter. no text, no borders, no frame, no card template

### Master block — Cover register (**CONFIRMED by probe, 2026-07-07** — anchor: Meteor, seed 480194483)

> early 1980s fantasy game box cover painting, matte gouache and oil, visible brushwork,
> hand-painted, drawing visible under the paint, dark dramatic staging, muted earth
> palette with a single vivid [SCHOOL ACCENT] accent, vintage book cover reproduction
> with subtle paper texture, [SUBJECT], [SCHOOL BLOCK], one dominant subject, strong
> readable silhouette. no text, no borders, no frame, no card template

### School blocks

- **Evocation:** fire and spoken flame-runes hanging in the air, ember red and orange as
  the only vivid color, scorched edges, aggressive diagonal energy, motifs of voice,
  breath and detonation
- **Abjuration:** wards of translucent stone and interlocking geometric barriers, cobalt
  blue as the only vivid color, seals, keystones and poised gesturing hands, weight and
  patience
- **Divination:** omens and out-of-date star charts, tide pools, hourglasses and moths,
  dim violet as the only vivid color, veiled eyes and smoked lenses, fate already written
- **Trainer / neutral (ITM, GAM, and neutral surfaces):** a wizard's mundane apparatus —
  tomes, pouches, chalk, charms, lenses — rendered with scholarly affection, gold-leaf
  as the only vivid color, motifs of study, wager and preparation
- **Components (CMP-*):** a single arcane component as studied specimen — a spoken rune
  hanging in air (V), a poised hand diagram (S), a reagent crystal or vial (M) — drawn
  like a figure from a reference book, gold-leaf focal with the component pigments as
  desaturated support

Non-card Cover assets (venues, hero, OG, banners) use the school block of their subject,
or the trainer/neutral block when the subject is the world itself.

### Standing negative prompt

> modern digital painting, airbrushed digital art, glow, bloom, volumetric lighting,
> lens flare, cinematic lighting, HDR, artstation, octane render, 3d render,
> photorealistic, photograph, anime, manga, cel shading, smooth gradients, neon colors,
> vibrant saturated colors, text, letters, watermark, signature, card frame, border

*(photo/3D terms are technical guards for the generator; the taste-level bans remain the
two in §1.)*

**Cover-register variant:** drop `glow` and `smooth gradients` from the list — covers
legitimately contain *painted* glows and soft painted skies (§2B), and the remaining
terms still guard against screen-space light. Plates always use the full list.

### Formats, matting, and large assets

- Card illustrations (base + alt): generate at **1024×512** (2:1), always.
- **Transparency:** Krea2 is txt2img-only and cannot emit alpha. Assets needing it
  (avatars, ritual circle) are generated on a flat bone ground with nothing touching the
  subject, then matted (background removal / hand cutout) before filing — or authored as
  vector outright. A halo-free matte is part of the asset's QA.
- **Large formats** (venue 2560×1600, hero 2560×1440, OG 1200×630, banners ~1120×400):
  generate at the matching aspect near ~1MP native (venue/hero 1280×800, OG 1216×640,
  banner 1280×456), then 2× upscale offline before filing. The MCP has no upscale tool
  yet (§16 open item); until it exists, large formats stop at native resolution and are
  re-finished once tooling lands.

### Prompt discipline

- Never write: epic, cinematic, detailed, intricate, 8k, masterpiece, trending, dramatic
  lighting, glowing (as a standalone), stunning. Each one drags toward the banned look.
- "Painted light" phrasing for covers: *"a painted glow with hard edges"*, *"firelight
  mixed from orange and bone gouache"* — describe pigment, not photons.
- Subjects concrete and Vancian: not "a powerful fire spell" but "an elderly wizard in
  scorched oxblood robes speaking a rune of fire that hangs burning in the air."
- **State costume explicitly in every subject line that contains a figure** ("robed,"
  "in layered vestments") — omit it and the model strips wizards heroic-bare (probe
  finding, 2026-07-07: both Aegis figures came out shirtless-muscular).
- One generation = width 1024, height 512, steps 0 (workflow default), seed −1; record
  every seed.
- Krea2 cannot spell: anything with letterforms (wordmark, titles, glyph text) is
  authored vector work, never generated.

### Anchoring process (anti-drift machinery)

1. **Probe** (next session): fixed subjects × style-block variants; pick winners.
2. **Anchor:** winners land in `art/chosen.json` with full prompt + seed. The anchor set
   is **six pieces — school × register** — and every review shows new options beside the
   relevant anchor. Every chosen.json entry also records `model` (ComfyUI
   checkpoint/workflow identity), resolved `steps`, and `cast` (which archmages appear,
   if any): a silent checkpoint or workflow-default change would fracture the one hand
   invisibly, so the drift audit's first check is *model unchanged since anchor*.
3. **Batch:** new pieces are generated only with bible blocks, reviewed against anchors
   side-by-side in the gallery, with the 92×74 crop checked at true size; an `__alt` is
   additionally reviewed beside its own base card (§2).
4. **Drift audit:** every ~20 accepted pieces, line up the last 20 thumbnails in one
   gallery; if the set no longer looks like one book, stop and re-anchor before
   continuing. Check the trio quota (§7, ≲25%) from the `cast` fields while there.

## 14. One hand, school inflections

The entire game reads as illustrated by **one fictional era artist**. Schools differ by
motif, accent, and mood (§4, §9) — never by rendering style. Practically: the master
blocks in §13 are IMMUTABLE per register; per-card creativity lives in the [SUBJECT]
line only. Any prompt experiment that touches the style block is a probe, not a
production piece, and its outputs cannot ship without re-anchoring.

## 15. QA checklist

**Kill on sight (any one fails the piece):**
- [ ] Bloom/glow/HDR or screen-light rendering (the #1 Krea2 failure)
- [ ] Anime/manga face or cel shading
- [ ] Smooth digital gradient fills; uniform vector-weight line
- [ ] More than one school's vivid accent (unless the clash is the card's subject, §4); accent coverage over ~20%
- [ ] Transparent assets with halos or ragged mattes
- [ ] Pure #000 blacks or paper-white #FFF whites inside artwork
- [ ] Gibberish text, watermark, ghost signature
- [ ] Modern costume/object tells (zippers, athleisure, stage-magician tropes)
- [ ] Heroic-idealized figure outside a deliberate Cover-tier note
- [ ] Silhouette unreadable in the 92×74 crop at true size (gallery shows it)
- [ ] Register mismatch (a painted L1 spell, an inked L5)

**Pass requires:**
- [ ] Correct register + ground for its tier (§2 table)
- [ ] Correct school accent, muted-earth base
- [ ] Reads as hand-made print media (the used-bookstore test)
- [ ] Matches the canonical anchor when placed beside it
- [ ] Subject matches the card's effect/flavor (check `cards.json` text)

## 16. Deferred / open

- Trio names & designs (§7) — **RESOLVED 2026-07-07**: Grandmother Cinder, Berenice the
  Adamant, Vess of the Undertow locked with in-scene canonical references.
- **Probe verdict (2026-07-07): prompt-only HOLDS the style.** Both register blocks
  confirmed without LoRA/IPAdapter; escalation shelved unless drift appears at scale.
- **THE ANCHOR SET IS COMPLETE (2026-07-07)** — all six school×register anchors on file
  in `art/anchors/`, full prompts + seeds in chosen.json: Plate — Spark/EVO 2133311201,
  Stonewarden/ABJ 1573960081, Augury/DIV 1761527395; Cover — Meteor/EVO 480194483,
  Aegis Eternal/ABJ 255752148, Oblivion/DIV 442000147. Every production review shows new
  options beside the relevant anchor. Production may begin. Subject-line lesson from the
  anchor round: for Cover pieces, *paint the mechanic* (the Aegis dome shedding a storm
  of fire beat two prettier compositions that didn't show what the card does).
- Glyph directions confirmed (§10): woodcut for UI, engraved for the card back. Motif
  designs for the full glyph set still need vector authoring + review.
- ComfyUI tooling gaps: an **upscaler** (for §13 large formats) and a
  **background-removal/matting** step (for transparent assets) need adding to the
  workflow/MCP.
- Spent/Channel/Delayed glyph motifs (§10) — **PROPOSED**, to be drawn when those
  mechanics need physical markers.
- **Ship & wire DONE (2026-07-07):** the full glyph set, card back, and favicon are live
  in the client — textures via `apps/client/src/board/icons.ts` (white SVGs, Pixi tint),
  DOM pips via `components/Pips.tsx` (CSS mask), card back in `cardSprite.drawBack()`,
  markers in nameplates and floaters. Every consumer keeps a text/procedural fallback.
  Re-run `.claude/skills/art/ship-glyphs.ps1` after editing any SVG in `art/glyphs/`.
- Venue 2+ concepts (sellable) — after Venue 1 ships.
- Arena implementation design — separate engineering doc when scheduled.
- Reference library: save the 10 inspiration scans to `art/reference/` (gitignored — they
  are copyrighted TSR/WotC material and must never ship or be committed) so future
  sessions can consult them. *(The images currently exist only in the chat.)*
