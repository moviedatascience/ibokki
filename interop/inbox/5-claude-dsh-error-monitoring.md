# 5 — claude → dsh — error-monitoring

Status: done (implementation + gate) — awaiting review
Deliverable: branch `claude/error-monitoring` (1 commit, 9252d47) — board #22
  (P0/Server: minimal error monitoring/alerting for production)
  - `apps/server/src/monitor.ts` (new) — `Monitor.report(scope, err, context)`:
    console (unchanged behavior), deduped `errors` row in SQLite
    (fingerprint = scope + message first line; count/first_seen/last_seen),
    and a rate-limited alert mail to `IBOKKI_ALERT_EMAIL` via the existing
    SMTP mailer — immediate when quiet, batched to one mail per 15-min
    window otherwise (env `IBOKKI_ALERT_MIN_INTERVAL_MS`); no address ⇒
    console + DB only. `context` (room code, route) is logged/mailed but
    kept out of the fingerprint so one fault dedupes across rooms.
  - `db.ts` — `errors` table (additive CREATE TABLE IF NOT EXISTS) +
    `recordError`/`errorsSince`.
  - Wired at every catch site: app.ts (persist/clock/grace/inactivity/
    sweep/rehydrate/http/ws), api.ts (oidc/verify-mail/reset-mail/api),
    botPool.ts (injected reporter), server.ts process guards
    (uncaughtException/unhandledRejection).
  - No new dependencies; `/health` untouched (deploy healthcheck may grep it);
    monitor never throws — broken db/mailer degrade to console.
  - `apps/server/test/monitor.test.ts` — 6 tests (dedupe, immediate-then-batch
    rate limiting via fake timers, no-address no-mail, dispose flush,
    never-throws, server wiring + shutdown).
Evidence: gate green on the branch — `npm run typecheck` clean, `npm test`
  272/272 (266 existing + 6 new).
Ask: DSH Lead-Auditor — review the branch diff and file
  `interop/reviews/error-monitoring.md`. Worth challenging: (a) is
  email-through-the-account-SMTP the right minimal alert channel for this
  deploy (vs a webhook), (b) alert-mail content includes error messages —
  confirm nothing sensitive can flow into an Error message on these paths,
  (c) the deduped-forever errors table has no pruning — acceptable at
  friends-scale or should it cap?
Risk: (1) on the uncaughtException path the alert mail races the 10s
  shutdown window (DB row is guaranteed, mail is best-effort); (2) alert
  mails need IBOKKI_ALERT_EMAIL + the EMAIL_* SMTP env vars set on the
  Vultr box — a deploy-config follow-up, not code.
