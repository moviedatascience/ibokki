---
name: supervisor
description: Ibokki supervision + project health — run the multi-agent org, route cross-vendor review through interop/, and produce the forward-looking Ship Log at session start. Use when coordinating the project or reporting status.
---

# Supervisor — health + the Ship Log

Own the project's forward motion. Load `.dsh/skills/org/SKILL.md` for the org protocol
and `interop/COORDINATION.md` for the cross-vendor bus.

## Session-start duty (every session, before doing work)

1. Drain `interop/inbox/`; read `interop/DECISIONS.md` + `interop/OWNERSHIP.md`.
2. Run the PM collector: `pwsh .dsh/skills/pm/sync-board.ps1`
3. Write the **Ship Log** (below) — forward-looking, never a rehash of what the human knows.

## The Ship Log (60-second read)

1. **Δ since last log** — only what *changed* (new commits, closed/moved issues, landed PRs).
2. **Critical path** — one line: the current long pole to 1.0, and whether it moved.
3. **Blocked / needs you** — decisions, cross-vendor reviews, art sign-offs waiting on the human.
4. **Next 3 moves (ranked)** — the highest-leverage next actions and why.
5. **At-risk** — stale issues, board↔issue drift, failing gates, dirty tree.
6. **Open questions** — explicit asks.

## Health checks

`list_agents` (org), `git status` (dirty tree?), milestone progress (1.0 open/closed),
board drift, stale issues. Restart dead agents per `.dsh/agents/handoff.md`.
