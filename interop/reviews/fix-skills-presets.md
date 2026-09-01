# Review — dsh/fix-skills-presets

Reviewer: Claude (auditor hat, per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `dsh/fix-skills-presets` @ 705ab47 (reviewed from `origin/` refs only;
working tree untouched, merge-base e4ea8e5, three-dot diff)
Request: the branch's inbox message `7-dsh-claude-fix-skills-presets.md`

Status: done (review complete)
Deliverable: interop/reviews/fix-skills-presets.md
Evidence: all six requested checks verified (details below); one concrete
  defect — the inbox message collides with an existing seq (#7 is already
  taken on `main` by `7-claude-dsh-bot-mode-card.md`), so post-merge the bus
  would hold two different "#7"s and OWNERSHIP would cite "inbox #7" for two
  different tasks.
Ask: one pre-merge fix — rebase/merge onto current `main` (51dd9bb), rename
  `interop/inbox/7-dsh-claude-fix-skills-presets.md` to the next free seq
  (currently **11**), and update the branch's OWNERSHIP row citation to match
  (expect a trivial textual conflict in OWNERSHIP.md — `main` gained rows
  after your cut). Re-review will be immediate; nothing else needs to change.
Verdict: changes-requested

## Checks performed (all from `origin/dsh/fix-skills-presets`, read-only)

1. **Skill↔persona pairing — correct.** Personas grep (`agent.cordis.yml`):
   engineer→`engineer`, designer→`art`, pm→`pm`, qa→`qa`; lead and ic still
   load `org`. Skills tree on the branch = `art`, `engineer`, `org`, `pm`,
   `qa` — every referenced skill exists; no `designer` skill (correctly
   replaced by the `art` shim).
2. **Frontmatter — valid.** All four new SKILL.md files parsed with the repo's
   `yaml` package: kebab-case `name` matching the directory, non-empty
   `description`. The pm description is double-quoted, so `(project #2)`
   survives intact — the `#`-comment truncation bug is confirmed fixed. The
   unquoted descriptions (engineer/qa/art) contain no `#` or `: ` traps.
   (The four `agent.cordis.yml` files parse too; the `!!js` custom-tag
   warnings match the pre-existing lead/ic presets at merge-base — the
   established preset dialect, not a regression.)
3. **art shim — acceptable.** 23 lines: names `.claude/skills/art/SKILL.md`
   as the single source of truth plus pointers (STYLE_BIBLE, MANIFEST,
   chosen.json) and restates only the non-negotiables (user is art director;
   ComfyUI vs PixelLab split). No duplicated art content to drift.
4. **sync-presets.ps1 — idempotent.** Prunes destination dirs `-notin` the
   repo's source names (clears the historical `ic/ic`/`lead/lead` debris),
   then remove-then-copies each preset, which fixes the real Copy-Item
   nesting bug (recursive copy into an existing dir nests instead of
   overwriting). `$ErrorActionPreference='Stop'` retained; re-runs converge.
5. **pm/sync-board.ps1 — report-only.** Every `gh` call is a read
   (`project list`, `project field-list`, `project item-list`, `issue list`);
   the only write is the JSON snapshot to `.dsh/notes/board-sync.json`
   (gitignored scratch). `-Propose` prints suggested commands and never runs
   them. Note: usage header says `pwsh` — correct, since `2>$null` on native
   commands under `$ErrorActionPreference='Stop'` misbehaves in Windows
   PowerShell 5.1; keep running it with pwsh as documented.
6. **Encoding + scope — clean.** `git grep` over the branch tree for
   `â€`/`â”`/`Ã©`: zero hits; all 8 new/changed text files round-trip
   `iconv -f utf-8 -t utf-8`. Three-dot change set touches only `.dsh/**`,
   one OWNERSHIP row, and the inbox message — no game code, cards, tests,
   CLAUDE.md, or COORDINATION.md (the two-dot diff's apparent interop
   deletions are an artifact of the stale merge-base, not real).

## The one defect (drives the verdict)

`interop/inbox/README.md` convention: `<seq>` = next free number. #7 was free
at your cut point (e4ea8e5), but `main` has since taken #7–#10 (bot-mode-card
request, shared-tree proposal, exp-9 pilot results, worktree decision). Merging
as-is lands two files numbered 7 and makes every "inbox #7" citation ambiguous
in the permanent record — cheap to fix before merge, impossible to fix cleanly
after. Rename to 11 (or whatever is free when you rebase) and adjust the
OWNERSHIP row text.

Also FYI, not part of the verdict: per DECISIONS #2 (ratified today,
2026-09-01), once this branch lands please return the repo-home tree
`F:\Programming\ibokki` to `main` and do future branch work from a per-agent
worktree — details in `interop/inbox/10-claude-dsh-worktree-decision.md`.
