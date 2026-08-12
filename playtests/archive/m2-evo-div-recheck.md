# Playtest: Evocation (P0) vs Divination (P1)

- Date: 2026-07-08
- Seed: 2107
- Controller: Claude (self-play, both sides)

## Match log

> **P1 (Divination) thinks:** Div R1 vs Evo, correct card model this time: Omen IS the L1 starter doom (3-in-2 for M). It is the whole gameplan — a guaranteed, re-preparable 3-damage clock every round that no draw luck can deny. Prepare it first.
- **P1:** prepare Omen [DIV-012]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Divination) thinks:** Foretell: the immediate 2 + intel.
- **P1:** prepare Foretell [DIV-011]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Divination) thinks:** Anticipate: the armed sting for his cast windows.
- **P1:** prepare Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P1 (Divination) thinks:** Insight over Premonition 4th: with Omen carrying the win condition, digging is support, not salvation — draw 2 is enough.
- **P1:** prepare Insight [DIV-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P1:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Evocation) thinks:** Evo mirror of m1's optimal kit: Firebolt.
- **P0:** prepare Firebolt [EVO-002]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Evocation) thinks:** Volatile Bolt — the M-attach tax.
- **P0:** prepare Volatile Bolt [EVO-015]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Evocation) thinks:** Searing Word — face + fuel-bank snipe.
- **P0:** prepare Searing Word [EVO-004]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_

> **P0 (Evocation) thinks:** Backdraft — the cast tax. Now legal only against DIV's casts (post-fix).
- **P0:** prepare Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 0 | stack 0_
- **P0:** done preparing
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** Lens first — trap-immune value (and Evo cannot even have armed anything yet: Div leads).
- **P1:** PLAY Scrying Lens [ITM-001] (trainer)
    - P1 plays Scrying Lens [ITM-001]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** Take the plain M (leaves SM on top as a known safe draw).
- **P1:** choose Material [CMP-M]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** M onto Omen — the doom casts this turn.
- **P1:** attach Material [CMP-M] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** SM onto Anticipate (dual's S is spare) — armed before his first cast.
- **P1:** attach Material [CMP-M] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** MM onto Foretell — next turn's cast pre-paid and safe from Searing Word hand-snipes.
- **P1:** attach Material x2 [CMP-MM] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** Turn-1 Omen: 3-in-2 inscribed before Evo has taken a single action. THIS is what the m1 pilot left on the table.
- **P1:** CAST Omen [DIV-012] (prepared[0])
    - P1 casts Omen [DIV-012]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 1_
- **P0:** pass priority
    - prophecy inscribed on P0: 3 damage in 2 turns (Omen [DIV-012])
    - → Omen [DIV-012] resolves
    _P0 HP 30 | P1 HP 30 | round 1 | turn 1 | stack 0_

> **P1 (Divination) thinks:** Doom 3@2t ticking on turn 1. End — Foretell is pre-paid for T2.
- **P1:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Evo T1, dream fuel hand (4xV + VV): full deployment. V to Firebolt.
- **P0:** attach Verbal [CMP-V] → prepared[0]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** V arms the trap.
- **P0:** attach Verbal [CMP-V] → prepared[2]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** V arms Backdraft.
- **P0:** attach Verbal [CMP-V] → prepared[3]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** V pre-pays Searing Word for T2.
- **P0:** attach Verbal [CMP-V] → prepared[3]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Rebalance: second V off Backdraft (2-cap waste)...
- **P0:** detach Verbal [CMP-V]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** ...and onto the trap. All four spells online, VV banked for R2.
- **P0:** attach Verbal [CMP-V] → prepared[1]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** Cast Firebolt: 3 to face (their Anticipate is armed — accept the sting trade; Div pays a card, I pay 1 HP... actually their sting is card-neutral; the trade is just the matchup price).
- **P0:** detach Verbal [CMP-V]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_

> **P0 (Evocation) thinks:** V back onto Backdraft — layout finally correct: all four online, VV banked.
- **P0:** attach Verbal [CMP-V] → prepared[3]
    _P0 HP 30 | P1 HP 30 | round 1 | turn 2 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 30 | P1 HP 30 | round 1 | turn 3 | stack 0_

> **P1 (Divination) thinks:** SM onto Insight — T3's dig pre-paid. (Evo whiffed its R1 casts to fuel-juggling — discount its tempo read ~3; the index-shift CLI friction claims a victim on BOTH sides now.)
- **P1:** attach Somatic/Material [CMP-SM] → prepared[2]
    - P0 reacts with Volatile Bolt [EVO-015]
    - P1 takes 2 damage
    - → Volatile Bolt [EVO-015] resolves
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_

> **P1 (Divination) thinks:** (Trap note: it fired on the SM DUAL — M-bearing duals trigger it. Empirical ruling for the log.) Detach the wasted SM from over-fueled Anticipate.
- **P1:** detach Somatic/Material [CMP-SM]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_

> **P1 (Divination) thinks:** SM onto Insight — the trap is spent, attach is free.
- **P1:** attach Somatic/Material [CMP-SM] → prepared[3]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 0_

> **P1 (Divination) thinks:** Cast Foretell: 2 + intel, eating the Backdraft tax on the cheap cast.
- **P1:** CAST Foretell [DIV-011] (prepared[1])
    - P1 casts Foretell [DIV-011]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 1_

> **P0 (Evocation) thinks:** Backdraft the Foretell — the cast tax, now correctly offered ONLY in the opponent's window (fix verified live).
- **P0:** REACT with Backdraft [EVO-013] (prepared[3])
    - P0 reacts with Backdraft [EVO-013]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 2_

> **P1 (Divination) thinks:** Anticipate answers his Backdraft (opponent's reaction on top = legal under the fix). Fuel converts before round end.
- **P1:** REACT with Anticipate [DIV-014] (prepared[2])
    - P1 reacts with Anticipate [DIV-014]
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 3_
- **P0:** pass priority
    _P0 HP 30 | P1 HP 28 | round 1 | turn 3 | stack 3_
- **P1:** pass priority
    - P0 takes 1 damage
    - → Anticipate [DIV-014] resolves
    _P0 HP 29 | P1 HP 28 | round 1 | turn 3 | stack 2_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 28 | round 1 | turn 3 | stack 2_
- **P0:** pass priority
    - P1 takes 2 damage
    - → Backdraft [EVO-013] resolves
    _P0 HP 29 | P1 HP 26 | round 1 | turn 3 | stack 1_
- **P1:** pass priority
    _P0 HP 29 | P1 HP 26 | round 1 | turn 3 | stack 1_
- **P0:** pass priority
    - P0 takes 2 damage
    - → Foretell [DIV-011] resolves
    _P0 HP 27 | P1 HP 26 | round 1 | turn 3 | stack 0_
- **P1:** pass (end turn)
    - slots exhausted — P0 gets one final turn
    _P0 HP 27 | P1 HP 26 | round 1 | turn 3 | stack 0_

> **P1 (Divination) thinks:** R1 fully converted: Omen 3 (incoming), Foretell 2, Anticipate 1 = 6 damage of Div pressure vs the taxes' 4. 26-27 and the doom lands on his upkeep. End turn.
- **P1:** pass (end turn)
    - → P0's doom arrives — Omen [DIV-012]
    - P0 takes 3 damage
    _P0 HP 24 | P1 HP 26 | round 1 | turn 4 | stack 0_

> **P0 (Evocation) thinks:** Doom ate 3 on schedule (first blood to the doom engine). Firebolt back — their reactions are all spent this round.
- **P0:** CAST Firebolt [EVO-002] (prepared[0])
    - P0 casts Firebolt [EVO-002]
    _P0 HP 24 | P1 HP 26 | round 1 | turn 4 | stack 1_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 26 | round 1 | turn 4 | stack 1_
- **P1:** pass priority
    - P1 takes 3 damage
    - → Firebolt [EVO-002] resolves
    _P0 HP 24 | P1 HP 23 | round 1 | turn 4 | stack 0_
- **P0:** pass (end turn)
    - round 1 ends — level up
    _P0 HP 24 | P1 HP 23 | round 2 | turn 4 | stack 0_
- **P0:** done preparing
    _P0 HP 24 | P1 HP 23 | round 2 | turn 4 | stack 0_

> **P1 (Divination) thinks:** Keep the Div kit — Omen re-prepares and the clock restarts every round; that is the whole point.
- **P1:** done preparing
    _P0 HP 24 | P1 HP 23 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** Evo leads R2 thin (2 fuel): VS to Firebolt.
- **P0:** attach Verbal/Somatic [CMP-VS] → prepared[0]
    _P0 HP 24 | P1 HP 23 | round 2 | turn 5 | stack 0_

> **P0 (Evocation) thinks:** VV re-arms the trap — Div must re-fuel Omen this round; the tax is guaranteed.
- **P0:** CAST Firebolt [EVO-002] (prepared[0])
    - P0 casts Firebolt [EVO-002]
    _P0 HP 24 | P1 HP 23 | round 2 | turn 5 | stack 1_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 23 | round 2 | turn 5 | stack 1_
- **P1:** pass priority
    - P1 takes 3 damage
    - → Firebolt [EVO-002] resolves
    _P0 HP 24 | P1 HP 20 | round 2 | turn 5 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 0_

> **P1 (Divination) thinks:** Both Evo reactions are DRY (his thin refuel round) — Omen fuels tax-free. The doom rhythm continues.
- **P1:** attach Material [CMP-M] → prepared[0]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 0_

> **P1 (Divination) thinks:** M onto Anticipate for his cast windows.
- **P1:** CAST Omen [DIV-012] (prepared[0])
    - P1 casts Omen [DIV-012]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 1_
- **P1:** pass priority
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 1_
- **P0:** pass priority
    - prophecy inscribed on P0: 3 damage in 2 turns (Omen [DIV-012])
    - → Omen [DIV-012] resolves
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 0_

> **P1 (Divination) thinks:** M arms Anticipate; SM stays in hand for Foretell next turn (trap is dry but could re-arm — hand fuel is flexible fuel).
- **P1:** attach Material [CMP-M] → prepared[2]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 6 | stack 0_
- **P1:** pass (end turn)
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 0_

> **P0 (Evocation) thinks:** Evo: Recharge digs the deck for same-symbol duals — refuel the dry board.
- **P0:** PLAY Recharge [GAM-004] (trainer)
    - P0 plays Recharge [GAM-004]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 0_
- **P0:** choose Verbal x2 [CMP-VV]
    - P0 searches out Verbal x2 [CMP-VV]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 0_

> **P0 (Evocation) thinks:** VV onto Searing Word — cast it now: 2 + hand-snipe (their hand holds Foretell's fuel).
- **P0:** attach Verbal x2 [CMP-VV] → prepared[2]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 0_
- **P0:** CAST Searing Word [EVO-004] (prepared[2])
    - P0 casts Searing Word [EVO-004]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 1_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 1_

> **P1 (Divination) thinks:** Sting the Searing Word — fuel converts, and every point matters in a 1-HP-margin race.
- **P1:** REACT with Anticipate [DIV-014] (prepared[2])
    - P1 reacts with Anticipate [DIV-014]
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 2_
- **P0:** pass priority
    _P0 HP 24 | P1 HP 20 | round 2 | turn 7 | stack 2_
- **P1:** pass priority
    - P0 takes 1 damage
    - → Anticipate [DIV-014] resolves
    _P0 HP 23 | P1 HP 20 | round 2 | turn 7 | stack 1_
- **P0:** pass priority
    _P0 HP 23 | P1 HP 20 | round 2 | turn 7 | stack 1_
- **P1:** pass priority
    - P1 takes 2 damage
    - → Searing Word [EVO-004] resolves
    - slots exhausted — P1 gets one final turn
    _P0 HP 23 | P1 HP 18 | round 2 | turn 7 | stack 0_
- **P0:** pass (end turn)
    _P0 HP 23 | P1 HP 18 | round 2 | turn 8 | stack 0_

> **P1 (Divination) thinks:** M onto Foretell — the round's second cast.
- **P1:** attach Material [CMP-M] → prepared[1]
    _P0 HP 23 | P1 HP 18 | round 2 | turn 8 | stack 0_
- **P1:** CAST Foretell [DIV-011] (prepared[1])
    - P1 casts Foretell [DIV-011]
    _P0 HP 23 | P1 HP 18 | round 2 | turn 8 | stack 1_
- **P1:** pass priority
    _P0 HP 23 | P1 HP 18 | round 2 | turn 8 | stack 1_
- **P0:** pass priority
    - P0 takes 2 damage
    - → Foretell [DIV-011] resolves
    _P0 HP 21 | P1 HP 18 | round 2 | turn 8 | stack 0_
- **P1:** pass (end turn)
    - round 2 ends — level up
    _P0 HP 21 | P1 HP 18 | round 3 | turn 8 | stack 0_

## Analysis

CALLED at R3 prepare, Evo 21 / Div 18 with a 3-damage Omen doom PENDING on Evo's next upkeep — effectively 18-18 through two fully piloted rounds. VERDICT: m1's 21-7 'Evo stomps Div' read is OVERTURNED. m1 was piloted with a stale card model (Omen mis-remembered as the old look-4-take-M sculpt; never cast). With Omen played as what it now is — the L1 starter doom, 3-in-2 for M, re-preparable every round — the matchup is a knife-edge race with Evo perhaps a nose ahead on rate: exactly the soft-counter profile the school triangle intends (Evo>Div, but playable). ROUND ARITHMETIC: Div's guaranteed floor is Omen 3 + Foretell 2 + Anticipate 1 = 6/round through Evo's tax wall; Evo's clean rate is Firebolt 3 + Searing Word 2 + Backdraft 2 + trap 2 = up to 9 but realistically ~6-7 after refuel droughts (R2's two-fuel draw left both reactions dry and gave Div a free window — the tax engine needs fuel too, a constraint m1's dream draws hid). THE TAXES STILL BITE: Volatile Bolt confirmed to fire on M-BEARING DUALS (SM sprung it — empirical ruling), so Div cannot dodge it with duals; Backdraft taxed the cheap cast each round (correct Div counterplay: eat it on Foretell, keep Omen clean). The difference from m1 is that Div now converts every round into guaranteed damage instead of digging for outs, so the taxes cost Evo tempo it actually feels. CASTREACTION FIX VERIFIED LIVE: Backdraft was offered ONLY in Div's cast windows, Anticipate ONLY in Evo's, and Anticipate legally answered Backdraft (opponent's reaction on top) — the intended chain, no self-reacts anywhere. PILOT NOISE DISCLOSURE: this match had symmetric pilot errors from CLI index-shift (Evo lost roughly 2 casts of tempo across R1-R2; Div lost ~2 HP to a mid-value trap spring and some fuel churn) — treat the 'dead even' read as +/- one cast either way; the STRUCTURAL read (guaranteed doom floor transforms the matchup) is robust to that noise. RECOMMENDATIONS: (1) Omen at 3-in-2 looks correctly costed vs this kit — no number change; validate the Div-vs-Abj side hasn't over-tightened (Abj can ward-schedule dooms; cvc12 played that healthily pre-buff at Kit-2s, and Omen-3 raises Div pressure there — worth one piloted check). (2) The recurring index-shift misplays (5 this match across both seats, plus 3 in m1) are now the biggest source of piloted-data noise — a playtest-CLI ergonomic fix (stable action ids, or labels echoed on act) would pay for itself immediately. (3) Next balance question in priority order: reconcile the bot matrix's Div>Abj 99.4% vs cvc12's piloted knife-edge — likely bot-Abj can't ward-schedule, but confirm nothing structural changed in the c0bc734 rework.

