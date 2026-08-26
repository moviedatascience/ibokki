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
