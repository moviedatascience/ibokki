# Review — claude/error-monitoring

Reviewer: DSH (Lead-Auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/error-monitoring` @ 9252d47
Request: inbox #5 / PR #29

## Verdict: approve

Correct, minimal, and well-scoped. Board #22 (P0/Server) asked for minimal
production error monitoring, and this delivers exactly that: every server fault
funnels through `Monitor.report(scope, err, context)` → console (unchanged) +
a deduped `errors` row in SQLite + a rate-limited alert mail, wired at every
catch site plus the process-level guards. The monitor never throws (nested
try/catch, mailer `.catch`), `/health` is untouched, and there are no new
dependencies.

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate green, independently re-run in a detached worktree @ 9252d47:
  `npm run typecheck` clean; `npm test` 272/272 (266 existing + 6 new in
  `apps/server/test/monitor.test.ts`), 22 files.
- Diff verified: 7 files, +331/−23 — exactly the files claimed (`monitor.ts`,
  `db.ts`, `app.ts`, `api.ts`, `server.ts`, `botPool.ts`, `monitor.test.ts`).
  Single commit; no scope creep.
- Rate-limit logic traced: `lastSentAt` starts `-Infinity` so the first fault of
  a quiet period alerts immediately; faults within `minIntervalMs` accumulate in
  `pending` and flush as one batched mail on the timer; `dispose()` clears the
  timer and flushes pending before `db.close()`. Correct.
- Fingerprint = `scope + message.split("\n")[0]` (context excluded) — one noisy
  fault dedupes to a single row with an incrementing `count`; growth is bounded
  by distinct faults, not occurrences.
- Sensitivity posture confirmed: stacks are DB-only (never mailed); `context` is
  deliberately minimal (room code, `method path`, ws `msg.t`); the mail body
  carries only the ≤500-char message + context.
- `mergeStateStatus: CLEAN` / `MERGEABLE` — no conflict with the 17 commits main
  gained since the fork point (`fd8ac7a`); none touch these server files.
Ask: author merge to main (rebase optional — see note 1), then release the
  OWNERSHIP.md claim.
Risk: none blocking.

## Non-blocking (schedule / optional)

1. **Stale branch.** `claude/error-monitoring` forks at `fd8ac7a`, 17 commits
   behind `main` — that is why GitHub's "files changed" shows 34 files instead of
   the real 7 (the branch lacks main's newer `interop/`/`.dsh/` files). It merges
   cleanly, but rebase/merge `main` before landing to clear the misleading diff.
2. **Mail content sensitivity** (inbox #5 challenge (b)). The alert mail includes
   `message` (≤500 chars) + minimal context. An Error message could in principle
   embed a user-supplied string (e.g. a JSON-parse or DB error echoing an
   email/username). Accepted at friends-scale: the alert goes to the operator's
   own `IBOKKI_ALERT_EMAIL`, stacks stay in the DB, and payloads are deliberately
   excluded from `context`. If alert PII/volume ever matters, sanitize `message`
   in `flush()`.
3. **Email vs webhook** (challenge (a)). Email through the existing account SMTP
   mailer is the right minimal channel (no new dependency). A push webhook
   (ntfy/Discord) is a reasonable follow-up, not a P0 requirement.
4. **Errors table has no pruning** (challenge (c)). Acceptable: dedupe-by-
   fingerprint caps growth at distinct-fault count. Optional future `errorsSince`
   sweep / row cap.
5. **`flush()` sync-throw edge.** `dispose()` → `flush()` does
   `mailer.send(...).catch(...)`; a *synchronously* throwing custom `Mailer.send`
   would propagate (the built-in `createMailer().send` is `async`, so this can't
   happen in production). The never-throws test covers a *rejecting* mailer,
   which is the real contract. Trivial; no action needed.
