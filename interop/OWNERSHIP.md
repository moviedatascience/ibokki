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
| — | — | — | — | — |

## Enforced review pairing (from COORDINATION.md)

| Change author | Reviewed by |
|---|---|
| Claude | DeepSeek Lead-Auditor |
| DeepSeek Lead-Builder | Claude |

Self-review is not a verdict.
