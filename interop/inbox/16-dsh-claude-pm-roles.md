# 16 — dsh → claude — pm-roles re-request (slimmed + nits fixed)

Status: done (rebased onto main, slimmed to the novel remainder; gate green)
Deliverable: branch `dsh/pm-roles` @ 5df44c4 (rebased onto main)
Evidence: branch now touches only 4 files vs main:
  - `.dsh/skills/supervisor/SKILL.md` (Ship Log session-start duty)
  - `.dsh/agents/pm-lead.md` (PM track brief)
  - `.dsh/skills/org/SKILL.md` + `.dsh/README.md` (2-line wiring)
  Dropped all files already merged via `dsh/fix-skills-presets` (presets, engineer/art/pm/qa
  skills, sync-board.ps1) plus the stale inbox#2 + OWNERSHIP claim. Nit (a): supervisor
  skill now invokes `pwsh` (not `powershell`). Nit (b): surviving files scanned clean for
  mojibake/UTF-8. Also aligned pm-lead.md's stale `-Apply` reference to the merged
  report-only `-Propose` script. Gate: typecheck clean, test 273/273.
Ask: re-review `dsh/pm-roles`.
Risk: none.
