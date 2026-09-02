# Review — claude/dev-panel-leak

Reviewer: DSH (Lead-Auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/dev-panel-leak` @ 29b81d8
Request: inbox #13 / PR #33

## Verdict: approve

Correct and minimal. The dev-only local-play panel was gated on `state !== null`,
which online WS frames also set and which is deliberately kept after leaving a
match (for "Resume current match"), so it leaked into production. The fix gates it
on a new `localAvailable` flag that ONLY the local HTTP transport can raise, and
makes `startGame` land on the board only after `/api/new` actually succeeds. Both
challenge points are answered with evidence, not assertion.

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate green, independently re-run in a detached worktree @ 29b81d8:
  `npm run typecheck` clean; `npm test` 272/272 (22 files); client tsc clean
  (`npm --workspace @ibokki/client run typecheck`, exit 0).
- Diff verified: 2 files, +20/−7 — exactly the files claimed (`App.tsx`,
  `useMatch.ts`). Single commit `29b81d8`; no scope creep, no testid/protocol/
  server changes.
- Fix mechanism traced. `setLocalAvailable(true)` appears at exactly two sites,
  both local-HTTP success paths: `refreshInner().then` (GET `/api/state`) and
  `newGame().then` (POST `/api/new`). Online WS frames set `state` via `onState`
  but never touch `localAvailable`. In production there is no local play server:
  `apps/server/src/api.ts:152` returns false for non-`/api/*` paths, and
  `handleApi` ends with `sendJson(res, { error: "not found" }, 404)` (line 386)
  for any unmatched `/api/*` — so the probe 404s (no 200 SPA fallback) and
  `localAvailable` can never become true on live. The panel can no longer leak.
- Challenge (a) — should `localAvailable` ever reset to false? It is sticky-true
  by page load, but the only paths to `true` require a live local play server,
  which production does not have, so stickiness cannot leak into production. In
  dev, a play server that dies mid-session leaves a visible panel whose buttons
  now fail gracefully (the new `startGame` return surfaces the error and keeps the
  user on Home). Harmless; no doctrine violation; no production risk.
- Challenge (b) — is failed-`startGame` surfacing sufficient? `newGame` now
  returns `false` on failure and `startGame` awaits it, flipping to `match` only
  on success. On failure the user stays on Home and the `error` set by `newGame`
  renders through Home's existing error line — the same channel every other
  connection/room error uses. That is the pre-existing convention; "louder" is
  taste, not a failing gate or a violated doctrine. Sufficient.
- Merge posture verified against a real merge: branch is 1 ahead / 12 behind
  `main`, but there is no file overlap — main's 12 commits touch `Home.tsx`,
  `api.ts`, `PixiBoard.ts`, `styles.css`, engine/sim/cards, and `interop`/
  `playtests`/, never `App.tsx` or `useMatch.ts`. I test-merged `origin/main`
  into the detached worktree: clean (no conflicts), and the merged tree
  typechecks (client tsc + root tsc both exit 0). main's board-#18 `Home.tsx`
  (featured "Play vs bot" card + renamed "Local dev match" panel) still consumes
  the unchanged `hasLocalMatch` prop, so the fix stays correct and does not
  regress the production solo path, which uses `online.createBot` over WS and is
  un-gated.
Ask: author merge to main, then release the OWNERSHIP.md claim.
Risk: none blocking.

## Non-blocking (optional)

1. **Stale branch.** `claude/dev-panel-leak` is 12 commits behind `main` (fork
   point `68cbe5c`). It merges cleanly (verified above), but rebase/merge `main`
   before landing to clear the stale fork.
2. **Error placement (taste).** A failed *local* start's error renders in the
   "Play online" panel's shared `online-error` line, not inside the "Local dev
   match" panel — mildly confusing in dev, but it is the single shared `error`
   channel the whole app already uses. Not a blocker.
3. **Double-click race (dev-only, pre-existing).** The local "Start match" button
   is not disabled during the now-awaited `newGame`, so a fast double-click can
   fire two games (last `setState` wins). Benign and dev-only; the panel is not
   reachable in production. Optional `busy`-gated disable if it ever matters.
