# Balance triangle — first strong-bot measurement (2026-07-27)

30 paired-seat games per matchup, GreedySimBot both sides (post retract/detach-valve fixes).
Deterministic repro:

```sh
npm run sim -- -n 30 --s1 Evocation  --s2 Abjuration --p1 greedy --p2 greedy --paired --cards --seed 100
npm run sim -- -n 30 --s1 Divination --s2 Abjuration --p1 greedy --p2 greedy --paired --cards --seed 200
npm run sim -- -n 30 --s1 Evocation  --s2 Divination --p1 greedy --p2 greedy --paired --cards --seed 300
```

(The seed-200 run also flushed out and fixed a live engine crash: recast spells —
DIV-027/037/045 — could copy themselves and recurse until stack overflow. Copy-spells
are now never eligible recast targets; see `RECAST_SPELLS` in `cardFlags.ts`.)

## Results vs design intent

| Matchup | Result | Avg rounds | Design intent | Verdict |
|---|---|---|---|---|
| Evo vs Abj | **30–0 Evo** | 8.4 | Abj > Evo | INVERTED, maximally |
| Div vs Abj | **25–5 Abj** | 20.5 | Div > Abj | INVERTED |
| Evo vs Div | **30–0 Evo** | 5.2 | Evo > Div | right direction, degenerate magnitude |

**There is no triangle. The actual order is strictly linear: Evo > Abj > Div.**

## What the card telemetry says

### Evocation: L1 throughput is the apex problem
Firebolt (115 casts/30 games) + Searing Word (138) ≈ 8 cheap burn casts per game.
Abjuration's whole kit WORKS against it — Absorb fired 45×, Phase Shift 25×, wards all
resolve — and still went 0–30: sustain-per-round simply loses to spam-per-round. The bot
even adapts lines (Hex Bolt 78 casts vs reactive Abj, 6 vs reaction-light Div), so this
is arithmetic, not piloting. First nerf candidates: L1 burn rate (cost/damage on the
cantrips) or systemic cast pacing — NOT point-buffs to individual Abj cards.

### Abjuration: fine in the long game, dead before its curve vs aggro
vs Div (20-round games) its late kit comes alive: Aegis Eternal 50 casts, Ward Eternal 66,
Final Reckoning 21 (100% WR-used — the actual win condition). Abj's only problem is
surviving rounds 1–5 against Evo's cantrip volume.

### Divination: the engine churns, the win conditions underdeliver
Massive card flow (Unbind 118 casts, Reclaim 114, Foreclosure 108, Seek 79) yet 5–55
combined. Dooms are too slow or answered: Oblivion 31% WR-used, Entropy cancelled 40% of
casts (Abj counters it on sight). vs Evo, games end (round ~5) before the doom clock
matters at all.

### Dead cards (prepared repeatedly, cast ~never — rework or recost)
| Card | Evidence across runs |
|---|---|
| Stone Stance [ABJ-005] | 90 preps, **0 casts** in all three matchups |
| Foresight [DIV-002] / Divine [DIV-003] | 60 preps each, **0 casts** |
| Augury [DIV-004] | 60 preps, 2 casts |
| Absolute Defense [ABJ-039] | 30 preps, 0 casts (even in 20-round games) |
| Meteor [EVO-032] | ~18 preps, ≤1 cast — L4 cost never assembled |
| Aegis [ABJ-004] | 60 preps, 10 casts |
| Interrupt [ABJ-013] | ~57 preps, ~9 fires |

Stone Stance being universally dead makes it the free rework slot — e.g. an explicitly
anti-cantrip early tool, which is also exactly the hole in Abj-vs-Evo.

### Metric sanity check
Arcane Study — the one card in every deck — sits at 50–51% WR-used in both matchups it
appears on both sides of. The win-correlation metric is honest.

### Pacing flag
Div–Abj averaged **285 turns** (peak 20+ rounds). As a PvP experience that is an hour+
match; the exhaustion clock may need to bite sooner once school balance is addressed.

## Suggested order of attack
1. Tax Evo's L1 spam (Firebolt/Searing Word rate or damage) — it distorts BOTH inverted edges.
2. Rework Stone Stance into early anti-aggro Abj tech (it is free — nobody casts it).
3. Speed up / harden Div's doom clock (Oblivion, Saboteur's Kit) so its engine has a payoff
   that outraces Abj's sustain and survives counters.
4. Re-run this exact triangle (same seeds) after each change — deltas are the signal.

---

## Experiment 1 (2026-07-27): Searing Word 2→1 dmg; Stone Stance → round-long -1 incoming spell damage

Same seeds, same harness. Result: **no edge moved** — and the telemetry explains why,
which makes this a successful falsification rather than a wasted run.

| Edge | Baseline | Experiment 1 |
|---|---|---|
| Evo vs Abj | 30–0 Evo, 8.4 rounds | 30–0 Evo, 8.2 rounds |
| Div vs Abj | 25–5 Abj | 25–5 Abj (byte-identical replay — no changed card is in either deck: determinism proof) |
| Evo vs Div | 30–0 Evo, 5.2 rounds | 30–0 Evo, 5.4 rounds |

### Finding 1: cantrip nerfs get SUBSTITUTED, not absorbed
Searing Word casts collapsed (138 → 30 vs Abj) exactly as intended — and the bot simply
rerouted the same slots into the next cantrips: Spark 58 → 96, Burning Hands 27 → 94.
Total L1 throughput unchanged; game length unchanged. Evocation's book holds ~5
interchangeable V-cost damage spells, so per-card nerfs are whack-a-mole. **The Evo>Abj
inversion needs a systemic lever** (ward exchange rate, or a class-wide cantrip rule),
not card points. Note Burning Hands' burn stacking is the next mole regardless.

### Finding 2: the Stone Stance rework was never played — a BOT valuation gap, not (yet) a card verdict
Cast once in 30 games. Root cause is visible in `evaluateState`: a round-long
damageReduction ongoing is priced by the generic `ongoingValue` term (≈0.4 pts) while
Fortify's +2 ward HP prices at ≈1.6 — so the greedy bot can never prefer the stance even
though its real value against 2-dmg cantrip turns is comparable. The eval needs a
kind-aware term for damageReduction (≈ value × expected enemy hits remaining in round)
BEFORE the card itself can be judged. Bot blind spots masquerade as dead cards.

### Next (Experiment 1b, proposed)
1. Eval fix: price damageReduction ongoings as pseudo-prevention (weight × remaining-round
   exposure), so the bot can express the stance strategy at all.
2. Fortify create-mode 1 HP → 2 HP (the defender's-rate lever that is NOT substitutable).
3. Re-run Evo–Abj (seed 100) only; full triangle once it moves.
Searing Word stays at 1 for now — it was two effects for one card regardless; revisit
after the systemic lever lands.

---

## Experiment 1b (2026-07-27): eval prices damageReduction properly; Fortify create 1→2 HP

Gate leg only (Evo–Abj, seed 100). Still **30–0 Evo** — but the first real movement:

| Metric | Exp 1 | Exp 1b |
|---|---|---|
| Avg rounds | 8.2 | **10.2** (+25% Abj survival) |
| Stone Stance casts | 1 | **106** (30/30 games — the eval fix landed) |
| Fortify casts | 42 | 118 |
| Evo L2+ casts (Lance/HexBolt/Fireball/Inferno/LBolt) | ~210 | **~360** |

### Findings
- The "dead card" verdict on reworked Stone Stance WAS a bot blind spot: with
  damageReduction priced by remaining enemy hits, it became a 30/30-games staple overnight.
  Telemetry + eval weights now form a self-correcting loop — check bot valuation before
  declaring a card dead.
- Evocation COUNTER-ADAPTED up the curve: the -1/hit tax makes cantrips proportionally
  expensive, so the bot pivoted to L2-3 spells (Inferno Lance 84→116, Fireball 31→65,
  Lightning Bolt 3→25). Genuine metagame response, not a wall — good sign for the card's
  design; bad news for closing the gap with reduction alone.
- Refined diagnosis: Abjuration now dies around round 10 — just SHORT of its L4 kit
  (Aegis Eternal: 23 preps, 0 casts here; but 50 casts and 86% WR-used in the 20-round
  Div matchup). The problem has localized to bridging rounds ~8-12. Two defender notches
  bought +2 rounds; the bridge needs roughly two more, or a systemic cantrip rule.

---

## Experiment 1c (2026-07-27): Reflective Ward 3→4 HP — the notch path stalls

Full triangle, same seeds.

| Edge | Exp 1b | Exp 1c |
|---|---|---|
| Evo vs Abj | 30–0, 10.2 rounds | 30–0, **10.6 rounds** (+0.4 — vs +2.0 from the first two notches) |
| Div vs Abj | 25–5 Abj | **28–2 Abj** (the feared deepening) |
| Evo vs Div | 30–0, 5.4 rounds | byte-identical (no changed card in either deck) |

### Findings
- **Diminishing returns confirmed.** Notch 3 bought a fifth of what notches 1–2 bought.
  Evocation keeps escalating up its curve (Inferno 45→63, Lightning Bolt 25→39) — its
  book is deep enough to out-adapt sustain buffs indefinitely. Aegis Eternal STILL 0
  casts: the bridge to round 12 was not crossed.
- **The side effect is real**: every defender notch deepens Div–Abj (now 93% Abj).
- **Recommendation: revert 1c** (keep 1 + 1b — they bought +2 rounds and fixed real card/
  bot health). The remaining Evo–Abj gap will not fall to sustain arithmetic. Two paths:
  (a) systemic — a class rule taxing damage-spell volume (e.g. ward-piercing economics or
  cantrip fatigue); (b) win-con timing — arm Abjuration's clock earlier instead of
  stretching its shield (e.g. Final Reckoning L4→L3 so the proven win condition arrives
  at the round-10 frontier instead of round 12+). Path (b) is a one-number experiment
  and doesn't feed the Div–Abj problem the way sustain buffs do.
- Experiment 2 (dooms pierce wards) is now MORE urgent regardless: Div–Abj is the worst
  edge on the board and its fix is orthogonal to everything above.

---

## Experiment 1d (2026-07-28): Reckoning window round → match — the first Abj wins on the Evo edge

Tree state: exp-1 + exp-1b + 1c reverted + Reckoning (ABJ-032) reworked to
`ceil(match-lifetime prevention / 2)` raw damage (the per-round counter reset before
every prepare phase, so the card was structurally unpreppable — 0 preps across the
entire prior triangle). Same seeds, same harness.

### Run 1 — card change alone: invisible, and a REPLICATION of the blind-spot law
Evo–Abj: 30–0, 10.20 rounds — numerically identical to exp-1b, and Reckoning has
**0 preps, 0 casts**. Root cause is the same class as exp-1's Stone Stance finding:
`evaluateState` priced a prepared Reckoning with the generic L3 prep term, so swapping
it in never wins the greedy action comparison and the charge is never expressed.
(Div–Abj under the same old eval: 27–3 Abj, 20.53 rounds — kept below as the control.)

### Eval fix: `reckoningCharge` (0.8)
Prepared ABJ-032 now adds `ceil(damagePreventedTotal/2)` (capped at opponent HP),
scaled by fuel progress like other prep worth. Sim-only change; engine untouched.

### Results (fixed eval, canonical seeds)

| Edge | Before (exp-1b state) | Exp 1d | Verdict |
|---|---|---|---|
| Evo vs Abj (seed 100) | 30–0 Evo, 10.20 rds | **27–3 Evo**, 10.20 rds | first Abj wins EVER on this edge (0-for-120 across all prior runs) |
| Div vs Abj (seed 200) | 27–3 Abj, 20.53 rds (old-eval control) | 27–3 Abj, 20.83 rds | edge unmoved — the design bet held |
| Evo vs Div (seed 300) | 30–0 Evo, 5.37 rds | not re-run | no Abj deck → Reckoning term can't fire → byte-identical |

### Findings
- **The wincon-timing path works.** Reckoning in Evo–Abj: 23 preps, 8 casts, used in
  6 games at **50% WR-used** — all 3 Abj wins ran through it while every other Abj card
  sits ≤17%. Game length unchanged (10.20 rounds): the banked burst arrives AT the
  round-10 frontier instead of stretching the game toward it. This is exactly path (b)
  from exp-1c's recommendation, and unlike sustain notches it moved the score.
- **First Abj buff in the series with NO Div–Abj side effect.** Old-eval vs new-eval
  pair on seed 200: 27–3 → 27–3. Vs doom decks wards eat the damage (soaks don't
  charge Reckoning), so the card stays small there by construction (9 casts, edge
  unmoved). Contrast exp-1c, where +1 ward HP alone went 25–5 → 28–2.
- **Reckoning displaced Aegis Eternal in the late prep slot** (23 preps → 0 in
  Evo–Abj): same slot, actual payoff. Aegis Eternal remains healthy in the long
  matchup (38 casts, 88% WR-used vs Div).
- Div–Abj sits at 27–3 vs the 25–5 baseline — the residual deepening is exp-1b's
  Fortify notch (was 28–2 at exp-1c; the revert recovered ~1 game).

### Current triangle (2026-07-28, working tree)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj | 27–3 Evo | 10.2 | Abj > Evo | still inverted, first crack |
| Div vs Abj | 27–3 Abj | 20.8 | Div > Abj | inverted |
| Evo vs Div | 30–0 Evo | 5.4 | Evo > Div | right direction, degenerate |

Order is still linear (Evo > Abj > Div), but the Evo–Abj edge is no longer a wall.

### Next
1. **Get Reckoning online more often** — it converts 50% of the games it appears in,
   but appears in only 6/30. One-number experiments in preference order: Reckoning
   L3→L2 (arrives at the round ~6 frontier, charges while Stone Stance is live), or
   cost S3→S2. Watch the Div–Abj control pair for each.
2. **Experiment 2 (Div doom clock / dooms pierce wards) is now the top structural
   item**: Divination is 3–57 combined across its two edges and both Div problems
   (dies to aggro by round 5, out-sustained by Abj over 20 rounds) trace to the same
   cause — the doom payoff is too slow and too answerable.
3. Dead-card watch (this run): Foresight [DIV-002] is now the only universally
   0-cast card (90 preps across all legs). Aegis [ABJ-004] (60 preps, 1 cast) and
   Div's L1 info row (Insight/Augury ≤ 2 casts vs Evo) remain near-dead. Check bot
   valuation before recosting any of them — that's now the twice-proven law.
4. Pacing flag stands: Div–Abj averages 271 turns/game.

---

## Experiment 1e (2026-07-28): Reckoning L3→L2 — REGRESSION, reverted

One-number test of "get Reckoning online more often" via level. Result: backfired on
BOTH edges. Evo–Abj 27–3 → **29–1**, and Abj dies FASTER (10.20 → 9.67 rounds);
Div–Abj control 27–3 → 29–1 Abj (cheap early Reckonings hurt Div too).

Telemetry: Reckoning casts 8 → 35 but WR-used 50% → **4%** — castable from round 5,
the greedy bot cashes the charge while it is tiny and cannibalizes its own defense to
do it (Reflective Ward 84 → 38 casts, Stone Stance 106 → 93). **Law: a charge card
must not be castable while the charge is small** — a 1-ply bot cannot hold it, and
the eval's charge term actively tells it not to. Reverted same day.

## Experiment 1f (2026-07-28): Reckoning cost SSS→SS at L3 — KEEP

The other lever: keep the L3 gate (charge arrives big) and cut ASSEMBLY time. At SSS
the card was prepped in 23/30 games but cast in only 6 — the round-10 window is too
short to attach three S before the game ends.

| Metric (Evo–Abj, seed 100) | exp-1d (SSS) | exp-1f (SS) |
|---|---|---|
| Score | 27–3 Evo | **25–5 Evo** — Abj's best ever on this edge |
| Avg rounds | 10.20 | 10.10 (wins are conversion, not stalling) |
| Reckoning preps → casts | 23 → 8 | 23 → **21** |
| Games reached / WR-used | 6 / 50% | **13 / 38%** |

All 5 Abj wins ran through Reckoning (rest of kit: 17%). Edge trend across the series:
30–0 → 30–0 → 30–0 → 27–3 (1d) → 25–5 (1f). Synced to xlsx (cell-level surgery:
"SSS" is a shared string used by 9 other cards — the cost CELL was repointed to the
existing "SS" string; `npm run import-cards` round-trips byte-identical).

## Experiment 2 (2026-07-28): ALL dooms pierce — THE EDGE FLIPS. KEEP

Systemic rule change: every prophecy now fires exhaustion-style (no wards, no
reduction, no heal-conversion) — before, only Oblivion did. Wards answer spells;
fate is answered at cast time or raced. Implementation: `prophesy()` inscribes
`pierce: true` unconditionally; the soakable branch stays engine-supported (and
test-pinned) for future cards. Eval's existing `doomPierce` weight reprices
automatically. Design_Doc prophecy section updated.

| Edge | Before (exp-1d state) | Exp 2 | Verdict |
|---|---|---|---|
| Div vs Abj (seed 200) | 3–27 Abj | **24–6 DIV**, 17.0 rds | **FLIPPED to design intent** — first correct-direction result ever on this edge |
| Evo vs Div (seed 300) | 30–0 Evo | 30–0 Evo, 5.3 rds | unmoved — pierce is irrelevant vs a wardless school that kills by round 5 |

Div's doom suite came alive: Foreclosure 10% → **80% WR-used** (101 casts), Entropy
82%, Saboteur's Kit 80% (216 plays). Counterplay survived where it should: Abj still
cancels 33% of Entropys and 41% of Unbinds at cast time — interaction moved from the
ward wall to the stack, which is the intended shape of the matchup. Abj's Final
Reckoning collapsed 22 → 6 casts (games end at 17 rounds, short of its window).

Note: the Reckoning cost change is invisible in this matchup (pierce bypasses
reduction, so the charge never accumulates vs Div — Reckoning: 0 casts) — the
final-tree rerun (1f + exp-2) replays the exp-2 run byte-identically.

### Current triangle (2026-07-28 evening, working tree = 1 + 1b + 1d + 1f + exp-2)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj | 25–5 Evo | 10.1 | Abj > Evo | inverted, trending right (30–0 → 27–3 → 25–5) |
| Div vs Abj | **24–6 Div** | 17.0 | Div > Abj | **CORRECT** — first flipped edge |
| Evo vs Div | 30–0 Evo | 5.3 | Evo > Div | correct direction, degenerate magnitude |

Two of three legs now point the right way. The school ladder rotated: Abjuration is
now the board's weakest school (loses both edges), Divination the middle.

### Next (post-exp-2)

1. **Evo–Abj remains the wrong-way edge** (83% Evo). Reckoning's timing path keeps
   paying; candidates: further assembly help is exhausted (SS is already 1 attach),
   so the next levers are the charge rate (Stone Stance value, Absorb frequency) or
   the long-deferred systemic cantrip tax. Watch Div–Abj (now 80% Div) — Abj buffs
   finally have headroom on that side.
2. **Evo–Div (30–0, round 5.3) is untouched by everything so far** and needs its own
   lever: Div early defense vs cantrip volume, or short-fuse doom pressure that
   arrives before round 5. Note Div's whole L1 info row (Foresight/Divine/Premonition)
   is dead vs Evo — that's 3 free rework slots aimed at exactly this hole.
3. Pacing improved free of charge: Div–Abj 271 → 210 turns/game (dooms end games
   sooner than exhaustion grind). Still an hour-plus PvP match — exhaustion-clock
   review stands.
4. Bot-health note: the greedy bot cannot hold charge cards (1e's lesson). Any future
   "bank now, cash later" design should assume 1-ply pilots cash greedily — gate such
   cards by level/cost, not by player discipline.

---

## Experiment 1g (2026-07-28): ward soaks charge Reckoning — near-parity

Charge-vocabulary change: damage absorbed by your Wards now counts toward
`damagePreventedTotal` (Reckoning's match window). The ROUND counter keeps its
active-only vocabulary (Searing Riposte's trap delta untouched); targeted ward
damage (`dealDamageToWard`, e.g. Dispelling Powder) still charges nothing —
no player damage was prevented. Rationale: vs 300+ cantrip casts/30 games,
Abj's wards ate 15-25 HP of chip per game that charged nothing, while the
card's printed text ("damage you have prevented") already reads as including
it. Card text now says so explicitly.

| Edge | exp-1f | exp-1g |
|---|---|---|
| Evo vs Abj (seed 100) | 25–5 Evo | **17–13 Evo** — Abj 17% → 43% |
| Div vs Abj (seed 200) | 24–6 Div | 24–6 Div, **byte-identical replay** |

Reckoning reached 17/30 games at 76% WR-used; all 13 Abj wins ran through it.
Rounds 10.1 → 9.9: Abj wins by killing, not stalling. The control's byte-identity
is the punchline: piercing dooms never touch wards, so the entire buff is
mechanically invisible to the doom matchup — the first Abj buff with a formal
zero side effect.

## Experiment 1h (2026-07-28): Stone Stance -1 → -2 — THE TRIANGLE COMPLETES

With the wincon path maxed, the last notch was the exchange rate itself. -2
zeroes the 2-damage cantrips for the round and doubles the stance's charge
contribution.

| Edge | exp-1g | exp-1h |
|---|---|---|
| Evo vs Abj (seed 100) | 17–13 Evo | **22–8 ABJ (73%)** — the edge FLIPS |
| Div vs Abj (seed 200) | 24–6 Div | 27–3 Div (90%) — direction intact, deepened |

- Reckoning: 29 casts, 24/30 games, **92% WR-used** — the wincon. Stone Stance
  136 casts as the engine behind it.
- Evocation found one more real adaptation — Searing Word casts 10 → 47 (burn
  riders tick past the stance) — and its whole book still compressed to 24-32%
  WR-used. Counterplay texture survives; the wall is gone.
- Control cost: Div–Abj deepened 80% → 90% — the bot overcasts now-dead stances
  vs doom decks (142 casts at 10% WR-used). That is a PILOTING artifact, not a
  card problem: the eval prices damageReduction by opponent slots, blind to
  whether the opponent's damage actually passes through reduction. An eval
  refinement (discount reduction vs doom-heavy boards) should claw back some
  Abj games there.

### Current triangle (2026-07-28 night — the design triangle EXISTS)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj | **22–8 Abj** | 10.1 | Abj > Evo | **CORRECT** |
| Div vs Abj | **27–3 Div** | 16.9 | Div > Abj | **CORRECT** |
| Evo vs Div | **30–0 Evo** | 5.3 | Evo > Div | **CORRECT** (degenerate magnitude) |

First time all three edges point the design-intent way. Cumulative path on the
hardest edge: 30–0 → 27–3 (1d wincon) → 25–5 (1f cost) → 17–13 (1g charge) →
**8–22 (1h exchange rate)**. Every step was a one-number experiment with a
Div–Abj control.

### Next (magnitude tuning)

1. **Evo–Div (100%, round 5.3) is now the worst number on the board.** Div's L1
   info row (Foresight/Divine/Premonition — 0 casts vs Evo) is the free design
   space: early defense or sub-round-5 doom pressure.
2. **Div–Abj at 90% is deeper than it needs to be** — try the eval refinement
   (reduction discounted vs doom boards) BEFORE touching cards; the deepening is
   measured bot misplay, not card imbalance.
3. Mirror-match sanity when convenient: Reckoning-vs-Reckoning in the Abj mirror
   (both charge off each other's chip) has never been measured.
4. Human check: the numbers say the triangle exists at greedy-bot level; a piloted
   MCP match vs the new Abj would confirm the feel (stance-Reckoning loops could
   read as repetitive even while balanced).

---

## Verification run (2026-07-29): full triangle replicated on the working tree

Full test suite green first (228/228, includes the new stance tests). Canonical
seeds, same harness; all three legs reproduce the 2026-07-28-night numbers exactly:

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 22–8 Abj (73%) | 10.10 | Abj > Evo | CORRECT |
| Div vs Abj (seed 200) | 27–3 Div (90%) | 16.93 | Div > Abj | CORRECT |
| Evo vs Div (seed 300) | 30–0 Evo (100%) | 5.30 | Evo > Div | CORRECT (degenerate) |

Telemetry spot checks all hold: Reckoning 29 casts / 24 games / 92% WR-used on the
Evo edge; Stone Stance 136 casts as the engine; the Div–Abj stance overcast artifact
persists (142 casts at 10% WR-used). Dead-card watch unchanged: Aegis [ABJ-004]
0 casts on both Abj legs, Absolute Defense [ABJ-039] 29 preps / 0 casts, Meteor
[EVO-032] 28 preps / 1 cast, Div's L1 info row 0 casts vs Evo (but alive vs Abj —
Premonition 41 casts / 92% WR-used — so it's an Evo-matchup hole, not a dead row).
The triangle state is stable and reproducible; magnitude tuning (Evo–Div 100%,
Div–Abj 90%) is the remaining agenda.

---

## Experiment series 3–5 (2026-07-29): Div L1 agency + the Div–Abj eval refinement

Session goals: give Div's L1 info row something active to do, and refine the eval
so the Div–Abj matchup isn't distorted by bot misplay. Same seeds, same harness;
Evo–Abj (seed 100) replayed byte-identically through EVERY change below — the
flagship edge holds at 22–8 Abj / 10.10 rounds.

### Exp-3a — eval: damageReduction discounted by pending pierce-doom threat. KEEP
`reducibleShare = hitsLeft / (hitsLeft + pierceDoomThreat)`. Div–Abj 27–3 → 25–5
(90% → 83%): Abj stopped hard-buying stances into a threat that bypasses them and
spent the slots on reactions and Final Reckoning instead. Doom-less matchups are
formally untouched (factor = 1).

### Exp-3b — eval: prep-identity bonus (PREP_THREAT). KEEP — and the law's THIRD instance
The generic prep term is card-blind, so all L1 preps tie and id order decides —
DIV-001..005 got every slot all series while Omen [DIV-012], the DESIGNED "L1
starter doom", had **0 preps across the entire balance history**. A 2-entry table
(Omen 1.7, Foretell 1.6) fixed expression instantly:
- vs Evo: Omen 35 casts, Foretell 59, Insight 24 → 97 — Div actively attacks now…
  and the edge did not move AT ALL (30–0, 5.23 rds). ~10 dmg/game of L1 pressure
  is arithmetic noise against a 5-round race. **Successful falsification: the
  Evo–Div lever is TIME, not chip.**
- vs Abj: Omen went to 289 casts at 97% WR-used and the edge deepened 83% → 97%.
  Honest piloting exposed a real card problem (see exp-5).

### Exp-3c — eval: ward HP discounted by the same doom signal (floor 0.3). KEEP
Abj had poured its S into walls that piercing dooms skip (Ward Pulse 133 casts at
3% WR-used). With wards priced honestly Abj counters far more (Entropy cancel rate
→ 63%)… and Div exploits harder too (both seats share the eval): 29–1 → 30–0.
Verdict: the eval is now an honest instrument; the remaining depth is card-level.

### Exp-4 — cards: the info row grows defensive teeth. KEEP
Foresight [DIV-002]: + round-long −1 incoming spell damage. Divine [DIV-003]:
+ remove 1 Burn (the Fortify precedent — formally dead vs burn-less schools).
Both expressed immediately (Divine 52 casts vs Evo, visibly warping Evo's plan:
Burning Hands 77 → 60, Searing Word 11 → 30). Bought +0.24 rounds; score unmoved.
Right texture, insufficient dose at bot level; real tools for human pilots.

### Exp-4b — Foresight −1 → −2. REGRESSION, reverted same day
The exp-1h "rate is the lever" bet failed here: +0.2 rounds vs Evo (still 30–0,
Foresight only ~19 casts — a 1-ply bot undervalues round-long defense cast from
the second seat), while Div–Abj deepened 29–1 → 30–0 (the flinch blunts Abj's raw
kit). Exact exp-1c revert pattern.

### Exp-5 — Omen cost M → MM. KEEP (partial)
The spam economics finally meet resistance: resolve rate 91% → 79% (Abj cancels
1-in-5; Counterbind 18 → 41, Phase Shift 7 → 33), games 13.8 → 15.4 rounds, and
the Evo edge is untouched (Omen was irrelevant there). But cast count held at
~400/30 games — **Div's recursion engine (Reclaim 139, Seek 96) refuels any
fuel tax**; the exp-1 substitution lesson in M-school form. Score 30–0 → 29–1.

### Current triangle (2026-07-29, working tree)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 22–8 Abj (73%) | 10.10 | Abj > Evo | CORRECT — untouched all session |
| Div vs Abj (seed 200) | 29–1 Div (97%) | 15.4 | Div > Abj | CORRECT, too deep |
| Evo vs Div (seed 300) | 30–0 Evo (100%) | 5.50 | Evo > Div | CORRECT, degenerate |

### Structural findings (the session's real output)

1. **Abjuration has no win condition against piercing dooms.** Wards and
   reduction never touch them, counter economics lose to a cheap re-preparable
   threat, Reckoning never charges (nothing is prevented), and Final Reckoning's
   window sits past the round-15 frontier. Eval work measurably improved Abj's
   play and the score STILL converged to ~30–0 — the gap is card-level. Candidate
   fix: rework a universally dead Abj card (Aegis [ABJ-004], Absolute Defense
   [ABJ-039]) into narrow anti-doom tech (delay/blunt ONE doom) — counterplay for
   the clock itself without reverting exp-2's global pierce. Design call.
2. **Evo–Div is a wall of the same species as pre-Reckoning Evo–Abj**: 0-for-150
   games across five experiments; chip, dooms, cleanse, and two flinch rates all
   bought fractions of a round. It will not fall to notches — Div needs a wincon
   or defense that functions inside 5 rounds (the exp-1d lesson: arm the clock at
   the frontier, don't stretch toward it).
3. Blind-spot law count is now FOUR (Stone Stance, Reckoning, Omen/Foretell
   preps, and honest-ward-pricing) — prep-time and threat-shape valuation, not
   just cast valuation, must be checked before ANY card verdict.

---

## Experiments 6–7 (2026-07-29 evening): the proactive L1 verb — two falsifications, one keeper

Mandate: Div's L1 should have something PROACTIVE to do. DIV-008 (Scry Glyph —
never prepped or cast in ANY telemetry all series) was the free slot; it was
reworked twice, each iteration measured on seeds 300/200.

### Exp-6 — Hasten ("the soonest doom on your opponent ticks 1; fires at 0"). FALSIFIED
Slotted by the prep bonus (30 preps, displacing Foresight), then **0 casts — and
the bot is RIGHT**: since exp-2 made dooms unanswerable after resolve, one turn
of acceleration is worth ~0.3 eval points and only matters at exact lethal-race
margins. Inevitability is the enemy of urgency: a tempo trick cannot fix a 3×
output deficit (Div deals ~10-12/game into a race that requires ~30 in 5 rounds).
Engine primitive removed with the card; the log is its record.

### Exp-7 — Cut the Thread ("see the components in their hand; choose one; they
discard it"). KEEP, pending human validation
The first lever aimed at the actual measured variable — Evocation's ~5.7 HP/round
rate rides on V components in hand — with attach-first play as the counterplay
texture. Implementation: `requestOpponentDiscardChoice(componentsOnly)` — the
chooser sees only the components, so Foretell/Foreknowledge keep the intel niche.
Result: 30 preps, **0 casts vs Evo** (edge 30–0, 5.30 rds) but **18 casts at 100%
WR-used vs Abj** (edge ~30–0, unchanged). The vs-Evo silence is a DIAGNOSED bot
limitation, not a card verdict: the greedy rollout ends at the next turn
boundary, so denial's payoff (their next turn casts less) is literally outside
the horizon — all the sim sees is −1 hand card (+0.6), which loses the cast
auction to Foretell's 2.0 every time. Fifth entry in the blind-spot ledger, and
the first the cheap fixes (prep table) cannot reach — a fix means a hand-fuel
eval term (global retune risk) or a deeper rollout (2× sim cost).

### Where Evo–Div stands after seven experiments
30–0 across ALL of it (0-for-210 games; rounds 5.2–5.7): chip pressure, doom
volume, burn cleanse, two flinch rates, cost taxes, tempo, and fuel denial all
falsified at bot level. Conclusion: the degeneracy is systemic at greedy-bot
level — 30 HP pools, full-rate aggro from turn 1, and a school built for length.
Next steps are USER decisions, in preference order:
1. **Piloted MCP match (Div vs greedy Evo)** — the bot provably cannot price
   delayed payoffs (5 ledger entries); a human running attach-first dodges,
   denial timing, and doom stacking may already beat the measured 100%. Validate
   the wall is real before any systemic surgery.
2. Systemic levers if it holds: start-HP asymmetry, doom ticks on both players'
   turns, or L1 cast pacing.
3. The Abj anti-doom rework (finding #1 above) remains open for Div–Abj depth.

---

## MEASUREMENT REGIME CHANGE (2026-07-29, late): horizon 2 is the standard

The blind-spot plan's horizon A/B (full results in
`2026-07-29-blindspot-plan.md`) showed the one-boundary greedy rollout was
systematically blind to reactions, fuel denial, and charge wincons. `npm run
sim` now defaults to `--horizon 2`; every number above this line is horizon-1
and NOT directly comparable to future runs. Horizon-2 canonical triangle
(current tree): **Evo–Abj 21–9 Abj (70%) · Div–Abj 22–8 Div (73%) · Evo–Div
30–0 Evo (real — survives honest play; turns/game 37→60)**. Two edges sit in
the healthy band; Evo–Div is the one remaining degenerate number and it is now
a CREDIBLE one. Structural finding #1 above (Abj has no wincon vs dooms) is
RETRACTED as substantially a horizon artifact — Reckoning runs 42 casts / 36%
WR-used vs Div at horizon 2. Finding #2 (Evo–Div needs a sub-5-round wincon or
systemic lever) STANDS, strengthened.

---

## Verification run (2026-08-12): horizon-2 triangle replicated after two weeks idle

Tests green first (230/230, 17 files). Canonical seeds, same harness, engine/sim
tree unchanged since 7bcb2e7 (2026-07-29). All three legs reproduce the recorded
horizon-2 numbers exactly:

| Matchup | Result | Avg rounds / turns | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 21–9 Abj (70%) | 9.63 / 91.5 | Abj > Evo | CORRECT |
| Div vs Abj (seed 200) | 22–8 Div (73%) | 12.83 / 128.1 | Div > Abj | CORRECT |
| Evo vs Div (seed 300) | 30–0 Evo (100%) | 5.67 / 59.8 | Evo > Div | CORRECT (degenerate, validated real at bot level) |

Telemetry spot checks hold: Reckoning is Abj's wincon on the Evo edge (24 casts,
21 games used at 100% WR-used; Stone Stance 110 casts as the engine) and stays
modest vs dooms (87 casts, 31% WR-used — soaks don't charge off pierce). Cut the
Thread expresses vs Abj (108 casts, 73% WR-used) but only 7 casts vs Evo —
ledger #5's residual shape, visible rather than silent now. Pacing continues to
improve free of charge: Div–Abj 128 turns/game (271 at the horizon-1 baseline,
210 post-exp-2).

Expression-audit flags this run (forcing-probe customers once 1b ships — no
hand verdicts):
- Meteor [EVO-032] slotted-but-mute vs Abj (17 preps, 1 cast) — standing since the first triangle.
- Echoes of the Past [DIV-028] slotted-but-mute vs Abj (20 preps, 2 casts) — NEW flag.
- Kindle [EVO-006] L1-never-seen on both Evo legs (the known id-order prep starvation, 1a's maiden catch — still unfixed).
- Div's L1 utility row (Augury/Recover/Refocus/Attune/Mind's Eye) unseen on every leg.

The triangle state is stable, deterministic, and two weeks stale in the good
sense. Standing agenda unchanged: piloted Evo–Div validation, then blindspot
plan 1b (forcing probes) → 2 (auto-derived priors).

---

## PILOTED VALIDATION (2026-08-12, same day): the Evo–Div wall BREAKS at piloted level

First piloted attempt (Claude piloting Div vs greedy Evo, seed 812):
**Divination WINS, round 5, 2 HP remaining** — the same round the sim says Div
dies, against the same bot that is 240-0 vs bot-piloted Div. Full transcript +
analysis: `2026-08-12-m1-Divination-vs-Evocation.md`. Every winning line maps to
a documented blind-spot class: first-seat Foresight (exp-4b's gap), doom timing
as turn-start checkmate (ledger #5), Anticipate as a 5/5-rounds value engine,
and exploiting Evo's real fuel droughts. Verdict: the 100% is a measurement
ceiling of the greedy pilot, not a property of the cards. Exp-7's "systemic
surgery needed" conclusion is DOWNGRADED to "piloted winrate unknown, plausibly
30-50%". Next: 2-3 more piloted seeds before touching any systemic lever;
re-test ISMCTS on this matchup (its lookahead is exactly what won here).

### Replication (same day): 4-0 across four seeds — the systemic-lever question is CLOSED

Three more piloted matches (subagent pilots, same playbook, seeds 813/907/1024;
logs m2/m3/m4 alongside m1). **Divination won all four games, every one in
round 5**, margins 2/4/2/6 HP vs the bots' 0-240. The win architecture was
identical and repeatable, not seed-dependent:

| Seed | Result | Div HP left | Doom share of damage | Anticipate fires | Kill |
|---|---|---|---|---|---|
| 812 | W R5 | 2 | 16/31 | 5/5 rounds | Foreclosure @ turn start |
| 813 | W R5 | 4 | 14/31 | 5/5 | Foreclosure @ turn start |
| 907 | W R5 | 2 | 14/31 | 5/5 | Foreclosure @ turn start (they held lethal, never got to cast it) |
| 1024 | W R5 | 6 | 16/30 | 4/4 | Foreclosure, forced from R4 (lethal even through their max spike) |

Findings, in strength order:
1. **Evo-Div needs NO systemic lever.** Exp-7's conclusion is fully retracted:
   the wall was the greedy pilot's doom-scheduling/lookahead ceiling (ledger #5's
   shape). The matchup at strong-pilot level is a razor race decided in rounds
   4-5 — tense, interactive, and arguably the best-FEELING matchup in the game.
   Bot-level 30-0 stays in the matrix but is now labeled a pilot artifact.
2. **The winning skills are exactly what greedy cannot price**: doom arrivals
   timed to the opponent's turn START (checkmate before their action), round-long
   defense cast first-seat, reaction uptime every round, and M-bank timing (907's
   pivotal call: bank 4 M for a one-turn kill assembly). ISMCTS re-test on this
   matchup is now the highest-value bot workstream — this is its promotion test.
3. **Evo's V-fuel droughts are real** (every game had 1-2 passed turns; one game
   saw prepped Inferno Lance/Hex Bolt never cast; one saw Catalyst cast with zero
   slots left to use it). They bought margin in three games, the win in none.
   Separate small finding: greedy-Evo's self-damage plays (Battle Trance -2) are
   liabilities in doom races it can't see coming.
4. **Card watch from the pilot's seat:** Anticipate (M) fired 19/19 available
   rounds across the series for 1 dmg + draw — flat, undodgeable value; watch in
   PvP. Divine is weak (burn is a one-shot delayed tick, not a DoT). Foreclosure
   is the matchup's kill card purely on timing geometry. Foresight's exp-4 rider
   earned its slot every game (the 2-HP wins ARE its margin).
5. **Mechanics notes for future pilots:** dooms carry across round boundaries
   and fire on the first turn-start of the new round; attachments sweep at round
   end (hand persists); first seat alternates but assignment is seat-dependent
   per game; second-seat Anticipate can't catch a first-seat opener.

Standing agenda after this session: (a) ISMCTS vs greedy on Evo-Div specifically,
(b) blindspot 1b forcing probes → 2 auto-priors, (c) client hint for the
round-end attachment sweep (every pilot paid tuition to it), (d) PvP telemetry
watch on Anticipate.

---

## ISMCTS re-test + blindspot 3c lever (2026-08-12, later): the noise fix works

Agenda item (a) executed same-day. The blind-spot plan's 3c hypothesis — the
search bot's flat 24-ply heuristic rollouts are a NOISE source that overrides
its greedy root priors — was implemented and A/B'd: `IsmctsBot.rollout()` (and
`forcedLineValue`) now stop at a QUIESCENT TURN BOUNDARY (`rolloutTurns`,
default 2 — the measurement-regime horizon) instead of a fixed ply count, i.e.
the exact stopping rule GreedySimBot scores with. Sim-only change; engine and
greedy untouched; full suite 230/230; canonical triangle unaffected (greedy
measures it).

### The A/B (search-Div vs greedy-Evo, seed 300, n=10, fixed seats)

| Rollouts | Result | Note |
|---|---|---|
| OLD (flat 24 plies) | **0–10** | replicates the wall — bot-Div was 0-for-240 lifetime |
| NEW (turn-bounded, horizon 2) | **2–8** | FIRST bot-piloted Div wins vs greedy-Evo ever |

Control (new rollouts): search-Abj vs greedy-Evo seed 100, n=10 → **7–3 Abj**,
matching greedy-Abj's own 70% on this leg. Search now equals greedy on the
defensive edge and finds ~20% of the piloted-play equity on the doom edge that
every greedy-level experiment scored 0% on. The piloted series' skills (doom
timing past the horizon) are exactly what the tree can represent and greedy
cannot — the mechanism, not just the score, matches the prediction.

### Promotion verdict: NOT YET, but the path is open
The ladder criterion stands (reliably BEAT greedy, not match it). Search at 300
iterations is parity-plus-upside at ~5-10x greedy's cost per game. Next levers,
in order: (1) iterations sweep (300 → 600/1000 — the noise fix means budget now
buys lookahead instead of variance), (2) head-to-head on the remaining edges
(Div–Abj both directions), (3) if promoted, ladder integration via `maxMillis`
(the server already has the latency cap knob). Numbers here are n=10 unpaired —
directional, not canonical; re-run paired at n=30 before any ladder decision.

### Iterations sweep (same day): FLAT — budget is not the lever

search-Div vs greedy-Evo, seed 300, n=10, `--iters` (now a CLI flag): 300 →
**2-8** · 600 → **1-9** · 1000 → **1-9**. Differences of one game at n=10 are
noise; the curve is flat. The turn-bounded rollout fix bought the 0% → ~10-20%
step, and additional search budget buys nothing more on this edge.

Reading: the remaining gap is STRUCTURAL, not budget. Candidate bottlenecks, in
suspected order: (a) the rollout POLICY is still HeuristicBot — leaf values are
clean at the boundary now, but the heuristic misplays doom lines inside the
rollout window (the full 3c lever — greedy-policy rollouts — was deferred for
cost: greedy per-ply is ~candidates × forced-line sims); (b) the doom-checkmate
lines the pilots won with need the tree to hold a specific 4-6 ply line against
branching factor ~10-20 — availability-count UCB may never focus that hard;
(c) determinization quality on the opponent's V-fuel state.

DECISION: search stays OFF the ladder; this line of work is PARKED here. The
next bot-quality investment per the plan-of-record order is blindspot 1b
(forcing probes) → 2 (auto-priors) — both cheaper and both serve measurement
rather than play strength. Revisit search promotion after those, with paired
n=30 as the gate and greedy-policy rollouts as the next lever to try.

---

## Blindspot 1b SHIPPED (2026-08-12, evening): forcing probes — first campaign

`--force <defId>` (GreedyOptions.forceDefId): +3 HP-denominated bonus on any
greedy action expressing the card — prep/cast/react/swap-in via slug suffix,
plus attaches to the forced card's prepared slot (the first Meteor run caught
that attach slugs name slots, not cards — without assembly forcing, expensive
costs stay mute under the probe; fixed same-day and unit-tested). Decision
rule: vs the same-seed unforced baseline, winrate UP = bot undervaluation
(verdict quarantined); FLAT with expression up = real replacement-level
verdict; DOWN = the bot was right to shun it.

Deviation from the plan's acceptance test: retro-forcing PRE-FIX Stone Stance
isn't reproducible on this tree (the eval fix shipped in exp-1b). Validation
instead: the unit test (Kindle wins a prep auction only when forced) plus live
expression on two of the three probes below (0→134 and 1→16 casts).

### Campaign 1 — all three audit-flagged cards, canonical baselines (n=30 paired)

| Card (flag) | Leg | Baseline | Forced | Expression | VERDICT |
|---|---|---|---|---|---|
| Kindle [EVO-006] (never seen) | Evo-Abj s100 | 9-21 (30%) | 10-20 (33%) | 0 → 134 casts, 30/30 games | REPLACEMENT-LEVEL — interchangeable with the cantrip pool (exp-1 substitution); not a blind spot |
| Meteor [EVO-032] (slotted-but-mute) | Evo-Abj s100 | 9-21 (30%) | 9-21 (30%) | 1 → 3 casts EVEN WITH assembly forcing | STRUCTURALLY UNCASTABLE here: VVVV + 2-card attach cap + round-end sweep + L4 window vs 9.6-round games ⇒ needs two VV cards in hand the same late round. DESIGN datum, not valuation |
| Echoes of the Past [DIV-028] (slotted-but-mute) | Div-Abj s200 | 22-8 (73%) | **17-13 (57%)** | 1 → 16 casts, 55% WR-used | CORRECTLY SHUNNED — casting it costs Div games (MMM displaces Omen/Foreclosure value); the bot's silence was right |

(Echoes control: prep/cast-only forcing left it mute at 24 preps / 1 cast and
winrate untouched — the assembly component of the probe is what unlocked the
measurement; Meteor's continued muteness under the SAME machinery is what
makes its structural verdict credible.)

### Findings
1. **Zero of the three flags were bot blind spots.** The July eval work
   (ledger #1-#4 fixes + horizon 2) appears to have closed the known
   valuation-gap classes; today's audit flags were all real card findings.
   The blind-spot LAW survives (check before verdict) — it's just now a
   one-command check instead of a discipline.
2. **New verdict category discovered: structural castability.** Meteor-class
   costs (4 symbols, one school) interact with the 2-card cap and the
   round-end attachment sweep such that the card is near-uncastable inside
   typical game lengths. Design options if Meteor should live: cost reshape
   (VVV / VV+any), sweep exemption for L4 assembly, or accepting it as a
   long-game-only card. Absolute Defense [ABJ-039] (SSSS, 29 preps 0 casts
   historically) is almost certainly the same class — probe it when relevant.
3. Probe cost: one forced run per card (the canonical baselines are standing).
   ~30-40 min per probe on current hardware; entirely parallelizable.

Next per plan order: workstream 2 (auto-derived cast priors) — now
lower-urgency, since its motivating failure class (hand-table maintenance for
valuation gaps) has produced zero new instances since the horizon change.

---

## Workstream 2 SHIPPED (2026-08-12, night): auto-derived cast priors — and a three-way falsification of wider scope

`npm run derive-priors` (packages/sim/src/derivePriors.ts) replaces the
PREP_THREAT hand table: every implemented Spell is injected fully-paid (via
PreparedSpell.bonus) into deterministic midgame snapshots (its school vs each
opponent school × 2 seeds; L3/L4 bands walk at 60 HP so short games don't
starve high tiers), cast against a PRIOR-FREE evaluator (first-run bug: live
priors deflate their own remeasurement to ~0 — the generator must never see
its own output), resolution forced with heuristic-resolved choices, eval delta
recorded on the payoff-in-HP scale, clamped [0,2], floor 0.3. Each prior is
kind-tagged offense/defense by delta decomposition (opponent loss vs own
gain). Output: data/cast-priors.json (79 priors, 13 defense-tagged);
evaluate.ts consumes it via an EvalWeights.castPrior scale with HAND_OVERRIDES
absolute on top.

Acceptance A (reproduce hand values): Omen 1.9 vs hand 1.7, Foretell 1.5 vs
1.6 ✓. Cut the Thread derived 0 — CORRECT (a snapshot cannot see denial;
ledger #5's shape) — and stays as the sole hand override (1.2), exactly the
plan's designed division of labor.

### Acceptance B — the re-baseline ladder (each n=30 paired, canonical seeds)

| Config | Evo-Abj (was 70% Abj) | Div-Abj (was 73% Div) | Verdict |
|---|---|---|---|
| v1: raw scale, all schools | 93% Abj | 100% Div | REJECTED — priors dominate; Stone Stance 197 casts/30; vs dooms 126 at 3% WR |
| v2: × 0.5 weight | 90% Abj | 97% Div | REJECTED — prep auctions still distorted: any positive prior outbids zero-prior REACTIONS (Counterbind 2 preps vs doom deck) |
| v3: + defense-kind doom discount | 90% Abj | 93% Div | REJECTED — the doom signal is transient (2-turn fuses fire and vanish); prep decisions never see it |
| v4: DIV-ONLY scope, full scale | **byte-identical control** (21-9, 9.63 rds, 91.5 turns) | **30-0 Div** | ACCEPTED — see below |

The ladder is a measured confirmation of the old PREP_THREAT docstring's
design note ("Deliberately Div-only … touching Evo's prep behavior would
destabilize every tuned edge for no gain"): context-averaged priors on
DEFENSIVE cards are matchup poison, board-state signals can't rescue them at
prep time, and offense expression was only ever broken for Divination. Scope
is enforced in evaluate.ts prepThreat; widening it again requires this ladder.

### The v4 Div-Abj deepening is HONEST — and re-opens a design finding

At v4 Abjuration's play is CLEAN (Stone Stance 75 casts ≈ baseline; Counterbind
35 reacts; Omen resolve rate down to 85% — Abj counters MORE than baseline) and
Div still goes 30-0: with its whole book priced (Premonition 1.4, Far Sight
2.0, Unbind, Calculated Draw…) instead of 3 cards, Div's engine mix improves
and closes the 8 games Abj used to win. Guard-rail #2 precedent applies
("honest piloting DEEPENED Div-Abj, and that was correct").

### Canonical triangle — NEW BASELINE (2026-08-12 night, post-priors tree)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 21-9 Abj (70%) | 9.63 | Abj > Evo | CORRECT (byte-identical, control) |
| Div vs Abj (seed 200) | 30-0 Div (100%) | 10.17 | Div > Abj | CORRECT, DEGENERATE at bot level |
| Evo vs Div (seed 300) | 30-0 Evo (100%) | 5.57 | Evo > Div | CORRECT, degenerate (piloted-validated as playable) |

DESIGN ITEM RE-OPENED (user decision): "Abj needs counterplay against the doom
clock" — July finding #1 was retracted at horizon 2 as measurement artifact;
the better instrument now re-surfaces it at bot level. Candidates from the
July analysis: rework a dead Abj card (Aegis [ABJ-004], Absolute Defense
[ABJ-039] — the latter also flagged structurally uncastable by the forcing
probe) into narrow anti-doom tech. NOTE the piloted caveat: bot-level 100% ≠
human 100% (see the Evo-Div piloted series); a piloted Abj-vs-Div match would
calibrate before any card surgery.

---

## PILOTED Abj-vs-Div series (2026-08-12/13): 3-0 ABJUTATION SWEEP — the design item is FALSIFIED at human level

Three piloted matches (subagent pilots, seeds 2101/2102/2103, greedy Div
opponent; logs m5/m6/m7 2026-08-13). The 30-0 bot edge inverted completely:

| Seed | Result | Margin | Wincon | Div's total damage landed |
|---|---|---|---|---|
| 2101 | Abj W R10 | 21 HP | Ward Collapse [ABJ-031] for 29 (9-round ward battery) | 9 HP in 10 rounds |
| 2102 | Abj W R13 | 19 HP | Ward Collapse for 42; Counterbind DETERRENCE froze the bot ~6 rounds | never below 19 |
| 2103 | Abj W R12 | 23 HP | Reckoning 8/8/10 off the ward-soak bank | 8 HP in 12 rounds |

Three different wincons, all lopsided. Load-bearing tools (none of which
bot-Abj uses): Runic Seal on the doom slot (uptime denial, incl. stranding
mid-assembly fuel), Phase Shift/Counterbind ON DOOMS ONLY (and Counterbind as
a STANDING THREAT — the greedy bot goes near-catatonic against an armed
cancel: fuels its board and passes for rounds), Aegis-class untargetability
(blanks any spell paid with ONE component card — single-card MM Omens
included), eat-the-small-doom economics, round-END pacing (exhaust own slots
to force-sweep the bot's hoarded attachments), and detach-rescue (pull unused
reaction fuel to hand before the sweep — bots never do).

### Standing verdicts after both piloted series
- BOTH degenerate bot numbers (Evo-Div 100%, Div-Abj 100%) are pilot
  artifacts. The triangle's bot-level magnitudes are lower bounds on the
  DISADVANTAGED school's human potential, not balance targets.
- "Abj needs anti-doom tech" is CLOSED-FALSIFIED: at human level Abj may be
  FAVORED vs Div. The rework menu drafted before this series (Fate Ward,
  doom-delay Aegis, Absolute Defense clock-stop) is SHELVED.

### NEW design flags the series raised (user decisions, priority order)
1. **Div has zero ward removal** — the ward battery (a 42-HP single ward!) is
   uncounterable by the entire school; Dispelling Powder is a neutral gambit
   Div presets apparently don't leverage. This is the actual human-level hole
   in the Div>Abj intent.
2. **Ward Collapse [ABJ-031] is an unbounded stored OTK** vs no-removal
   opponents (29 and 42 this series). Candidates: cap the conversion, consume
   ward + cap, or leave it as the reward for a school that can't remove wards
   being punished for it.
3. **Gambit dooms (Saboteur's Kit) bypass the stack** — uncancellable,
   unsealable; they were the pilots' ONLY unavoidable damage. Intended?
4. **Sealed Vault deletes the exhaustion wincon for free** (reset a 4-card
   deck to 38 in m7).
5. **First-action doom timing hole**: a doom cast as the round's first action
   is unanswerable (seals can't hit cast spells; reaction fuel died in the
   sweep). The greedy bot found this once (m7 R6) — real counterplay texture
   or a hole, design call.
6. Smaller: Counterbind costs SM in an S-flooded school (Phase Shift SS
   outclasses it); Mana Drain's auto-trigger is uncontrollable; Quenching
   Salts dead vs Div (sideboard texture, probably fine).
7. **Bot-side (ladder QoL, known class of limitation)**: greedy passivity vs
   armed cancels is a solo-ladder exploit; bot-Abj uses none of the above
   tools (seal/cancel/detach-rescue/round-pacing are all absent from its
   play). Fixing these is ISMCTS-era work, not eval patches.

---

## Bot-improvement tiers 1+2 (2026-08-13): the pilot gap closes 13 points from behavior alone

Program adopted after the piloted series: make the bots a trustworthy
instrument without piloted sessions. Tier 1 (behavior valves, commit e3a07a5):
detach-rescue on the round-final turn; sweep-aware fuel pricing (attached fuel
on uncast spells ≈ dead once the owner is slot-exhausted; Reactions exempt);
slot-waste rollout penalty (0.15/expired slot — passing is no longer free);
doom-aware cancel holding (armed cancel-class reaction worth up to 2× vs live
prophecy preps). Tier 2 (commit b6db6e6): ward-battery convertibility —
prepared Ward Collapse [ABJ-031] prices its largest-ward payload,
reckoningCharge mold. All measured one wave at a time, same canonical seeds:

| Edge | pre-tier | Tier 1 | Tier 1+2 | Reading |
|---|---|---|---|---|
| Evo-Abj (s100) | 21-9 Abj (70%) | 16-14 Abj (53%) | 16-14 Abj (53%) | school-neutral fuel/waste hygiene pays the AGGRESSOR; the card-tuned 70% was measured under weaker play. Never piloted — pilot gap unknown |
| Div-Abj (s200) | 30-0 Div (100%) | 26-4 Div (87%) | 27-3 Div (90%) | THE result: Phase Shift 90 fires + Counterbind 55; Foreclosure cancelled 38% while Omens get eaten — the m5-m7 cancel economics, emergent from one eval term |
| Evo-Div (s300) | 30-0 Evo | 30-0 Evo | 30-0 Evo (byte-identical to T1) | immovable; clean no-Abj control for the T2 term |

Tier-2 increment ≈ 0 at bot level, as predicted: the term drove Ward Collapse
0 → 20 preps (the bot SLOTS the wincon now) but 1 cast/30 games — "slotted but
mute," Meteor-class: SSS assembly inside a 1-2 round window at the L3 gate
(level 10) is plan-level play. The term stays (correct pricing, zero cost,
and it is exactly what a future search bot needs to find the line).

Open items from this wave: Runic Seal STILL never prepped (the one piloted
tool not expressing — candidate for a prior-scope widening or a seal-value
term); Evo-Abj at 53% wants a piloted calibration series before any card
reaction (that edge's pilot gap has never been measured); greedy freeze vs
armed threats is reduced (slot-waste penalty) but bait sequencing remains
unverified at telemetry level.

### Canonical triangle — NEW BASELINE (2026-08-13, tier-1+2 bots)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 16-14 Abj (53%) | 9.43 | Abj > Evo | correct direction, near-flat — piloted calibration wanted |
| Div vs Abj (seed 200) | 27-3 Div (90%) | 11.73 | Div > Abj | CORRECT (bot-level; piloted says Abj-favored — treat as lower bound on Abj) |
| Evo vs Div (seed 300) | 30-0 Evo (100%) | 5.70 | Evo > Div | CORRECT (piloted: winnable, razor-thin) |

---

## Tiers 3+4 (2026-08-13, late): the benchmark exists; tree guidance is a weak positive; search stays parked

**Tier 3 shipped**: `npm run pilot-gap` (packages/sim/src/pilotGap.ts) — runs
the piloted-reference edges bot-vs-bot and prints the gap to the piloted
records. Inaugural table (canonical n=30 numbers): Div-side of Evo-Div — bot
0% vs piloted 4-0 (gap ~100 pts, the racing lines are horizon-class);
Abj-side of Div-Abj — bot 10-13% vs piloted 3-0 (gap ~87 pts, closed 13 by
tier 1). Evo-Abj is listed UNPILOTED by design — its reference series is an
open task.

**Tier 4 shipped and A/B'd**: IsmctsBot gained tactic-informed progressive
edge bias (cast priors, +2.5 cancel-the-prophecy, -1 spend-cancel-while-dooms-
prepped, -0.5 idle pass, prep bias; tanh-squashed, /(1+visits) decay;
`--bias 0` = off-switch) plus greedy's detach-rescue valve. Same-tree A/B,
n=10, vs the TIER-IMPROVED greedy:

| Config | bias 0 | bias 1 |
|---|---|---|
| search-Div vs greedy-Evo (s300) | 0-10 | 0-10 |
| search-Abj vs greedy-Div (s200) | 0-10 | 1-9 |

Verdict: guidance is a weak positive on the plan-level edge (+1 game, n=10 —
directional, not significant) and nothing on the race edge. Note the moving
bar: tier-1/2 made GREEDY stronger (the old search-Div 2-8 vs pre-tier greedy
is not comparable — the same config now loses 0-10 to the improved opponent).
That is the program working as intended: the INSTRUMENT (greedy) is the
deliverable; search remains a research lane. PARKED again, with the bias
mechanism in place for whoever picks it up — next documented levers: greedy-
policy rollouts, wider bias vocabulary (round-pacing, battery assembly), or
per-node forced-line priors past the root.

**Program state after tiers 1-4**: expression ✓ (priors + audit + probes),
integrity ✓✓ (catatonia priced, fuel hygiene, cancel discipline — Div-Abj
pilot gap closed 13 pts), fidelity: directions all correct, magnitudes are
lower bounds by doctrine (CLAUDE.md). Remaining known gaps: Runic Seal prep
starvation, plan-level lines (ward battery execution, checkmate geometry) —
search-class work. The economical loop stands: bots for regression, subagent
pilots for discovery on ≥90% edges, `npm run pilot-gap` as the progress meter.

---

## Evo-Abj piloted calibration (2026-08-13, m8-m15) + the live-bug pattern strikes in LEGALITY — printed-trigger reaction gating ships

The one unpiloted edge got its series, found the game's next confirmed engine
bug mid-flight, and closed with both seats measured.

### The series (8 games, all vs tier-1/2 greedy)

**Abj side (m8-m10, seeds 3101-3103): 3-0, all wins at R10.** Identical line
all three games: Stone Stance every round + ward stack metabolizes Evo's whole
output into the Reckoning bank → one ~20-damage cast at L10. Pilots estimated
the skilled edge at 90%+ vs greedy Evo.

**Evo side (m11-m15, seeds 3201/3202/3203 + post-fix re-runs of 3202/3203): 2-3.**
- m11 (3201) W R8: bank-starving discovered — refuse to feed stance/wards
  (soak = 0.5 Reckoning damage later), hoard to hand cap, Dispelling Powder
  the walls, alpha-strike in sweep windows (Detonate on a hoarded hand = 17).
- m12 (3202) L R10: dominated to 3-vs-16 HP, then ONE Reckoning for 25. Two
  casts into armed Absorb (banks the PRE-mitigation total, heals half) were
  the leak.
- m13 (3203) L R11: Reckoning 18 then ANOTHER 18 — the bank is LIFETIME and
  the card is REPEATABLE. Text-faithful, confirmed in source: ABJ-032 reads
  damagePreventedTotal; nothing resets it (stance.test.ts pins the
  round-boundary carry; nothing pins — or refutes — the cast-to-cast carry).
- m14 (3202 POST-FIX) W R9: same deterministic opening as m12; kill-before-R10
  doctrine executed; Reckoning never existed. Discipline was the entire delta.
- m15 (3203 POST-FIX) L R10 by an exactly-lethal 13: pilot's own ledger shows
  4 HP of pure misplays (Battle Trance after the turn's cast, twice) were
  precisely the margin. Winnable on the line as played.

**Verdict:** design intent Abj > Evo holds at every level. The matchup is a
race with a hard deadline — kill by end of R9 or the HP bar is a lie — and
the margin at best play is razor-thin. Reckoning's accounting IS the edge.

### The bug (live-bug ledger: the pattern's first LEGALITY entry)

m10: bot Combust [EVO-016] fired in response to a SPELL cast; its text reads
"when your opponent plays a Reaction". Root cause (legal.ts): the reaction
window offered EVERY prepared+fueled Reaction whenever the opponent's cast
topped the stack — no card's printed trigger was ever consulted. Same
SIMPLIFIED-class shape as every prior production bug: a blanket proxy
(generic window) standing in for printed intent.

**Fix** (`reactionAnswersTop` in cardFlags.ts, enforced in BOTH legalActions
and apply so they can't diverge):
- "plays a Reaction" triggers (Combust, Combustive Counter) only answer
  Reactions;
- "casts a spell" triggers (Backdraft, Searing Backlash, Annihilation Strike,
  Anticipate, Counter-Plan, Read the Signs, Spellbind) only answer spells —
  the mirrored half of the same bug, caught by auditing all 35 Reaction texts
  (Cinder Storm's printed "spell or Reaction" stays universal);
- riderless conditional cancels are whiff-guarded: Counterbind needs an
  M-cost target, Break Form an S-cost target (m12 watched the bot burn SM
  into an M-less stack). Mana Burn EXEMPT — its 2-damage rider fires
  regardless. Tests in interactions.test.ts; suite 242 green.

### Canonical triangle — NEW BASELINE (2026-08-13, post-gating-fix)

| Matchup | pre-fix | post-fix | Avg rounds | Reading |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 16-14 Abj (53%) | 19-11 Abj (63%) | 9.57 | REAL shift: the 53% was partly bot-Evo's ILLEGAL Combust damage; bot edge now points the piloted direction. Avg game dies at the Reckoning wall |
| Div vs Abj (seed 200) | 27-3 Div (90%) | 26-4 Div (87%) | 11.67 | one game — noise range |
| Evo vs Div (seed 300) | 30-0 Evo (100%) | 29-1 Evo (97%) | 5.63 | one game — noise range |

Pilot-gap benchmark updated: Evo-Abj now carries BOTH seats' references
(Abj 3-0, Evo 2-3). Bot-Evo 37% vs piloted-Evo 40% — that side's gap is
nearly closed; bot-Abj 63% vs piloted 100% still gapes ~37 pts (the piloted
Abj tools — seal, stance-first-seat habit, bank patience — remain unbotted).

### Instrument note: pilots moved to cheap-tier subagents

Usage limits were throttling the piloted channel. `.claude/agents/pilot.md`
pins pilot subagents to sonnet/medium (per-call model override as the
fallback in already-open sessions); CLAUDE.md now routes all piloted series
through it. m14/m15 (sonnet) matched the earlier games' analysis quality —
including catching their own misplays in the ledger — at a fraction of the
usage. The channel is no longer rationed.

### Open DESIGN decisions raised (none are code bugs — engine matches text)

1. **Reckoning [ABJ-032]**: lifetime bank + ward-soak credit + repeatable
   every round at SS from L10. Five games flag it; m13's 18+18 is the
   existence proof. exp-1g's rationale for soak credit ("vs doom decks the
   charge stays small") does not survive damage schools — the opponent's
   MANDATORY offense charges it. Menu: reset-on-cast / cap / exclude soaks
   (revert exp-1g) / reprice / once-per-match.
2. **Burn vs mitigation**: engine routes burn ticks through stance+wards
   (beginTurn → dealDamageToPlayer — settled from source; m15's "bypass"
   report was a misread of a tick breaking a ward). Doctrine says burn
   bypasses. m11: burn is "unplayable vs Abj" as-is. Pick one.
3. **"Spell"-worded prevention/cancels vs Reactions**: Absorb ("one spell
   that targets you") ate a Backdraft in m15. Deliberately left ungated —
   either extend the trigger-type gate to the prevent/cancel class or rule
   that "spell" on the stack includes Reactions and document it.
4. Smaller: hand-cap auto-discard is a SIMPLIFIED-class stand-in (sculptValue
   prices all trainers flat 1.5 — it discarded Dispelling Powder in m13, a
   real player decision auto-resolved); Interrupt's defund bypasses
   Lightning Bolt's "cannot be reduced below 1" (defund ≠ reduction — ruling
   or fine?).

Next: the Div side of Evo-Div wants post-fix re-validation (its 4-0 reference
predates tier-1/2 AND the gating fix, which touched Div's whole reaction kit)
— m16-m18.

---

## Evo-Div re-validation (2026-08-13 evening, m16-m18): 2-1 Div — and the BRICK, not the bot, is now the instrument's binding constraint

Three fresh seeds vs the post-fix tier-1/2 greedy. Piloted record on the edge
moves 4-0 → 6-1:

| Seed | Result | Margin | Reading |
|---|---|---|---|
| 5101 (m16) | Div L R6 | dead by exactly 2, lethal still in reserve | FIRST bot win of this race vs a pilot. Bot bricked once, hit its tech curve, and won on a burn marker carried across the round boundary — the doom-clock's own mechanic reversed. One pilot misplay (delayed Omen) plausibly decisive: contaminated but real |
| 5102 (m17) | Div W R5 | 15 HP | bot fully bricked R3 (zero casts); margin overstates the edge |
| 5103 (m18) | Div W R6 | 21 HP | near-bye: bot cast NOTHING R1-R4 on a Verbal-flooded hand a mulligan didn't fix. Not a validation |

**Verdict:** the doom-clock line still beats greedy Evo, but the 4-0-era
margins are gone and the outcome now hinges on whether Evo bricks. Two of
three games it did, badly, on component-shape droughts — which makes the
EVOCATION PRESET'S RESOURCE COMPOSITION (V/S/M ratio and multi-symbol card
mix vs its spellbook's cost shapes), not bot policy, the next audit target.
The 29-1 bot number on this edge is partly a deck-construction artifact.

Housekeeping from the wave: `save_playtest` names files by the MCP server's
internal match counter — a restarted server re-issues low ids (an m18 pilot's
transcript auto-saved as "m5-...", was rewritten to the briefed name, and the
stray deleted undisclosed, tripping the subagent security monitor; no real
data touched, verified against git). pilot.md now instructs pilots to Write
the briefed filename and REPORT stray auto-names, never shell-delete.
Triage: m17's "Foretell uncastable vs empty hand" is NOT a code bug — the
reveal no-ops safely and no legality path reads hand size; the observation
matches the one-spell-per-turn reset at the turn boundary (brief clarified).

---

## Wave C (2026-08-13, evening): the prep-fundability valve ships — and Divine exposes a NEW blind-spot class

First instrument fix from the resource-deck audit. Two pieces:

**Fundability term** (`evaluate.ts`, weight `fundability`, 0 = off): every
uncast prep's worth (generic + prior + Reckoning/Collapse payload terms) now
scales by whether its REMAINING cost is completable within the 2-component-
card cap: from hand = 1; one deck-draw away = 0.3-0.7 by helper-card density;
two+ draws away = 0.15. The v1 cut priced the fallback by whole-deck pair
inventory — saturates for every triple-primary shape, Meteor didn't move —
and was retuned to single-draw helper density the same session. Measure
twice, tune once.

**Divine [DIV-003] prior zeroed** — and the demotion FAILED, which is the
finding: 0.2 still slotted 25/30, 0.0 still slotted 28-29/30. The prep
auction isn't decided by prepThreat at all here: greedy's ROLLOUT POLICY
(heuristic) happily casts Divine mid-rollout (always fundable, scry+cleanse
nudges eval), while greedy's LIVE cast auctions never do. A rollout-vs-live
policy mismatch keeps a spell slotted that will never be cast — a NEW
ledger class (#6): prepThreat overrides cannot demote what the rollout
likes. OPEN; costs Div one slot on edges where it's dominant or hopeless,
so not chased this wave.

### Measured (n=30 paired greedy, canonical seeds; pre-wave = post-gating-fix)

| Edge | pre-wave | Wave C | shape-waste movement |
|---|---|---|---|
| Evo vs Abj (s100) | 19-11 Abj (63%) | 23-7 Abj (77%) | Meteor 13-14 preps/≤1 cast → 6/0; freed slots went to Wrath of the Mage (5 preps, 36 casts) — a fundable cross-cost that actually fires |
| Div vs Abj (s200) | 26-4 Div (87%) | 27-3 Div (90%) | Ward Collapse 17→3 preps, Calculated Draw 17→7 |
| Evo vs Div (s300) | 29-1 Evo (97%) | 30-0 Evo (100%) | Divine 28-29 preps/0 casts — unchanged (ledger #6) |

~35 wasted slot-preps per 90 games recovered. Every winrate moved TOWARD its
piloted reference (Evo-Abj bot-Abj 63→77 vs piloted 100) — the instrument
getting more honest, per the tier-1 precedent. Reckoning's wall stands
(25 preps/32 casts/96% WR on the Evo edge — design decision still queued).

Next: wave A (same-duals 6→8, basics 17→15 — the deck-side lever for the
same shape class), then wave B (demand-proportional cross split).

---

## Wave A (2026-08-13, night): same-duals 6→8, basics 17→15 — the ramp dial to its ceiling

DECK change (presets humans use too — this wave re-baselines the GAME, not
just the bots; pre-A piloted references are no longer strictly comparable).
Drought math: no-same-dual-in-hand5 42%→31%, L4 pair-drought hand10 53%→34%.

| Edge | Wave C | Wave A | Reading |
|---|---|---|---|
| Evo vs Abj (s100) | 23-7 Abj (77%) | 17-13 Abj (57%) | VV assembly pays the AGGRESSOR: Fireball 44 / Inferno 28 / Wrath 34 casts inside 9.5-round games |
| Div vs Abj (s200) | 27-3 Div (90%) | 25-5 Div (83%) | the shape class THAWS long-game: Ward Collapse 3 preps/2 casts, Calculated Draw 12/3 — first real bot casts ever — and Reckoning casts 14→34 (one SS card now refuels it every round) |
| Evo vs Div (s300) | 30-0 Evo (100%) | 30-0 Evo (100%) | immovable control, as every wave |

Meteor stays 6 preps/0 casts — the L3 assembly window itself, not dual
supply, is its binding constraint now (search-class work, known).
DESIGN NOTE: Reckoning at 34 casts/30 games sharpens the queued accounting
decision — wave A made the wall CHEAPER to run. New minor ledger: Cut the
Thread 16 preps/1 cast on the Evo edge (override wins slots; denial rarely
fires at Evo's pace).
