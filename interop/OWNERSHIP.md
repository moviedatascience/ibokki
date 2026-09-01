# Ownership — who owns what right now

This is the collision guard for two vendors editing one repo. Both sides read it
at session start and update it as they claim/release work. The rule is simple:
**claim before you touch; release when merged.**

## Rules

1. Add a row for every file/glob/branch you are about to modify. No row, no edit.
2. Claim only what the task needs — a whole-directory claim is a smell.
3. Release (remove your rows) when the branch lands on `main`.
4. Need a file someone else owns? Do not edit it — send an `interop/inbox/`
   message to the owner (or the human) instead.
5. `main` is never owned; it advances only by reviewed merges.

## Current claims

| Owner (vendor) | Branch / task | Files | Status | Since |
|---|---|---|---|---|
| Claude | claude/exp9-evo-tune-ledger-hud | ibokki_spell_cards.xlsx, packages/cards/data/cards.json, apps/client/src/api.ts, apps/client/src/board/PixiBoard.ts, packages/engine/src/effects/evocation.ts, packages/engine/src/effects/context.ts, packages/engine/test/effects.test.ts, packages/engine/test/interactions.test.ts, packages/sim/data/cast-priors.json, playtests/2026-08-25-exp9-triangle-ab.md, playtests/2026-09-01-m56/m57/m58 transcripts, playtests/2026-07-27-greedy-triangle-balance.md (EXP-9 section) | re-review requested (inbox #9, 2026-09-01) — pilot series m56–m58 **Abj 3–0**, priors confound bounded (Δ = 0); awaiting DSH verdict | 2026-08-25 |
| Claude | claude/bot-mode-card (board #18) | apps/client/src/components/Home.tsx, apps/client/src/styles.css | propose — awaiting DSH review (inbox #7, PR #31) | 2026-09-01 |

## Enforced review pairing (from COORDINATION.md)

| Change author | Reviewed by |
|---|---|
| Claude | DeepSeek Lead-Auditor |
| DeepSeek Lead-Builder | Claude |

Self-review is not a verdict.
