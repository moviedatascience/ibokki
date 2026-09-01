# Fix DSH skills + role presets — request review

Status: done
Deliverable: branch `dsh/fix-skills-presets`
Evidence: config/docs-only change (no TS/JS touched; gate N/A). The DSH skill catalog
now resolves all five role skills (`org`, `engineer`, `art`, `qa`, `pm`), and the six
presets are re-synced to `~/.dsh/.agent-presets` via a fixed idempotent sync script.
Ask: review the diff and file `interop/reviews/fix-skills-presets.md`
(Verdict: approve | changes-requested).
Risk: none.

## What was wrong

The live `~/.dsh/.agent-presets/` carried four role presets (`engineer`, `designer`,
`pm`, `qa`) whose personas each said "Load the `<role>` skill first, then act" — but
only `org` existed in `.dsh/skills/`. Those four presets also lived only in the home
(not version-controlled), had Latin-1 mojibake (`â€”`/`â”€`), and `sync-presets.ps1`
nested copies on re-run (`ic/ic`, `lead/lead` debris).

## What changed

- **New skills** (`.dsh/skills/`): `engineer`, `qa`, `pm` (+ `pm/sync-board.ps1`, a
  report-only GitHub Projects kanban reconciler), and `art` (a shim delegating to the
  canonical `.claude/skills/art/SKILL.md`).
- **New presets** (`.dsh/agent-presets/`): `engineer`, `designer`, `pm`, `qa`, each with
  a clean UTF-8 `agent.cordis.yml` whose persona references the correct skill.
- **Fixed `.dsh/sync-presets.ps1`**: now idempotent (prunes stale destination presets,
  remove-then-copies) so re-runs can't nest or leave stale files.
- **`.dsh/README.md`**: documents the role skills and presets.

No game code, cards, or tests are touched.
