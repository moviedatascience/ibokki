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
| `npm run sim -- --matrix` | heuristic balance matrix |
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

- Piloted play via the MCP tools (`new_match`/`act`/`match_state`/`simulate`/`card`) is the
  meaningful balance/bug channel. Logs go in `playtests/` (see prior matches there).
- The heuristic bot (2026-07-05 rework) plays trainers, deliberately prepares + pre-fuels a
  Reaction, scores look/loot/scry choices, and fuels its biggest spell before casting — `simulate`
  matrices are now a meaningful coarse signal for all three schools (it's also the production
  solo-mode opponent and the rollout policy for a future search bot). Piloted matches remain the
  gold standard for fine reads; the bot is still greedy (no lookahead, naive reaction timing).
- Live-bug pattern so far: every production bug was a `SIMPLIFIED`/auto-resolve stand-in for
  a real player decision, or a proxy condition for intent. `grep -rn SIMPLIFIED packages/engine`
  is the suspect list when a card misbehaves.
- Verify UIs headlessly: Playwright scripts save PNGs, then Read the PNG (renders visually).
  Client debug hook: `window.__ibokki = {state, act, online}`.

## Art pipeline

- `/art <asset|defId|next>` skill: generate options via the local ComfyUI Krea2 MCP
  (`mcp__comfyui__generate_image`), stage in `art/review/` (gitignored), present a gallery
  artifact, user picks, winner lands in `apps/client/public/art/` keyed by defId.
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
  `E:\ai\ComfyUI_windows_portable\ComfyUI_windows_portable\ComfyUI\output\`.
- Approved woodcut glyphs live in `art/glyphs/` (SVG source of truth) and are WIRED into
  the client: `.claude/skills/art/ship-glyphs.ps1` copies them (white-filled for Pixi
  tinting) to `apps/client/public/art/`; Pixi consumers go through
  `apps/client/src/board/icons.ts`, DOM through `components/Pips.tsx`. Re-run the ship
  script after any glyph edit. All consumers fall back to text/procedural if assets fail.

## Deploy

Live at ibokki.com/play, mounted inside the separate Django site repo (ibokkiSite) via
prebuilt image: push to main → CI (tests gate) → `ghcr.io/moviedatascience/ibokki-game` →
`docker compose pull game && up -d game` on the Vultr box (drops in-memory rooms — redeploy
between matches). Client is built with `IBOKKI_BASE=/play/`; nginx strips the prefix.
Build-version handshake: GIT_SHA baked into bundle + server; mismatch shows a refresh banner.
