# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-06-30
- Seed: 7
- Controller: Claude (self-play, both sides)

## Match log

> **P0 (Evocation) thinks:** Evo vs Abj: my plan is to race with early Burn while they durdle on wards. Free Gambit first to dig for gas before committing components.
- **P0:** PLAY Arcane Study [GAM-001] (trainer)
    - P0 plays Arcane Study [GAM-001]
    _P0 HP 18 | P1 HP 18 | round 1 | turn 1 | stack 0_

> **P0 (Evocation) thinks:** Attach the single V (not a VV dual) to Burning Hands — keep the duals for my VV/VVV spells once I level up.
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 18 | P1 HP 18 | round 1 | turn 1 | stack 0_

> **P0 (Evocation) thinks:** Cast Burning Hands now to get the first Burn marker ticking ASAP.
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 18 | P1 HP 18 | round 1 | turn 1 | stack 1_
- _(auto-advanced 3 forced pass step(s))_
    - P1 takes 1 damage
    - → Burning Hands [EVO-003] resolves
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 18 | P1 HP 16 | round 1 | turn 2 | stack 0_

> **note (P1):** FINDING (important): P1 (Abjuration) opened with all four prepared spells at level 2-3 (Sentinel Rune L2, Fortress L3, Reckoning L3, Inversion Field L3). At wizard level 1, max castable spell level is 1, so P1 literally cannot cast anything. Two issues: (1) the design's 'on level-up, replace one prepared spell from your deck' rule is NOT implemented in endRoundAndLevelUp, so P1 can't dig toward a castable L1 spell; (2) even with it, an all-high-level prepared opening is near-unrecoverable. The Prepare step should probably bias toward / guarantee some castable spells, or leveling must let you cycle prepared spells. P1 will get burned out while bricked.

> **P1 (Abjuration) thinks:** As P1 (Abjuration), bricked on castable spells, all I can do is slowly build toward Sentinel Rune (VS) for the long game. Attach V; I'd need to survive to wizard L5 to actually cast it, which won't happen against this burn.
- **P1:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 18 | P1 HP 16 | round 1 | turn 2 | stack 0_
- _(auto-advanced 1 forced pass step(s))_
    _P0 HP 18 | P1 HP 16 | round 1 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** DESIGN TENSION worth noting: Burn expires at end of round, but casting my 2nd spell exhausts my slots and *ends the round*, wiping my own Burn. So there's real tension between tempo (cast more now) and the burn clock (hold slots to let it tick). Here I'll attach V to Spark and cast it to end Round 1 - partly to demonstrate the next finding about level-up.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 18 | P1 HP 16 | round 1 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** Cast Spark for 2 (P1 -> 14). This is my 2nd slot, so Round 1 ends and both level up. Watch P1's prepared spells across the level-up.
- **P0:** CAST Spark [EVO-001] (prepared[0])
    - P0 casts Spark [EVO-001]
    _P0 HP 18 | P1 HP 16 | round 1 | turn 3 | stack 1_
- _(auto-advanced 2 forced pass step(s))_
    - P1 takes 2 damage
    - → Spark [EVO-001] resolves
    - round 1 ends — level up
    _P0 HP 18 | P1 HP 14 | round 2 | turn 4 | stack 0_

> **P0 (Evocation) thinks:** Round 2 plan: re-apply Burning Hands, then HOLD my 2nd slot (don't cast again) so the round stays open and Burn ticks each of P1's turns. Also noting hand-flood: both at 9 cards from the round-start draw-5; decks dropping fast (deckout looms).
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 18 | P1 HP 14 | round 2 | turn 4 | stack 0_

> **P0 (Evocation) thinks:** Cast Burning Hands (P1 14->13, +1 Burn).
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 18 | P1 HP 14 | round 2 | turn 4 | stack 1_
- _(auto-advanced 2 forced pass step(s))_
    - P1 takes 1 damage
    - → Burning Hands [EVO-003] resolves
    _P0 HP 18 | P1 HP 13 | round 2 | turn 4 | stack 0_

**Result:** P0 (Evocation) winning decisively; P1 (Abjuration) hard-bricked from the
opening and unable to cast. Stopped at round 2 with P1 at 13 — outcome not in doubt.

## Analysis

This game did **not** test the Evocation–Abjuration balance. It tested the
opening/leveling system, and surfaced several real issues. P1 lost the game on the
deal, before any decision mattered.

### Findings

1. **[HIGH] All-high-level prepared opening = a hard brick.** P1's four prepared
   spells were Sentinel Rune (L2), Fortress (L3), Reckoning (L3), Inversion Field (L3).
   At wizard level 1 the max castable spell level is 1, so P1 had **zero legal casts**
   and could only attach components and pass.

2. **[HIGH] Level-up never cycles prepared spells.** The design says "upon leveling,
   each Wizard can replace one prepared spell with one from the Spell Deck." That rule
   is **not implemented** (`endRoundAndLevelUp` only refills *empty* prepared slots, and
   P1's were full). So the brick is unrecoverable. Compounding it: `maxSpellLevel` stays
   1 until **wizard level 5** (round ~5), so even P1's L2 spell is many rounds away — by
   which point the burn race is long over. *Fix: implement the level-up replace, and/or
   guarantee the opening Prepare includes 1–2 spells at or below the current max level.*

3. **[MED] Burn vs. round-end tension.** Burns expire at end of round, and a round ends
   when a wizard exhausts spell slots (i.e. by casting). So casting aggressively **wipes
   your own DoT** — Burning Hands' marker only ticked twice all game. This makes the Burn
   archetype self-defeating under fast play. *Fix needs a design call: give Burn its own
   duration (e.g. "until your Nth turn") independent of round-end, or don't clear it on
   level-up.*

4. **[MED] Hand flood + fast deck-out.** The round-start draw-of-5 pushed both hands to
   **9 cards by round 2**, with no maximum hand size, while decks dropped ~7 cards in 4
   turns. Games will be deck-out-dominated and hands will balloon. *Consider a hand-size
   limit (discard to N at end of turn) and/or a smaller round-start draw — a design call.*

5. **[OBSERVATION] An anti-tempo incentive exists.** Because casting both spells ends the
   round (clearing Burn and leveling a bricked opponent toward relevance), the Evo player
   is sometimes incentivized to *hold* a slot rather than cast. Interesting depth, but
   currently swamped by Finding 1.

### Next playtest

Re-run Evocation vs Abjuration only **after** the level-up "replace a prepared spell"
rule exists and the opening guarantees castable spells — otherwise the matchup result is
pure draw-luck. Until then, balance numbers from this matchup are not meaningful.

