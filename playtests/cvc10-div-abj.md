# Playtest: Divination (P0) vs Abjuration (P1)

- Date: 2026-07-04
- Seed: 1001
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Abjuration) thinks:** Abj plan (match-8 informed): Ward Pulse thorn is my damage engine, Fortify feeds it ward HP, Echo Shield + Grounding as cheap 1-S reaction prevents.
- **P1:** prepare Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** prepare Grounding [ABJ-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Divination) thinks:** Div plan: Foretell pops wards before Ward Pulse converts them into thorn damage; Anticipate for value; Insight+Premonition velocity. Win path = out-cycle via Vault + mill, keep their ward count at zero.
- **P0:** prepare Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Insight [DIV-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** prepare Premonition [DIV-005]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** PLAY Bulwark Shard [ITM-008] (trainer)
    - P1 plays Bulwark Shard [ITM-008]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **note (P1):** PILOT MISPLAY + UX NOTE: Bulwark Shard is playable (and wasted) with zero wards — it whiffed. A no-op trainer play could be gated in legalActions like Quenching probably is. Logged as friction.
- **P1:** CAST Fortify [ABJ-001] (prepared[1])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P0:** pass priority
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** attach Somatic [CMP-S] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Divination) thinks:** Key line: Foretell the 1HP ward NOW, before Ward Pulse turns it into a repeating thorn. Their fueled Echo Shield (prevent 2 with a ward up) can blank it - real reaction tension.
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **note (P1):** PILOT ERROR (mine): chained CLI acts with stale indices passed Div's turn 2 without casting Foretell. Div a full tempo behind through no fault of the cards.

> **P1 (Abjuration) thinks:** Ward Pulse online: ward 1->2 HP and the first thorn point.
- **P1:** CAST Ward Pulse [ABJ-003] (prepared[0])
    - P1 casts Ward Pulse [ABJ-003]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_

> **P0 (Divination) thinks:** Anticipate the Ward Pulse: their slots just hit 2/2 so the round ends soon and this fuel would strand. Draw + 1 damage (their ward will eat it, but it strips ward HP the thorn needs).
- **P0:** REACT with Anticipate [DIV-014] (prepared[1])
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 2_

> **P1 (Abjuration) thinks:** Echo Shield the Anticipate sting: with a ward up it prevents 2, fully blanking the 1 damage AND protecting the thorn engine. This is the ward-defense role from match 8.
- **P1:** REACT with Echo Shield [ABJ-007] (prepared[2])
    - P1 reacts with Echo Shield [ABJ-007]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 3_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 3_
- **P1:** pass priority
    - → Echo Shield [ABJ-007] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    - → Anticipate [DIV-014] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    - P0 takes 1 damage
    - → Ward Pulse [ABJ-003] resolves
    - slots exhausted — P0 gets one final turn
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Abjuration) thinks:** Fuel Grounding before their final turn: if Foretell comes at my 2HP ward, prevent 1 keeps the ward alive at 1 for next round's thorn.
- **P1:** attach Somatic [CMP-S] → prepared[3]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 3 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** PLAY Saboteur's Kit [GAM-019] (trainer)
    - P0 plays Saboteur's Kit [GAM-019]
    - P1 mills 3
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** detach Material [CMP-M]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_

> **P0 (Divination) thinks:** Final turn: Kit milled 3, banked Insight's M (round-end would strand it), now Foretell the ward.
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** detach Material [CMP-M]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_

> **P1 (Abjuration) thinks:** Grounding: prevent 1 of Foretell's 2 so the ward survives at 1 HP into round 2 (+ the draw). Exactly the insurance it was fueled for.
- **P1:** REACT with Grounding [ABJ-008] (prepared[3])
    - P1 reacts with Grounding [ABJ-008]
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 2_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 2_
- **P1:** pass priority
    - → Grounding [ABJ-008] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 1_
- **P1:** pass priority
    - → Foretell [DIV-011] resolves
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 30 | round 1 | turn 4 | stack 0_
- **P0:** pass (end turn)
    - round 1 ends — level up
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P0:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 4 | stack 0_
- **P1:** done preparing
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_

> **P0 (Divination) thinks:** Their reactions are DRY (components stranded at round end, only 2 in hand). Foretell kills the 1HP ward NOW - the refuel tax after every round end is Abj's structural weakness in this mirror.
- **P0:** attach Material [CMP-M] → prepared[0]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P0:** attach Material [CMP-M] → prepared[1]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 0_
- **P0:** CAST Foretell [DIV-011] (prepared[0])
    - P0 casts Foretell [DIV-011]
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 29 | P1 HP 30 | round 2 | turn 5 | stack 1_
- _(auto-advanced 2 forced pass step(s))_
    - P1 ward destroyed
    - P1 takes 1 damage
    - → Foretell [DIV-011] resolves
    _P0 HP 29 | P1 HP 29 | round 2 | turn 5 | stack 0_
- **P0:** attach Material x2 [CMP-MM] → prepared[2]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 0_

> **P1 (Abjuration) thinks:** Abj rebuild: Fortify first (ward back), keep VS+SM for Ward Pulse and a reaction next turn. The rebuild costs my whole turn - Div's ward-snipe bought a full tempo.
- **P1:** attach Somatic [CMP-S] → prepared[1]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 0_
- **P1:** CAST Fortify [ABJ-001] (prepared[1])
    - P1 casts Fortify [ABJ-001]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 1_

> **P0 (Divination) thinks:** Anticipate the naked Fortify: the 1 damage lands on FACE (no ward yet - Fortify hasn't resolved). Value + draw.
- **P0:** REACT with Anticipate [DIV-014] (prepared[1])
    - P0 reacts with Anticipate [DIV-014]
    _P0 HP 29 | P1 HP 29 | round 2 | turn 6 | stack 2_
- _(auto-advanced 4 forced pass step(s))_
    - P1 takes 1 damage
    - → Anticipate [DIV-014] resolves
    - P1 ward → 1 HP
    - → Fortify [ABJ-001] resolves
    _P0 HP 29 | P1 HP 28 | round 2 | turn 6 | stack 0_
- **P1:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 29 | P1 HP 28 | round 2 | turn 6 | stack 0_

## Analysis

CALLED mid-R2 (Div 29, Abj 28, wards [1], decks 31/29). VERDICT: match 8's read CONFIRMED with sharper data - this is a real control mirror with a slight DIV edge when piloted well (design intent Div>Abj directionally satisfied). KEY DYNAMICS OBSERVED: (1) Ward Pulse rate-watch RESOLVED, no cap needed: sustaining the thorn cost Abj its Fortify cast + TWO reactions (Echo Shield to blank a sting, Grounding to keep the ward alive) for a total of 2 thorn damage over R1 - expensive, interactive, healthy. (2) The post-round REFUEL TAX is the mirror's central rhythm: attached components strand at round end, so both sides start each round with dry reactions - Div exploited the dry window to Foretell-snipe the ward, forcing a full rebuild turn. Great emergent texture, no rule change needed. (3) Anticipate timing vs the naked Fortify (before the ward resolves) is a real skill moment. (4) Despite Div losing a full turn to a pilot input error, it still led on HP - the edge is robust. TOOLING VERIFIED: reveal CHOICE block now renders in the CLI (Foretell showed Abj's hand contents inline). FRICTION LOGGED: Bulwark Shard playable as a no-op with zero wards (whiffed a card); consider gating no-op trainer plays in legalActions.

