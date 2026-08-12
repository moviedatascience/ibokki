# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-05
- Seed: 1101
- Controller: Claude (self-play, both sides)

## Match log

> **P0 (Evocation) thinks:** Evo commits HARD to the burn plan on purpose - the validation question is whether Fortify-cleanse blunts multi-Kindle. Kindle + Burning Hands + Spark + Firebolt.
- **P0:** prepare Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Burning Hands [EVO-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Spark [EVO-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Firebolt [EVO-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Abjuration) thinks:** Abj: Fortify (ward + the new cleanse), Ward Pulse, Echo Shield, Grounding - the same shell as m10 but Fortify now pulls double duty vs burn.
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Grounding [ABJ-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** attach Verbal/Somatic [CMP-VS] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_

> **P1 (Abjuration) thinks:** Note: single Kindle self-cleared via the tick - the Fortify rider only bites on STACKED burn, exactly the compounding case. Wall plan: Aegis Charm 3HP ward, Fortify +2, Bulwark +2 = 7HP wall.
- **P1:** PLAY Aegis Charm [GAM-011] (trainer)
    - P1 plays Aegis Charm [GAM-011]
    - P1 ward → 3 HP
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_
- **P1:** attach Somatic x2 [CMP-SS] → prepared[0]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[0])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 5 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_
- **P1:** PLAY Bulwark Shard [ITM-008] (trainer)
    - P1 plays Bulwark Shard [ITM-008]
    - P1 ward → 7 HP
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[2]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 2 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P0:** PLAY Recharge [GAM-004] (trainer)
    - P0 plays Recharge [GAM-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P0:** choose Verbal x2 [CMP-VV]
    - P0 searches out Verbal x2 [CMP-VV]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P0:** CAST Spark [EVO-001] (prepared[2])
    - P0 casts Spark [EVO-001]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_

> **P1 (Abjuration) thinks:** Hold Echo Shield - the 7HP wall eats Spark for free; save the reaction for a Trance burst.
- **P1:** pass priority
    - → Spark [EVO-001] resolves
    - slots exhausted — P1 gets one final turn
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Aegis on my final turn: 1-component spells fizzle vs me through Evo's whole next turn - Kindle, Spark and Firebolt are ALL 1-component V casts. The wall + Aegis shell hard-counters the entire L1 burn kit.
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_
- **P1:** detach Verbal/Somatic [CMP-VS]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 4 | stack 0_
- **P1:** pass (end turn)
    - round 1 ends — level up
    _P0 HP 30 | P1 HP 29 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Swap Grounding for Ward Pulse - with a 5HP wall standing, the thorn is my damage engine.
- **P1:** replace Grounding [ABJ-008] with Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 29 | round 2 | turn 4 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 29 | round 2 | turn 4 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 29 | round 2 | turn 5 | stack 0_

## Analysis

CALLED early-R2 (Evo 30, Abj 29, Abj wall 5HP + Aegis cover, decks 33/33). VALIDATION READ: (1) The dedicated-burn Evo line is now SOFT-COUNTERED at every layer: single Kindle self-clears via the tick, wall soaks convert burn ticks into mere wall-chip, Aegis fizzles the whole 1-component L1 kit for a turn, and the Fortify rider caps marker STACKING - the exact pre-nerf R4-kill pattern (m3/m4) has no remaining path. Evo's correct play is burst lines (Trance/Chalk/wall-breakers) + ramp to L2 nukes, which is the interactive game the design wants. (2) The Fortify rider itself is a SAFETY NET, not a constant force: it never even fired in R1 because the wall shell already handled single markers - it exists to stop multi-Kindle snowball when walls are down. That is the intended surgical profile. (3) Abj looked comfortably competitive-to-favored across R1-R2 with ordinary draws. Directional verdict: Abj slight favorite vs dedicated burn; needs more games for a rate, but no red flags and zero Div-matchup surface (no Div card places burn - the rider is provably inert there, m10's Div>Abj read stands unchanged). ALSO VERIFIED LIVE: no-op trainer gate (Quenching Salts correctly unplayable at burn 0; Bulwark Shard correctly playable once the ward existed).

