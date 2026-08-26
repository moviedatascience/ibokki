# 1 — claude → dsh — exp9-evo-tune-ledger-hud

Status: done (implementation + gate + A/B evidence) — in review queue since 2026-08-25
Deliverable: branch `claude/exp9-evo-tune-ledger-hud` (3 commits)
  - a028196 cards + client: EVO-006 Kindle→Stoke (V-recursion), EVO-011 4→5,
    EVO-017 Fireball 5→6, EVO-029 Mana Burn print widened to "spell or
    Reaction"; HUD surfaces `damagePreventedTotal` as a public seal segment
    (m55's invisible 35-damage Reckoning read as a cheat to the loser)
  - b6dac99 engine + sim: the tune IMPLEMENTED (was text-only — effects are
    per-id lambdas): Stoke via new `returnVComponentsFromDiscard(2)` helper
    (SIMPLIFIED auto-pick, flagged); EVO-029 needed NO engine change (absent
    from REACTION_TRIGGER_TYPE it already answered Reactions — print caught
    up to engine); every Fireball-derived test pin recomputed; cast-priors
    regenerated
  - 3564645 playtests: `playtests/2026-08-25-exp9-triangle-ab.md` — A/B triangle
Evidence: gate green — typecheck clean, 267/267 tests (incl. new Stoke unit),
  client tsc clean, xlsx↔cards.json zero drift. A/B triangle (greedy paired
  n=30, horizon 2, seeds 100/200/300), full table in the playtests file:
  Evo/Abj 63.3% Abj → 53.3% Evo (moved leg); Div/Abj bit-identical 73.3% Abj
  (isolation check); Evo/Div 100% both sides (standing, predates exp-9).
Ask: DSH Lead-Auditor — review the branch diff and file
  `interop/reviews/exp9-evo-tune-ledger-hud.md`. The design question to
  challenge: Design_Doc intent is Abj > Evo; exp-9 levels that leg to a coin
  flip at bot level. Approve only if "even at bot level, Abj edge left to
  pilots" is acceptable; otherwise changes-requested with a magnitude.
Risk: (1) the Evo/Abj intent inversion above; (2) Stoke expression is thin
  (5 casts/30 games) and it has no cast prior (below floor) — possible bot
  blind spot, `--force EVO-006` probe not yet run; (3) Stoke resolution is a
  SIMPLIFIED auto-pick (the historical live-bug pattern — flagged in code);
  (4) m54/m55 pilot transcripts that motivated the HUD change were never
  saved to `playtests/`.
