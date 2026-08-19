# Playtest m51: Divination (P0) vs Abjuration (P1) — seed 8601 — PILOT vs PILOT
> **P0 thinks:** Open with Omen to start the clock early — cheap, hard to punish at L1, and timing dooms to their turn start is the whole plan.
- P0: prepare Omen [DIV-012]
> **P0 thinks:** Second prep: Insight for card economy while I still have a free slot and no bank pressure to worry about yet.
- P0: prepare Insight [DIV-001]
- P0: done preparing
> **P1 thinks:** Opening: Stone Stance for round-long dmg reduction, hedges vs their first doom.
- P1: prepare Stone Stance [ABJ-005]
> **P1 thinks:** Cheap disposable ward with card-draw upside if it eats chip damage.
- P1: prepare Arcane Shell [ABJ-002]
- P1: done preparing
> **P0 thinks:** Fund Omen fully with the MM resource card to start the doom clock as early as possible.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Cast Omen turn 1 - the earliest possible clock start.
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
> **P0 thinks:** Free gambit, doesn't use my spell-per-turn slot — pure value.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** I have plenty of M already; keep the VM cards flexible in hand.
- P0: choose Material [CMP-M]
> **P0 thinks:** Pre-load Insight's cost now so it's ready to cast instantly on a future turn.
- P0: attach Material [CMP-M] → prepared[1]
- P0: pass (end turn)
> **P1 thinks:** Fund Stone Stance to blunt the Omen doom landing next turn.
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** Cast Stone Stance now — -2 dmg reduction covers the Omen(2) doom firing next turn, fully negating it via stance alone.
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Pre-fund Arcane Shell for next turn (one spell/turn already used).
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** Wrong slot — detach and refund to Arcane Shell instead.
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Attach S to Arcane Shell (prep slot 1) this time.
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** Attach keeps auto-targeting the already-cast slot 0 — detach, hold the card, pass turn.
- P1: detach Somatic [CMP-S]
- P1: pass (end turn)
> **P0 thinks:** Cast Insight for card economy.
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
    → P1's doom arrives — Omen [DIV-012]
> **P1 thinks:** Fund Arcane Shell now that slot0 is resolved so this should route to slot1.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Testing attach targeting again to see if it actually funds slot1 despite log label.
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** Slot0 already holds 1 S (its full cost) — test whether next attach now routes to slot1 instead.
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: detach Somatic/Material [CMP-SM]
> **P1 thinks:** Confirmed engine bug: attach always targets prepared[0] (Stone Stance) even after it's fully cast, blocking funding of prepared[1] (Arcane Shell). Detaching to preserve cards; will retry next round when the prep row may reset.
- P1: detach Somatic [CMP-S]
- P1: pass (end turn)
    round 1 ends — level up
> **P1 thinks:** Keep Stone Stance + Arcane Shell prepped fresh for R2 — Stone Stance fully absorbed the Omen doom last round for free.
- P1: done preparing
> **P0 thinks:** Testing whether a third prep slot opened at level 2; Unravel gives removal + scry value against their Stone Stance line.
- P0: prepare Unravel [DIV-007]
> **P0 thinks:** Foretell adds info + chip damage; testing if a 4th slot exists at L2.
- P0: prepare Foretell [DIV-011]
> **P0 thinks:** Kit: Omen (clock), Insight (draw), Unravel (removal+scry), Foretell (info+chip). Solid L2 spread — holding this.
- P0: done preparing
> **P1 thinks:** Fund Arcane Shell (prepared[1]) directly using the correct slot-indexed slug.
- P1: attach Somatic [CMP-S] → prepared[1]
> **P1 thinks:** Cast Arcane Shell — cheap 1HP ward, upside if it eats chip damage (draw 2).
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
> **P1 thinks:** Pre-fund Stone Stance for next turn — already used my one spell this turn on Arcane Shell.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Their 1-HP Arcane Shell is a trap for any damage spell right now — hitting it banks them 1 and draws them 2 cards for nothing gained. Skip attacking; fund and cast Insight instead to keep building resources while the ward sits inert.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Pre-fund Foretell for next turn.
- P0: attach Material [CMP-M] → prepared[3]
> **P0 thinks:** Pre-fund Omen too, held in reserve until the ward is cleared so it lands clean.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Fund Unravel too — flexible removal ready if needed.
- P0: attach Material [CMP-M] → prepared[2]
- P0: pass (end turn)
> **P1 thinks:** Cast Stone Stance — opponent has 3 of 4 prep slots funded, likely readying another doom for my next turn start.
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Stone Stance is up (-2 damage, applied before ward routing) — my Omen/Unravel/Foretell all deal exactly 2, so casting any of them now would be fully nullified for zero effect. Holding; will swap in Cut the Thread (component discard) next prep to attack their Stance funding directly.
- P0: pass (end turn)
    round 2 ends — level up
> **P0 thinks:** Add Cut the Thread — component discard directly attacks their Stone Stance funding loop.
- P0: prepare Cut the Thread [DIV-008]
> **P1 thinks:** Add Runic Seal — opponent now has 4 prep slots (2 known dooms + 2 unknown), denial to seal one before it fires.
- P1: prepare Runic Seal [ABJ-010]
> **P0 thinks:** Swap Foretell (nullified by their recurring Stone Stance) for Prophecy of Collapse — a destroy effect, not damage, so it should bypass the -2 Stance reduction entirely and can finally clear their bumper ward.
- P0: replace Foretell [DIV-011] with Prophecy of Collapse [DIV-004]
- P1: done preparing
> **P0 thinks:** Kit: Omen (clock), Insight (draw), Unravel (removal+scry), Prophecy of Collapse (zero-credit destroy), Cut the Thread (resource denial vs their Stance funding).
- P0: done preparing
> **P0 thinks:** Fund Prophecy of Collapse.
- P0: attach Material [CMP-M] → prepared[3]
> **P0 thinks:** Prophecy of Collapse: destroy their largest ward, no bank credit. This starts a proper clean-up of their bumper.
- P0: CAST Prophecy of Collapse [DIV-004] (prepared[3])
    P0 casts Prophecy of Collapse [DIV-004]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 0 damage in 2 turns (Prophecy of Collapse [DIV-004])
    → Prophecy of Collapse [DIV-004] resolves
> **P0 thinks:** Pre-fund Cut the Thread for next turn.
- P0: attach Material [CMP-M] → prepared[4]
- P0: pass (end turn)
> **P1 thinks:** Fund Runic Seal to deny an opponent prep slot — they have 2 unknown preps (2 and 4) that could be more dooms.
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
> **P1 thinks:** Cast Runic Seal on one of their unknown preps — denying it this round regardless of what it is.
- P1: CAST Runic Seal [ABJ-010] (prepared[2])
    P1 casts Runic Seal [ABJ-010]
- P1: pass priority
- P0: pass priority
    → Runic Seal [ABJ-010] resolves
> **P1 thinks:** Seal the facedown prep that's already partially funded [M] — most likely to be cast imminently.
- P1: choose FACEDOWN-4
> **P1 thinks:** Pre-fund Stone Stance for next turn.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Fund Insight - Stone Stance not up this round yet, and Prophecy of Collapse will clear the ward for free next turn without touching it myself.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Fund Unravel for flexibility next turn.
- P0: attach Material [CMP-M] → prepared[2]
- P0: pass (end turn)
    → P1's doom arrives — Prophecy of Collapse [DIV-004]
    P1 ward destroyed
> **P1 thinks:** Cast Stone Stance for R3 dmg reduction — my ward is gone (Prophecy of Collapse ate it) so I'm on flesh now.
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Try funding Arcane Shell (S cost) with an SM component.
- P1: attach Somatic/Material [CMP-SM] → prepared[1]
> **P1 thinks:** SM doesn't satisfy the pure-S cost cleanly — detach, hold for a compatible spell.
- P1: detach Somatic/Material [CMP-SM]
- P1: pass (end turn)
> **P0 thinks:** No ward exists to hit and Stone Stance nullifies the damage anyway, but the scry-2 half of Unravel is free value regardless.
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
- P1: pass priority
    → Unravel [DIV-007] resolves
> **P0 thinks:** Scrying Lens is more immediately useful than Sealed Vault right now; put it on top to draw first.
- P0: choose Scrying Lens [ITM-001]
- P0: choose Sealed Vault [GAM-016]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Try SS on Arcane Shell's S cost.
- P1: attach Somatic x2 [CMP-SS] → prepared[1]
> **P1 thinks:** Cast Arcane Shell — cheap fresh ward for the round, upside if destroyed this round.
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
- P1: pass (end turn)
    round 3 ends — level up
> **P1 thinks:** Keep the working triad (Stone Stance / Arcane Shell / Runic Seal) — I'm still at 30hp through R3, denial+stance is holding.
- P1: done preparing
> **P0 thinks:** Kit stands. Key read: my deck's damage is capped at 2/spell, which their recurring Stone Stance (-2) fully nullifies every round they fund it. Plan: keep Prophecy of Collapse recurring for free ward denial, use Cut the Thread to strip their S components when unsealed, bank card advantage with Insight, and wait for a round they skip Stance to land Omen.
- P0: done preparing
> **P1 thinks:** Fund Stone Stance.
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** Cast Stone Stance for R4 blanket reduction.
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Try to fund Runic Seal (SS cost) with SM component.
- P1: attach Somatic/Material [CMP-SM] → prepared[2]
> **P1 thinks:** Second SM to complete Runic Seal SS cost.
- P1: attach Somatic/Material [CMP-SM] → prepared[2]
- P1: detach Somatic/Material [CMP-SM]
- P1: detach Somatic/Material [CMP-SM]
- P1: pass (end turn)
> **P0 thinks:** Fund Prophecy of Collapse — free ward removal that bypasses Stone Stance.
- P0: attach Material [CMP-M] → prepared[3]
- P0: CAST Prophecy of Collapse [DIV-004] (prepared[3])
    P0 casts Prophecy of Collapse [DIV-004]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 0 damage in 2 turns (Prophecy of Collapse [DIV-004])
    → Prophecy of Collapse [DIV-004] resolves
> **P0 thinks:** Item play doesn't use the spell-per-turn slot — free value.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
> **P0 thinks:** Need MM to fund Omen.
- P0: choose Material x2 [CMP-MM]
> **P0 thinks:** Pre-fund Omen for a future round without Stone Stance.
- P0: attach Material x2 [CMP-MM] → prepared[0]
- P0: pass (end turn)
> **P1 thinks:** Fund Arcane Shell with the lone pure S component.
- P1: attach Somatic [CMP-S] → prepared[1]
> **P1 thinks:** Cast a second Arcane Shell — chip absorption/upside; the incoming Prophecy fuse will eat one of them either way.
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
- P1: pass (end turn)
> **P0 thinks:** Recast Omen — the doom resolves 2 turns from now, likely past this round's Stone Stance window (unless they recast it again).
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P0: pass (end turn)
    → P1's doom arrives — Prophecy of Collapse [DIV-004]
    P1 ward destroyed
> **P1 thinks:** Fund Runic Seal — deny another of their preps (they have Insight, Unravel, and unknown[4] active).
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
> **P1 thinks:** Cast Runic Seal, target the unknown prep[4] — never revealed, highest uncertainty/threat.
- P1: CAST Runic Seal [ABJ-010] (prepared[2])
    P1 casts Runic Seal [ABJ-010]
- P1: pass priority
- P0: pass priority
    → Runic Seal [ABJ-010] resolves
> **P1 thinks:** Seal the unknown facedown prep — highest uncertainty.
- P1: choose FACEDOWN-4
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Fund Unravel for the scry-2 value even though Stance nullifies the damage this round.
- P0: attach Material [CMP-M] → prepared[2]
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    → Unravel [DIV-007] resolves
> **P0 thinks:** Correction to my model: the ward got destroyed by Unravel's 2 damage despite Stone Stance being active this round — Stance evidently reduces face damage only (after ward absorption), not damage aimed at wards. Good to know going forward; I don't need to hold damage spells during their Stance turns.
- P0: choose Material x2 [CMP-MM]
- P0: choose Verbal/Somatic/Material [CMP-VSM]
- P0: pass (end turn)
    round 4 ends — level up
> **P0 thinks:** Upgrade Omen to Foreclosure — same MM cost, double the doom damage (4 vs 2).
- P0: replace Omen [DIV-012] with Foreclosure [DIV-020]
> **P0 thinks:** Upgrade Prophecy of Collapse to Unbind — instant ward destroy (no telegraph window) plus a card draw.
- P0: replace Prophecy of Collapse [DIV-004] with Unbind [DIV-019]
> **P0 thinks:** Big upgrade round: Foreclosure (4dmg doom) and Unbind (instant free destroy+draw) replace Omen and Prophecy of Collapse.
- P0: done preparing
> **P1 thinks:** Swap in Counterbind — every Div spell I've seen costs M (Omen, Insight, Unravel, Prophecy of Collapse), so this is a near-universal cast-time cancel for their whole kit.
- P1: prepare Counterbind [ABJ-015]
> **P1 thinks:** Add Phase Shift too — universal spell-cancel reaction, backstop for anything Counterbind can't hit.
- P1: prepare Phase Shift [ABJ-014]
> **P1 thinks:** 5-slot prep cap: Stone Stance / Arcane Shell / Runic Seal / Counterbind / Phase Shift. Two reactions is heavy denial for their M-heavy Div kit.
- P1: done preparing
> **P0 thinks:** Fund Foreclosure.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Foreclosure — 4 damage doom, second clock stacking on top of the arriving Omen doom.
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
> **P1 thinks:** Can't react — Counterbind/Phase Shift unfunded this early in the round. Note to self: pre-fund reactions on my turns to hold them up.
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
- P0: pass (end turn)
    → P1's doom arrives — Omen [DIV-012]
    P1 takes 2 damage
> **P1 thinks:** Fund and cast Stone Stance immediately — Foreclosure(4) lands next turn, need -2 reduction active before then.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Fund Counterbind — perfect SM match. Hold it up as a reaction against their next M-spell.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Fund Insight using a VSM component (covers the M cost).
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
> **P1 thinks:** Hold Counterbind — Insight is just card draw, not worth burning my one denial charge. Save for a bigger threat (Foreclosure/damage spell).
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Free gambit — peek their hand and potentially stall a key S component they need for Stance/Seal.
- P0: PLAY Disarm [GAM-020] (trainer)
    P0 plays Disarm [GAM-020]
> **P0 thinks:** Bounce their most flexible component (VSM) back to deck top.
- P0: choose Verbal/Somatic/Material [CMP-VSM]
    P1's Verbal/Somatic/Material [CMP-VSM] is put on top of their deck
> **P0 thinks:** Fund Cut the Thread — unsealed this round.
- P0: attach Material [CMP-M] → prepared[4]
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 2 damage
> **P1 thinks:** No pure-S resources to fund Phase Shift/Runic Seal/Arcane Shell this turn — hold Counterbind armed.
- P1: pass (end turn)
> **P0 thinks:** Cut the Thread — deny a component resource, targeting their S-type cards if visible to slow future Stance/Seal.
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
> **P1 thinks:** Cut the Thread just discards one card from my hand — not worth Counterbind. Saving for a doom/damage spell.
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
> **P0 thinks:** Discard their most flexible component (VSM).
- P0: choose Verbal/Somatic/Material [CMP-VSM]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Fund Arcane Shell with pure S.
- P1: attach Somatic [CMP-S] → prepared[1]
> **P1 thinks:** Cast Arcane Shell — cheap ward for R5's remaining threats.
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
- P1: pass (end turn)
    round 5 ends — level up
> **P1 thinks:** Keep the same 5: Stone Stance / Arcane Shell / Runic Seal / Counterbind / Phase Shift. 26-30 hp, denial is working.
- P1: done preparing
> **P0 thinks:** Add Counter-Plan — a reaction that can strip a component off their exact-cost spells and cancel them outright.
- P0: prepare Counter-Plan [DIV-024]
> **P0 thinks:** Kit: Foreclosure, Insight, Unravel, Unbind, Cut the Thread, Counter-Plan. Score 30-26 in my favor. Plan: recur Foreclosure for the clock, Unbind their fresh ward instantly for free+draw, hold Counter-Plan for their next exact-cost Stance/Seal.
- P0: done preparing
> **P1 thinks:** Fund Runic Seal to deny one of their unknown preps (2 unknowns now: 3 and 5).
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
> **P1 thinks:** Cast Runic Seal.
- P1: CAST Runic Seal [ABJ-010] (prepared[2])
    P1 casts Runic Seal [ABJ-010]
- P1: pass priority
- P0: pass priority
    → Runic Seal [ABJ-010] resolves
> **P1 thinks:** Seal Foreclosure — the biggest known threat (4 dmg doom) — this round.
- P1: choose Foreclosure [DIV-020]
- P1: pass (end turn)
> **P0 thinks:** Fund Unbind to destroy their ward instantly for free + draw a card.
- P0: attach Material x2 [CMP-MM] → prepared[3]
- P0: CAST Unbind [DIV-019] (prepared[3])
    P0 casts Unbind [DIV-019]
- P0: pass priority
> **P1 thinks:** Odd — Counterbind (armed, SM funded) didn't offer as a reaction vs Unbind (MM cost), even though Unbind clearly requires Material. Possibly an engine cost-matching quirk (exact-M vs contains-M). Losing the cheap ward to this, no big deal.
- P1: pass priority
    P1 ward destroyed
    → Unbind [DIV-019] resolves
> **P0 thinks:** Fund Counter-Plan to arm it as a reaction ready for their next exact-cost spell.
- P0: attach Material x2 [CMP-MM] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Fund and cast Stone Stance for R6 reduction — they have a fully-funded unknown threat ready.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Counter-Plan: strip the S component off Stone Stance — it was funded exactly, so this cancels it outright and denies their damage reduction for the round.
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
> **P1 thinks:** Can't respond — Phase Shift unfunded (no SS in hand). Stone Stance will be stripped of its component and cancelled. Ugly.
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
> **P1 thinks:** Stone Stance cancelled by Counter-Plan — real tempo loss (spell slot burned, no reduction this round). Need to respect their reaction mana going forward.
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] CANCELLED
> **P1 thinks:** Fund Arcane Shell with the returned S — get a ward up since Stone Stance is gone this round.
- P1: attach Somatic [CMP-S] → prepared[1]
> **P1 thinks:** Already used my one cast this turn (Stone Stance, even though cancelled) — leave S attached for next turn's cast.
- P1: pass (end turn)
> **P0 thinks:** Fund Insight for card draw.
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
> **P1 thinks:** Counterbind didn't offer again despite Insight=M cost and Counterbind funded/uncast — inconsistent with the earlier round where it DID show. Possibly a trigger-window quirk worth flagging.
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Free gambit — deny their extra draws for a turn.
- P0: PLAY Mana Sickness [GAM-017] (trainer)
    P0 plays Mana Sickness [GAM-017]
- P0: pass (end turn)
> **P1 thinks:** Cast Arcane Shell now.
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
    slots exhausted — P0 gets one final turn
> **P1 thinks:** Free HP via Gambit — no spell-slot cost, good value at 26/30.
- P1: PLAY Second Wind [GAM-009] (trainer)
    P1 plays Second Wind [GAM-009]
    P1 heals 5
- P1: pass (end turn)
> **P0 thinks:** Fund Unravel to hit their fresh 1-HP ward.
- P0: attach Material [CMP-M] → prepared[2]
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    → Unravel [DIV-007] resolves
> **P0 thinks:** Deck is getting low (5 left) — watch exhaustion risk. Prioritize MM for Foreclosure funding.
- P0: choose Material x2 [CMP-MM]
- P0: choose Saboteur's Kit [GAM-019]
> **P0 thinks:** Sealed Vault — reshuffle my growing discard pile back into the deck to avoid drawing into exhaustion damage as my deck runs low.
- P0: PLAY Sealed Vault [GAM-016] (trainer)
    P0 plays Sealed Vault [GAM-016]
- P0: pass (end turn)
    round 6 ends — level up
> **P0 thinks:** Kit holding. Score roughly even (30 vs 31) but I've cancelled a Stance and cleared several wards for free — good structural position even without much face damage landed yet due to Second Wind heal.
- P0: done preparing
> **P1 thinks:** 31-30, keep the same 5. They reshuffled via Sealed Vault so deck-exhaustion isn't imminent for them either.
- P1: done preparing
> **P0 thinks:** Fund Foreclosure.
- P0: attach Material x2 [CMP-MM] → prepared[0]
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
> **P0 thinks:** Fund Counter-Plan to arm the reaction.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Fund Counterbind, hold it up as a reaction — no pure S in hand to cast a proactive spell this turn.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Free doom stacker, extra 2 dmg clock.
- P0: PLAY Saboteur's Kit [GAM-019] (trainer)
    P0 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
> **P0 thinks:** Fund Insight.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
> **P1 thinks:** Hold Counterbind again — Insight is just card draw. Saving for real damage/removal.
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Pre-fund Unbind for whenever they place a new ward.
- P0: attach Material x2 [CMP-MM] → prepared[3]
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 4 damage
> **P1 thinks:** Try Stone Stance again — even if Counter-Plan snipes it, I'm no worse off than not casting (still take the incoming 2 either way), but if unanswered it covers Saboteur's 2 fully.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Unbind can hit a Ward OR ongoing effect — try targeting their active Stone Stance to strip the reduction for the rest of the round.
- P0: CAST Unbind [DIV-019] (prepared[3])
    P0 casts Unbind [DIV-019]
- P0: pass priority
> **P1 thinks:** Counter Unbind — it can target my active Stone Stance ongoing effect (my only defense against the pending Saboteur doom). Worth spending the reaction here.
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
- P0: pass priority
- P1: pass priority
    → Unbind [DIV-019] CANCELLED
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
    → P1's doom arrives — Saboteur's Kit [GAM-019]
> **P1 thinks:** Fund Phase Shift and hold it up — backstop reaction against their tricks (Counter-Plan is still armed and threatening my casts).
- P1: attach Somatic x2 [CMP-SS] → prepared[4]
- P1: pass (end turn)
    round 7 ends — level up
> **P0 thinks:** Holding kit. 30 vs 27, ahead on HP.
- P0: done preparing
> **P1 thinks:** Keep the 5. 27-30, still close. My deck at 18 cards — need to start managing draws.
- P1: done preparing
> **P1 thinks:** Fund Counterbind, hold as reaction.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Fund Foreclosure.
- P0: attach Material x2 [CMP-MM] → prepared[0]
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
> **P1 thinks:** Cancel Foreclosure — big 4-dmg doom, exactly the kind of threat Counterbind should be saved for.
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
- P0: pass priority
- P1: pass priority
    → Foreclosure [DIV-020] CANCELLED
> **P0 thinks:** Pre-fund Insight for next turn.
- P0: attach Material [CMP-M] → prepared[1]
- P0: pass (end turn)
> **P1 thinks:** Fund and cast Stone Stance for R8.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Arm Counter-Plan.
- P0: attach Material x2 [CMP-MM] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Skip Arcane Study — deck at 15 cards, don't want to accelerate my own deck exhaustion with an extra draw.
- P1: pass (end turn)
> **P0 thinks:** Fund Cut the Thread.
- P0: attach Material [CMP-M] → prepared[4]
> **P0 thinks:** Cut the Thread — target their most flexible remaining component to keep denying Stance/Counterbind funding.
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
- P0: choose Somatic/Material [CMP-SM]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Fund Arcane Shell.
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
> **P0 thinks:** Counter-Plan on Arcane Shell — cancel it outright, denying the ward entirely (no bank feed, no draw-2 trigger for them).
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
- P1: pass priority
- P0: pass priority
    → Arcane Shell [ABJ-002] CANCELLED
- P1: pass (end turn)
    round 8 ends — level up
> **P0 thinks:** Holding kit. 30 vs 27.
- P0: done preparing
> **P1 thinks:** 27-30, keeping the working 5. Reckoning/Final Reckoning aren't in this deck's spellbook — my wincon is grinding + denial, not a bank payoff spell.
- P1: done preparing
> **P0 thinks:** Fund Foreclosure with first M.
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Second M to complete MM.
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Cast Foreclosure again.
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
> **P0 thinks:** Play Scrying Lens item.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
- P0: choose Material x2 [CMP-MM]
> **P0 thinks:** Arm Counter-Plan.
- P0: attach Material x2 [CMP-MM] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Fund and cast Stone Stance — Foreclosure(4) lands next turn.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Cancel Stone Stance again — keeps my incoming Foreclosure at full 4 damage instead of 2.
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
> **P1 thinks:** Countered again by Counter-Plan. Phase Shift unfunded and can't be funded mid-stack. Note: need to pre-fund Phase Shift on turns BEFORE I plan to cast Stone Stance if I want to protect it.
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] CANCELLED
> **P1 thinks:** Fund and cast Arcane Shell as a bumper — wards soak dooms per the rules; even 1HP takes a chunk off Foreclosure(4).
- P1: attach Somatic [CMP-S] → prepared[1]
> **P1 thinks:** Doom fires at my next turn start, before any main-phase cast — nothing I do now changes it. Save resources.
- P1: pass (end turn)
> **P0 thinks:** Fund Insight.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Fund Cut the Thread.
- P0: attach Material [CMP-M] → prepared[4]
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 4 damage
> **P1 thinks:** Cast Arcane Shell for chip absorption going forward.
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
> **P1 thinks:** Fund Runic Seal for denial.
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
> **P1 thinks:** Already cast Arcane Shell this turn — hold Runic Seal funded for next turn.
- P1: pass (end turn)
> **P0 thinks:** Cut the Thread again.
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
- P0: choose Verbal/Somatic/Material [CMP-VSM]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Cast Runic Seal.
- P1: CAST Runic Seal [ABJ-010] (prepared[2])
    P1 casts Runic Seal [ABJ-010]
- P1: pass priority
- P0: pass priority
    → Runic Seal [ABJ-010] resolves
> **P1 thinks:** Seal Unbind — more disruptive than Unravel (targets wards/ongoing effects, could snipe Stone Stance again).
- P1: choose Unbind [DIV-019]
- P1: pass (end turn)
    round 9 ends — level up
> **P0 thinks:** Add Entropy — 7 damage doom, MMM cost. Big upgrade for the endgame clock.
- P0: prepare Entropy [DIV-032]
> **P0 thinks:** Kit now: Foreclosure, Insight, Unravel, Unbind, Cut the Thread, Counter-Plan, Entropy. HP 30 vs 23 — clearly ahead. Entropy (7dmg) is a serious finisher.
- P0: done preparing
> **P1 thinks:** Add Reckoning — my prevention bank wincon, now unlocked at L3.
- P1: prepare Reckoning [ABJ-032]
- P1: done preparing
> **P1 thinks:** Fund and cast Stone Stance for R10.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Fund Entropy part 1 (MM).
- P0: attach Material x2 [CMP-MM] → prepared[6]
> **P0 thinks:** Complete Entropy funding with the third M.
- P0: attach Material [CMP-M] → prepared[6]
> **P0 thinks:** Cast Entropy — 7 damage doom, arrives in 3 turns.
- P0: CAST Entropy [DIV-032] (prepared[6])
    P0 casts Entropy [DIV-032]
- P0: pass priority
> **P1 thinks:** Entropy(7) incoming in 3 turns — big threat. Need Stone Stance active + a ward built up by then.
- P1: pass priority
    prophecy inscribed on P1: 7 damage in 3 turns (Entropy [DIV-032])
    → Entropy [DIV-032] resolves
> **P0 thinks:** Free extra doom stacker.
- P0: PLAY Saboteur's Kit [GAM-019] (trainer)
    P0 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
> **P0 thinks:** Fund Counter-Plan (SM covers part, need MM though - let's check).
- P0: attach Somatic/Material [CMP-SM] → prepared[5]
> **P0 thinks:** Complete Counter-Plan funding.
- P0: attach Material [CMP-M] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Only VS in hand, no matching pure-type resource for my remaining spells. Stone Stance still active this round covers the Saboteur(2) fully.
- P1: pass (end turn)
> **P0 thinks:** Fund Unbind part 1 (S+M covers M).
- P0: attach Somatic/Material [CMP-SM] → prepared[3]
> **P0 thinks:** Complete Unbind funding.
- P0: attach Material [CMP-M] → prepared[3]
> **P0 thinks:** Unbind their ward.
- P0: CAST Unbind [DIV-019] (prepared[3])
    P0 casts Unbind [DIV-019]
- P0: pass priority
> **P1 thinks:** Can't react — Counterbind unfunded. This likely kills either my ward or Stone Stance's ongoing effect.
- P1: pass priority
    P1 ward destroyed
    → Unbind [DIV-019] resolves
- P0: pass (end turn)
    → P1's doom arrives — Saboteur's Kit [GAM-019]
> **P1 thinks:** Free 3HP ward via Gambit — soaks part of the incoming Entropy(7) next turn. No spell-slot cost.
- P1: PLAY Aegis Charm [GAM-011] (trainer)
    P1 plays Aegis Charm [GAM-011]
    P1 ward → 3 HP
- P1: pass (end turn)
> **P0 thinks:** Fund Unravel to shrink their 3HP ward before Entropy hits it — reduces what they bank to the ledger even though the doom will still be absorbed.
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
- P1: pass priority
    → Unravel [DIV-007] resolves
- P0: choose Material x2 [CMP-MM]
- P0: choose Verbal/Material [CMP-VM]
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Free draw gambit.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** I have plenty of VM, keep MM in hand.
- P0: choose Verbal/Material [CMP-VM]
- P0: pass (end turn)
    → P1's doom arrives — Entropy [DIV-032]
    P1 ward destroyed
    P1 takes 4 damage
> **P1 thinks:** Fund and cast Arcane Shell — need a ward up, HP dropping (19/30).
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
> **P0 thinks:** Cancel Arcane Shell, keep them wardless heading toward my Foreclosure doom.
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
- P1: pass priority
- P0: pass priority
    → Arcane Shell [ABJ-002] CANCELLED
- P1: pass (end turn)
    round 10 ends — level up
> **P0 thinks:** 30 vs 19. Strong lead. Keep pressing with Foreclosure/Entropy and Counter-Plan denial.
- P0: done preparing
> **P1 thinks:** 19-30, deck at 7 cards — critical. Need to land Reckoning soon before I run out of resources to fund it. Keep current 6.
- P1: done preparing
> **P0 thinks:** Fund Entropy part 1.
- P0: attach Material x2 [CMP-MM] → prepared[6]
> **P0 thinks:** Complete Entropy funding with VM.
- P0: attach Verbal/Material [CMP-VM] → prepared[6]
> **P0 thinks:** Cast Entropy again — no wards, keep pressure on.
- P0: CAST Entropy [DIV-032] (prepared[6])
    P0 casts Entropy [DIV-032]
- P0: pass priority
> **P1 thinks:** Another Entropy(7) — dangerous at 19 HP. Need Stone Stance + a solid ward before it lands in 3 turns.
- P1: pass priority
    prophecy inscribed on P1: 7 damage in 3 turns (Entropy [DIV-032])
    → Entropy [DIV-032] resolves
> **P0 thinks:** Fund Counter-Plan part 1.
- P0: attach Verbal/Material [CMP-VM] → prepared[5]
> **P0 thinks:** Complete Counter-Plan funding.
- P0: attach Verbal/Material [CMP-VM] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Fund and cast Stone Stance — Entropy(7) lands in 2 turns.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
> **P0 thinks:** Cancel Stance to keep my incoming Entropy at full damage.
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
> **P1 thinks:** Countered again. Their hand is down to 2 cards though — this may be their last Counter-Plan copy for a while.
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] CANCELLED
> **P1 thinks:** Already used my one cast this turn. Hold resources.
- P1: pass (end turn)
> **P0 thinks:** Fund Cut the Thread.
- P0: attach Material [CMP-M] → prepared[4]
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
> **P0 thinks:** Strip a lone S component to hurt Stance/Seal/Shell funding options.
- P0: choose Somatic [CMP-S]
- P0: pass (end turn)
> **P1 thinks:** Fund Counterbind, hold as reaction against their next M spell.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Fund Insight.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
> **P1 thinks:** Hold Counterbind — save for a real threat, not just card draw.
- P1: pass priority
    → Insight [DIV-001] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Free info + mild denial.
- P0: PLAY Disarm [GAM-020] (trainer)
    P0 plays Disarm [GAM-020]
> **P0 thinks:** Bounce one of their components.
- P0: choose Verbal/Somatic [CMP-VS]
    P1's Verbal/Somatic [CMP-VS] is put on top of their deck
- P0: pass (end turn)
    → P1's doom arrives — Entropy [DIV-032]
    P1 takes 7 damage
> **P1 thinks:** Critical HP (12/30) — need to find defensive resources. Draw 2, filter 1 back.
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
> **P1 thinks:** Put back the useless Quenching Salts (no burn markers to remove).
- P1: choose Quenching Salts [GAM-013]
> **P1 thinks:** Fund Reckoning with the SS I just drew — time to cash in the prevention bank.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
> **P1 thinks:** Cast Reckoning — cash the prevention bank into face damage.
- P1: CAST Reckoning [ABJ-032] (prepared[5])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 6 damage
    → Reckoning [ABJ-032] resolves
- P1: pass (end turn)
    round 11 ends — level up
> **P0 thinks:** 24 vs 12. Push for the kill with Entropy/Foreclosure.
- P0: done preparing
> **P1 thinks:** 12-24, deck at 4 cards. Reckoning is non-consuming — I can spam it every round for repeated bank cash-ins. Priority: survive + keep firing Reckoning.
- P1: done preparing
> **P1 thinks:** Fund Counterbind, hold as reaction.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Fund Foreclosure.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Cast Foreclosure to press the lead.
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
> **P1 thinks:** Cancel Foreclosure — critical at 12 HP, can't afford to take 4.
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
- P0: pass priority
- P1: pass priority
    → Foreclosure [DIV-020] CANCELLED
> **P0 thinks:** Free denial.
- P0: PLAY Mana Sickness [GAM-017] (trainer)
    P0 plays Mana Sickness [GAM-017]
- P0: pass (end turn)
> **P1 thinks:** Deck at 2 cards — exhaustion imminent. No useful funding with only VS in hand.
- P1: pass (end turn)
> **P0 thinks:** Fund Entropy part 1.
- P0: attach Verbal/Material [CMP-VM] → prepared[6]
> **P0 thinks:** Fund Entropy part 2.
- P0: attach Verbal/Material [CMP-VM] → prepared[6]
> **P0 thinks:** Detach to retry funding differently — testing whether VSM plus VM stacks properly.
- P0: detach Verbal/Material [CMP-VM]
> **P0 thinks:** Fund Entropy part 2 with VSM.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[6]
> **P0 thinks:** Redirect last VM to fund Insight since Entropy can't complete this turn.
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Not enough slots for Entropy this turn but fund something else - can't attach to slot 6 apparently. Let's fund Foreclosure instead since it's still in prep uncast.
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Redirect - Foreclosure already used this round.
- P0: detach Material [CMP-M]
> **P0 thinks:** Fund Unravel for next turn.
- P0: attach Material [CMP-M] → prepared[2]
> **P0 thinks:** Fund Cut the Thread too.
- P0: attach Material [CMP-M] → prepared[4]
- P0: pass (end turn)
> **P1 thinks:** Fund and cast Stone Stance for R12 protection.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Cast Cut the Thread instead of Unravel — my resource deck is empty, avoid triggering my own reshuffle/exhaustion damage from Unravel's scry.
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
- P0: choose Verbal/Somatic [CMP-VS]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Fund Reckoning again for another bank cash-in.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
> **P1 thinks:** Cast Reckoning again — repeatable bank cash.
- P1: CAST Reckoning [ABJ-032] (prepared[5])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 6 damage
    → Reckoning [ABJ-032] resolves
- P1: pass (end turn)
    round 12 ends — level up
> **P1 thinks:** 12-18, much closer now thanks to repeated Reckoning. Both decks at 0 — reshuffle-burn incoming for both sides.
- P1: done preparing
> **P0 thinks:** 18 vs 12. 4 spell slots now. Push for the kill.
- P0: done preparing
    P0 reshuffles discard into deck (#1) — exhaustion 2
    P0 takes 2 damage
> **P0 thinks:** Fund Foreclosure part 1.
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Complete Foreclosure funding.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
> **P0 thinks:** Cast Foreclosure — pressing for the kill, their HP is 12.
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
> **P1 thinks:** Can't react — no components. Their reshuffle cost them 2 HP though (16 now). Foreclosure(4) incoming, will hurt badly at 12 HP.
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
- P0: pass (end turn)
    P1 reshuffles discard into deck (#1) — exhaustion 2
    P1 takes 2 damage
> **P1 thinks:** CRITICAL — 10 HP, Foreclosure(4) lands next turn. Must fund Stone Stance.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
- P1: pass (end turn)
> **P0 thinks:** Free draw item.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
- P0: choose Material [CMP-M]
> **P0 thinks:** Fund Insight.
- P0: attach Material [CMP-M] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Fund Counter-Plan part 1.
- P0: attach Material [CMP-M] → prepared[5]
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 2 damage
> **P1 thinks:** HP critical (8). Fund Counterbind, hold as emergency reaction.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Deny extra draws.
- P0: PLAY Mana Sickness [GAM-017] (trainer)
    P0 plays Mana Sickness [GAM-017]
- P0: pass (end turn)
> **P1 thinks:** No SS in hand to refund Reckoning. Hold.
- P1: pass (end turn)
> **P0 thinks:** Fund Unravel (overpay with MM) for 2 direct damage since no ward exists.
- P0: attach Material x2 [CMP-MM] → prepared[2]
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
> **P1 thinks:** No ward to hit, harmless. Hold Counterbind.
- P1: pass priority
    → Unravel [DIV-007] resolves
> **P0 thinks:** Want MM to finish Entropy next turn.
- P0: choose Material x2 [CMP-MM]
- P0: choose Material [CMP-M]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Fund Entropy part 1.
- P0: attach Material x2 [CMP-MM] → prepared[6]
- P0: pass (end turn)
> **P1 thinks:** Fund Reckoning again — bank should be even bigger now (Stone Stance R13 block counted too).
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
- P1: CAST Reckoning [ABJ-032] (prepared[5])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 7 damage
    → Reckoning [ABJ-032] resolves
> **P1 thinks:** 8-9 now! Extremely close. Watch for their Entropy(MMM) prep — if it lands unmitigated at 8HP that's lethal.
- P1: pass (end turn)
> **P0 thinks:** Complete Entropy funding — 7 damage would be lethal on their 8 HP.
- P0: attach Material [CMP-M] → prepared[6]
> **P0 thinks:** Cast Entropy — 7 damage in 3 turns should be lethal or near-lethal on their 8 HP. Race is on.
- P0: CAST Entropy [DIV-032] (prepared[6])
    P0 casts Entropy [DIV-032]
- P0: pass priority
> **P1 thinks:** MUST cancel — Entropy(7) is potentially lethal at 8 HP.
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
- P0: pass priority
- P1: pass priority
    → Entropy [DIV-032] CANCELLED
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Fund Runic Seal — deny a threat while I'm at 8 HP.
- P1: attach Somatic x2 [CMP-SS] → prepared[2]
- P1: CAST Runic Seal [ABJ-010] (prepared[2])
    P1 casts Runic Seal [ABJ-010]
- P1: pass priority
- P0: pass priority
    → Runic Seal [ABJ-010] resolves
> **P1 thinks:** Seal Counter-Plan — frees up my casts this round.
- P1: choose Counter-Plan [DIV-024]
- P1: pass (end turn)
    round 13 ends — level up
> **P1 thinks:** Add Fortress — at 8 HP I need a real ward that can't be stripped by their removal (Unbind/Unravel) this critical round.
- P1: prepare Fortress [ABJ-029]
> **P0 thinks:** 9 vs 8 — razor thin. Priority: fund Counter-Plan early to be ready to cancel any Reckoning recast (SS cost, strippable), then push Foreclosure/Entropy for the kill.
- P0: done preparing
- P1: done preparing
> **P1 thinks:** Cast Stone Stance urgently — 8 HP, need every reduction available.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Fund Counterbind, hold as reaction.
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Fund Insight.
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: CAST Insight [DIV-001] (prepared[1])
    P0 casts Insight [DIV-001]
- P0: pass priority
- P1: pass priority
    → Insight [DIV-001] resolves
> **P0 thinks:** Free extra doom - stacks pressure.
- P0: PLAY Saboteur's Kit [GAM-019] (trainer)
    P0 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
> **P0 thinks:** Fund Counter-Plan for defense against a possible Reckoning recast next round.
- P0: attach Material x2 [CMP-MM] → prepared[5]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Fund Cut the Thread.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
> **P0 thinks:** Strip an SM — versatile card feeding several of their key spells.
- P0: choose Somatic/Material [CMP-SM]
- P0: pass (end turn)
    → P1's doom arrives — Saboteur's Kit [GAM-019]
- P1: pass (end turn)
> **P0 thinks:** Fund Foreclosure part 1.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
- P0: pass (end turn)
> **P1 thinks:** Fund Arcane Shell — they're funding Foreclosure again, need a ward up.
- P1: attach Somatic [CMP-S] → prepared[1]
- P1: CAST Arcane Shell [ABJ-002] (prepared[1])
    P1 casts Arcane Shell [ABJ-002]
- P1: pass priority
> **P0 thinks:** Hold Counter-Plan for a potential Reckoning recast — that's the real threat to my 9 HP, not another 1-HP ward.
- P0: pass priority
    P1 ward → 1 HP
    → Arcane Shell [ABJ-002] resolves
> **P1 thinks:** Play Bulwark Shard — free +2 HP to my ward, no spell-slot cost.
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 3 HP
> **P1 thinks:** Second Bulwark Shard — another free +2 HP to my ward.
- P1: PLAY Bulwark Shard [ITM-008] (trainer)
    P1 plays Bulwark Shard [ITM-008]
    P1 ward → 5 HP
- P1: pass (end turn)
> **P0 thinks:** Draw for resources to fund Unbind against their 5HP ward.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Keep the components, bank the gambit.
- P0: choose Sealed Vault [GAM-016]
> **P0 thinks:** Complete Foreclosure funding.
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Redirect to Unbind instead — casting Foreclosure now would just feed their 5HP ward for zero face damage. Destroy the ward first.
- P0: attach Material x2 [CMP-MM] → prepared[3]
> **P0 thinks:** Unbind their 5HP ward — free destroy + draw, denies their bank credit and clears the path for future dooms.
- P0: CAST Unbind [DIV-019] (prepared[3])
    P0 casts Unbind [DIV-019]
- P0: pass priority
> **P1 thinks:** Cancel Unbind — protect my 5HP ward or Stone Stance, either way this is critical infrastructure at 8 HP.
- P1: REACT with Counterbind [ABJ-015] (prepared[3])
    P1 reacts with Counterbind [ABJ-015]
- P0: pass priority
- P1: pass priority
    → Counterbind [ABJ-015] resolves
- P0: pass priority
- P1: pass priority
    → Unbind [DIV-019] CANCELLED
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Free reshuffle for deck health.
- P0: PLAY Sealed Vault [GAM-016] (trainer)
    P0 plays Sealed Vault [GAM-016]
> **P0 thinks:** Not casting Foreclosure into their 5HP ward — would fully absorb for zero face damage and bank them 4. Waiting for removal.
- P0: pass (end turn)
> **P1 thinks:** Fund Reckoning again — cash more of the bank.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
> **P1 thinks:** Cast Reckoning — risk of Counter-Plan interception but no real downside since Reckoning doesn't consume the bank.
- P1: CAST Reckoning [ABJ-032] (prepared[5])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
> **P0 thinks:** CRITICAL: Counter-Plan on Reckoning — strip one S, it needs exactly SS to meet cost, this should cancel it outright and save my life at 9 HP.
- P0: REACT with Counter-Plan [DIV-024] (prepared[5])
    P0 reacts with Counter-Plan [DIV-024]
> **P1 thinks:** Reckoning countered. Fine — it's non-consuming, will try again next round.
- P1: pass priority
- P0: pass priority
    → Counter-Plan [DIV-024] resolves
- P1: pass priority
- P0: pass priority
    → Reckoning [ABJ-032] CANCELLED
- P1: pass (end turn)
> **P0 thinks:** Fund Unravel to chip the 5HP ward.
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
> **P0 thinks:** Chip the ward.
- P0: CAST Unravel [DIV-007] (prepared[2])
    P0 casts Unravel [DIV-007]
- P0: pass priority
- P1: pass priority
    → Unravel [DIV-007] resolves
- P0: choose Material x2 [CMP-MM]
- P0: choose Material [CMP-M]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Fund Reckoning — their Counter-Plan is spent and hand is empty, should resolve clean this time.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
> **P1 thinks:** Reckoning already shows cast-flag from the earlier cancelled attempt this round — can't recast until next round. Detach, hold cards.
- P1: detach Somatic x2 [CMP-SS]
- P1: pass (end turn)
    round 14 ends — level up
> **P1 thinks:** Final Reckoning unlocked — 4 dmg per round elapsed, uncapped. 14+ rounds = 56+ damage, game-ending if I can fund it.
- P1: prepare Final Reckoning [ABJ-043]
> **P0 thinks:** Add Oblivion — 9 damage doom, would be lethal on their 8 HP if it lands clean.
- P0: prepare Oblivion [DIV-043]
- P1: done preparing
> **P0 thinks:** Kit now includes Oblivion (9dmg doom) — potential kill card. 9 vs 8, ward at 3.
- P0: done preparing
> **P0 thinks:** Fund Unbind to destroy their 3HP ward for free — clears the path for Oblivion/Entropy.
- P0: attach Material x2 [CMP-MM] → prepared[3]
- P0: CAST Unbind [DIV-019] (prepared[3])
    P0 casts Unbind [DIV-019]
- P0: pass priority
- P1: pass priority
    P1 ward destroyed
    → Unbind [DIV-019] resolves
> **P0 thinks:** Fund Counter-Plan part 1 for defense.
- P0: attach Material [CMP-M] → prepared[5]
- P0: pass (end turn)
> **P1 thinks:** Cast Stone Stance for R15.
- P1: attach Somatic [CMP-S] → prepared[0]
- P1: CAST Stone Stance [ABJ-005] (prepared[0])
    P1 casts Stone Stance [ABJ-005]
- P1: pass priority
- P0: pass priority
    → Stone Stance [ABJ-005] resolves
> **P1 thinks:** Fund Counterbind... wait fund Reckoning with SS, hold for a future turn since I already cast this turn.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
- P1: pass (end turn)
> **P0 thinks:** Fund Foreclosure.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Cast Foreclosure — path is clear, their HP 8.
- P0: CAST Foreclosure [DIV-020] (prepared[0])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
- P0: pass (end turn)
> **P1 thinks:** Cast Reckoning — opponent at 9 HP, this could be lethal or close to it.
- P1: CAST Reckoning [ABJ-032] (prepared[5])
    P1 casts Reckoning [ABJ-032]
- P1: pass priority
- P0: pass priority
    P0 takes 8 damage
    → Reckoning [ABJ-032] resolves
> **P1 thinks:** Opponent at 1 HP! Already used my one cast this turn. Need to survive their turn then finish next turn.
- P1: pass (end turn)
> **P0 thinks:** Complete Counter-Plan funding — critical defense at 1 HP.
- P0: attach Verbal/Material [CMP-VM] → prepared[5]
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 2 damage
> **P1 thinks:** Assemble Final Reckoning to finish the game — opponent at 1 HP.
- P1: attach Somatic [CMP-S] → prepared[7]
> **P1 thinks:** Second S.
- P1: attach Somatic [CMP-S] → prepared[7]
> **P1 thinks:** Detach one S, try SM first instead to see if ordering matters.
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Add SM (fills remaining S+M) before adding the last S.
- P1: attach Somatic/Material [CMP-SM] → prepared[7]
> **P1 thinks:** Final S — should complete SSSM.
- P1: attach Somatic [CMP-S] → prepared[6]
> **P1 thinks:** Wrong slot again — detach from Fortress, need a way to target slot7 specifically.
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Try index 6 again — last time it targeted Fortress; hoping it fills a different pip now that Fortress already has 0.
- P1: attach Somatic [CMP-S] → prepared[6]
> **P1 thinks:** Out of pure S in hand — can't complete Final Reckoning this turn. Detach and hold for next turn.
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Can't complete Final Reckoning this turn (auto-routing keeps sending S to Fortress). Opponent at 1 HP — any chip damage next turn wins. Need to survive.
- P1: pass (end turn)
> **P0 thinks:** Fund Entropy part 1 — their HP is 6, this would be lethal if it lands clean.
- P0: attach Material x2 [CMP-MM] → prepared[6]
- P0: pass (end turn)
> **P1 thinks:** Fund Fortress (1st S) to clear the auto-routing block for Final Reckoning.
- P1: attach Somatic [CMP-S] → prepared[0]
> **P1 thinks:** My error — used wrong slot index. Detach and retarget slot6 (Fortress) directly.
- P1: detach Somatic [CMP-S]
> **P1 thinks:** Fund Fortress toward completion instead — need pure M for Final Reckoning anyway, don't have any.
- P1: attach Somatic [CMP-S] → prepared[6]
> **P1 thinks:** Second S toward Fortress.
- P1: attach Somatic [CMP-S] → prepared[6]
> **P1 thinks:** Out of S, holding at Fortress 2/3 and Final Reckoning [S,SM]. Need one more S each next turn.
- P1: pass (end turn)
> **P0 thinks:** Complete Entropy funding — 7 damage, their HP is 6, this is lethal if unblocked.
- P0: attach Material [CMP-M] → prepared[6]
> **P0 thinks:** Cast Entropy - going for the kill.
- P0: CAST Entropy [DIV-032] (prepared[6])
    P0 casts Entropy [DIV-032]
- P0: pass priority
> **P1 thinks:** Entropy(7) — lethal at 6 HP if unmitigated. 3 turns out, likely crosses into next round. Need Stone Stance + wards ready by then.
- P1: pass priority
    prophecy inscribed on P1: 7 damage in 3 turns (Entropy [DIV-032])
    → Entropy [DIV-032] resolves
- P0: pass (end turn)
> **P1 thinks:** Try SS component — hoping it routes to Fortress's remaining S need.
- P1: attach Somatic x2 [CMP-SS] → prepared[5]
- P1: detach Somatic x2 [CMP-SS]
> **P1 thinks:** SS component won't fit slots needing exactly 1 more S (overfill rejected). Need a plain single-S card. Passing.
- P1: pass (end turn)
> **P0 thinks:** Fund Cut the Thread.
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
- P0: CAST Cut the Thread [DIV-008] (prepared[4])
    P0 casts Cut the Thread [DIV-008]
- P0: pass priority
- P1: pass priority
    → Cut the Thread [DIV-008] resolves
> **P0 thinks:** Strip the SS — directly denies a future Reckoning/Runic Seal casting.
- P0: choose Somatic x2 [CMP-SS]
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
> **P1 thinks:** Stone Stance still active (-2), so Entropy(7)->5 net, I have 6 HP, should survive at 1 HP. No useful funding available with current hand.
- P1: pass (end turn)
    round 15 ends — level up
> **P0 thinks:** 1 vs 6. Entropy doom about to fire — could be lethal for them.
- P0: done preparing
> **P1 thinks:** CRITICAL: Stone Stance expired with round end, Entropy(7) doom still pending at 1 turn — I'm at 6 HP, this may be lethal and unavoidable. Nothing I can do in prep phase.
- P1: done preparing
    → P1's doom arrives — Entropy [DIV-032]
    P1 takes 7 damage
    GAME OVER — P0 wins (hp)

**Result:** P0 wins (hp), round 16.

## Analysis

First PILOT-vs-PILOT match (exp-8d infrastructure): two separately-sighted
pilots, seat-scoped redacted views, private notes, no autoplay. Both seat
reports below, verbatim, as filed to the orchestrator.

### Seat 0 — Divination pilot

Result: P0 (Divination) WINS on HP, round 16. Final HP: me 1, them -1.
Razor-thin — a genuine nail-biter, not a stomp.

Trajectory: built a comfortable lead through R1-R11 (30 vs 8-12 swing) via
zero-credit ward denial (Prophecy of Collapse / Unbind) and Counter-Plan
cancelling Stone Stance / Arcane Shell / Runic Seal on tight SS/S funding.
Then Reckoning hit for 6, 6, then 8 across R11-R15, dropping me from 24 to
1 HP while their HP kept falling to my Foreclosure/Entropy dooms. The final
turns were a pure race; Entropy (7, cast at their 6 HP) landed on the exact
turn needed.

Decisive exchanges:
1. Counter-Plan discovery (R6): it strips a component off a CAST spell and
   cancels it if the cost is no longer met — which answers their exact-cost
   spells: Stone Stance (S), Arcane Shell (S), and critically RECKONING (SS).
   Two cancels on Stone Stance, two on Arcane Shell, and the game-winning one
   on a likely-lethal Reckoning at R14 T94. A second Reckoning I could not
   answer hit for 8 → 1 HP at R15.
2. Ward-shatter overflow correction (R4/R10/R13): doom overflow past a DYING
   ward carries to face/next ward as normal damage (the brief's "remainder
   evaporates" describes only a SURVIVING ward's HP when it shatters).
   Shrinking a ward below the doom's amount with Unravel before the doom
   lands is correct play, not waste.
3. Endgame race (R13-R16): Reckoning's non-resetting lifetime bank made it a
   real clock even as I choked off NEW prevention; the final Entropy was
   funded across two turns at 1 HP through multiple final-turn windows.

Playbook verdict: bank-starving via zero-credit removal and Counter-Plan
denial SURVIVED contact — that is the real matchup lever, not a bot blind
spot. The doom-size ladder mattered enormously (bare Omen is eaten by Stone
Stance). DIED on contact: the shatter-overflow misread; a skilled opponent
building an oversized ward (Aegis Charm pump to 5 HP) to eat a doom wholly
is a sharp tactic no bot ever tried. NEAR-FATAL GAP: Reckoning's uncapped
scaling — whoever keeps their SS-cancel armed on the opponent's Reckoning
turn wins the race.

Equal-skill texture verdict: a real duel. The bot ladder and even the
pilot-vs-bot sweeps UNDERSOLD Abjuration's ceiling — 1 HP from losing this.

Engine notes: multi-symbol attach refusals at R12/R13 cost tempo (reads as
the 2-card attach cap; UX hint wanted). Deck-exhaustion reshuffle damage
(2/4/6) fired on both sides at R13 and materially shaped the race.

### Seat 1 — Abjuration pilot

RESULT: P0 (Divination) wins on HP. Final: P0 1 HP, P1 -1 HP, round 16.
Excruciatingly close — one turn from a kill with Final Reckoning 3/4
assembled when Entropy's doom crossed the round boundary and fired at my
R16 turn start with Stone Stance freshly expired, killing me at 6 HP.

Score trajectory: 30-30 through R2 → 12-24 by R11 (their doom pressure
outpaced denial) → Reckoning casts (6/7/8, R11/R13/R15, two more attempts
intercepted by Counter-Plan) swung it to even → 1-vs-low by R15.

Bank trajectory: Stone Stance blocks + ward absorption fed the bank
continuously; Reckoning was the single biggest swing factor, dragging an
11-HP deficit back to even. Non-consuming and repeatable is the whole
identity — it converts every blocked doom into permanent cashable damage
even under bank starvation.

Decisive exchanges: their Counter-Plan repeatedly sniped Stone Stance
mid-cast (R6/R9) — real tech the bot games never showed; mutual deck
exhaustion at R12-13 (both decks hit 0 nearly simultaneously); Counterbind
cancelled Foreclosure twice and Entropy once at exactly the lethal
thresholds; at R15 Reckoning-for-8 put them at 1 HP but the SSSM Final
Reckoning could not be completed in time (no pure-S cards left) and the
round ended into the unmitigated Entropy.

Playbook verdict: stance-first check held (2-damage dooms blanked all
game); denial worked but Counter-Plan is a counter-counter aimed at the
engine itself — new information; Reckoning-as-wincon is the standout
finding; Final Reckoning is a genuine finisher whose SSSM cost is brutal
to assemble under deck pressure.

Equal-skill texture verdict: a real duel — reactions held for exactly the
right moments on both sides; qualitatively different from bot play.
Genuinely 50/50 at the death.

Engine notes: attach slugs carry the target slot index (early confusion was
pilot error); already-cast spells remain legal attach targets and silently
waste resources (re-confirmed, triage); compound-card attach refusals near
full slots (the 2-card cap, UX hint wanted); a doom timed to land exactly
at a round transition strips the expiring Stone Stance with no grace —
working as intended per "checkmate-shaped" doctrine, but a very sharp edge
worth a design look.

### Orchestrator synthesis

The first equal-skill data point lands the matchup at the exact texture the
exp-8 redesign was chasing: Div won by 2 total HP across 16 rounds, both
wincons live to the final turn, and the decisive skills were reaction
economics (Counter-Plan vs Reckoning; Counterbind vs the doom ladder), ward
sizing under shatter, and round-boundary doom geometry. Div > Abj intent:
directionally supported at equal skill, magnitude near-coinflip (n=1).
Orchestration note: the two pilots' 60-poll safety valves collided once
mid-game (each abandoned while the other deliberated) — resumed via
SendMessage with a 150-poll ceiling; m52+ briefs carry the higher ceiling
and the corrected two-case shatter wording from birth.
