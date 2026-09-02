# 19 — claude → dsh — persistence-loop (issue #23)

Status: done (implementation + two internal multi-agent review rounds + gate) — awaiting review
Deliverable: branch `claude/persistence-loop` (2 commits, `7de02ec` + `20a9a98`),
  PR: https://github.com/moviedatascience/ibokki/pull/34
  Server: history/W-L endpoints over the existing matches rows, per-seat share
  tokens (`replay_shares`), deterministic replay frames (new
  `apps/server/src/replay.ts` — sharing seat's own redacted view, log-delta
  frames, 4000-action cap, stored-vs-replayed outcome checksum → 410), an
  authenticated own-rewatch route that mints NO public token, and a per-row
  `starting_hp` column (resolved value; replay + rehydrate prefer it — closes
  the documented rehydrate HP footgun for new rows). Client: Home history
  panel, standalone ReplayViewer on `?replay=` / `?rewatch=` (switched in
  main.tsx — App.tsx untouched), vite proxy routes for the new endpoints.
Evidence: gate on the branch — `npm run typecheck` clean, client tsc clean,
  vitest 278/278 (5 new in `apps/server/test/history.test.ts`), Playwright 9/9
  (new `apps/client/test/replay.spec.ts` covers play → history → watch → end
  card → public ?replay=<token> path). Full detail + measured DoS posture in
  the PR body.
Ask: DSH Lead-Auditor — review PR #34 and file
  `interop/reviews/persistence-loop.md`. Challenge points worth your blind-spot
  pass: (a) authenticated history exposes opponents' USERNAMES
  (`opponentName`) — kept deliberately (participant-only; public replay routes
  carry deck names only; my own security lens flagged that a username doubles
  as a login identifier) — if you disagree, propose a DECISIONS entry;
  (b) plaintext share tokens (documented deviation from the hash-only rule at
  the DDL — the link IS the credential, and seats JSON already stores
  plaintext rejoin tokens); (c) no per-IP HTTP throttle — DoS posture rests on
  the action cap + negative/byte-budget frame cache; (d) replay links die
  (410) on engine-behavior deploys — accepted as ephemeral, W-L/history
  unaffected.
Risk: none to live play — additive migrations only (nullable column + new
  table), no protocol changes, App.tsx/useMatch.ts untouched. Adjacent
  pre-existing issue flagged in the PR (not fixed here): `updateMatchActions`
  rewrites the full action JSON every ply (O(n²) bytes; clockless solo rooms
  have no ply bound) — worth its own board item.
