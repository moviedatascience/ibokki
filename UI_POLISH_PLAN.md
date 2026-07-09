# Ibokki — UI & Art Polish Plan

*Produced 2026-07-09 from a full-journey audit of the client (entry → match → post-game),
the art pipeline state, and the working-tree delta. Companion docs: `PROJECT_PLAN.md`
(macro roadmap), `art/STYLE_BIBLE.md` (art-direction law), `art/MANIFEST.md` (asset
catalog — **header is stale**, see §6). File:line anchors refer to the 2026-07-09 tree.*

---

## 0. Where the project stands

**Systems:** engine, all ~164 cards, sim/MCP playtesting, deck construction, online PvP,
server-side bot play, OIDC accounts, and the robustness epic (disconnect/inactivity
forfeit, graceful shutdown — uncommitted but done, tests green) are all built. The
deferred items are VN tutorial (user decision 2026-07-08), matchmaking queue,
persistence loop (history/rating), and desktop.

**Client ground truth:** the game is *functional but placeholder-faced*. What's real art
today: the Invocation favicon, the card back (both deck piles + face-down prepared
cards), V/S/M cost pips (Pixi cards, attach chips, spellbook), HP/burn/ward/prophecy
status glyphs (nameplates + combat floaters), and the cancelled stamp. Everything else
is procedural: flat felt + stroked "placeholder rings" for the board, procedural card
faces with zero illustrations, CSS-gradient art windows in the spellbook, letterspaced
text for the logo, system-ui type everywhere, emoji remnants (🎉, 📌), and text-only
Home/builder/game-over screens.

**Three orphaned wins:** the school crests (eye/bow/key) and item/gambit icons are
shipped AND preloaded every board mount (`board/icons.ts:16`) but consumed by *nothing*.
The `Pips` DOM component exists but three surfaces still print raw cost letters. These
are pure call-site work — the cheapest visible improvements in the codebase.

**Doc corrections established by this audit** (planners beware):
- `art/MANIFEST.md:10` "zero image files / no favicon" is false since 2026-07-07; P1
  items #2/#5/#7 are done, #9 half-done. `STYLE_BIBLE.md` §16 is the accurate record.
- PROJECT_PLAN §9a "the existing game-over UI renders it for free" is only mechanically
  true — the forfeit copy is *wrong* for the loser and for draws (§2.8).
- The opponent's hand is never rendered as sprites (only a "Hand N" counter) — the card
  back does not appear there, and an opponent-hand treatment is itself an open gap.

---

## 1. The art critical path

The user is the art director: every generation batch is an `/art` session the director
runs and judges; nothing is filed without their pick. This section orders the *asset*
work by product impact and readiness.

### 1a. Ready to produce now (pipeline complete)

| Asset | Why it's first | Readiness | Integration point |
|---|---|---|---|
| **Tier-1 card illustrations** (~45: 15 preset trainers + ~30 L1–L2 workhorses) | Cards are the object the player stares at all game; the spellbook `.sbart` gradient is the loudest placeholder in the loop | **READY** — both register prompt-blocks confirmed, 6 anchors on file (`art/chosen.json` entries 8–13), drift-audit rules written (bible §13) | Pixi `cardSprite.drawBody()` (`cardSprite.ts:107-114`) + DOM `.sbart` (`SpellbookTray.tsx:88`). **Plumbing prerequisite:** pass defId into `setFace()` (`cardSprite.ts:135`; available as `d.faceDef` in `PixiBoard.applyFace`) |
| **The 6 anchors as first card art** (EVO-001, EVO-032, ABJ-019, ABJ-022, DIV-004, DIV-043) | Six finished, approved pieces sitting unfiled | Needs one art-director yes | File under `public/art/cards/{defId}.png` once plumbing lands |
| **Board ritual circle** (vector path) | Half of MANIFEST #1 without waiting on matting tooling | Bible §11 explicitly allows an authored-vector circle; the glyph language is established | `PixiBoard.buildStatic()` (`PixiBoard.ts:176-183`), replacing the stroked rings; keep `flashStack` overlay |

### 1b. Needs an art-direction / design session (authored, not generated)

| Asset | Notes | Integration point |
|---|---|---|
| **Card frame templates** (5–7 school/type variants) | Vector authoring per bible §10 ("quiet frame, inked corners"): 460×640 master + simplified 92×128; engraved border reserved for alt art. Frames + illustrations together are the "real card" moment | `drawBody()` + `.sbcard` CSS (`styles.css:236-257`) |
| **IBOKKI wordmark** | Hand-lettered SVG (Krea2 can't spell); blocks the OG image | `Home.tsx:140` h1.logo, `TopBar.tsx:13` .brand |
| **Display typography** | IM Fell English (+SC) display, Alegreya rules text (bible §10); self-hosted woff2 | `styles.css:28` + every Pixi `fontFamily` (`cardSprite.ts:77,80`; `PixiBoard.ts:196,211,215`) |
| **Board table felt** (2560×1600) | The single highest-impact pixel change in the game. Constraint found by this audit: the world letterboxes at non-16:10 aspects (`PixiBoard.ts:168-174`) — the art must bleed past world bounds or the canvas clear color (`PixiBoard.ts:131`) must be part of the treatment | `bgLayer` (`PixiBoard.ts:150`) — ready and empty |
| **New glyphs**: seal/sealed marker, hourglass/connection marker, Spent/Channel/Delayed (bible lists these PROPOSED) | The sealed marker is *functionally required* (§2.7); the rest complete the status language | `art/glyphs/` → `ship-glyphs.ps1` |
| **Favicon sign-off** | Shipped but bible-status PROPOSED — record approval in `chosen.json` or swap it | — |

### 1c. Valuable but blocked / gated

| Asset | Blocker | Interim path |
|---|---|---|
| **Home hero, OG image (1200×630), victory/defeat banners (~1120×400), venue bgs** | No upscaler in the ComfyUI workflow (native ~1MP) | Generate at 1024×512 and art-direct the composition now; re-finish when upscaling exists. Dark low-contrast hero may be acceptable at native res |
| **Avatars / bot personas (128×128)** | No matting/background-removal step; halo-free matte is a QA gate | Berenice solo portrait already reserved for cropping; a dark-vignette square crop (no transparency) fits the plate today |
| **Deck cover art** (Emberworks/Bastion/Riptide) | Asset is easy (Cover register); the consumer is a custom deck-picker UI that doesn't exist (native `<select>` can't host images) | Ship crest + school-color rows first (§2.2), covers when the picker lands |
| **Tier 2–3 card illustrations** (~119) + `__alt` variants | Only bandwidth — same pipeline as Tier 1 | After Tier 1 proves the loop |
| **FX textures** (glow/burst/seal stamps) | Low urgency; bible §11 exempts board FX from the glow ban but requires the ink language | `flashPlate`/`flashStack`, `HL_STYLE` |

### 1d. Zero-asset art wins (wire what's already shipped)

1. **School crests** eye=Div / bow=Evo / key=Abj → nameplates (`PixiBoard.ts:307-308`),
   builder tabs (`DeckBuilder.tsx:133-137`), spellbook band, game-over headers, Home deck
   rows. ⚠️ Online, `schools[]` carries **deck names** not schools (`app.ts:155-157`) —
   crest lookup needs a deck→school map (`PRESET_SCHOOLS`) or a new protocol field.
2. **Item/gambit icons** → type lines (`cardSprite.ts:141-142`, `SpellbookTray.tsx:89-91`,
   `DeckBuilder.tsx:150`, `SidePanels.tsx:127`).
3. **Pips everywhere costs appear**: ActionBar detach buttons (`ActionBar.tsx:42`),
   DeckBuilder rows (`DeckBuilder.tsx:150`), CardDetail meta (`SidePanels.tsx:127`).
4. **Emoji purge**: 🎉 (`ActionBar.tsx:17`, `GameOverSummary.tsx:47`), 📌 ✕ unpin
   (`SidePanels.tsx:120`), text ✕ in wardDestroyed floater (`animations.ts:47` — the
   cancelled glyph exists).
5. **Card back as interim deck-row/cover image** on Home (`cardback.svg` is currently
   orphaned — only `-small` is consumed).

---

## 2. Journey-stage plan

Effort tags: **[S]** < ~1h · **[M]** part-day · **[L]** multi-day. **(ART: …)** marks an
asset dependency from §1; unmarked items are code-only.

### 2.1 First load & brand

1. **[S] Kill the white flash**: inline `background:#0e1411` + `<meta name="theme-color">`
   in `index.html`; optional tiny inline splash mark. (`index.html:1-13`)
2. **[S] Preload board-critical SVGs**: `<link rel="preload">` for the 14 icons awaited
   before board paint (`icons.ts:23-33`).
3. **[M] OG/social meta + apple-touch icon**: shares of ibokki.com/play currently render
   blank. Meta tags now with a provisional image; final composite = Cover painting +
   wordmark (ART: 1b wordmark, 1c OG).
4. **[M] Wordmark in place of letterspaced text** at both sizes (ART: 1b).
5. **[L] Webfont rollout**: IM Fell English display + Alegreya rules text through CSS
   *and* Pixi text styles; keep system stack for utility text, `tabular-nums` for HP/level
   (ART: 1b). This single change restyles every screen at once.

### 2.2 Home & lobby

1. **[M] Surface connection errors on Home** — today bad room code / server down /
   "connection lost" are stored but rendered nowhere on Home (`useMatch.ts:127-149`,
   `App.tsx:91-110`). Pass `error` into Home; distinct styling from hints (`.formerror`
   exists). Also fixes: dead-seat purge after redeploy shows "your match was lost."
2. **[S] Fix stuck-`connecting` state machine**: failed *fresh* create/join never resets
   to idle (`useMatch.ts:136-139` early-return).
3. **[M] Busy/connecting feedback**: disable + spinner on Create/Join/Bot during WS
   handshake; consume the computed-but-unused `busy` (`useMatch.ts:274`).
4. **[S] Enter-to-submit** auth forms (wrap in `<form>`) and Enter-to-join on the room
   code input.
5. **[S] Fix auth-UI flash**: render a neutral placeholder while `auth.user === undefined`
   (`useAuth.ts:21`, `Home.tsx:52-80`).
6. **[S] Deck delete confirm** + reconcile the play `<select>` when the selected deck is
   deleted (`App.tsx:109`, `Home.tsx:131`).
7. **[M] Deck rows with identity**: school crest + card-count per row; cardback thumb as
   interim cover (ART: 1d). Preset rows gain their archetype one-liners (already written
   as code comments, `decks.ts:58-88`).
8. **[L] Custom deck picker** replacing the native `<select>` — prerequisite for deck
   cover art (ART: 1c) and crests in the picker.
9. **[M] Home hero background**, dark and low-contrast behind the panels (ART: 1c).
10. **[S] Server-down state**: explicit "server unreachable" panel instead of an empty
    deck select (`App.tsx:33-38`).
11. **[S] Show the update banner on the builder screen too** (`App.tsx:115-130`).

### 2.3 Solo mode — the first-session path

Solo reuses online room machinery end-to-end (`bot:true` rooms), so everything here is
presentation + small protocol additions.

1. **[M] Elevate "Play vs bot" to a first-class mode card** — it's the most important CTA
   for a new player with no opponent and it's currently the third button in the online
   panel (`Home.tsx:169-172`).
2. **[L] Bot personas from the cast canon**: Grandmother Cinder (Evo/Emberworks),
   Berenice the Adamant (Abj/Bastion), Vess of the Undertow (Div/Riptide) — names on the
   nameplate/log/summary instead of "Opponent · Bastion", portrait on the plate when
   avatars land (ART: 1c avatars; cast references already canon in `chosen.json`).
   Cheap path: `botPersona` field in the created/state payload (`app.ts:479-483`).
3. **[S] Hide PvP chrome in solo**: room code, "Opponent: connected", seed in log line,
   "your seat is forfeited" leave copy (`SidePanels.tsx:40-51`, `App.tsx:67`).
4. **[M] Difficulty + bot-deck choice**: protocol already supports `botDeck`
   (`protocol/src/index.ts:275-278`, client never sends it); `makeAgent("random")` is a
   free easy mode.
5. **[S] Relax/disable the 5-minute inactivity forfeit for bot rooms** (`app.ts:341-343`
   already excludes the bot side; exclude the human too, or pause the clock) — losing a
   learning game to a timer is hostile.
6. **[M] Pace bot turns**: the bot's whole turn arrives as one synchronous frame
   (`app.ts:222-232`) and the board "teleports"; add small server-side action delays or
   client-side event staggering.

### 2.4 Queue, connecting, and the match-start moment

1. **[S] Fix "Connecting…" copy while waiting for an opponent** (`ActionBar.tsx:14`) —
   contradicts the rail's correct "waiting" message.
2. **[S] Copy-room-code button** (and a share link) — the single most-shared string in
   the flow (`SidePanels.tsx:36`).
3. **[M] Waiting-state life**: pulse on the (new) ritual circle, waiting spot
   illustration in the rail (ART: 1c lobby illustration; MANIFEST #18).
4. **[M] Reconnect UX**: client retries 5×2s then gives up ~35s *before* the server's 45s
   grace expires, keeps the seat, and never says a refresh would still work
   (`useMatch.ts:34-35,141-149` vs `app.ts:90`). Extend/align the retry budget, show a
   countdown + manual "Reconnect" button.
5. **[L] A match-start moment**: brief VS card — both wizards/schools (crests now,
   portraits later), then the board populates. Today the felt just fills in silently
   (`useMatch.ts:119-123`). (ART: crests now; avatars 1c later.)
6. **[S] `beforeunload` guard** during a live PvP match — tab close / browser Back
   (there's no URL routing) currently forfeits silently.

### 2.5 In-match: board & cards (the big look)

1. **[M] Board bg + ritual circle drop-in** once assets exist (ART: 1a circle, 1b felt).
   Handle letterboxing per §1b constraint.
2. **[M] defId → `setFace()` plumbing + Sprite path in `drawBody()`** + `.sbart`
   backgroundImage — the prerequisite PR for all card art; ship behind graceful fallback
   like `icons.ts` did. (`cardSprite.ts:107-135`, `SpellbookTray.tsx:88`)
3. **[M] File Tier-1 illustrations as they're approved** (ART: 1a) — spellbook first
   (biggest window), board crop check at 92×74 per bible §15.
4. **[M] Card frames** when authored (ART: 1b) — Pixi + `.sbcard` together.
5. **[S] School crests on nameplates** (+ deck→school mapping, §1d.1).
6. **[S] Empty prepared-slot outlines** — `slotG` is allocated and added but never drawn
   (`PixiBoard.ts:101,150`); slot capacity is invisible until occupied.
7. **[M] Opponent hand region + discard piles**: opponent hand exists only as a text
   counter (`PixiBoard.ts:310`) — render a small card-back fan; render opponent discard
   (currently absent) and make both discards browsable (top-card-only today,
   `PixiBoard.ts:385`).
8. **[M] Avatar portraits on plates** when matting lands (ART: 1c).

### 2.6 In-match: feel & feedback (animation pass)

All items are event-driven off the existing epoch-gated pass (`PixiBoard.ts:586-613`);
`easeOutBack` is already defined and unused (`tween.ts:14`).

1. **[M] Card-flip on reveal** (opponent face-down → face-up is an instant toggle today,
   `PixiBoard.ts:504-512`).
2. **[M] Attach flight**: component flies to its spell instead of generic fade-out
   (`PixiBoard.ts:443-452`). Note: sprites are keyed by position, not identity
   (`PixiBoard.ts:29-35`) — use a one-off effect layer.
3. **[M] Distinct resolve vs cancel exits**: resolved spells travel to discard; cancelled
   ones shatter/stamp-and-fade (same 220ms fade today).
4. **[S] Hit shake on damage** (`animations.ts:26` comment says "(shake/flash target)").
5. **[S] Pulse the loud-gold "react" highlight** — the thing the game is waiting on is a
   static stroke (`cardSprite.ts:32,244-248`).
6. **[S] Hover lift/zoom on hand cards** — at 88×122 they're unreadable without the rail.
7. **[M] School-flavored cast beat**: tint the stack flash / floater burst by school —
   cheap flavor, no new assets required (FX textures later, ART: 1c).
8. **[S] Round/phase transition cue** — currently only TopBar text changes.
9. **[S] Game-over overlay entrance transition** (pops instantly today).
10. **[S] `leveledUp` floater** — the 1–21 ramp is the game's spine and has zero board
    feedback (`animations.ts:29-50` has no case; event exists).

### 2.7 In-match: information gaps (functional, not cosmetic)

1. **[M] Render the `sealed` state** — `PreparedView.sealed` reaches the client and is
   consumed by nothing (`api.ts:26`); Runic Seal was just rebalanced and its effect is
   invisible on the board. Interim badge now; seal glyph when authored (ART: 1b glyphs).
2. **[M] Exhaustion clock**: `PlayerView.reshuffles` is delivered and unused — show the
   escalating reshuffle damage (it replaced deck-out as the death clock) on/near the deck
   pile.
3. **[M] Forfeit-timer visibility**: neither the 45s disconnect grace nor the 5-min
   inactivity deadline is communicated to the client at all — **needs a protocol field**
   (extend `presence` or `state`). Then: "Opponent disconnected — wins in 0:38" and an
   "Are you still there?" nudge before idling out.
4. **[M] Error visibility in-match**: `error` renders only in the your-turn ActionBar
   branch (`ActionBar.tsx:67`) — connection loss and rate-limit errors arriving while
   waiting display *nowhere*. Move errors to a persistent toast/slot; stop rendering raw
   `String(e)`.
5. **[S] Ward/doom label legibility**: "3/2" and "5!@2" join-strings (`PixiBoard.ts:248-250`)
   need tooltips or per-ward chips.
6. **[M] Prompt richness**: choice chips are name-only text with no cost/school pips and
   no hover→detail wiring (`Prompt.tsx:32-40`); 4 of 6 pendingChoice modes show raw
   engine reason strings (`Prompt.tsx:16-21`).
7. **[S] Turn/tab notification**: `document.title` flash + favicon badge when priority
   arrives while the tab is hidden — compounds with the inactivity forfeit (a tabbed-away
   player currently loses with zero cue).
8. **[S] Silence the production 404 noise**: `refreshInner()` hits the local-play
   `/api/state` on every prod load/leave and dirties the shared error slot
   (`useMatch.ts:201,259`).

### 2.8 Post-game

1. **[S] Fix the forfeit verdict copy** — `END_REASON.forfeit = "opponent forfeited"`
   unconditionally (`GameOverSummary.tsx:8`): an idle-timeout loser reads "Opponent wins …
   opponent forfeited"; a mutual-idle draw reads "Draw … opponent forfeited". Needs
   per-viewer attribution (small protocol field carrying who/why; the info exists only in
   log prose today, `app.ts:450-453`).
2. **[S] Style the draw verdict and the TopBar GAME OVER pill** (`.prio.over` has no CSS
   rule; draw h2 has no class). Fix "GAMEOVER PHASE" text.
3. **[M] Rematch state machine UX**: pending/offered indicators on the button ("Rematch
   offered — waiting…" / "Opponent wants a rematch!"), disable + explain when the
   opponent has left (silent dead-end today, `app.ts:292-309`).
4. **[S] Auto-scroll the summary log; allow reopening the summary** after "View final
   board" (`App.tsx:30,142-144`).
5. **[S] Fix local rematch matchup bug** — uses side-panel select state, not the schools
   just played (`App.tsx:60-63`).
6. **[M] The victory/defeat moment**: entrance animation + school crest now; banner art
   when produced (ART: 1c); distinct compact presentation for early forfeits (a 30-second
   abandoned match currently renders the full 8-row stats table).
7. **[S] Consistent identity in headers**: summary columns show deck names online,
   school names locally (`GameOverSummary.tsx:73-74`); pick one (deck name + crest).
8. **[M] Harden stats**: `tally()` regex-scrapes prose logs (`GameOverSummary.tsx:23-41`)
   — any copy change silently zeroes it. Medium-term: structured counters in the
   game-over frame.
9. **[M] Explicit concede button** (in-match, near Menu) — leaving-as-concede reads as
   navigation and the confirm copy lies ("the room closes" — it doesn't; grace-forfeit
   fires). Fix copy regardless.
10. *(Deferred, matches roadmap "persistence loop":)* match history, replay share, W/L
    profile — needs the matches table that doesn't exist yet (`db.ts:60-85`).

### 2.9 Deck builder

1. **[S] Pips + crests + item/gambit icons** in rows and tabs (§1d).
2. **[M] Card preview panel** — rules text lives in native `title` tooltips only; reuse
   the match screen's CardDetail pattern (pin/hover).
3. **[S] Live min-validation**: "Spells 3/47" hides the 15-minimum until save fails; the
   `counter()` helper already supports min/exact kinds (`DeckBuilder.tsx:93-100`).
4. **[M] Zone-anchored errors**: `DeckError.zone` exists *for this purpose*
   (`deckrules.ts:49-53`) and is ignored — highlight the offending column/pill.
5. **[M] Deck summary panel**: picked list, level curve, cost-symbol demand vs component
   supply (the thing archetype tuning actually adjusts, `decks.ts:44-52`).
6. **[M] Search + filters** (text, level, type, picked-only) over the 136-card grid.
7. **[S] Unsaved-changes guard on Back; save feedback + auto-select saved deck.**
8. **[S] Signed-out banner in the builder** (401 currently only appears at save time).
9. **[M] Card thumbnails** once Tier-1/2 art exists (ART: 1a) — copy the `.sbart` recipe.

---

## 3. Cross-cutting foundations

1. **[M] Styled modal/confirm component** replacing `window.confirm` (leave-match,
   new-game, deck delete) — one component, four call sites.
2. **[M] Toast/error architecture**: one persistent slot for connection/rate-limit/
   rules errors with severity styling; distinguish the shutdown notice from the
   update-available banner (same yellow bar today) and make the notice honest — after a
   redeploy the match is *gone* (rooms are in-memory), "reconnect in a moment"
   over-promises.
3. **[M] Minimum-viable responsive**: `.home`/`.buildercols` scroll instead of clipping
   (`body{overflow:hidden}` + no scroll container), rail collapse breakpoint. Full
   mobile/touch is its own roadmap item; near-term make small-laptop viewports safe.
4. **[M] Touch correctness**: today tapping a playable card *plays it* — there is no way
   to read a card before acting on touch (`cardSprite.ts:261-267`). Two-tap confirm or
   tap-inspect-first on coarse pointers; add `touch-action`/`user-select` rules.
5. **[S] Keyboard basics**: Escape cancels attach-selection and dismisses overlays;
   focusable `<button>`s instead of `<a onClick>`; `role="dialog"` + focus trap on the
   summary.
6. **[S] `prefers-reduced-motion`** respected by tweens/floaters/blur.
7. **[S] Settings surface** (tiny menu off TopBar) to host coming toggles (motion, log
   verbosity, future audio). Zero settings exist today.
8. **Audio — acknowledged out of scope** for this plan (zero audio exists; decision on
   direction is a separate conversation).

---

## 4. Protocol/server additions the UI needs

Small, additive; none touch the deterministic action log:

1. **Forfeit attribution** on the game-over frame: `{ who: 0|1|null, cause:
   "conceded"|"disconnected"|"idle" }` (fixes §2.8.1 properly).
2. **Timer deadlines**: grace/inactivity expiry timestamps on `presence`/`state`
   (enables §2.7.3 countdowns).
3. **School identity**: per-seat school alongside the deck name (unblocks crests
   everywhere; `schools[]` currently carries deck names online).
4. **`botPersona`** on bot-room create/state (§2.3.2).
5. *(Later)* structured end-of-match counters (§2.8.8), `botDeck` pass-through (§2.3.4).

---

## 5. Sequencing — five waves

**Wave 1 — Correctness & wiring (code-only, no art director time).**
Everything in §1d + §2 marked [S] that fixes wrong/invisible information: forfeit copy,
sealed state, error surfacing, stuck-connecting, rematch bug, delete confirm, draw/pill
styling, emoji purge, crest/pips wiring, 404 noise, title-flash notification. Roughly
25 small items; transforms coherence without a single new asset.

**Wave 2 — Identity (art-direction sessions).**
Wordmark → webfonts → card frames → board felt + vector circle → new glyphs (seal
first). These are the pieces only the art director can move; each is an `/art` or design
session. Code lands §2.5.1–2 plumbing in parallel so drops are one-file affairs.

**Wave 3 — Card art at scale.**
File the 6 anchors (pending sign-off) → Tier-1 batch (~45) through the confirmed
prompt blocks with drift audits → spellbook + board + builder thumbnails light up
together. Protocol additions (§4.1–3) ride along.

**Wave 4 — Moments.**
Match-start VS beat, victory/defeat treatment, bot personas + avatars, deck picker +
covers, home hero, OG composite, waiting illustration. This wave is what makes the game
feel *authored* rather than skinned.

**Wave 5 — Feel.**
Animation pass (§2.6), timer countdowns, touch/keyboard/responsive foundations, FX
textures, Tier-2/3 art as an ongoing drumbeat.

Dependencies to respect: wordmark → OG; frames+illustrations → "real card" reveal
(ship spellbook art before board art if staging); protocol school field → crests in
online matches; matting tooling → transparent avatars/circle (vector circle sidesteps).

---

## 6. Doc hygiene (do in Wave 1)

- Re-stamp `art/MANIFEST.md`: header ground-truth paragraph, P1 rows #2/#5/#7/#9
  current-state column, add the seal/Spent/Channel/Delayed glyph rows and this plan as a
  cross-reference.
- Record the favicon decision (approve or replace) in `art/chosen.json`.
- Annotate PROJECT_PLAN §9a: forfeit *renders*, but presentation work is tracked here.
- Commit the working tree (robustness epic) — every audit in this plan diffs against it.
