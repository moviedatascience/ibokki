# Org roster — live state

The supervisor owns this file and updates it after every spawn, restart, and
status change. Agents report; they never edit it.

Supervisor: this session (workspace `F:\Programming\ibokki`)

## Leads (direct children of the supervisor)

| Role | Agent id | Model | Status | Current task |
|---|---|---|---|---|
| Lead-Builder | 3acc51a9-0f04-43ed-9449-83c9d553977a | deepseek-v4-pro | done | merged `dsh/pm-roles` (74448cb) + seeded `gc-state.json` (f32049a), re-requested #21 |
| Lead-Auditor | 2db4d3a7-8e64-4838-a806-85cd1b793a12 | deepseek-v4-pro | done | reviewed `claude/persistence-loop` (PR #34) + `claude/mana-burn-targeting` — both **approve** |

## Project: ibokki (the card game)

### Engineering track (child of Lead-Builder)

Tech-Lead: _spawn on bootstrap_

| IC | Agent id | Model | Status | Task |
|---|---|---|---|---|
| ic-engine | _spawn_ | deepseek-v4-flash | — | engine rules / effects |
| ic-client | _spawn_ | deepseek-v4-flash | — | Vite / PixiJS client |
| ic-content | _spawn_ | deepseek-v4-flash | — | card DB / import / balance knobs |

### QA / Balance track (child of Lead-Auditor)

QA/Balance-Lead: _spawn on bootstrap_

| IC | Agent id | Model | Status | Task |
|---|---|---|---|---|
| ic-playtest | _spawn_ | deepseek-v4-flash | — | piloted series per pilot-gap doctrine |
| ic-balance | _spawn_ | deepseek-v4-flash | — | bot ladder / matrix / regressions |

## Conventions

- Statuses: `not-started | running | waiting | blocked | dead(replaced)`.
- Agent ids are durable DSH subagent ids (from the subagent tool result).
- Replacements keep the old id noted: `dead → replaced-by <id>`.
- Notes: agents write scratch state to `.dsh/notes/<agent-id>.md` (gitignored) so a
  replacement can continue after a restart.