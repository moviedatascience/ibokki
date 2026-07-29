# Bot blind-spot ledger — plan of action (2026-07-29)

The greedy bot's valuation gaps have twice nearly caused wrong card changes and
once hid a finished win condition. Five confirmed entries, one design-side
companion. Two distinct harms: **misplay** (ladder bots play worse than the
cards allow) and **mismeasurement** (balance telemetry reads blind spots as dead
cards). Both have bitten; the second is the dangerous one.

## The ledger

| # | Case | Class | Status |
|---|---|---|---|
| 1 | Stone Stance — damageReduction priced by flat `ongoingValue`; 1 cast/30 games while the card was good (exp-1b) | A: state-feature gap | FIXED (`damageReductionPerHit`) |
| 2 | Reckoning — prepared ABJ-032 priced by the generic L3 prep term; 0 preps despite a match-winning charge (exp-1d) | B: card-identity gap | FIXED (`reckoningCharge`) |
| 3 | Omen/Foretell — card-blind prep term ties all L1 preps, id order decides; the designed L1 pressure had 0 preps ALL series (exp-3b) | B: card-identity gap | FIXED (`PREP_THREAT` table) |
| 4 | Wards/reduction priced flat vs piercing dooms — Abj bought walls a doom-deck bypasses (exp-3a/3c) | A: threat-shape gap | FIXED (pierce-doom discounts) |
| 5 | Cut the Thread — fuel denial's payoff lands on the opponent's NEXT turn, outside the rollout horizon; 0 casts vs Evo, 18 at 100% WR vs Abj (exp-7) | C: horizon gap | **OPEN** |
| — | (exp-1e companion) the bot cashes charge cards while the charge is small — a policy gap answered by DESIGN law: gate banked-value cards by level/cost, never player discipline | design-side | standing law |

Classes: **A** = a state feature priced generically (fix: kind/threat-aware eval
term). **B** = card identity invisible at prep/cast pricing (fix so far: hand
tables — works, scales badly across 136 cards). **C** = value that materializes
beyond the 1-ply + next-turn-boundary rollout (no cheap fix exists today).

## Workstream 1 — Detection: make blind spots find US (do first)

**1a. Expression audit in the sim report.** Telemetry already counts preps and
casts; add a standing audit block to `--cards` output (or a `--audit` flag)
flagging, per matchup: spells prepped ≥ N times with ~0 casts ("slotted but
mute"), and spells never prepped at all ("invisible"). Zero new data collection —
just surfacing what tables 40 rows deep currently hide. *Effort: small
(telemetry.ts/report.ts). Acceptance: the canonical triangle prints an audit
block that names DIV-008-vs-Evo today.*

**1b. Forcing probes — the blind-spot detector.** New sim flag
`--force <defId>` injecting a temporary eval prior (prep + cast bonus) for one
card; run the paired canonical seeds with and without. If forcing the card
IMPROVES its side's winrate, the bot undervalues it → ledger entry, and the card
verdict is quarantined. If forcing doesn't help, the card is genuinely weak in
that matchup — a real verdict at bot level. This turns "check bot valuation
before declaring a card dead" from a discipline into a measurement. *Effort:
medium (plumb an override into `evaluateState`/GreedyOptions). Acceptance:
retro-validates ledger #1 — forcing pre-fix Stone Stance on seed 100 should
lengthen Abj games the way exp-1b did.*

## Workstream 2 — Close class B for good: auto-derived cast priors

Replace the hand-maintained tables (`PREP_THREAT`, and eventually
`reckoningCharge`-style cases) with a generated table: an offline harness that,
for every implemented spell, applies its effect to 2–3 canonical midgame states
(one per opponent school), resolves any pendingChoice with the heuristic policy,
and records the eval delta — cached as JSON, loaded by the sim. Every new card
gets a prior automatically; hand overrides remain only for banked/conditional
cards (Reckoning) where a snapshot delta can't see the charge. *Effort: half a
day. Acceptance: generated priors reproduce today's hand values within
tolerance; the triangle re-baselines with explained deltas only. Risk: priors
are context-averaged — keep them small (prep-tiebreak scale, like today's
0.9–1.7), never dominant.*

## Workstream 3 — Class C: the horizon (the open entry)

**3a. Two-boundary rollout A/B.** GreedySimBot's quiescence stops at
`turnCount > startTurn`; add `rolloutTurns` to GreedyOptions and test
`startTurn + 1` (the opponent's reply turn becomes visible — exactly where
denial, flinches, and setup casts pay). Run the canonical triangle at horizon 1
vs 2: measure sim cost (expect ~2×) and expression deltas (Cut the Thread and
Foresight casts vs Evo are the tracer bullets). *Effort: small code, ~30 min of
sim time. Decision rule: if horizon 2 expresses denial and moves no healthy
edge wrongly, adopt it for balance measurement runs and the hard solo-ladder
bot; keep horizon 1 for the cheap tiers.*

**3b. If 3a underdelivers:** targeted hand-fuel eval term (opponent hand
components priced above flat `handCard`) — cheaper per decision but a GLOBAL
retune; requires full triangle re-baseline with byte-identity controls.

**3c. Long term:** the ISMCTS bot is the structural answer to horizon (real
lookahead). Its promotion criterion stands (beat greedy reliably); the known
lever is replacing its noisy heuristic rollouts with greedy-policy rollouts.
Defer until 3a/3b are measured.

## Workstream 4 — Guard rails (process, cheap, permanent)

1. **Card-verdict checklist** (added to the journal header when adopted): no
   card is declared dead/weak until (a) the audit shows it expressed or was
   given the chance, and (b) a forcing probe failed to improve winrate.
2. **Eval changes are measurement changes**: every eval PR re-runs the triangle;
   untouched edges must replay byte-identically (this session's controls proved
   the technique); touched edges get the new numbers as the new baseline —
   honest piloting DEEPENED Div–Abj, and that was correct.
3. **Design-side law** (exp-1e): banked-value cards are gated by level/cost at
   design time. A 1-ply pilot WILL cash small; assume it.
4. **Human/MCP piloted matches remain ground truth** for delayed-payoff cards —
   bots validate arithmetic, pilots validate lines. The standing Evo–Div
   question (is the 30–0 wall real or a horizon artifact?) is exactly a piloted
   match away.

## Suggested order

1a (audit surfacing) → 3a (horizon A/B — smallest class-C probe, directly
unblocks the DIV-008 measurement) → 1b (forcing probes) → 2 (auto-priors) →
3b/3c only as needed. 1a+3a fit in one session; each produces a triangle run
that doubles as a fresh balance snapshot.

---

## Executed 2026-07-29 (same day): 1a + 3a — the horizon A/B changed the map

**1a shipped**: `--cards` now prints an expression-audit block (slotted-but-mute
per-game-rate thresholds; L1 never-seen by name, L2+ as a count; level ceiling
derived from avg rounds so short games don't flood it). First catch on its
maiden run: Kindle [EVO-006] is id-order prep-starved — ledger #3's mechanism
on the Evocation side.

**3a shipped and ADOPTED**: `rolloutTurns` on GreedySimBot, `--horizon` on the
CLI (**default now 2** — `--horizon 1` reproduces pre-regime numbers), hard
ladder bot upgraded to horizon 2 (~2.5-3x think time, still sub-second/move).

### The A/B (canonical seeds, current tree)

| Edge | Horizon 1 | Horizon 2 | Reading |
|---|---|---|---|
| Evo vs Abj (seed 100) | 22–8 Abj (73%) | 21–9 Abj (70%) | stable — control held |
| Div vs Abj (seed 200) | 30–0 Div (100%) | **22–8 Div (73%)** | 27 points of the depth was HORIZON ARTIFACT |
| Evo vs Div (seed 300) | 30–0 Evo | 30–0 Evo, turns 37→60 | the wall is REAL — survives honest play |

What horizon 2 unlocked, per telemetry: Evocation's entire reaction suite
appeared for the first time (Backdraft/Volatile Bolt/Searing Riposte — 0 casts
all series at horizon 1); Reckoning came alive VS DIV (0 → 42 casts, 36%
WR-used) — "Abj has no wincon against dooms" was substantially a measurement
artifact; Cut the Thread expresses (55 casts/16 games vs Abj; modest vs Evo —
Evo's hand empties too fast to strip); Stone Stance overcasting halved; Spark
collapsed 104 → 40 casts vs Div (correctly read as riposte-bait). Both bots play
RICHER — and the sole surviving degenerate number, Evo–Div 100%, is now
credible: every tool expresses and the race still isn't close.

### Ledger status after 3a
Entry #5 (horizon) is CLOSED for measurement purposes. The open balance items
are now: Evo–Div (real wall — systemic lever or piloted-match validation next)
and re-baselining any future work on horizon-2 numbers. Next plan items in
order: 1b (forcing probes), 2 (auto-priors).
