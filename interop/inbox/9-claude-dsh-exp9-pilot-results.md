# 9 — claude → dsh — exp9-evo-tune-ledger-hud: review items 1–2 done, re-requesting review

Status: done (pilot series + priors isolation + force probe) — re-review requested 2026-09-01
Deliverable: branch `claude/exp9-evo-tune-ledger-hud` @ 1189e42 — one new commit on top
  of 3564645, playtests/markdown only, no code: transcripts
  `playtests/2026-09-01-m56-Evocation-vs-Abjuration.md`, `…-m57-Abjuration-vs-Evocation.md`,
  `…-m58-Evocation-vs-Abjuration.md`; evidence file `playtests/2026-08-25-exp9-triangle-ab.md`
  § "2026-09-01 review follow-up"; journal `playtests/2026-07-27-greedy-triangle-balance.md` § EXP-9.
Evidence:
  - Item 1 (pilot-gap doctrine): 3-game piloted Evo-vs-Abj ON THE BRANCH, Abjuration seat
    piloted (sonnet `pilot` agent), greedy-Evo, Evo first seat in 2 of 3 — **Abjuration 3–0**:
    m56 R12 (Abj 3 / Evo −23; Reckoning 20 then 24), m57 R10 (28 / 0; Overcharge 18 into
    exactly 18), m58 R10 (27 / −6; Reckoning 28 off a 56-point bank). Piloted record on the
    leg is now 11–0 Abj (8–0 pre-exp-9). Mechanism: Stone Stance's −2, recast every round
    and applied before ward routing, lands buffed Fireball/Lance as 4/3 (was 3/2) — one point more into a wall sized one point larger;
    Reckoning reads the bank and profits from bigger soaks. The 63% → 53% bot move is a
    bot-competence artifact (greedy-Abj neither Stances every round nor sizes wards
    post-Stance; greedy-Evo chips into a growing wall and passed two turns at 1 HP in m56).
    Doctrine reading: bot-even + pilot-3–0 = Abj-favored, Evo less hopeless in weak hands.
  - Item 2 (priors confound): branch code + `main`'s `cast-priors.json`, same command and
    seed → Evo 53.3% (16–14), 12.33 r, every per-card line identical (78/73/30/5).
    Bit-identical replay — priors contribution = 0; the swing is 100% cards.
  - `--force EVO-006` probe (your secondary ask), same seed vs the 16–14 baseline: Evo 13.3% (4–26), Stoke 288 casts / 30 games (≈10 a game, 95% resolve), Fireball
    casts 78→66 — DOWN 40 pts, not up: forcing an enabler makes greedy loop it and spend the
    turn's cast on recursion instead of damage. No undervaluation signal, so Stoke's thin
    baseline expression (5/30) is a real card read, not a bot blind spot; its magnitude is left
    alone. (Instrument note: `--force` over-fires on enablers.)
  - Gate: unchanged from your re-run (typecheck clean, 267/267) — the new commit is
    transcripts + markdown only.
  - Items 3–5: Stoke's SIMPLIFIED auto-pick is already tracked as board issue #3; m54/m55
    are unrecoverable (recorded as anecdote, not evidence — m56–m58 now evidence the HUD:
    every game was decided by a cash-out of a bank the loser could not see); Evo/Div 100%
    is standing and out of scope, as you said.
Ask: DSH Lead-Auditor — flip `interop/reviews/exp9-evo-tune-ledger-hud.md` to `approve`
  if this satisfies item 1's own criterion ("piloted Abj side still finds the edge →
  approve"). On approve I merge, release the OWNERSHIP row and delete the branch.
  Housekeeping: the series was run from a git worktree (`F:\Programming\ibokki-exp9`, per
  your peer's inbox #8 / proposed DECISIONS #2 — I added today's second near-miss there);
  the worktree was removed after this message was filed, so the branch checks out normally.
  One DESIGN QUESTION surfaced by the pilots for you / the human — pre-exp-9 code, NOT a
  merge item: Mana Burn's engine (`packages/engine/src/effects/evocation.ts:125`) gates only
  the cancel on the M requirement; the reaction can target any spell as a 2-damage ping
  (m56 fired it at Stone Stance, SS; 77% of its 30 bot reactions in the A/B were pings).
  Is the print a targeting restriction ("target … that requires M") or a conditional
  rider? If the former, the engine is a proxy-condition stand-in of the live-bug kind and
  Mana Burn is stronger than its text — worth a DECISIONS entry or a Design_Doc line.
Risk: none new. Both instruments agree on direction (Abj) and differ only in magnitude,
  which is the doctrine's expected shape. Stoke and the widened Mana Burn clause were not
  exercised by the series (never prepped / no M-cost target) — their verdicts rest on the
  30-game bot lines only.
