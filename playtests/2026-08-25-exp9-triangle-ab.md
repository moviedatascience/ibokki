# exp-9 A/B triangle — branch vs main (2026-08-25)

Paired-seat greedy/greedy, horizon 2, `-n 30`, seeds 100/200/300 (the 07-27
repro convention — but horizon 2, so NOT comparable to 07-27's horizon-1
numbers). A/B: main @ 1b6b053 (exp-8) vs `claude/exp9-evo-tune-ledger-hud`
@ b6dac99 (exp-9 implemented in engine + regenerated cast priors).

```sh
npm run sim -- -n 30 --s1 Evocation  --s2 Abjuration --p1 greedy --p2 greedy --paired --cards --seed 100
npm run sim -- -n 30 --s1 Divination --s2 Abjuration --p1 greedy --p2 greedy --paired --cards --seed 200
npm run sim -- -n 30 --s1 Evocation  --s2 Divination --p1 greedy --p2 greedy --paired --cards --seed 300
```

| Matchup (seed) | main (exp-8) | branch (exp-9) | Δ |
|---|---|---|---|
| Evo vs Abj (100) | **Abj 63.3%** (19–11), 12.33 r | **Evo 53.3%** (16–14), 12.33 r | +16.6 pts Evo — the moved leg |
| Div vs Abj (200) | Abj 73.3% (22–8), 16.80 r | Abj 73.3% (22–8), 16.80 r | 0 — bit-identical replay |
| Evo vs Div (300) | Evo 100% (30–0), 5.60 r | Evo 100% (30–0), 5.53 r | ~0 — saturated |

## Reading

- **Evo vs Abj is the only moved leg.** Design intent (Abj > Evo) held at bot
  level on main (63.3%); the exp-9 damage bumps + Mana Burn scope leveled it to
  a statistical coin flip (53.3% Evo, n=30, ±~9 pts). The intended Abj edge is
  gone at bot level. Per the pilot-gap doctrine these are lower bounds — read
  as "even, direction unproven", not "Evo now favored".
- **Div/Abj bit-identical** both sides (same seeds, no Evo cards in the
  matchup): confirms the A/B isolates the Evo changes — nothing else moved.
- **Evo/Div 100% is a STANDING flag, not an exp-9 effect** (100% on both
  sides; right direction, degenerate magnitude; ledger-era pilots visited the
  leg in m40–m44). Unchanged by this branch.
- **Stoke (EVO-006):** 5 casts/30 games vs Abj, 2/30 vs Div; derive-priors
  drops it below the 0.3 floor (no prep prior) — possible bot blind spot.
  Baseline note: Kindle, the card it replaced, was NEVER cast in 30 baseline
  Evo/Abj games ("L1 never seen"), so the rework at minimum buys expression.
  `--force EVO-006` vs same-seed baseline is the next instrument if a verdict
  is needed. Its engine effect is a SIMPLIFIED auto-pick (most-recent
  V-providers), flagged in `evocation.ts`.
- Branch Evo/Abj card lines: Fireball 78 casts @ 56% WR-used, Inferno Lance
  73 @ 52%, Mana Burn 30 reactions @ 63% WR-used, 23% cancel rate.

## 2026-09-01 — review follow-up (`interop/reviews/exp9-evo-tune-ledger-hud.md`, items 1–2)

### Item 2 — cast-priors confound: measured, contribution = 0

Same command as the Evo/Abj row above, run on the branch's engine + cards but
with `packages/sim/data/cast-priors.json` held at the `main` (1b6b053) version:

```sh
git show main:packages/sim/data/cast-priors.json > packages/sim/data/cast-priors.json
npm run sim -- -n 30 --s1 Evocation --s2 Abjuration --p1 greedy --p2 greedy --paired --cards --seed 100
```

| Priors on branch code | Result | Avg rounds | Fireball / Lance casts · Mana Burn reactions (cancel%) · Stoke casts |
|---|---|---|---|
| branch (regenerated) | Evo 53.3% (16–14) | 12.33 | 78 / 73 · 30 (23%) · 5 |
| **main (held)** | **Evo 53.3% (16–14)** | **12.33** | **78 / 73 · 30 (23%) · 5** |

Bit-identical replay: not one greedy decision changed across the 30 paired
games. The priors that moved changed no decision: EVO-034/-040/-041/-045/-046
(all L3–L4) sit far enough past a 12-round game's usual reach that the bots never
took a different branch, and EVO-006 (Stoke, dropped below the 0.3 floor) was cast
5 times either way — greedy's simulation, not its prep prior, is what reaches it.
The entire +16.6 pt Evo/Abj swing is the card changes; the A/B's A and B bots
differ in effect only by the cards.

### Item 1 — piloted Evo-vs-Abj series on the branch (m56–m58): **Abjuration 3–0**

Three games, Abjuration seat piloted (`pilot` agent, sonnet/medium), Evocation =
greedy bot, on the branch's engine + cards (MCP server restarted on the branch;
`card EVO-017` read 6 before play). Evocation had the first seat in two of the
three — its best case and the m34–m36 seating.

| Match | Seats | Seed | Result | HP Abj / Evo | Decisive line |
|---|---|---|---|---|---|
| m56 | Evo P0 (bot) vs **Abj P1** | 9101 | Abj, R12 | 3 / −23 | Stance→Shell→Fortify loop banked nine rounds of chip; Reckoning cashed 20 (R10) then 24 (R12). The close one: a Dispelling Powder sniped the ward ahead of a cold Wrath of the Mage. |
| m57 | **Abj P0** vs Evo P1 (bot) | 9102 | Abj, R10 | 28 / 0 | Ward grew to 11 HP by R10; Tithe rebuilt after Powder; Overcharge on a 9-HP ward = 18 into exactly 18. Never below 23 HP; Absorb armed R5→end, never needed. |
| m58 | Evo P0 (bot) vs **Abj P1** | 9103 | Abj, R10 | 27 / −6 | Fortify + Ward Pulse soaked everything; Reckoning cashed a 56-point bank for 28 in one cast. No reaction ever fired. |

Transcripts: `playtests/2026-09-01-m56-Evocation-vs-Abjuration.md`,
`…-m57-Abjuration-vs-Evocation.md`, `…-m58-Evocation-vs-Abjuration.md`.

**Reading.**

- **The documented leg holds in piloted hands, comfortably.** The piloted record
  on Evo/Abj was already Abj 8–0 before exp-9 (m8/m9/m28–m30 Abj-piloted 5–0;
  m34–m36 bot-Abj over Evo-piloted 3–0); exp-9 leaves it 11–0. Two of three were
  R10 blowouts; m56 was close on Abj's life only through a seat-parity hole
  (whichever side acts first in a round lands one "cold" full-damage hit before
  Stone Stance is back up), not through the +1s.
- **Why the +1s don't reach a piloted Abj.** Stone Stance's flat −2 is recast
  every round and applies before ward routing, so the buffed Fireball/Lance land
  as 4/3 (was 3/2): one point more per hit into a wall the pilots simply sized one
  point larger, and one point more into the bank per soak. Reckoning (`ceil(prevented/2)` — a read,
  not a spend, by design: m35, m45–m50) is blind to the buffs and if anything
  profits from bigger hits into a fed wall.
- **Why the bots leveled the leg.** Greedy-Abj neither recasts Stance every round
  nor sizes wards to the post-Stance number; greedy-Evo casts chip into a growing
  wall instead of holding burst and (m56) passed two turns at 1 HP with lethal on
  board. These are the blind spots m34–m36 and m45–m50 already catalogued. The
  63% → 53% move is a bot-competence artifact of exactly the kind the pilot-gap
  doctrine predicts: the buffs move Evo against the bot's brittle Abj, not
  against the school's ceiling. Reading of the two instruments together:
  bot-level *even* + piloted *3–0* = the leg is Abj-favored with Evo now less
  hopeless in weak hands, which is the tune's intent.
- **Stoke / Mana Burn expression.** Stoke was never prepped by the bot in three
  piloted games. Mana Burn was prepped from R6 in m57 (never found an M-cost
  target — the pilots' kill lines were S/V-only Overcharge/Reckoning) and fired
  once in m56 — at Stone Stance (SS), no cancel, 2 damage. The widened *Reaction*
  clause was never exercised; a follow-up piloted game with an Abj pilot leaning
  on M-cost spells (Ritual Ward / Backlash / Final Reckoning) would test it.
- **Pilot flags for the record (none are exp-9 regressions):**
  1. *Mana Burn targets anything.* Engine: `if (targetRequiresSymbol("M"))
     cancelTarget(); dealDamage(2)` (`effects/evocation.ts:125`). The M clause
     gates only the cancel; the reaction may be aimed at a non-M spell as a
     2-damage instant ping. That is what the 30-game bot line means (30
     reactions, 23% cancel = 77% pings). Pre-exp-9 code, unchanged by this
     branch — but a design question for DS/the human: is the print a targeting
     restriction ("target … that requires M") or a conditional rider? If the
     former, the engine is a proxy-condition stand-in of the historical live-bug
     kind and Mana Burn is stronger than its text.
  2. *Seat parity:* one cold full-damage hit per round before Stance is back up
     — a structural tempo cost of the −2-per-round design, felt harder now that
     the cold hit is 6.
  3. *Reactions must be pre-armed on a prior main phase*, so "holding" Absorb is
     a multi-turn component tie-up (m57 held it R5→end unused).

### Non-blocking items 3–5 (from the review)

- **3. Stoke's SIMPLIFIED auto-pick** is already filed as known debt on the board:
  issue #3 ("Close remaining SIMPLIFIED/DEFERRED riders") names EVO-006's
  auto-pick explicitly — promote to a `pendingChoice` or accept with rationale.
- **4. m54/m55 transcripts** are unrecoverable: the two pilots (played between m53, 2026-08-19, and the 2026-08-25 branch) that
  motivated the prevention-ledger HUD were never `save_playtest`-ed and their
  sessions are gone. The HUD change stands on its own (surfaces an already-public
  redacted field); the motivating anecdote is recorded here as such, not as
  evidence. m56–m58 now give the HUD its evidence anyway: every game was decided
  by a Reckoning/Overcharge cash-out of a bank the losing side could not see.
- **5. Evo/Div 100%** — standing degenerate edge, pre-dates exp-9, unchanged by it;
  the canonical ≥90% doctrine trigger for a later series.

### `--force EVO-006` probe (the review's secondary ask): no blind spot; the forcing overshoots

Same seed, branch code + branch priors, greedy biased toward Stoke:

| Run | Result | Avg rounds | Stoke casts / 30 games | Fireball / Lance casts |
|---|---|---|---|---|
| baseline (branch) | Evo 53.3% (16–14) | 12.33 | 5 | 78 / 73 |
| `--force EVO-006` | **Evo 13.3% (4–26)** | 13.27 | **288** (95% resolve, 4% cancelled) | 66 / 82 |

Reading per the blind-spot plan (`2026-07-29-blindspot-plan.md`: winrate up = bot
undervaluation, flat = real verdict): this is neither — it is *down* 40 pts,
because forcing an **enabler** makes greedy loop it (≈10 casts a game) and every
Stoke spends the turn's cast on recursion instead of damage. It does not show
Stoke undervalued at the baseline's 5 casts; it shows V-recursion is only worth a
cast slot when V components are the binding constraint, which in these decks
they were not (the m56 pilot saw the same from the other seat: "the bot never
needed V recursion, it kept drawing fresh components"). Verdict: Stoke's thin
expression is a real card read, not a bot artifact — leave its magnitude alone
until a piloted Evo seat wants it. Instrument note for the plan: `--force`
over-fires on enablers; a per-round-capped force would read them.
