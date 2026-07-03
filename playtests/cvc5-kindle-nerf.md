# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-03
- Seed: 505
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Restarted (misprepped first attempt). Abj first: Shell/Aegis/Echo/Seal.
- **P1:** prepare Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Runic Seal [ABJ-010]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Evocation) thinks:** Evo: Kindle/BH/VolCharge/Backdraft.
- **P0:** prepare Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Burning Hands [EVO-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Kindle now 1 marker - still the engine opener, half the clock.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 ward destroyed
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** 1-marker tick fully eaten by the 1HP ward - the nerf is visible immediately. Aegis ends the round.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_

> **P0 (Evocation) thinks:** Backdraft the Aegis: 2 face.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    - → Aegis [ABJ-004] resolves
    - round 1 ends — level up
    _P0 HP 30 | P1 HP 28 | round 2 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 3 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 28 | round 2 | turn 3 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Abj R2: early Seal on Kindle.
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[3]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_
- **P0:** pass priority
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** Chalk + VolCharge = 4 to naked face.
- **P0:** PLAY Empowered Chalk [ITM-007] (trainer)
    - P0 plays Empowered Chalk [ITM-007]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_

> **P1 (Abjuration) thinks:** Echo: prevent 1 of the Chalked 4.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 2_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 5 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 takes 3 damage
    - → Volatile Charge [EVO-008] resolves
    _P0 HP 29 | P1 HP 25 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 0_
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** Shell ends R2 (slot 2) - Evo denied a slot.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 1_
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 1_

> **P0 (Evocation) thinks:** Backdraft the Shell.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal x2 [CMP-VV]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 2_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 25 | round 2 | turn 6 | stack 2_
- **P0:** pass priority
    - P1 takes 3 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 29 | P1 HP 22 | round 2 | turn 6 | stack 1_
    _P0 HP 29 | P1 HP 22 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 22 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    - round 2 ends — level up
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P0:** prepare Battery [EVO-009]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_

> **P1 (Abjuration) thinks:** R3: Abj 22 vs 29 with NO burn on board - the clock is visibly slower post-nerf. Re-Seal Kindle.
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[3]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 1_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 1_
- **P0:** pass priority
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 0_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 0_

> **P0 (Evocation) thinks:** Battery via VSM (pays VM with one card): chip + draw.
- **P0:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 0_
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
- **P1:** pass priority
    - P1 ward destroyed
    - P1 takes 1 damage
    - → Battery [EVO-009] resolves
    _P0 HP 29 | P1 HP 21 | round 3 | turn 8 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 8 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 0_

> **P1 (Abjuration) thinks:** Quenching in hand - burn plan is now dead on arrival. Fortify wall.
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 9 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 21 | round 3 | turn 10 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 3 | turn 10 | stack 0_

> **P0 (Evocation) thinks:** Trance + BH via VSM: 4dmg - ward 1 = 3 face + marker.
- **P0:** PLAY Battle Trance [GAM-010] (trainer)
    - P0 plays Battle Trance [GAM-010]
    - P0 takes 2 damage
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 0_
- **P0:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 0_
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_

> **P1 (Abjuration) thinks:** Echo the Tranced BH: prevent 2 with ward up.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Verbal/Somatic [CMP-VS]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 2_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 21 | round 3 | turn 10 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward destroyed
    - P1 takes 1 damage
    - → Burning Hands [EVO-003] resolves
    _P0 HP 27 | P1 HP 20 | round 3 | turn 10 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 0_
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 0_

> **P1 (Abjuration) thinks:** Shell ends R3. Score 19 vs 27, no burn - vastly better than the 11-13 at this stage pre-nerf.
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 1_
    _P0 HP 27 | P1 HP 19 | round 3 | turn 11 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    - round 3 ends — level up
    _P0 HP 27 | P1 HP 19 | round 4 | turn 11 | stack 0_
    _P0 HP 27 | P1 HP 19 | round 4 | turn 11 | stack 0_
- **P1:** done preparing
    _P0 HP 27 | P1 HP 19 | round 4 | turn 11 | stack 0_
- **P0:** done preparing
    _P0 HP 27 | P1 HP 19 | round 4 | turn 12 | stack 0_
    _P0 HP 27 | P1 HP 19 | round 4 | turn 12 | stack 0_

> **P1 (Abjuration) thinks:** Second Wind: back to 24. The Bastion package assembling.
- **P1:** PLAY Second Wind [GAM-009] (trainer)
    - P1 plays Second Wind [GAM-009]
    - P1 heals 5
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 1_
- **P1:** pass priority
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 1_
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 1_
- **P0:** pass priority
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 0_
    _P0 HP 27 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 0_
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 0_

> **P0 (Evocation) thinks:** Score 27-24, nearly even at R4 - the matchup is a real fight now. VolCharge.
- **P0:** attach Verbal x2 [CMP-VV] → prepared[2]
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_

> **P1 (Abjuration) thinks:** Echo w/ ward: prevent 2.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic/Material [CMP-SM]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 2_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 24 | round 4 | turn 13 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - → Volatile Charge [EVO-008] resolves
    _P0 HP 26 | P1 HP 24 | round 4 | turn 13 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_
- **P1:** PLAY Aegis Charm [GAM-011] (trainer)
    - P1 plays Aegis Charm [GAM-011]
    - P1 ward → 3 HP
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_

> **P1 (Abjuration) thinks:** Aegis Charm 3HP + Shell: wall 4 total, still holding Quenching.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 1_
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 1_
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_
    _P0 HP 26 | P1 HP 24 | round 4 | turn 14 | stack 0_

## Analysis

CALLED at R4/T14 as COMPETITIVE (Evo 26, Abj 24): the gated fix worked. Pre-nerf, matches 3 and 4 were both effectively over at this exact point (Abj 6-11 HP under a 4-5 marker stack, dead by R4). Post-nerf: zero burn on board at R4, Abj at 24 behind a [3,1] wall with Quenching Salts held in reserve, Evo grinding with self-damaging pushes (Trance/VolCharge cost it 4 self-HP). WHY 2->1 WAS ENOUGH: one marker per Kindle means each tick is 1-2 damage, which a single ward HP fully absorbs - the engine still pressures but no longer compounds past the ward layer; and the mere THREAT of a held Quenching now makes committing multiple Kindle casts a losing trade. Evo pivoted correctly to burst lines (Chalk/Trance + VolCharge) which cost HP and cards - real tradeoffs. Both L2 unlocks arrive next round into an even game = healthy midgame shape. RPS SPILLOVER (the user's concern): the nerf lowers Evo's floor everywhere, but vs Divination the 2-marker Kindle was overkill rather than load-bearing - Div has NO wards, so ticks always hit face and Evo's untouched direct-damage suite (Fireball/HexBolt/VolCharge) was already the dominant edge there (~100% in every prior read). Low risk the Evo>Div edge flips; needs a piloted Div session to confirm (Div's own identity untested piloted). Abj-vs-Div and mirrors untouched by this change. NEXT: piloted Div matches (both pairings), then first-player last-turn rule for the slot-strangle.

