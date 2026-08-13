# Playtest m13: Evocation (P0) vs Abjuration (P1) — seed 3203 — bot greedy
- P1: prepare Fortify [ABJ-001]
- P1: prepare Arcane Shell [ABJ-002]
- P1: prepare Ward Pulse [ABJ-003]
- P1: prepare Aegis [ABJ-004]
- P1: done preparing
> **P0 thinks:** R1 prep: Burning Hands — cheap chip when no stance/ward is up (m11 confirmed burn is dead vs stance/wards, but early rounds before they commit mitigation it's free face damage).
- P0: prepare Burning Hands [EVO-003]
> **P0 thinks:** Volatile Charge: best V-rate face damage — 3 clean when no mitigation is up.
- P0: prepare Volatile Charge [EVO-008]
> **P0 thinks:** Backdraft: reaction dmg on their casts. m11 learned reaction dmg = spell dmg (stance blanks it too), but on non-stance rounds it's free clean face on their cast.
- P0: prepare Backdraft [EVO-013]
> **P0 thinks:** Deviation from m11's opening: Crackle instead of Searing Riposte. m11's own findings showed Riposte is near-dead vs this bot (stance blanks its trigger AND its output; doesn't trigger off ward soaks) while Crackle's ward-targeted damage pierces Stone Stance — taking the corrected line from turn 1 instead of discovering it mid-game.
- P0: prepare Crackle [EVO-010]
- P0: done preparing
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P1: attach Somatic x2 [CMP-SS] → prepared[3]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** No fuel armed on Backdraft yet — pass, let Fortify resolve. Refuse-the-bank doctrine starts immediately: not worth attaching reactively into their first ward.
- P0: pass priority
    P1 ward → 2 HP
    → Fortify [ABJ-001] resolves
- P1: pass (end turn)
> **P0 thinks:** Hoard doctrine: no cast into their 2-ward (feeds bank for 1 face, not worth it this early). Play Arcane Study for card quality/quantity instead — pure development, zero bank feed.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Bottoming a redundant pure-V (already holding 3) — keep the VS/VSM for flexible multi-symbol funding and the item for later.
- P0: choose Verbal [CMP-V]
> **P0 thinks:** Arming Backdraft for their remaining cast slot this round — 2 clean face on their next cast, no bank feed.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Pass — Backdraft armed and waiting, holding rest.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Holding — Backdraft stays armed for their remaining cast slot.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Continuing to hold — no bank feed, waiting out their remaining slot.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Continuing to hold — round will auto-end at the turn-limit safety valve if neither side casts (engine ROUND_TURN_LIMIT=8/player). Refusing bank feed.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Drew Dispelling Powder — holding for a bigger wall later (ward stacks with repeat Fortify; better value popping a large wall than this 2-HP one). Hand at cap; letting auto-discard trim lowest-value fuel if it triggers.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Drew Overclock too — full m11 burst kit already in hand (Powder+Overclock). Holding, waiting for the turn-limit round-end valve.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 1 ends — level up
> **P0 thinks:** R2 prep: keep the same 4 — no card in this kit is proven bad yet, and Crackle/Backdraft/BH/VC all still have live matchups.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Zero armed fuel on their side (fresh round) but their 2-ward carries over from R1 — casting VC/BH now still feeds it more than it hits face. Holding for a bigger wall or a stance-free/ward-free window.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
- P1: PLAY Second Wind [GAM-009] (trainer)
    P1 plays Second Wind [GAM-009]
    P1 heals 5
- P1: pass (end turn)
> **P0 thinks:** Still refusing — their wall now 3 and they have 2 unrevealed armed slots (S,S and VSM) I can't safely read yet. No pressure worth the bank feed.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
> **P0 thinks:** Drew Empowered Chalk too — full burst kit assembled (Powder/Overclock/Chalk) well ahead of m11's pace. Still refusing to feed the 3-wall.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: pass (end turn)
> **P0 thinks:** ENGINE FINDING: hand-cap auto-discard just ate Dispelling Powder — sculptValue() gives ALL Items/Gambits a flat 1.5, tied below any 2-or-3-symbol component card, and ties break to the oldest card in hand. With a hand full of VS/VSM/VV dupes, my unique tech (Powder, now at risk: Overclock/Chalk) loses the tie. Shedding hand size now by attaching spare components (no cast, no bank feed) to protect Overclock/Chalk from the same fate.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Shedding another spare component to keep hand under the discard threshold — protecting Overclock/Chalk this turn.
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
> **P0 thinks:** Hand safely at 9. BH and VC both funded and ready but holding — still not worth feeding the 3-wall. Ending turn.
- P0: pass (end turn)
- P1: pass (end turn)
    round 2 ends — level up
- P1: prepare Stone Stance [ABJ-005]
- P1: done preparing
> **P0 thinks:** 5th slot: Searing Word — new tech vs m11's kit. Its discard-random-component clause is a separate effect from the 1 damage; worth testing whether it still fires when the damage itself is fully absorbed by ward/stance (bank-safe-ish hand disruption vs their component drought, unlike pure damage spells that only feed Reckoning when blocked).
- P0: prepare Searing Word [EVO-004]
- P0: done preparing
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: pass (end turn)
> **P0 thinks:** Arming Backdraft — they still have 2 cast slots left this round, punish their next spell.
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Backdraft triggers on their Stone Stance CAST itself — since it stacks LIFO on top, it resolves BEFORE Stone Stance goes live, so the -2 reduction can't apply to it. Testing whether reacting to the stance-cast trigger dodges the stance tax entirely (vs m11 where Riposte fired AFTER stance was already active and got blanked).
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    → Backdraft [EVO-013] resolves
- P1: pass priority
> **P0 thinks:** FINDING: Backdraft's 2 dmg got fully absorbed by their ward[4]→2, not face — reactions route through ward mitigation too, same as spells. Correction to my plan: the LIFO-before-stance-resolves trick only matters for STANCE reduction, not WARDS (which are a separate standing mitigation layer that any damage, spell or reaction, must clear first). Mistake — fed 2 bank for 0 face by reacting here. Passing to let Stone Stance resolve.
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance round — casting nothing (m11: stance blanks BH/reaction damage to 0, and reactions still route through wards as I just confirmed). Shedding hand size only, no offense.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Shed spare V to funded BH slot, keeping hand size in check.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn)
- P0: attach Verbal [CMP-V] → prepared[1]
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[2]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
- P0: pass priority
    P1 ward → 4 HP
    → Fortify [ABJ-001] resolves
    slots exhausted — P0 gets one final turn
- P1: PLAY Aegis Charm [GAM-011] (trainer)
    P1 plays Aegis Charm [GAM-011]
    P1 ward → 3 HP
- P1: pass (end turn)
> **P0 thinks:** Final turn of the round, stance still up — holding again. NOT detaching the unspent V/V/VSM fuel: doctrine says detaching dodges the round-end sweep, but I want to preserve my lone value-1 CMP-V as hand-cap discard fodder (sculptValue ties break to the oldest card in hand, and Overclock/Chalk/Recharge all sit at the same 1.5 as that lost Powder did) — better to sacrifice 3 replaceable components to the sweep than risk another Gambit.
- P0: pass (end turn)
    round 3 ends — level up
> **P0 thinks:** R4 prep: keeping the kit as-is. Confirmed doctrine: unspent attached fuel (2xV + VSM) was destroyed by the round-end sweep since I chose not to detach — traded 3 replaceable components to protect Overclock/Chalk/Recharge from hand-cap discard.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Alpha-window check: fresh round, zero armed fuel on their side, but two wards (4,3=7EHP) up and no burst spell yet at my level — payoff too small to break discipline broadly. Testing Crackle's ward-piercing on the smaller 3-ward instead, to log whether ward-targeted damage still banks Reckoning fuel (m11 left this unresolved).
- P0: attach Verbal [CMP-V] → prepared[3]
> **P0 thinks:** Cast Crackle at their 3-ward to test bank-feeding on ward-targeted damage.
- P0: CAST Crackle [EVO-010] (prepared[3])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    → Crackle [EVO-010] resolves
> **P0 thinks:** FINDING confirmed: Crackle's 1 face + 2 ward damage BOTH got absorbed by the ward (4→1, not 4→2 as if only the ward-targeted portion applied) — ward mitigation intercepts ALL damage aimed at a warded player, including the 'to opponent' clause. Crackle is NOT bank-free; it fed 3 bank for 0 face. Correcting m11's open question. Arming Backdraft for their 3 available cast slots this round; also sheds hand size (no spare 1-symbol card left as discard fodder, so managing manually now).
- P0: attach Verbal x2 [CMP-VV] → prepared[2]
- P0: pass (end turn)
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Quenching Salts [GAM-013]
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Fortify [ABJ-001] (prepared[0])
    P1 casts Fortify [ABJ-001]
- P1: pass priority
> **P0 thinks:** Testing overflow: their weak 1-HP ward remnant is up. Backdraft's 2 dmg should destroy it and (if overflow applies, per the VC-into-broken-ward pattern from m11) put 1 through to face for a trivial 1-bank cost.
- P0: REACT with Backdraft [EVO-013] (prepared[2])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    P1 ward destroyed
    → Backdraft [EVO-013] resolves
- P1: pass priority
> **P0 thinks:** FINDING (reconciles m11's overflow question): with TWO wards stacked [1,3], Backdraft's 2 dmg destroyed the 1-ward AND the 1 excess point rolled into the SECOND ward (3→2) — wards[1,3]→[2], zero face damage. So overflow cascades through the whole ward stack in order, only reaching face once every ward is cleared (consistent with m11 R1 where only ONE ward existed, so overflow went straight to face). Multi-ward Abj boards are much stickier than a single ward suggests.
- P0: pass priority
    P1 ward → 4 HP
    → Fortify [ABJ-001] resolves
- P1: pass (end turn)
> **P0 thinks:** Shedding hand size, funding VC for later. They rebuilt to a single 4-ward (Fortify appears to reinforce one ward pool rather than stacking separate tokens).
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: pass (end turn)
- P1: pass (end turn)
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn)
- P0: attach Verbal/Somatic [CMP-VS] → prepared[4]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Drew a pure CMP-V — restored as sacrificial hand-cap fodder (value 1, below the 1.5 gambits). Holding without further attach.
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[2]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: attach Somatic [CMP-S] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: pass (end turn)
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P0: pass (end turn)
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
    slots exhausted — P0 gets one final turn
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 7 HP
- P1: pass (end turn)
> **P0 thinks:** ENGINE FINDING: checked drawN — deck exhaustion is the REAL clock here. When a resource deck empties, discard reshuffles in and the player takes unblockable exhaustion damage (2x reshuffle count, bypasses wards/stance entirely, hits HP directly). My deck is down to 7 already at R4; pure passive turtling doesn't dodge damage forever, it just converts to exhaustion later. Final turn of R4, stance+7wall up — still casting nothing, but noting the clock is real and roughly symmetric (their deck is similarly low).
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 4 ends — level up
- P1: replace Fortify [ABJ-001] with Absorb [ABJ-011]
- P1: replace Arcane Shell [ABJ-002] with Reflective Ward [ABJ-012]
- P1: done preparing
> **P0 thinks:** L5 rebuild, mirroring m11: VC out (superseded), Fireball [EVO-017] in — VV, 5 dmg, the actual burst payload for alpha windows. P1 already prepping Absorb+Reflective Ward — matches m11's bait-before-committing pattern exactly.
- P0: replace Volatile Charge [EVO-008] with Fireball [EVO-017]
> **P0 thinks:** Searing Word out (untested, and I need the M-outlet), Wrath of the Mage in — VM, 4 dmg + draws a card, replaces itself.
- P0: replace Searing Word [EVO-004] with Wrath of the Mage [EVO-024]
- P0: done preparing
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 9 HP
- P1: pass (end turn)
> **P0 thinks:** Wall at 9 and growing (2x Bulwark Shard). Without Powder (lost earlier), the wall only matters when I choose to punch through it — Reckoning bank is fed by MY damage into it, not by their casting. Staying passive; the wall's size is their problem to carry, not mine, until I decide to spend a lethal-or-bust burst through it. Shedding hand size.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance round, holding. Deck at 5 — reshuffle/exhaustion damage imminent for me soon.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[2]
- P1: CAST Ward Pulse [ABJ-003] (prepared[2])
    P1 casts Ward Pulse [ABJ-003]
- P1: pass priority
- P0: pass priority
    P0 takes 1 damage
    → Ward Pulse [ABJ-003] resolves
- P1: pass (end turn)
> **P0 thinks:** Arming Backdraft for their last slot this round.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Correction to self: with wards[10] up, firing Backdraft now would just feed 2 more bank for 0 face (reactions route through wards too, confirmed earlier). Will decline to react even though armed — holding priority-pass discipline over the trigger.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** They armed an unrevealed reaction (VS on prep0, likely Absorb/Reflective Ward bait) without casting — holding it for a future counter. Not giving it a target. My deck at 3, reshuffle very close.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: detach Verbal/Somatic [CMP-VS]
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** They've armed 2 cancels now (SS + VS, unrevealed) with zero targets from me. Denying. Deck at 2 — my reshuffle is imminent.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
> **P0 thinks:** Declining Backdraft — Reflective Ward resolving into an already-huge wall, firing would only feed more bank.
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Final turn R5, still holding. Two ward reflective pools now [10,3] — different ward-granting cards create separate stack entries. Deck at 1, reshuffle next draw.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 5 ends — level up
> **P0 thinks:** 6th slot: Detonate. Wall is huge now (13 EHP across 2 wards) — Detonate's hand-discard scaling is the best single tool to punch a big burst through it (m11's R8 kill: 17 dmg vs their 5-wall). Also converts my low-deck problem into an asset: discarding a full hand refills the discard pile just before my reshuffle anyway.
- P0: prepare Detonate [EVO-021]
> **P0 thinks:** Burning Hands out (1 dmg chip is negligible now vs a 13-wall), Hex Bolt in — VV, 3 dmg, unreactable. They have armed cancels (SS on prep0, unrevealed) that Hex Bolt simply ignores.
- P0: replace Burning Hands [EVO-003] with Hex Bolt [EVO-012]
- P0: done preparing
- P1: prepare Interrupt [ABJ-013]
- P1: replace Ward Pulse [ABJ-003] with Phase Shift [ABJ-014]
- P1: done preparing
> **P0 thinks:** ALPHA WINDOW: fresh round, their board is completely unarmed (zero attached fuel anywhere, they haven't had a turn yet) — literally zero interrupt risk. Wall is 13 EHP. Plan: fund Detonate (VV, 1 card) and Fireball (VV, 1 card), Overclock for the double-cast, Detonate FIRST to blow through the wall, Battle Trance+Chalk saved for the second spell (Fireball) so their bonus damage lands clean on face once the wall's gone.
- P0: attach Verbal x2 [CMP-VV] → prepared[5]
> **P0 thinks:** Funding Fireball as the second (post-wall, clean-face) cast.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** Casting Detonate FIRST while hand is biggest (8 cards = 16 raw), before playing Overclock/Trance/Chalk (which would shrink hand and reduce its payoff). This absorbs into the 13-wall; Fireball comes after, buffed, for clean face.
- P0: CAST Detonate [EVO-021] (prepared[5])
    P0 casts Detonate [EVO-021]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 5 damage
    → Detonate [EVO-021] resolves
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** MISPLAY NOTED: Detonate's 'discard your hand' wiped Overclock/Trance/Chalk before I could play them — I'd sequenced Detonate first to maximize its own discard count, not realizing that also meant Fireball (funded, ready) couldn't be cast this turn at all without Overclock (1-spell-per-turn is a hard cap; Overclock is what lifts it). Correct sequencing would have been: play Overclock (and ideally Trance/Chalk into Detonate itself for a wash on raw damage) BEFORE casting Detonate, preserving the 2nd-cast window. Net cost: Overclock/Trance/Chalk's effects wasted entirely, Fireball deferred to a later turn instead of same-turn. Still landed a strong 5-face/13-wall-clear opener. Stance again — nothing to react with anyway (hand empty).
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
    P0 reshuffles discard into deck (#1) — exhaustion 2
    P0 takes 2 damage
> **P0 thinks:** Reshuffled (exhaustion #1, -2 HP unblockable) — Overclock/Trance/Chalk/Recharge are back in my deck now, recoverable. Wall is gone, stance is up (round-long, so waiting within this round gains nothing) and they still have zero armed reactions. Casting the already-funded Fireball now for clean 3 (5-2 stance), banking the tempo.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Fireball [EVO-017] resolves
> **P0 thinks:** Spending my last round-slot on Hex Bolt — only 1 clean dmg after stance, but unreactable and free (slot doesn't carry to next round anyway).
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
> **P0 thinks:** Confirmed: 1 spell/turn hard cap even with slots remaining — Hex Bolt funded and waiting for my next turn this round.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Casting Hex Bolt — unreactable, their armed SS (unrevealed) can't touch it regardless.
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Hex Bolt [EVO-012] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Slots exhausted for me this round (9 face total: Detonate 5 + Fireball 3 + Hex Bolt 1). Opponent 35→26.
- P0: pass (end turn)
    P1 reshuffles discard into deck (#1) — exhaustion 2
    P1 takes 2 damage
- P1: pass (end turn)
    round 6 ends — level up
- P1: replace Aegis [ABJ-004] with Counterbind [ABJ-015]
- P1: done preparing
> **P0 thinks:** R7 prep: keeping the kit — Hex Bolt/Fireball/Backdraft/Crackle/Wrath/Detonate all proven. Race is tight now: me 23, them 24 (their exhaustion reshuffle hit too, -2). They dropped Aegis for Counterbind — new cancel tech, watch for it.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[4]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[4])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Stance up, no wall, thin hand — building toward the next Detonate/alpha rather than chipping for 1-3 stance-taxed damage. Race is tight (23 v 24); bank debt is already ~20 from the R6 Detonate/Crackle tests, so I'm not being precious about it anymore, just picking spots.
- P0: pass (end turn)
- P1: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** They're arming 2 cancels (prep0: S+VS, prep2: SS) with zero targets from me — denying again.
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Somatic x2 [CMP-SS] → prepared[1]
- P1: CAST Reflective Ward [ABJ-012] (prepared[1])
    P1 casts Reflective Ward [ABJ-012]
- P1: pass priority
- P0: pass priority
    P1 ward → 3 HP
    → Reflective Ward [ABJ-012] resolves
- P1: pass (end turn)
> **P0 thinks:** Holding — haven't redrawn Overclock/Trance/Chalk since the reshuffle yet, so forcing round-end now (to sweep their 3 armed cancels) wouldn't have a payoff turn ready behind it. Building hand for the next real alpha.
- P0: pass (end turn)
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** They now have 4 armed unrevealed cancels (0,2,3,5) — a huge S/component investment. Time to force the sweep: spending my slots on Hex Bolt (unreactable, immune regardless) first.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Hex Bolt [EVO-012] resolves
> **P0 thinks:** FINDING: Hex Bolt's unreactable 1 dmg got fully absorbed by their Reflective Ward (3→2) AND I took 1 damage back — 'unreactable' blocks their Reaction cards, not ward mitigation, and Reflective Ward apparently punishes the attacker on absorb. Recalculating: switching to Fireball for the 2nd cast to overkill this 2-ward for 1 clean overflow face rather than Wrath's exact 2-into-2 (0 overflow).
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
> **P0 thinks:** Playing Overclock to get the 2nd cast (Fireball) this same turn — already used my 1 normal cast on Hex Bolt.
- P0: PLAY Overclock [GAM-008] (trainer)
    P0 plays Overclock [GAM-008]
    P0 takes 2 damage
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 ward destroyed
    P1 takes 1 damage
    → Fireball [EVO-017] resolves
> **P0 thinks:** FINDING: Reflective Ward reflects 1 dmg to ME every time it absorbs damage (2 reflects this turn) — real tax for attacking it, on top of feeding bank. Ward destroyed though, 1 clean overflow face landed. Funding Wrath for my last slot next turn (1 VM card covers its VM cost exactly).
- P0: attach Verbal/Material [CMP-VM] → prepared[4]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Last slot this round — Wrath. No wards left, pure clean face. This exhausts my slots, forcing round-end and sweeping their 4 armed cancels (0,2,3,5) unused.
- P0: CAST Wrath of the Mage [EVO-024] (prepared[4])
    P0 casts Wrath of the Mage [EVO-024]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Wrath of the Mage [EVO-024] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
- P1: pass (end turn)
    round 7 ends — level up
> **P0 thinks:** R8 prep: Backdraft out (kept eating reflect/ward tax with no net gain this game), Lightning Bolt in — VV, 4 dmg that can't be reduced below 1, extra guaranteed burst. Race is tight (19 v 21) and I estimate ~30+ damage already banked toward their Reckoning (L3, SS cost, deals half of all damage-I've-caused-them-to-prevent) — need to close this out fast and stop feeding mitigation from here unless it's a finishing blow.
- P0: replace Backdraft [EVO-013] with Lightning Bolt [EVO-018]
- P0: done preparing
- P1: replace Stone Stance [ABJ-005] with Break Form [ABJ-016]
- P1: done preparing
> **P0 thinks:** FINDING: Break Form only cancels S-component spells — dead card vs my all-V/M kit. Also: no stance this round (swapped out), no wards, zero armed reactions. Clean window — funding Fireball for immediate clean 5 face.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: pass priority
    P1 takes 5 damage
    → Fireball [EVO-017] resolves
> **P0 thinks:** Fireball landed clean 5 — opponent 21→16, now behind me (19 HP). Funding Lightning Bolt for next turn.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Lightning Bolt — clean 4, no mitigation up. They armed 2 unrevealed slots but nothing that can touch this (S-only Break Form is dead vs my kit anyway).
- P0: CAST Lightning Bolt [EVO-018] (prepared[2])
    P0 casts Lightning Bolt [EVO-018]
- P0: pass priority
- P1: pass priority
    P1 takes 4 damage
    → Lightning Bolt [EVO-018] resolves
> **P0 thinks:** Opponent down to 12 HP, me at 19. Funding Hex Bolt for my last slot this round.
- P0: attach Verbal x2 [CMP-VV] → prepared[0]
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Hex Bolt, unreactable, 3 clean dmg — opponent at 12, this brings them to 9 if unimpeded.
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Hex Bolt [EVO-012] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** 12 clean face this round (Fireball 5 + Lightning Bolt 4 + Hex Bolt 3), zero mitigation up all round. Opponent at 9 HP. Slots exhausted, their final turn now.
- P0: pass (end turn)
- P1: pass (end turn)
    round 8 ends — level up
- P1: done preparing
> **P0 thinks:** R9 prep: keeping kit — opponent at 9 HP, Fireball(5)+Lightning Bolt(4)=9 is lethal if unmitigated this round. Going for the kill before their Reckoning window (R10).
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Funding Fireball for the kill push.
- P0: attach Verbal [CMP-V] → prepared[1]
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** Casting Fireball into their armed SS-slot — will find out what it is if they react.
- P0: CAST Fireball [EVO-017] (prepared[1])
    P0 casts Fireball [EVO-017]
- P0: pass priority
- P1: REACT with Absorb [ABJ-011] (prepared[0])
    P1 reacts with Absorb [ABJ-011]
- P0: pass priority
- P1: pass priority
    → Absorb [ABJ-011] resolves
- P0: pass priority
- P1: pass priority
    P1 heals 2
    → Fireball [EVO-017] resolves
> **P0 thinks:** FINDING: Absorb (SS reaction) fully prevents one targeted spell's damage AND heals them half of it rounded down — Fireball's 5 became 0 face + 2 heal for them (9→11). That's the reaction that ate the Detonate-style burst risk. No hand cards to fund another spell this turn — passing.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: pass (end turn)
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: pass (end turn)
- P1: detach Somatic [CMP-S]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Quenching Salts [GAM-013]
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: attach Somatic [CMP-S] → prepared[2]
- P1: pass (end turn)
> **P0 thinks:** They've armed a fresh SS reaction (prep2) — likely another Absorb or Interrupt. Funding Lightning Bolt fully; will find out if they have a second Absorb.
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
- P0: CAST Lightning Bolt [EVO-018] (prepared[2])
    P0 casts Lightning Bolt [EVO-018]
- P0: pass priority
- P1: pass priority
    P1 takes 4 damage
    → Lightning Bolt [EVO-018] resolves
> **P0 thinks:** Opponent at 7 HP. No cards to fund another spell — passing, will finish next turn.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Opponent has 2 armed unrevealed reactions (prep2 SS, prep3 SM) — using cheap Crackle to bait/test before committing bigger spells. If they burn a reaction on a 1-dmg spell, great trade.
- P0: attach Verbal [CMP-V] → prepared[3]
- P0: CAST Crackle [EVO-010] (prepared[3])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Opponent at 6 HP. My slots exhausted this round — their final turn now.
- P0: pass (end turn)
- P1: pass (end turn)
    round 9 ends — level up
> **P0 thinks:** 7th slot: Unstoppable Bolt — VVV, 5 dmg, cannot be cancelled/redirected/reduced. Opponent at 6 HP with 4 unrevealed armed-capable slots (Absorb already seen); this is immune to whatever they still have, including a repeat Absorb.
- P0: prepare Unstoppable Bolt [EVO-035]
- P0: done preparing
- P1: prepare Reckoning [ABJ-032]
- P1: replace Absorb [ABJ-011] with Aegis Eternal [ABJ-022]
- P1: replace Counterbind [ABJ-015] with Total Negation [ABJ-023]
- P1: done preparing
> **P0 thinks:** They prepped Reckoning AND Total Negation (SSS, generic 'cancel target spell') — want to test whether Total Negation can override Unstoppable Bolt's 'cannot be cancelled' text, but not betting the kill on it. Zero armed reactions right now (fresh round) — safe window for a small guaranteed chip with Crackle while I rebuild hand for the bigger spells.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
- P0: CAST Crackle [EVO-010] (prepared[3])
    P0 casts Crackle [EVO-010]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Crackle [EVO-010] resolves
> **P0 thinks:** Opponent at 5 HP.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[6]
- P1: attach Verbal/Somatic [CMP-VS] → prepared[6]
- P1: CAST Reckoning [ABJ-032] (prepared[6])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 18 damage
    → Reckoning [ABJ-032] resolves
- P1: pass (end turn)
> **P0 thinks:** CRITICAL: Reckoning hit for 18 (confirms my ~35-36 banked estimate, half rounded up). I'm at 1 HP, opponent at 5. I have zero funded spells and no components in hand — must NOT play Battle Trance (self-damage would kill me). Playing Scrying Lens to try to find a component and get some offense online this turn; passing empty-handed leaves me completely exposed to whatever they draw next turn.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
> **P0 thinks:** Neither option alone funds a 2-symbol spell (my only 1-symbol option, Crackle, is already spent this round) — can't cast this turn regardless. Taking the pure V for future flexibility.
- P0: choose Verbal [CMP-V]
> **P0 thinks:** Partially funding Hex Bolt (unreactable) for next turn — 1 more V needed. Passing now; nothing else to do at 1 HP with an empty hand.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[5]
- P1: pass (end turn)
> **P0 thinks:** Survived. Completing Hex Bolt's funding — unreactable 3 dmg, safest way to hit them at 5 HP without risking a counter.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P0: CAST Hex Bolt [EVO-012] (prepared[0])
    P0 casts Hex Bolt [EVO-012]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Hex Bolt [EVO-012] resolves
> **P0 thinks:** Opponent at 2 HP, me at 1. Nothing more castable this turn (empty hand except unusable Trance). Passing — need to survive their turn.
- P0: pass (end turn)
- P1: attach Somatic [CMP-S] → prepared[5]
- P1: pass (end turn)
> **P0 thinks:** Opponent at 2 HP — Lightning Bolt (4, floor of 1 even if reduced) is lethal regardless of any last-second mitigation. Fully funded by this one CMP-VV.
- P0: attach Verbal x2 [CMP-VV] → prepared[2]
> **P0 thinks:** Lethal swing.
- P0: CAST Lightning Bolt [EVO-018] (prepared[2])
    P0 casts Lightning Bolt [EVO-018]
- P0: pass priority
- P1: REACT with Interrupt [ABJ-013] (prepared[5])
    P1 reacts with Interrupt [ABJ-013]
- P0: pass priority
- P1: pass priority
    → Interrupt [ABJ-013] resolves
> **P0 thinks:** FINDING: Interrupt doesn't 'cancel' in the literal sense — it strips all components from the target prepared spell (defunding it), which the engine then displays/treats as CANCELLED. This matters a lot: Unstoppable Bolt's 'cannot be cancelled, redirected, or reduced' text may not actually protect it from Interrupt if the engine's immunity check only guards the formal cancel path, not component-stripping. Also confirms reactions can retroactively invalidate an already-resolving spell on the stack. No slots left this round (all 3 used: Crackle/Hex Bolt/Lightning Bolt, even though LB got voided) — I'm at 1 HP with nothing more to do this turn.
- P0: pass priority
- P1: pass priority
    → Lightning Bolt [EVO-018] CANCELLED
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Their final turn, 2 slots still available to them. I'm at 1 HP with no defenses — nothing I can do but pass and see if they have lethal.
- P0: pass (end turn)
- P1: pass (end turn)
    round 10 ends — level up
- P1: replace Break Form [ABJ-016] with Inversion Field [ABJ-024]
- P1: done preparing
> **P0 thinks:** R11 prep: keeping kit. DANGER FLAG: they just prepped Inversion Field (SSM spell) — 'each time a spell would deal damage to you, gain that HP instead (max 5)' for the rest of the round. If they land this, I must hold all offense until round-end or I'll be healing them. I'm at 1 HP, they're at 2 — razor-thin, watching their casts closely this round.
- P0: done preparing
- P1: attach Somatic [CMP-S] → prepared[6]
- P1: attach Somatic [CMP-S] → prepared[6]
- P1: CAST Reckoning [ABJ-032] (prepared[6])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 18 damage
    GAME OVER — P1 wins (hp)
    → Reckoning [ABJ-032] resolves

**Result:** P1 wins (hp), round 11.

## Analysis

PILOTED CALIBRATION: Evocation (me, P0) vs greedy Abjuration bot (P1), seed 3203. RESULT: LOSS, round 11, HP -17 vs 2. This is the decisive reversal of m11 (seed 3201, P0 win, round 8, +19 margin) — same doctrine, same bot, different outcome, because this game reached the Reckoning window and m11 never did.

== RESULT ==
P1 (Abjuration) wins on HP. Final: P0 -17, P1 2. Round 11. I was ahead on board and tempo for the entire mid-game (R6-R9 alpha strikes took them from 35 HP to 2 HP while I sat at 19+ HP) and lost anyway, in two hits, once their level-10 Reckoning came online.

== HOW THE LOSS ACTUALLY HAPPENED ==
R1-R5: bank-starve/hoard discipline exactly like m11 — cast almost nothing into stance/wards, hoarded hand, funded reactions opportunistically. R1 was a total stalemate (both sides passed until the engine's round-turn-limit forced the round to end — a real, previously-undocumented safety valve: ROUND_TURN_LIMIT=8 turns/player, see packages/engine/src/mechanics.ts:19). R6-R9: four clean alpha windows (fresh rounds, zero armed opponent reactions) landed 5+3+1 (R6), then 5+4+3 (R8), etc., taking the bot from 35 HP to 2 HP while I sat comfortably ahead. This matched m11's doctrine working exactly as advertised — refusal + alpha timing dismantled the bot's defense.
R9-R10: at their level 10, the bot prepped and cast Reckoning [ABJ-032] (SS, L3): "deal damage equal to half the total damage you've prevented this match, rounded up." It hit for 18 — dropping me from 19 to 1 HP in one spell. I survived one more round on razor-thin margins (traded down to a 2 HP vs 1 HP race, lost a Lightning Bolt to their Interrupt reaction), then on their very next turn (R11) they cast Reckoning AGAIN for another 18, which killed me outright (I had zero HP buffer left to survive a second copy).

== THE DECISIVE ENGINE FINDING: Reckoning is repeatable, not one-shot ==
Checked packages/engine/src/effects/abjuration.ts:77 — `register("ABJ-032", (c) => c.dealRawDamage(Math.ceil(c.damagePreventedTotal() / 2)))`. `damagePreventedTotal` (packages/engine/src/types.ts:127, state-ops.ts:96-123) is a lifetime/match-long counter that is incremented every time my damage is absorbed/reduced/prevented, and is NEVER decremented, reset, or consumed when Reckoning fires. Reckoning itself is prepared like any other spell — nothing marks it unique-per-match or unique-per-round, and `prep.cast` resets to false every round-end (mechanics.ts:183) like all prepared spells. The result: once the bank crosses a threshold, Reckoning becomes a repeating execute button the bot can fire EVERY ROUND for (at minimum) the same damage total, forever, for a flat SS cost. This is almost certainly not the intended design (a "reckoning" reads as a one-time payout for banked damage) — it should very likely either (a) zero/halve `damagePreventedTotal` after Reckoning resolves, or (b) be flagged unique/once-per-match. As shipped, ANY sustained pressure into Abjuration mitigation (which the alpha-strike doctrine explicitly recommends doing to break wards for lethal windows, e.g. the R6 Detonate that dumped 13 points into their wall) is banking a debt that can be collected an unlimited number of times once the opponent reaches level 10 and survives to cast it, even if the game should otherwise already be decided.

== SCORECARD ==
- My face damage dealt: R1-R5 ~0 (pure hoard/stalemate). R6: Detonate 5 + Fireball 3 + Hex Bolt 1 = 9. R7: Hex Bolt 1 + Fireball 1 (overflow) + Wrath 2 = 4. R8: Fireball 5 + Lightning Bolt 4 + Hex Bolt 3 = 12. R9: Fireball 0 (Absorbed) + Lightning Bolt 4 + Crackle 1 = 5. R10: Crackle 1 + Hex Bolt 3 = 4. Total face ≈ 34, opponent went 35 → 2 HP.
- Fed to their bank (est. from damagePreventedTotal, back-derived from the two 18-damage Reckoning casts): ~35-36 lifetime prevented damage. Major contributors: R6 Detonate dumped 18 raw into a 13-EHP double-ward (13 banked, only 5 got through); repeated stance rounds (-2 each cast, several casts); Absorb fully prevented one 5-damage Fireball (+5 banked, and healed them 2); Reflective Ward's absorb-and-reflect (banked + 1 self-damage per hit, confirmed R7).
- Their reactions: Absorb (SS) fully prevented a 5-dmg Fireball and healed 2 — a serious tempo/HP swing at a critical moment (R9, opponent at 9→11 instead of dying at 4). Interrupt (SS) cancelled my R10 lethal Lightning Bolt outright by stripping its attached components (not a "damage reduction," see below) at 2 HP, forcing me into the exact 1-HP-vs-2-HP knife's edge that let Reckoning's second cast finish me.
- Their healing: Second Wind +5 (R1-equivalent event not present this game — not used); Absorb's conversion heal +2 (R9). Reckoning itself: 18 + 18 = 36 raw, unpreventable in practice (I had no ward/reaction to answer it).

== VERDICT ON THE EDGE ==
m11's verdict ("EVO favored, and not close") does NOT reproduce and should be considered SUPERSEDED, not just "one data point among several." The pilot-gap doctrine's own warning — bank debt from necessary wall-clearing (Detonate, Crackle, forced stance-round casts) is a ticking liability — turned out to be exactly right, and worse than either game anticipated, because Reckoning isn't a single ticket, it's a subscription. m11 simply ended (R8 kill) before the bot ever reached level 10 to cast it once. This game reached R10-11 because the wall/mitigation the bot builds (which the alpha-strike plan requires punching through) both slows the kill down AND inflates the exact number that Reckoning weaponizes later. The real lesson isn't "refuse to feed the bank" (that's still correct on the margin) — it's "the alpha-strike plan is racing against a clock that gets worse the longer the game goes, and once it reaches R10, EVERY subsequent point of prevented damage is pure danger, and Reckoning does not go away after it fires once." A held-back kill window before R10, or specifically holding Unstoppable-Bolt-style guaranteed damage in reserve to end the game the instant it's live, is now the correct doctrine adjustment — not "kill by R8 or you're probably fine," but "kill before R10 or you are very possibly already dead regardless of the HP bar."

== PRICING / DESIGN FLAGS ==
1. Reckoning [ABJ-032] (SS, L3) — CRITICAL: repeatable every round for the full `damagePreventedTotal`, uncapped, no cooldown, no per-match unique flag, no consumption of the counter. As shipped this is not a balance nuance, it's very likely a rules bug relative to the card's evident design intent (a one-time "reckoning" for banked prevention). Recommend: zero or halve `damagePreventedTotal` on resolve, and/or flag ABJ-032 unique-per-match.
2. Absorb [ABJ-011] (SS, L2) — full prevention of one targeted spell PLUS heal-half-prevented. At the critical moment (opponent at 9, about to take a game-ending Fireball) this alone swung ~7 effective HP (5 damage denied + 2 healed) for a 2-component reaction. Strong, but not obviously broken on its own — it's the Reckoning interaction (this prevented damage ALSO banks toward the next Reckoning) that makes it a double-dip.
3. Interrupt [ABJ-013] (SS, L2) — mechanically "removes all components from target prepared spell," which the engine then resolves as a full CANCEL, not a reduction. This matters against Evocation's "cannot be reduced" text (Lightning Bolt) which it bypasses entirely since component-stripping isn't textually a "reduction." Open question I could not fully resolve in-game: does Unstoppable Bolt's explicit "cannot be cancelled, redirected, or reduced" actually stop Interrupt, or does Interrupt's defund-based mechanism sidestep that check the same way it beat Lightning Bolt's floor? I never got to cast Unstoppable Bolt to test it — recommend a follow-up unit test.
4. Reflective Ward [ABJ-012] (SS) confirmed to reflect 1 damage back to the attacker on absorption (observed twice, R7), on top of the normal Reckoning-bank feed — a real double-tax for attacking it that isn't obvious from wall math alone.
5. Detonate [EVO-021] (VV, L2) remains a strong wall-clearing tool (18 raw off a 9-card hand this game, cleanly killed a 13-EHP double-ward with 5 overflow face) but every point it dumps into a wall is now confirmed to be permanent, uncapped Reckoning fuel — its use is a bigger strategic commitment than m11's writeup treated it as.

== BOT BLINDSPOTS ==
1. Cast Stone Stance and built walls turn after turn against a non-casting opponent, exactly as in m11 — still true, still free EV for the passive side in the early-mid game.
2. Never pressured my life total directly until Reckoning came online — every point of "pressure" before R9 was self-inflicted (Overclock, Battle Trance, and ward-reflect damage from MY OWN attacks), confirming m11's finding that the bot has no proactive offense plan pre-Reckoning.
3. Did use Absorb and Interrupt at genuinely high-value moments this game (unlike m11, where the bot's reactions were nearly worthless) — this looks like better reaction-timing heuristics from the bot at higher levels, or simply correct play against a lethal-range target; worth another data point to distinguish luck from policy.
4. The bot's own Reckoning timing (cast turn 1 of both R10 and R11, immediately after leveling) suggests it prioritizes Reckoning the instant it's available, rather than banking it as a finisher — which, given how strong it turned out to be, hardly matters, but is itself informative about the bot's simulate-and-score horizon around big-number payoffs.

== ENGINE BUGS / QUESTIONS OBSERVED ==
1. Reckoning repeatability (above) — the headline finding, likely a real bug.
2. Ward-overflow cascades through a MULTI-ward stack in order (confirmed via Backdraft 2-dmg into a [1,3] ward pair: destroyed the 1-ward, the 1pt excess rolled into the 3-ward → [2], zero face) rather than overflowing straight to face — reconciles, doesn't contradict, m11's single-ward overflow observation.
3. Crackle's "1 dmg to opponent + 2 to a ward" — BOTH clauses get absorbed by an active ward (confirmed: a 4-ward took the full 3, going to 1, with zero face) — it is not a bank-free tool as m11 speculated; fully retract that open question.
4. hand-cap auto-discard (`sculptValue`, state-ops.ts:390) gives ALL Items/Gambits a flat 1.5 value versus 2-3 for multi-symbol component cards — ties break to the OLDEST card in hand. Lost Dispelling Powder to this early in the game purely because my hand happened to be stacked with VS/VSM/VV dupes and no cheap single-symbol fodder at the wrong moment. Recommend weighting unique-effect cards (Gambits/Items) above fungible components in the discard heuristic, or at minimum breaking discard ties toward the newest card instead of the oldest.
5. Interrupt's mechanism (strip components → spell fails to meet cost → displays as CANCELLED) functionally bypasses "cannot be reduced" protection since it isn't a reduction; whether it also bypasses "cannot be cancelled" is untested (see pricing note 3).
6. Reflective Ward reflects exactly 1 damage to the attacker per hit that connects with its ward (not per-point, a flat tax), confirmed twice.
