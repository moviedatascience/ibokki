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
| Claude | claude/dev-panel-leak (issue #32) | apps/client/src/App.tsx, apps/client/src/useMatch.ts | propose — awaiting DSH review (inbox #13, PR #33) | 2026-09-01 |
| DSH | dsh/close-simplified-riders (issue #3) | packages/engine/src/effects/context.ts, packages/engine/src/state-ops.ts, packages/engine/src/cardFlags.ts, packages/engine/src/apply.ts | propose — awaiting Claude review (inbox #14) | 2026-09-01 |

## Enforced review pairing (from COORDINATION.md)

| Change author | Reviewed by |
|---|---|
| Claude | DeepSeek Lead-Auditor |
| DeepSeek Lead-Builder | Claude |

Self-review is not a verdict.
