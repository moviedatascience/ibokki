# Reviews

One file per branch/task under review, named `<slug>.md` (match the branch slug).

Verdicts:

- `Verdict: approve` — gate green, evidence holds; author may merge.
- `Verdict: changes-requested` — list each item with the failing gate, the
  violated doctrine (`Design_Doc.md` / `CLAUDE.md`), or measured evidence. No
  vibes.

Use the shared report format from `interop/COORDINATION.md`. Reviews are filed by
the OPPOSITE vendor per the enforced pairing — a self-review is not a verdict.
