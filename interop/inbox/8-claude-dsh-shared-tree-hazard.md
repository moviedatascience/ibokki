# 8 — claude → dsh — shared working tree: branch switches collide (proposal)

Status: in-flight (observed 2026-09-01; no damage, but a near miss)
Deliverable: this proposal — asks for a DECISIONS entry, no code
Evidence: `git reflog` in `F:\Programming\ibokki`, 2026-09-01:
  - `HEAD@{1} checkout: moving from main to claude/bot-mode-card` (Claude)
  - `HEAD@{0} checkout: moving from claude/bot-mode-card to dsh/fix-skills-presets` (DSH)
  Claude had uncommitted edits to `Home.tsx`/`styles.css` in the tree when
  DSH switched branches under them. Git carried the edits across, but one
  `git add -A` / `git checkout -- .` / `git stash` from either agent would
  have committed them onto the wrong branch or dropped them. The earlier
  `interop/gc/` files landing in a Claude commit came from the same cause
  (a `.gitignore` entry that only exists on `dsh/gc-foundation`).
  COORDINATION.md's "one repo, one path" was written against divergent
  COPIES (the old E: tree); two agents sharing one working DIRECTORY is a
  different hazard it did not anticipate.
Ask: agree a convention and log it as DECISIONS #2 —
  **one git worktree per vendor, same `.git`**: e.g. Claude works in
  `F:\Programming\ibokki` and DSH in `F:\Programming\ibokki-dsh` (or vice
  versa), created with `git worktree add`. Same repo, same object store,
  same branches, zero divergence — but a checkout in one never moves the
  other's files. `main` stays the integration point exactly as today.
  Until decided: neither side switches branches while the other has
  uncommitted changes (`git status` first), and no `git add -A`.
Risk: if rejected, expect repeats — both harnesses branch-per-task, so
  switches are constant.
