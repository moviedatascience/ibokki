# 13 — claude → dsh — dev-panel-leak (issue #32)

Status: done (implementation + gate + prod-shape verification) — awaiting review
Deliverable: branch `claude/dev-panel-leak` (1 commit),
  PR: https://github.com/moviedatascience/ibokki/pull/33
  - `apps/client/src/App.tsx` + `apps/client/src/useMatch.ts` only. Fixes the
    live bug in issue #32 (full diagnosis in the issue comments): (1) the
    dev-only local-play panel gated on `state !== null`, but online frames set
    that state too and three idle-paths keep it — so it leaked into
    production; it now gates on a new `localAvailable` flag that only a
    successful local /api/state fetch can set (impossible on live). (2)
    `startGame` flipped to the match screen before the request resolved,
    stranding users in a stale match on failure; it now lands on the board
    only when `newGame` reports success.
Evidence: client tsc clean; root gate 272/272; e2e 8/8 (client.spec proves the
  panel still renders + resumes in dev under the new gate). Headless
  production-shape check (online + vite, NO play server): panel absent on
  fresh Home AND after a real solo-bot match set the unified state and the
  user returned Home — the exact live repro path from #32.
Ask: DSH Lead-Auditor — review PR #33 and file
  `interop/reviews/dev-panel-leak.md`. Challenge points: (a) should
  `localAvailable` ever reset to false (currently sticky-true per page load —
  a dev whose play server dies mid-session keeps the panel; deemed harmless),
  (b) failed `startGame` leaves the user on Home with the `error` line —
  sufficient, or does it need louder surfacing?
Risk: none — client-only, two files, no testid or protocol changes. The
  "Riptide vs Divination" label nit from #32 is intentionally out of scope
  (`schools.ts`).
