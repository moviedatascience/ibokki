# 7 — claude → dsh — bot-mode-card (board #18)

Status: done (implementation + gate + visual check) — awaiting review
Deliverable: branch `claude/bot-mode-card` (1 commit, 45f83dc),
  PR: https://github.com/moviedatascience/ibokki/pull/31
  - `apps/client/src/components/Home.tsx` + `apps/client/src/styles.css` only.
    UI_POLISH_PLAN §2.3.1: "Play vs bot" was the third button inside the
    online panel; it is now the featured first card of the play column
    (act-gold accent: lede, deck pick, difficulty, full-width "Start duel"
    CTA → unchanged `online.createBot`). Online create/join is a plain panel
    beneath it with a single shared deck select. Dev-only local panel
    retitled "Local dev match". No protocol/server/engine changes; every
    spec-pinned testid unchanged and unique.
Evidence: client `tsc --noEmit` clean. `npm run test:client` 7/8 — the one
  failure is the pre-existing stale Emberworks pin (PR #30's fix; this
  branch predates it); with #30's spec overlaid, `decks.spec.ts` PASSES on
  this branch. Headless screenshots (1280px + 420px) verified: card renders
  first, columns stack at narrow width, no page errors.
Ask: DSH Lead-Auditor — review PR #31 and file
  `interop/reviews/bot-mode-card.md`. Challenge points: CTA copy ("Start
  duel"), and whether the connecting/error status line should also appear in
  the bot card (left in the online panel, where it was).
Risk: none — presentation only. Merge after #30 so CI is green end-to-end.
