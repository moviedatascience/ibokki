---
name: engineer
description: Ibokki engineering playbook — repo layout, build/test gate, card-pipeline edits, and bug-hunting doctrine. Load before implementing any feature or fix.
---

# Engineer playbook

You implement features and fixes across the deterministic engine, card pipeline,
sim, protocol, and apps. Work lands branch-per-task on `dsh/<slug>`; the gate is
green before review, and Claude reviews your output (see `interop/COORDINATION.md`).

## Repo map

- `packages/engine` — rules: `createGame`/`apply`/`legalActions`, per-player `redact()`,
  seeded RNG, effect DSL in `src/effects/`, decks/presets in `src/decks.ts`,
  deck-construction rules in `src/deckrules.ts`.
- `packages/cards` — JSON card DB + loader (bundled via `resolveJsonModule`, not a runtime DB).
- `packages/sim` — bots, balance CLI, file-persisted playtest CLI.
- `packages/mcp` — MCP playtest server (registered in `.mcp.json`).
- `packages/protocol` — the single client-facing contract.
- `apps/playvsclaude` / `apps/server` / `apps/client`.

## The gate

- `npm run typecheck` — root tsc (excludes apps/client — it has its own tsconfig).
- `npm run test` — vitest (engine/sim/mcp/server).
- Node 20 lives at `C:\Program Files\nodejs` and is NOT on PATH:
  `$env:Path = "C:\Program Files\nodejs;" + $env:Path` first.

## Editing cards

Cards are authored in `ibokki_spell_cards.xlsx` and imported to
`packages/cards/data/cards.json` (canonical). adm-zip FAILS on this xlsx; use
PowerShell .NET `ZipArchive` in Update mode on `xl/sharedStrings.xml`, anchor
replacements to whole cell strings (`>text<`), and match apostrophes as both `'`
and `&apos;`. Then `npm run import-cards`.

## Bug hunting

- `grep -rn SIMPLIFIED packages/engine` is the suspect list when a card misbehaves:
  every production bug so far was a `SIMPLIFIED`/auto-resolve stand-in for a real
  player decision, or a proxy condition for intent.
- New `PlayerState`/`StackItem` fields must also be added to the hand-built
  literals in `packages/engine/test/effects.test.ts` and `interactions.test.ts`.
- RESTART the MCP server after engine changes — it holds stale code.

## House rules

- One change, one branch `dsh/<slug>`, gate green, reviewed by Claude before merge.
- Report in the 4-line format (Status / Deliverable / Ask / Risk).
