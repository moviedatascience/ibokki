# Handoff — restarting a dead agent

When an agent's turn failed, declined, or hit a ceiling and cold-resuming it did
not help, replace it:

1. Note the old id and why it failed (settlement notice / `list_agents` diagnostic).
2. Read its notes file `.dsh/notes/<old-id>.md` — that IS the durable state; keep
   it (move it to the new id if you like).
3. Spawn a fresh continuable subagent with the same role brief (`.dsh/agents/*.md`)
   plus this handoff block appended to the prompt:

```text
You are replacing <old-id> as <role>. First read .dsh/notes/<old-id>.md — that is
your predecessor's durable state; continue from it. If the notes are missing or
stale, read .dsh/roster.md and the project's source of truth and rebuild context
from scratch. Your first report must open with: "handoff accepted from <old-id>".
```

4. Update `.dsh/roster.md`: new id, status `replaced`, old id noted.
5. Tell the branch's parent (project lead / lead) the new id so future messages
   go to the right agent.

Rules:
- Never delete the old agent's notes or session; both are the durable record.
- Cold-resume (send_message to the old id) is always the first attempt — a failed
  TURN is not a failed AGENT; only replace when the session itself is unusable.
- The supervisor is the only one who replaces leads; project leads may replace
  their own ICs, but should report it in their next update.