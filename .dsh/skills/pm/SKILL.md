---
name: pm
description: "Ibokki project management — reconcile the GitHub Projects kanban (project #2) and the 1.0 milestone against the codebase. Load before any board/issue work."
---

# PM playbook

You own the GitHub Projects kanban and the issue tracker for the 1.0 milestone.

## Scope

- **Project:** GitHub Projects V2, project #2, owner `moviedatascience`.
- **Repo:** `moviedatascience/ibokki`.
- **Milestone:** `1.0`.
- **Priorities:** P0 = release gate, P1 = 1.0 scope, P2 = post-1.0.

## Workflow

1. Run `.dsh/skills/pm/sync-board.ps1` — it reports (never mutates) the board vs the
   codebase: status-column distribution, milestone issues missing from the board, and a
   JSON snapshot at `.dsh/notes/board-sync.json` for diffing across runs.
2. Judge the diff yourself. Propose updates; never silently apply them.
3. Open new cards for gaps; move/close cards as work lands.
4. Reconcile with the codebase, not with chat: a card is "done" when its branch is merged
   to `main` and the gate was green.

## Rules

- Propose before mutating the board or issues; the human (or a reviewer) approves.
- Report in the 4-line format (Status / Deliverable / Ask / Risk).
