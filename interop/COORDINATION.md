# Cross-vendor collaboration — Claude Code ↔ DeepSeek Harness

This file is the contract for how the two AI "vendors" working on Ibokki
coordinate. It is the entry point for BOTH sides and is read at the start of
every session by Claude Code (VSCode) and the DeepSeek Harness (DSH) supervisor.

- **Claude Code** — interactive builder in VSCode (memory `CLAUDE.md`, agents
  `.claude/agents/`).
- **DeepSeek Harness** — the `.dsh/` org (supervisor → Lead-Builder / Lead-Auditor
  → project leads → ICs; memory `.dsh/README.md`, `.dsh/roster.md`).

## The one rule that matters

The two vendors cannot call each other. They talk through **git + `interop/`**,
which is the shared bus. You (the human) are the router. Nothing here is
real-time; everything is an async file the other side drains on its next
session. Every challenge, review, and decision must leave a git-tracked artifact.

## Single source of truth

- One repo, one `.git`: `F:\Programming\ibokki`. There is no second copy of the
  repository — every checkout below shares this object store.
- **Worktree per agent (DECISIONS #2, 2026-09-01):** the repo-home tree
  `F:\Programming\ibokki` is neutral — it stays on `main` (session-start reads,
  inbox drains, bus commits) and hosts NO branch work. Each agent does branch
  work in its own `git worktree` (`git worktree add
  F:\Programming\ibokki-<agent> <branch>`): a checkout in one tree never moves
  another agent's files. One branch per worktree (remove yours before the
  reviewer checks the branch out, or review detached); run `npm ci` once in a
  fresh worktree; in any shared tree, `git status` before switching, no
  `git add -A`, and never switch a tree holding another agent's uncommitted
  changes.
- `main` is always green. It is the integration point; work lands there only as a
  reviewed merge.

## Branch-per-task

- One change = one branch = one review. Never stack unrelated changes.
- Branch names: `claude/<slug>` for Claude work, `dsh/<slug>` for DeepSeek work.
  `<slug>` is kebab-case, e.g. `claude/ledger-pierce-rework`.
- Branch from a fresh `main`. Before requesting review, run the gate on the
  branch:
  - Engineering: `npm run typecheck && npm test` (Node 20 at
    `C:\Program Files\nodejs`, not on PATH — prefix `$env:Path`).
  - Balance/design: measured evidence — `npm run sim -- --matrix ...` or a
    piloted series per the pilot-gap doctrine.
- Never two branches touching the same files concurrently. Claim files in
  `OWNERSHIP.md` before you touch them; release when merged.

## Enforced cross-vendor pairing (no vendor reviews its own builder output)

The whole point of two vendors is different blind spots, so the skeptical reader
is always the OTHER vendor. This is enforced:

| Change author | Reviewed by |
|---|---|
| Claude (builder work in VSCode) | **DeepSeek Lead-Auditor** (`.dsh/`) |
| DeepSeek Lead-Builder (`ic-engine` / `ic-client` / `ic-content`) | **Claude** (auditor hat) |
| Claude design/balance proposal | **DeepSeek Lead-Auditor** challenges |
| DeepSeek design/balance proposal | **Claude** challenges |

- Pilots and measurements are *evidence*, not changes — either side may run and
  cite them; they are not subject to the pairing rule.
- The human may review anything at any time, but the automatic challenge must
  come from the opposite vendor.
- Self-review is not a verdict: a change is not "done" until the opposite vendor
  files `interop/reviews/<slug>.md` with `Verdict: approve`.

## The review loop (state machine)

1. **propose** — author branches, implements, runs the gate, claims files in
   `OWNERSHIP.md`, and drops an inbox message asking the opposite vendor to review.
2. **challenge** — reviewer checks out the branch, reads the diff, and files
   `interop/reviews/<slug>.md` with a verdict and evidence. "I don't like it" is
   not a challenge; a challenge cites a failing gate, a violated doctrine
   (`Design_Doc.md`, `CLAUDE.md`), or measured evidence.
3. **resolve** — disagreements are settled in `interop/DECISIONS.md` with a
   decision number. The loser records why it conceded. Both sides cite the number
   in every later brief ("per DECISIONS #N").
4. **implement** — the author addresses `changes-requested` items (or the
   assignee re-assigned by the decision) and re-requests review.
5. **verify** — reviewer re-runs the gate and flips the verdict to `approve`;
   author merges to `main` and deletes the branch.

## The shared report format

Every interop artifact (inbox message, review) uses this shape — the same 4-line
format the DSH org already uses, with `Evidence` added for challenges:

```
Status: done | blocked | in-flight (what, since when)
Deliverable: commit / branch / file / playtest path
Evidence: gate result, sim numbers, or piloted transcript (REQUIRED for challenges)
Ask: what you need from the other side
Risk: anything off the rails (omit when none)
```

## The daily cadence

Both vendors are human-driven; you are the heartbeat. Each side, at the start of
every session:

1. `git fetch` + note where `main` is.
2. Drain `interop/inbox/` — answer requests, file reviews, accept assignments.
3. Read `interop/DECISIONS.md` (new decisions) and `interop/OWNERSHIP.md` (what is
   claimed).
4. Do the assigned work; end the session by writing any open asks to `inbox/` and
   updating `OWNERSHIP.md`.

## Files

| Path | What it is |
|---|---|
| `interop/COORDINATION.md` | This file — the protocol both sides follow |
| `interop/inbox/<seq>-<from>-<to>-<slug>.md` | Async instructions/handoffs; `<seq>` = next free number (highest existing + 1) |
| `interop/reviews/<slug>.md` | Structured review of a branch/task |
| `interop/DECISIONS.md` | Decision log (ADR-lite); the shared memory |
| `interop/OWNERSHIP.md` | Live claim of who owns which files/branches right now |

Keep all of `interop/` git-tracked (unlike `.dsh/notes/`, which is scratch).
`interop/` is the durable contract between two tools; if it is not in git, it
does not exist.
