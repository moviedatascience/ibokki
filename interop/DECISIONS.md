# Decision log

Shared, git-tracked memory for the two vendors. Every disagreement ends here as a
numbered decision. Both sides cite the number in later briefs ("per DECISIONS
#N"). Do not re-litigate a logged decision without a NEW piece of evidence.

## How to add one

Append a block in the numbered format below, incrementing the number. `Winner` /
`Conceded` record who moved and on what evidence, so every decision is traceable
and reversible.

---

## DECISIONS #1 — adopt the interop protocol (2026-08-25)

- **What:** Claude Code and the DSH org coordinate through git + `interop/` using
  branch-per-task and enforced cross-vendor review pairing (Claude reviews DSH
  builder output; DSH Lead-Auditor reviews Claude output).
- **Who:** the human; no party conceded.
- **Reversible:** only by a later numbered decision.

---

## DECISIONS #2 — one git worktree per agent (2026-09-01)

- **What (from inbox #8):** each agent — every Claude session and the DSH org —
  does branch work in its own `git worktree` of the same `.git`
  (`git worktree add F:\Programming\ibokki-<agent> <branch>`), so a checkout in
  one tree never moves another agent's files. The repo-home tree
  `F:\Programming\ibokki` is the NEUTRAL tree: it stays on `main` (session-start
  reads, inbox drains, bus commits) and hosts no branch work. `main` remains the
  integration point exactly as before. Standing rules in any shared tree:
  `git status` before switching branches, no `git add -A`, never switch a tree
  that holds another agent's uncommitted changes.
- **Practical constraints (measured):** (a) a branch can be checked out in only
  ONE worktree — the author removes its worktree before the reviewer checks the
  branch out (or the reviewer uses `git worktree add --detach`); (b) a fresh
  worktree needs its own `npm ci` (~1 min) before the gate/sims run; (c) while
  the repo-home tree is transitionally off `main`, agents needing `main` use a
  transient worktree and remove it immediately after.
- **Evidence:** two same-day near-misses, 2026-09-01. Reflog of
  `F:\Programming\ibokki`: HEAD moved main → `claude/bot-mode-card` (13:45:28,
  Claude) → `dsh/fix-skills-presets` (13:47:10, DSH) →
  `claude/exp9-evo-tune-ledger-hud` (13:48:32, a second Claude session). DSH's
  untracked `.dsh/agent-presets/*` + `.dsh/skills/*` work and a live
  `.dsh/README.md` edit rode along on a Claude branch for ~10 minutes; any DSH
  commit in that window would have landed on the wrong branch. Recovered with no
  damage; the Claude work finished from worktrees.
- **Who:** the human, ratifying inbox #8 (2026-09-01); Claude side already
  adopted; DSH notified via inbox #10 and may append its ack here. No party
  conceded — this amends COORDINATION.md's "one path" rule, which was written
  against divergent copies, not shared working directories.
- **Reversible:** only by a later numbered decision.

---

## Open / undecided

(none — add blocks here as disagreements arise)
