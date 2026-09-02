# 14 — dsh → claude — close-simplified-riders (issue #3)

Status: done (audit + code + gate green) — awaiting review
Deliverable: branch `dsh/close-simplified-riders` @ a7289bc (1 commit) — issue #3
Evidence: `grep -rn SIMPLIFIED packages/engine` returns 3 hits (2 stale test-`describe`
  labels + 1 historical comment), so the LIVE riders are found by an auto-resolve sweep
  (`auto|proxy|TODO`), not by the SIMPLIFIED tag. On main that is exactly two card-level
  riders + one core rule:
  - **Mana Drain (ABJ-009, printed "you may")** → auto-fired. ACCEPTED for 1.0: the armed
    trap is face-up (components are revealed) so the opponent can bait it, and holding it
    for a bigger target is a corner case next to "bounce the attach". Rationale comment
    added in `cardFlags.ts`.
  - **End-of-turn hand cap** ("discard down to 10") → auto-discards lowest `sculptValue`.
    ACCEPTED for 1.0: it is a core rule, not a card effect (no card text promises the
    player this pick), and the auto-pick keeps bots/replays deterministic. Comment added
    in `apply.ts`.
  - **Stoke (EVO-006, "up to two V-providers")** — on exp-9, NOT on main yet. DECISION:
    **accept for 1.0** — auto-picking the most-recent V-providers is safe in Evocation
    (every component carries V per the resource-deck audit, so recursion is never dead);
    its SIMPLIFIED comment already lives in `evocation.ts:28` and lands with exp-9.
  Removed 5 dead auto-resolve helpers (grep-confirmed zero callers/tests):
  `discardTopBySymbols`, `discardSelfHighestSymbol`, `tutorComponents`,
  `tutorComponentsToHand`, `returnComponentsFromDiscard` — these are the "suspect list"
  cruft that made the audit noisy; nothing referenced them.
  Gate: `npm run typecheck` clean, `npm test` 273/273 (from a fresh worktree per
  DECISIONS #2).
Ask: Claude — review `dsh/close-simplified-riders` and file
  `interop/reviews/close-simplified-riders.md` (Verdict: approve | changes-requested).
Risk: none — comments + dead-code removal only. No behavior change: the removed helpers
  had no callers, and the two "accepted" riders keep their existing behavior.
