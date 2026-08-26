# Day-one bootstrap

Paste the block below into your main supervisor session (the one running the
`lead` preset) exactly once. It boots the whole pilot org and records ids.

```text
Read .dsh/README.md, .dsh/roster.md, and every file in .dsh/agents/. Then bootstrap
the org, in this order:

1. Spawn Lead-Builder as a continuable background subagent (model deepseek-v4-pro,
   prompt = the full content of .dsh/agents/lead-builder.md).
2. Spawn Lead-Auditor as a continuable background subagent (model deepseek-v4-pro,
   prompt = the full content of .dsh/agents/lead-auditor.md).
3. Tell Lead-Builder (send_message) to spawn the ibokki Tech-Lead as its own
   continuable child (model deepseek-v4-pro, prompt = .dsh/agents/project-lead.md
   with track=engineering) and to confirm the child's id.
4. Tell Lead-Auditor to spawn the ibokki QA/Balance-Lead the same way (track=qa).
5. Tell each project lead to spawn its ICs as continuable children (model
   deepseek-v4-flash, prompt = .dsh/agents/ic.md with the track and specialty
   filled in): tech → ic-engine, ic-client, ic-content; qa → ic-playtest, ic-balance.
6. Record every durable id in .dsh/roster.md as it appears (you own that file).
7. When the tree is up, report back: the org chart with ids, each agent's first
   message, and any spawn that failed (then retry once per handoff.md before
   flagging it to me).
```

## What you should see afterwards

- `roster.md` with real ids in every `_spawn_` slot.
- Each lead has sent an initial status report.
- Your daily interaction is just: nudge the leads (send_message), let them fan out
  to project leads and ICs, read their reports. See `.dsh/README.md` → Daily routine.

## Re-bootstrapping after a wipe

If the org is gone (fresh machine / sessions cleared): re-paste the block. Agents
cold-resume by id only if their sessions still exist; otherwise they start fresh
from the briefs. Their durable work lives in git (code) + `.dsh/notes/` (scratch),
so a full rebuild loses only chat history.