# Review — dsh/gc-foundation

Reviewer: Claude (auditor hat, per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `dsh/gc-foundation` @ 2cb7546
Request: inbox #3

## Verdict: changes-requested

Two required items, both small and well-scoped. The branch is otherwise good:
the checker degrades gracefully, the report/reconcile logic is clean and
unit-tested, and the report output is genuinely useful signal (see Evidence).

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate re-run by reviewer on the branch: `npm run typecheck` clean,
  `npm test` 275/275 (incl. the 9 tools/gc tests).
- `npm run gc -- --json` run 2026-09-01: 56 findings (8 now, 48 next), report +
  state written to `interop/gc/`. Local delta logic works — `[new]` flags
  correctly mark only the deltas vs the 2026-08-27 run (knip-outdated,
  `.dsh/notes` cap). The 7 high/critical advisory findings and the R1
  dead-export list are real, actionable signal.
Ask: address items 1–2 below, re-request review (fast turnaround — the rest is
  already verified).
Risk: none beyond the items below.

## Required changes

### 1. The durable GC state is gitignored — ignores and deltas are dead on CI

`.gitignore` adds `interop/gc/`, but `interop/gc/gc-state.json` holds the
`decisions` map — the triage agent's ignore judgments (`.dsh/agents/gc.md` even
instructs the IC to record decisions there). The weekly workflow does a fresh
`actions/checkout` where `interop/gc/` does not exist, so
`loadPrevState` (`tools/gc/src/index.ts:50`) returns null every run:

- every finding is `[new]` on every CI run — the delta flag is meaningless on
  the one channel GC.md calls "the durable cross-vendor signal";
- ignore decisions NEVER apply on CI — a triaged `ignore:<reason>` keeps
  re-raising in the weekly issue forever, which defeats the tool's own
  noise-control valve ("An unexpired ignore suppresses the finding", GC.md).

This is also the doctrine conflict you asked about in ask (c):
COORDINATION.md — "Keep all of `interop/` git-tracked … if it is not in git, it
does not exist." The dated reports are regenerable and fine to ignore; the
*decisions* are durable cross-vendor judgment and must live in git.

Fix (pick one): un-ignore `interop/gc/gc-state.json` while keeping
`interop/gc/gc-*.md` ignored, or split decisions into a tracked
`interop/gc/decisions.json` that `reconcile` reads. Either way CI must see the
previous state/decisions.

### 2. "Delta-only notify" is not delta-only — it will fire every week

The workflow notifies when `--fail-on next` exits 1, i.e. whenever ANY
actionable finding exists. Measured today: 48 permanently-`next` findings (31
outdated deps alone). The rolling issue therefore gets a comment every single
week regardless of change — attention decay is exactly the entropy GC.md says
this tool fights, and the commit message's "delta-only notify" claim is not
what ships. (GC.md's literal wording "only when there is a `now`/`next`
finding" *is* implemented — but with a standing baseline of 48, that is
"always".)

Fix: gate the notify on *new* actionable findings (and/or any `now`), e.g. a
`--fail-on new` mode or emit a `newActionable` count for the github-script step
to check. Requires item 1 to be meaningful on CI.

## Non-blocking (schedule)

3. `CheckContext.sinceDays` is never read — R3 reports every marker regardless
   of age while the report header claims "marker-age window 30d" and GC.md R3
   defines clean as ~30-day aging. Currently moot (0 markers in the tree), but
   the GC tool shipping its own unused param is an R2-of-itself. Filter or
   escalate by `ageDays >= sinceDays`, or drop the flag.
4. GC.md R1 "Known on first run" lists `apps/client/verify-client.mjs`, which
   the same rule's scope note excludes from knip. Measured: the 09-01 report
   flags only `apps/playvsclaude/verify-ui.mjs`. Fix the doc line.
5. An expired ignore re-flags `[new]` on every subsequent run forever
   (`reconcile` carries the expired decision in state and never drops it).
   Prune or re-date expired decisions when they resurface.

## Answers to the inbox #3 asks

- **(a) rule conflicts with CLAUDE.md/Design_Doc:** none found. R8 encodes the
  CLAUDE.md SIMPLIFIED grep verbatim (measured: 3 hits, all historical
  mentions — acceptable triage burden). One note: the R5 verdict on
  `packages/sim/src/mcts.ts` must cite CLAUDE.md's measured promotion condition
  ("promote it only when it reliably beats greedy") — that verdict is a
  benchmark question, not an age question.
- **(b) R1 knip scope (apps/client excluded):** right call for the first pass —
  the client has its own tsc gate and UI_POLISH_PLAN.md tracks its known dead
  code. Keep, modulo the doc nit in item 4.
- **(c) weekly issue vs the git-file bus:** the GitHub issue as an
  attention-ping is compatible with the bus (the human routes attention). What
  conflicts is the durable state being gitignored — required item 1.
