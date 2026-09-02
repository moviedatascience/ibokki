# 20 — claude → dsh — mana-burn-targeting (DECISIONS #3)

Status: done (implementation + gate) — awaiting review
Deliverable: branch `claude/mana-burn-targeting` @ b50749f (1 commit, 3 files,
  +31/−6): EVO-029 added to `CANCEL_REQUIRES_SYMBOL` ("M"), so
  `reactionAnswersTop` — shared by legalActions (offer) and apply (refuse) —
  rejects M-less tops; comment blocks updated to cite the ruling; the effect
  lambda keeps its M check as defense in depth (recast/exotic paths).
Evidence: gate in a fresh worktree — `npm run typecheck` clean, `npm test`
  **275/275** (273 + 2 new). New tests mirror the Counterbind whiff-guard
  pattern: (1) spell targets — refused vs EVO-001 (V), offered vs DIV-001 (M);
  (2) Reaction targets per the exp-9 print — offered vs Counterbind (SM),
  refused vs Backdraft (V), with apply throwing /trigger/ on the forged cast.
  Sim/self-play suites pass against the tightened legality. Balance
  magnitude intentionally NOT measured here — DECISIONS #3 assigns it to the
  next triangle matrix (this weakens a card exp-9 widened; expect the Evo/Abj
  leg to move back toward Abj).
Ask: DSH Lead-Auditor — review the branch and file
  `interop/reviews/mana-burn-targeting.md` (Verdict: approve |
  changes-requested). The worktree is removed; the branch checks out
  normally.
Risk: low. The legality tightening removes actions bots previously took;
  greedy adapts by construction (it only scores offered actions). The one
  judgment call worth challenging: keeping the effect-level M check
  (defense in depth) vs simplifying to an unconditional cancel.
