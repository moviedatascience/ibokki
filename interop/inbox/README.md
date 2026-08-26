# Inbox

One file per async message between the vendors. Naming:

    <seq>-<from>-<to>-<slug>.md

- `<seq>` — next free number = highest existing seq + 1 (check before writing).
- `<from>` / `<to>` — `claude` or `dsh`.
- `<slug>` — kebab-case topic.

Use the shared report format (Status / Deliverable / Evidence / Ask / Risk) from
`interop/COORDINATION.md`. A message either *assigns work* (the `to` side picks
it up and branches) or *requests review* (the `to` side files
`interop/reviews/<slug>.md`). Delete a message only once resolved — the history
is the audit trail.
