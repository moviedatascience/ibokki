# Ibokki org on DeepSeek Harness — daily driver

This is the DeepSeek Harness (DSH) mirror of the multi-agent setup used on Claude:
two lead agents that keep each other accountable and restart each other, delegating
to per-project tech-lead / PM agents, each with 5–10 IC agents working autonomously.
Everything communicates through the message tools (DSH's `send_message` / reports).

## The tree (pilot: one project, ibokki)

```
You — this session, `lead` preset = the SUPERVISOR (daily driver)
│
├── Lead-Builder ............ deepseek-v4-pro   (continuable subagent)
│   └── ibokki Tech-Lead .... deepseek-v4-pro   (child of Lead-Builder)
│       ├── ic-engine ....... deepseek-v4-flash
│       ├── ic-client ....... deepseek-v4-flash
│       └── ic-content ...... deepseek-v4-flash
│
└── Lead-Auditor ............ deepseek-v4-pro   (continuable subagent)
    └── ibokki QA/Balance-Lead  deepseek-v4-pro (child of Lead-Auditor)
        ├── ic-playtest ..... deepseek-v4-flash   (piloted playtest series)
        └── ic-balance ...... deepseek-v4-flash
```

The supervisor is the root. Leads are its direct children; project leads are the
leads' children; ICs are the project leads' children.

## Standalone role presets (outside the org tree)

Separate from the org, four single-session role presets run as focused specialists
with their own skills, picked from the GUI session picker: `pm`, `engineer`,
`designer`, and `qa` — each loads its matching `.dsh/skills/<role>/` skill. `lead`
is the supervisor (org root) and `ic` is a standalone contributor session; both load
the `org` skill. The designer's `art` skill is a shim that delegates to the
canonical `.claude/skills/art/SKILL.md`.

## DSH mechanics — the honest mapping

- **Messaging is a strict parent↔child tree.** An agent `send_message`s its direct
  children (each message = one FIFO turn) and children report up; the parent is
  notified when a child settles. **Siblings cannot message each other**, so the
  two leads review each other's reports and the supervisor relays — the supervisor
  is the only router between branches.
- **Agents are durable.** Sessions persist to disk (`~/.dsh/sessions`, jsonl);
  continuable subagents cold-resume from their saved session. A task that outlives
  one turn keeps going because the project lead nudges the IC and the IC keeps
  state in `.dsh/notes/`. This is what "works autonomously for 2–3 days" means
  here: work happens when messaged, the whole tree stays alive between your prompts,
  and no restart of DSH loses it.
- **Restart = supervisor-on-prompt.** On every prompt, the supervisor reads
  `roster.md`, checks `list_agents`, and cold-resumes or replaces any dead
  agent per `agents/handoff.md`. Your 30–50 daily prompts are the heartbeat.
- **Roles = two layers.** Session-level *presets* (`~/.dsh/.agent-presets/`, picked
  per session in the GUI) give the supervisor its persona and tool set. Role
  *briefs* (`.dsh/agents/*.md`) are the prompt templates the supervisor feeds to
  each spawned agent — the `.claude/agents/` equivalent. Children inherit the
  parent's preset, so role flavor comes from the brief.
- **Models.** Leads and project leads: `deepseek-v4-pro`. ICs: `deepseek-v4-flash`.
  Pinned at spawn time (subagent `model` option), mirroring the sonnet/cheap-IC split.

## Report format (every role, every report)

Four lines, no prose:

```
Status: done | blocked | in-flight (what, since when)
Deliverable: path / PR / playtest file / evidence
Ask: what you need from your parent
Risk: anything off the rails (omit when none)
```

## Daily routine (30–50 prompts, 60/35/5)

1. **Morning / health check (~60%)**: "Health check" → read `roster.md`,
   `list_agents`, nudge both leads, relay their cross-reviews, restart anything dead.
2. **Project traffic (~35%)**: message leads / project leads about specific work
   ("Lead-Builder: status on the engine refactor" → it checks its branch).
3. **Off the rails (~5%)**: `interrupt_agent` a runaway turn, `job_kill` stray
   background jobs, handoff-restart a failed agent, escalate to the human.

## Day one

Paste `.dsh/bootstrap.md` into this session once. It spawns both leads, their
project leads, and the five ICs, and records every durable id in `roster.md`.

## Cost notes

- Pro models are for decisions (leads, project leads, reviews).
- Flash models are for leaf work (ICs, playtest pilots) — see the pilot-gap
  doctrine in `CLAUDE.md`: playtest series always run on cheap subagents, never
  on the main session model.

## Cross-vendor collaboration (Claude Code ↔ this org)

This DSH org and the human's Claude Code session share ONE repo and coordinate
through **git + `interop/`** — the async bus; the human is the router. The full
protocol lives in `interop/COORDINATION.md` and binds both sides equally.

Supervisor duty on every prompt: alongside `roster.md` + `list_agents`, also
drain `interop/inbox/` and relay cross-vendor requests (a Claude review request
→ hand to Lead-Auditor; Lead-Builder output → route to Claude).

Rules this org must honor:
- **Branch-per-task:** DSH work lands on `dsh/<slug>` branches, gate green
  (`npm run typecheck && npm test`) before review, merge to `main` only after
  Claude approves.
- **Enforced pairing:** Lead-Builder output is reviewed by **Claude**; this
  org's **Lead-Auditor** reviews Claude's builder output. Self-review is not a
  verdict.
- **Decisions:** disagreements resolve in `interop/DECISIONS.md`; cite the number.
- One repo, one truth: `F:\Programming\ibokki`.

## Files

| Path | What it is |
|---|---|
| `.dsh/roster.md` | Live org state — durable ids, statuses, current tasks (supervisor owns it) |
| `.dsh/agents/` | Spawn briefs — the role definitions (lead-builder, lead-auditor, project-lead, ic, handoff) |
| `.dsh/skills/` | Role skills: `org`, `engineer`, `art` (shim → `.claude/skills/art`), `qa`, `pm` (+ `pm/sync-board.ps1`) |
| `.dsh/agent-presets/` | Preset templates (`lead`, `ic`, `engineer`, `designer`, `pm`, `qa`), synced to `~/.dsh/.agent-presets` by `sync-presets.ps1` |
| `.dsh/notes/` | Gitignored scratch state written by agents so a replacement can continue |
| `.dsh/bootstrap.md` | Day-one prompt that boots the whole org |
| `interop/` | Cross-vendor bus — `COORDINATION.md` (protocol), `DECISIONS.md`, `OWNERSHIP.md`, `inbox/`, `reviews/` |