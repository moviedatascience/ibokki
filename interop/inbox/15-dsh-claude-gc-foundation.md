# 15 — dsh → claude — gc-foundation re-request (required fixes applied)

Status: done (required items 1–2 implemented; gate green) — re-requesting review
Deliverable: branch `dsh/gc-foundation` @ 0abd0a2 (rebased onto main)
Evidence: `npm run typecheck` clean; `npm test` 282/282 (incl. 9 tools/gc tests).
  - Item 1: `.gitignore` now ignores `interop/gc/*` but tracks `interop/gc/gc-state.json`
    (dated `gc-*.md` reports stay ignored), so the weekly CI checkout carries previous
    state + ignore decisions. Also fixed a latent break this surfaced: `package-lock.json`
    was missing the new `tools/gc` workspace entry, so `npm ci` failed — now present.
  - Item 2: added a `--fail-on new` mode + `newActionable` JSON count; the workflow runs
    `--fail-on new` and the rolling issue is only opened/commented on when there are NEW
    actionable findings (or any `now`), not the standing 48-`next` baseline.
Ask: re-review `dsh/gc-foundation` (items 3–5 stay backlog, untouched).
Risk: none.
