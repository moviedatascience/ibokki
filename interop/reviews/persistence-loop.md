# Review — claude/persistence-loop

Reviewer: DSH (Lead-Auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/persistence-loop` @ 20a9a98 (2 commits `7de02ec` + `20a9a98`)
Request: inbox #19 / PR #34

## Verdict: approve

Substantial but well-scoped and unusually well-tested. History + W-L + per-seat
shareable replays are built on the existing matches rows with additive
migrations (nullable `starting_hp` column + new `replay_shares` table),
deterministic replay rebuilds through the same engine walk as `rehydrateRooms`,
and the client gains a self-contained `HistoryPanel` plus a standalone
`ReplayViewer` on `?replay=` / `?rewatch=` — `App.tsx` and `useMatch.ts`
untouched, no protocol changes. All four challenge points are answered by design
+ measured evidence, not assertion.

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate green, independently re-run in a detached worktree @ 20a9a98:
  `npm run typecheck` clean; client tsc clean (`npm --workspace @ibokki/client
  run typecheck`); `npm test` 278/278 (23 files; `history.test.ts` = 5 new);
  Playwright **9/9** (re-run here, exit 0 — includes the new `replay.spec.ts`
  full loop and the 5 `client.spec.ts` / 2 `online.spec.ts` / 1 `decks.spec.ts`).
- Diff verified: 13 files, +1457/−10 — exactly the claimed surface (server:
  `api.ts`, `app.ts`, `db.ts`, `replay.ts`, `history.test.ts`; client:
  `api.ts`, `HistoryPanel`, `ReplayViewer`, `Home.tsx`(+2), `main.tsx`,
  `styles.css`, `vite.config.ts`, `replay.spec.ts`). `App.tsx`/`useMatch.ts`
  untouched.
- Replay correctness traced. `buildReplayFrames` rebuilds from {seed, decks,
  actions} via the same `apply` walk as live rehydration, per-frame
  viewer-relative redaction (sharing seat only — a link can never show more than
  its owner saw), `legal=[]` (inert), and the intro line deliberately OMITS the
  seed so a link holder can't deterministically reconstruct the opponent's
  hidden hand. The outcome checksum (stored result vs replayed winner/reason)
  throws on drift → 410. The per-row `starting_hp` fix is correct: `createMatch`
  records the resolved value and rehydrate + replay prefer it, so a knob change
  between deploys no longer corrupts a rehydrated match (tested: a reboot with
  default 30 HP still rebuilds the 4-HP match).
- Challenge (a) — opponent usernames: participant-only and correctly scoped.
  `historyJson` (auth-gated `/api/matches`) returns `opponentName` from the
  seated opponent's row; the PUBLIC `replayMetaJson` carries deck names only. I
  confirmed live WS frames never carry usernames (no `username` in the app.ts
  match path), so history is the FIRST place a participant learns their
  opponent's login identifier — a genuine new disclosure, but bounded to the two
  actual players of that match. Defensible (a standard match-history feature);
  not a doctrine violation. See note 2 for the tighten-if-desired path.
- Challenge (b) — plaintext share tokens: acceptable, documented deviation.
  `newToken()` = `randomBytes(36).toString("base64url")` = 288 bits (48 chars),
  so the unguessable link IS the credential; hashing would break the idempotent
  "copy link" UX, and the seats JSON already stores plaintext rejoin tokens
  (strictly more capability). Tokens are UNIQUE and per (match, seat); a DB leak
  is the only exposure, and a DB leak already hands out the rejoin tokens.
- Challenge (c) — no per-IP HTTP throttle: the DoS posture is real and measured,
  not absent. Replays build ONCE and cache as per-frame strings under a 64MB
  byte budget + 256-entry LRU cap; a 4000-action cap bounds one build (~0.4s
  sync CPU); the only unauthenticated routes are the static
  `/api/replays/catalog` and `/api/replays/:token/*`, which need a 288-bit token
  to reach any build. An anonymous attacker cannot force new builds (no token
  enumeration surface). Non-blocking; see note 3.
- Challenge (d) — 410 on engine-behavior deploys: correct and honest. A replay
  that can't reproduce its stored natural ending must not serve a game that
  never happened; the checksum's 410 ("older version") is the right failure and
  is kept out of the alert-mail funnel. Forfeit/abandoned tails replay as-is
  (out-of-band endings). W-L/history read the stored result, unaffected.
- Leak hygiene: tests assert opponent hand/spellbook never exposed, `legal=[]`,
  and NO rejoin token in any public meta/frames/history payload (including the
  opponent's plaintext rejoin token). The 404-before-409 ordering prevents a
  non-participant from learning whether a match id exists or is live.
Ask: author merge to main and release the OWNERSHIP.md claim.
Risk: none blocking.

## Non-blocking (follow-ups, not this branch)

1. **`updateMatchActions` O(n²)** (author-flagged, pre-existing): the full action
   JSON is rewritten every ply, so a long clockless solo room writes O(n²) bytes;
   the history query sidesteps hauling it by shipping `'[]' AS actions`. Real,
   but pre-existing and correctly out of scope — file it as its own board item.
2. **(a) username disclosure** — if the human prefers participant history to stay
   username-free, log a DECISIONS entry and drop `opponentName` to "Opponent".
   The replay routes already redact correctly, so only `/api/matches` changes.
3. **(c) rate limit** — a per-IP throttle on `/api/replays/*` is a reasonable
   hardening follow-up if prod traffic ever warrants it.
4. **(d) replay-lifetime** — engine/balance deploys will 410 old share links
   (natural-ending checksum). Accepted as ephemeral; if persistent replays are
   ever wanted, they'd need versioned replay rules — not now.
5. **Playwright 9/9** — independently re-run in this pass (fresh servers, no
   stale-port reuse); all 9 specs pass, including the new `replay.spec.ts`
   end-to-end (register → solo bot → history → watch → end card → public
   `?replay=<token>`).
