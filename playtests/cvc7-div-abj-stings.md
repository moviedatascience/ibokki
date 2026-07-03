# Playtest: Divination (P0) vs Abjuration (P1)

- Date: 2026-07-03
- Seed: 707
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Match 7 post-stings. Abj kit pivots: Fortify+Shell+WardPulse(thorn)+Echo - wards are now a clock, not just a wall.
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

> **P0 (Divination) thinks:** Div kit: Foretell(sting)/Anticipate/Foresight/Divine - a real 1dmg/round clock plus the value engine.
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

> **P1 (Abjuration) thinks:** Abj T1: Shell ward up, then Ward Pulse thorn next turn.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[1])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_

> **P0 (Divination) thinks:** Div: Anticipate their cast - draw.
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
- **P0:** PLAY Saboteur's Kit [GAM-019] (trainer)
    - P0 plays Saboteur's Kit [GAM-019]
    - P1 mills 3
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Divination) thinks:** Div T1: Saboteur mill + Foretell sting - both clocks start immediately.
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 1_

> **P1 (Abjuration) thinks:** Abj: don't Echo a 1-dmg sting; the ward eats it.
- **P1:** pass priority
    - P1 ward destroyed
    - → Foretell [DIV-011] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Abj: Fortify ward back up (thorn fuel + sting soak); Ward Pulse next turn = +1HP and 1 dmg.
- **P1:** CAST Fortify [ABJ-001] (prepared[0])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    - round 1 ends — level up
    _P0 HP 30 | P1 HP 30 | round 2 | turn 3 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 2 | turn 3 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 0_
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 0_

> **P1 (Abjuration) thinks:** Ward Pulse: ward to 2HP AND 1 damage - Abj's first-ever proactive damage vs Div.
- **P1:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[2])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_

> **P0 (Divination) thinks:** Div: Anticipate the Pulse - draw.
- **P0:** REACT with Anticipate [DIV-014] (prepared[1]) paying Material [CMP-M]
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 2_
- **P0:** pass priority
    - → Anticipate [DIV-014] resolves
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 2 | turn 4 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_

## Analysis

VALIDATION CALL at R2 (deliberately early - the structural question is answered, not the winner). ALL THREE FIXES VERIFIED LIVE: (1) Foretell sting works - turn-2 it popped Abj's Shell ward, creating interaction that literally did not exist in match 6 (Div now has a reason to choose face-vs-ward targets, Abj has a reason to hold ward HP); (2) Ward Pulse thorn works - 'P0 takes 1 damage' is Abjuration's FIRST-EVER damage against Divination, and it scales with Abj doing its own job (keeping wards alive); (3) exhaustion now bypasses wards (pinned by test), so the R8+ escalation clock is REAL for both sides instead of ward-soaked. PROJECTED SHAPE: a bounded control match - Div's sting+mill+Vault advantage vs Abj's thorn+walls, decided by the damage race or the now-unwallable exhaustion escalation around R10-14. Compare match 6: infinite round 3, zero damage possible, ~turn-cap projection. The pairing went from degenerate to a real (if slow) control mirror. Div>Abj still projected (Vault + mill keep Div a cycle ahead on exhaustion; stings outpace thorns slightly since wards blank stings but thorns need wards alive - close matchup, which is what 'soft counter' should look like). REMAINING from the degeneracy list: the INFINITE ROUND rule gap (secondary round-end after N turns/wizard) - not fixed this pass, still recommended next alongside the first-player last-turn rule; hand cap cosmetic. Card notes: Foretell went from intentional no-op to a real L1 role; Ward Pulse from filler to Abj-core; consider whether Far Sight's mill-sting should scale at higher levels later.

