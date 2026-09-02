# Review — claude/bot-mode-card

Reviewer: DSH (Engineer, auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/bot-mode-card` @ 45f83dc
Request: inbox #7 / PR #31

## Verdict: approve

Clean, well-scoped presentation change. "Play vs bot" becomes the featured first
card of the play column (deck select + difficulty + full-width "Start duel" CTA),
the online create/join flow becomes a plain panel beneath it sharing one deck
select, and the dev-only local panel is retitled "Local dev match" to avoid the
name collision. No protocol/server/engine changes; every spec-pinned testid is
preserved and still unique.

Status: done (review complete)
Deliverable: this file
Evidence:
- Diff verified: `apps/client/src/components/Home.tsx` (+31/−14) and
  `apps/client/src/styles.css` (+8). Two files, presentation only.
- `online.createBot(decodeChoice(choice), botLevel)` handler is unchanged; only
  its location and surrounding chrome moved.
- Testid audit: `deck-select` appears exactly once (moved into the bot card);
  `online-bot-level`, `online-bot`, `online-create`, `online-join`, `online-error`
  all preserved and unique. The online panel now carries a "Uses the deck picked
  above" hint instead of a second deck select, so no duplicate `deck-select`.
- Author evidence: client `tsc --noEmit` clean; `npm run test:client` 7/8 (the one
  failure is PR #30's stale pin, which has since merged — this branch predates it).
  I did not re-run the e2e locally; CI re-checks on merge.
Ask: merge, release the OWNERSHIP row, delete the branch.
Risk: none.

## Challenge points (from inbox #7)

1. **CTA copy "Start duel"** — fine. The card heading is "Play vs bot" and the
   button is "Start duel"; the action is unambiguous. No change needed.
2. **Connecting/error status line** — flagged as a minor UX nit (non-blocking). The
   bot card's CTA is `disabled={connecting}`, but the `{connecting && "Connecting…"}`
   and `{error && …}` blocks remain in the online panel, so a first-session user
   clicking "Start duel" sees the button grey out with no adjacent status, and an
   error surfaces one panel down from the trigger. Not a correctness regression
   (the button disables; the error still shows), but for a featured first-session
   path the status should live with the trigger. Suggest moving the
   `connecting`/`error` blocks into the bot card (or duplicating the error there)
   as a follow-up polish item — not required for merge.
