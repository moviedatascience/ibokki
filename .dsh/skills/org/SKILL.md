---
name: org
description: Ibokki multi-agent org playbook — roles, messaging protocol, report format, restart rules. Load when acting inside the org (supervisor, lead, project lead, or IC).
---

# Org playbook

The development org is a tree of **continuable subagents** rooted at the supervisor
session (the human's daily driver). Load `.dsh/README.md` for the full guide;
this skill is the compressed protocol.

## Roles

| Role | Parent | Model | Job |
|---|---|---|---|
| Supervisor | — (the session) | pro | Spawn/nudge/review/restart the org; the only router between branches |
| Lead-Builder | supervisor | pro | Shipping + engineering across projects; owns project leads |
| Lead-Auditor | supervisor | pro | Quality, balance, production health; audits Builder's work |
| Project Lead | a lead | pro | One track of one project (tech or PM/QA); owns the ICs |
| IC | a project lead | flash | One task brief, autonomously; generalist or specialist |

## Protocol

- **Message down** with `send_message` (one FIFO turn per message); children
  **report up**; the parent is notified when a child settles.
- **No sibling messaging.** Leads review each other's reports; findings go through
  the supervisor, which relays and acts.
- **Restart:** supervisor checks `list_agents` on every prompt; a dead agent is
  cold-resumed via `send_message` (session persists) or replaced per
  `.dsh/agents/handoff.md` (notes file + fresh spawn).
- **Models:** pro for leads/project leads, flash for ICs — pin at spawn.

## Report format (4 lines)

```
Status: done | blocked | in-flight (what, since when)
Deliverable: path / PR / playtest file / evidence
Ask: what you need from your parent
Risk: anything off the rails (omit when none)
```

## Files

- `.dsh/roster.md` — live ids/statuses (supervisor owns; agents never edit it)
- `.dsh/agents/*.md` — spawn briefs (role definitions; `pm-lead.md` is the PM track)
- `.dsh/skills/pm/` — project-manager skill: reconcile codebase ↔ board ↔ issues
- `.dsh/notes/<agent-id>.md` — gitignored scratch state so a replacement can continue
- `.dsh/bootstrap.md` — day-one boot prompt

## Game-specific doctrine (from CLAUDE.md)

- Bot winrates are **lower bounds**, never balance targets; any edge ≥ ~90%
  triggers a 3-game piloted series **before** design action (pilot-gap doctrine).
- Piloted playtest series always run on cheap flash subagents, never on the main
  session model.
- Engineering done means `npm run typecheck && npm test` passes.