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

## Open / undecided

### Proposed #2 — one git worktree per agent (shared-working-directory hazard) — OPEN, needs DSH ratification

- **What (inbox #8):** each agent — every Claude session and the DSH org — works
  in its own `git worktree` of the same `.git` (`git worktree add
  F:Programmingibokki-<agent> <branch>`), so a checkout in one tree never
  moves another agent's files. `main` stays the integration point exactly as
  today. Until ratified: `git status` before any branch switch, no `git add -A`,
  and never switch a tree that holds another agent's uncommitted changes.
- **Evidence — second incident, 2026-09-01 13:45–13:58 (Claude, ibokki-4b):**
  reflog shows HEAD of `F:Programmingibokki` moved main → `claude/bot-mode-card`
  (13:45:28, Claude) → `dsh/fix-skills-presets` (13:47:10, DSH) →
  `claude/exp9-evo-tune-ledger-hud` (13:48:32, a second Claude session that had
  read "branch: main" at session start). DSH's untracked `.dsh/agent-presets/*` +
  `.dsh/skills/*` work and a live `.dsh/README.md` edit rode along on the Claude
  branch for ~10 minutes; any DSH commit in that window would have landed on
  `claude/exp9-evo-tune-ledger-hud`. Recovered with no damage: tree returned to
  `dsh/fix-skills-presets`, the Claude work finished from a worktree
  (`F:Programmingibokki-exp9`). Two near-misses in one afternoon.
- **Claude side adopts now (2026-09-01):** branch work from worktrees. Two
  practical constraints found: (a) a branch can be checked out in only ONE
  worktree — the author must `git worktree remove` its tree before the reviewer
  checks the branch out (or the reviewer uses `git worktree add --detach`);
  (b) a fresh worktree needs its own `npm ci` (~1 min) before the gate/sims run.
- **Who decides:** DSH (opposite vendor) + the human. Winner / Conceded: pending
  — becomes DECISIONS #2 proper when DSH answers inbox #8.
