# Playtest m12: Evocation (P0) vs Abjuration (P1) — seed 3202 — bot greedy
- P1: prepare Fortify [ABJ-001]
- P1: prepare Arcane Shell [ABJ-002]
- P1: prepare Ward Pulse [ABJ-003]
- P1: prepare Aegis [ABJ-004]
- P1: done preparing
> **P0 thinks:** Volatile Charge: best V-rate damage (3 for V, 1 self). Core engine card per m11 findings.
- P0: prepare Volatile Charge [EVO-008]
> **P0 thinks:** Crackle from turn 1 (not R4 like m11): 1 face + 2 to a ward, pierces Stone Stance per m11 findings. Best repeatable wall/chip tool — starting with it instead of Searing Riposte (which m11 found dies to its own stance trigger).
- P0: prepare Crackle [EVO-010]
> **P0 thinks:** Backdraft: 2 reaction dmg per opponent cast, bypasses Stone Stance's spell-damage-reduce only in non-stance rounds (m11 found stance blanks reactions too — still free value whenever they cast without stance up).
- P0: prepare Backdraft [EVO-013]
> **P0 thinks:** Searing Word over Burning Hands this time: m11 proved burn ticks die to Stone Stance/wards entirely, so BH's marker payload is dead tech vs this bot. Testing untested doctrine instead: 1 face + random component discard — direct pressure on their S-income (their Reckoning/stance/ward package all runs on S).
- P0: prepare Searing Word [EVO-004]
> **P0 thinks:** Lineup: VC (rate), Crackle (face+ward), Backdraft (anti-cast reaction), Searing Word (face+discard). Same core as m11 minus the two proven-weak picks (BH's dead burn tech, Riposte's stance self-blank), testing Searing Word's S-starvation upside instead.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** No fuel armed yet, nothing to react with. Passing.
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 4 HP
- P1: pass (end turn)
> **P0 thinks:** Ward is up at 4 HP with no stance yet. VC would get fully soaked (3 dmg into a 4-HP ward = 0 face, pure bank feed) so skipping it. Crackle's face component is worded as a flat 'deal 1 to opponent' separate from the ward-targeted 2 — testing whether that 1 bypasses the ward per m11's read.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Cast Crackle into their 4-HP ward.
- P0: CAST Crackle [EVO-010] (prepared[1])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    → Crackle [EVO-010] resolves
> **P0 thinks:** ENGINE NOTE: Crackle's 'flat' 1-to-opponent component was NOT face-guaranteed — ward[4] absorbed the full 3 (1+2), 0 face, wall 4→1. Correction to m11's read: wards soak Crackle's opponent-damage too, only Stone Stance's flat reduction behaved differently there. Arming Backdraft now for their next cast — no stance up yet, so 2 clean.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Misclick — that V landed on the already-cast Crackle slot, not Backdraft. Reclaiming it.
- P0: detach Verbal [CMP-V]
> **P0 thinks:** Arming Backdraft on slot 2.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Backdraft armed, ward at 1 HP is negligible now. Passing — hoarding remaining slots/fuel rather than feeding more into their wall.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** VC into their 1-HP ward: absorbs 1 (trivial bank), 2 spills to clean face per the ward-soak-then-spillover model from m11. Also finishes off the ward entirely.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: CAST Volatile Charge [EVO-008] (prepared[0])
    P0 casts Volatile Charge [EVO-008]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 2 damage
    → Volatile Charge [EVO-008] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted; Backdraft stays armed for their final turn. Passing.
- P0: pass (end turn)
- P1: pass (end turn)
    round 1 ends — level up
> **P0 thinks:** Keep the lineup — VC/Crackle/Backdraft/Searing Word all delivering. R1 end 29-28, ward destroyed, no bank fed of consequence.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Clean board — no ward, no stance, I go first this round. Alpha window: VC clean 3, Searing Word clean 1+discard, then arm Backdraft for their reply.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Fund Searing Word with the impure VS (wasting S, keeping pure V for later).
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Correcting — that landed on VC (already has V) instead of Searing Word. Reclaiming.
- P0: detach Verbal/Somatic [CMP-VS]
- P0: attach Verbal/Somatic [CMP-VS] → prepared[3]
- P0: CAST Volatile Charge [EVO-008] (prepared[0])
    P0 casts Volatile Charge [EVO-008]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 takes 3 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** One cast per turn visit — Searing Word stays funded [VS] for my next turn. VC landed 3 clean face (25 HP). Passing.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** Backdraft wasn't funded this turn (spent fuel on VC+Searing Word) — missed reaction window. Noting for future turns: fund Backdraft before passing whenever possible.
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 4 HP
- P1: pass (end turn)
> **P0 thinks:** Ward is back up at 4 HP (full soak zone) and their hand is empty so Searing Word's discard would fizzle too — reclaiming the VS instead of feeding the wall for zero value.
- P0: detach Verbal/Somatic [CMP-VS]
> **P0 thinks:** Arming Backdraft for their next cast instead — 2 clean reaction dmg, doesn't touch the ward.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Holding the rest — passing.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Ward still at 4, still no good target. Hoarding, Backdraft stays armed.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Standoff continues — they seem to be avoiding casting into my armed Backdraft. Still hoarding.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Standoff's dragging toward my hand cap. Their hand is now 4 — Searing Word's discard is live value even though the 1 dmg will get soaked by the ward. Casting.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: detach Verbal [CMP-V]
- P0: attach Verbal [CMP-V] → prepared[3]
- P0: CAST Searing Word [EVO-004] (prepared[3])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    → Searing Word [EVO-004] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Confirms: any 'deal damage to opponent' effect is checked against an active ward first — ward absorbed Searing Word's 1 too (4→3). Discard landed though (hand4→3) since that's a non-damage effect. Slots exhausted, Backdraft stays armed for their final turn.
- P0: pass (end turn)
- P1: pass (end turn)
    round 2 ends — level up
- P1: prepare Stone Stance [ABJ-005]
- P1: done preparing
> **P0 thinks:** Stone Stance incoming (they just prepped it) — per m11, it blanks reactions/burn too, so a stance round means cast little. 5th slot: Spark, a clean 2-dmg-for-0-self-cost tool (no burn marker to die to stance, no self-harm like VC) — good for finishing chip when the ward math finally allows spillover.
- P0: prepare Spark [EVO-001]
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic x2 [CMP-SS] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: pass (end turn)
> **P0 thinks:** Ward at 4, no good spillover here (all my current options get fully soaked), and their hand is 0 so Searing Word's discard would fizzle too. Arming Backdraft instead; drew Overclock (GAM-008) — holding it for a future fuel-dead alpha window rather than using it now while they have 4 armed slots (SS,S,S + Fortify) that look like a cancel package.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
- P0: detach Verbal/Material [CMP-VM]
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
- P0: pass (end turn)
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Backdraft fires on their Stone Stance cast itself — reacting before it resolves, so the -2 reduction shouldn't be live yet. Testing.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    → Backdraft [EVO-013] resolves
- P1: pass priority
> **P0 thinks:** ENGINE NOTE: Backdraft's reaction damage also gets soaked by an active ward (4→2, no face/HP change) — ward absorption applies to reaction damage too, not just spells. Free chip on the wall since it didn't cost a cast slot, but it does feed their bank.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance is live (round-long -2 to my spell/reaction damage) and ward2 still up, plus multiple unknown armed slots on their side. Per m11 doctrine: stance rounds = hoard, cast nothing. Passing.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Drew Dispelling Powder — holding it for a bigger wall / alpha window rather than popping it on this small 2-HP ward. Hand at 9, watching the cap. Still stance round, still passing.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Hand at cap (10) — risk of losing Powder/Overclock to a random discard next draw. Cashing in Dispelling Powder now on the 2-HP ward: free, cast-slot-free, clears the board for clean face damage once stance ends.
- P0: PLAY Dispelling Powder [GAM-012] (trainer)
    P0 plays Dispelling Powder [GAM-012]
    P1 ward destroyed
> **P0 thinks:** Ward cleared. Stance still live (-2 to everything) makes my whole L1 kit marginal-to-useless this round — VC nets 1, Spark nets 0. Holding rather than feeding stance's bank for scraps.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Hand at cap (10) with plenty of spare V-fuel already — not worth spending Overclock prematurely into a stance+armed-reaction board just to dodge a possible random discard. Accepting the risk; a lost component card is cheap.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Hand cap discard apparently triggers at round end, not per-draw (hand now 11, no discard yet) — correcting earlier assumption. Continuing to hoard through the stance round.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 3 ends — level up
> **P0 thinks:** Keeping the lineup — R3 close (27-25), wall control + discard denial working. No new prep slot this level.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Clean board, I go first this round — alpha window. Funding VC for clean 3 face.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: CAST Volatile Charge [EVO-008] (prepared[0])
    P0 casts Volatile Charge [EVO-008]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 takes 3 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** Arming Backdraft for their reply.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: attach Somatic/Material [CMP-SM] → prepared[1]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P1: attach Somatic x2 [CMP-SS] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Backdraft on their Stone Stance cast again — no ward up this time, should be clean 2 face before stance's own reduction is live.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    P1 takes 2 damage
    → Backdraft [EVO-013] resolves
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance live again — hoarding through it. They've heavily funded 3 unarmed slots (2 components each), likely building toward a big turn.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: PLAY Second Wind [GAM-009] (trainer)
    P1 plays Second Wind [GAM-009]
    P1 heals 5
- P1: pass (end turn)
> **P0 thinks:** Ward2 + stance both up — anything I cast gets fully absorbed. They healed 5 (Second Wind) to 25. Hoarding.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
> **P0 thinks:** Drew Empowered Chalk — holding for a future burst turn. Still hoarding.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
> **P0 thinks:** Long standoff risks bleeding real cards (Overclock/Chalk) to random hand-cap discard for no gain. Their hand is 4 now — Searing Word's discard lands guaranteed, and its 1 damage should get zeroed by stance before the ward even sees it (no bank fed). Funding it.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
- P0: detach Verbal/Somatic/Material [CMP-VSM]
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
- P0: CAST Searing Word [EVO-004] (prepared[3])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    → Searing Word [EVO-004] resolves
> **P0 thinks:** CONFIRMED: Searing Word's 1 dmg got fully zeroed by stance before the ward ever saw it — 0 bank fed, discard still landed (hand 4→3). Stance-round chip-with-discard is genuinely free value. Passing rest of turn.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
    round 4 ends — level up
- P1: replace Fortify [ABJ-001] with Absorb [ABJ-011]
- P1: replace Arcane Shell [ABJ-002] with Reflective Ward [ABJ-012]
- P1: done preparing
> **P0 thinks:** L5 rebuild, mirroring m11's finding: VC out for Fireball (VV, 5 dmg) — the premier damage tool now. They rebuilt identically to m11 (Absorb + Reflective Ward in) — same bot upgrade path regardless of seed.
- P0: replace Volatile Charge [EVO-008] with Fireball [EVO-017]
> **P0 thinks:** Spark out (never landed clean, too easily blanked) for Wrath of the Mage: VM cost fits the impure fuel I keep accumulating, 4 dmg + draw.
- P0: replace Spark [EVO-001] with Wrath of the Mage [EVO-024]
> **P0 thinks:** Lineup: Fireball, Crackle, Backdraft, Searing Word, Wrath of the Mage.
- P0: done preparing
- P1: attach Somatic/Material [CMP-SM] → prepared[4]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Backdraft unarmed this round — missed the reaction on their opening Stance cast. Note for future rounds: arm Backdraft during prep/turn-0 if possible.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance round again — repeating the bank-free Searing Word play: their hand is 2, discard denies real value, damage should zero out before the ward.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[3]
- P0: CAST Searing Word [EVO-004] (prepared[3])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    → Searing Word [EVO-004] resolves
> **P0 thinks:** ENGINE NOTE: Searing Word's discard fizzled this time (opp hand stayed at 2) — likely because it can only discard a component card specifically, and their hand may have held no loose components. Holding Fireball/Wrath rather than feeding stance+ward for scraps.
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic x2 [CMP-SS] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: pass (end turn)
> **P0 thinks:** Two wards up now (3,3, one reflective) plus stance — nothing worth casting. Hoarding.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
> **P0 thinks:** Lost Overclock to random hand-cap discard — the risk I flagged earlier materialized. Real cost of the passive-hoard line.
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 5 ends — level up
> **P0 thinks:** 6th slot: Detonate. My hand is already naturally hoarded to 10 cards from repeated cap-discards, and I move first this round (no Stone Stance cast yet, only the persistent 4/4 wards) — this is the alpha window m11 had to engineer with Battle Trance. Casting it turn 1 this round before they can re-stance.
- P0: prepare Detonate [EVO-021]
- P0: done preparing
- P1: prepare Interrupt [ABJ-013]
- P1: replace Ward Pulse [ABJ-003] with Phase Shift [ABJ-014]
- P1: done preparing
> **P0 thinks:** Funding Detonate with a single VV card (minimal spend) to maximize the discard payload. Hand is 11 cards right now, before their Interrupt/Phase Shift/Stance are armed.
- P0: attach Verbal x2 [CMP-VV] → prepared[5]
> **P0 thinks:** Casting Detonate now — hand is 10 cards (20 raw damage), no stance up yet, their Interrupt/Phase Shift still unarmed. Alpha strike.
- P0: CAST Detonate [EVO-021] (prepared[5])
    P0 casts Detonate [EVO-021]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 12 damage
    → Detonate [EVO-021] resolves
> **P0 thinks:** Detonate landed 12 clean face after both wards died (8 EHP absorbed) — opponent 25→13. Hand now empty, no fuel to cast anything else this turn.
- P0: pass (end turn)
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Quenching Salts [GAM-013]
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Arming Backdraft with the lone V drawn — free reaction regardless of stance timing.
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** No ward up — Fireball nets 3 clean face through stance (5-2). Funding and casting; they're at 13.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: CAST Fireball [EVO-017] (prepared[0])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Fireball [EVO-017] resolves
> **P0 thinks:** Opponent at 10 HP. Backdraft still armed for their next cast.
- P0: pass (end turn)
- P1: PLAY Aegis Charm [GAM-011] (trainer)
    P1 plays Aegis Charm [GAM-011]
    P1 ward → 3 HP
- P1: pass (end turn)
> **P0 thinks:** Only VM in hand, only fits Wrath. Damage will get soaked (4-2stance=2 into ward3) but the draw is guaranteed regardless — worth it since my hand is nearly dry and they're at 10 HP, close to a Backdraft/Fireball finish.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
- P0: detach Verbal/Material [CMP-VM]
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
- P0: pass priority
- P1: pass priority
    → Wrath of the Mage [EVO-024] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Wrath's 2 got absorbed by ward (3→1) but the draw landed. My slots exhausted; Backdraft stays armed for their final turn.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
> **P0 thinks:** Firing Backdraft — stance is live this round so likely zeroed, but free to fire since it sweeps anyway at round end. Testing.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    → Backdraft [EVO-013] resolves
- P1: pass priority
> **P0 thinks:** CONFIRMED again: stance blanks reaction damage too (Backdraft's 2-2=0, no change to ward/HP). Matches m11 finding.
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: detach Somatic [CMP-S]
- P1: pass (end turn)
    round 6 ends — level up
- P1: replace Aegis [ABJ-004] with Counterbind [ABJ-015]
- P1: done preparing
> **P0 thinks:** Opponent at 10 HP with 4 EHP of wards — very close to lethal. Keeping the lineup, no changes needed.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance+4 EHP of wards blanks everything this turn. Arming Backdraft, holding the VV for a cleaner Fireball window.
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Funding Searing Word for the free discard denial (damage zeroed by stance again, but hand disruption is free).
- P0: attach Verbal/Somatic [CMP-VS] → prepared[3]
- P0: CAST Searing Word [EVO-004] (prepared[3])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    → Searing Word [EVO-004] resolves
> **P0 thinks:** Discard fizzled again (no components in their hand apparently). Holding VV for Fireball once stance drops.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Playing Battle Trance now rather than waiting — deck is thinning fast (theirs at 0, mine at 1) and the position is already crushing. Trance+Fireball this turn even through stance+walls should still net some face.
- P0: PLAY Battle Trance [GAM-010] (trainer)
    P0 plays Battle Trance [GAM-010]
    P0 takes 2 damage
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: CAST Fireball [EVO-017] (prepared[0])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: REACT with Absorb [ABJ-011] (prepared[0])
    P1 reacts with Absorb [ABJ-011]
> **P0 thinks:** Absorb fired on my Fireball+Trance — will prevent all 6 (post-stance) and heal them 3. Painful reversal. Firing Backdraft anyway (free, will sweep otherwise) though stance likely zeroes it too. Lesson: should have prepped Hex Bolt (unreactable) instead of/alongside Fireball for a burst turn — it's immune to exactly this Absorb answer.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
> **P0 thinks:** POTENTIAL ENGINE ISSUE: Counterbind (cancels spells requiring an M component) fired, but nothing on the stack requires M — Fireball(VV), Absorb(SS), Backdraft(V) all M-free. Watching what it actually resolves against.
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
> **P0 thinks:** Counterbind resolved as a no-op (no valid M-requiring target existed) — this reads as a BOT BLINDSPOT (wasted an SM reaction on nothing), not an engine bug; the engine correctly declined to cancel anything.
- P0: pass priority
- P1: pass priority
    → Backdraft [EVO-013] resolves
- P0: pass priority
- P1: pass priority
    → Absorb [ABJ-011] resolves
- P0: pass priority
- P1: pass priority
    P1 heals 4
    → Fireball [EVO-017] resolves
> **P0 thinks:** MAJOR FINDING: Absorb healed 4 = half of Fireball+Trance's PRE-stance total (8), not the post-mitigation delivered amount — Absorb calculates off the spell's raw damage, ignoring stance's own -2. Net this exchange: I spent Trance (2 HP) + a cast slot for nothing, they gained 4 HP (10→14). Lesson: an unrevealed SS-funded slot sitting armed for multiple turns should be treated as a probable cancel — don't combo big spells into it blind.
- P0: pass (end turn)
    P1 reshuffles discard into deck (#1) — exhaustion 2
    P1 takes 2 damage
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** My deck is also at 0 — playing Arcane Study to draw 2 and rebuild hand, accepting the exhaustion trigger if it happens.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
    P0 reshuffles discard into deck (#1) — exhaustion 2
    P0 takes 2 damage
> **P0 thinks:** Keeping the pure V (funds most of my kit), putting VM back on top since only Wrath needs M.
- P0: choose Verbal/Material [CMP-VM]
> **P0 thinks:** Nothing punches through stance+walls this small a margin. Passing rest of turn.
- P0: pass (end turn)
- P1: detach Verbal/Somatic [CMP-VS]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** Wrath for the guaranteed card draw, even though the 2 net damage will get soaked.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
- P0: detach Verbal/Material [CMP-VM]
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    P0 takes 1 damage
    → Wrath of the Mage [EVO-024] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 4 HP
- P1: pass (end turn)
    round 7 ends — level up
> **P0 thinks:** Swapping Fireball for Hex Bolt (unreactable) — after eating Absorb's heal-back on Fireball+Trance last round, I want a damage tool that can't be targeted by their reaction package (Absorb/Counterbind) to close this out. I go first this round.
- P0: replace Fireball [EVO-017] with Hex Bolt [EVO-012]
- P0: done preparing
- P1: replace Stone Stance [ABJ-005] with Break Form [ABJ-016]
- P1: done preparing
> **P0 thinks:** No stance this round. Ward is exactly 4 — Wrath's 4 dmg destroys it exactly (no spillover) but nets a free draw and clears the wall for next turn's Hex Bolt.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
- P0: detach Verbal/Material [CMP-VM]
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    → Wrath of the Mage [EVO-024] resolves
> **P0 thinks:** Wall's clear, no stance. Funding Hex Bolt (unreactable) for clean 3 face — dodges Absorb entirely if it gets re-armed mid-stack.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Already used this turn's 1 cast (Wrath) — Hex Bolt stays funded [V,V] for next turn.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Chalking Hex Bolt for +1 before casting — Absorb is only half-funded [S] this round, not yet armed.
- P0: PLAY Empowered Chalk [ITM-007] (trainer)
    P0 plays Empowered Chalk [ITM-007]
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P1 takes 4 damage
    → Hex Bolt [EVO-012] resolves
> **P0 thinks:** 8 HP left on them. Arming Backdraft for their reply.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[1]
> **P0 thinks:** Landed on Crackle instead of Backdraft — fine, leaving it funded for next turn since hand is empty anyway. Passing.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** No ward up — Crackle should land at least its 1 clean face. They're at 8.
- P0: CAST Crackle [EVO-010] (prepared[1])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Arming Backdraft for their final turn.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P0: pass (end turn)
- P1: pass (end turn)
    round 8 ends — level up
- P1: done preparing
> **P0 thinks:** Opponent at 7 HP — Hex Bolt alone is lethal range. Keeping the lineup, no changes needed.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Absorb now fully armed [SS]. No components in hand to cast anything yet. Passing.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Only 1 V-symbol this turn — funding Crackle for a small guaranteed chip (7→6ish) rather than risk Absorb eating a bigger spell I can't fully fund yet.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P0: CAST Crackle [EVO-010] (prepared[1])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
> **P0 thinks:** 6 HP left. Absorb didn't fire on the small Crackle. Passing — no components in hand.
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** Arming Backdraft — 6 HP left, even a partial reaction chip matters now.
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** VSM funds Wrath (VM) exactly, no waste. No ward up — 4 dmg would bring them to 2, plus a free draw. Risk: Absorb is armed and could heal them back, but worst case is minor.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
- P0: pass priority
- P1: REACT with Absorb [ABJ-011] (prepared[0])
    P1 reacts with Absorb [ABJ-011]
> **P0 thinks:** Absorb fired on Wrath (will prevent + heal them). Firing Backdraft in response — no stance this round, so it should land clean 2 regardless of Wrath's fate.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: REACT with Phase Shift [ABJ-014] (prepared[2])
    P1 reacts with Phase Shift [ABJ-014]
- P0: pass priority
- P1: pass priority
    → Phase Shift [ABJ-014] resolves
- P0: pass priority
- P1: pass priority
    → Backdraft [EVO-013] CANCELLED
- P0: pass priority
- P1: pass priority
    → Absorb [ABJ-011] resolves
- P0: pass priority
- P1: pass priority
    P1 heals 2
    → Wrath of the Mage [EVO-024] resolves
> **P0 thinks:** Absorb prevented Wrath and healed 2 (6→8), but cost them 2 reactions (Absorb+Phase Shift) and I still got the free draw. Not enough fuel for another cast this turn — holding Overclock.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: pass (end turn)
> **P0 thinks:** Ward is 3, Hex Bolt's 3 will destroy it exactly (0 spillover) but clears the board for next turn — and their Absorb/Phase Shift are already spent this round.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    → Hex Bolt [EVO-012] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
- P1: pass (end turn)
    round 9 ends — level up
> **P0 thinks:** 7th slot: Spark back in — cheap, clean 1-symbol reach (2 dmg, no self-cost) for closing out with whatever fuel I draw. Opponent at 8 HP, I go first this round.
- P0: prepare Spark [EVO-001]
- P0: done preparing
- P1: prepare Reckoning [ABJ-032]
- P1: replace Absorb [ABJ-011] with Aegis Eternal [ABJ-022]
- P1: replace Reflective Ward [ABJ-012] with Total Negation [ABJ-023]
- P1: done preparing
> **P0 thinks:** They prepped Reckoning + Total Negation (SSS cancel+lock) — dangerous but slow to fund. No ward up — Spark for a clean guaranteed 2 (8→6), low value target unlikely to eat a big reaction.
- P0: attach Verbal [CMP-V] → prepared[6]
- P0: CAST Spark [EVO-001] (prepared[6])
    P0 casts Spark [EVO-001]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Spark [EVO-001] resolves
> **P0 thinks:** 6 HP left. No fuel left in hand.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[6]
- P1: pass (end turn)
> **P0 thinks:** Hex Bolt for 3 unreactable — 6→3.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Hex Bolt [EVO-012] resolves
> **P0 thinks:** 3 HP left — one more hit wins it. No fuel left this turn.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[6]
- P1: CAST Reckoning [ABJ-032] (prepared[6])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
> **P0 thinks:** Reckoning finally cast. No reaction available. Watching what it does — bank was fed only lightly this whole game (mostly small ward soaks, ~1-3 per round).
- P0: pass priority
    P0 takes 25 damage
    GAME OVER — P1 wins (hp)
    → Reckoning [ABJ-032] resolves

**Result:** P1 wins (hp), round 10.

## Analysis

PILOTED CALIBRATION: Evocation (me, P0) vs greedy Abjuration bot, seed 3202. RESULT: LOSS, round 10. HP at the end: P0 -9, P1 3. I was dominating the whole game (16 HP vs their 3 HP going into the final turn) and lost in a single hit to Reckoning [ABJ-032], which dealt 25 damage — far more than my remaining HP.

== RESULT ==
P1 (Abjuration) wins by HP, round 10. Reckoning resolved for 25 damage, one-shotting me from 16 HP to -9 while they sat at 3 HP. This is the OPPOSITE of m11 (seed 3201, decisive Evo win, round 8, 19-HP margin) on the same doctrine and a near-identical opening.

== HOW THE LOSS ACTUALLY HAPPENED ==
I followed the m11 doctrine closely: refused to feed wards/stance during mitigation-heavy rounds, hoarded hand for a R6 Detonate alpha (discarded a naturally-hoarded 10-card hand for 20 raw damage, 25→13 HP on them), then kept pressuring with Fireball/Wrath/Hex Bolt/Crackle/Spark through rounds 6-10, taking them from 13 HP to 3 HP by R10 turn 2. I was never seriously threatened on life total (ended most rounds 16-23 HP against their chip damage). Then on R10 turn 3, with them at 3 HP, they cast Reckoning and it dealt 25 damage — lethal despite my commanding position.

The critical difference from m11: this game, their Absorb [ABJ-011] reaction fired TWICE on my larger spells — once on a Battle-Trance-pumped Fireball (R7, 8 pre-stance damage, healed them 4) and once on Wrath of the Mage (R9, 4 damage, healed them 2). In m11, Absorb was drawn/prepared but never fired. I chose both of those casts myself, once into an unrevealed-but-suspicious armed SS slot (R7) and once knowingly risking an already-revealed armed Absorb (R9) because the upside (closing out the game) seemed to outweigh the downside (a small heal-back). That assumption was wrong: Absorb's "prevented damage" appears to feed Reckoning's bank at a MUCH higher rate than ward-soaks or stance-reductions — 12 combined prevented damage from two Absorb triggers, plus a game's worth of small ward-soak and stance-reduction chip (Crackle/VC/Searing Word/Backdraft into wards and stance across R1-R9, individually 1-3 points each), apparently summed to a bank that converted into 25 damage. That is NOT a "return roughly half of what you fed" formula — it reads as feeding at or above parity, or Absorb's full-prevention counts at 100% toward the bank while ward-soaks count at a lower rate.

== SCORECARD ==
My face damage to them: Detonate 12, Hex Bolt 3+4(chalked)+3, Wrath 0(absorbed)+0(absorbed, both prevented), Fireball 0(absorbed), VC 3+2, Crackle 1+1+1, Spark 2, Backdraft 2+2(2 more blanked by stance) ≈ they went 30→3 HP over 10 rounds, i.e. I landed roughly 27 damage on a 30-HP target — a dominant damage race by any normal measure.
Fed to their bank (traceable): ward-soaks R1 Crackle(3)+VC(1), R2 Searing Word(1), R3 Backdraft(2), R6 Wrath(2), R9 Hex Bolt(3) ≈ 12 from wards; stance-reductions R3-R7 Searing Word x3 (1 each, capped by the spell's own low damage) + Backdraft x2 blanked by stance (2+2) ≈ 7 from stance; Absorb full-preventions: Fireball+Trance (8, pre-stance) + Wrath (4) = 12. Rough total prevented ≈ 31. Reckoning returned 25 — roughly 80% of everything I ever fed it, not ~50%.
Their reactions: Absorb fired twice (net +6 HP to them directly, plus whatever it contributed to the eventual Reckoning bank) — by far the most impactful reaction in the game, nothing like m11 where Absorb never fired. Phase Shift fired once (cancelled my Backdraft, no HP swing either way). Counterbind fired once with NO valid target and resolved as a pure whiff (bot blindspot). Interrupt was prepared but never funded/fired.

== VERDICT ON THE EDGE ==
This single result, taken alone, would say Abjuration is fine or even favored at skilled play — exactly the opposite of m11. But the mechanism of the loss is narrow and almost entirely attributable to Reckoning's payout formula being far more generous than the m11 doctrine assumed, combined with two voluntary casts into an Absorb that I could have played around (both were judgment calls under uncertainty, not forced). The pilot-gap doctrine calls for a 3rd game before drawing a verdict on the school matchup — but the ENGINE/BALANCE finding here stands regardless of who "wins the rubber": Reckoning is not a fair trickle-back mechanic in this build. A player can win the damage race decisively (27 of 30 HP, opponent never above 25 HP after round 6) and still die to a single spell that converts a modest amount of prevented damage into a bigger number than the defender's entire remaining life total, with no way to interact with it (no reaction was armed or available to me on the cast). That is a swinginess problem independent of which school "should" win the matchup.

== PRICING NOTES ==
- Reckoning [ABJ-032] (SS, L10-gated by prep availability): converted an estimated ~31 lifetime-prevented damage into a 25-point single hit — that's not a "reward for turtling," it's close to a 1:1 damage-banking wincon with no telegraphed cap and (in this game) zero counterplay window (I had no armed reaction when it resolved). Needs either a visible running bank counter so the defender can plan around lethal thresholds, a damage cap, or a lower conversion rate. As currently measured (m11: never fired, 0 damage since bank stayed near zero via disciplined refusal; m12: fired once for 25 off ~31 banked) the payout curve looks closer to "prevented damage back at ~80%" than the "~50%" assumed in the m11 write-up — that assumed rate should be treated as unverified/wrong going forward.
- Absorb [ABJ-011] (SS, Reaction): "prevent all damage from one spell + heal half, rounded down" calculates its heal off the spell's PRE-mitigation total (confirmed: Fireball 5 + Battle Trance 3 = 8 raw; stance was also active but the heal was 4 = half of 8, not half of the post-stance 6) — Absorb ignores your own team's stance reduction when pricing the heal, which is a small inconsistency but means comboing Trance into an Absorb-armed board is worse than it looks (you're pumping the healer, not just the target). Also apparently a major Reckoning-bank contributor — the single biggest lever in this game.
- Counterbind [ABJ-015] (SM, Reaction, "cancel target spell requiring a Material component"): the bot fired it into a stack with zero M-cost cards present (Fireball/Absorb/Backdraft all M-free) and it resolved as a complete whiff. Pure bot blindspot — the bot doesn't check for a legal/valuable target before committing a reaction.
- Hex Bolt [EVO-012] (VV, "cannot be the target of Reactions") performed exactly as advertised and as m11 predicted: every Hex Bolt cast this game landed its full damage, immune to the entire Absorb/Phase Shift/Counterbind package. It should be the default finisher whenever any Abjuration cancel package is on board — Fireball should not be, given this game's Absorb punishment.
- Searing Word [EVO-004] (V, "1 dmg + opponent discards a random component card"): confirmed it can whiff its discard clause entirely when the opponent's hand has no component cards in it (observed twice — R5 T51 and R7 T67, opponent hand size unchanged after cast). Text should probably say "if able" or the card should be understood as conditional, not guaranteed, disruption.
- Crackle [EVO-010] (V, "1 dmg + 2 additional to a target Ward"): CORRECTING m11's read — the "1 damage to opponent" portion is NOT face-guaranteed. When a ward is active, ward absorption checks apply to Crackle's flat opponent-damage component too (confirmed R1: ward[4], Crackle dealt 1+2=3 total, ward went to 1, zero face damage recorded). Crackle only gets guaranteed face damage when the ward's remaining HP is smaller than Crackle's total output (spillover model, same as any other damage spell).

== BOT BLINDSPOTS ==
1. Counterbind fired with no legal/valuable target (pure whiff, SM cost wasted).
2. Cast Stone Stance repeatedly into rounds where I was doing essentially zero damage (no adaptation to the refusal pattern), same as m11.
3. Never pressured my life total independently — I ended most rounds having taken more self-inflicted damage (Overclock/Trance/VC self-cost) than bot damage, until Reckoning, which did all its damage in one non-interactive burst.
4. Did use Absorb well this game (unlike m11) — timed it on my two biggest single-spell threats (Trance-Fireball, Wrath) both times, suggesting the bot's Absorb-timing heuristic is fine when Absorb is drawn/prepared early; m11's Absorb-never-fired result may have just been a prep-order/draw-luck artifact rather than a real blindspot.

== ENGINE / BEHAVIOR NOTES OBSERVED ==
1. One spell-cast initiation allowed per turn-visit regardless of remaining cast slots for that round (slots track a per-round budget, but you still only get to START one cast per alternating turn; confirmed repeatedly when a second cast-X slug simply wasn't offered after casting once in the same main-phase visit).
2. Playing a Gambit/Item ("PLAY ... (trainer)") does not consume a cast slot — confirmed across many turns (slots counter unchanged after Dispelling Powder, Arcane Study, Battle Trance, Empowered Chalk, Overclock-in-hand-not-played).
3. Hand-cap discards (cap 10) trigger immediately once hand exceeds 10 at end-of-turn resolution, not only at round end — happened mid-round repeatedly. Cost me a drawn Overclock once to a random discard (R4/R5 boundary).
4. Deck-out is a real mechanic: hitting 0 in the Resource Deck triggers "reshuffles discard into deck — exhaustion N" plus N direct damage to that player, observed at exhaustion-tier 2 (2 damage) for both sides in R7. This is a genuine secondary damage clock neither doctrine document previously accounted for.
5. Reaction damage (Backdraft) is absorbed by an active Ward exactly like spell damage (confirmed R3 T20: Backdraft's 2 vanished into a ward with no HP/face change) — consistent with, and reconfirms, m11's parallel finding that Stone Stance also blankets reaction damage.
6. Absorb's heal is computed off the reacted spell's raw/pre-mitigation total, not the post-stance delivered amount (see Pricing Notes).

