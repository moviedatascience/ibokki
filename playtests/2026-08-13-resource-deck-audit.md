# Preset resource-deck audit — component allocation vs spellbook demand (2026-08-13)

Trigger: the m16-m18 piloted series — Evocation-bot bricks decided 2 of 3
games (m18: four cast-less rounds on a V-flooded hand), making preset deck
composition, not bot policy, the suspected binding constraint on the Evo-Div
edge. Scope: all three presets (Emberworks/Bastion/Riptide ≡ the school
archetype decks — `decks.ts` generates them from one recipe).

Method: static supply/demand from `cards.json` + the deck recipe;
payment rules VERIFIED IN SOURCE (`cost.ts` `meetsCost` = pure symbol
coverage, `legal.ts` attach = unrestricted under the 2-component-card cap —
this also corrects m17's claim that M + SM can't pay MM: it can);
hypergeometric drought odds; and n=30 `--cards` telemetry on all three
canonical edges (post-gating-fix bots).

## The recipe (uniform across schools)

17 primary basics + 6 same-symbol duals + 4/4 cross-duals + 2 VSM
+ 7 trainers = 40. Every component carries the primary symbol.
Deckrules bounds on any redesign: exactly 40; same-duals ≤ 8; tri ≤ 2;
trainers ≤ 13 (≤2 copies each); basics/crosses unlimited.

## Findings

**1. The recipe's core premise HOLDS.** Measured primary-symbol share of
spellbook demand: Evo 91%, Abj 90%, Div 94% (recipe assumes ~90%). The
every-component-carries-primary rule is doing its job — zero dead draws, and
no spell in any book is unpayable with its preset deck.

**2. The fragility is SHAPE supply, not symbol supply.**

| Cost shape | Payers in the 33 components | Drought odds |
|---|---|---|
| single/double primary (V, VV, …) | 33 ways | none |
| two-color (VM, VS, SM) | 6 cards (4 matching cross + 2 VSM) | 42.3% of 5-card hands, 15.5% of 10-card hands have ZERO |
| triple primary (VVV/SSS/MMM) | same-dual + basic only | no same-dual: 42.3% hand5 / 15.5% hand10 |
| quad primary (L4: VVVV/SSSS/MMMM) | same-dual PAIR only (C(6,2)=15) | 52.6% of 10-card hands can't field two |

**3. Telemetry confirms the shape ceiling — one mute per school, all the
same shape.** The "slotted but mute" list across the three edges is exactly
the triple-primary L3s: Meteor [EVO-032] 14 preps/1 cast, Ward Collapse
[ABJ-031] 17/1, Calculated Draw [DIV-029] 17/2. ~48 wasted slot-rounds per
90 games on one shape class: same-dual + basic assembled inside the 1-2
round L3 window. (Ward Collapse's muteness was known since tier 2; the
audit shows it is a CLASS, not a card.)

**4. Divine [DIV-003] is NOT this class.** 57 preps / 0 casts across 60
games — but it costs a single M (33 payers). Pure bot-valuation suspect per
the blindspot doctrine; excluded from deck conclusions, needs its own check.

**5. The cross-dual split (4/4) mismatches measured off-primary demand.**
Off-primary symbol demand per book: Evo S=3 M=6; Abj V=3 M=8; Div V=4 S=2.
Each school's heavier off-color deserves the larger cross allocation; today
both get 4. This is the m18 drought shape (bot prepped an off-color-cost
spell against 6-payers-in-33 odds).

**6. Trainer dig isn't converting.** 7 trainers = E[1.75] of a 10-card
hand; the dig trainers' WR-used hovers at coin-flip (Arcane Study 47-51%,
Scrying Lens 33-45%) — digging is not correlated with winning. Weak signal;
no action proposed beyond noting 7 is not sacred.

## Redesign menu (all legal under deckrules)

**A. Same-duals 6 → 8, basics 17 → 15** (the ramp-dial ceiling).
Directly targets the mute trio and L4 quads:
no-same-dual hand5 42.3% → 30.6%; hand10 15.5% → 7.6%;
L4 pair-drought hand10 52.6% → 34.1%. Primary supply RISES (Evo V: 39→41).

**B. Demand-proportional cross split 4/4 → 6/2** (Evo 6 VM/2 VS,
Abj 6 SM/2 VS, Div 6 VM/2 SM). High-demand two-color payers 6 → 8
(drought hand5 42.3% → 30.6%); low-demand side drops to 4 payers
(57.3% hand5) — acceptable: that side carries 2-4 symbols of demand across
1-3 mostly-L3+ spells per school.

A+B combined: 15 basics + 8 same + 6 high-cross + 2 low-cross + 2 VSM
+ 7 trainers = 40 ✓.

**C. Bot-side, orthogonal, arguably higher-leverage: a prep-fundability
prior.** The bot preps Meteor-class spells with no same-dual in hand and
none likely soon; a prep-time discount for spells whose payer inventory
(deck remaining + hand) is thin would stop the waste WITHOUT any design
change — and it is what a human does when they glance at their resource
deck. Also: the Divine valuation check (finding 4).

## Recommended sequence

1. **C first** (instrument fix, no design change): fundability-aware prep
   prior + Divine check, then re-run the three canonical `--cards` — the
   mute trio thawing (or not) cleanly separates "bots can't fund it" from
   "bots won't cast it".
2. **A+B as one deck wave** after: re-baseline the canonical triangle and
   re-measure the drought-sensitive piloted edges per the pilot-gap
   doctrine. Deck changes move BOTH bots and humans, so they re-baseline
   everything — batch them once, don't drip.
3. Trainer count: leave at 7 pending the above.
