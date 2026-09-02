# Review — claude/mana-burn-targeting

Reviewer: DSH (Lead-Auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/mana-burn-targeting` @ b50749f
Request: inbox #20 / DECISIONS #3

## Verdict: approve

Minimal and faithful to the ruling. DECISIONS #3 (human, design authority) held
that Mana Burn's "requires M" is a TARGETING restriction, not a conditional
rider, and that the pre-ruling ping-any-spell behavior was a proxy-condition bug
of the historical kind. This adds EVO-029 to `CANCEL_REQUIRES_SYMBOL` ("M"),
which `reactionAnswersTop` enforces on BOTH the offer and apply paths — so the
reaction can no longer be cast (or forged) against an M-less top. The effect
lambda is unchanged; its M check is correctly kept as defense in depth.

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate green, independently re-run in a detached worktree @ b50749f:
  `npm run typecheck` clean; `npm test` 275/275 (22 files; interactions.test.ts
  72 → 74).
- Diff verified: 3 files, +31/−6 — `cardFlags.ts`, `effects/evocation.ts`
  (comment-only change), `interactions.test.ts`. Single commit; no scope creep.
- Enforcement is shared by construction: `CANCEL_REQUIRES_SYMBOL` is read only
  by `reactionAnswersTop` (`cardFlags.ts:120`), which is called from the OFFER
  path (`legal.ts:183` — a non-qualifying top is simply not offered) and the
  APPLY path (`apply.ts:415` — a forged cast throws "printed trigger doesn't
  answer"). Adding EVO-029 tightens both at once; the two cannot diverge.
- EVO-029 has no `REACTION_TRIGGER_TYPE` entry, so it still answers both spells
  and Reactions (the exp-9 "spell or Reaction" print) — now only when the TOP's
  own cost includes M. `reactionAnswersTop` reads `getCard(top.defId)?.cost`
  against the stack top, matching the targeting restriction precisely (not the
  caster's cost).
- Tests cover all four quadrants: M-less spell (EVO-001 V) refused + apply
  throws `/trigger/`; M spell (DIV-001 M) offered; M Reaction (Counterbind SM)
  offered; M-less Reaction (Backdraft V) refused + apply throws `/trigger/`.
  The forged-cast assertions prove the APPLY path is gated, not just the offer.
- Judgment call — effect-level M check vs an unconditional cancel: keeping
  `if (targetRequiresSymbol("M")) cancelTarget(); dealDamage(2)` is the RIGHT
  call, not merely harmless. `targetRequiresSymbol` resolves against the
  effect's resolved target, so on any exotic/recast path that invokes EVO-029's
  effect without passing the castReaction legality gate, the M check still
  refuses to cancel a non-M target. Simplifying to an unconditional
  `cancelTarget()` would let such a path cancel ANY target — stronger than the
  print and re-opening exactly the over-strength DECISIONS #3 closed. The
  defense-in-depth here is load-bearing, not redundant.
Ask: author merge to main. Balance magnitude is (per DECISIONS #3) deferred to
  the next triangle matrix — no sim evidence is expected on this branch.
Risk: none blocking. The tightening removes pings greedy previously took;
  greedy adapts by construction (it scores only offered actions). Expect the
  Evo/Abj leg to move back toward Abj — measure, don't pre-tune.
