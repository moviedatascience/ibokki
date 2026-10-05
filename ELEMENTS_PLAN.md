# Elements & horizontal progression — the Fire reorientation

Proposal, 2026-10-05. Status: **ADOPTED the same day (DECISIONS #6) and implemented
for the text + data scope.** Landed: Tier A (`element` + `flavor` fields, id
convention, Design Doc section), Tier B names (99 cards; "Reckoning" is now one card:
ABJ-043 became *Long Firing*), presets Emberworks / Crucible / Ashlight with legacy
aliases, a flavor line per school card, and the cast text (Vess reserved for Water; the
Lamp's archmage is unnamed). NOT done here, by the user's direction: everything visual
(§6 palette, §5.4 re-dress / re-anchors — owned by the separate visual-redesign track;
Berenice is unchanged) and Tier C mechanics (§7, held). Companion to `ROADMAP.md` and
`Design_Doc.md`.

## 1. The direction (as stated by the user, 2026-10-05)

Horizontal progression will come from **elements** (types): Fire first, then Water and
others, with Pokémon-style type interactions between spells. Every element ships the
same **three schools** — the aggro caster (Evocation), the protector (Abjuration) and
the utility caster (Divination) — so a new element is a release of three new decks
under one type. Nothing about the type chart is built now. What changes now: the
three existing decks all become **Fire**. Evocation is already fire and does not
change; Abjuration and Divination are re-oriented onto fire, in flavor first and in
mechanics where it earns its place.

## 2. What the audit found

The repo has **no concept of element anywhere** and the school is doing two jobs:

| Layer | School is used as… | Where |
|---|---|---|
| Card data | the only taxonomy (`school: Abjuration/Evocation/Divination/Neutral`); no flavor-text field at all (`comment` is designer notes, not player-facing) | `packages/cards/src/types.ts`, `cards.json`, xlsx columns `card id/name/school/type/lvl/cost/effect/role/comment` |
| Card ids | school-prefixed (`ABJ-/EVO-/DIV-`); every system keys on the id (effect registry, tags, overrides, cast-priors, art manifest, MCP slugs, playtest logs) | everywhere |
| Engine | primary component per school (`V/S/M`), preset resource-deck recipes and trainer packages, `SPELLBOOK_MAX` = the largest school's spell count | `packages/engine/src/decks.ts`, `deckrules.ts` |
| Protocol | seat identity is the **deck name** online and the school name locally; `SchoolName` union | `packages/protocol/src/index.ts:189-308` |
| Client | school = the **color** (`--evo/--abj/--div`, `SCHOOL_TINT`), the **crest** (Bow/Key/Eye) and the preset mapping (`Emberworks/Bastion/Riptide`) | `apps/client/src/schools.ts`, `styles.css`, `board/cardSprite.ts` |
| Art law | school pigments are **ember / cobalt / violet**; school prompt blocks are fire / stone+cobalt / tide-pools+star-charts; the canon cast is Grandmother Cinder (fire), Berenice the Adamant (stone, cobalt silk) and **Vess of the Undertow (explicitly water: dripping robes, tide pools, kelp)** | `art/STYLE_BIBLE.md` §4, §7, §13 |
| Sim / MCP | 3×3 school matrix, `--s1/--s2 <School>`, presets by school | `packages/sim/src/cli.ts`, `packages/mcp` |

Fire already runs deep in the engine: **Burn** is a first-class status (ticks at turn
start, decays, amplified by Conflagration/Phoenix/Wildfire, cleansed by Fortify,
Divine and Quenching Salts) and Burn damage routes through Wards like any damage
(`state-ops.ts:77`). That means the three schools already *touch* fire mechanically;
the gap is naming, art direction, and two cast members.

Collisions the reorientation must resolve:

1. **Divination's whole visual identity is water.** Preset "Riptide", archmage "Vess
   of the Undertow", prompt block "tide pools", the Riptide current in the canon.
   This is literally the future Water type's identity, filed in advance.
2. **Abjuration is stone and cobalt.** Not anti-fire, but blue reads as water/ice once
   a type chart exists.
3. **Evocation carries eight lightning cards** (Lightning Bolt, Chain Lightning,
   Voltaic Overload, Crackle, Battery, Maelstrom, Elemental Wrath, Hex Bolt). Lightning
   is an obvious future element; those names will be wanted back.
4. **Two card names collide with the adopted keyword vocabulary** (DECISIONS #4):
   ABJ-028 *Unraveling* and DIV-007 *Unravel* are not **Unravel** cards (ward-break);
   ABJ-028 is Disrupt and DIV-007 is both. The rename pass fixes this for free.
5. **Three "Reckoning" cards across two schools** (ABJ-032, ABJ-043, EVO-047). The
   ledger wincon owns the word; EVO-047 should give it up.
6. Four of the six filed art anchors are Abjuration/Divination cards whose subject
   changes (Stonewarden plate, Aegis Eternal dome, Augury plate, Oblivion sky-tears).
   They must be re-anchored whatever palette decision is taken.

## 3. Proposal overview

Three tiers, by cost and by what they put at risk:

| Tier | What | Balance risk | Ships in |
|---|---|---|---|
| **A — data scaffolding** | `element` on every card and seat; `flavor` text field; id convention for future sets; Design Doc section | none | 1.0 (small, do first) |
| **B — fire identity (flavor)** | names for 100 cards (48 Abj, 44 Div, 8 Evo), preset names, cast, style-bible palette + prompt blocks, keyword reminder tweaks | none (names only) | 1.0, before the balance freeze doc (#6) so playtest logs use final names |
| **C — fire identity (mechanics)** | a short list of candidate "fire hooks" per school | real: every one is a piloted series under the pilot-gap doctrine | **1.5 "Fire identity pass"**, or folded into #4 (card audit) replacements if a flagged card needs a new body anyway |

Recommendation: do A and B for 1.0, hold C. The 1.0 roadmap freezes the triangle
(#2/#5/#6); the reorientation should not reopen it. The fire-hooks in §7 are
written so the user can pull any one of them forward deliberately.

## 4. Tier A — data scaffolding

### 4.1 Element on cards

- `packages/cards/src/types.ts`: `export type Element = "Fire";` and
  `element: Element | null` on `CardDef` (null for Neutral trainers).
- xlsx: new **Element** column on the spell sheets (value `Fire`); importer
  (`tools/import-cards`) reads it, defaults school cards to `Fire` and Neutral to null,
  and fails on an unknown element. Explicit column rather than derived, so the data
  stays honest when the second element arrives.
- Protocol catalog (`packages/protocol/src/index.ts:37-56`) carries `element`.
- Seat identity: issue #8 is adding a per-seat school field; make it
  `{ element, school }` from the start so a deck has one honest identity on the frame.
- Deck builder: the school tabs stay; an element filter is a one-line addition later.

### 4.2 Flavor text

- xlsx: new **Flavor** column; `flavor?: string` on `CardDef`; `npm run retext` grows
  a `flavors` map alongside `texts` (same tool, same anchoring rules).
- Shown in the spellbook tray detail, the CardDetail rail and the deck-builder
  preview (#42). **Not** on the Pixi card face: at 92×128 the face is name / type /
  level / cost / icon strip and nothing else (DECISIONS #4 pillar).
- One line, in the world's voice (STYLE_BIBLE §9 tone rules). Writing the 139 lines
  is its own pass after the names are approved; the names tables in §5 carry a
  one-phrase flavor seed per card to start from.

### 4.3 Card id convention

Keep every existing id. `ABJ-/EVO-/DIV-###` are **implicitly Fire** forever. From the
second element on, ids are `<ELEM>-<SCHOOL>-###` (e.g. `WTR-EVO-001`). The code
already treats ids as opaque strings (slugs are `cast-<id lowercased>`, art is keyed
by id), so longer ids cost nothing. Renaming the current 139 ids would touch every
playtest log, the cast-priors file, tag overrides and the art manifest for no gain.

### 4.4 Rules that must stop assuming "school = set"

- `deckrules.ts`: `SPELLBOOK_MAX` = the largest school's count. With two elements that
  doubles silently. Change to the largest **(element, school)** set, or pin a number.
- `decks.ts` presets and `sim`'s `SCHOOLS`/`runSchoolMatrix` become
  (element, school) keyed when a second element exists; no change now beyond a
  comment. Record it so nobody hard-codes a 3×3 again.

### 4.5 Design Doc

Rewrite "Magic Schools & Affinity" as **"Elements, Schools & Affinity"**:

- *Element* = the spell's type and the deck's palette. 1.0 ships one element, Fire.
  The type chart is a post-1.0 system; its principles are recorded now so 1.0 cards
  do not paint it into a corner (§8).
- *School* = the role, with its primary component, unchanged: Evocation (aggro, V),
  Abjuration (protection, S), Divination (utility, M). The school triangle
  (Design Notes) is unchanged and is measured per element.
- Re-flavor the three school paragraphs (text in §5.0 below).
- New short section **"Horizontal progression"**: the release unit is one element =
  three school sets of roughly the current size (~45 spells each) plus optional
  element trainers; the neutral trainer pool is shared.

Log the outcome as DECISIONS #6.

## 5. Tier B — the fire identity

### 5.0 The three schools, in one element

| School | Role | Fire reading | Preset deck | Archmage |
|---|---|---|---|---|
| Evocation | aggro | **the Blaze** — fire as appetite; detonation, burn, spoken flame-runes. Unchanged. | **Emberworks** (keep) | Ashmalka, "Grandmother Cinder" (keep, canon) |
| Abjuration | protection | **the Forge** — fire as the thing that tempers; kilns, banked coals, crucibles, salamander skin, cold iron. Wards are fired clay and tempered steel; the prevention ledger is *heat banked in the furnace*, and Reckoning is the hammer finally falling. | **Crucible** (was Bastion) | Berenice the Adamant, re-dressed (§5.4) |
| Divination | utility | **the Lamp** — fire as the thing you read by: augury in flame and smoke, candles and wicks, moths, ash. Prophecy is a lit fuse; draw is lamplight; recursion is sifting the ashes; cancel is smothering. (Pyromancy *is* historically divination by fire; the word stays with Evocation because that is what players expect it to mean.) | **Ashlight** (was Riptide) | **new** — Vess of the Undertow is water-native and is **reserved for the Water release** (§5.4) |

Design Doc school paragraphs, proposed text:

> **Evocation (The Blaze)** — Primary Component: Verbal (V). Aggressive, high burst,
> fast. Spends components aggressively to push damage through, burning resources faster
> than a Wizard can recover them.
>
> **Abjuration (The Forge)** — Primary Component: Somatic (S). Defensive, reactive,
> control. Holds components in reserve to react on the opponent's turn, and banks every
> blow it turns aside as heat in the furnace — the ledger — to spend or strike with later.
>
> **Divination (The Lamp)** — Primary Component: Material (M). Tempo, utility,
> precision. Reads the deck by firelight so it always has the right piece at the right
> time, and kills by Prophecy: a fuse lit now that burns down on schedule.

Keyword vocabulary (`keywords.json`): no keyword changes. The vocabulary is
deliberately element-neutral (Ward, Unravel, Prophecy, Seal…) so Water reuses it;
**Burn** is Fire's status keyword and future elements add their own (§8). Only the
*reminder* strings may pick up a word of fire flavor if the user wants.

### 5.1 Evocation — eight renames (lightning out, Reckoning freed)

Mechanics untouched. Everything not listed keeps its name.

| Id | Now | Proposed | Why / flavor seed |
|---|---|---|---|
| EVO-009 | Battery | **Kindling** | VM "deal 2, draw 1": gathering fuel |
| EVO-010 | Crackle | **Cinder Snap** | 1 to the wizard, 2 to a Ward |
| EVO-018 | Lightning Bolt | **White Flame** | the hottest flame; "cannot be reduced below 1" |
| EVO-027 | Maelstrom | **Flashover** | the moment a room ignites all at once; scales with Burn |
| EVO-033 | Chain Lightning | **Spreading Blaze** | 4 to the wizard then 2 to every Ward |
| EVO-037 | Elemental Wrath | **Blazing Wrath** | "Elemental" is reserved for the type system |
| EVO-039 | Voltaic Overload | **Immolation** | take 3, deal 8 |
| EVO-047 | Pyromancer's Reckoning | **Pyromancer's Retort** | frees "Reckoning" for the ledger wincon |

Kept on purpose: Spark, Firebolt, Hex Bolt, Volatile Bolt/Charge, Unstoppable Bolt
(bolt = firebolt), Meteor, Cataclysm, Sunburst, Apocalypse, Phoenix Ascendant
(the phoenix is a shared fire myth; Divination's rebirth cards use "ash", not
"phoenix", to avoid the clash).

### 5.2 Abjuration — 48 names (the Forge)

Mechanics untouched. Vocabulary reserved for this school: forge, kiln, crucible,
coal, slag, brand, temper, quench (already Quenching Salts), hearth, anvil, bellows,
salamander, cold iron.

| Id | Now | Proposed | Flavor seed |
|---|---|---|---|
| ABJ-001 | Fortify | **Temper** | +2 Ward, shed 1 Burn: tempering strengthens and cools |
| ABJ-002 | Arcane Shell | **Cinder Crust** | a 1 HP crust that pays out (draw 2) when it breaks |
| ABJ-003 | Ward Pulse | **Bellows** | every Ward grows; a lick of heat (1) escapes |
| ABJ-004 | Aegis | **Heat Shimmer** | 1-component spells lose their aim in the shimmer |
| ABJ-005 | Stone Stance | **Ash Mantle** | ash insulates: −2 this round |
| ABJ-006 | Dampen | **Bank Down** | banking a fire: −1 |
| ABJ-007 | Echo Shield | **Firebrick** | −1, −2 while the kiln (a Ward) stands |
| ABJ-008 | Grounding | **Cooling Draft** | −1 and a draw |
| ABJ-009 | Mana Drain | **Spark Arrester** | the chimney device that catches sparks: bounces the attached component |
| ABJ-010 | Runic Seal | **Iron Brand** | the seal is a brand |
| ABJ-011 | Absorb | **Swallow the Flame** | prevent all, heal half |
| ABJ-012 | Reflective Ward | **Searing Ward** | the Ward burns what touches it (already the fire-barrier card) |
| ABJ-013 | Interrupt | **Douse** | strip the components; cancel if the cost fails |
| ABJ-014 | Phase Shift | **Snuff** | cancel; attach one from hand |
| ABJ-015 | Counterbind | **Char the Reagent** | cancels an M-cost spell |
| ABJ-016 | Break Form | **Scalding Grip** | cancels an S-cost spell |
| ABJ-017 | Arcane Anchor | **Furnace Roar** | nothing can be heard: no Reactions |
| ABJ-018 | Aetheric Lock | **Stifling Heat** | Reactions cost +1 |
| ABJ-019 | Stonewarden | **Kilnwarden** | 2 HP; Level 1 spells can't target you (re-anchor the plate) |
| ABJ-020 | Sentinel Rune | **Watchfire** | a signal fire: draw on their first cast each round |
| ABJ-021 | Shatter Ward | **Slag Sacrifice** | sacrifice a Ward, prevent all |
| ABJ-022 | Aegis Eternal | **Hearth Eternal** | 6 HP and −1 this round (re-anchor the cover) |
| ABJ-023 | Total Negation | **Dead Fire** | cancel; no more casts this turn |
| ABJ-024 | Inversion Field | **Salamander's Skin** | damage heals instead, up to 5 |
| ABJ-025 | Sanctum | **Reforge** | every Ward +2 |
| ABJ-026 | Abjure the Wicked | **Hammerfall** | cancel; 2 per attached component |
| ABJ-027 | Ritual Ward | **Ember Heart** | a 5 HP Ward that leaves a 2 HP ember when it breaks |
| ABJ-028 | Unraveling | **Scatter the Coals** | strips every prepared component — and stops colliding with the Unravel keyword |
| ABJ-029 | Fortress | **Forgewall** | 4 HP; your Wards can't be targeted this round |
| ABJ-030 | Penumbral Seal | **Welded Shut** | L3 seal |
| ABJ-031 | Ward Collapse | **Tap the Furnace** | tapping = releasing the melt: destroy your Ward, deal its HP |
| ABJ-032 | Reckoning | **Reckoning** (keep) | the ledger wincon; the name has playtest history |
| ABJ-033 | Backlash | **Hammer Rhythm** | 3 per Reaction you played |
| ABJ-034 | Exhausting Aura | **Scalding Air** | their Reactions cost 3 damage |
| ABJ-035 | Banishing Bolt | **Branding Iron** | 5, or 7 with a Ward |
| ABJ-036 | Overcharge | **Meltdown** | sacrifice all Wards; 2 per HP |
| ABJ-037 | Retributive Strike | **Anvil's Answer** | cancel; twice its damage back |
| ABJ-038 | Shieldbreaker Pulse | **Kilnbreaker** | 4, or destroy their Ward and 8 |
| ABJ-039 | Absolute Defense | **Cold Iron** | the mythic anti-magic metal: no damage, no Reactions |
| ABJ-040 | Ward Eternal | **The Adamant** | 10 HP, untouchable; Berenice's epithet |
| ABJ-041 | Archmage's Seal | **Grand Quench** | cancel everything, lock them out |
| ABJ-042 | Warden's Wrath | **Wrath of the Forge** | damage = your HP |
| ABJ-043 | Final Reckoning | **Final Reckoning** (keep) | pairs with Reckoning |
| ABJ-044 | Null Burst | **Flashquench** | cancel their stack; 3 each |
| ABJ-045 | Collapse the Veil | **Shatter the Kilns** | every Ward on both sides |
| ABJ-046 | Warding Tithe | **Banked Coals** | spend ledger → Ward |
| ABJ-047 | Sealed Verdict | **Furnace Verdict** | spend 6 ledger → cancel |
| ABJ-048 | Restoring Rune | **Hearth's Warmth** | spend ledger → heal |

### 5.3 Divination — 44 names (the Lamp)

Mechanics untouched. Vocabulary reserved: lamp, candle, wick, smoke, ash, moth,
tinder, kindling, tallow, pyre, afterglow, flashpoint. (Moths are already canon
Divination iconography; they move from the waterline to the candle.)

| Id | Now | Proposed | Flavor seed |
|---|---|---|---|
| DIV-001 | Insight | **Lamplight** | draw 2 |
| DIV-002 | Foresight | **Read the Flame** | top 3 take 1; −1 this round |
| DIV-003 | Divine | **Pinch the Wick** | top 2 take 1; shed 1 Burn |
| DIV-004 | Prophecy of Collapse | **Omen of Ash** | 2-turn doom: their largest Ward to ash (re-anchor the plate) |
| DIV-005 | Premonition | **Scent of Smoke** | draw 2, a third on a multi-symbol |
| DIV-006 | Recover | **Sift the Ashes** | a component back from the discard |
| DIV-007 | Unravel | **Scorch the Seam** | 2 to their weakest Ward; stops colliding with the Unravel keyword |
| DIV-008 | Cut the Thread | **Char the Page** | see their components; they discard your pick |
| DIV-009 | Flaw in the Weave | **Heat Fracture** | their largest Ward loses half |
| DIV-010 | Mind's Eye | **Candle's Eye** | draw 1, top 1 |
| DIV-011 | Foretell | **Lantern Glare** | 2 damage; see their hand |
| DIV-012 | Omen | **Smoke Omen** | 2-turn doom for 2 |
| DIV-014 | Anticipate | **Flicker** | on their cast: draw 1, ping 1 |
| DIV-015 | Reclaim | **From the Ashes** | up to 2 components back |
| DIV-016 | Seek | **Moth to Flame** | search a component |
| DIV-017 | Foreknowledge | **Read by Firelight** | see their hand; draw 1 |
| DIV-018 | Alchemy | **Feed the Fire** | discard N, draw N |
| DIV-019 | Unbind | **Burn Through** | destroy a Ward or ongoing; draw 1 |
| DIV-020 | Foreclosure | **Slow Match** | the burning-cord fuse: 2-turn doom for 4 |
| DIV-021 | Quick Study | **Tallow Study** | draw 2, top 1 |
| DIV-022 | Index | **Smoke Reading** | top 5 reorder |
| DIV-023 | Far Sight | **Short Wick** | top 3 reorder; 1-turn doom for 2 |
| DIV-024 | Counter-Plan | **Pull the Fuel** | bounce a component; cancel if the cost fails |
| DIV-025 | Read the Signs | **Read the Sparks** | on their cast: draw 1 |
| DIV-026 | Misdirection | **Flame Mirror** | redirect onto its caster |
| DIV-027 | Borrowed Spell | **Afterglow** | recast an L1 you cast this round |
| DIV-028 | Echoes of the Past | **Rekindle** | shuffle the discard in; draw 2 |
| DIV-029 | Calculated Draw | **Lamp in the Dark** | search any card; draw 2 |
| DIV-030 | Manipulate Fate | **Augury of Embers** | top 5 take 2 |
| DIV-031 | Perfect Information | **Everything Illuminated** | their hand + top 3; draw 2 |
| DIV-032 | Entropy | **The Pyre** | 3-turn doom for 7 |
| DIV-033 | Premeditate | **Gather Kindling** | search up to 2 components |
| DIV-034 | Convergent Future | **Bonfire Vigil** | draw to 7 |
| DIV-035 | Spellbind | **Smother** | cancel; returns sealed |
| DIV-036 | Rewind | **Unburnt** | cancel; the match was never struck |
| DIV-037 | Borrowed Power | **Catch the Flame** | recast either player's L1/L2 |
| DIV-038 | Foretold Strike | **Overfed Lamp** | draw 2; 1 per card beyond 5 |
| DIV-039 | Mind Theft | **Burn the Letter** | see their hand; they discard your pick |
| DIV-040 | Omniscience | **Eye of the Blaze** | draw 4; uncancellable this turn |
| DIV-041 | Eternal Return | **Rise from Ash** | every component back |
| DIV-042 | Grand Design | **Lamplighter** | search up to 3 |
| DIV-043 | Oblivion | **Last Light** | 3-turn doom for 9 (re-anchor the cover) |
| DIV-044 | Time Spiral | **Ash Fall** | both players reshuffle and draw 5 |
| DIV-045 | Convergence | **Flashpoint** | recast anything; one extra cast |

### 5.4 Cast, presets and the style bible

- **Grandmother Cinder:** unchanged.
- **Berenice the Adamant:** keep the person and the epithet; re-dress for the Forge —
  iron-grey layered vestments with **ember-red** silk beneath (was cobalt), the keystone
  pendant becomes a kiln-arch keystone, and her canonical scene holds the breach with a
  wall of **banked flame** instead of a cobalt ward. Re-generate the cast reference and
  the solo portrait.
- **Vess of the Undertow:** do not re-skin. She is a finished, signed-off water archmage;
  file her as the **first Water-element cast member** and keep `art/cast/vess-*` as a
  future anchor. The Fire Lamp needs a new archmage. Three directions for the art
  director to pick from (names are placeholders): *the Lamplighter* (an old tallow-
  chandler who reads the guttering of candles, moths in the sleeves); *the Augur of
  Smoke* (veiled, a censer on a chain, reads the shape of smoke and never looks at
  people directly); *the Ash-Reader* (kneels in cold hearths and tells you what burned
  there). Each keeps the §9 tone rule for Divination: "unsettles — inevitability,
  moths, being read to from your own diary".
- **Preset names:** Emberworks (keep), **Crucible** (Bastion), **Ashlight** (Riptide).
  Touch points: `decks.ts` `PRESET_SCHOOLS`/`ARCHETYPE_TRAINERS` comments,
  `apps/client/src/schools.ts` `PRESET_SCHOOL`, and the tests that pin the strings
  (`packages/engine/test/deckrules.test.ts`, `packages/mcp/test/matches.test.ts`,
  `apps/server/test/{online,history,persistence,timers,accounts}.test.ts`,
  `apps/client/test/online.spec.ts`). Persisted match-history rows keep the old deck
  string (cosmetic; a one-line display alias covers it).
- **Bot personas (#19):** Cinder / Berenice / *new Lamp archmage*.
- **STYLE_BIBLE:** §4 school pigments and §13 school blocks are rewritten (§6 below);
  §7 cast entries updated; §8 canon: the phonetic invocation "Eye, Bow, Key" and the
  three crests are **school** sigils and survive every element (that is the point of
  keeping the schools). Prop list gains: kilns, crucibles, candle stubs (already
  there), censers, moths at the candle.
- **Design Doc / CLAUDE.md / pilot.md / README:** replace preset names; the playtest
  history keeps its old names (do not rewrite logs).

## 6. Palette — the one visual decision

Today school = color. With elements, two axes need to read at a glance: **element**
(what interacts on the type chart) and **school** (the role). The crests (Bow / Key /
Eye) are already shipped and tinted, so the school has a non-color signal.

- **Option A — school keeps its hue across elements** (red / blue / violet forever;
  element shown as a frame texture + type badge). Zero client work now. Cost: Fire
  Abjuration is blue and Fire Divination is violet in a game whose next type is Water.
- **Option B — element owns the hue, school owns the crest and the value.**
  Recommended. For the Fire-only 1.0 the three decks become three fire values:
  **flame** (Evocation, keep `#e0533d`), **coal** (Abjuration, a deep oxblood/ember,
  start the probe around `#9a3620`) and **smoke** (Divination, a warm grey-lilac that
  keeps a trace of today's violet, start around `#a0899a`). Gate: the three crest tints
  must stay distinguishable at 16 px on the dark felt and in the spellbook title bands;
  if coal and flame merge at that size, push coal darker or pull flame toward orange.
  Touch points: `styles.css` tokens, `schools.ts` `SCHOOL_TINT`, `cardSprite.ts`,
  `.pickcard.s-*` borders, STYLE_BIBLE §4/§13, and the keyword tints that were
  borrowed from school colors (Ward `#4a90e2`, Unravel `#a070e0`) — those stay as
  keyword colors; they were never school semantics.

Either way the four Abjuration/Divination anchors are re-run (their subjects changed),
so Option B's palette probe rides on work that is already required. The decision is
the art director's; the card frame templates (#61) should not start until it is made.

## 7. Tier C — candidate fire hooks (mechanics), NOT for 1.0 by default

Each is one card, each is a piloted series before it lands (pilot-gap doctrine), and
each names the triangle leg it can move. Listed so the user can pull one forward.

| # | School | Hook | Leg at risk | Note |
|---|---|---|---|---|
| C1 | Abjuration | **Kiln Ward** — a Ward that gives the attacker 1 Burn each time it absorbs damage (the fire-barrier identity made literal). Body for a #4-flagged underperformer rather than a new slot. | Abj/Evo (Abj already 11–0 piloted; a burn-back ward makes it worse) | Only if the Evo tune (#35) lands first |
| C2 | Abjuration | **Fireproof** — Temper (ABJ-001) sheds *all* Burn instead of 1 | Abj/Evo | Quenching Salts ×2 already does this in the preset; probably redundant |
| C3 | Divination | **Burning prophecy** — a doom whose payload is Burn (e.g. "Prophecy (2 turns): give 3 Burn"), as a rider swap on Short Wick (DIV-023) or a new L2 | Div/Abj (Burn ignores ward *size*, not wards; dooms shatter what soaks them) | The most on-theme hook: a fuse that leaves a fire burning |
| C4 | Divination | **Moth to Flame** (DIV-016) may fetch a trainer as well as a component | Div/Evo (100% standing flag, #35) | Utility, not damage; low risk |
| C5 | Evocation | none | — | Evocation is the reference fire deck |
| C6 | Cross-element seam (future) | damage events carry `element`; Wards record their caster's element; the type chart is applied in one place, `dealDamageToPlayer` | — | Build only with the second element |

## 8. Type-chart principles to record now (so 1.0 cards survive it)

Not a design of the chart, just the constraints 1.0 should respect:

1. **Additive, keyword-mediated, never multiplicative.** HP is 30 and Apocalypse is 12.
   A Pokémon ×2 turns the top end into one-shots. Advantage should look like
   "+1/+2 damage", "Water spells shed Burn", "Fire Wards soak 1 extra from Water",
   expressed through the keyword vocabulary so the icon strip explains it.
2. **Every element has one status keyword.** Fire = Burn. Water, Air etc. each add
   exactly one (`keywords.json` grows by one per element; `CARD_TAGS` by one).
3. **Elements are not a fourth school.** The triangle is measured per element and
   between elements; sims grow from a 3×3 to a 3·E × 3·E matrix. Avoid any rule that
   keys on "the three schools" as the whole card pool.
4. **Deck identity is one element by default.** Whether cross-element spellbooks are
   legal (the soft-constraint rule says yes for schools) is an open decision; the
   component system gives no natural brake on element mixing, so the type chart may
   need one. Decide with the second element, not now.

## 9. Sequence and effort

1. **Decide** (user): palette option, the three preset names, the Lamp archmage
   direction, the name tables (edit freely — they are proposals), and whether any C-row
   moves into 1.0. Log as DECISIONS #6.
2. **Tier A** (one session): types + importer + xlsx columns + protocol catalog +
   `SPELLBOOK_MAX` note + Design Doc section. Gate: `npm run typecheck && npm test`.
3. **Tier B names** (one session): write the rename map; apply via the xlsx
   shared-strings route (whole-cell anchors; apostrophes as `&apos;`), `npm run
   import-cards`, fix pinned tests, update Design Doc / CLAUDE.md / pilot.md / README
   preset names. Card names are not in effect text, so the #38 templated texts and the
   derived tags are untouched; the parity log gets a one-line entry.
4. **Tier B flavor lines** (one session, after names): 139 one-liners through
   `npm run retext`'s new `flavors` map; surfaces in spellbook / detail / builder.
5. **Art** (user-run `/art` sessions): STYLE_BIBLE §4/§7/§13 rewrite, Berenice
   re-dress, new Lamp archmage, four re-anchors, palette probe if Option B.
6. **Tier C**: 1.5 milestone, one piloted series per hook.

Items 2–4 are text and data only and should land before the balance freeze doc (#6)
so the final playtest logs use the final names.
