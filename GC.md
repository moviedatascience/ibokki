# Garbage Collection — what "clean" means for Ibokki

GC is the scheduled fight against codebase entropy. The gate
(`npm run typecheck && npm test`) blocks at codegen/review time; GC runs on a
schedule (`npm run gc`, weekly via `.github/workflows/gc.yml`) and produces a
**report** — never a PR-blocking error list. Its output draws attention to
accumulating problems before they become serious.

The report is written to `interop/gc/` (gitignored, regenerated each run) so a
human or agent can read it locally; the durable cross-vendor signal is the GitHub
issue the weekly workflow opens/updates. Findings are triaged
`now` / `next` / `ignore:<reason>`; a fix is still normal branch-per-task work and
still needs opposite-vendor review.

## Rules

Each rule declares what "clean" means plus the mechanical check that verifies it.
Rules that never fire are themselves garbage — see "GC the GC".

### R1 — no dead exports / files / scripts
- **What:** every exported symbol is imported somewhere; every file is reachable
  from an entry point; every npm script points at a file that is still used.
- **Check:** `knip` over all workspaces (`tools/gc` shells out to it).
- **Known on first run:** `apps/playvsclaude/verify-ui.mjs`,
  `apps/client/verify-client.mjs` are orphaned entry scripts.
- **Scope note:** `apps/client` (Vite + React, excluded from the root `tsc`) is out
  of the first knip pass — it has its own `tsc --noEmit` gate and `UI_POLISH_PLAN.md`
  already tracks its known dead code. Add a client-specific knip config later.

### R2 — no unused locals / params
- **What:** within-file dead code stays at zero.
- **Check:** `tsc --noUnusedLocals --noUnusedParameters -p tsconfig.json`
  (report-only; not a gate yet because the baseline is not proven zero).

### R3 — markers age out
- **What:** `TODO` / `FIXME` / `HACK` / `@deprecated` comments are either resolved
  or re-justified before they sit ~30 days.
- **Check:** grep the tracked tree (excluding `node_modules`/`dist`/`playtests/`)
  and annotate each marker with its file's last-commit age.

### R4 — dependencies current & safe
- **What:** no known-vulnerable package; no dependency silently many majors behind.
- **Check:** `npm outdated` + `npm audit`. The server surface matters most
  (better-sqlite3, OIDC, ws/express). A high/critical advisory is `now`; the rest
  is `next`.

### R5 — shelved abstractions get a verdict *(agent judgment)*
- **What:** any "off the ladder / retired / shelved / promote-later" abstraction
  either earns promotion or is deleted within a bounded time.
- **Check:** the triage agent reads candidates and files a decision. Current
  candidate: `packages/sim/src/mcts.ts` (`IsmctsBot`, "OFF the ladder").

### R6 — artifact accretion capped
- **What:** playtest logs, art review stages, and agent scratch stay bounded; the
  archive does not grow without bound.
- **Check:** count files under `playtests/`, `playtests/archive/`, `art/review/`,
  `.dsh/notes/` against caps.

### R7 — docs match code *(agent judgment)*
- **What:** `Design_Doc.md`, `CLAUDE.md`, `ROADMAP.md`, `UI_POLISH_PLAN.md` describe
  the code that exists, not a memory of it.
- **Check:** the triage agent diffs docs against the current exports/behaviour and
  proposes updates.

### R8 — declared conventions are held
- **What:** the conventions in `CLAUDE.md` hold — most importantly the SIMPLIFIED
  rule: "SIMPLIFIED / auto-resolve stand-ins are the #1 bug source; never ship a
  stand-in for a real player decision."
- **Check:** grep `SIMPLIFIED` in `packages/engine` (the standing suspect list) and
  surface every instance; each must be a known, justified one.

## Report & triage

`npm run gc` emits `interop/gc/gc-<date>.md` (human) + `interop/gc/gc-state.json`
(machine). Every finding carries: rule id, file/symbol, a one-line explanation,
severity `now` / `next` / `ignore:<reason>`, age (days) where applicable, and a
`[new]` flag when it was not in the previous report.

The weekly workflow opens/updates a GitHub issue only when there is a `now`/`next`
finding (delta-only notify). The `.dsh/` supervisor can spawn a cheap `gc` IC
(`.dsh/agents/gc.md`) to triage the report into `act` / `schedule` / `ignore`.

To ignore a finding, the triager adds an entry to `decisions` in
`interop/gc/gc-state.json`:

```json
{ "<finding-id>": { "reason": "…", "recheckAfterDays": 30, "decidedAt": "2026-08-26" } }
```

An unexpired ignore suppresses the finding; an expired one re-raises it as `[new]`.

## GC the GC

- A rule that has not fired in 8 consecutive weekly cycles is pruned from this file.
- Every `ignore` must carry a reason and a re-check date, else it is noise and the
  checker re-raises it.
- Deletion is a PR too: dead-code removal goes through the same branch-per-task +
  opposite-vendor review as feature work. No big-bang delete branch.
