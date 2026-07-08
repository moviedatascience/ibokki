# Ibokki — Project Plan

A "Skyweaver-style" build plan for a fast, browser-first, stack-based wizard dueling
card game — performant in the browser, portable to a downloadable desktop/Steam client,
and instrumented so **Claude can hook in and playtest** the game at scale.

> Profile assumed for this plan: **solo developer + heavy Claude assistance**, MVP target is
> **real online PvP**, desktop wrapper (Tauri vs Electron) **deferred behind a clean web boundary**.

---

## 1. Executive summary

The single most important decision — the one that made Skyweaver fast, debuggable, and
multi-platform — is to build a **deterministic, headless game engine in pure TypeScript** that
is the *one* source of truth for the rules, and run it everywhere:

- the **server** runs it authoritatively (anti-cheat, hidden info),
- the **client** runs it for prediction/animation,
- the **simulation harness** runs it headless for balance,
- **Claude** drives it through a thin agent/MCP interface to playtest.

Everything else (WebGL rendering, networking, accounts, Steam) is a layer *around* that engine.
Build the engine first; it unblocks online PvP and Claude playtesting simultaneously.

```
        ┌─────────────────────────────────────────────┐
        │   @ibokki/engine  (pure TS, deterministic)   │  ← the crux
        │   rules · stack · zones · cards · RNG(seed)   │
        └───────┬──────────────┬───────────────┬────────┘
                │              │               │
        ┌───────▼──────┐ ┌─────▼───────┐ ┌─────▼──────────┐
        │ server       │ │ web client  │ │ sim + Claude   │
        │ (authority)  │ │ (Pixi/React)│ │ (bots / MCP)   │
        └──────────────┘ └─────────────┘ └────────────────┘
```

---

## 2. What we're building (from the design doc + card sheets)

- **1v1, best-of-1** wizard duel. Win by reducing opponent HP to 0; an empty Resource Deck
  reshuffles with escalating **exhaustion damage** (2 × reshuffle count) rather than losing
  outright. Target: 10–25 min, frequent interaction, deep skill expression.
- **Two decks per player:** a **Spell Deck** (prepared face-down) and a **Resource/Component
  Deck** (V/S/M components + Items + Gambits).
- **Component system (V/S/M):** Verbal/Somatic/Material symbols on Basic / Dual / Tri component
  cards, attached to prepared spells to pay costs, with a hard **2-card-per-spell cap**.
- **Round → Level loop:** rounds end when a wizard exhausts spell slots; both level up. The
  level curve (1→21) scales max spell level, slots/round, and prepared-spell count.
- **LIFO stack** with priority passing; **Reactions** counter on the opponent's turn.
- **Three schools / RPS triangle:** Evocation (V, aggro/burn), Abjuration (S, defense/wards),
  Divination (M, tempo/card-advantage/mill). Soft constraints, not hard locks.
- **~166 cards already designed** in `ibokki_spell_cards.xlsx`: 45 Abjuration, 47 Evocation,
  46 Divination, 8 Items, 20 Gambits — each with id, type, level, cost, and effect text.
- **Keywords/markers to model:** Ward (HP objects), Burn (DoT), Seal, Channel, Delayed, Spent,
  Ongoing Effects, plus prevention/redirection/cancel semantics.

This is a meaningfully complex rules engine (closer to Magic: The Gathering than to a simple
auto-battler). The plan reflects that: the rules engine *is* the project; the rest is plumbing.

---

## 3. Guiding principles ("what made Skyweaver good", minus crypto)

1. **One deterministic rules core, shared everywhere.** No rules logic in the UI or server —
   they call the engine. Same seed + same action log ⇒ identical game, always.
2. **Server-authoritative with per-player redacted state.** Hidden info (hands, face-down
   spells, deck order) never leaves the server. Clients receive only what that player may see.
3. **Web-first, WebGL rendering.** A 2D card game is ideal for a batched WebGL renderer; that's
   why Skyweaver loads fast and stays smooth. Desktop is the *same* web build in a thin shell.
4. **Content as data, not code.** Cards live in data + small composable effect scripts, generated
   from the existing spreadsheet. Designers keep using the spreadsheet.
5. **Replays for free.** seed + action log = full replay. This is your bug-repro tool, your
   spectator mode, and the artifact Claude analyzes after a playtest.
6. **Test the rules, not the pixels.** The engine is unit/property/replay-tested in milliseconds;
   the UI is thin enough to need far less testing.

---

## 4. Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript (strict)** end-to-end | One language client→server→engine→tools; shared types. |
| Monorepo | **pnpm workspaces** (+ Turborepo optional) | Engine/server/client/tools share packages cleanly. |
| Engine | **Pure TS, zero runtime deps, seeded PRNG** | Deterministic, portable, fast, trivially testable. |
| Build/dev | **Vite** | Fast HMR, code-splitting, great web output. |
| Board render | **PixiJS v8 (WebGL/WebGPU)** | Batched 2D sprite rendering = the "blown away" perf. |
| Shell/menus UI | **React** (DOM) for menus, deckbuilder, collection | DOM is the right tool for non-board UI; Pixi for the board. |
| State (client) | Zustand or Redux Toolkit (lightweight) | UI state separate from engine state. |
| Server | **Node + TS**, WebSocket (`ws` or **Colyseus**) | Runs the same engine package authoritatively. |
| Persistence | **Postgres** (accounts/collection/matches) + **Redis** (matchmaking/sessions) | Standard, scales, cheap to start. |
| Desktop (deferred) | **Tauri** (preferred) / Electron (fallback) | Same web build in a thin shell; decide at Phase 6. |
| Steam (later) | Steamworks via `steamworks.js` (Electron) or tauri-plugin-steamworks | Achievements, cloud saves, overlay. |
| Playtest AI | Headless sim runner + **MCP server** + Claude API agent | Lets Claude play and batch-simulate (see §8). |
| Testing | **Vitest** + fast-check (property tests) + replay tests | Rules correctness and balance regression safety. |
| CI/CD | GitHub Actions; Fly.io/Railway/Render for server; Cloudflare Pages/Vercel for client | Solo-friendly, low ops. |

Monorepo layout:

```
ibokki/
  packages/
    engine/        # @ibokki/engine — deterministic rules core (no DOM, no net)
    cards/         # @ibokki/cards  — card data (generated) + effect scripts + keywords
    protocol/      # @ibokki/protocol — shared message/types between client & server
    sim/           # @ibokki/sim — headless match runner, bots, balance reports
    mcp/           # @ibokki/mcp — MCP server exposing the engine to Claude
  apps/
    client/        # Vite + React + Pixi web app
    server/        # Node authoritative server (rooms, matchmaking, redaction)
    desktop/       # (Phase 6) Tauri/Electron shell wrapping the web build
  tools/
    import-cards/  # xlsx -> packages/cards JSON converter
```

---

## 5. The deterministic engine (the crux — build this first)

**Responsibilities:** model all game state, enumerate legal actions, apply an action to produce
a new state + an event log, and resolve the stack — with **zero** nondeterminism.

Key elements:

- **Pure reducer:** `apply(state, action, ctx) -> { state, events[] }`. No `Math.random`, no
  `Date.now`, no I/O. RNG is a seeded PRNG (e.g. xorshift/mulberry32) carried *in* the state.
- **Action/intent model:** every legal move is a serializable `Action`
  (`PrepareSpell`, `AttachComponent`, `CastSpell`, `PlayReaction`, `PlayTrainer`,
  `PassPriority`, `Mulligan`, `LevelUpReplace`, `Target`, …).
- **Legal-action generator:** `legalActions(state, playerId) -> Action[]`. This is what bots,
  the UI (to gray out illegal moves), and Claude all consume.
- **Zones & objects:** Hand, Prepared Spells, Casting Zone, Discard, Spell Deck, Resource Deck;
  HP/Level/Slot trackers; Wards (HP objects); Status markers (Spent/Channel/Delayed/Ward/Burn/Seal);
  Ongoing Effects.
- **The stack:** LIFO with priority windows; reactions can respond; resolve when both pass.
- **Round/level state machine:** Prepare → Main (draw/allocate/cast/react) → Level Up, with the
  21-row level curve as data driving slots / max spell level / prepared count.
- **Hidden information is intrinsic:** state carries full truth; a `redact(state, viewerId)`
  function produces the per-player view (your hand visible, opponent's hidden, face-down spells
  hidden, deck order hidden). The server sends only redacted views; the engine never leaks.
- **Replays:** `{ seed, actions[] }` replays to an identical final state. Add a `hash(state)`
  for desync detection between client prediction and server truth.

**Why first:** online PvP can't exist without it (the server runs it), and Claude can't playtest
without it. It's the dependency root of both things you care about most.

---

## 6. Content pipeline — 166 cards without losing your mind

Cards are the long pole. Don't hand-code 166 bespoke functions; make them **data + composed
primitives**.

1. **Importer (`tools/import-cards`):** read `ibokki_spell_cards.xlsx`, emit typed JSON into
   `packages/cards` (id, name, school, type, level, cost, raw effect text, role/comment). This
   keeps the spreadsheet as the editable source of truth — re-run on every balance change.
2. **Cost model:** parse costs (`V`, `SS`, `VSM`, `MMMM`, …) into symbol requirements and validate
   them against the 2-card cap + dual/tri availability rules from the doc.
3. **Effect primitives (a tiny DSL):** `dealDamage`, `preventDamage`, `drawCards`, `createWard`,
   `buffWard`, `addBurn`, `seal`, `cancelSpell`, `returnComponent`, `mill`, `searchDeck`,
   `castCopy`, `gainHP`, `forEach`, `ifCondition`, `untilEndOfRound(...)`. Most cards become a
   short list of primitives; only the genuinely unique ones get custom closures.
4. **Keyword library:** Ward, Burn, Seal, Channel, Delayed, Spent, Ongoing Effect — implemented
   once, referenced by many cards.
5. **Card test harness:** each card gets a tiny scenario test (set up a board state, cast it,
   assert the resulting events/state). This is where Claude's leverage is enormous — generating
   these scenario tests card-by-card.

Deliverable target: all 166 cards implemented + scenario-tested, organized by school.

---

## 7. Client / presentation layer

- **Pixi board:** render the engine's redacted state — hand, prepared spells (face-up/face-down),
  casting zone, wards, HP/level/slots, the stack. Card sprites from packed texture atlases.
- **React shell:** main menu, login, deckbuilder, collection, match history, settings, post-game.
- **Intent flow:** UI never mutates game state directly. It builds an `Action`, optionally applies
  it to a *local* engine copy for instant feedback (prediction), and sends it to the server;
  the server's authoritative event log reconciles (and corrects via the state hash on desync).
- **Animation system:** event-driven — the engine emits semantic events (`DamageDealt`,
  `WardCreated`, `SpellCcountered`), the renderer maps each to an animation/tween. Decoupling
  events from rendering is what keeps the board smooth.
- **Targeting/UX:** drive prompts off `legalActions` so illegal targets are never offered.

Performance techniques (the "Skyweaver feel"): texture atlasing + spritesheet packing, sprite
batching, object pooling for cards, lazy/preloaded asset bundles, code-splitting menus from the
match scene, and keeping the engine tick off the render thread.

---

## 8. ⭐ Claude playtesting & simulation harness (your standout feature)

Because the engine is headless, deterministic, and exposes `legalActions` + `apply`, "an agent
plays the game" is just: *given a redacted view and legal actions, return one action.*

**Agent interface:**
```ts
interface Agent { chooseAction(view: PlayerView, legal: Action[]): Promise<Action>; }
```

Implementations:
- **RandomBot** — smoke-tests rules robustness (fuzzing): can it ever reach an illegal/locked
  state? Run millions of games cheaply.
- **HeuristicBot** — simple per-school strategies (Evo races, Abjuration walls, Divination
  digs). Cheap, fast, the workhorse for **win-rate matrices**.
- **ClaudeAgent** — calls the Claude API with the view + legal actions and a rules primer; plays
  thoughtfully and *explains its reasoning* (great for surfacing confusing or broken interactions).

**Two ways Claude playtests:**
1. **Interactive, in your editor — MCP server (`packages/mcp`).** Exposes tools like
   `new_match(seed, deckA, deckB)`, `get_state(player)`, `legal_actions(player)`,
   `play_action(action)`, `run_simulation(n, agentA, agentB)`. Then Claude (here in Claude Code)
   literally sits down and plays Ibokki, or kicks off batch sims, and reports findings against
   your `ibokki_war_game_balance.md`.
2. **Batch CLI (`packages/sim`).** `pnpm sim --p1 heuristic --p2 heuristic -n 20000` → outputs:
   - school-vs-school win-rate matrix (does the **RPS triangle** from the doc actually hold?),
   - average game length / rounds reached (is it really <10 rounds, 10–25 min?),
   - card-level stats (win-rate-when-drawn, never-cast cards, degenerate combos),
   - deck-out vs HP-zero win ratios,
   - flagged anomalies (infinite loops, >N-minute games, 100%-winrate cards).

This directly serves the balance work you already started — it turns balancing 166 cards from
"guess and hope" into a measured, regenerable report. **Build this right after the engine**, before
the UI: it validates the rules and the card implementations far faster than clicking through a UI.

---

## 9. Server & online multiplayer (your MVP target)

- **Authoritative model:** clients send intents; server validates with `legalActions`, applies via
  the engine, and broadcasts a **redacted** event log to each player. The full state never leaves
  the server — this is the anti-cheat and the hidden-information guarantee in one.
- **Rooms & matchmaking:** Colyseus (room lifecycle, reconnection built in) or a custom `ws`
  server if you want full control. Matchmaking starts as a simple queue in Redis; add MMR later.
- **Reconnection:** on rejoin, resend the player's redacted snapshot + resume the stack/priority.
- **Turn timers / disconnect handling:** server-side clocks; auto-pass/forfeit on timeout.
- **Spectator/replay:** persist `{seed, actions[]}` per match → instant replays and (later)
  spectating, with no extra storage cost.
- **Solo-dev pragmatism:** even though PvP is the MVP, ship a **vertical slice** first — one
  hardcoded matchup, no accounts, ephemeral rooms — so two browser tabs can play a full real
  network match. Add accounts/matchmaking/ladder *after* that slice proves the loop.

---

## 10. Meta systems (after the PvP slice works)

- **Accounts/auth** (email + OAuth), **profile**, **collection** (which cards you own — note the
  doc says players generally collect one of each card; keep monetization simple/cosmetic).
- **Deckbuilder** validating Spell Deck + Resource Deck legality and the trainer ratio guidance.
- **Ladder/MMR**, match history, leaderboards.
- **Live-ops content tooling:** the card importer + sim reports become your balance-patch pipeline.

### 10a. Deck construction (flagged 2026-06-30 — currently a placeholder)

Today both decks come from a single hardcoded recipe in `packages/engine/src/decks.ts`
(`resourceDeckFor` / `spellbookFor`): the Resource Deck is a fixed ~41-card list weighted only by the
school's primary symbol, with the **same 3 neutral trainers for every school**. It is shuffled (random
draw order) but its *contents* are not chosen by the player. The spellbook is "all spells of one
school," which is design-faithful (you bring one of each and choose at Prepare time).

Importantly, **the engine already supports arbitrary decks** — `createGame({ players: [{ spellbook,
resourceDeck }, …] })` accepts any card-id lists, so this is additive, not an engine change. The work:

1. **Deck format + validator.** A JSON deck definition; validate size, the "ramp dial" (same-symbol
   dual ratio that sets how often L3/L4 costs are reachable), the doc's "trainers ≤ ~⅓" guideline, and
   the color mix (mono vs. splash → bricking risk).
2. **Authored archetype decks** per school, using Role-appropriate trainers. The importer already
   captures each trainer's intended fit in `card.role` (e.g. Empowered Chalk → Evocation/aggro,
   Bulwark Shard → Abjuration, Sealed Vault → anti-Divination-mill) — that data exists and is unused.
   Targets: Evo aggro/burn, Abj wards/control, Div tempo/mill, plus the doc's Evo/Div splash.
3. **Loader wiring** so the CLI / sim / MCP / playtest take a named deck (`--deck evo-burn`) instead of
   the hardcoded recipe — making balance sims and playtests test *real, tuned decks*.

Open design calls for the user: target Resource Deck size (fixed legal size vs. flexible), and whether
the ramp/trainer guidelines are hard rules or soft warnings.

### 10b. Onboarding — Visual Novel tutorial (added 2026-07-08)

New players hit three walls at once: the V/S/M component economy, the LIFO stack with Reactions, and
"why would I ever mix schools?" The plan: a **story-driven Visual Novel** that teaches the mechanics
and deckbuilding through a worldbuilding plot, instead of a dry tooltip tour.

- **Shape:** chaptered VN (portraits, backgrounds, dialogue, light choices) interleaved with
  **scripted micro-duels on the real board**. The engine makes this cheap: it's deterministic and
  headless, so each lesson is just `createGame` with an authored deck + fixed seed + a scripted
  "puppet" opponent, with `legalActions` filtered down to the moves the lesson wants to allow.
  No second rules implementation to maintain.
- **Curriculum, one concept per chapter:** (1) components + casting a spell, (2) the stack, priority
  and Reactions, (3) the prepare phase / spellbook model + leveling ramp, (4) the
  Evocation/Abjuration/Divination triangle (fight each school, feel its gameplan), (5) capstone:
  build a legal deck in the deckbuilder and take it into a boss duel.
- **Fiction doubles as design canon:** the VN is where the world (the schools' identities, who the
  wizards are, why they duel) gets written down — feeds card flavor, art direction, and the site.
- **Art:** new asset classes (character portraits, scene backgrounds, chapter cards) — extend
  `art/MANIFEST.md` and follow `art/STYLE_BIBLE.md` registers; generated via the existing `/art`
  ComfyUI pipeline.
- **Open decisions:** in-client route (e.g. `/play/learn`, reusing the Pixi board + React shell)
  vs. a separate app; hand-rolled React dialogue system vs. a narrative scripting library
  (ink / Yarn Spinner) for the script; plot scope and chapter count.

---

## 11. Desktop & Steam (deferred, boundary kept clean now)

- Keep the client a **pure web app** with all platform calls behind a small `platform` interface
  (storage, fullscreen, deep-links, achievements). That single seam is what lets you "decide later."
- **Phase 6 wrap:** drop the web build into **Tauri** (tiny/fast) or **Electron** (most proven on
  Steam). Recommendation when the time comes: prototype Tauri first; fall back to Electron only if
  Steam overlay/achievements integration fights you.
- **Steam:** Steamworks SDK (achievements, cloud saves, overlay, friends/invite). `steamworks.js`
  for Electron; `tauri-plugin-steamworks` / the Rust `steamworks` crate for Tauri.
- **Online still works:** the desktop client talks to the same authoritative server as the browser.

---

## 12. Performance budget (the "blown away in the browser" target)

- Cold load to playable menu: **< 3s** on broadband; match scene assets stream/preload.
- Steady **60 fps** during animations; input→feedback latency imperceptible via local prediction.
- Initial JS bundle lean via code-splitting (menus vs match); assets via atlases + CDN.
- Engine `apply()` well under a frame; it's plain data transforms with no allocpast hot loops.

---

## 13. Testing & QA

- **Engine unit tests** (Vitest): every rule (priority, stack resolution, leveling, cost-paying,
  2-card cap, win/loss/deck-out).
- **Per-card scenario tests:** one per card minimum (§6).
- **Property/fuzz tests** (fast-check): RandomBot self-play asserts invariants (HP never NaN, no
  illegal states, games always terminate, action log always replays to identical hash).
- **Balance regression:** sim win-rate matrices tracked over time; alert on swings after a patch.
- **Network tests:** desync detection via state hashing; reconnection scenarios.

---

## 14. Roadmap / milestones (solo + Claude, online-PvP MVP)

> Sequenced by dependency, not calendar. Each milestone is a demoable artifact.

- **M0 — Foundations.** pnpm monorepo, TS strict, Vitest, CI, empty package skeletons.
- **M1 — Engine core.** State model, zones, RNG, action/legal-action API, stack + priority,
  round/level state machine. Tested with RandomBot self-play (games terminate, no illegal states).
- **M2 — Card pipeline + first school.** xlsx importer, effect-primitive DSL, keyword library,
  implement **Evocation** (simplest: mostly direct damage) end-to-end with scenario tests.
- **M3 — Remaining content.** Abjuration (wards/prevention/cancel), Divination
  (draw/search/recursion/mill), Items, Gambits. All ~166 cards scenario-tested.
- **M4 — Sim harness + Claude playtesting.** `packages/sim` CLI + `packages/mcp` server.
  First real balance report vs the RPS triangle; fix the worst offenders. *(Parallelizable with M3.)*
- **M5 — Online PvP vertical slice.** Authoritative server, redacted state, one matchup, two
  browser tabs play a full network match. *(Your MVP.)*
- **M6 — Client polish.** Pixi board, animations, React shell, deckbuilder, targeting UX.
- **M7 — Meta + accounts.** Auth, collection, matchmaking queue, match history, ladder.
- **M8 — Desktop/Steam.** Tauri/Electron wrap, Steamworks, packaging, store page.
- **M9 — VN onboarding.** Visual-novel tutorial campaign (§10b): scripted engine duels + narrative
  chapters teaching components, the stack, prepare, the school triangle, and deckbuilding.
  *(Depends on M6 board + deckbuilder; parallelizable with M7/M8; art via the §art pipeline.)*
- **Ongoing — Live ops.** Balance patches driven by sim reports; new cards/schools.

---

## 15. Risks & open decisions

- **Rules-engine complexity** (stack + reactions + ongoing effects + hidden info) is the real
  difficulty — MTG-class. Mitigation: build engine + sims before UI so rules are proven headless.
- **Card-text ambiguity.** Some effects (forced targeting, "until end of round", redirection
  ordering) need precise rulings. The scenario tests are where you pin these down; Claude can help
  draft a comprehensive rules reference (CR-style) from the design doc + cards.
- **Online-PvP-first as a solo dev** is ambitious. Mitigation: the M5 *vertical slice* keeps it
  small (no accounts/matchmaking) so the network loop is proven before meta systems pile on.
- **Colyseus vs custom WS** — defer until M5; either works because the engine carries the rules.
- **Determinism discipline** — any stray `Math.random`/`Date.now` in the engine breaks replays and
  Claude sims. Enforce with lint rules + the replay-hash test.

---

## 16. Immediate next steps

1. Scaffold the **pnpm monorepo** + `@ibokki/engine` skeleton with the seeded-RNG reducer shape.
2. Write the **xlsx → card JSON importer** so the spreadsheet stays your source of truth.
3. Stub the **engine state model + action/legal-action API** and get **RandomBot self-play**
   running (proves the loop terminates) — this is the foundation under both online PvP and Claude.
4. Stand up the **MCP server** early so Claude can start playing/iterating on the rules with you.

Tell me which of these to start on and I'll begin building.
