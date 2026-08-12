# Playtest: Divination (P0) vs Abjuration (P1)

- Date: 2026-07-03
- Seed: 808
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** M8 recheck. Abj: Fortify/Shell/Pulse/Echo - the thorn engine.
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Divination) thinks:** Div: Foretell/Anticipate/Foresight/Divine; plan is sting + mill + Unbind at L2 to fight the thorn.
- **P0:** prepare Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Foresight [DIV-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Divine [DIV-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Abj T1: Shell ward, Pulse thorn online next turn.
- **P1:** attach Somatic x2 [CMP-SS] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[1])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_

> **P0 (Divination) thinks:** Div: Anticipate every Abj cast.
- **P0:** REACT with Anticipate [DIV-014] (prepared[1]) paying Material [CMP-M]
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 2_
- **P0:** pass priority
    - → Anticipate [DIV-014] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Divination) thinks:** Saboteur T1: mill 3, exhaustion clock.
- **P0:** PLAY Saboteur's Kit [GAM-019] (trainer)
    - P0 plays Saboteur's Kit [GAM-019]
    - P1 mills 3
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Divination) thinks:** Foretell sting into their 1HP ward - keep the wall down to blank the thorn.
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_

> **P1 (Abjuration) thinks:** Abj: Echo the sting - protect the ward, keep the thorn fueled. Key interaction: Echo now defends the DAMAGE ENGINE, not just HP.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[3]) paying Somatic [CMP-S]
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 2_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 2_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Foretell [DIV-011] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Pulse: ward to 2 + thorn 1 to Div face. This ends the round via slots - and Div gets the new FINAL TURN.
- **P1:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[2])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    - slots exhausted — P0 gets one final turn
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_

> **P0 (Divination) thinks:** FINAL TURN in action: pre-rule this slot was stolen; now Div casts Foresight with it.
- **P0:** attach Material [CMP-M] → prepared[2]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** CAST Foresight [DIV-002] (prepared[2])
    - P0 casts Foresight [DIV-002]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Foresight [DIV-002] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** choose Verbal/Somatic/Material [CMP-VSM]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** pass (end turn)
    - round 1 ends — level up
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P1 (Abjuration) thinks:** Pulse again: ward 3, thorn 2 total.
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[2])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    _P0 HP 28 | P1 HP 30 | round 2 | turn 5 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 0_

> **P0 (Divination) thinks:** Div: sting the ward - can't outpace Pulse+1/round, but forces Echo spends. Real plan waits for Unbind at L2.
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 1_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 1_

> **P1 (Abjuration) thinks:** Abj: let the 3HP ward eat it - save Echo.
- **P1:** pass priority
    - → Foretell [DIV-011] resolves
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 6 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 30 | round 2 | turn 7 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 7 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
- **P0:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
- **P0:** CAST Divine [DIV-003] (prepared[3])
    - P0 casts Divine [DIV-003]
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 1_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 1_
- **P1:** pass priority
    - → Divine [DIV-003] resolves
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
- **P0:** choose Verbal/Material [CMP-VM]
    - slots exhausted — P1 gets one final turn
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 8 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 28 | P1 HP 30 | round 2 | turn 9 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 2 | turn 9 | stack 0_
- **P1:** pass (end turn)
    - round 2 ends — level up
    _P0 HP 28 | P1 HP 30 | round 3 | turn 9 | stack 0_
    _P0 HP 28 | P1 HP 30 | round 3 | turn 9 | stack 0_

## Analysis

RECHECK CALL at R3 prepare, score Div 28 / Abj 30. MEASURED: (1) final-turn rule fired live twice, both directions - 'slots exhausted, P0 gets one final turn' and Div actually USED the reclaimed slot (cast Foresight with it); the slot-strangle is gone as a positional weapon. (2) The thorn race is REAL, partially validating the bot flip: Ward Pulse's 1 dmg lands on Div's faceless board every round while Foretell's sting gets eaten by the ward it needs to remove (3HP ward regrowing +1/cast can't be broken by a 1-dmg sting). Measured rate: Abj +1 face dmg/round net, Div +0 until ward removal comes online. (3) Echo Shield gained a genuinely interesting new role: Abj spent it defending its WARD (the damage engine) rather than its face - a real decision that didn't exist before. PROJECTED from implemented mechanics beyond R5: Div's Unbind (L2, destroy ward + draw) turns the thorn off 1/round; Reflective gives Abj a 2nd sting-punisher; net damage race roughly even with slight Abj edge (~1-2/round vs ~1/round), while the ward-BYPASSING exhaustion arrives R7-9 with Div a full cycle ahead (Vault used free, 3 mills banked) - Abj eats 2+4+6 unpreventable while Div eats 2+4. Overall: CLOSE MATCHUP, slight Div edge with good piloting, slight Abj edge with lazy piloting. That is a defensible 'soft counter' shape - the bot's 100% Abj flip reflects the skill-floor (thorn is easy, Vault/Unbind timing is hard), matching the design doc's stated intent that Div rewards skill. VERDICT: no number changes needed now; revisit after a full-length game post-UI. Balance-watch items: Ward Pulse may be slightly too rate-efficient (1 dmg + 1 ward HP for one S every round); if Abj starts dominating piloted play, make the thorn once-per-round-max or require 2+ wards.

