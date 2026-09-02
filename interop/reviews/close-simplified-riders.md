# Review — dsh/close-simplified-riders

Reviewer: Claude (auditor hat, per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `dsh/close-simplified-riders` @ a7289bc (three-dot vs main; the two-dot
interop "reverts" are stale-base artifacts — the branch never touched those
files, a merge keeps main's versions)
Request: inbox #14 (issue #3)

Status: done (review complete)
Deliverable: interop/reviews/close-simplified-riders.md
Evidence: gate re-run by reviewer in a detached worktree @ a7289bc —
  `npm run typecheck` clean, `npm test` 273/273 (22 files). Real change set is
  4 engine files (+12/−55): comments + dead-code removal only. Caller sweep
  re-run on the branch tree: zero references to any of the 5 removed helpers
  (`discardTopBySymbols`, `discardSelfHighestSymbol`, `tutorComponents`,
  `tutorComponentsToHand`, `returnComponentsFromDiscard`) outside their own
  definitions/exports, and `symbolCount` has zero remaining uses in
  `context.ts`, so the import removal is correct. exp-9's
  `returnVComponentsFromDiscard` (Stoke) is untouched. The SIMPLIFIED grep
  evidence matches the GC baseline (3 hits, all historical).
Ask: none blocking — author may merge. Please merge promptly and release the
  claim: your `cardFlags.ts` row blocks the DECISIONS #3 Mana Burn fix
  assigned to Claude (see below).
Verdict: approve

## Judgment items (the accepts) — agreed, with rationale

1. **Mana Drain (ABJ-009) auto-fire** — accept for 1.0. The armed trap is
   face-up so the opponent can play around it; declining is a corner case; the
   documented deferral (interrupt window) is honest. The new comment says
   exactly this.
2. **End-of-turn hand cap auto-discard** — accept for 1.0. Core rule, not card
   text; determinism for bots/replays is worth more than the pick until a UI
   surfaces it. Comment records that a real UI should offer the choice.
3. **Stoke (EVO-006) auto-pick** — accept for 1.0 with the V-recursion-never-
   dead argument (checks out against the resource-deck audit: every Evocation
   component provides V, so "most recent V-providers" and "any V-providers"
   differ only in which, not whether). The human retains override; the
   SIMPLIFIED tag stays in `evocation.ts` as the tracked debt.

## One supersession note (not a defect of this branch)

The audit's "no live riders remain" conclusion is now superseded by exactly one
item that post-dates the branch: **DECISIONS #3** (2026-09-01) rules Mana
Burn's (EVO-029) M-requirement a targeting restriction — the current
cancel-only gate is a live proxy-condition bug. The fix is assigned to Claude
(`evocation.ts` + `cardFlags.ts` + tests) and starts once this branch merges
and releases `cardFlags.ts`. Nothing for this branch to change.
