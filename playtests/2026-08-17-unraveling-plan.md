# Exp-8: The Unraveling — pierce revert + Div ward-interaction suite (2026-08-17)

USER DIRECTION (this session): exp-2's blanket "all dooms pierce" rule is judged the
project's worst structural change — it makes Div's offense exempt from Abjuration's
entire mechanic instead of engaging it, and every measured pathology since (ledger
starvation vs Div, seal-your-own-economy tension, the abandoned half-rate patch idea)
is downstream of that exemption. Replace it: dooms become soakable again, and Div's
Div>Abj edge is rebuilt on WARD INTERACTION — the seer dismantles preparations.

## Why this is defensible now (and wasn't in July)

- Exp-2 solved a real, measured inversion (pre-pierce: 25-5 Abj — telegraphed,
  discrete doom packets are the most absorbable damage in the game). Any replacement
  must carry that load. The replacement bet: removal-backed dooms pressure the wall
  through play; the July tree had ZERO ward removal expressed in Div presets.
- Printed text is on the revert's side: only Oblivion [DIV-043] prints "cannot be
  prevented or absorbed by Wards." Omen/Foreclosure/Entropy/Far Sight print plain
  damage. Exp-2 was an engine override contradicting the cards as written.
- Post-revert the ledger economy self-heals BY CONSTRUCTION: soaked doom damage
  charges `damagePreventedTotal` like any prevented damage. The m31-m39 starvation
  findings (bank ~0.6/round, ~9-16 uncharged bank/game) stop being a special case.
- The counter-economy is textured: Div removing a ward BEFORE it soaks denies the
  bank charge — the healthy, agency-based version of m32/m33's "swap out your last
  soakable spell" degenerate line.

## 8a — the revert (engine)

- `context.ts prophesy()`: honor the per-card `pierce` arg (default false). Only
  DIV-043 passes true today — Oblivion keeps its printed identity (user call
  pending; purge option below).
- `types.ts` §prophecy docs + Design_Doc prophecy section: un-write the exp-2 rule.
- Tests: the exp-2 pins flip (soakable default, Oblivion-only pierce pinned).
- Sim: NO code change — `doomPierce`, `pierceDoomThreat`, `soakShare`,
  `reducibleShare`, render's `!` marker, and derivePriors' defense discount all key
  off the per-prophecy flag and auto-adapt.
- MEASURE (n=30 paired, canonical seeds): s200 expected to re-invert toward Abj
  (falsification baseline — this is the pre-suite floor, do not react to it);
  s100 expected byte-identical (no Div cards in the matchup); s300 expected
  ~byte-identical (Evo has no prevention, soakability is moot).

### 8a MEASURED (2026-08-17): the falsification baseline behaves exactly as predicted

| Leg | ledger-era baseline | 8a (revert only) | Reading |
|---|---|---|---|
| Div vs Abj (s200) | 28-2 Div (93%) | **1-29 Div (3%)**, 15.5 rds | fully re-inverted — pierce WAS carrying the whole matchup. The ledger economy detonates off soaked dooms: Tithe 157 casts, Reckoning 85 at 96% WR-used, Rune 48; Div's whole book lands at 3-4% WR-used with Unbind already at 169 casts (the one removal card can't race the wall alone) |
| Evo vs Abj (s100) | 19-11 Abj (63%) | 19-11 Abj (63%), 12.33 rds | control clean — replays the baseline exactly (no Div cards in the leg) |
| Evo vs Div (s300) | 30-0 Evo (100%) | 30-0 Evo, 5.57 rds | control clean — soakability is moot vs a school with no wards/prevention |

USER PICKS (same day): all three reworks greenlit; pierce purged ENTIRELY —
Oblivion loses its printed immunity clause too (its WR-used goes on the watch
list for a compensating buff; do not pre-buff).

Priors note: derive-priors starved all three suite cards (0.3/0.1/0 — a ward
must be STANDING in the snapshot for removal payoff to register; the canonical
snapshots have few). All three moved to HAND_OVERRIDES (class-C, the Cut the
Thread precedent): DIV-004 1.4 / DIV-007 1.2 / DIV-009 1.3.

## 8b — the suite (cards; ALL THREE SHIPPED)

Design goals: L1-tier sustained ward pressure that COMPLEMENTS Unbind [DIV-019]
(the existing L2 MM "destroy any ward + draw" silver bullet — one copy per book
cycle can't race a Tithe/Fortify wall alone); scaling vs the battery; Div identity
riders; every effect a targeted card play with counterplay, never a damage-type rule.

Slots: the telemetry-dead L1 utility row (0 casts on every leg, all series).
Rework three, keep two (Recover [DIV-006] — only L1 discard recursion; Mind's Eye
[DIV-010] — closest to playable loot):

| Slot | Rework | Draft text | Probes |
|---|---|---|---|
| Refocus [DIV-007] (obsoleted by free detach-rescue) | **Unravel** | L1, M: "Deal 2 damage to target Ward. Scry 1." | cheap repeatable chip vs the small-ward swarm (Fortify 2, Tithe ≤4) |
| Augury [DIV-004] (worst filter in the book) | **Prophecy of Collapse** | L1, M: "Prophecy — at the start of your opponent's second turn from now, destroy target Ward." | Div's OWN mechanic aimed at Abj's mechanic: telegraphed inevitability with a real counterplay window (soak with the ward before it dies — charging the bank — or cancel/seal the spell). Needs a small engine extension: prophecy payload variant (destroy-ward, not damage) |
| Attune [DIV-009] (ramp trick, never mattered) | **Flaw in the Weave** | L1, M: "Target Ward loses half its HP, rounded up." | the proportional battery answer (flat damage can never race a 40-HP Ward Collapse battery) |

Cheap complementary knob (zero design cost): Div presets don't run Dispelling
Powder (neutral ward-damage gambit) — flagged as unleveraged in m5-m7. Preset
inclusion is a deck-level lever if the suite under-delivers.

After cards land: xlsx author → `npm run import-cards` → effects in
`effects/divination.ts` → `npm run derive-priors` (Div-only scope) so the bots can
express the suite (blind-spot law: no verdicts before priors exist).

- MEASURE s200 n=30 paired vs the 8a floor; iterate numbers (July law: expect
  multiple notches). GATE: Div-favored 60-75% band, avg game <15 rounds (the
  pre-pierce 20-round/285-turn grind must NOT return), ledger family expressing
  on the Abj side (bank/round well above the 0.6 starvation floor), suite cast
  counts + WR-used honest (not another dead row).

### 8b MEASURED (2026-08-17): the suite expresses — and loses the exchange rate

s200: **2-28 Div (6.7%)**, 17.2 rds (from the 3% revert floor). The suite fired
hard — Prophecy of Collapse 133 casts @93% resolve, Flaw 54, Unravel 22, Unbind
58 ≈ 9 removal casts/game — and barely moved the edge, because post-revert the
ledger economy runs on Div's own offense: every soaked point (chip AND the
soaked part of dooms) funds Tithe (123) → new wards → more soaks → Reckoning
(99 casts, 92% WR-used) + Restoring Rune (58 heals). Removal-by-the-card loses
to a wall that rebuilds from the bank for one S. s100 control byte-identical;
s300 unmoved (30-0, 5.60 rds) with one hygiene flag: Collapse slotted 30/30 and
never cast vs wardless Evo (override is matchup-blind — accepted for now).

### 8c — the named backstop SHIPS FOR MEASUREMENT: prophecies shatter what blocks them

Rule (state-ops `shatterWards` opt, passed only by prophecy firing): a doom's
damage soaks into wards NORMALLY — reduction applies, absorbed damage charges
the ledger — but every unprotected ward it touches is destroyed outright
afterward, the remainder evaporating UNCREDITED. Blocking fate is always
possible, never free; an exactly-sized ward (Warding Tithe's whole design) is
the clean block; `protected` wards (Sanctum) are the printed tech answer;
on-destroy triggers still fire. Design_Doc prophecy section updated. Doom-row
priors re-derived for the shatter world (Omen 1.9→1.1 honestly cheaper when
blockable; Foreclosure → the 2.0 clamp; acceptance pin re-based).

**8c MEASURED**: s200 **8-22 Div (26.7%)**, 17.0 rds — +20 points, the first
real structural movement. Sanctum discovered as tech (4 casts, 100% WR-used),
Reckoning WR-used 92→76%, Entropy Div's best doom (29 casts, 47%), Final
Reckoning closes long games (7 casts, 100%). Controls byte-identical by
construction (no prophecies on s100; no Evo wards on s300).

### The ladder, and where the remaining gap lives

93% Div (pierce) → 3% (revert) → 7% (+suite) → **27% (+shatter)**. Bot-Abj's
bank still runs on chip soaks plus the soaked fraction of dooms; heals and the
17-round pacing favor the wall; and bot-Div is historically the instrument's
weakest seat (Evo-Div: bots 0%, pilots 2-1). LEVER MENU (user decisions):
1. **Piloted probe first (doctrine)** — 2-3 Div-piloted games on this tree
   before more rule surgery; 27% at bot level may be 50%+ at skill.
   BLOCKER: the MCP playtest server holds pre-exp-8 code — restart it
   (`npm run mcp` session restart) before any piloted wave.
2. Ledger vocabulary: foretold damage stops charging the bank (accounting
   rule; costs a printed-text asterisk on the ledger family).
3. Number notches: Unravel 2→3, Collapse fuse 2→1, doom amounts (July law:
   notches buy points, not flips).
4. Restoring Rune rate/caps (46-58 casts/30, heals uncapped).

UI follow-up queued: the web client renders doom markers by damage amount — a
payload doom (amount 0) needs a glyph/label (sim renders it as `W@Nt`).

## 8d MEASURED (2026-08-18, m45-m50): both seats sweep the bot — the matchup has agency in BOTH directions for the first time

Six fully-manual pilots on the exp-8c tree (fresh MCP server), 3 per seat:

| Seat | Games | Result | Margins | The winning economy |
|---|---|---|---|---|
| Div (m45-m47, seeds 8401-03) | vs greedy Abj (73% at bot level) | **3-0 Div** | +28, +31, +28 HP — blowouts, R10-R12 | BANK STARVING: land chip on flesh only; pure-destroy removal (Unbind, Prophecy of Collapse — no damage dealt) deletes wards for ZERO bank credit; the discovered ordering is destroy > shatter > damage-into-ward. Abj's bank never passed ~6 in any game; Reckoning never profitably fired; Tithe made 0-4 HP wards |
| Abj (m48-m50, seeds 8501-03) | vs greedy Div | **3-0 Abj** | +25, +28, +68 HP, R12-R16 | EXACT-SIZE BUMPERS: ward sized to each doom's number banks its full face value and shields the wall behind; Stone Stance applies BEFORE ward routing (≤2 dooms need no ward at all); Reckoning cashed 7-15 repeatedly; m50 took 4 face damage in 16 rounds and closed with Final Reckoning for 64 |

Sizing-minigame verdict: **"real texture, not a tax" — all three Abj pilots
independently**. Marquee discoveries: withholding Stone Stance on an exact
bumper preserves bank (the ward dies either way); Prophecy of Collapse as a
STANDING DETERRENT (froze bot ward-building for 5 rounds, m47); the Entropy
sacrifice to bait Total Negation (m46); seal-denial as the answer to the
un-sizeable Collapse (m49).

READING: both seats crush the greedy bot, so pilot-vs-bot cannot resolve the
true skill-vs-skill edge — what it resolves is QUALITY. The leg went from a
bye (pierce) / helplessness (0-6 old-world Abj) to dueling economies where
six pilots on opposite sides all found rich, learnable, REPEATABLE lines.
Bot-level 73% Abj is a lower bound on BOTH schools' potential. Div > Abj
intent is achievable at skill; settling its magnitude needs either
pilot-vs-pilot or better bots (both seats' briefs now encode the doctrine).

### Triage from the wave (priority order)
1. **Fortress [ABJ-029] BUG (real, live-bug pattern class)**: text says "Wards
   you control cannot be targeted or destroyed by your opponent this round";
   impl (`abjuration.ts` createWardForSelfWith(4,{protected:true})) protects
   only the NEW ward. m50 lost a pre-existing 8-HP ward to Collapse in the
   same round. Fix needs a round-scoped all-wards protection.
2. **Component-funding asymmetry reports** (m46: SM failed to pay an M cost;
   m48: one VSM paid SS-cost Absorb but not SS-cost Reckoning) vs m49
   experiencing the documented rule exactly (SS = two S-bearing cards).
   Contradictory — needs a targeted unit-test repro of react-vs-cast funding
   legality before believing either direction.
3. **Design question, not bug**: doom fires open no reaction window for
   prevent-class reactions (Absorb/Echo Shield) — printed design ("answered
   at cast time or raced"), but now that dooms are ordinary damage the choice
   deserves re-affirming deliberately (m48).
4. save_playtest trailing tool-markup artifact recurred (m42, m49 strays) —
   check the MCP save handler; strays remain seed-named and never clobber.
5. Small notes: Fortify buffs the OLDEST ward (can fatten a Collapse target);
   2-card attach cap has no UI hint when it silently stops offering singles;
   greedy-Div hand-hoards at cap during losing endgames.

## 8e — the fix wave (2026-08-18, user-directed): triage cleared, PvP mode built

USER DIRECTION: fix the outstanding bugs, then run PILOT vs PILOT on this leg
instead of two more pilot-vs-bot seats.

Fixes shipped (266/266 green):
1. **Fortress [ABJ-029] fixed to printed text**: new engine vocabulary —
   ongoing `wardsProtected` (endOfRound) + `wardShielded()` consulted by every
   opponent ward-targeting/destruction site AND the shatter branch AND the
   collapse-doom payload. The new ward loses its old PERMANENT protected flag
   (protection is the round's, as printed). Tests pin Unbind-immunity and
   shatter-immunity behind the shield.
2. **Funding-asymmetry reports DISPOSED as designed behavior** via code review
   + four new pins (cost.test.ts): duals pay any symbol they contain; one card
   supplies each pip once; and the m48 "asymmetry" was Stone Stance's
   REACTION-only S-discount working as printed. m46's report did not reproduce
   against the code (attach offers are unfiltered; multiset math is correct).
3. **save_playtest artifact fixed**: trailing tool-call markup (literal or
   entity-encoded `</analysis></invoke>` tails — m42/m49) is stripped from
   saved analyses.
4. **The m38 transcript leak fixed for ALL modes**: transcript lines are now
   actor-tagged with redacted variants — opponent face-down prepare/replace
   labels render as "prepare a spell (face-down)", private choices as
   "resolve a choice (private)", and pilot notes are private to their seat.
   The saved record keeps full fidelity.
5. **PILOT-vs-PILOT mode (controls "pvp") in the MCP server**: two
   separately-sighted pilots share one match via a required `seat` param on
   act/match_state; views and transcript deltas are per-seat redacted
   (renderCompact was already viewer-clean); out-of-turn calls return a
   one-line WAITING response (cheap polling); per-seat seen-cursors deliver
   the opponent-action delta when you next look; autoplay is disabled;
   simultaneous prepare works (apply/describeAction actor params). pilot.md
   carries the pvp etiquette. 3 new mcp tests.

Post-fix re-baseline MEASURED: s200 **8-22 Div (26.7%), 16.8 rds** — identical
score to pre-fix 8c (8-22, 17.0), rounds within noise. The Fortress fix is
balance-neutral at bot level. s100/s300 byte-identical by construction
(Fortress's changed behavior only matters against ward-attack effects and
shatter, which Div alone carries).

## Next: the PvP wave (m51+, after an MCP server restart picks up this tree)
One match per orchestration round: the orchestrator creates the pvp match and
launches two pilot agents with the id + their seat + the accumulated seat
doctrine (bank-starving/unraveling for Div; bumper-sizing/seal-denial for
Abj). Watch tokens on the WAITING polls in game one before scaling to a
series. The design question it answers: Div>Abj magnitude at EQUAL skill.

The matchup changes wholesale; both piloted references (Abj 0-6, and Div's never-
measured seat) are stale by construction. 3 games per seat vs greedy (m45-m50),
pilot agent, manual-play doctrine (no autoplay past myTurn/choice). Watch from the
pilot seat: does the wall-vs-removal race FEEL like a duel (sizing, timing, bait)
or like whack-a-mole; does m38's exhaustion self-clock still bind now that soaks
charge the bank.

## Success criteria for the program

1. Div > Abj direction restored at bot level WITHOUT any damage-type exemption
   (Oblivion's printed capstone at most).
2. Abj's ledger kit alive in the matchup (Tithe/Verdict/Rune casts > 0 routinely;
   Reckoning charged by doom soaks).
3. Both piloted seats report real agency (no 0-N sweep with "no winning line
   exists" verdicts on either side).
4. Evo legs byte-identical or noise.
