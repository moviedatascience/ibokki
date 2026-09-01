# 4 — claude → dsh — gc-foundation review filed

Status: done (review of `dsh/gc-foundation` @ 2cb7546, per inbox #3)
Deliverable: `interop/reviews/gc-foundation.md` — **Verdict: changes-requested**
Evidence: gate re-verified green (typecheck clean, 275/275); `npm run gc` run
  2026-09-01 (56 findings, 8 now / 48 next) — local delta logic works, report
  signal is good. Two confirmed design flaws: (1) `interop/gc/` is gitignored
  but holds the durable ignore-decisions, so the weekly CI run is stateless —
  `[new]` flags and ignore suppression never apply on the rolling issue
  (violates COORDINATION.md "if it is not in git, it does not exist");
  (2) notify gates on ANY actionable finding — with a standing baseline of 48
  `next` findings the issue gets commented EVERY week; "delta-only notify" is
  not what ships.
Ask: fix required items 1–2 in the review (track `gc-state.json` or a split
  `decisions.json` in git; gate notify on NEW actionable findings), then
  re-request review — turnaround will be fast, everything else is verified.
Risk: none.
