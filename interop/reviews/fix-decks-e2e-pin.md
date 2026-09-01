# Review — claude/fix-decks-e2e-pin

Reviewer: DSH (Engineer, auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/fix-decks-e2e-pin` @ e36950f
Request: inbox #6 / PR #30

## Verdict: approve

Correct, minimal, and well-scoped. The three hardcoded CMP-V counts in
`decks.spec.ts` are replaced by a value derived from `/api/decks` — the same
source the deckbuilder renders from — so future preset tuning can no longer
silently break the release pipeline. Test-only; no app, engine, or protocol
changes.

Status: done (review complete)
Deliverable: this file
Evidence:
- Diff verified: `apps/client/test/decks.spec.ts` (+12/−3) plus the
  `interop/OWNERSHIP.md` claim. The "17"/"16"/"17" literals are the only stale
  pins; all three are now derived from `emberworksV`.
- Premise confirmed against `packages/engine/src/decks.ts:111`: Emberworks
  (Evocation) now builds **15** `CMP-V` basics (`push("CMP-V", 15)`), so the old
  "17" was indeed stale (the 2026-08-13 wave-A audit, per the comment at lines
  108–110).
- Response shape confirmed: `GET /api/decks` returns
  `{ rules, presets: PRESET_DECKS, decks }` (`apps/server/src/api.ts:337-344`),
  and `presets[i]` is `DeckDefinition` with `resourceDeck: string[]` — matches
  the test's cast. The client builder reads the same endpoint via `api.decks()`
  (`apps/client/src/api.ts:202`), so the derived expectation and the rendered
  count share one source.
- No other stale deck-count literals in the spec: the remaining "40"/"41"
  assertions reference the fixed `RESOURCE_DECK_SIZE`, not preset composition.
- Author evidence: `npm run test:client` 8/8 (fresh servers). I did not re-run
  the e2e suite locally — it boots three servers and would collide with the
  shared working tree; CI re-runs it as the merge gate, which is the definitive
  check for a CI fix.
Ask: merge; release the OWNERSHIP claim after it lands.
Risk: none.

## Non-blocking (schedule)

1. `presets.find((d) => d.name === "Emberworks")!` uses a non-null assertion —
   if the preset name ever changes, the test throws an opaque TypeError rather
   than a readable assertion. A `toBeDefined` guard first would fail clearly.
   Trivial; not a blocker.
2. The spec no longer snapshots deck composition (the "15 CMP-V" fact now has no
   snapshot anywhere). That is the intended trade — the preset stays freely
   tunable — but note composition is now validated only by the engine's own
   construction code. If composition regressions ever matter, they belong in a
   unit test over `resourceDeckFor`, not this e2e spec.
