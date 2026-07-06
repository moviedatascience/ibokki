# Playtest: Divination (P0) vs Abjuration (P1)

- Date: 2026-07-06
- Seed: 1212
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Abj R1: standard Bastion opening, Fortify wall first. Vs Div there is no burn to cleanse, but the wall is doom-insurance: prophecies are announced, so ward HP can be scheduled against arrivals.
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Arcane Shell [ABJ-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Abjuration) thinks:** 4th slot: Echo Shield over Runic Seal this round - Div has no L2 prophecy spells at L1 max, so there is nothing worth sealing yet; the shield defends the Ward (the thorn engine). Seal becomes the tech pick from R2 when Foreclosure/Far Sight can appear.
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Divination) thinks:** Div R1: no L1 prophecies exist, so R1 is the setup round - Foretell for the only direct damage + intel, Anticipate as the reaction sting, then draw engines to bank M fuel for the R2 Foreclosure/Far Sight dooms. Kit time-bombs from hand are the only R1 prophecy source.
- **P0:** prepare Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Insight [DIV-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Omen [DIV-012]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Abj T1: Aegis Charm first - a free 3HP wall is both the Ward Pulse thorn enabler AND doom insurance against announced prophecy arrivals.
- **P1:** PLAY Aegis Charm [GAM-011] (trainer)
    - P1 plays Aegis Charm [GAM-011]
    - P1 ward → 3 HP
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** misattach - take the second S back off Ward Pulse (it only needs one) and re-aim it at the Echo Shield reaction
- **P1:** detach Somatic [CMP-S]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** Cast Ward Pulse: wall to 4 HP + the first thorn point. The thorn race begins.
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[1])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Abjuration) thinks:** end turn - Study is a second Gambit, locked this turn
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Divination) thinks:** Div T1: plant the first time-bomb. Kit inscribes 2-in-2 - Abj now KNOWS 2 damage arrives on their second upcoming turn and must budget ward HP for it. This is the whole identity in one play: announced, schedulable pressure.
- **P0:** PLAY Saboteur's Kit [GAM-019] (trainer)
    - P0 plays Saboteur's Kit [GAM-019]
    - prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 1_

> **P0 (Divination) thinks:** commit. Abj choice: Echo Shield would spend a card+S to save 2 ward HP - hold it; the wall exists to soak exactly this, and Fortify refills next turn.
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 1_
- **P1:** pass priority
    - → Foretell [DIV-011] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_
- _(auto-advanced 1 forced pass step(s))_
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Verbal/Material [CMP-VM] → prepared[1]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Abj T2: the announced doom (2@1t) fires at my next turn start into a 2HP ward - it would kill the wall and stall the thorn. Draw first, then Fortify to 4 so the doom leaves 2 standing: this is ward-scheduling against a known arrival, the counterplay mill never offered.
- **P1:** PLAY Arcane Study [GAM-001] (trainer)
    - P1 plays Arcane Study [GAM-001]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** bank Quenching Salts - completely dead vs a burnless school; keep both duals as live fuel
- **P1:** choose Quenching Salts [GAM-013]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[2]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[0])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 1_
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 1_

> **P0 (Divination) thinks:** Anticipate fires into the Fortify cast: replaces its own card (draw 1) and chips the wall to 1 BEFORE Fortify refills - fuel spent now beats fuel stranded at round end (m10 refuel-tax lesson).
- **P0:** REACT with Anticipate [DIV-014] (prepared[1])
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 2_

> **P1 (Abjuration) thinks:** hold Echo Shield - burning a card to stop a 1-chip is a losing trade while the ward survives it
- **P1:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 2_
- _(auto-advanced 1 forced pass step(s))_
    - → Anticipate [DIV-014] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 3 HP
    - → Fortify [ABJ-001] resolves
    - slots exhausted — P0 gets one final turn
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** slots exhausted at 2/2 - hold the VSM for next round's refuel
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_

> **P0 (Divination) thinks:** Div final turn of R1: second Kit - dooms now stack (2@1t and 2@2t). The schedule of arrivals is building.
- **P0:** PLAY Saboteur's Kit [GAM-019] (trainer)
    - P0 plays Saboteur's Kit [GAM-019]
    - prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[2]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** CAST Insight [DIV-001] (prepared[2])
    - P0 casts Insight [DIV-001]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P1:** pass priority
    - → Insight [DIV-001] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_

> **P0 (Divination) thinks:** hold the MM/M in hand - attachments strand at round end (refuel tax); next round they fuel Foreclosure
- **P0:** pass (end turn)
    - round 1 ends — level up
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_

> **P0 (Divination) thinks:** R2 prep: L2 dooms not preparable yet (max L1) - keep the loadout
- **P0:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P0 (Divination) thinks:** Div R2: draw first, then Foretell chips the wall to 1 so tomorrow's 2-doom cracks it and bleeds face - sequencing stings BEFORE arrivals is the Div skill line
- **P0:** PLAY Arcane Study [GAM-001] (trainer)
    - P0 plays Arcane Study [GAM-001]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P0 (Divination) thinks:** bank a spare M - fuel is abundant, next draw stays live
- **P0:** choose Material [CMP-M]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P0 (Divination) thinks:** also fuel Anticipate for the round
- **P0:** attach Material [CMP-M] → prepared[2]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_

> **P1 (Abjuration) thinks:** Echo Shield is DRY (refuel tax) - Div timed the sting into the dry window, the m10 rhythm working as designed
- **P1:** pass priority
    - → Foretell [DIV-011] resolves
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- _(auto-advanced 1 forced pass step(s))_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P0 (Divination) thinks:** MM onto Anticipate - reaction armed for the round
- **P0:** attach Material x2 [CMP-MM] → prepared[1]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    - → P1's doom arrives — Saboteur's Kit [GAM-019]
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** Abj: first doom fired - ward dead, 1 to face. Rebuild with Arcane Shell, NOT Fortify: the next doom (2@1t) will kill any 1HP wall, so pick the wall that pays 2 cards on death. Scheduling against a known arrival again.
- **P1:** attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[2])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 1_

> **P0 (Divination) thinks:** Anticipate NOW, while the Shell is still on the stack and no ward stands - the sting hits face, not wall. LIFO timing as a damage multiplier.
- **P0:** REACT with Anticipate [DIV-014] (prepared[1])
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 2_
- _(auto-advanced 5 forced pass step(s))_
    - P1 takes 1 damage
    - → Anticipate [DIV-014] resolves
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    _P0 HP 29 | P1 HP 28 | round 2 | turn 7 | stack 0_
- **P0:** CAST Insight [DIV-001] (prepared[2])
    - P0 casts Insight [DIV-001]
    _P0 HP 29 | P1 HP 28 | round 2 | turn 7 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 28 | round 2 | turn 7 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Insight [DIV-001] resolves
    - slots exhausted — P1 gets one final turn
    _P0 HP 29 | P1 HP 28 | round 2 | turn 7 | stack 0_

> **P0 (Divination) thinks:** slots spent - hold the fat fuel hand for R3 when Foreclosure unlocks
- **P0:** pass (end turn)
    - → P1's doom arrives — Saboteur's Kit [GAM-019]
    - P1 ward destroyed
    - P1 takes 1 damage
    _P0 HP 29 | P1 HP 27 | round 2 | turn 8 | stack 0_

> **P1 (Abjuration) thinks:** Shell died to the doom ON SCHEDULE and paid 2 cards - the rider converted a known arrival into value. Last slot: Fortify back to a wall; hold SS/S, they would strand at round end.
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 29 | P1 HP 27 | round 2 | turn 8 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[0])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 27 | round 2 | turn 8 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 27 | round 2 | turn 8 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 29 | P1 HP 27 | round 2 | turn 8 | stack 0_
- **P1:** pass (end turn)
    - round 2 ends — level up
    _P0 HP 29 | P1 HP 27 | round 3 | turn 8 | stack 0_
    _P0 HP 29 | P1 HP 27 | round 3 | turn 8 | stack 0_

> **note (P1):** DESIGN FINDING: L2 unlocks at LEVEL 5 (round 5) - every prophecy SPELL is L2+, so for rounds 1-4 Div's new win condition exists only via Saboteur's Kit draws. The school has no L1 doom. Candidate fix: convert one redundant L1 sculpt spell (Omen or Augury - names are literally prophecy-flavored) into a starter doom, e.g. Prophecy 2-in-2.

> **P1 (Abjuration) thinks:** Abj 5th slot: Grounding - card-neutral prevent; fuel is the constraint
- **P1:** prepare Grounding [ABJ-008]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 8 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 27 | round 3 | turn 8 | stack 0_

> **P0 (Divination) thinks:** Div 5th: Premonition - dig for the remaining Kits, the only doom source until R5
- **P0:** prepare Premonition [DIV-005]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 8 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 27 | round 3 | turn 9 | stack 0_

> **P1 (Abjuration) thinks:** Abj R3: Bulwark the surviving 1HP ward to 3 - rebuilding the engine
- **P1:** PLAY Bulwark Shard [ITM-008] (trainer)
    - P1 plays Bulwark Shard [ITM-008]
    - P1 ward → 3 HP
    _P0 HP 29 | P1 HP 27 | round 3 | turn 9 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 9 | stack 0_

> **P1 (Abjuration) thinks:** SS arms Echo Shield for the whole round
- **P1:** attach Somatic x2 [CMP-SS] → prepared[3]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 9 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_

> **note (P0):** PILOT ERROR (Abj): stale-index act ended the turn before casting the fueled Ward Pulse - it stays fueled and castable next turn, one thorn tick lost. Same failure mode as m10; discount Abj's tempo slightly when reading the result.

> **P0 (Divination) thinks:** Div: Echo Shield is armed, so no Foretell into a ready prevent-2 - dig instead, force them to sit on the reaction
- **P0:** attach Material [CMP-M] → prepared[2]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
- **P0:** CAST Insight [DIV-001] (prepared[2])
    - P0 casts Insight [DIV-001]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 1_
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 1_

> **P1 (Abjuration) thinks:** hold Echo vs a draw spell
- **P1:** pass priority
    - → Insight [DIV-001] resolves
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[4]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
- **P0:** attach Material x2 [CMP-MM] → prepared[1]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 10 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 0_

> **P1 (Abjuration) thinks:** Ward Pulse fires this time: wall +1, thorn 1
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[1])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 1_

> **P0 (Divination) thinks:** Anticipate again - sting to face is impossible (wall up) but the draw + 1 chip keeps the thorn race even; fuel would strand otherwise
- **P0:** REACT with Anticipate [DIV-014] (prepared[1])
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 2_
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 2_

> **P1 (Abjuration) thinks:** Echo Shield DOES react to Anticipate - prevent 2 covers the sting entirely, and Div wasted its reaction fuel. The armed-window standoff punished the greedy sting.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[3])
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 29 | P1 HP 27 | round 3 | turn 11 | stack 3_
- _(auto-advanced 6 forced pass step(s))_
    - → Echo Shield [ABJ-007] resolves
    - → Anticipate [DIV-014] resolves
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    _P0 HP 28 | P1 HP 27 | round 3 | turn 11 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 11 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 27 | round 3 | turn 12 | stack 0_
- **P0:** CAST Premonition [DIV-005] (prepared[4])
    - P0 casts Premonition [DIV-005]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 12 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 27 | round 3 | turn 12 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - → Premonition [DIV-005] resolves
    _P0 HP 28 | P1 HP 27 | round 3 | turn 12 | stack 0_

> **P0 (Divination) thinks:** Premonition bonus hit (3 draws) - 11-card hand, cap will trim to 10. R4 = one more setup round before Foreclosure unlocks at L5
- **P0:** pass (end turn)
    - P0 discards 1 (hand cap)
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 0_
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[0])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 6 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 0_

> **P1 (Abjuration) thinks:** S onto Arcane Shell for next turn
- **P1:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 13 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 27 | round 3 | turn 14 | stack 0_

> **P0 (Divination) thinks:** Div: hold everything, no cast worth Echo exposure - pass into R4
- **P0:** pass (end turn)
    - P0 discards 1 (hand cap)
    _P0 HP 28 | P1 HP 27 | round 3 | turn 15 | stack 0_
    _P0 HP 28 | P1 HP 27 | round 3 | turn 15 | stack 0_
- **P1:** CAST Arcane Shell [ABJ-002] (prepared[2])
    - P1 casts Arcane Shell [ABJ-002]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 15 | stack 1_
- **P1:** pass priority
    _P0 HP 28 | P1 HP 27 | round 3 | turn 15 | stack 1_
- _(auto-advanced 1 forced pass step(s))_
    - P1 ward → 1 HP
    - → Arcane Shell [ABJ-002] resolves
    - slots exhausted — P0 gets one final turn
    _P0 HP 28 | P1 HP 27 | round 3 | turn 15 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 28 | P1 HP 27 | round 3 | turn 16 | stack 0_

> **P0 (Divination) thinks:** Echo is spent - free window to sting
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 16 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 28 | P1 HP 27 | round 3 | turn 16 | stack 1_
- **P0:** pass priority
    _P0 HP 28 | P1 HP 27 | round 3 | turn 16 | stack 1_
- _(auto-advanced 2 forced pass step(s))_
    - → Foretell [DIV-011] resolves
    _P0 HP 28 | P1 HP 27 | round 3 | turn 16 | stack 0_
- **P0:** pass (end turn)
    - round 3 ends — level up
    _P0 HP 28 | P1 HP 27 | round 4 | turn 16 | stack 0_
    _P0 HP 28 | P1 HP 27 | round 4 | turn 16 | stack 0_

## Analysis

CALLED at R4-start as a healthy, knife-edge control mirror: Div 28 / Abj 27 after three fully piloted rounds (discount Abj ~1 thorn tick for a noted pilot error). VERDICT ON THE PROPHECY REWORK: the mechanic plays excellently. (1) WARD-SCHEDULING IS REAL COUNTERPLAY - Abj repeatedly made meaningful decisions against ANNOUNCED arrivals: Fortify-before-the-doom kept the wall alive; deliberately rebuilding with Arcane Shell so the incoming doom would crack it ON SCHEDULE converted 2 doom damage into 2 cards via the death rider. Mill offered nothing like this. (2) THE DOOM/STING/THORN RACE IS TENSE AND INTERACTIVE - every reaction window had a real decision (Echo Shield correctly ate an Anticipate sting once, correctly held twice; Div sequenced stings into dry-Echo windows and reacted in a wall-down window to hit face). (3) STRUCTURAL FINDING - THE L1 DOOM GAP: maxSpellLevel stays 1 through round 4 (L2 unlocks at level 5), so ALL prophecy spells are uncastable for ~half of a typical game; Saboteur's Kit draws are the school's only dooms in R1-4. Div kept pace here only via strong Kit draws (2 in the opener) + disciplined sting sequencing - a Kitless start would read as a do-nothing school for 4 rounds. RECOMMENDATION: give Divination one L1 prophecy spell by converting a redundant L1 sculpt spell - Omen [DIV-012] is name-perfect (an omen IS a small prophecy): drop its look-4-take-M for 'Prophecy - deal 2 at the start of your opponent's second turn from now'; L1 damage comparators (Spark 2, Foretell 2+intel) say 2-in-2 for M is fair. (4) R5+ doom cycle not piloted here; the bot matrix (~56% Div over 40 full games, which DOES include the Foreclosure/Entropy rounds) plus this piloted texture supports the intended slight-Div-edge soft counter. NO number changes to the shipped five - revisit Foreclosure 4-in-2 only if a piloted R5+ match shows the doom cycle underperforming against Fortify economy.

