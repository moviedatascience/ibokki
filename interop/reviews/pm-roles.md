# Review — dsh/pm-roles

Reviewer: Claude (auditor hat, per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `dsh/pm-roles` @ 4368156 (authored 2026-08-26; reviewed from `origin/`
refs only, three-dot vs main @ fd3a64d)
Request: the branch's inbox message `2-dsh-claude-pm-roles.md` (never landed on
main — surfaced during a queue sweep, answered here)

## Re-review (2026-09-01, @ 5df44c4) — Verdict: approve

Re-request: inbox #16 (rebased onto 31b7b58, single squashed commit). All
required items delivered; every check below run against the branch refs:

- **Slimmed to the novel remainder** — exactly 4 content files:
  `.dsh/skills/supervisor/SKILL.md` (new), `.dsh/agents/pm-lead.md` (new),
  `.dsh/skills/org/SKILL.md` + `.dsh/README.md` (2-line wiring each). Every
  file the first pass flagged as superseded (presets, engineer/art/pm/qa
  skills, sync-board.ps1, stale inbox #2, OWNERSHIP claim) is gone from the
  diff. The only other changes are inbox seq/hash refreshes already on main
  via 86673be — a no-op at merge.
- **Report-only doctrine holds**: no `-Apply` anywhere; pm-lead.md instructs
  `sync-board.ps1 -Propose` and the merged script has that exact switch
  (line 16, prints "NOT applied — review before running"). The brief's
  propose → parent/human approval → execute loop is the first pass's asked-for
  shape; mutations only run post-approval.
- **Nit (a)**: both invocations use `pwsh`, not `powershell`. **Nit (b)**:
  all 4 files scanned clean for mojibake bytes (`â€`/`â”`/`Ã`).
- **References verified**: `.dsh/skills/pm/SKILL.md`, `sync-board.ps1`,
  `handoff.md` all exist on main; README table rows match the actual
  additions; board conventions (project #2, milestone 1.0, P0–P2) match the
  house setup; the "done" definition quotes the real gate.
- **Gate**: docs-only diff (no TS/JS) — N/A per the fix-skills-presets
  precedent; main's gate at the same tree is green (273/273, measured this
  session).

Author may merge, release nothing (no OWNERSHIP row was claimed), and delete
the branch + worktree.

Status: done (review complete)
Deliverable: interop/reviews/pm-roles.md
Evidence: the branch is a 2026-08-26 predecessor of `dsh/fix-skills-presets`
  (merged to main today, 0217a33) and ~90% of it is now superseded by cleaner
  merged versions. Measured against current main (two-dot): merging as-is
  would rewrite 11 already-merged files (440 insertions / 317 deletions) and
  regress three things — (1) mojibake returns: the branch's four
  `agent.cordis.yml` presets carry `â€”`/`â”€` throughout (git grep hits at
  designer preset lines 12/17/20/35/39/52 etc.), which fix-skills-presets
  explicitly cleaned; (2) the report-only doctrine breaks: the branch's
  `sync-board.ps1` has an `-Apply` mode that runs `gh issue close` (line 188)
  and `gh project item-edit` (line 195), while the merged pm skill's rule is
  "report only … propose before mutating; the human approves"; (3) older
  skill texts replace the merged ones (e.g. the branch's `art` skill predates
  the shim-to-`.claude/skills/art` design and duplicates art content).
  Genuinely novel and worth landing: `.dsh/skills/supervisor/SKILL.md` (the
  Ship Log session-start duty — good), `.dsh/agents/pm-lead.md`, and the
  2-line `org/SKILL.md` + `README.md` wiring.
Ask: rebase onto current main and SLIM the branch to the novel remainder —
  supervisor skill, pm-lead brief, org/README wiring — dropping every file
  already merged via fix-skills-presets (presets, engineer/art/pm/qa skills,
  sync-board.ps1). Renumber the inbox message to the next free seq (12).
  If an `-Apply` mutation mode for the board is still wanted, propose it
  separately with the human's sign-off — it contradicts the merged
  report-only doctrine and cannot ride in on a rebase. Two nits for the slim
  branch: the supervisor skill invokes `powershell` (5.1) for
  `sync-board.ps1`, but the merged script documents `pwsh` (5.1's `2>$null`
  native-command behavior under `$ErrorActionPreference='Stop'` is the
  reason) — align the invocation; and re-run the mojibake/UTF-8 check on the
  surviving files before re-requesting.
Verdict: changes-requested (superseded in the large; salvage the supervisor /
  pm-lead remainder)
