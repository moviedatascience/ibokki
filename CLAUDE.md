# Ibokki — notes for Claude

Ibokki is a 1v1 stack-based wizard dueling card game: V/S/M components, LIFO stack with
Reactions, round→level ramp (1–21), Evocation/Abjuration/Divination school triangle.
`Design_Doc.md` is the rules source of truth; cards are authored in `ibokki_spell_cards.xlsx`
and imported to `packages/cards/data/cards.json` (canonical, version-controlled).

## Architecture

npm-workspaces monorepo (NOT pnpm). One deterministic headless engine shared by everything:

- `packages/engine` — rules: `createGame`/`apply`/`legalActions`, per-player `redact()`,
  seeded RNG, effect DSL in `src/effects/`, decks/presets in `src/decks.ts`,
  deck-construction rules in `src/deckrules.ts`.
- `packages/cards` — JSON card DB + loader (bundled via `resolveJsonModule`, not a runtime DB).
- `packages/sim` — bots (Random/Heuristic), balance CLI, file-persisted playtest CLI.
- `packages/mcp` — MCP playtest server (registered in `.mcp.json`) so Claude can pilot matches.
- `packages/protocol` — the single client-facing contract (catalog, per-viewer redaction of
  events, relative player-id remapping) spoken by both servers.
- `apps/playvsclaude` — zero-dep local play server (:7777) + HTML board; HTTP `/api` contract.
- `apps/server` — online PvP (:7788): ws rooms, SQLite accounts (better-sqlite3), OIDC SSO
  against the Django site, deck CRUD; serves the built client in production.
- `apps/client` — Vite + React 18 + PixiJS v8 client (:5173 dev; proxies `/api`+`/ws`).

## Commands

| Command | What |
|---|---|
| `npm run typecheck` | root tsc (excludes apps/client — it has its own tsconfig) |
| `npm run test` | vitest (engine/sim/mcp/server; includes `apps/*/test`) |
| `npm run test:client` | Playwright e2e (boots play+online+vite servers) |
| `npm run sim -- --matrix` | balance matrix (`--p1 greedy` for the strong bot; `--paired` seat-swap; `--cards` per-card telemetry; `--json out.json`; `--deck1 <preset\|file.json>`) |
| `npm run playtest -- new\|show\|act\|note\|auto\|finish\|log` | file-persisted playtest CLI |
| `npm run mcp` | MCP playtest server (long-running; RESTART it after engine changes — it holds stale code) |
| `npm run play` / `npm run online` / `npm run client` | local board / PvP server / Vite dev |
| `npm run import-cards` | xlsx → cards.json (run after any xlsx edit) |
| `npm run build:client` | vite build → apps/client/dist |

## Environment quirks

- **Node 20 lives at `C:\Program Files\nodejs` and is NOT on PATH** in the shell tools.
  PowerShell: `$env:Path = "C:\Program Files\nodejs;" + $env:Path` first.
- **Editing the xlsx:** adm-zip FAILS on this file (zip descriptor quirk). Use PowerShell
  .NET `ZipArchive` in Update mode on `xl/sharedStrings.xml`. Anchor replacements to whole
  cell strings (`>text<`) — substrings collide across cards — and note apostrophes are
  sometimes `&apos;` entities (match both). Then `npm run import-cards`.
- **PowerShell traps:** comma binds tighter than `+` (`@("a"+$x, "b")` ≠ what you think —
  build strings in variables first); ArrayList-of-arrays flattens.
- **Playwright specs failing mysteriously?** Stale dev servers on 5173/7777/7788 —
  `reuseExistingServer: true` reuses OLD code. Kill them.
- New `PlayerState`/`StackItem` fields must also be added to the hand-built literals in
  `packages/engine/test/effects.test.ts` and `interactions.test.ts`.

## Testing for bugs — what works

- Piloted play via the MCP tools (`new_match`/`act`/`autoplay`/`match_state`/`simulate`/`card`)
  is the meaningful balance/bug channel. Logs go in `playtests/` (see prior matches there).
  Context economy (2026-07-26): boards render COMPACT by default (`verbose:true` for the old
  full render), `act` accepts stable slugs (`slug:"cast-evo-017"`) so stale indices can't
  misfire, and `autoplay` hands your side to a bot pilot until a stop condition
  (`roundEnd`/`myTurn`/`reactionWindow`/`choice`/`gameOver`) so tokens go only to decisions
  that matter. Full piloted games fit one context now; for batches, run each match in its own
  subagent and keep only the analysis in the main conversation. ALWAYS spawn pilots with
  `subagent_type: "pilot"` (`.claude/agents/pilot.md`) — it pins a cheaper model + effort
  (sonnet/medium, 2026-08-13) so piloted series stop burning premium usage limits; never
  pilot matches on the main-session model or with a default subagent.
- Bot ladder, MEASURED (2026-07-27 paired benchmarks): `random` (fuzz) < `search`
  (IsmctsBot, `packages/sim/src/mcts.ts`) ≤ `heuristic` (fast policy; the rollout policy)
  < `greedy` (GreedySimBot, `packages/sim/src/greedy.ts`: scores candidates by simulating
  them on `determinize()`d worlds; ~10s/game). Solo ladder: easy=heuristic,
  medium=greedy(1 world), hard=greedy(3 worlds) — search is OFF the ladder: it loses
  races even to heuristic at 300 iterations (rollout noise overrides its greedy root
  priors) but shows real defensive lookahead (took the first-ever Abj game off greedy-Evo);
  promote it only when it reliably beats greedy. Balance numbers: `--p1 greedy --paired
  --cards`. `evaluateState` weights (`packages/sim/src/evaluate.ts`) are the shared tuning
  surface. MEASUREMENT REGIME (2026-07-29): sim CLI defaults to `--horizon 2` (greedy
  rollout scores the opponent's reply turn — reactions/denial/charge wincons only price
  correctly there; hard ladder bot matches). Numbers logged before 2026-07-29 evening are
  horizon-1 — reproduce with `--horizon 1`, never compare across regimes. `--cards` prints
  an expression audit; a flagged card means CHECK BOT VALUATION first (5-entry ledger +
  plan: `playtests/2026-07-29-blindspot-plan.md`; forcing probe: `--force <defId>` vs the
  same-seed baseline — winrate up = bot blind spot, flat = real card verdict). Sim bots
  never retract and only detach before attaching (turn-bounded plies — livelock-proof;
  runMatch throws past 400 plies/turn with the seed named), EXCEPT the round-final
  detach-rescue cleanup mode (tier-1 valve, 2026-08-13).
- PILOT-GAP DOCTRINE (2026-08-13, after two piloted series inverted both 100% edges):
  bot-level winrates are LOWER BOUNDS on the losing school's potential, never balance
  targets. Any edge ≥ ~90% triggers a 3-game piloted series (via the `pilot` agent, above)
  BEFORE design action
  (prompt template: the m5-m7 briefs in `playtests/2026-08-13-m*.md` transcripts). Bots are
  for regression + magnitudes; pilots discover lines; the tier-1/2 behavior valves
  (detach-rescue, waste accounting, doom-aware cancel holding, ward-battery term —
  commits e3a07a5/b6db6e6) encode the discovered lines back into the instrument.
- Live-bug pattern so far: every production bug was a `SIMPLIFIED`/auto-resolve stand-in for
  a real player decision, or a proxy condition for intent. `grep -rn SIMPLIFIED packages/engine`
  is the suspect list when a card misbehaves.
- Verify UIs headlessly: Playwright scripts save PNGs, then Read the PNG (renders visually).
  Client debug hook: `window.__ibokki = {state, act, online}`.

## Art pipeline

- `/art <asset|defId|next>` skill: generate options via the local ComfyUI Krea2 MCP
  (`mcp__comfyui__generate_image`), stage in `art/review/` (gitignored), present a gallery
  artifact, user picks, winner lands in `apps/client/public/art/` keyed by defId.
- **PixelLab track (2026-08-22):** the board/arena and the two dueling champions (sprites +
  animations) are PIXEL ART via the hosted PixelLab MCP (`pixellab` in `.mcp.json`, HTTP;
  needs `PIXELLAB_SECRET` env var — token from pixellab.ai). ComfyUI stays for card
  illustrations/icons/branding. Same review flow (options → gallery → user picks); see the
  PixelLab section in `.claude/skills/art/SKILL.md` and MANIFEST §1-px.
- `art/STYLE_BIBLE.md` = the art-direction law (2026-07-07): old-school D&D/early-MtG
  homage, Plate vs Cover registers by card tier, muted-earth palette + one school accent,
  immutable prompt blocks (§13) + standing negative prompt, QA kill-list (§15). Follow it
  for ANY visual work, not just card art.
- `art/MANIFEST.md` = prioritized asset list + integration points (audited 2026-07-06:
  the client ships zero image files; drop-in points are commented in `cardSprite.ts`,
  `.sbart`, `PixiBoard.buildStatic()`). `art/chosen.json` = accepted prompts/seeds — the
  style anchors. The user is the art director: never generate batches or file winners
  without being asked.
- ComfyUI must be running; originals save to
  `E:\Comfy-Desktop\ComfyUI-Shared\output\` (shared store; models live in `ComfyUI-Shared\models`, the portable engine reads them via `extra_model_paths.yaml`).
- Approved woodcut glyphs live in `art/glyphs/` (SVG source of truth) and are WIRED into
  the client: `.claude/skills/art/ship-glyphs.ps1` copies them (white-filled for Pixi
  tinting) to `apps/client/public/art/`; Pixi consumers go through
  `apps/client/src/board/icons.ts`, DOM through `components/Pips.tsx`. Re-run the ship
  script after any glyph edit. All consumers fall back to text/procedural if assets fail.

## Deploy

Live at ibokki.com/play, mounted inside the separate Django site repo (ibokkiSite) via
prebuilt image: push to main → CI (tests gate) → `ghcr.io/moviedatascience/ibokki-game` →
`docker compose pull game && up -d game` on the Vultr box. Live matches survive the
redeploy: rooms persist to SQLite (`matches` table) and rehydrate on boot by deterministic
replay; clients rejoin with their stored seat tokens. Client is built with
`IBOKKI_BASE=/play/`; nginx strips the prefix. Build-version handshake: GIT_SHA baked into
bundle + server; mismatch shows a refresh banner.

## DeepSeek Harness multi-agent org (`.dsh/`)

The repo also runs a DSH-native multi-agent org alongside this Claude setup —
see `.dsh/README.md` for the full playbook. In short: a supervisor session
(lead preset) spawns two lead agents (Builder/Auditor) → project leads → ICs as
continuable subagents; messaging is parent↔child only; the supervisor relays
cross-reviews and restarts dead agents per `.dsh/agents/handoff.md`. Live state
lives in `.dsh/roster.md`; presets are synced to `~/.dsh/.agent-presets` by
`.dsh/sync-presets.ps1`. Keep `.dsh/` conventions consistent with this file:
playtest pilots run on cheap models, the pilot-gap doctrine and the `npm run
typecheck && npm test` gate apply to DSH agents exactly as to Claude ones.

## Cross-vendor collaboration (Claude ↔ DeepSeek Harness)

Claude (here) and the DeepSeek Harness org (`.dsh/`) are two vendors on ONE repo.
They never talk in real time; they coordinate through **git + `interop/`**, and
the human routes. Full protocol: `interop/COORDINATION.md`.

Start-of-session duty (every time): read `interop/COORDINATION.md`,
`interop/OWNERSHIP.md`, `interop/DECISIONS.md`, and drain `interop/inbox/`.

Conventions that bind this side:
- **Branch-per-task:** one change = one branch `claude/<slug>`; run the gate
  (`npm run typecheck && npm test`) on the branch before requesting review; merge
  to `main` only after the opposite vendor approves.
- **Enforced pairing:** your builder output is reviewed by **DeepSeek
  Lead-Auditor**; you review **DeepSeek Lead-Builder** output (auditor hat — file
  `interop/reviews/<slug>.md`). Self-review is not a verdict.
- **Decisions:** disagreements resolve in `interop/DECISIONS.md`; cite the number.
- One repo, one truth: `F:\Programming\ibokki` — but do branch work from your OWN
  worktree (DECISIONS #2): `git worktree add F:\Programming\ibokki-<name> <branch>`,
  `npm ci` there once, remove it when the branch lands. The repo-home tree stays
  on `main`; other agents (DSH, sibling Claude sessions) share it — never
  `git add -A` there, never switch its branch while anyone has uncommitted work.
