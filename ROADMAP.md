# Ibokki — the 1.0 map

Plan of record, rebuilt 2026-10-03. Board: GitHub Projects #2 "Ibokki" (milestone 1.0);
every issue carries a `Workstream` and a `Priority` (P0 ships 1.0 · P1 should ship ·
P2 cut candidate). Issues are granular: one PR-sized change, a checklist, a "Done when"
line. The five-wave UI audit (`UI_POLISH_PLAN.md`) and the balance journal
(`playtests/2026-07-27-greedy-triangle-balance.md`) are the references behind them.

Solo dev + Claude. The two-vendor review protocol (`interop/`, `.dsh/`) was retired on
2026-10-03; `interop/DECISIONS.md` stays as the design decision log.

## What 1.0 means

A stranger can open ibokki.com/play, learn a card by looking at it, finish a fair solo
game against a named wizard, find a human opponent without a room code, and never be
confused about why they won or lost. The triangle is frozen and documented. The game
looks authored, not skinned, within the asset budget decided below.

## Decisions that gate the rest (user)

Tracked as #72. Everything marked "gated" below waits on these.

1. **PixelLab arena + champion animation:** in (restart concepts with a new generation
   lever) or out (the felt drop-in #62 is the 1.0 board; #15 moves to post-1.0).
2. **Audio:** DECIDED 2026-10-03 — none in 1.0; a minimal cue set + settings toggle is
   targeted for the 1.5 milestone.
3. **Balance freeze thresholds:** per leg, the bot-level edge and piloted result that
   count as "ship" — written into the release-balance doc (#6).

## The eight workstreams

### 1. Rules & balance — the triangle is final and documented

- #35 **P0** Evo/Div 100% flag: 3-game piloted series + verdict (the doctrine trigger)
- #2 **P0** Final triangle validation, all 3 legs on final cards (horizon-2 paired + pilots)
- #5 **P0** Deck-construction rules + the three presets finalized
- #4 P1 Card-pool `--cards` audit, every flagged card to a verdict
- #6 P1 Balance freeze doc + final tunings logged

Order: #35 → #5 → #2 → #4 → #6. Card text changes from workstream 2 are text-only and
must land before #6.

### 2. Card legibility — a card teaches itself

The onboarding pillar. Cards carry structured tags derived from the engine (so icons can
never lie), a closed keyword vocabulary with reminder text, rewritten texts, and an icon
strip on every surface a card appears on.

- #36 **P0** Card tags: engine-derived effect tags + xlsx override column + consistency test
- #37 **P0** Keyword vocabulary + reminder text (user signs off the list)
- #38 **P0** Card text rewrite pass: all 167 texts templated around the keywords
- #39 **P0** Icon strip on the Pixi card face (hand / stack / prepared)
- #40 **P0** Keyworded rules text in the spellbook + CardDetail
- #41 P1 Prompt chips + deck-builder rows get pips, crest, tag icons, hover → detail
- #42 P1 Deck builder card preview panel
- #43 P1 Verb glyph art (~8 woodcut glyphs) via `/art`; designed with the card frame (#61)

Order: #36 and #37 in parallel → #38 → #39 + #40 → #41 + #42. #43 is an art session
that can run any time after #37; every surface falls back to letters until then.

### 3. First solo session — the first game is fair and legible

- #20 **P0** Hide PvP chrome + disable the inactivity forfeit in bot rooms
- #45 **P0** Pace bot turns (the board teleports today)
- #19 P1 Bot personas Cinder / Berenice / Vess (+ `botPersona` field from #8)
- #44 P1 Difficulty + bot-deck choice on the solo mode card
- #46 P1 Match-start VS moment
- #21 P1 Light how-to-play reference built on the keyword vocabulary (#37)

### 4. Match info correctness — nothing the engine knows is invisible

- #8 **P0** Protocol additions: forfeit attribution, timer deadlines, school identity, botPersona
- #47 **P0** Render the sealed state
- #48 **P0** Exhaustion clock near the deck pile
- #51 **P0** Post-game copy correctness (needs #8)
- #52 **P0** Home / lobby correctness (errors, stuck-connecting, busy, server-down)
- #49 P1 Forfeit / inactivity countdowns + idle nudge (needs #8)
- #50 P1 Ward / doom label legibility
- #53 P1 Rematch state machine UX + local rematch bug
- #54 P1 Emoji purge + crest / pip / type-icon wiring everywhere
- #55 P1 Opponent hand fan + browsable discards + empty slot outlines
- #56 P1 Explicit concede button + honest leave copy
- #57 P2 leveledUp floater + round/phase cue

### 5. Online play — a stranger can find a game

- #24 **P0** Quick-play queue (auto-pair, no MMR; alone → offered a bot)
- #25 P1 Deploy hardening: honest reconnect / deploy copy
- #58 P1 Reconnect UX: retry budget, countdown, manual Reconnect, beforeunload, share code

### 6. Visual identity — authored, not skinned

- #60 P1 Webfont rollout (restyles every screen at once)
- #59 P1 Wordmark (blocks the OG image)
- #61 P1 Card frame templates, designed with the icon strip (#39)
- #62 P1 Board felt drop-in with letterbox handling
- #14 P1 Tier-1 card art (~45), filed as approved; cut line = whatever is approved at freeze
- #16 P1 Brand & meta: favicon sign-off, OG image, apple-touch icon
- #15 P2 PixelLab arena + champions — **gated** on decision 1
- #63 P2 Animation / feel pass (react pulse + hover lift are the 1.0 slice)
- #64 P2 Victory / defeat moment
- #17 P2 Art doc hygiene

The user is the art director: every batch is an `/art` session they run and judge.

### 7. Foundations — it works on every input and tells you when it doesn't

- #65 **P0** Touch correctness (tap-inspect-first)
- #66 **P0** Toast / error architecture (one slot, human copy, 404 noise silenced)
- #67 P1 Styled modal / confirm component
- #68 P1 Keyboard basics + reduced motion
- #69 P1 Minimum-viable responsive
- #70 P1 Deck builder validation UX
- #71 P2 Settings surface (motion, log verbosity; audio toggle arrives with 1.5)

### 8. Release

- #72 **P0** The three scope decisions (above)
- #27 **P0** Pre-release QA: Playwright journeys + piloted smoke + reconnect/forfeit edges
- #28 **P0** Release cut + deploy
- #26 P1 Version 1.0.0 + changelog

## Suggested sequence

1. **Now:** #72 decisions · #36 + #37 (card tags, vocabulary) · #35 (Evo/Div pilots).
2. **Then:** #38 rewrite → #39/#40 surfaces · #8 protocol → #51/#52/#47/#48 · #20/#45 solo.
3. **Then:** #24 queue · #65/#66 foundations · #60/#61/#62 identity · #5/#2 balance.
4. **Freeze:** #4 → #6 · #14 cut line · remaining P1s by budget.
5. **Ship:** #27 → #26 → #28.

## Done since the August board

exp-9 merged (#1) · SIMPLIFIED audit (#3) · robustness epic on main (#7) · six anchor
illustrations filed (#13) · "Play vs bot" featured (#18) · error monitoring (#22) ·
persistence loop: history / replays / W-L (#23) · bot-school bug (#32).

## Deferred past 1.0 (decisions on record)

- **VN tutorial / onboarding campaign** (2026-07-08): scripted engine duels as a
  chaptered visual novel; the user drafts the world canon first.
- **Desktop / Steam wrap:** keep the client a pure web app behind a `platform` seam;
  Tauri first, Electron fallback.
- **Ladder / MMR / leaderboards, collection & monetization** (cosmetic-only if any).
- **Horizontal scaling** (single event loop + single-writer SQLite is fine for 1.0).
- **Full mobile / touch layout** beyond the responsive minimum.
