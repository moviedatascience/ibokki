# Ibokki

A fast, stack-based wizard dueling card game. This repo is a TypeScript monorepo
built around a single **deterministic, headless rules engine** that runs everywhere
(server, client, simulation, and Claude playtesting). See [PROJECT_PLAN.md](PROJECT_PLAN.md)
for the full architecture and roadmap.

## Status

The deterministic engine, the card pipeline, the full effect system (LIFO stack +
priority + Reactions), the self-play/balance harness, and the **MCP playtest server**
are all working. **The full card pool is implemented** — all 137 spells & Reactions
plus all 28 Items/Gambits (a few exotic riders are simplified — search the effect
files for `SIMPLIFIED`/`DEFERRED`). Trainers are drawn into hand and played from
hand on your turn (Items unlimited; one Gambit per turn).

## Packages

| Package | What it is |
|---|---|
| `packages/engine` | Deterministic rules core: state, the LIFO stack + priority, `legalActions`, `apply`, `redact`, the effect DSL, RNG. Zero runtime deps. |
| `packages/cards` | Card catalog: spells/reactions/items/gambits (generated from the spreadsheet) + the V/S/M component definitions. |
| `packages/sim` | Headless match runner, bots (random + heuristic), and the balance-report CLI. |
| `packages/mcp` | MCP server so Claude can play matches and run sims interactively. |
| `apps/playvsclaude` | Minimal local web app to play a match in the browser against Claude (hidden info enforced). |
| `tools/import-cards` | Zero-dependency `.xlsx` → typed card data importer. |

## Prerequisites

Node 20+ and npm. If your shell can't find `node`, ensure `C:\Program Files\nodejs`
is on your `PATH` (it's installed there but some non-interactive shells don't pick it up).

## Quick start

```bash
npm install            # install dev tooling + link workspaces
npm run import-cards   # regenerate card data from ibokki_spell_cards.xlsx
npm run typecheck      # tsc across all packages
npm test               # vitest: determinism, termination, redaction, cost math
```

## Running simulations (the balance harness)

```bash
# One matchup
npm run sim -- -n 2000 --p1 heuristic --p2 heuristic --s1 Evocation --s2 Abjuration

# Full 3x3 school win-rate matrix (the RPS-triangle check)
npm run sim -- --matrix -n 800

# Flags: -n <games>  --p1/--p2 random|heuristic  --s1/--s2 <School>  --seed <n>  --hp <n>  --matrix
```

The engine is fully deterministic: a given `seed` + action log always reproduces
the same game, which is what makes replays, server authority, and batch
playtesting possible.

## Play a match against Claude (local web app)

```bash
npm run play        # starts a local server, then open http://localhost:7777
```

You play **P0** in the browser (pick your school + Claude's, click legal-move buttons).
Claude plays **P1** via the same server's HTTP API (`GET /api/view?side=1`,
`POST /api/act?side=1`). Each side's endpoint returns only that side's redacted view,
so **your hand stays hidden from Claude** (and vice-versa). Localhost only, no accounts —
it's the local seed of the eventual online-PvP slice.

## Claude playtesting (MCP server)

The engine is exposed over MCP so Claude can sit down and play. The project ships
a [.mcp.json](.mcp.json) that registers the `ibokki-playtest` server; approve it in
Claude Code and the following tools become available:

- `new_match` — start a match between two schools; choose which side(s) you play
- `match_state` — show the position + numbered legal actions
- `act` — take the legal action at an index (the bot side then auto-plays)
- `simulate` — run a batch of bot games and report win rates
- `card` — look up a card's rules text

Run it standalone with `npm run mcp` (stdio). If Claude Code can't find `node`,
point the `command` in `.mcp.json` at the full path to `node`.

> NOTE: the heuristic bot does not pilot Abjuration's Reactions or Divination's
> card-advantage well, so naive self-play does not show the intended
> rock-paper-scissors triangle. Claude playing those strategies is how we'll
> actually validate (and tune) the balance.

## Next steps

- Tighten the `SIMPLIFIED`/`DEFERRED` riders (reflect-actual-damage, forced targeting, ward triggers, deck-sculpting selection).
- Tune resource-deck composition (trainer ratio, dual-component rarity = the ramp dial).
- A stronger search/eval agent (or Claude) to validate the RPS triangle, then tune.
- Authoritative WebSocket server + a minimal online PvP vertical slice.
