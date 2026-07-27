# Balance triangle — first strong-bot measurement (2026-07-27)

30 paired-seat games per matchup, GreedySimBot both sides (post retract/detach-valve fixes).
Deterministic repro:

```
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
