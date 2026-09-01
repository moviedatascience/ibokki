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

---

## Wave B (2026-08-13, night): demand-proportional cross split — the audit program closes

Cross-duals now follow each school's MEASURED off-primary demand instead of
uniform 4/4: Evo 2 VS / 6 VM, Abj 2 VS / 6 SM, Div 6 VM / 2 SM
(`CROSS_SPLIT` in decks.ts). Deck change #2 — player-facing, like wave A.

| Edge | Wave A | Wave B | Reading |
|---|---|---|---|
| Evo vs Abj (s100) | 17-13 Abj (57%) | 15-15 (50%) | demand-matched crosses fire on BOTH sides: Wrath of the Mage 48 casts (VM 4→6), Counterbind 7 real fires, Meteor down to 1 wasted prep, zero mutes |
| Div vs Abj (s200) | 25-5 Div (83%) | 23-7 Div (77%) | the shape class is fully ALIVE: Ward Collapse 7 preps/8 casts at 100% WR-used, Final Reckoning's FIRST cast ever, Calculated Draw 10/8, Counterbind 64 fires |
| Evo vs Div (s300) | 30-0 Evo (100%) | 30-0 Evo (100%) | composition-insensitive at bot level — the constraint is Div's round-5 survival, not fuel |

### Canonical triangle — NEW BASELINE (2026-08-13 night, wave A+B decks + wave-C bots)

| Matchup | Result | Avg rounds | Design intent | Status |
|---|---|---|---|---|
| Evo vs Abj (seed 100) | 15-15 (50%) | 9.57 | Abj > Evo | FLAT at bot level — piloted references (m8-m15) predate the deck waves; fresh piloted calibration REQUIRED before design conclusions |
| Div vs Abj (seed 200) | 23-7 Div (77%) | 11.97 | Div > Abj | correct direction (piloted said Abj-favored on OLD decks — stale reference) |
| Evo vs Div (seed 300) | 30-0 Evo (100%) | 5.57 | Evo > Div | correct, degenerate; ≥90% doctrine trigger — re-pilot on NEW decks |

### Program synthesis (audit → C → A → B, one session)

The audit's diagnosis held end to end: shape supply, not symbol supply, was
the constraint, and the three waves attacked it from both sides — wave C
stopped the bots WASTING slots on unassemblable shapes (~35 preps/90 games
recovered), waves A+B made the shapes ASSEMBLABLE (mute trio now casting;
Wrath/Counterbind/Ward Collapse/Final Reckoning all expressing for the
first time). Cost: every pre-wave piloted reference is stale (decks
changed), and Evo-Abj sits flat where design intent says Abj > Evo — the
next piloted calibration answers whether skilled play restores the edge.
STANDING DESIGN QUEUE, sharpened: (1) Reckoning — the wall is now cheaper
to fuel (one SS card/round) and cast 21-34 times/30 games at bot level;
(2) burn-vs-mitigation doctrine; (3) "spell"-worded reactions answering
Reactions; (4) ledger #6: rollout-vs-live policy mismatch (Divine 28-29
preps/0 casts through every wave, immune to prior demotion).

---

## NEW-DECK PILOTED TRIANGLE (2026-08-13, late night, m19-m27): every leg converges on design intent

Nine subagent pilots (3/leg, sonnet tier, seeds 6101-03/6201-03/6301-03),
all on the wave-A+B decks against the wave-C greedy. The deck redesign
didn't just fix bot bricks — it REBALANCED THE GAME AT SKILL LEVEL: dooms
and bursts both got faster, walls didn't.

| Leg (pilot side) | old-deck piloted | NEW-DECK piloted | bot | intent | verdict |
|---|---|---|---|---|---|
| Abj vs Evo | 3-0 (est. 90%+) | 3-0 — margins +32, +38, then +1 | 50% | Abj > Evo | HOLDS at skill (bot flatness is bot-skill artifact) but the new Evo clock compressed a fortress into a race — m21 was a photo finish closed by FINAL RECKONING for 60 (4×rounds, uncapped) |
| Abj vs Div | 3-0 Abj (intent inverted) | 0-3 — −30 blowout, −18 (pilot-error confound), −19 | 77% Div | Div > Abj | INVERTED BACK: MM-dense Div presents 2-3 funded dooms/round vs a denial kit that eats ~1; Foreclosure permanent, Entropy on schedule, Unbind kills the ward battery, denial spending exhausts Abj's own deck. Intent realized at BOTH levels for the first time |
| Div vs Evo | 4-0 → 2-1 | 1-2 — all three razor-thin, the win required bot bricks on the two exactly-lethal turns | 100% Evo | Evo > Div | realized, arguably OVER-realized: skilled Div is coinflip-at-absolute-best; Foresight is the only real brake |

The trigger-gating fix also proved itself as DESIGN, not just correctness:
Combust's enforced "punish Reactions" identity deterred Anticipate in m26's
clutch rounds and taxed Abj's whole offense in m21 — counterplay texture
that the blanket window never allowed.

### Design queue after the triangle (priority order, user decisions)
1. **The Reckoning mold is the game's dominant design fact.** Lifetime
   non-decrementing accumulators, repeatable: base Reckoning (16+17 back-to-
   back in m20) and now FINAL RECKONING (m21: 60 damage, 4 HP per round
   elapsed, uncapped — closed a 1-HP game through everything). Every
   Abj-vs-Evo game across 8 piloted matches ends at this wall or races it.
2. **Evo-Div margin**: if "coinflip at perfect play" is too harsh for the
   disadvantaged school, Div needs a round-5 survival tool (Foresight-class);
   if the triangle is meant to be sharp, ship as-is.
3. **Abj-vs-Div at skill**: 0-3 may OVERSHOOT Div>Abj intent — the m22
   pilot's freeze-the-bot deterrence still worked, but multi-doom rounds
   are structurally unanswerable. Watch after any Reckoning change.
4. Standing items: burn-vs-mitigation doctrine; "spell"-worded prevents vs
   Reactions (Absorb ate a Backdraft, m15); ledger #6 (Divine).

### Triage queue (engine/bot, from the nine transcripts)
- **Counter-Plan vs REACTION_PROOF (decided m27)**: target-the-top reactions
  are offered against Hex Bolt and silently no-op — extend the wave-fix
  whiff-guard to reactionProof/unstoppable tops. Same class, clear fix.
- **save_playtest collision — FIXED this commit**: the server's per-process
  match counter re-issued m5/m6 after a restart and CLOBBERED two committed
  reference transcripts (recovered from git). Filenames now carry the seed
  and never overwrite.
- Mana Drain: never fired across 4 rounds of qualifying attaches piloted
  (m23) yet fires ~21/30 games at bot level — check arming conditions.
- Single-instance oddities (m21, need targeted repro): Mana Burn dealt 1
  not 2; one Stone Stance reduction applied -1 not -2; Chain Lightning's
  multi-target routing is illegible in the compact log.
- Ward Pulse whiffs with zero wards — feel-bad-guard candidate
  (trainerHasEffect precedent).
- Doctrine corrections logged for future briefs: attachments NEVER persist
  across round boundaries (cost m22 the game, m26 3 cards); Foreclosure is
  L2-gated (not R1-available); Absolute Defense's "spells" excludes gambit
  damage (text-faithful).

### Instrument note
Nine parallel sonnet pilots, one session, full triangle. The piloted
channel is now cheap enough to be the default calibration step after ANY
balance-relevant change. Pilot-gap references updated to the new-deck era
(pilotGap.ts); the Evo-side Evo-Abj reference (2-3, m11-m15) is the one
remaining stale row.

---

## THE LEDGER FAMILY ships (2026-08-13→14, ABJ-046/047/048, measured m28-m33): optionality instead of a Reckoning rework

User direction after the triangle: don't nerf the mold — give Abjuration
MORE SPENDERS of the banks it already owns. Three cards (xlsx-authored,
inlineStr rows; imported; effects + `spendPrevented` context op — the first
and ONLY decrementer of damagePreventedTotal; sub-minimum whiff guards in
the LEDGER_MIN family; bots given stored-value payload terms up front):

- **Warding Tithe** (S, L1): spend ≤4 → a Ward that big.
- **Sealed Verdict** (S, L2 Reaction): spend 6 → cancel target spell
  (one attached card vs Phase Shift's two).
- **Restoring Rune** (S, L2): spend ≤6 → heal half.

### Measured (bots n=30 paired / pilots 3+3, seeds 71xx/72xx)

| Edge | pre-ledger | ledger (bots) | ledger (piloted) | Reading |
|---|---|---|---|---|
| Evo vs Abj (s100) | 15-15 (50%) | 19-11 Abj (63%), 12.3 rds | Abj 3-0: +26, +30 (R19!), +42 | family expresses HUGELY (Tithe 198 casts/30); games became attrition engines; the wall got RICHER AND STRONGER |
| Div vs Abj (s200) | 23-7 Div (77%) | 28-2 Div (93%) | Div 3-0 | bots MISUSE the spenders at low bank (28 tiny Tithes, 8% WR-used); pilots verify: STARVED-BY-MATCHUP, not dead-by-design |
| Evo vs Div (s300) | 30-0 | 30-0 | (control) | untouched, as expected |

### What the pilots proved
- **Every mechanism live**: Tithe constantly (m29 ~13 casts), Rune real
  sustain (5×3 HP, above 30 — heals are uncapped), Verdict clean cancels
  including FORECLOSURE ITSELF (m32, the flagship doom denied by a
  bank-funded cancel).
- **The spend-down consequence is REAL**: m29 over-spent and Reckoning
  WHIFFED FOR 0 at R17 with Tithe locked by its own LEDGER_MIN — the
  designed tension, arriving under exactly the sustained-spending play the
  bot benchmarks smooth over.
- **The soak-refill loop** (Tithe ward soaks recharge the bank) is generous
  but NOT degenerate: ward-destroy and Chain Lightning's ward-sweep never
  credit the ledger (verified in state-ops routing) — shipped counterplay,
  and consolidating into big wards beats the small-ward swarm.
- **Emergent Reckoning counterplay**: m28's 13-damage Reckoning ate a
  Final Riposte reflect for 26 — big banks are now double-edged into Evo's
  legal riposte suite. (Lethal Reckonings skip the reflect: gameover gates
  the branch.)
- **The Div-side starvation, quantified**: bank ≈ 0.6/round (m31); doom
  damage credits ZERO; sealing a Foretell PREVENTS charging (denial and
  ledger fight each other, m33); the opponent can swap out its last
  soakable spell and zero the channel permanently (m32/m33).

### Verdict + queue for the user
The family achieves its brief on the Evo leg (richer play, real choices,
wall preserved — margins actually WIDENED from m21's photo finish) and is
mechanically proven but economically starved on the Div leg, where it was
most needed. THE CONVERGENT FIX (all three Div-leg pilots independently):
**let pierce/doom damage feed the ledger at a reduced rate** — "weathering
the prophesied blow" is lore-clean, un-opt-out-able, and would make
Verdict live in exactly the matchup that needs the extra answer. Options:
engine rule (pierce damage credits floor(n/2)) vs a card/stance converter.
Text polish queued: Tithe/Rune "up to" reads as a choice but auto-spends
min(cap, bank); Reckoning's non-consuming read deserves printed text
("...without spending it"). Small flags: Reckoning can whiff for 0 (bank-0
casts — LEDGER_MIN candidate); Evo-Abj bot games now END ON EXHAUSTION
regularly (12+ rounds — the escalating reshuffle penalty is a live design
surface); no HP cap on heals (confirmed intended?).

---

## LEDGER-ERA PILOTED TRIANGLE (2026-08-17, m34-m44): both Abj edges overshoot at skill; the Div-Evo race flips toward the pilot

Full piloted triangle on the ledger tree (fcc14e7): 9 pilots + 2 clean
re-runs, all vs the tier-1/2 greedy on wave-A+B decks. Side selection by
doctrine and open items: EVO on the Evo-Abj leg (refreshing the one stale
pilot-gap row, m11-m15), ABJ on the Div-Abj leg (93% trigger — a win-hunt
on the m31-m33 starvation verdict), DIV on Evo-Div (100% trigger).

| Leg (pilot side) | Result | Games | Reading |
|---|---|---|---|
| Evo vs Abj (m34-m36, seeds 8101-03) | **0-3** | L R10 (-32), L R14 (-9), L R13 (-6) | With m28-m30's Abj 3-0, BOTH seats of this leg are now measured on the ledger tree: Abj is strongly favored at skill. Intent Abj > Evo realized — possibly overshooting; the 63% bot number underestimates the skill edge |
| Abj vs Div (m37-m39, seeds 8201-03) | **0-3** (0-6 cumulative ledger era) | L R11, L R17, L R11 | Starvation verdict robust — with one big nuance (m38, below) |
| Div vs Evo (m40/m43/m44 clean, seeds 8301-03) | **2-1 DIV** | W R6 (+7), L R6 (-6), W R7 (+9) | Both wins COMFORTABLE — supersedes the m25-m27 "coinflip at absolute best" read; the round-5-survival-tool fear softens |

### Evo-Abj: the ledger family closed Evocation's old winning line
- m34: the soak-refill loop in the wild — Tithe converts bank→wards, Evo's
  V-heavy book is forced to hit them, every soaked point re-feeds the bank.
  One Dispelling Powder seen in 10 rounds; Reckoning 16 off a ~31 bank ended it.
- m35: Restoring Rune bounced the bot off single digits THREE times; Reckoning
  fired 4x with visibly decaying damage (6→4) as the bot spent the bank down —
  the decrement mechanic and the designed spend-vs-nuke tension are both live.
- m36: bank-starving executed to perfection (three Reckonings landed 1/1/1) and
  Abj won anyway through NON-ledger tech: Overcharge sacrificed its own 7-HP
  ward for 14 face, and Abjure the Wicked cancel+punished a multi-component bomb.
- Absorb hard-counters hoard-and-Detonate (ate an 18 and a 12 across the
  series, healing off both; not reliably baitable — the bot fired it on a
  4-dmg spell as readily as a 12). Evocation has no prevention tools and no
  Reaction-immune damage bigger than Hex Bolt — the answer menu is thin.
- The old Evo-side reference (2-3, old decks) is formally superseded by 0-3.

### Abj-Div: starved, confirmed — with calibration numbers and a new failure axis
- Bank reality: peaked at 2 in m37 and m39; zero spenders fired in m39, two
  2-HP Tithes in m37. m38 milked ~10-14 via Stone Stance but Tithe (defense)
  drained the shared pool before Reckoning unlocked — its one cast dealt 0,
  the queued LEDGER_MIN flag caught live.
- CALIBRATION for the pending half-rate pierce-feeds-ledger fix: uncharged
  doom damage was 33 (m37), 33 (m39), ~19 (m38) → ~16/16/9 extra bank per
  game at floor(n/2). Enough to make Tithe/Verdict real, not enough to have
  flipped any of these three games on its own.
- THE M38 DISCOVERY: disciplined seal/cancel/pacing held Div to a 16-round
  near-standstill (7 Foreclosures denied; round-end slot-exhaustion stranded
  loaded prep slots in 4 rounds) — and Abj died to its OWN escalating
  deck-exhaustion penalty (2/4/6 per reshuffle) at HP4. A control line that
  survives 15+ rounds kills itself by drawing; the July pacing flag is now a
  skill-level design item, not just a bot artifact.
- Mana Drain fired 4/4 when loaded in m39 — the m23 never-fires anomaly did
  not reproduce. m39 also reports Reckoning never surfacing as a prep option
  through L11 (spellbook draw variance this seed — watch, don't act).

### Div-Evo: skilled Div is no longer the underdog vs greedy Evo
- The winning package, twice: Saboteur's Kit as a FREE off-stack second doom
  clock (Gambits bypass the stack and the one-spell-per-turn limit), the
  Omen→Foreclosure swap the moment L2 unlocks (~R5, same MM, double damage),
  and near-100% Foresight uptime.
- m43 (the clean loss): 100% Foresight uptime and disciplined reaction holds
  still lost — each round has a naked window between round-start and Div's
  first cast, and Evo's L2 VV burst outpaced the doom clock. The "no hard
  defense once behind" gap is real but only binding when already behind.
- Both wins were padded by bot blind spots (Mana Burn — Evo's answer to an
  all-M school — never funded in time; multi-round sandbagging), so 2-1 is a
  vs-greedy statement, not a both-skilled one. The never-measured seat
  (piloted Evo vs Div) is now this leg's missing reference.

### Standing verdict after m34-m44
At skill level the triangle currently reads: Abj beats Evo decisively, Div
beats Abj decisively (Abj 0-6 on the ledger tree), and Div at least holds
its own against Evo — i.e. two intents realized-to-overshooting and one
(Evo > Div) in doubt at skill level. Design queue, updated: (1) the
half-rate pierce-feeds-ledger fix now has its calibration data (~9-16
bank/game); (2) deck-exhaustion as a self-clock for control archetypes
(m38) joins the pacing review; (3) Evo's thin answer menu vs the ledger
engine (no prevention school; Absorb/Overcharge asymmetries) is the
Evo-Abj overshoot lever if 0-3 vs 3-0 is too deep; (4) the round-5
survival tool for Div looks UNNECESSARY on current evidence.

### Instrument/triage (tooling, not design)
- `autoplay until:"reactionWindow"` is a footgun: it hands the pilot's side
  to a bot and the stop never fires without an armed reaction — it ran
  m41/m42 to game over (121 and 145 decisions) and excursed R2-R5 of m37.
  Both contaminated games are kept as transcripts but EXCLUDED from all
  references; their slots were re-run clean as m43/m44 (same seeds).
  pilot.md now carries the guardrail (myTurn/choice stops only). Candidate
  server-side fix: autoplay should hard-stop at the pilot's prep phase.
- save_playtest's seed-carrying filenames worked as designed (11 strays,
  zero clobbers); strays were verified byte-duplicates of the briefed
  transcripts and deleted. One stray ended with leaked tool-call markup
  (`</analysis></invoke>`) — likely a malformed pilot call; watch for
  recurrence before suspecting the server.
- OPEN redaction question (m38): prep-phase "replace X with Y" log lines
  name the opponent's facedown cards in the pilot-visible log, enabling
  near-perfect Runic Seal targeting. Check what protocol/mcp actually
  redact for opponent prep events vs what the board render hides.
- Disposed: m38's "attach cap bug" is the documented 2-card cap (types.ts);
  m43's "Foreclosure unlocks L5" was level-vs-round confusion (card is L2,
  which unlocks ~R5). Confirmed mechanics for future briefs: wards persist
  across rounds (only attachments sweep); Absorb does NOT stop prophecy
  inscription (only cast-time cancels do); overkill cascades through
  stacked wards; trigger gating behaves as printed.

---

## EXP-8: THE UNRAVELING (2026-08-17) — exp-2's pierce rule is REVERTED; Div rebuilds on ward interaction. Bot ladder at 27%, user checkpoint

USER DIRECTION (same day, after the m34-m44 triangle): exp-2 ("all dooms
pierce") is judged the WORST structural change in the project — a damage type
exempt from the defender's entire mechanic is a bye, not a matchup, and every
pathology since (ledger starvation, seal-vs-economy tension, the shelved
half-rate patch) is downstream of the exemption. Full plan + measurements:
`2026-08-17-unraveling-plan.md`. Pierce is purged ENTIRELY (user call —
Oblivion's printed immunity clause removed too; the engine still honors the
flag for a future printed card). Printed text was on the revert's side all
along: only Oblivion ever printed the immunity.

The replacement identity: **Divination dismantles preparations** — the seer
knows where your shield will be. Three reworks in the telemetry-dead L1
utility row (xlsx-authored, targets PRINTED to match the auto-pick):
- **Prophecy of Collapse** [DIV-004, was Augury] (M): doom, 2-turn fuse —
  destroy their largest Ward. An announced Unbind; spend the ward or lose it.
- **Unravel** [DIV-007, was Refocus] (M): 2 damage to their weakest Ward +
  scry 2 (never fully dead vs wardless schools).
- **Flaw in the Weave** [DIV-009, was Attune] (M): their largest Ward loses
  half its HP, rounded up — the proportional battery answer.
Engine additions: `Prophecy.payload: "collapseLargestWard"` (a non-damage
doom payload), weakest/halve ward ops. Priors: all three are class-C
(removal payoff invisible without a standing ward in the snapshot) → hand
overrides 1.4/1.2/1.3; the doom row re-derived honestly for the soakable
world (Omen 1.9→1.1 — a blockable doom IS worth less; Foreclosure → the 2.0
clamp once shatter shipped; acceptance pin re-based).

### The measured ladder (s200 Div-Abj, n=30 paired; controls clean every rung)

| Rung | Tree | Result | Reading |
|---|---|---|---|
| baseline | pierce world | 28-2 Div (93%) | the bye |
| 8a | revert only | 1-29 Div (3%), 15.5 rds | full re-inversion — pierce WAS the whole matchup. The ledger engine detonates off soaked dooms (Tithe 157 casts, Reckoning 85 @96% WR-used); Unbind alone (169 casts!) cannot race the wall |
| 8b | + suite | 2-28 Div (7%), 17.2 rds | the suite EXPRESSES (~9 removal casts/game, Collapse 133 @93% resolve) and loses the exchange rate: every soaked point funds Tithe→ward→soak→Reckoning — Div feeds the machine that kills it |
| 8c | + shatter rule | **8-22 Div (27%)**, 17.0 rds | the plan's named backstop: prophecy damage soaks NORMALLY (credited) but destroys every unprotected ward it touches, remainder evaporating uncredited. +20 pts — the first real movement. Sanctum emerges as printed tech (4 casts, 100% WR-used); Reckoning WR-used 92→76% |

Controls: s100 byte-identical at every rung (19-11 Abj, no Div cards); s300
unmoved at 30-0/5.6 rds (no Evo wards to shatter; one hygiene flag — Collapse
slotted 30/30, cast 0 vs wardless Evo, the matchup-blind override's cost in
an already-0% leg).

### Where the remaining 27→60 gap lives + the lever menu (USER DECISIONS)

Bot-Abj's bank still runs on chip soaks + the soaked fraction of dooms; Rune
heals and 17-round pacing favor the L4 wall (Final Reckoning 7 casts, 100%
WR-used). Menu, in recommended order:
1. **Piloted probe first (pilot-gap doctrine)**: bot-Div is the instrument's
   historically weakest seat (Evo-Div: bots 0%, pilots 2-1) — 27% may be 50%+
   at skill. BLOCKER: the MCP server holds pre-exp-8 code; restart before any
   piloted wave.
2. Ledger vocabulary rule: foretold damage stops charging the bank (costs a
   printed-text asterisk on the ledger family).
3. Number notches (Unravel damage, Collapse fuse, doom amounts) — July law
   says these buy points, not flips.
4. Restoring Rune rate/caps.

STATUS: uncommitted experiment tree (engine+cards+sim+docs, 256/256 green),
awaiting user checkpoint. UI follow-up queued: client doom markers assume a
damage amount — payload dooms (amount 0) need a glyph (sim shows `W@Nt`).

### 8d — PILOTED CALIBRATION (2026-08-18, m45-m50): both seats sweep — the matchup has agency in both directions for the first time

Six fully-manual pilots, 3/seat, exp-8c tree. **Div seat 3-0** (R10-R12
blowouts, margins ~28-31): bank starving is total — chip lands on flesh only,
pure-destroy removal (Unbind/Prophecy of Collapse deal NO damage) deletes
wards for zero bank credit, ordering doctrine "destroy > shatter >
damage-into-ward"; Abj's bank never passed ~6, Reckoning never profitably
fired. **Abj seat 3-0** (R12-R16, margins 25/28/68): exact-size bumpers bank
every doom's full face value (Stone Stance applies BEFORE ward routing — ≤2
dooms need no ward), Reckoning cashes 7-15 repeatedly, m50 took 4 face damage
in 16 rounds and closed with Final Reckoning for 64. All three Abj pilots
independently: the sizing minigame is "REAL TEXTURE, NOT A TAX."

Reading: pilot-vs-bot cannot resolve the skill-vs-skill edge (both seats
crush greedy), but it resolves QUALITY — the leg went from a bye (pierce) /
helplessness (old-world Abj 0-6) to dueling economies with rich, repeatable
lines on both sides. Bot 73% Abj is a lower bound on BOTH schools. Div>Abj
magnitude at equal skill needs pilot-vs-pilot or better bots.

Triage (full list in the plan doc): Fortress [ABJ-029] text/impl BUG
(protects only its new ward, text says all — live-bug pattern class);
contradictory component-funding legality reports (react-vs-cast paths, needs
unit repro); doom fires opening no prevent-reaction window re-affirmed as a
deliberate design choice or changed; save_playtest trailing-markup artifact
recurred; Fortify buffs the OLDEST ward.

### 8e — the fix wave + PvP infrastructure (2026-08-18)

All 8d triage cleared (Fortress fixed to printed text via round-scoped
`wardsProtected`; funding reports disposed as designed behavior with pins;
save artifact stripped; the m38 transcript leak fixed with actor-tagged
redacted lines) and the MCP server gained PILOT-vs-PILOT mode: seat-scoped
redacted views on one match, cheap WAITING polls, private notes, autoplay
disabled. 266/266 green; Fortress fix measured balance-neutral (s200 8-22,
16.8 rds ≈ 8c exactly). Details: the unraveling plan doc.

### 8f — PILOT vs PILOT, the first equal-skill series (2026-08-19, m51-m53): DIV SWEEPS 3-0; the matchup is a real duel

Three games, six pilots, both seats separately sighted, seeds 8601-03,
manual-only. Canonical transcripts + both seats' analyses:
`2026-08-19-m5x-Divination-vs-Abjuration-PVP.md`.

| Game | Result | Shape |
|---|---|---|
| m51 | Div, R16, 1 HP vs -1 | photo finish — Abj was one pure-S card short of a Final Reckoning kill; died to Entropy timed across the round boundary as Stone Stance expired |
| m52 | Div, R13, 20 vs -3 | the cancel duel decided it: Counter-Plan sniped 6 casts, Reckoning cashed once; Fortress's one no-sell of Unbind bought the only extra round |
| m53 | Div, R13, 14 vs 0 | seven wards deleted for zero credit; Reckoning held to 2 then 8; Stonewarden's L1 lock and Counterbind-on-Counter-Plan premiered as Abj's real answers |

EQUAL-SKILL VERDICT: Div > Abj intent REALIZED at equal skill — Div favored,
margins razor-to-comfortable, and every game a genuine duel (Abj live to win
in all three; every mechanic on both sides fired). The matchup's discovered
center is the CANCEL DUEL: Counter-Plan (strips a component off a cast,
killing exact-cost spells — Stone Stance, Arcane Shell, RECKONING at SS) vs
Counterbind (which can snipe Counter-Plan itself). Supporting skills: ward
sizing/pumping vs shrink-then-doom under shatter, round-boundary doom
geometry, three simultaneous clocks (HP, doom fuses, deck exhaustion).

PLAYBOOK CORRECTIONS (encode in future briefs): Counter-Plan protection
requires 2+ SEPARATE component cards (a dual is one physical strip target);
front-load reaction fuel every round (seat order alternates); track live
board objects, not cancelled casts (Stonewarden's persisted ward blanked L1
removal for 10 rounds unnoticed); shatter overflow past a DYING ward carries
to face (only a SURVIVING ward's remainder evaporates).

DESIGN QUEUE from the series (user decisions):
1. If 3-0 is hotter than intended: Counter-Plan is the matchup's strongest
   card (6 snipes in m52); the round-end sweep of REACTION funding is a
   structural tax on the reactive school (refund-from-zero windows are
   exactly where dooms land) — either is a magnitude lever. If Div-favored
   with living counterplay is the intent: ship as-is.
2. Sealed Vault reset a 7-card deck to 32 (m52) — the exhaustion-clock
   deletion flag, third sighting.
3. One-time check: prep-pool level gating (m39/m53 reports of high-tier
   spells never surfacing — largely the level ramp + short games, but verify
   once); cast-slot attach hygiene (dead attaches stay legal); 2-card cap UX
   hint (fourth pilot confusion).

INSTRUMENT: PvP orchestration works end-to-end — referee creates the match,
two pilot agents play it, valve collisions (mutual poll-timeouts) are
resolved by SendMessage resume with 150-poll ceilings, cost ≈ 0.7-0.9M
sonnet tokens/game. The pilot-gap ladder now has a third rung: bots (27%
Div) < pilot-vs-bot (sweeps both directions) < pilot-vs-pilot (Div 3-0) —
each instrument a lower bound on the next's losing side.

## EXP-9: THE EVO TUNE (2026-08-25 → 2026-09-01) — Fireball 6 / Lance 5 / Kindle→Stoke / Mana Burn "spell or Reaction"; bots level Evo/Abj to a coin flip, pilots say Abj still sweeps

Branch `claude/exp9-evo-tune-ledger-hud`; evidence file
`2026-08-25-exp9-triangle-ab.md`. Four deliberate Evo buffs (EVO-017 5→6,
EVO-011 4→5, EVO-006 Kindle→Stoke = return up to two V-providers from discard,
EVO-029 print widened to "spell or Reaction" — engine already did) plus the
prevention-ledger HUD (public `damagePreventedTotal` seal segment).

### 9a — A/B triangle (2026-08-25; greedy paired n=30, horizon 2, seeds 100/200/300)

Evo/Abj **Abj 63.3% → Evo 53.3%** (the moved leg, +16.6 pts); Div/Abj 73.3% Abj
bit-identical (isolation check); Evo/Div 100% both sides (standing, pre-exp-9).
DS review (`interop/reviews/exp9-evo-tune-ledger-hud.md`, 2026-09-01):
**changes-requested** — inverting a documented triangle leg at bot level needs
the piloted measurement the doctrine prescribes, and the same-commit
cast-priors regeneration was an unbounded confound.

### 9b — priors confound bounded (2026-09-01): contribution = 0

Branch code + `main`'s `cast-priors.json`, same command and seed → Evo 53.3%
(16–14), 12.33 r, every per-card line identical (Fireball 78 / Lance 73 / Mana
Burn 30 @ 23% cancel / Stoke 5). Bit-identical replay: the moved priors are all
L3–L4 cards a 12-round game rarely reaches. The swing is 100% cards.

### 9c — PILOTED Evo-vs-Abj on the branch (2026-09-01, m56–m58): **Abj 3–0**

Abj seat piloted (sonnet `pilot` agent), greedy-Evo, Evo first seat in 2 of 3.
m56 R12 (Abj 3 / Evo −23; Reckoning 20 then 24), m57 R10 (28 / 0; Overcharge
18 into exactly 18), m58 R10 (27 / −6; Reckoning 28 off a 56-point bank).
Piloted record on the leg is now **11–0 Abj** (m8/m9/m28–m30 5–0 and m34–m36
3–0 pre-exp-9; 3–0 now). Mechanism: Stone Stance's −2 is recast every round and
applies before ward routing, so buffed Fireball/Lance land 4/3 (was 3/2) — one
point more into a wall sized one point larger; Reckoning reads the bank and
profits from the bigger soaks. The bot-level
regression is a bot-competence artifact: greedy-Abj neither Stances every
round nor sizes wards post-Stance; greedy-Evo chips into a growing wall and
(m56) passed two turns at 1 HP with lethal on board. Doctrine reading:
bot-even + pilot-3–0 = the leg is Abj-favored with Evo less hopeless in weak
hands, which is the tune's intent. Neither Stoke (never prepped by the bot in
three games) nor the widened Mana Burn clause (no M-cost target arose — the
pilots closed with S/V-only Overcharge/Reckoning) was exercised.

### 9d — `--force EVO-006` probe + flags (2026-09-01)

Forced Stoke, same seed: **Evo 13.3% (4–26)** vs the 53.3% baseline; Stoke
288 casts / 30 games (95% resolve), Fireball 78→66. Down, not up: forcing an
enabler makes greedy loop it and spend casts on recursion instead of damage. No
undervaluation signal — Stoke's 5-per-30 baseline is a real card read (V is not
the binding constraint in these decks; m56's pilot said the same). Instrument
note for the blind-spot plan: `--force` over-fires on enablers; a per-round cap
would read them.

Flags, all pre-exp-9: Mana Burn's M clause gates only the cancel — the reaction
is castable at any spell as a 2-dmg ping (`effects/evocation.ts:125`; 77% of
its 30 bot reactions in the A/B were pings) — design question: targeting
restriction or conditional rider? Seat parity (one cold full-damage hit per
round before Stone Stance is back up). Reactions must be armed a main phase
ahead (holding Absorb = a multi-turn component tie-up). Stoke's SIMPLIFIED
auto-pick = board issue #3. m54/m55 transcripts unrecoverable.

STATUS: branch re-submitted for DS review (inbox #9). On approve: merge; the
prevention-ledger HUD ships with the tune.
