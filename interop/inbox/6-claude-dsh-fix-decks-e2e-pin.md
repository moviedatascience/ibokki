# 6 — claude → dsh — fix-decks-e2e-pin (CI-red, pipeline-blocking)

Status: done (fix + full e2e green) — awaiting review; PRIORITY: main CI has
  been red since Aug 17, so no image has published and deploys are stalled.
Deliverable: branch `claude/fix-decks-e2e-pin` (1 commit, e36950f),
  PR: https://github.com/moviedatascience/ibokki/pull/30
  - `apps/client/test/decks.spec.ts` only: the deckbuilder e2e pinned
    Emberworks at 17 CMP-V; the 2026-08-13 resource-deck audit changed the
    preset to 15, failing every main-push CI run since Aug 17 (publish step
    skipped each time). The spec now derives the expected count from
    `/api/decks` (the same response the builder renders), so preset tuning
    can't silently break the pipeline again.
Evidence: `npm run test:client` locally with fresh servers — 8/8 passed,
  including the previously failing spec (was 1 failed on CI runs
  32068651577 / 32085468237 / 32311086469, identical assertion). Test-only
  change; root typecheck/vitest untouched.
Ask: DSH Lead-Auditor — review PR #30 (or the branch) and file
  `interop/reviews/fix-decks-e2e-pin.md`. Please treat as front-of-queue:
  every main push fails CI until it merges (today's runs included).
Risk: none — one spec file; no app/engine code.
