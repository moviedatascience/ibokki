# Playtest m15: Evocation (P0) vs Abjuration (P1) — seed 3203 — bot greedy — POST-FIX re-run of m13
- P1: prepare Fortify [ABJ-001]
- P1: prepare Arcane Shell [ABJ-002]
- P1: prepare Ward Pulse [ABJ-003]
- P1: prepare Aegis [ABJ-004]
- P1: done preparing
> **P0 thinks:** R1 opening, mirroring m13's proven kit as baseline: Burning Hands — cheap chip before mitigation commits.
- P0: prepare Burning Hands [EVO-003]
> **P0 thinks:** Volatile Charge: best V-rate face damage when unmitigated.
- P0: prepare Volatile Charge [EVO-008]
> **P0 thinks:** Backdraft: punish their casts. Note the post-fix reaction-legality change should not affect this — Backdraft answers spell casts, which is its printed trigger.
- P0: prepare Backdraft [EVO-013]
> **P0 thinks:** Crackle: chip damage while unmitigated (m13 found it feeds bank equally under wards, but early free chip is still fine when no mitigation is up).
- P0: prepare Crackle [EVO-010]
> **P0 thinks:** Done preparing R1.
- P0: done preparing
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P1: attach Somatic x2 [CMP-SS] → prepared[3]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** No fuel armed on Backdraft yet — pass, let Fortify resolve. Refuse-the-bank doctrine starts immediately.
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: pass (end turn)
> **P0 thinks:** Hoard doctrine: no cast into their 2-ward. Arcane Study for card development instead — zero bank feed.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Banking a redundant pure-V (already holding 3) — keep VS/VSM/item for flexible funding.
- P0: choose Verbal [CMP-V]
> **P0 thinks:** Arming Backdraft for their remaining cast slot this round — free reaction fuel, no bank feed.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Pass — Backdraft armed and waiting. Holding rest, no bank feed into the 2-ward.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Continuing to hold — no bank feed, waiting out their remaining slot.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Continuing to hold — round will auto-end at the turn-limit safety valve if neither side casts. Refusing bank feed.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Pre-funding Volatile Charge (V cost) with a spare V — ready to fire the instant a mitigation-free window opens, no cast yet so no bank feed.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** DOCTRINE SHIFT from m13: kill-by-R9 makes early bank feed nearly free (a fast kill nullifies Reckoning entirely) while denying the bot's free wall-building EV is real value. Their ward is only 2 — Volatile Charge (3 dmg) should destroy it with 1 overflowing to face per m13's single-ward-overflow finding. Testing continuous pressure instead of pure turtle.
- P0: CAST Volatile Charge [EVO-008] (prepared[1])
    P0 casts Volatile Charge [EVO-008]
> **P0 thinks:** Pass priority, let Volatile Charge resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 1 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** Funding Burning Hands — no mitigation up right now (ward just destroyed), clean chip window.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** 1-spell-per-turn cap already used (Volatile Charge) — Burning Hands funded and waiting for next turn. Passing.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** No mitigation up — clean 1 dmg + burn marker, uses my last slot this round.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, let it resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** My slots exhausted for the round — opponent gets their final turn. Passing.
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: pass (end turn)
    round 1 ends — level up
> **P0 thinks:** R2 prep: keeping the same 4 — all four still have live matchups. R1 result: opponent 30→27 (VC ward-clear+overflow, BH clean, burn tick), me 30→29. Doctrine shift from m13 (chip continuously instead of pure turtle) already produced real R1 damage where m13 had a stalemate.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Alpha window: fresh round, opponent board totally unarmed. Funding Volatile Charge for immediate clean damage.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Clean cast, no mitigation up.
- P0: CAST Volatile Charge [EVO-008] (prepared[1])
    P0 casts Volatile Charge [EVO-008]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 takes 3 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** Fund Burning Hands for next turn (1-spell/turn cap already used).
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Pass turn.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Still unmitigated — clean chip + burn.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Arming Backdraft with the spare VV — punish their first cast whenever it comes.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
> **P0 thinks:** Correcting — that attached to the already-cast Burning Hands slot by mistake. Detaching to redirect to Backdraft.
- P0: detach Verbal x2 [CMP-VV]
> **P0 thinks:** Arming Backdraft correctly on prep2.
- P0: attach Verbal x2 [CMP-VV] → prepared[2]
> **P0 thinks:** Slots exhausted for the round — pass.
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: pass (end turn)
    round 2 ends — level up
- P1: prepare Stone Stance [ABJ-005]
- P1: done preparing
> **P0 thinks:** 5th slot: Searing Word — cheap chip + component discard, hand disruption vs their supply. Matching m13's R3 tech pick.
- P0: prepare Searing Word [EVO-004]
> **P0 thinks:** Done preparing R3.
- P0: done preparing
- P1: pass (end turn)
> **P0 thinks:** Alpha window continues — opponent board totally unarmed again. Funding Volatile Charge.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** Clean cast, unmitigated.
- P0: CAST Volatile Charge [EVO-008] (prepared[1])
    P0 casts Volatile Charge [EVO-008]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 takes 3 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** Fund Burning Hands for next turn.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Fund Searing Word too — building toward continuous pressure through the round.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
> **P0 thinks:** Pass — 1 cast used this turn, more funded and waiting.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Backdraft unarmed — can't react. Let Stone Stance resolve.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: PLAY Second Wind [GAM-009] (trainer)
    P1 plays Second Wind [GAM-009]
    P1 heals 5
- P1: pass (end turn)
> **P0 thinks:** Testing Dispelling Powder against Stone Stance (an 'ongoing effect') — if it clears bank-free, our chip spells land clean the rest of this round instead of getting reduced to 0.
- P0: PLAY Dispelling Powder [GAM-012] (trainer)
    P0 plays Dispelling Powder [GAM-012]
> **P0 thinks:** Testing whether Dispelling Powder cleared Stone Stance — casting Burning Hands to check if damage lands clean or gets reduced.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
> **P0 thinks:** FINDING: Dispelling Powder appears to have stripped Stone Stance's damage-reduction — Burning Hands landed the full 1 clean (24→23) instead of getting reduced. Dispelling Powder is stronger than previously credited: it can strip the stance debuff itself, not just pop wards, bank-free. Passing — 1 cast used this turn, Searing Word funded for next.
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: pass (end turn)
> **P0 thinks:** Last slot this round — Searing Word, clean since stance was stripped.
- P0: CAST Searing Word [EVO-004] (prepared[4])
    P0 casts Searing Word [EVO-004]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Searing Word [EVO-004] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted — pass, opponent's final turn.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** Nothing to react with. Pass.
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: detach Somatic [CMP-S]
- P1: detach Somatic [CMP-S]
- P1: detach Somatic [CMP-S]
- P1: detach Somatic [CMP-S]
- P1: detach Verbal/Somatic [CMP-VS]
- P1: detach Somatic [CMP-S]
- P1: pass (end turn)
    round 3 ends — level up
> **P0 thinks:** R4 prep: keeping kit, all still productive. Pace check: opponent 30→21 through 3 rounds (vs m13's ~30 still at this point) — the continuous-pressure doctrine shift is working.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Funding Volatile Charge to clear their 2-ward and land 1 overflow face, keeping continuous pressure.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Clear the 2-ward, overflow to face.
- P0: CAST Volatile Charge [EVO-008] (prepared[1])
    P0 casts Volatile Charge [EVO-008]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 1 damage
    → Volatile Charge [EVO-008] resolves
> **P0 thinks:** Fund Burning Hands for next turn.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Arm Backdraft for their upcoming cast.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[2]
> **P0 thinks:** Pass turn.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Clean chip again.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
> **P0 thinks:** Fund Crackle for next turn.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
> **P0 thinks:** Pass turn.
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: pass (end turn)
> **P0 thinks:** Crackle, still unmitigated.
- P0: CAST Crackle [EVO-010] (prepared[3])
    P0 casts Crackle [EVO-010]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted — pass. R4 progress: opponent 21→17, entirely uncontested (they never cast this round).
- P0: pass (end turn)
- P1: pass (end turn)
    round 4 ends — level up
- P1: replace Fortify [ABJ-001] with Absorb [ABJ-011]
- P1: replace Arcane Shell [ABJ-002] with Reflective Ward [ABJ-012]
- P1: done preparing
> **P0 thinks:** L5 rebuild: Volatile Charge out (job done, 3-dmg V spell now superseded), Fireball in — VV, 5 dmg, the burst payload for alpha windows.
- P0: replace Volatile Charge [EVO-008] with Fireball [EVO-017]
> **P0 thinks:** Searing Word out, Wrath of the Mage in — VM, 4 dmg + card draw, replaces itself.
- P0: replace Searing Word [EVO-004] with Wrath of the Mage [EVO-024]
> **P0 thinks:** Done preparing R5.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Opponent armed prep0 with SS (likely Absorb per their level-5 prep replace). Funding cheap Burning Hands to test/bait rather than risking Fireball into a possible full-negation reaction.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Cheap bait/chip cast.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
> **P0 thinks:** No components in hand to fund further; holding Empowered Chalk for a combo turn with Fireball. Pass.
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: pass (end turn)
> **P0 thinks:** Fund Wrath but hold the cast — their prep0 SS is very likely Absorb (they swapped Fortify→Absorb at L5). Doctrine: never feed damage into an armed Absorb. Waiting for it to reveal or for overwhelming force.
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
> **P0 thinks:** Pass — holding Wrath funded rather than risk it into the likely Absorb.
- P0: pass (end turn)
- P1: pass (end turn)
    P1 discards 1 (hand cap)
> **P0 thinks:** Arming Backdraft with the second VM — ready to punish their next cast.
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
> **P0 thinks:** Pass, holding.
- P0: pass (end turn)
- P1: pass (end turn)
    P1 discards 1 (hand cap)
> **P0 thinks:** Fund Crackle too — keep hand shed and options open.
- P0: attach Verbal [CMP-V] → prepared[3]
> **P0 thinks:** Cheap bait cast against their armed SS — testing if it's Absorb and whether the bot burns it on a trivial 1-dmg spell.
- P0: CAST Crackle [EVO-010] (prepared[3])
    P0 casts Crackle [EVO-010]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
> **P0 thinks:** Holding Wrath rather than risk it into their still-unused armed SS. Their unspent attached fuel sweeps at round end regardless — patience costs nothing here.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
> **P0 thinks:** Backdraft on their Reflective Ward CAST — since it stacks LIFO on top, it resolves BEFORE the ward goes live, so no mitigation exists yet to absorb it. Should land clean 2 face.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: REACT with Absorb [ABJ-011] (prepared[0])
    P1 reacts with Absorb [ABJ-011]
> **P0 thinks:** ENGINE OBSERVATION: Absorb (ABJ-011, 'prevent all damage from one spell that targets you') just targeted my Backdraft REACTION's damage, not a Spell cast. Backdraft's card type is Reaction, not Spell — this looks like it might be the same class of bug the reaction-legality fix addressed (Combust/Backdraft-family cards), just from the Abjuration side and not named in today's fix scope. Flagging for review. Passing to resolve the stack.
- P0: pass priority
- P1: pass priority
    → Absorb [ABJ-011] resolves
- P1: pass priority
> **P0 thinks:** Pass, continue resolving.
- P0: pass priority
    P1 heals 1
    → Backdraft [EVO-013] resolves
- P1: pass priority
> **P0 thinks:** Pass, let Reflective Ward resolve.
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
- P1: PLAY Aegis Charm [GAM-011] (trainer)
    P1 plays Aegis Charm [GAM-011]
    P1 ward → 3 HP
- P1: pass (end turn)
> **P0 thinks:** Absorb now spent for this round (cast flag set) — safer window incoming. But their 6-EHP double-ward [3,3] would fully absorb Wrath's 4 for zero face, so holding it. Partially funding Fireball instead.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Pass, holding for more fuel / a clean window.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
> **P0 thinks:** Backdraft already spent this round. Pass.
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: pass (end turn)
> **P0 thinks:** Fully funding Fireball with the second V.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Absorb is spent this round — safe to commit. Fireball into the 8-EHP double-ward: destroys the first 4-ward, 1 overflow into the second (4→3), setting up Wrath to clear the rest next turn.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    → Fireball [EVO-017] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted (3 casts this round: BH, Crackle, Fireball). Wrath stays funded for R6. Pass.
- P0: pass (end turn)
- P1: pass (end turn)
    round 5 ends — level up
> **P0 thinks:** 6th slot: Hex Bolt — VV, 3 dmg, unreactable. Opponent has shown Absorb (now confirmed to hit even Reaction-type damage, not just Spells) — testing whether Hex Bolt's unreactable tag is immune to that.
- P0: prepare Hex Bolt [EVO-012]
> **P0 thinks:** Done preparing R6.
- P0: done preparing
- P1: prepare Interrupt [ABJ-013]
- P1: replace Ward Pulse [ABJ-003] with Phase Shift [ABJ-014]
- P1: done preparing
> **P0 thinks:** Dig for more component fuel — need a second V/M to fund Wrath or Hex Bolt this alpha window.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
> **P0 thinks:** Taking Battle Trance — key burst tool for the alpha-strike kit (+3 dmg on next spell this turn).
- P0: choose Battle Trance [GAM-010]
> **P0 thinks:** Partial-funding Hex Bolt. Holding the Trance/Chalk/Overclock burst kit for a real payload spell rather than wasting it on Burning Hands.
- P0: attach Verbal [CMP-V] → prepared[5]
> **P0 thinks:** Pass, building toward a bigger combo turn.
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Nothing to react with. Pass.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Play Recharge to fetch VV — completes Hex Bolt funding for a future clean turn (not casting into this stance+ward round).
- P0: PLAY Battle Trance [GAM-010] (trainer)
    P0 plays Battle Trance [GAM-010]
    P0 takes 2 damage
> **P0 thinks:** MISPLAY: intended to play Recharge (GAM-004) but the index had shifted and I played Battle Trance instead — wasted 2 HP for zero payoff since no spell was funded to cast this turn (only 1 gambit/item play allowed per turn, so Recharge is now locked out too). Lesson: re-verify indices against the freshest listing text, not memory, especially right after a hand-changing action. Passing — stance round, nothing profitable to cast anyway.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Quenching Salts [GAM-013]
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Recharge to fetch VV — building toward a full burst kit (Fireball/Hex Bolt both need VV) for next round's clean window.
- P0: PLAY Recharge [GAM-004] (trainer)
    P0 plays Recharge [GAM-004]
> **P0 thinks:** Take VV to complete Hex Bolt / fund Fireball.
- P0: choose Verbal x2 [CMP-VV]
    P0 searches out Verbal x2 [CMP-VV]
> **P0 thinks:** Fully fund Hex Bolt.
- P0: attach Verbal x2 [CMP-VV] → prepared[5]
> **P0 thinks:** Fund Wrath too. Holding both — stance+ward still up, casting now would be pure bank feed with 0 face.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
> **P0 thinks:** (Note: that VM went to Crackle[3] not Wrath[4] as intended — slug suffix is the target slot, not the listing position; fine either way, Crackle's now backup-funded.) No more components in hand. Passing — stance+ward round, holding.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Still holding through stance round.
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** Arm Backdraft for their remaining cast slot.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Fund Burning Hands too.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Everything funded and waiting. Still stance round — pass.
- P0: pass (end turn)
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 5 HP
- P1: pass (end turn)
> **P0 thinks:** Fund Fireball too — building max funded arsenal for R7's clean window.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
> **P0 thinks:** Pass — stance+5ward round, holding.
- P0: pass (end turn)
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 7 HP
- P1: pass (end turn)
> **P0 thinks:** Fund Fireball fully this time (targeting slot 1).
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Out of components. Pass.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Fully fund Fireball.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** All spells funded and waiting. Stance+7wall still up — holding for R7's clean window.
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
> **P0 thinks:** Declining Backdraft — existing 7-ward would absorb it fully (0 face) plus Reflective Ward's reflect tax, and Absorb is armed again. Not worth it.
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: pass (end turn)
    round 6 ends — level up
- P1: replace Aegis [ABJ-004] with Counterbind [ABJ-015]
- P1: done preparing
> **P0 thinks:** R7 prep: keeping kit. Wall carried over to 10 EHP [7,3] — biggest yet. Opponent still at 15 HP (unchanged since R5 Fireball). Planning a real burst turn with Overclock+Chalk once I have enough component fuel.
- P0: done preparing
- P1: attach Verbal/Somatic [CMP-VS] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Pass, nothing to react with.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Fund Wrath (targeting slot 4).
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
> **P0 thinks:** Pass, stance round.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Arm Backdraft.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Pass.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Fund Fireball.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** Pass — stance+10wall+armed Absorb, still holding for a clean window.
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** Fund Burning Hands too.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Pass.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
- P1: pass (end turn)
> **P0 thinks:** Fund Crackle. Their deck at 0 — exhaustion imminent for them next draw.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[2]
> **P0 thinks:** Pass.
- P0: pass (end turn)
    P1 reshuffles discard into deck (#1) — exhaustion 2
    P1 takes 2 damage
- P1: PLAY Second Wind [GAM-009] (trainer)
    P1 plays Second Wind [GAM-009]
    P1 heals 5
- P1: pass (end turn)
> **P0 thinks:** Fund Crackle.
- P0: attach Verbal [CMP-V] → prepared[3]
> **P0 thinks:** Fully funded arsenal waiting. Pass — still stance+wall+Absorb.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: pass (end turn)
    P0 reshuffles discard into deck (#1) — exhaustion 2
    P0 takes 2 damage
> **P0 thinks:** Partial-fund Hex Bolt.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[5]
> **P0 thinks:** Pass, still stance round.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
> **P0 thinks:** Declining — existing 7-ward absorbs it fully anyway, and Absorb is armed to snipe it. Pass.
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: pass (end turn)
> **P0 thinks:** Wall now 13 EHP + stance + armed Absorb — even a full Overclock+Chalk burst (Fireball+Wrath, ~10 raw) wouldn't clear it this round. Holding for a better window rather than feeding 10 bank for 0 face.
- P0: pass (end turn)
    round 7 ends — level up
> **P0 thinks:** R8 prep: keeping kit — Detonate would only be 6 dmg with my current thin hand (3 cards), not worth swapping in yet. 2 rounds left before the R9 kill deadline; need a real push this round or next.
- P0: done preparing
- P1: replace Stone Stance [ABJ-005] with Break Form [ABJ-016]
- P1: done preparing
> **P0 thinks:** Stone Stance is GONE this round (swapped for Break Form) and their board is unarmed — a real alpha window against the 13-wall, no stance tax. But I have zero components in hand right now. Digging with Scrying Lens.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
> **P0 thinks:** Take VV.
- P0: choose Verbal x2 [CMP-VV]
> **P0 thinks:** Also play Arcane Study to dig for more component fuel this turn.
- P0: PLAY Empowered Chalk [ITM-007] (trainer)
    P0 plays Empowered Chalk [ITM-007]
> **P0 thinks:** (Correcting — that was Chalk by mistake, fine, it's active now for the next damaging spell.) Now actually playing Arcane Study.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Bank the lone CMP-V — keeping Overclock (need it for the double-cast) and the VV/VS for funding.
- P0: choose Verbal [CMP-V]
> **P0 thinks:** Fund Fireball fully (targets slot 1).
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** Fund Burning Hands too (targets slot 0) — as the second spell for Overclock.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Wait — check listing first before acting on Overclock.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Playing Overclock now for the double-cast this turn.
- P0: PLAY Overclock [GAM-008] (trainer)
    P0 plays Overclock [GAM-008]
    P0 takes 2 damage
> **P0 thinks:** Cast Fireball — with Chalk's +1 pending, this should be 6 raw into the 13-wall.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    → Fireball [EVO-017] resolves
> **P0 thinks:** (Confirmed: Chalk expired unused from the earlier accidental pass — 'this turn' really means the turn it's played, cost me the +1.) Casting Burning Hands as the Overclock second spell.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    → Burning Hands [EVO-003] resolves
> **P0 thinks:** Fund Crackle (targets slot 3) for next turn — small enough to punch through the 1-ward with overflow.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Pass — hand empty, Backdraft armed for their turn.
- P0: pass (end turn)
    P1 burns for 1
    P1 ward destroyed
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** ENGINE OBSERVATION: burn tick destroyed their 1-ward directly — burn appears to bypass ward mitigation entirely, matching design doctrine. Playing Recharge to fetch fuel for the next cast (I have 1 slot left this round).
- P0: PLAY Recharge [GAM-004] (trainer)
    P0 plays Recharge [GAM-004]
> **P0 thinks:** Take VV to fund Hex Bolt.
- P0: choose Verbal x2 [CMP-VV]
    P0 searches out Verbal x2 [CMP-VV]
> **P0 thinks:** Fund Hex Bolt (slot 5) — unreactable, 3 dmg, should clear part of the remaining 6-wall.
- P0: attach Verbal x2 [CMP-VV] → prepared[5]
> **P0 thinks:** Cast Hex Bolt into the 6-wall.
- P0: CAST Hex Bolt [EVO-012] (prepared[5])
    P0 casts Hex Bolt [EVO-012]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    → Hex Bolt [EVO-012] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted (Fireball+BH+HexBolt this round, cleared most of the wall down to 3 EHP, but 0 face got through — all absorbed). Opponent still 18 HP. 1 round left before the R10 danger zone. Pass.
- P0: pass (end turn)
- P1: pass (end turn)
    round 8 ends — level up
- P1: done preparing
> **P0 thinks:** R9 — THE kill-window round per doctrine. Swapping Backdraft (repeatedly eaten by Absorb for poor value) for Lightning Bolt — VV, 4 dmg, floor 1 vs stance reduction. Opponent at 18 HP with just a 3-ward remaining and Reckoning not live until L10 next round — need to close this out now.
- P0: replace Backdraft [EVO-013] with Lightning Bolt [EVO-018]
> **P0 thinks:** Done preparing.
- P0: done preparing
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** No components to fund anything yet — holding Battle Trance for later (learned the lesson: don't play it before I can immediately follow with a cast). Pass.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Fund Burning Hands (targets slot 0) — cheap bait/chip.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** Bait cast against the armed Absorb.
- P0: CAST Burning Hands [EVO-003] (prepared[0])
    P0 casts Burning Hands [EVO-003]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Burning Hands [EVO-003] resolves
> **P0 thinks:** No components in hand. Pass.
- P0: pass (end turn)
    P1 burns for 1
    P0 takes 1 damage
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 3 HP
- P1: pass (end turn)
> **P0 thinks:** Drew Dispelling Powder — using it now to strip their rebuilt 3-ward bank-free, clearing the path for a clean burst this round.
- P0: PLAY Dispelling Powder [GAM-012] (trainer)
    P0 plays Dispelling Powder [GAM-012]
    P1 ward destroyed
> **P0 thinks:** Wall fully cleared. Passing to draw fuel for the kill push.
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** Fund Wrath (slot 4) with the VM.
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
> **P0 thinks:** Casting Wrath plain (no Trance yet) — testing whether Absorb triggers before committing burst tools.
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 4 damage
    → Wrath of the Mage [EVO-024] resolves
> **P0 thinks:** Fund Crackle (slot 3) with the drawn V — my last slot this round, pairing with Battle Trance for max damage.
- P0: attach Verbal [CMP-V] → prepared[3]
> **P0 thinks:** Playing Battle Trance now — immediately following with Crackle this same turn.
- P0: PLAY Battle Trance [GAM-010] (trainer)
    P0 plays Battle Trance [GAM-010]
    P0 takes 2 damage
> **P0 thinks:** MISPLAY (repeat pattern): Wrath was already this turn's spell-cast, so Battle Trance's 'next spell this turn' bonus has nothing left to attach to — wasted 2 HP for zero payoff, same mistake class as the Chalk waste in R8. Crackle stays funded for next turn instead. Passing.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Detaching Crackle's V — redirecting both V's to fund Fireball (5 dmg) instead of Crackle (1 dmg) for my last slot this round.
- P0: detach Verbal [CMP-V]
> **P0 thinks:** Fund Fireball with first V (targets slot 1).
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Second V into Fireball, completing funding.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Casting Fireball — my last slot this round. Risk: Absorb is armed, but it's my best available damage right now.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 takes 5 damage
    → Fireball [EVO-017] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted — opponent at 9 HP, down from 18 this round (BH 1 + Wrath 4 + Fireball 5). Their final turn now; R9 will end without a kill but the position is dominant heading into R10 (Reckoning becomes live for them).
- P0: pass (end turn)
- P1: PLAY Aegis Charm [GAM-011] (trainer)
    P1 plays Aegis Charm [GAM-011]
    P1 ward → 3 HP
- P1: pass (end turn)
    round 9 ends — level up
> **P0 thinks:** R10 — the Reckoning danger round. New 7th slot: Unstoppable Bolt (VVV, 5 dmg, cannot be cancelled/redirected/reduced) — guaranteed damage vs their Absorb/wards/whatever, opponent is at 9 HP and this alone is over half their HP.
- P0: prepare Unstoppable Bolt [EVO-035]
> **P0 thinks:** Done preparing R10.
- P0: done preparing
- P1: prepare Reckoning [ABJ-032]
- P1: replace Absorb [ABJ-011] with Ward Collapse [ABJ-031]
- P1: replace Reflective Ward [ABJ-012] with Aegis Eternal [ABJ-022]
- P1: done preparing
> **P0 thinks:** CRITICAL: They prepped Reckoning this round but I'm acting first. Opponent at 9 HP with a 3-ward. Funding Fireball — 5 dmg will clear the ward with 2 overflowing to face. Racing to kill before they get a turn to cast Reckoning.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** Cast Fireball now.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
> **P0 thinks:** Pass, resolve.
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    P1 takes 2 damage
    → Fireball [EVO-017] resolves
> **P0 thinks:** Opponent at 7 HP, board completely unarmed. No components in hand — pass to draw and continue the kill push.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[6]
- P1: CAST Reckoning [ABJ-032] (prepared[6])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
> **P0 thinks:** Nothing to react with — bracing for Reckoning's damage number. This is the moment that killed m13.
- P0: pass priority
    P0 takes 13 damage
    GAME OVER — P1 wins (hp)
    → Reckoning [ABJ-032] resolves

**Result:** P1 wins (hp), round 10.

## Analysis

RESULT: LOSS, round 10. Final HP: P0 (me) 0, P1 (Abjuration bot) 7. Reckoning [ABJ-032] hit for 13 on the bot's very first turn of R10, exactly equal to my remaining HP.

== HOW IT ACTUALLY HAPPENED ==
This game diverged sharply from m13 in approach: instead of m13's near-total R1-R5 hoard/turtle, I chipped continuously from turn 1 (doctrine shift: since a fast kill nullifies Reckoning entirely, pre-R10 bank feed is nearly free, and denying the bot's free wall-building EV is real value). Result: opponent was at 27 HP after R1 (vs 30/stalemate in m13), 21 by R3, 17 by R4, 15 by R5 — roughly a full 2-3 rounds ahead of m13's pace. R6-R8 stalled against a growing wall (peaked at 13 EHP across 3 ward pools) plus recurring Stone Stance; heavy investment (Fireball+Overclock+BH combo in R8) cleared most of the wall but landed ~0 net face those rounds. R9: cleared the last ward with a drawn Dispelling Powder (bank-free), then landed Wrath(4)+Fireball(5) clean for 9 face, taking the bot from 18 to 9 HP — but slots ran out before a third hit. R10 opened with me acting first: Fireball into their rebuilt 3-ward for 2 overflow (bot to 7 HP), but with my components exhausted I had to pass, and on their very next turn they cast Reckoning for 13, which was exactly my remaining HP (13) — a one-shot kill despite them sitting at 7 HP with no other resources.

== THE DECISIVE FINDING: this loss was self-inflicted, not matchup-inevitable ==
Reconstructing my own HP ledger: 30 (start) → 13 (pre-Reckoning) is 17 lost, but two of those losses were pure piloting misplays with ZERO payoff: I played Battle Trance (GAM-010, -2 HP, "+3 to next spell cast this turn") twice in situations where I had already used that turn's one spell-cast, so the bonus expired unused both times — 4 HP burned for nothing (a near-identical error also wasted Empowered Chalk in R8, though that one cost no HP). Had I not made those two misplays, I would have entered R10 at 17 HP, survived Reckoning's 13 with 4 HP to spare, and had 2 remaining cast slots in R10 to finish the bot's 7 HP (Hex Bolt 3 + Lightning Bolt 4 = exactly lethal, or Unstoppable Bolt 5 alone plus anything). This game was winnable on the actual line played, lost specifically to execution error, not to a bad matchup or an unbeatable Reckoning number.

== SCORECARD ==
Face damage to opponent by round: R1: 2 (VC overflow 1 + BH 1) +1 burn tick = 3, ending 27. R2: 3(VC)+1(BH)+1(burn)=5, ending 22. R3: 1(BH)+1(Searing Word)+1(burn, pre-Powder)... approx to 21. R4: 1(VC overflow)+1(BH)+1(Crackle)+1(burn)≈4, ending 17. R5: 1(BH)+1(Crackle)=2 face (Fireball/Wrath held off Absorb-armed board), ending 15. R6: 0 face (13-wall absorbed everything, incl. a Fireball). R7: 0 face (stance+wall all round, healed back to 18 via Second Wind+exhaustion swap). R8: 0 face (Fireball+BH+HexBolt all fed the wall down from 13 to 3 EHP). R9: 10 face (Wrath 4 + Fireball 5, plus BH 1 into ward), ending 9. R10: 2 face (Fireball overflow), ending 7 — game ended there.
My HP lost: ~17 over 10 rounds — Volatile Charge self-damage (~4, several casts), Ward Pulse taps (~3), Reflective Ward reflect-tax (~2), Overclock (2), exhaustion reshuffle (2), Hex Bolt self-tax (1), and the two wasted Battle Trance plays (4, zero benefit).
Their reactions: Absorb (ABJ-011) was armed almost every round but the bot never used it on my actual damage spells this game — it DID use it once on my Backdraft reaction (see engine note below), healing 1. Reflective Ward reflected 1 damage to me on at least 2 absorbed hits. No Interrupt/Counterbind/Break Form/Total Negation were ever actually cast against me this game (all either unprepped, swapped out before firing, or simply not triggered).
Their healing: Second Wind +5 (R3), Second Wind +5 again (R7), plus the R7 exhaustion/heal net (+3 overall that round).

== COMPARISON TO m13 (same seed, same bot) ==
Pace was dramatically better: opponent reached 15 HP by R5 here vs. still ~30 HP through R5 in m13 — roughly 3+ rounds of pace gained purely from the "chip continuously from R1" doctrine shift instead of m13's total hoard-until-R6 approach. Both games converged on a similar structural trap in the end, though: m13 got the bot to 2 HP by R9 but never landed the kill and died to two consecutive 18-damage Reckonings (R10+R11). This game got the bot to 9 HP by R9 (further ahead than m13 was at the same round) and to 7 HP in R10, but STILL didn't land the kill in time, and died to a single 13-damage Reckoning. The common thread across both games: getting the opponent very low is not sufficient — the 3-cast-slots-per-round cap means even a dominant position can fail to close in the 1-2 turns available before Reckoning fires, and every self-damage source (which both games used liberally: Overclock, Battle Trance, Volatile Charge, ward reflects) directly shrinks the buffer against Reckoning's exact number. This game adds a new, sharper data point: it is possible to be MUCH further ahead than m13 was and still lose to Reckoning's very first cast, because MY OWN HP total is just as much a target of the "kill by R9" clock as the opponent's is.

== VERDICT ON THE EDGE ==
Kill-before-R10 was very nearly achievable and would very likely have succeeded with cleaner piloting (no Trance misplays) — the 13-HP buffer that Reckoning exactly consumed was self-inflicted, not structural. That said, actually landing the kill strictly within R9 (opponent had 18 HP entering that round, and the kit tops out around 9-12 raw face per round once any mitigation is in play) looks like it needs either a stronger burst plan (Detonate with a fuller hand, or holding Unstoppable Bolt-tier guaranteed damage in reserve one level earlier) or denying the bot's wall-building more aggressively in R6-R8 (this game's R6-R8 fed ~13+ points of raw damage into wards for ~0 net face, which is exactly the kind of "necessary but bank-feeding" wall-clearing the doctrine warns about). Net verdict: the edge is genuinely close and piloting-sensitive — a small number of concrete execution fixes (see below) flip this specific game to a win, but the R9 deadline remains a real, tight constraint even for a much faster line than m13's.

== PRICING NOTES ==
1. Reckoning [ABJ-032] continues to behave as previously documented: repeatable, uncapped, fires the instant it's available. In this game it only got to fire once because the match ended immediately, but it was loaded and ready to fire again next round had I survived without killing.
2. Absorb [ABJ-011] — the bot held it unused against real damage spells all game (never absorbed Wrath or Fireball despite both being cast into an Absorb-armed board multiple times), which looks like a bot-side underuse/blindspot rather than a card problem — see Bot Blindspots.
3. Dispelling Powder [GAM-012] confirmed (again) as an efficient, bank-free way to strip both wards AND (this game, R3) Stone Stance's damage reduction itself — stronger than prior writeups credited; worth flagging in card-power notes as a premium answer, not just a ward-popper.
4. Battle Trance / Empowered Chalk — both are "next spell THIS TURN" effects that do not carry to a later turn even within the same round; playing them when the turn's one spell-cast is already spent (or without immediately following with a cast in the same turn) wastes them entirely. This cost real HP twice in this game. Recommend: if this isn't already how the design intends it, no engine change needed, but it's a real pilot trap worth calling out explicitly in doctrine going forward.

== BOT BLINDSPOTS ==
1. Never used Absorb on an actual damage spell all game (Wrath 4 and Fireball 5×2 all went through into an Absorb-armed board unpunished) — it only ever fired once, on my 2-damage Backdraft reaction. This is a real blindspot: Absorb sat idle through multiple much-better targets.
2. Continued building walls (Fortify/Ward Pulse/Reflective Ward/Bulwark Shard) turn after turn even while behind on HP and racing a losing clock, consistent with prior findings that the bot has no proactive offense plan and treats wall-building as free EV regardless of race state.
3. Cast Reckoning the instant it was available (first action of its first R10 turn), same as m13 — confirms the bot prioritizes it immediately rather than holding it, which in THIS game is exactly what let it win (had it waited even one more of my turns, I'd likely have found the finishing 7 damage first).

== ENGINE OBSERVATIONS ==
1. Burn markers bypass ward mitigation: a burn tick destroyed an active 1-HP ward directly (R8) rather than being absorbed by it — matches the stated design doctrine that burn should bypass stance/wards.
2. Ward overflow on a single ward continues to route excess to face cleanly (confirmed multiple times: VC/Fireball destroying a small ward with 1-2 overflow reaching the opponent).
3. POSSIBLE ANOMALY (flagging, not asserting a bug): Absorb [ABJ-011] — "Prevent all damage from one spell that targets you" — successfully targeted and fully prevented my Backdraft [EVO-013], which is a Reaction-type card, not a Spell. This looks like the same class of issue today's reaction-legality fix addressed (Combust/Backdraft-family cards restricted to their printed trigger type), just from the Abjuration side and not named in the fix's stated scope (which covered Combust/Combustive Counter, Backdraft/Searing Backlash/Annihilation Strike, Counterbind/Break Form specifically). Worth a follow-up check on whether Absorb's target legality should also be restricted to Spell-type stack items only.
4. No illegal-looking reaction behavior was otherwise observed post-fix — Counterbind and Break Form were both prepared by the bot at various points but never actually cast against me this game (either swapped out before use or simply not triggered), so this game has limited direct evidence on that specific part of the fix beyond "nothing looked wrong."
5. Confirmed again: 1-spell-per-turn cap applies regardless of remaining round slots (funded spells wait for the next turn); Overclock lifts this by exactly 1 extra cast per turn, and both casts still consume round-slots normally.
6. Unspent attached components are swept at round end if not detached — cost me a funded Wrath's VM component once (R5→R6) when I forgot to detach.

== PILOTING NOTES FOR FUTURE GAMES ==
Two clear, avoidable execution errors decided this game: (1) playing a "next spell this turn" buff (Battle Trance/Empowered Chalk) without first confirming a spell-cast is still available THIS turn — happened twice with Trance (4 HP wasted, directly fatal) and once with Chalk (a wasted card, no HP cost); (2) misreading action-list indices after a hand-changing action shifted the list (caused one outright accidental "pass" that skipped playing Overclock, recovered but cost the Chalk combo). Going forward: always re-fetch/re-read the freshest legal-action listing immediately before acting rather than reusing remembered indices, and never play a single-turn combo piece without the payoff spell already fundable and ready in the same action sequence.
