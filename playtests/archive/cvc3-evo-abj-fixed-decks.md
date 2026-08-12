# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-03
- Seed: 303
- Controller: Claude (self-play, both sides)

## Match log

> **P0 (Evocation) thinks:** Match 3, fixed decks. Same kits both sides: Evo Kindle/BH/VolCharge/Backdraft; P0 goes first this seed.
- **P0:** prepare Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Burning Hands [EVO-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Abjuration) thinks:** Abj standard kit: Shell/Aegis/Echo/Seal.
- **P1:** prepare Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Runic Seal [ABJ-010]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P0 (Evocation) thinks:** Every card in the opener is live - the recipe fix at work.
- **P0:** PLAY Recharge [GAM-004] (trainer)
    - P0 plays Recharge [GAM-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 takes 2 damage
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_

> **P1 (Abjuration) thinks:** Abj opener all-live too (S,S,S,SM,SM). Shell up.
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_

> **P0 (Evocation) thinks:** Backdraft the Shell pre-ward.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 30 | P1 HP 26 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 26 | round 1 | turn 2 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 26 | round 1 | turn 2 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** VolCharge: 3 through the 1HP ward = 2 face.
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_

> **P1 (Abjuration) thinks:** Echo w/ ward: prevent 2, ward survives, 0 face.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - → Volatile Charge [EVO-008] resolves
    - round 1 ends — level up
    _P0 HP 29 | P1 HP 26 | round 2 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** Evo ended R1 via its own slots this time - the strangle cuts both ways with first-player.
- **P0:** done preparing
    _P0 HP 29 | P1 HP 26 | round 2 | turn 3 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_

> **P0 (Evocation) thinks:** R2: re-Kindle, stack burn while their ward is 1HP.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 1_
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 3
    - P1 takes 3 damage
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_

> **P1 (Abjuration) thinks:** Abj: hand fully live again. Early Seal on Kindle.
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[3]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_

> **P0 (Evocation) thinks:** Backdraft the Seal - 2 face, no ward up.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal/Material [CMP-VM]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 2_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 29 | P1 HP 21 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 21 | round 2 | turn 5 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 29 | P1 HP 21 | round 2 | turn 5 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 0_

> **P0 (Evocation) thinks:** VolCharge to naked face + ends round = Abj denied slot 2 again. Evo has the tempo whip this seed.
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_

> **P1 (Abjuration) thinks:** Echo: prevent 1 of the 3 (no ward).
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 2_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 21 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    - P0 takes 1 damage
    - P1 takes 2 damage
    - → Volatile Charge [EVO-008] resolves
    - round 2 ends — level up
    _P0 HP 28 | P1 HP 19 | round 3 | turn 6 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 3 | turn 6 | stack 0_
- **P0:** prepare Battery [EVO-009]
    _P0 HP 28 | P1 HP 19 | round 3 | turn 6 | stack 0_
- **P0:** done preparing
    _P0 HP 28 | P1 HP 19 | round 3 | turn 6 | stack 0_
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 28 | P1 HP 19 | round 3 | turn 6 | stack 0_
- **P1:** done preparing
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 0_
- **P0:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 1_
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 3 | turn 7 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 takes 4 damage
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 0_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 0_

> **P1 (Abjuration) thinks:** Abj: burn 3 ticking - wall up NOW.
- **P1:** attach Somatic/Material [CMP-SM] → prepared[0]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 1_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 1_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 0_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 8 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_
- **P0:** PLAY Arcane Study [GAM-001] (trainer)
    - P0 plays Arcane Study [GAM-001]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_

> **P0 (Evocation) thinks:** Bank the Lens, keep components.
- **P0:** choose Scrying Lens [ITM-001]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_

> **P0 (Evocation) thinks:** BH: keep the burn stack alive through their 1HP ward.
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 1_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 1_
- **P1:** pass priority
    - P1 ward destroyed
    - → Burning Hands [EVO-003] resolves
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_
    _P0 HP 28 | P1 HP 15 | round 3 | turn 9 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 takes 4 damage
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 0_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 0_

> **P1 (Abjuration) thinks:** Fortify - every ward HP is a burn tick eaten.
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 1_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 1_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 0_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 10 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 0_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 0_

> **P0 (Evocation) thinks:** VolCharge closes the round - Abj to single digits with burn 3 live.
- **P0:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_

> **P1 (Abjuration) thinks:** Echo: prevent 2 w/ ward - must.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic/Material [CMP-SM]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 2_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 11 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    - P0 takes 1 damage
    - P1 ward destroyed
    - → Volatile Charge [EVO-008] resolves
    - round 3 ends — level up
    _P0 HP 27 | P1 HP 11 | round 4 | turn 11 | stack 0_
    _P0 HP 27 | P1 HP 11 | round 4 | turn 11 | stack 0_
- **P0:** done preparing
    _P0 HP 27 | P1 HP 11 | round 4 | turn 11 | stack 0_
- **P1:** done preparing
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 0_
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 0_

> **P0 (Evocation) thinks:** Kindle #3: burn to 5 markers - ticks 5,4,3... lethal without a big wall.
- **P0:** attach Verbal x2 [CMP-VV] → prepared[0]
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 1_
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 0_
    _P0 HP 27 | P1 HP 11 | round 4 | turn 12 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 5
    - P1 takes 5 damage
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 0_
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 0_

> **P1 (Abjuration) thinks:** Abj: 6HP vs burn 4 - no wall survives ticks 4+3. Playing it out.
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 1_
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 1_
- **P1:** pass priority
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 1_
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 0_
    _P0 HP 27 | P1 HP 6 | round 4 | turn 13 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 27 | P1 HP 6 | round 4 | turn 14 | stack 0_
    _P0 HP 27 | P1 HP 6 | round 4 | turn 14 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 ward destroyed
    - P1 takes 3 damage
    _P0 HP 27 | P1 HP 3 | round 4 | turn 15 | stack 0_
    _P0 HP 27 | P1 HP 3 | round 4 | turn 15 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 27 | P1 HP 3 | round 4 | turn 16 | stack 0_
    _P0 HP 27 | P1 HP 3 | round 4 | turn 16 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 3
    - P1 takes 3 damage
    - GAME OVER — P0 wins (hp)
    _P0 HP 27 | P1 HP 0 | round 4 | turn 17 | stack 0_

**Result:** P0 wins (hp), round 4. Final HP: P0 27, P1 0.
    _P0 HP 27 | P1 HP 0 | round 4 | turn 17 | stack 0_

**Result:** P0 wins (hp), round 4. Final HP: P0 27, P1 0.

## Analysis

VERDICT: Evo wins by HP round 4 (27 vs 0) - the fastest, cleanest game of the three. THE DECK FIX WORKED PERFECTLY: zero dead turns on either side across the whole match (vs ~6 combined in match 2); every hand was fully live; both players executed their actual gameplans every turn. AND THAT REVEALED THE REAL BALANCE PICTURE for the first time: with consistency equalized, Evocation's persistent-burn engine is overwhelming at low levels. Kindle (V: 2 markers) recast every round plus Burning Hands compounded to a 5-marker stack = 5+4+3+2+1 inevitable damage; Abjuration's L1 answers (1HP wards from Shell/Fortify, Echo Shield prevent-1-2) eat single ticks, not stacks. Abj died before its L2 tools mattered. CLEAN BALANCE LEVERS NOW VISIBLE: (1) burn stacking rate - Kindle at 2 markers/V every round is the engine; consider 1 marker or a stack cap; (2) L1 ward sizes (1HP) are token vs stacked burn - consider 2HP base; (3) Abjuration's anti-burn tech EXISTS - Quenching Salts GAM-013 clears all burn + heals per marker - but the fixed 3-neutral-trainer recipe never includes it; authored per-school decks with matchup tech (PROJECT_PLAN 10a step 2, using the role column) is the natural next step; (4) the slot-strangle favored the FIRST player this game (Evo P0) - both matches confirm round-ending tempo is first-player-biased, supporting a last-turn rule. THREE-MATCH ARC: m1 deckout-rigged (structural), m2 color-screw lottery (variance), m3 clean read (balance). The infrastructure debugging is done - from here on, results measure the actual game.

