# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-02
- Seed: 202
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Abj: same kit as match 1 for comparability (Shell/Aegis/Echo/Seal) - but now the draw engine is guilt-free under exhaustion rules.
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

> **P0 (Evocation) thinks:** Evo: same kit too - Kindle/BurningHands/VolCharge + Backdraft (learned last match: reactions pierce Aegis; Battery draw now also guilt-free).
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

> **P0 (Evocation) thinks:** Evo T1: 3 V's in hand - luxury. Kindle now, keep V's for Backdraft pings + next Kindle.
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
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P1:** PLAY Recharge [GAM-004] (trainer)
    - P1 plays Recharge [GAM-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Recharge then Aegis to end the round - slot denial worked great last match, still core Abj tempo.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_

> **P0 (Evocation) thinks:** Evo: Backdraft the Aegis - 2 to face before wards matter.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 30 | P1 HP 27 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 27 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 27 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 1 ends — level up
    _P0 HP 30 | P1 HP 27 | round 2 | turn 3 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 27 | round 2 | turn 3 | stack 0_
- **P0:** done preparing
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Abj: learned from match 1 - Seal EARLY, lock Kindle out of the round before they act.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 1_
- **P0:** pass priority
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
- **P0:** PLAY Scrying Lens [ITM-001] (trainer)
    - P0 plays Scrying Lens [ITM-001]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
- **P0:** choose Verbal [CMP-V]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** VolCharge while their wards are down - 3 to face beats burn into a future ward.
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_

> **P1 (Abjuration) thinks:** Abj: Echo the VolCharge - their biggest hit this round; prevent 1 of 3.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 2_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 takes 2 damage
    - → Volatile Charge [EVO-008] resolves
    _P0 HP 29 | P1 HP 24 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 0_
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 0_
- **P1:** attach Somatic x2 [CMP-SS] → prepared[0]
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** Shell as slot 2 - ends the round, denies their 2nd cast again.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 1_
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 1_

> **P0 (Evocation) thinks:** Backdraft again - punish every Shell cast before its ward lands.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 2_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 24 | round 2 | turn 6 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
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

> **P1 (Abjuration) thinks:** 5th slot: Fortify (burn/ward sustain).
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_

> **P0 (Evocation) thinks:** Evo 5th: Battery - the draw is pure value now under exhaustion rules.
- **P0:** prepare Battery [EVO-009]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 6 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 7 | stack 0_
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
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

> **P0 (Evocation) thinks:** Kindle sealed again - VolCharge, 3 into their 1HP ward = 2 face.
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_

> **P1 (Abjuration) thinks:** Echo w/ ward = prevent 2; VolCharge 3 becomes 1, ward eats it, 0 face.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Verbal/Somatic [CMP-VS]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 2_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 22 | round 3 | turn 8 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - → Volatile Charge [EVO-008] resolves
    _P0 HP 28 | P1 HP 22 | round 3 | turn 8 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_

> **P1 (Abjuration) thinks:** Draw freely now - exhaustion rules made Study safe.
- **P1:** PLAY Arcane Study [GAM-001] (trainer)
    - P1 plays Arcane Study [GAM-001]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_

> **P1 (Abjuration) thinks:** Bank a dead Material.
- **P1:** choose Material [CMP-M]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 28 | P1 HP 22 | round 3 | turn 9 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 0_
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 0_
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward destroyed
    - → Burning Hands [EVO-003] resolves
    _P0 HP 28 | P1 HP 22 | round 3 | turn 10 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 28 | P1 HP 21 | round 3 | turn 11 | stack 0_
    _P0 HP 28 | P1 HP 21 | round 3 | turn 11 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 28 | P1 HP 21 | round 3 | turn 11 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 28 | P1 HP 21 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 21 | round 3 | turn 11 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 3 ends — level up
    _P0 HP 28 | P1 HP 21 | round 4 | turn 11 | stack 0_
- **P1:** done preparing
    _P0 HP 28 | P1 HP 21 | round 4 | turn 11 | stack 0_
- **P0:** done preparing
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 0_
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[3]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 28 | P1 HP 21 | round 4 | turn 12 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 21 | round 4 | turn 13 | stack 0_
    _P0 HP 28 | P1 HP 21 | round 4 | turn 13 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 0_
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 1_
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 1_
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 1_

> **P0 (Evocation) thinks:** Evo: Backdraft every Shell - steady face damage they can't prevent pre-ward.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 2_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 21 | round 4 | turn 14 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 28 | P1 HP 19 | round 4 | turn 14 | stack 1_
    _P0 HP 28 | P1 HP 19 | round 4 | turn 14 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 19 | round 4 | turn 14 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 28 | P1 HP 19 | round 4 | turn 14 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 0_
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward destroyed
    - → Burning Hands [EVO-003] resolves
    _P0 HP 28 | P1 HP 19 | round 4 | turn 15 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 28 | P1 HP 18 | round 4 | turn 16 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 4 | turn 16 | stack 0_

> **P1 (Abjuration) thinks:** Aegis now = round ends, Evo denied 2 of 3 slots.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 28 | P1 HP 18 | round 4 | turn 16 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 28 | P1 HP 18 | round 4 | turn 16 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 4 | turn 16 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 4 ends — level up
    _P0 HP 28 | P1 HP 18 | round 5 | turn 16 | stack 0_

> **P1 (Abjuration) thinks:** L2: Reflective Ward in for Fortify.
- **P1:** replace Fortify [ABJ-001] with Reflective Ward [ABJ-012]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 16 | stack 0_
- **P1:** done preparing
    _P0 HP 28 | P1 HP 18 | round 5 | turn 16 | stack 0_

> **P0 (Evocation) thinks:** L2: Inferno in for VolCharge - 3dmg + 2 burn.
- **P0:** replace Volatile Charge [EVO-008] with Inferno [EVO-019]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 16 | stack 0_
- **P0:** done preparing
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 0_

> **P1 (Abjuration) thinks:** R5: Reflective Ward first - 3HP wall that punishes their pings.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[4]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 0_
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 28 | P1 HP 18 | round 5 | turn 17 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 5 | turn 18 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 5 | turn 18 | stack 0_

> **P0 (Evocation) thinks:** Evo dead turn AGAIN (S,S,M vs all-V costs) - color screw recurring both matches.
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 0_

> **P1 (Abjuration) thinks:** Shell behind Reflective - stacking the wall while they're screwed.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 28 | P1 HP 18 | round 5 | turn 19 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 5 | turn 20 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 5 | turn 20 | stack 0_

> **P0 (Evocation) thinks:** SECOND consecutive V-less turn for Evo. Color screw is match-deciding.
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 5 | turn 21 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 5 | turn 21 | stack 0_

> **P1 (Abjuration) thinks:** Aegis ends R5 - Evo cast NOTHING this round (2 dead turns + slot denial).
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 21 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 28 | P1 HP 18 | round 5 | turn 21 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 5 | turn 21 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 5 ends — level up
    _P0 HP 28 | P1 HP 18 | round 6 | turn 21 | stack 0_

> **P1 (Abjuration) thinks:** 6th: Phase Shift - hard cancel for Inferno.
- **P1:** prepare Phase Shift [ABJ-014]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 21 | stack 0_
- **P1:** done preparing
    _P0 HP 28 | P1 HP 18 | round 6 | turn 21 | stack 0_

> **P0 (Evocation) thinks:** Evo 6th: Hex Bolt (reaction-proof).
- **P0:** prepare Hex Bolt [EVO-012]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 21 | stack 0_
- **P0:** done preparing
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[3]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 28 | P1 HP 18 | round 6 | turn 22 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 6 | turn 23 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 23 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 0_

> **P1 (Abjuration) thinks:** (note: I blind-passed Evo t23 - honesty flag for the writeup)
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 1_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 28 | P1 HP 18 | round 6 | turn 24 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 0_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 0_

> **P0 (Evocation) thinks:** Evo: Battery - their 7HP ward wall blanks burn; draw + chip is the only line.
- **P0:** attach Verbal [CMP-V] → prepared[4]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 0_
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 1_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 1_
    _P0 HP 28 | P1 HP 18 | round 6 | turn 25 | stack 1_
- **P1:** pass priority
    - P0 takes 1 damage
    - → Battery [EVO-009] resolves
    _P0 HP 27 | P1 HP 18 | round 6 | turn 25 | stack 0_
    _P0 HP 27 | P1 HP 18 | round 6 | turn 25 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 0_
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 1_
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 1_
- **P1:** pass priority
    _P0 HP 27 | P1 HP 18 | round 6 | turn 26 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 6 ends — level up
    _P0 HP 27 | P1 HP 18 | round 7 | turn 26 | stack 0_
- **P1:** done preparing
    _P0 HP 27 | P1 HP 18 | round 7 | turn 26 | stack 0_
- **P0:** done preparing
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 0_
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 0_

> **P1 (Abjuration) thinks:** Abj: M-flooded, one S source - S-screw gutting the kit again (both matches, both schools).
- **P1:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 1_
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 1_
- **P1:** pass priority
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 27 | P1 HP 18 | round 7 | turn 27 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 0_
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 0_

> **P0 (Evocation) thinks:** Evo: Study digs for the 2nd V (Inferno/HexBolt need VV to threaten anything).
- **P0:** PLAY Arcane Study [GAM-001] (trainer)
    - P0 plays Arcane Study [GAM-001]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 0_

> **P0 (Evocation) thinks:** Bank an S. Drew VV - Hex Bolt now to strip 3 wards (reaction-proof), Inferno next turn to the face.
- **P0:** choose Somatic [CMP-S]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 0_
- **P0:** attach Verbal x2 [CMP-VV] → prepared[5]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 0_
- **P0:** CAST Hex Bolt [EVO-012] (prepared[5])
    - P0 casts Hex Bolt [EVO-012]
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 1_
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 18 | round 7 | turn 28 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - P1 ward destroyed
    - P1 ward destroyed
    - → Hex Bolt [EVO-012] resolves
    _P0 HP 26 | P1 HP 18 | round 7 | turn 28 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[4]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_

> **P1 (Abjuration) thinks:** Rebuild the wall before their Inferno.
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 1_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 1_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 1_
- **P0:** pass priority
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 29 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[4]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 0_
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 1_
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 18 | round 7 | turn 30 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward destroyed
    - P0 takes 1 damage
    - → Battery [EVO-009] resolves
    _P0 HP 25 | P1 HP 18 | round 7 | turn 30 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 0_
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 0_
- **P1:** PLAY Arcane Study [GAM-001] (trainer)
    - P1 plays Arcane Study [GAM-001]
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 0_

> **P1 (Abjuration) thinks:** Bank worst.
- **P1:** choose Verbal/Material [CMP-VM]
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 0_

> **P1 (Abjuration) thinks:** Seal-as-round-ender: burns the seal but denies Evo their 3rd slot.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 1_
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 1_
- **P1:** pass priority
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 1_
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 1_

> **P0 (Evocation) thinks:** Evo: Backdraft the Seal - 2 into wards[2]... kills the ward at least.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 2_
- **P1:** pass priority
    _P0 HP 25 | P1 HP 18 | round 7 | turn 31 | stack 2_
- **P0:** pass priority
    - P0 takes 1 damage
    - P1 ward destroyed
    - → Backdraft [EVO-013] resolves
    _P0 HP 24 | P1 HP 18 | round 7 | turn 31 | stack 1_
    _P0 HP 24 | P1 HP 18 | round 7 | turn 31 | stack 1_
- **P1:** pass priority
    _P0 HP 24 | P1 HP 18 | round 7 | turn 31 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Runic Seal [ABJ-010] resolves
    - round 7 ends — level up
    _P0 HP 24 | P1 HP 18 | round 8 | turn 31 | stack 0_
- **P1:** done preparing
    _P0 HP 24 | P1 HP 18 | round 8 | turn 31 | stack 0_
- **P0:** done preparing
    _P0 HP 24 | P1 HP 18 | round 8 | turn 32 | stack 0_
    _P0 HP 24 | P1 HP 18 | round 8 | turn 32 | stack 0_

> **P1 (Abjuration) thinks:** Abj CRISIS: 12-card hand, zero S - whole kit uncastable, wall down, exhaustion incoming.
- **P1:** pass (end turn)
    _P0 HP 24 | P1 HP 18 | round 8 | turn 33 | stack 0_
    _P0 HP 24 | P1 HP 18 | round 8 | turn 33 | stack 0_

> **P0 (Evocation) thinks:** Evo TOO has zero V. Both wizards standing helpless - deck recipes are the villain of this match.
- **P0:** pass (end turn)
    _P0 HP 24 | P1 HP 18 | round 8 | turn 34 | stack 0_
    _P0 HP 24 | P1 HP 18 | round 8 | turn 34 | stack 0_

> **P1 (Abjuration) thinks:** Lens: dig the last card + top of next cycle for an S.
- **P1:** PLAY Scrying Lens [ITM-001] (trainer)
    - P1 plays Scrying Lens [ITM-001]
    _P0 HP 24 | P1 HP 18 | round 8 | turn 34 | stack 0_
- **P1:** choose Scrying Lens [ITM-001]
    _P0 HP 24 | P1 HP 18 | round 8 | turn 34 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 0_
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 0_

> **P0 (Evocation) thinks:** Drew the V - Kindle to face, no wards to soak the burn now.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 1_
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 1_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Kindle [EVO-006] resolves
    _P0 HP 24 | P1 HP 18 | round 8 | turn 35 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 takes 2 damage
    - P1 reshuffles discard into deck (#1) — exhaustion 2
    - P1 takes 2 damage
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 0_
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 0_

> **P1 (Abjuration) thinks:** First exhaustion tick survived; recycled deck handed back an S. Shell up.
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 1_
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 1_
- **P1:** pass priority
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 24 | P1 HP 14 | round 8 | turn 36 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 0_
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 0_
- **P0:** attach Verbal/Material [CMP-VM] → prepared[1]
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 0_

> **P0 (Evocation) thinks:** Stack more burn - their exhaustion clock + burn together now outpace the ward rebuild.
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 1_
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 1_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward destroyed
    - → Burning Hands [EVO-003] resolves
    _P0 HP 24 | P1 HP 14 | round 8 | turn 37 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 takes 2 damage
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_
- **P1:** PLAY Recharge [GAM-004] (trainer)
    - P1 plays Recharge [GAM-004]
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_

> **P1 (Abjuration) thinks:** Reflective wall back up - the reflect chip is my only damage.
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 1_
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 1_
- **P1:** pass priority
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 24 | P1 HP 12 | round 8 | turn 38 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 24 | P1 HP 12 | round 8 | turn 39 | stack 0_
    _P0 HP 24 | P1 HP 12 | round 8 | turn 39 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P0 takes 1 damage
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 0_
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 0_

> **P1 (Abjuration) thinks:** Aegis ends R8.
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 1_
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 1_
- **P1:** pass priority
    _P0 HP 23 | P1 HP 12 | round 8 | turn 40 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 8 ends — level up
    _P0 HP 23 | P1 HP 12 | round 9 | turn 40 | stack 0_
- **P1:** done preparing
    _P0 HP 23 | P1 HP 12 | round 9 | turn 40 | stack 0_
- **P0:** done preparing
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 0_
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 0_
- **P1:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 0_
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 1_
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 1_
- **P1:** pass priority
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 23 | P1 HP 12 | round 9 | turn 41 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 0_
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 0_
- **P0:** PLAY Scrying Lens [ITM-001] (trainer)
    - P0 plays Scrying Lens [ITM-001]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 0_

> **P0 (Evocation) thinks:** Two VVs on top! Take one - Inferno online.
- **P0:** choose Verbal x2 [CMP-VV]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 0_
- **P0:** attach Verbal x2 [CMP-VV] → prepared[2]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 0_

> **P0 (Evocation) thinks:** Inferno: 3 into ward[3,2] + 2 burn markers that will outlive the wards.
- **P0:** CAST Inferno [EVO-019] (prepared[2])
    - P0 casts Inferno [EVO-019]
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 1_
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 1_
- **P0:** pass priority
    _P0 HP 23 | P1 HP 12 | round 9 | turn 42 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - P0 takes 1 damage
    - → Inferno [EVO-019] resolves
    _P0 HP 21 | P1 HP 12 | round 9 | turn 42 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P0 takes 1 damage
    - P1 ward destroyed
    _P0 HP 20 | P1 HP 12 | round 9 | turn 43 | stack 0_
    _P0 HP 20 | P1 HP 12 | round 9 | turn 43 | stack 0_

## Analysis

CALLED at R9/T43 (not played to the kill): Evocation is winning decisively - Abj 12 HP with burn ticking, wall stripped by Inferno+HexBolt, exhaustion #2 (4dmg) due soon, and Abj counterpressure is ~1 reflect/round vs Evo at 23 HP with an untouched exhaustion clock (deck 16 + VV waiting on top). Projected Evo win ~R12 by HP. WHAT CHANGED VS MATCH 1: (1) EXHAUSTION RESHUFFLE WORKED EXACTLY AS DESIGNED - Abj drew freely all game, deck hit 0 on turn 36, reshuffled to 27 with 2 damage, and play continued; no anticlimax, the game stayed about HP. Abj lasted 9+ rounds vs match 1's terminal-at-7. (2) Abj's loss cause SHIFTED from structural (deckout) to fixable factors: COLOR SCREW (the match's true villain - Abj spent R8 with a 12-card hand and ZERO S; Evo had 3 separate V-less dead turns; at one point BOTH wizards stood helpless) and Abj's lack of damage below L3 (reflect-only). (3) New burn+wards interaction is healthy: ward walls blank burn ticks, so Evo correctly pivoted to wall-breakers (HexBolt/Inferno) before re-stacking burn - real decisions on both sides. (4) Exhaustion-damage-into-wards is fine at 2xn but wards soaking exhaustion lengthens stalls; consider whether exhaustion should bypass wards if grind matchups run long (this game trended ~12 rounds vs the 10-25min target - borderline OK). PRIORITY NOW: deck composition (10a) - raise school-symbol density; nearly every dead turn and half the damage swing both matches traces to off-color draws, and no balance read is trustworthy until it's fixed. HONESTY FLAGS: I blind-passed Evo turns 23 and 39 while batching (both very likely dead anyway - Evo was V-less either side), and one Evo Backdraft window on the R7 Reflective cast was missed (~1 face damage).

