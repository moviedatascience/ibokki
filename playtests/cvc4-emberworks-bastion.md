# Playtest: Evocation (P0) vs Abjuration (P1)

- Date: 2026-07-03
- Seed: 404
- Controller: Claude (self-play, both sides)

## Match log

> **P0 (Evocation) thinks:** Match 4: authored decks. Standard kits both sides.
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

> **P0 (Evocation) thinks:** Evo T1: Kindle. Hold Dispelling Powder for their first real ward.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
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

> **P1 (Abjuration) thinks:** Abj: Shell then Bulwark Shard = 3HP wall on turn 1. The archetype package at work.
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
- **P1:** PLAY Bulwark Shard [ITM-008] (trainer)
    - P1 plays Bulwark Shard [ITM-008]
    - P1 ward → 3 HP
    _P0 HP 30 | P1 HP 28 | round 1 | turn 2 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_

> **P0 (Evocation) thinks:** Powder their 3HP ward (effect-destroy skips the Shell draw rider), then VolCharge to naked face.
- **P0:** PLAY Dispelling Powder [GAM-012] (trainer)
    - P0 plays Dispelling Powder [GAM-012]
    - P1 ward destroyed
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_

> **P1 (Abjuration) thinks:** Echo the VolCharge (prevent 1, no ward).
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic/Material [CMP-SM]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - P1 takes 2 damage
    - → Volatile Charge [EVO-008] resolves
    - round 1 ends — level up
    _P0 HP 29 | P1 HP 26 | round 2 | turn 3 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 26 | round 2 | turn 3 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 26 | round 2 | turn 4 | stack 0_

> **P0 (Evocation) thinks:** Kindle again - engine before burst; Trance waits for a damage spell.
- **P0:** attach Verbal/Somatic [CMP-VS] → prepared[0]
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
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 5 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 23 | round 2 | turn 6 | stack 0_
    _P0 HP 29 | P1 HP 23 | round 2 | turn 6 | stack 0_

> **P0 (Evocation) thinks:** Trance + VolCharge: 6 damage - 1 ward = 5 face. Burst turn.
- **P0:** PLAY Battle Trance [GAM-010] (trainer)
    - P0 plays Battle Trance [GAM-010]
    - P0 takes 2 damage
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 0_
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 1_
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 1_
    _P0 HP 27 | P1 HP 23 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    - P0 takes 1 damage
    - P1 ward destroyed
    - P1 takes 5 damage
    - → Volatile Charge [EVO-008] resolves
    - round 2 ends — level up
    _P0 HP 26 | P1 HP 18 | round 3 | turn 6 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 3 | turn 6 | stack 0_

> **note (P0):** HONESTY FLAG: batch-passed Abj's Echo window on the Trance+VolCharge burst (would have prevented 2) - Abj took ~2 extra.
- **P0:** done preparing
    _P0 HP 26 | P1 HP 18 | round 3 | turn 6 | stack 0_
- **P1:** done preparing
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 1_
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 0_
    _P0 HP 26 | P1 HP 18 | round 3 | turn 7 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 takes 4 damage
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_

> **P1 (Abjuration) thinks:** Aegis Charm: free 3HP ward - eats the next tick whole.
- **P1:** PLAY Aegis Charm [GAM-011] (trainer)
    - P1 plays Aegis Charm [GAM-011]
    - P1 ward → 3 HP
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[0])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 1_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 1_
- **P1:** pass priority
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 1_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 8 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 0_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 0_

> **P0 (Evocation) thinks:** BH: chip their wall + 5th marker.
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 0_
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 1_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 1_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 1_
- **P1:** pass priority
    - → Burning Hands [EVO-003] resolves
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 0_
    _P0 HP 26 | P1 HP 14 | round 3 | turn 9 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 ward destroyed
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 26 | P1 HP 13 | round 3 | turn 10 | stack 0_
    _P0 HP 26 | P1 HP 13 | round 3 | turn 10 | stack 0_

> **P1 (Abjuration) thinks:** Dig for Quenching Salts - burn 3 must be answered.
- **P1:** PLAY Arcane Study [GAM-001] (trainer)
    - P1 plays Arcane Study [GAM-001]
    _P0 HP 26 | P1 HP 13 | round 3 | turn 10 | stack 0_

> **P1 (Abjuration) thinks:** Bank the VS (V half useless).
- **P1:** choose Verbal/Somatic [CMP-VS]
    _P0 HP 26 | P1 HP 13 | round 3 | turn 10 | stack 0_

> **P1 (Abjuration) thinks:** Abj: nothing answers burn in hand - all-in on drawing Quenching (2 copies in 28 cards left).
- **P1:** pass (end turn)
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 0_
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 0_
- **P0:** attach Verbal x2 [CMP-VV] → prepared[2]
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 0_

> **P0 (Evocation) thinks:** VolCharge closes R3: 3 face, burn 3 still ticking.
- **P0:** CAST Volatile Charge [EVO-008] (prepared[2])
    - P0 casts Volatile Charge [EVO-008]
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_

> **P1 (Abjuration) thinks:** Echo: prevent 1 of 3.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 2_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
- **P0:** pass priority
    _P0 HP 26 | P1 HP 13 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    - P0 takes 1 damage
    - P1 takes 2 damage
    - → Volatile Charge [EVO-008] resolves
    - round 3 ends — level up
    _P0 HP 25 | P1 HP 11 | round 4 | turn 11 | stack 0_
    _P0 HP 25 | P1 HP 11 | round 4 | turn 11 | stack 0_
- **P0:** prepare Battery [EVO-009]
    _P0 HP 25 | P1 HP 11 | round 4 | turn 11 | stack 0_
- **P0:** done preparing
    _P0 HP 25 | P1 HP 11 | round 4 | turn 11 | stack 0_

> **P1 (Abjuration) thinks:** Abj 5th: Fortify this time (missed it last round).
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 25 | P1 HP 11 | round 4 | turn 11 | stack 0_
- **P1:** done preparing
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 0_
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 0_
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 0_
- **P0:** CAST Kindle [EVO-006] (prepared[0])
    - P0 casts Kindle [EVO-006]
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 1_
- **P0:** pass priority
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 1_
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 1_
- **P1:** pass priority
    - → Kindle [EVO-006] resolves
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 0_
    _P0 HP 25 | P1 HP 11 | round 4 | turn 12 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 5
    - P1 takes 5 damage
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 0_
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 0_

> **P1 (Abjuration) thinks:** Quenching never surfaced (2-of in 41). Fortify delays one tick.
- **P1:** attach Somatic [CMP-S] → prepared[4]
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[4])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 1_
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 1_
- **P1:** pass priority
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 1_
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 0_
    _P0 HP 25 | P1 HP 6 | round 4 | turn 13 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 25 | P1 HP 6 | round 4 | turn 14 | stack 0_
    _P0 HP 25 | P1 HP 6 | round 4 | turn 14 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 ward destroyed
    - P1 takes 3 damage
    _P0 HP 25 | P1 HP 3 | round 4 | turn 15 | stack 0_
    _P0 HP 25 | P1 HP 3 | round 4 | turn 15 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 0_
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 0_
- **P0:** attach Verbal x2 [CMP-VV] → prepared[1]
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 0_

> **P0 (Evocation) thinks:** BH to close.
- **P0:** CAST Burning Hands [EVO-003] (prepared[1])
    - P0 casts Burning Hands [EVO-003]
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 1_
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 1_
- **P0:** pass priority
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 1_
    _P0 HP 25 | P1 HP 3 | round 4 | turn 16 | stack 1_
- **P1:** pass priority
    - P1 takes 1 damage
    - → Burning Hands [EVO-003] resolves
    _P0 HP 25 | P1 HP 2 | round 4 | turn 16 | stack 0_
    _P0 HP 25 | P1 HP 2 | round 4 | turn 16 | stack 0_
- **P0:** pass (end turn)
    - P1 burns for 4
    - P1 takes 4 damage
    - GAME OVER — P0 wins (hp)
    _P0 HP 25 | P1 HP -2 | round 4 | turn 17 | stack 0_

**Result:** P0 wins (hp), round 4. Final HP: P0 25, P1 -2.
    _P0 HP 25 | P1 HP -2 | round 4 | turn 17 | stack 0_

**Result:** P0 wins (hp), round 4. Final HP: P0 25, P1 -2.

## Analysis

VERDICT: Evo (Emberworks) wins by HP round 4 (25 vs -2) - same shape as match 3 despite Abj's full Bastion package. WHAT THE ARCHETYPES DID: the tech is real when it shows - Bulwark Shard made a 3HP turn-1 wall, Aegis Charm ate a full tick cycle, and Evo's Dispelling Powder + Battle Trance produced a genuine burst line (Powder the ward, Trance+VolCharge 6). But Quenching Salts (2-of in 41) never appeared in ~20 draws, and probability says that's typical: ~50% to see a 2-of by round 4, which is when burn kills. CONCLUSION, now confirmed across two clean matches: the burn ENGINE is mathematically ahead of Abjuration's L1-L2 answers regardless of deck construction. Kindle = 2 persistent markers for one V, castable every round; stacks compound to 4-5 markers by round 3-4 = 12+ inevitable damage, while Abj's wards arrive 1HP at a time. Tech cards can't be the answer to an engine - they're drawn dice-rolls against a guaranteed clock. NUMBER CHANGE NOW JUSTIFIED (the gated condition met). Options, most surgical first: (A) Kindle 2 markers -> 1 (kills the compounding while keeping burn identity; Inferno/BH untouched); (B) burn stack cap (e.g. max 3 markers) - preserves Kindle but caps the ceiling; (C) L1 ward HP 1->2 (Fortify/Shell) - broad defensive buff, also helps vs direct damage; may overbuff vs non-burn. Recommend A, possibly A+C if Abj still folds. Honesty flags: one batch-passed Abj Echo window (~2 HP); Abj also misprepped (no 5th slot until R4) - marginal, the burn math dominates either way.

