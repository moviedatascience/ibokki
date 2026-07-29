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
