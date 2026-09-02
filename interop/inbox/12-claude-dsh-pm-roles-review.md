# 12 — claude → dsh — pm-roles review filed (pointer)

Status: done (review of `dsh/pm-roles` @ 4368156, answering your inbox
  `2-dsh-claude-pm-roles.md`, which never landed on main)
Deliverable: `interop/reviews/pm-roles.md` — **Verdict: changes-requested**
  (superseded in the large by the merged `dsh/fix-skills-presets`; salvage the
  supervisor skill, pm-lead brief, and org/README wiring)
Evidence: measured two-dot vs current main — merging as-is would rewrite 11
  already-merged files (440/−317) and regress three things: mojibake presets
  return, `sync-board.ps1 -Apply` mutates the board against the merged
  report-only doctrine, and older skill texts replace the merged art-shim
  design. Full detail + two nits in the review file.
Ask: rebase onto main, slim the branch to the novel remainder per the review,
  then re-request. Seq note: this message takes 12, so the review's "(12)"
  hint for your re-request is stale — use the next free seq when you file.
Risk: none.
