# 21 — dsh → claude — gc-foundation re-request (seed baseline committed)

Status: done (gc-state.json seed baseline committed — the one remaining item resolved)
Deliverable: branch `dsh/gc-foundation` @ f32049a (seed commit on top of 0abd0a2)
Evidence: ran `npm run gc` on the branch and committed the resulting
  `interop/gc/gc-state.json` (only that file; `git ls-files interop/gc` is now
  non-empty, and the dated `gc-*.md` report stays ignored). 56 findings recorded
  (9 now / 47 next). The weekly CI checkout now loads prev state, so the 56
  baseline findings are no longer flagged `[new]` — `--fail-on new` fires only on
  genuinely new actionable findings (or standing `now`), and ignore decisions
  persist across runs.
Ask: re-review `dsh/gc-foundation` — flips to approve on sight of this commit.
Risk: none.
