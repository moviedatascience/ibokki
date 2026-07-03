# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-02
- Seed: 101
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Abj vs Evo plan: Arcane Shell punishes their removal, Aegis blanks 1-component turns, Echo Shield prevents, Runic Seal denies their best threat each round.
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

> **P0 (Evocation) thinks:** Evo plan: persistent burn makes Kindle premium (2 markers/V). Burning Hands adds more. Volatile Charge = efficient 3dmg. Searing Word strips their hand components = starves reactions.
- **P0:** prepare Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Burning Hands [EVO-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Searing Word [EVO-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** T1 Abj: gambit value first, then Shell ward; hold S's in hand to pay Echo Shield at reaction speed.
- **P1:** PLAY Arcane Study [GAM-001] (trainer)
    - P1 plays Arcane Study [GAM-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Bank the Verbal - Abj is all-S costs, V is dead weight.
- **P1:** choose Verbal [CMP-V]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Ward up early: if Evo breaks it I draw 2.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Learned: casting is 1/turn even with 2 slots/round. Aegis waits; Echo Shield covers their turn (prevent 2 with my ward up).
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Evo T1: Kindle over direct damage - burn ticks at turn start, immune to their Echo Shield prevention, and persistent burn now compounds.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_

> **P1 (Abjuration) thinks:** Abj: no react - Kindle deals 0 direct damage, Echo Shield would prevent nothing.
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Pre-fuel VolCharge with VS, and add a 2nd card next - a 2-component cast dodges Aegis (fizzles only 1-component spells).
- **P0:** attach Verbal/Somatic [CMP-VS] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Abj T2: burn is real now (ward broke, 1 face). Recharge for ramp, then Aegis - their 2-card hand makes dodging it expensive.
- **P1:** PLAY Recharge [GAM-004] (trainer)
    - P1 plays Recharge [GAM-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 29 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 1 ends — level up
    _P0 HP 30 | P1 HP 29 | round 2 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** FINDING: round ends the moment either wizard exhausts slots - Evo lost its 2nd slot AND the pre-attached components (discarded at round end). Slot-dumping = tempo denial. Abj keeps its kit.
- **P1:** done preparing
    _P0 HP 30 | P1 HP 29 | round 2 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 29 | round 2 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** Evo R2: swap Searing Word for Backdraft - Reactions dodge Aegis fizzle, and Abj casts every turn = guaranteed 2dmg pings.
- **P0:** replace Searing Word [EVO-004] with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 29 | round 2 | turn 3 | stack 0_
- **P0:** done preparing
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Abj R2: re-Shell. The Aegis lock plan: alternate Shell+Aegis each round, tax their hand into oblivion.
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 1_

> **P0 (Evocation) thinks:** Evo: Backdraft their Shell cast - 2 to face BEFORE the new ward exists. Reactions are Evo's Aegis-proof damage.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal x2 [CMP-VV]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 2_
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 2 | turn 4 | stack 2_
- _(auto-advanced 1 forced pass step(s))_
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Pre-fuel Aegis; casting it next turn ends the round again = Evo strangled to 1 cast/round. Possible degenerate slot-race pattern - design concern.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 4 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** Evo: hand=1 Material, nothing castable (all V costs). Reaction hand-payment drained me. Dig with Arcane Study.
- **P0:** PLAY Arcane Study [GAM-001] (trainer)
    - P0 plays Arcane Study [GAM-001]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** Bank a plain Material - keep the VM dual (my only V source).
- **P0:** choose Material [CMP-M]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
- **P0:** attach Verbal/Material [CMP-VM] → prepared[0]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** Re-Kindle: keep the burn stack rolling - persistent burn makes repeated Kindle a real win condition.
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
    _P0 HP 30 | P1 HP 26 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 25 | round 2 | turn 6 | stack 0_
    _P0 HP 30 | P1 HP 25 | round 2 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** Abj: KEY REALIZATION - I deal zero damage at L1; my draw engine is depleting MY deck faster (27 vs their 34). Deckout-as-loss makes defensive card advantage self-defeating. Race to level via fast casts.
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 25 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 25 | round 2 | turn 6 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 2 ends — level up
    _P0 HP 30 | P1 HP 25 | round 3 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** 5th slot: Fortify - wards eat burn ticks, my anti-burn tech.
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 25 | round 3 | turn 6 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 25 | round 3 | turn 6 | stack 0_
    _P0 HP 30 | P1 HP 25 | round 3 | turn 6 | stack 0_

> **P0 (Evocation) thinks:** Evo 5th: Battery - damage + draw keeps my hand alive and extends my deckout lead (34 vs 27).
- **P0:** prepare Battery [EVO-009]
    _P0 HP 30 | P1 HP 25 | round 3 | turn 6 | stack 0_
- **P0:** done preparing
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 0_

> **P1 (Abjuration) thinks:** Abj R3 (3 slots): Shell now, Fortify to fatten ward, Aegis LAST to end round. Skipping Arcane Study - deckout math says stop drawing.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[4]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 0_

> **P1 (Abjuration) thinks:** (Attached to Fortify by mistake - fine: Fortify makes a 1HP ward with none up. Shell next turn.)
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 30 | P1 HP 24 | round 3 | turn 7 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 24 | round 3 | turn 8 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 8 | stack 0_

> **P0 (Evocation) thinks:** Evo DEAD TURN: hand M+M, every spell needs V. Color screw at 1 draw/turn = full stalls. FINDING: component color screw is brutal post-draw-change.
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 24 | round 3 | turn 9 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_

> **P0 (Evocation) thinks:** Evo: Battery line - V+M pays it, 2dmg clears their ward wall, and the draw fights my starvation.
- **P0:** attach Verbal [CMP-V] → prepared[4]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_

> **P1 (Abjuration) thinks:** Abj: Echo Shield prevents 2 (ward up) - Battery blanked, ward wall intact vs future burn.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 2_
- _(auto-advanced 2 forced pass step(s))_
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 1_
- **P1:** pass priority
    - → Battery [EVO-009] resolves
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 10 | stack 0_

> **P0 (Evocation) thinks:** Evo: hold the V in hand - they have 1 slot left and will end the round; pre-fueling would strand it.
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 0_
- **P1:** attach Somatic/Material [CMP-SM] → prepared[1]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 0_

> **P1 (Abjuration) thinks:** Aegis + round-end: Evo denied 2 of 3 slots this round. The slot-strangle is Abjuration's real weapon.
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 1_
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 1_

> **P0 (Evocation) thinks:** Evo: Backdraft the Aegis cast - 2dmg pops both 1HP wards so next round's burn hits face.
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 2_
- _(auto-advanced 2 forced pass step(s))_
    - P1 ward destroyed
    - P1 ward destroyed
    - → Backdraft [EVO-013] resolves
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 24 | round 3 | turn 11 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 3 ends — level up
    _P0 HP 30 | P1 HP 24 | round 4 | turn 11 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 24 | round 4 | turn 11 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 24 | round 4 | turn 12 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 1_
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 0_
    _P0 HP 30 | P1 HP 24 | round 4 | turn 13 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 0_

> **P1 (Abjuration) thinks:** Abj: Fortify ward vs the burn ticks; NEXT round the plan is Runic Seal their Kindle EARLY, before they can cast it.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[4]
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 30 | P1 HP 23 | round 4 | turn 14 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 23 | round 4 | turn 15 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 4 | turn 15 | stack 0_

> **P0 (Evocation) thinks:** Evo dead turn AGAIN (M,M vs all-V costs). Deck recipe has too much off-color for 1-draw/turn - deck construction issue 10a.
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 ward destroyed
    _P0 HP 30 | P1 HP 23 | round 4 | turn 16 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 4 | turn 16 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 23 | round 4 | turn 16 | stack 0_

> **P1 (Abjuration) thinks:** Aegis ends R4 - Evo denied 2 more slots. L2 unlocks next round.
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 30 | P1 HP 23 | round 4 | turn 16 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 23 | round 4 | turn 16 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 4 ends — level up
    _P0 HP 30 | P1 HP 23 | round 5 | turn 16 | stack 0_

> **P1 (Abjuration) thinks:** L2 unlock: Reflective Ward over Fortify - 3HP ward + chip damage, Abj finally hits back.
- **P1:** replace Fortify [ABJ-001] with Reflective Ward [ABJ-012]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 16 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 23 | round 5 | turn 16 | stack 0_

> **P0 (Evocation) thinks:** Evo: Volatile Charge out, Inferno in - 3dmg + 2 burn markers is the persistent-burn payoff.
- **P0:** replace Volatile Charge [EVO-008] with Inferno [EVO-019]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 16 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 0_

> **P1 (Abjuration) thinks:** Abj: Runic Seal EARLY this time - lock Kindle out of the whole round before they act.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 0_
- **P1:** CAST Runic Seal [ABJ-010] (prepared[3])
    - P1 casts Runic Seal [ABJ-010]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Runic Seal [ABJ-010] resolves
    _P0 HP 30 | P1 HP 23 | round 5 | turn 17 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_

> **P0 (Evocation) thinks:** Evo: Kindle sealed, hand all-M again. Scrying Lens digs for a V.
- **P0:** PLAY Scrying Lens [ITM-001] (trainer)
    - P0 plays Scrying Lens [ITM-001]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_

> **P0 (Evocation) thinks:** Take the VSM tri - most flexible, pairs with anything for Inferno's VV.
- **P0:** choose Verbal/Somatic/Material [CMP-VSM]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_
- **P0:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 0_
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 1_
    _P0 HP 30 | P1 HP 23 | round 5 | turn 18 | stack 1_
- **P1:** pass priority
    - P1 takes 1 damage
    - → Burning Hands [EVO-003] resolves
    _P0 HP 30 | P1 HP 22 | round 5 | turn 18 | stack 0_
    _P0 HP 30 | P1 HP 22 | round 5 | turn 18 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_

> **P1 (Abjuration) thinks:** Abj: V-flooded hand, all-S costs - the color screw cuts both ways. Lens digs for S.
- **P1:** PLAY Scrying Lens [ITM-001] (trainer)
    - P1 plays Scrying Lens [ITM-001]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_
- **P1:** choose Somatic [CMP-S]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[4]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_

> **P1 (Abjuration) thinks:** S found: Reflective Ward via S+VS - 3HP ward, chips them on every prevention.
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 30 | P1 HP 21 | round 5 | turn 19 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 0_
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[4]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 0_

> **P0 (Evocation) thinks:** Battery into their ward - trade 2 into the 3HP ward, eat 1 reflect, keep drawing.
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 21 | round 5 | turn 20 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - → Battery [EVO-009] resolves
    _P0 HP 29 | P1 HP 21 | round 5 | turn 20 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 0_
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 1_
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 1_
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal/Material [CMP-VM]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 29 | P1 HP 21 | round 5 | turn 21 | stack 2_
- _(auto-advanced 2 forced pass step(s))_
    - P0 takes 1 damage
    - P1 ward destroyed
    - P1 takes 1 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 28 | P1 HP 20 | round 5 | turn 21 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 20 | round 5 | turn 21 | stack 1_
- **P0:** pass priority
    - → Aegis [ABJ-004] resolves
    - round 5 ends — level up
    _P0 HP 28 | P1 HP 20 | round 6 | turn 21 | stack 0_
    _P0 HP 28 | P1 HP 20 | round 6 | turn 21 | stack 0_

> **P1 (Abjuration) thinks:** 6th slot: Phase Shift - a real cancel for their Inferno.
- **P1:** prepare Phase Shift [ABJ-014]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 21 | stack 0_
- **P1:** done preparing
    _P0 HP 28 | P1 HP 20 | round 6 | turn 21 | stack 0_

> **P0 (Evocation) thinks:** Evo 6th: Hex Bolt - reaction-proof 3dmg, dodges Phase Shift and Echo Shield entirely.
- **P0:** prepare Hex Bolt [EVO-012]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 21 | stack 0_
- **P0:** done preparing
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 0_
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 0_

> **P1 (Abjuration) thinks:** Abj: only ONE S-source in a 11-card hand. SS spells (Seal/Reflective/PhaseShift) unpayable. The S-screw guts the L2 toolkit.
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 28 | P1 HP 20 | round 6 | turn 22 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 0_
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Kindle [EVO-006] resolves
    _P0 HP 28 | P1 HP 20 | round 6 | turn 23 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 0_
- **P1:** CAST Reflective Ward [ABJ-012] (prepared[4])
    - P1 casts Reflective Ward [ABJ-012]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Reflective Ward [ABJ-012] resolves
    _P0 HP 28 | P1 HP 19 | round 6 | turn 24 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 0_
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[4]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 0_
- **P0:** CAST Battery [EVO-009] (prepared[4])
    - P0 casts Battery [EVO-009]
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 19 | round 6 | turn 25 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - → Battery [EVO-009] resolves
    _P0 HP 27 | P1 HP 19 | round 6 | turn 25 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P0 takes 1 damage
    - P1 ward destroyed
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 0_
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 0_
- **P1:** CAST Aegis [ABJ-004] (prepared[1])
    - P1 casts Aegis [ABJ-004]
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 1_
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 1_
- **P0:** REACT with Backdraft [EVO-013] (prepared[3]) paying Verbal [CMP-V]
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 2_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 19 | round 6 | turn 26 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 26 | P1 HP 17 | round 6 | turn 26 | stack 1_
    _P0 HP 26 | P1 HP 17 | round 6 | turn 26 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 17 | round 6 | turn 26 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Aegis [ABJ-004] resolves
    - round 6 ends — level up
    _P0 HP 26 | P1 HP 17 | round 7 | turn 26 | stack 0_
- **P1:** done preparing
    _P0 HP 26 | P1 HP 17 | round 7 | turn 26 | stack 0_
- **P0:** done preparing
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 0_
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 26 | P1 HP 17 | round 7 | turn 27 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 17 | round 7 | turn 28 | stack 0_
    _P0 HP 26 | P1 HP 17 | round 7 | turn 28 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 26 | P1 HP 17 | round 7 | turn 28 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 26 | P1 HP 17 | round 7 | turn 28 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 17 | round 7 | turn 28 | stack 1_
- _(auto-advanced 2 forced pass step(s))_
    - → Kindle [EVO-006] resolves
    - P1 burns for 2
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 26 | P1 HP 16 | round 7 | turn 29 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 16 | round 7 | turn 30 | stack 0_
    _P0 HP 26 | P1 HP 16 | round 7 | turn 30 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 1
    - P1 takes 1 damage
    _P0 HP 26 | P1 HP 15 | round 7 | turn 31 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 32 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 33 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 34 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 35 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 36 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 37 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 38 | stack 0_
- **P0:** pass (end turn)
    - GAME OVER — P0 wins (deckout)
    _P0 HP 26 | P1 HP 15 | round 7 | turn 39 | stack 0_

**Result:** P0 wins (deckout), round 7. Final HP: P0 26, P1 15.

## Analysis

VERDICT: Evo wins by DECKOUT even with both sides piloted competently. Abjuration played the strong lines (Aegis lock, slot-denial round-ending, early Runic Seal, Echo Shield saved for real threats, Reflective Ward) and still lost without ever being close. Root causes, in order: (1) DECKOUT-AS-INSTANT-LOSS is structurally rigged against Abjuration - its whole identity (Arcane Shell draw rider, Arcane Study, Grounding) spends its own deck; final decks 20 vs 0. Recommend deckout = fatigue damage per missed draw instead of instant loss. (2) COMPONENT COLOR SCREW: at 1 draw/turn, both sides had repeated dead turns (Evo held M/M vs all-V costs; Abj held 11 cards with ONE S vs all-S costs, making its L2 SS toolkit uncastable). Deck recipes need more school-symbol density or a per-turn filter. (3) NEW BURN (tick then decay 1, persists across rounds) played GREAT: Kindle was a real engine, burn pressured through ward walls without being oppressive, ~7 total chip damage across the game - keep it. (4) SLOT-DENIAL round-ending is a real strategic axis (Abj repeatedly denied Evo 1-2 slots/round by exhausting its own slots fast) - powerful, interesting, possibly needs a final-turn rule so the non-ending player gets one last turn. (5) Positive card notes: Aegis forces genuine overpay decisions; Backdraft punishes cast-heavy defense; Hex Bolt reaction-proofing matters; Reflective Ward is the right shape for Abj damage. Design wants Abj>Evo - after a deckout fix, Abj keeps its engine and this matchup likely flips.

