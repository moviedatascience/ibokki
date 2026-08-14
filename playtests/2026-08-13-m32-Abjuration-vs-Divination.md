# Playtest m32: Abjuration (P0) vs Divination (P1) — seed 7202 — bot greedy — LEDGER-FAMILY calibration
- P1: prepare Divine [DIV-003]
- P1: prepare Foretell [DIV-011]
- P1: prepare Omen [DIV-012]
- P1: prepare Premonition [DIV-005]
- P1: replace Divine [DIV-003] with Cut the Thread [DIV-008]
- P1: done preparing
> **P0 thinks:** Prep Runic Seal for the doom-slot lock per doctrine (control tool for whatever doom threat Divination reveals). Round 1, no Sealed Verdict/Restoring Rune available yet (L2 gated).
- P0: prepare Runic Seal [ABJ-010]
> **P0 thinks:** Prep Grounding — cheap reaction prevent+draw to start charging the Reckoning-family bank early (prevented-damage ledger needs volume before Verdict/Tithe/Rune are worth casting).
- P0: prepare Grounding [ABJ-008]
- P0: done preparing
- P1: attach Material [CMP-M] → prepared[3]
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
- P0: pass priority
    → Premonition [DIV-005] resolves
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: attach Verbal/Material [CMP-VM] → prepared[1]
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
- P1: pass (end turn)
> **P0 thinks:** Load Runic Seal (needs SS) with first CMP-S. Holding CMP-SM in reserve rather than overpaying to load Grounding (needs only S) — Grounding gets a plain S component next. Not casting Runic Seal yet: opp's 3 prep slots are still hidden, want to identify the real doom threat before committing the seal (doctrine: seal the doom slot, not blind).
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Second CMP-S completes Runic Seal (SS) — held ready to seal whichever opp prep slot becomes the real threat once it reveals more.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Holding cast on loaded Runic Seal — none of opp's 3 hidden prep slots show a 'c' castable flag yet, so no confirmed threat to seal. Passing to see next reveal before committing the seal to a slot.
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Saboteur's Kit [GAM-019]
    P0 takes 2 damage
> **P0 thinks:** Load Grounding (S) with the fresh CMP-S so it's armed as a free reaction — starts charging the prevented-damage bank on their next spell.
- P0: attach Somatic [CMP-S] → prepared[1]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Still no castable ('c') flag on any opp prep slot — no confirmed target for Runic Seal yet. Holding, no cost to waiting since the seal doesn't decay.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Casting Runic Seal now rather than holding indefinitely — opp's prep slots (0/1/2) still show no castable flag after 5 straight turns of passing, likely component-starved rather than deterred by our seal; hand is filling toward the discard cap with unusable extra components, so better to get value now. Targeting the most component-invested slot (2: VM+VSM = heaviest build) as best guess for the real threat.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal opp prep slot 2 (VM+VSM attached — heaviest investment of the three hidden slots, best guess for the real threat this round).
- P0: choose FACEDOWN-2
> **P0 thinks:** Holding Second Wind — at 28/30 HP, healing 5 would waste 3; saving it for after a real doom hit.
- P0: pass (end turn)
- P1: pass (end turn)
- P0 auto: attach Somatic/Material [CMP-SM] → prepared[0]
- P0 auto: attach Somatic/Material [CMP-SM] → prepared[0]
- P0 auto: attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
- P0 auto: PLAY Second Wind [GAM-009] (trainer)
    P0 plays Second Wind [GAM-009]
    P0 heals 5
- P0 auto: pass (end turn)
- P1: pass (end turn)
- P0 auto: pass (end turn)
    round 1 ends — level up
> **P0 thinks:** Prep Stone Stance for R2 — confirmed via engine read (state-ops.ts dealDamageToPlayer) that reduction effects DO add to damagePreventedTotal, same ledger the new cards spend from. This is a real income lever vs Divination's cast spells (not their pierce-doom gambits, which route around wards/reduction entirely per the pilot-gap doctrine). Also confirmed L2 ledger cards (Verdict/Rune) need player-tier maxSpellLevel>=2, which per levels.ts LEVEL_TABLE doesn't happen until level 5 — they will NOT be preppable this round despite us being 'lv2'. Filling remaining prep slots with income generators instead of the L1 Tithe, which is still worthless at bank=0.
- P0: prepare Stone Stance [ABJ-005]
> **P0 thinks:** Prep Echo Shield too — free reaction (no cast-slot cost), prevents 1-2 more per opponent spell to keep the bank charging.
- P0: prepare Echo Shield [ABJ-007]
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Load Runic Seal (SS) with one CMP-SS card — covers the full cost in a single attach.
- P0: attach Somatic x2 [CMP-SS] → prepared[0]
> **P0 thinks:** Load Grounding (S).
- P0: attach Somatic [CMP-S] → prepared[1]
> **P0 thinks:** Load Stone Stance (S) with CMP-SM, wasting the M half — no better use for it right now.
- P0: attach Somatic/Material [CMP-SM] → prepared[2]
> **P0 thinks:** Load Echo Shield (S) with the remaining CMP-SS. All 4 preps armed.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Cast Stone Stance now (round-long -2 spell damage reduction) — earlier cast = more of the round covered, and per the engine read, this reduction feeds damagePreventedTotal on every spell hit for the rest of the round. Holding Runic Seal's cast for when a real threat reveals, as in R1.
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Play Arcane Study for card flow — hand is thin (just Bulwark Shard, dead without a ward) and we want more components for next round's Tithe/future preps.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Return one Bulwark Shard to deck top — it's dead without a Ward and we have two; keep the Somatic component and the other copy.
- P0: choose Bulwark Shard [ITM-008]
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Somatic/Material [CMP-SM] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[1])
    P1 casts Foretell [DIV-011]
- P1: pass priority
> **P0 thinks:** React with Grounding on Foretell's 2 dmg — same 1-prevent as Echo Shield right now (no ward up), but Grounding also draws a card. First bank charge of the game: prevents 1, banks 1 (Stone Stance will reduce the rest by another 2 on resolve).
- P0: REACT with Grounding [ABJ-008] (prepared[1])
    P0 reacts with Grounding [ABJ-008]
- P1: pass priority
- P0: pass priority
    → Grounding [ABJ-008] resolves
- P1: pass priority
> **P0 thinks:** Holding Echo Shield — Foretell's remaining 1 dmg (after Grounding's prevent) should already be fully absorbed by Stone Stance's -2 reduction; saving the reaction for a bigger hit.
- P0: pass priority
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material x2 [CMP-MM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Casting Runic Seal now — opp has heavily loaded slot0 (MM+M, 3 material symbols across 2 cards, at the 2-attachment cap) and slot2 (M+M). Both look close to castable. Sealing before they get the chance rather than waiting again.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal facedown slot0 (MM+M, heaviest material investment = best guess for the real threat). Premonition is a known low-value draw spell, not worth sealing.
- P0: choose FACEDOWN-0
    slots exhausted — P1 gets one final turn
> **P0 thinks:** Passing — keeping Echo Shield [SS] armed through opp's final turn in case they cast something reactable. Will detach-rescue after if still unused (attachments don't persist across rounds).
- P0: pass (end turn)
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
> **P0 thinks:** Passing on Omen — it's a Prophecy-type delayed doom (structurally identical to Saboteur's Kit's gambit doom, just cast as a Spell). The cast itself deals no immediate damage to prevent; the actual 2-dmg tick in 2 turns will likely bypass reactions the same way the gambit doom did. Saving Echo Shield for an actual direct-damage spell.
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P1: detach Material x2 [CMP-MM]
- P1: detach Material [CMP-M]
- P1: detach Material x2 [CMP-MM]
- P1: detach Material x2 [CMP-MM]
- P1: detach Material x2 [CMP-MM]
- P1: pass (end turn)
    round 2 ends — level up
- P1: prepare Insight [DIV-001]
- P1: done preparing
> **P0 thinks:** Prep Warding Tithe now that we have a 5th prepared slot — bank is only ~2 so far (Foretell: 1 from Grounding + 1 from Stone Stance reduction), so it won't be cast this round unless it grows, but no cost to having it armed and ready.
- P0: prepare Warding Tithe [ABJ-046]
- P0: done preparing
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Material x2 [CMP-MM]
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[1])
    P1 casts Foretell [DIV-011]
- P1: pass priority
> **P0 thinks:** No reaction armed yet this round (haven't had our main turn to attach components) — take Foretell's 2 dmg unmitigated. Note: Stone Stance's reduction also needs re-casting each round; hasn't been recast yet.
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Material x2 [CMP-MM] → prepared[3]
- P1: attach Material [CMP-M] → prepared[4]
- P1: pass (end turn)
> **P0 thinks:** Play Aegis Charm for a 3 HP Ward — doubles Echo Shield's prevent (1→2) and ward-soak itself counts toward damagePreventedTotal per the engine (confirmed in state-ops.ts), so this is a genuine bank-income lever, not just a defensive body. Also makes the dead Bulwark Shards in hand live.
- P0: PLAY Aegis Charm [GAM-011] (trainer)
    P0 plays Aegis Charm [GAM-011]
    P0 ward → 3 HP
> **P0 thinks:** Play Bulwark Shard on the new Ward (3→5 HP) — bigger ward soaks more, which charges more prevented total, and stays alive longer to keep buffing Echo Shield.
- P0: PLAY Bulwark Shard [ITM-008] (trainer)
    P0 plays Bulwark Shard [ITM-008]
    P0 ward → 5 HP
> **P0 thinks:** Playing the second Bulwark Shard too (5→7 HP) — items don't appear capped at 1/turn, and a bigger ward = more soak = more bank income, plus a durable Echo Shield doubler.
- P0: PLAY Bulwark Shard [ITM-008] (trainer)
    P0 plays Bulwark Shard [ITM-008]
    P0 ward → 7 HP
> **P0 thinks:** Load Stone Stance with CMP-S — will cast immediately after for this round's reduction.
- P0: attach Somatic [CMP-S] → prepared[2]
> **P0 thinks:** Recast Stone Stance for R3's reduction.
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Load Echo Shield with the last component — now worth 2 prevented per trigger thanks to the ward.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
- P0: pass (end turn)
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
> **P0 thinks:** Passing again — Omen's cast has no direct damage to prevent, same as before. Holding Echo Shield for a real hit. Noting: opp is stacking a 2nd Omen doom on top of the still-live first one — this is the multi-doom-turn pattern the doctrine flags as the real killer.
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
- P1: pass (end turn)
    → P0's doom arrives — Omen [DIV-012]
    P0 takes 2 damage
> **P0 thinks:** Arm Grounding as backup reaction — Runic Seal still short a component (needs SS, only have 1 S in hand).
- P0: attach Somatic [CMP-S] → prepared[1]
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Omen [DIV-012]
    P0 takes 2 damage
    → P0's doom arrives — Saboteur's Kit [GAM-019]
    P0 takes 2 damage
> **P0 thinks:** Partial-load Runic Seal (need 1 more Somatic) — trying to get it ready before opp's last slot-cast this round targets slot0 (M+MM, still uncast).
- P0: attach Somatic [CMP-S] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Completes Runic Seal (SS), wasting the M half. Now ready to seal slot0 before opp's final slot-cast.
- P0: attach Somatic/Material [CMP-SM] → prepared[0]
> **P0 thinks:** Cast Runic Seal now, before opp's remaining 1 slot-cast this round can go off. Slot0 (M+MM, 3 material) is the only unrevealed, heavily-loaded, uncast slot left — same profile as prior real threats.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal facedown slot0 (M+MM, 3 material symbols — heaviest of the remaining unrevealed slots).
- P0: choose FACEDOWN-0
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Nothing to play — Quenching Salts is a no-op with 0 burn markers. Holding.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Arm Warding Tithe — loading it doesn't force a cast, want it ready to check the spend prompt and see actual bank size before deciding.
- P0: attach Somatic [CMP-S] → prepared[4]
> **P0 thinks:** Declining to cast Warding Tithe despite it being armed and castable. Manual bank tally: Grounding's 1 (R2 Foretell#1) + Stone Stance's 1 (same instance, reducing the leftover 1) = ~2 prevented total. A 2nd Foretell in R3 hit for full 2 unmitigated (no reaction/Stone Stance up yet that turn) — no bank gain. Omen dooms are pierce, contribute nothing. At bank~2, Tithe would make a 2 HP ward — exactly the 'tiny Tithe on autopilot' trap the brief warned against. Holding the cast, letting bank keep building toward something worth spending on (Verdict needs 6, still gated behind level 5 anyway).
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
    round 3 ends — level up
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Load Stone Stance, will cast immediately for R4's reduction.
- P0: attach Somatic x2 [CMP-SS] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield (2 prevent thanks to the ward).
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Grounding as backup reaction.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[1])
    P1 casts Foretell [DIV-011]
- P1: pass priority
> **P0 thinks:** Using Grounding not Echo Shield here — confirmed via engine read that Stone Stance's -2 reduction is a flat repeatable ongoing modifier (not a depleting pool), so it alone already fully absorbs a 2-dmg Foretell for free regardless of reactions. Bank gain is identical either way (2 total: whichever mix of reaction-prevent + reduction adds to 2). Firing Grounding anyway nets a free card draw at no bank cost; saving Echo Shield's [SS] for a bigger hit that exceeds Stone Stance's coverage.
- P0: REACT with Grounding [ABJ-008] (prepared[1])
    P0 reacts with Grounding [ABJ-008]
- P1: pass priority
- P0: pass priority
    → Grounding [ABJ-008] resolves
- P1: pass priority
- P0: pass priority
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material [CMP-M] → prepared[3]
- P1: attach Verbal/Material [CMP-VM] → prepared[4]
- P1: pass (end turn)
> **P0 thinks:** First half of Runic Seal.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Sealing early this round — slot0 (MM+SM, 4 symbols) is clearly the heaviest build again.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal facedown slot0 again (MM+SM, heaviest).
- P0: choose FACEDOWN-0
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[1]
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Omen [DIV-012]
    P0 takes 2 damage
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Bank tally now ~4 (R2 Foretell +2, R3 Foretell +0, R4 Foretell +2). Could cast Tithe for a decent 4 HP ward, but declining — Verdict (needs 6, unlocks at level5 next round per the maxSpellLevel table) is the priority test per the assignment. Spending the bank on Tithe now would zero it out right before Verdict becomes available. Holding to let it reach 6.
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
    round 4 ends — level up
- P1: replace Insight [DIV-001] with Foreclosure [DIV-020]
- P1: replace Cut the Thread [DIV-008] with Far Sight [DIV-023]
- P1: done preparing
> **P0 thinks:** Level 5 reached — Sealed Verdict and Restoring Rune both unlock (confirms maxSpellLevel gate at 2, matching levels.ts). Only 1 replacement available this round (not 2 as the level-table bonus-swap rule would suggest — actual limit differs from my read). Prioritizing Verdict per the assignment brief: it's the crucial test (does bank-funded cancel change the doom-round answer math). Cutting Grounding, not Runic Seal/Stone Stance/Echo Shield — Grounding's prevent-1 is redundant with Stone Stance's free flat -2 reduction on anything ≤2 dmg, its only edge was the card draw. Keeping Warding Tithe for now as a secondary spend option; will reassess if bank tension between Tithe and Verdict becomes a real choice.
- P0: replace Grounding [ABJ-008] with Sealed Verdict [ABJ-047]
- P0: done preparing
- P1: PLAY Sealed Vault [GAM-016] (trainer)
    P1 plays Sealed Vault [GAM-016]
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[1])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Material [CMP-M] → prepared[3]
- P1: attach Verbal/Material [CMP-VM] → prepared[4]
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Verbal/Material [CMP-VM]
- P1: attach Verbal/Material [CMP-VM] → prepared[4]
- P1: pass (end turn)
> **P0 thinks:** Arming Sealed Verdict — ward absorbed Foretell's 2 dmg passively this turn (7→5 wards, no reaction needed), which should push the bank to ~6 by my tally (2+0+2+2 across the 4 Foretells so far). If so, Verdict should be live as soon as opp casts something targetable.
- P0: attach Somatic [CMP-S] → prepared[1]
> **P0 thinks:** Load Stone Stance, will cast for R5 reduction.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** First half of Runic Seal.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Correction: 'one spell cast per turn' is per-TURN not per-round — already spent this turn's cast on Stone Stance, so Runic Seal has to wait for next turn. Reactions (Verdict, Echo Shield) are unaffected, armed and ready.
- P0: pass (end turn)
- P1: CAST Foreclosure [DIV-020] (prepared[4])
    P1 casts Foreclosure [DIV-020]
- P1: pass priority
> **P0 thinks:** SEALED VERDICT GOES LIVE — bank confirmed >=6 (the reaction was offered, gated by LEDGER_MIN in the engine). Target: Foreclosure (DIV-020, L2 MM, Prophecy - 4 dmg in 2 turns), the exact 'MM-dense doom clock' threat this card family was built for. Unlike Echo Shield/Stone Stance/wards, which only mitigate damage AFTER a doom resolves and inscribes (and pierce dooms skip all of that), Verdict cancels the SPELL ITSELF before the prophecy is ever inscribed — the first tool all series that can actually stop a doom instead of just eating it. This is the central test of the assignment: spending the whole 6-bank to erase a future 4-dmg unpreventable hit.
- P0: REACT with Sealed Verdict [ABJ-047] (prepared[1])
    P0 reacts with Sealed Verdict [ABJ-047]
- P1: pass priority
- P0: pass priority
    → Sealed Verdict [ABJ-047] resolves
- P1: pass priority
- P0: pass priority
    → Foreclosure [DIV-020] CANCELLED
- P1: attach Material [CMP-M] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Casting Runic Seal now (new turn, cast available again). Slot0 (M+VSM) still the heaviest unrevealed build.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal facedown slot0 (M+VSM, heaviest remaining).
- P0: choose FACEDOWN-0
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
> **P0 thinks:** Passing on Omen's cast again — no immediate damage, and Verdict's bank is spent (0 now after the 6-spend). Echo Shield held.
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** DETACH-RESCUE: round-final turn (both sides slot-exhausted), Echo Shield is uncast with [SS] attached — per the doctrine (and confirmed in greedy.ts's detach-rescue valve) uncast attachments get SWEPT at round end unless manually detached. Reclaiming the CMP-SS into hand rather than losing it. Bank is 0 after the Verdict spend, so not casting Warding Tithe with the last slot either (would be a worthless 0 HP ward).
- P0: detach Somatic x2 [CMP-SS]
- P0: pass (end turn)
    round 5 ends — level up
> **P0 thinks:** Level 6 raised prepared cap to 6 — free slot opened up (fresh prep-abj-048, not a swap), so adding Restoring Rune without cutting anything. Now testing the full 3-card ledger family alongside the core control kit.
- P0: prepare Restoring Rune [ABJ-048]
- P0: done preparing
- P1: prepare Unbind [DIV-019]
- P1: done preparing
    → P0's doom arrives — Omen [DIV-012]
    P0 takes 2 damage
> **P0 thinks:** Load Stone Stance.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Sealed Verdict — bank is 0 right now but keeping it loaded in case it charges up mid-round.
- P0: attach Somatic x2 [CMP-SS] → prepared[1]
> **P0 thinks:** Load Runic Seal fully with one CMP-SS card.
- P0: attach Somatic x2 [CMP-SS] → prepared[0]
- P0: pass (end turn)
- P1: PLAY Arcane Study [GAM-001] (trainer)
    P1 plays Arcane Study [GAM-001]
- P1: choose Material [CMP-M]
- P1: attach Material x2 [CMP-MM] → prepared[4]
- P1: CAST Foreclosure [DIV-020] (prepared[4])
    P1 casts Foreclosure [DIV-020]
- P1: pass priority
> **P0 thinks:** Foreclosure again (4-dmg doom) but bank is 0 this round — Verdict not even offered (LEDGER_MIN gate). This will land as scheduled prophecy damage in 2 turns, unanswerable. Illustrates the core tension: Verdict recharges over several rounds of income but doom threats come every round — it's an occasional answer, not a repeatable one.
- P0: pass priority
    prophecy inscribed on P0: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
- P1: pass (end turn)
> **P0 thinks:** Holding Runic Seal — opp's two unrevealed slots (0,5) are both still empty this round, no signal yet on which is the real threat.
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[3]
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
- P0: pass priority
    → Premonition [DIV-005] resolves
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: pass (end turn)
    → P0's doom arrives — Foreclosure [DIV-020]
    P0 takes 4 damage
> **P0 thinks:** Cast Runic Seal — slot0 now shows [MM] investment vs slot5 still empty. HP down to 17 after that unanswered Foreclosure doom; need to deny what threats we can.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal facedown slot0 (MM, most invested).
- P0: choose FACEDOWN-0
- P0: pass (end turn)
- P1: detach Material x2 [CMP-MM]
- P1: attach Somatic/Material [CMP-SM] → prepared[2]
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material x2 [CMP-MM] → prepared[5]
- P1: CAST Unbind [DIV-019] (prepared[5])
    P1 casts Unbind [DIV-019]
- P1: pass priority
> **P0 thinks:** Unbind incoming — will destroy our ward or Stone Stance's ongoing reduction, exactly the 'Unbind destroys batteries' warning from doctrine. Echo Shield can't help (no damage involved) and Verdict isn't offered (bank<6). Nothing to do but watch which target they pick.
- P0: pass priority
    P0 ward destroyed
    → Unbind [DIV-019] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Detach-rescue: round-final turn, Sealed Verdict uncast with [SS] attached would be swept.
- P0: detach Somatic x2 [CMP-SS]
> **P0 thinks:** Detach-rescue Echo Shield too.
- P0: detach Somatic x2 [CMP-SS]
- P0: pass (end turn)
    round 6 ends — level up
- P1: replace Premonition [DIV-005] with Reclaim [DIV-015]
- P1: done preparing
- P0: done preparing
- P1: pass (end turn)
    P0 reshuffles discard into deck (#1) — exhaustion 2
    P0 takes 2 damage
> **P0 thinks:** Load Stone Stance.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Sealed Verdict, hoping bank charges this round.
- P0: attach Somatic x2 [CMP-SS] → prepared[1]
> **P0 thinks:** First half of Runic Seal.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Holding Runic Seal — slots 0 and 3 both still unbuilt, no signal yet.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** No signal after 2 turns of waiting — casting now as a coinflip guess between slot0/slot3 rather than losing more tempo. HP15 means I need to be proactive about denying threats.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Sealing the KNOWN Foreclosure (DIV-020, 4-dmg doom) directly rather than guessing on the facedown slots — its identity is already revealed from prior casts, and at HP15 the 4-dmg threat is the one that actually matters to deny.
- P0: choose Foreclosure [DIV-020]
- P0: pass (end turn)
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[3]
- P1: attach Material [CMP-M] → prepared[3]
- P1: CAST Reclaim [DIV-015] (prepared[3])
    P1 casts Reclaim [DIV-015]
- P1: pass priority
- P0: pass priority
    → Reclaim [DIV-015] resolves
- P1: choose Material x2 [CMP-MM]
- P1: pass (end turn)
- P1: attach Material [CMP-M] → prepared[5]
- P1: attach Material [CMP-M] → prepared[5]
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P1: pass (end turn)
> **P0 thinks:** Hand at cap (10) — next draw auto-discards. Nothing worth casting with the last slot (Tithe/Rune still bank=0, no ward for Bulwark Shard). 4 dmg of stacked doom due next turn (Omen 2 + Saboteur's Kit 2), unavoidable.
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Saboteur's Kit [GAM-019]
    P0 takes 2 damage
    → P0's doom arrives — Omen [DIV-012]
    P0 takes 2 damage
> **P0 thinks:** Confirmed via engine (LEDGER_MIN in cardFlags.ts): Tithe needs bank>=1, Rune>=2, Verdict>=6. None are legal right now (bank still ~0) — opp hasn't cast a single directly-preventable spell (Foretell) in 2 full rounds, only pierce-doom (Omen/Saboteur's Kit/Foreclosure) and non-damage utility (Premonition/Reclaim/Unbind). This is the starvation pattern the brief warned about: a doom-heavy Divination line can go multiple rounds without ever feeding the bank.
- P0: pass (end turn)
    P0 discards 1 (hand cap)
    round 7 ends — level up
> **P0 thinks:** HP11/30, bank stuck at 0 for 2 straight rounds (opp hasn't cast a single directly-preventable spell). Swapping Warding Tithe (needs bank>=1, useless right now, always will be second fiddle to Verdict eating the whole bank when it does charge) for Counterbind — an UNCONDITIONAL cancel (no bank gate) vs any spell with an M component. Checked: every single Divination spell seen this match (Foretell/Omen/Foreclosure/Unbind/Premonition/Reclaim) costs M or MM — Counterbind can always answer them. This gives a second denial tool per round alongside Runic Seal that doesn't depend on the bank ever charging, which matters given the observed doom-only starvation pattern. Keeping Verdict in to keep testing it, but survival now takes priority over exclusively testing the ledger family.
- P0: replace Warding Tithe [ABJ-046] with Counterbind [ABJ-015]
- P0: done preparing
- P1: replace Reclaim [DIV-015] with Premonition [DIV-005]
- P1: done preparing
> **P0 thinks:** New Ward — restores Echo Shield's 2x prevent and gives a small HP buffer at 11 HP.
- P0: PLAY Aegis Charm [GAM-011] (trainer)
    P0 plays Aegis Charm [GAM-011]
    P0 ward → 3 HP
> **P0 thinks:** Bulwark Shard on the fresh Ward.
- P0: PLAY Bulwark Shard [ITM-008] (trainer)
    P0 plays Bulwark Shard [ITM-008]
    P0 ward → 5 HP
> **P0 thinks:** Load Stone Stance.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Counterbind (SM) — our new unconditional cancel vs any M-cost spell (which is all of them so far).
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
> **P0 thinks:** Arm Sealed Verdict too (S half), on the off chance bank charges this round.
- P0: attach Somatic/Material [CMP-SM] → prepared[1]
> **P0 thinks:** First half of Runic Seal.
- P0: attach Somatic/Material [CMP-SM] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Somatic/Material [CMP-SM] → prepared[0]
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[3]
- P1: PLAY Disarm [GAM-020] (trainer)
    P1 plays Disarm [GAM-020]
- P1: choose Somatic [CMP-S]
    P0's Somatic [CMP-S] is put on top of their deck
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
> **P0 thinks:** Premonition again, not worth spending Counterbind on a harmless draw spell.
- P0: pass priority
    → Premonition [DIV-005] resolves
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material x2 [CMP-MM] → prepared[4]
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Casting Runic Seal — slot4 (Foreclosure, known 4-dmg doom) is being reloaded with MM again. Sealing the known threat directly rather than guessing on slot0.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal Foreclosure (DIV-020, 4-dmg doom) directly.
- P0: choose Foreclosure [DIV-020]
- P0: pass (end turn)
- P1: detach Material x2 [CMP-MM]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[1]
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: CAST Omen [DIV-012] (prepared[2])
    P1 casts Omen [DIV-012]
- P1: pass priority
> **P0 thinks:** Counterbind cancels Omen (MM cost, qualifies) — unconditional cancel, no bank needed. At HP11 every doom denied matters; this is the reliable answer Runic Seal+Counterbind together provide vs Verdict's bank-gated one.
- P0: REACT with Counterbind [ABJ-015] (prepared[4])
    P0 reacts with Counterbind [ABJ-015]
- P1: pass priority
- P0: pass priority
    → Counterbind [ABJ-015] resolves
- P1: pass priority
- P0: pass priority
    → Omen [DIV-012] CANCELLED
- P1: pass (end turn)
- P0: pass (end turn)
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
- P1: pass (end turn)
> **P0 thinks:** Saboteur's Kit is a Gambit, not a Spell — uncancellable by Counterbind/Verdict/Runic Seal. Nothing to do about this 2 dmg.
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Saboteur's Kit [GAM-019]
    P0 takes 2 damage
> **P0 thinks:** HP9 — playing Second Wind immediately, no reason to hold at this HP.
- P0: PLAY Second Wind [GAM-009] (trainer)
    P0 plays Second Wind [GAM-009]
    P0 heals 5
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[1]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Verbal/Material [CMP-VM] → prepared[3]
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: CAST Far Sight [DIV-023] (prepared[0])
    P1 casts Far Sight [DIV-023]
- P1: pass priority
> **P0 thinks:** Far Sight — another prophecy doom (2 dmg, this one only 1 turn delay). Counterbind already spent this round on Omen, Verdict still bank-gated (0). No answer available, will just take it.
- P0: pass priority
    prophecy inscribed on P0: 2 damage in 1 turn (Far Sight [DIV-023])
    → Far Sight [DIV-023] resolves
- P1: choose Material x2 [CMP-MM]
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
    round 8 ends — level up
- P1: replace Premonition [DIV-005] with Reclaim [DIV-015]
- P1: done preparing
- P0: done preparing
- P1: attach Material x2 [CMP-MM] → prepared[5]
- P1: PLAY Mana Sickness [GAM-017] (trainer)
    P1 plays Mana Sickness [GAM-017]
- P1: CAST Unbind [DIV-019] (prepared[5])
    P1 casts Unbind [DIV-019]
- P1: pass priority
- P0: pass priority
    P0 ward destroyed
    P1 reshuffles discard into deck (#1) — exhaustion 2
    P1 takes 2 damage
    → Unbind [DIV-019] resolves
- P1: attach Verbal/Material [CMP-VM] → prepared[1]
- P1: pass (end turn)
    → P0's doom arrives — Far Sight [DIV-023]
    P0 takes 2 damage
> **P0 thinks:** Load Stone Stance.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Counterbind.
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Sealed Verdict.
- P0: attach Somatic [CMP-S] → prepared[1]
> **P0 thinks:** Load Runic Seal fully with one CMP-SS.
- P0: attach Somatic x2 [CMP-SS] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Cast Runic Seal — targeting the known Foreclosure again.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal Foreclosure again — the biggest known threat (4 dmg) vs Far Sight's 2.
- P0: choose Foreclosure [DIV-020]
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material [CMP-M] → prepared[0]
- P1: CAST Far Sight [DIV-023] (prepared[0])
    P1 casts Far Sight [DIV-023]
- P1: pass priority
> **P0 thinks:** Counterbind cancels Far Sight (MM cost) — HP12, denying this 2-dmg doom too.
- P0: REACT with Counterbind [ABJ-015] (prepared[4])
    P0 reacts with Counterbind [ABJ-015]
- P1: pass priority
- P0: pass priority
    → Counterbind [ABJ-015] resolves
- P1: pass priority
- P0: pass priority
    → Far Sight [DIV-023] CANCELLED
- P1: pass (end turn)
- P0: pass (end turn)
- P1: detach Verbal/Material [CMP-VM]
- P1: attach Verbal/Material [CMP-VM] → prepared[3]
- P1: attach Verbal/Material [CMP-VM] → prepared[3]
- P1: CAST Reclaim [DIV-015] (prepared[3])
    P1 casts Reclaim [DIV-015]
- P1: pass priority
- P0: pass priority
    → Reclaim [DIV-015] resolves
- P1: choose Material [CMP-M]
- P1: choose Material x2 [CMP-MM]
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Detach-rescue: round-final turn, Sealed Verdict uncast.
- P0: detach Somatic [CMP-S]
> **P0 thinks:** Detach-rescue Echo Shield too.
- P0: detach Somatic x2 [CMP-SS]
- P0: pass (end turn)
    round 9 ends — level up
> **P0 thinks:** Free 7th slot — adding Phase Shift, a 3rd unconditional cancel (no M-component requirement like Counterbind, no bank gate like Verdict). With Runic Seal (preemptive lock) + Counterbind + Phase Shift, we can now answer up to 3 threats/round without touching the bank at all — directly testing whether a denial-tool-count fix outperforms the ledger-family's bank-gated answer.
- P0: prepare Phase Shift [ABJ-014]
- P0: done preparing
- P1: prepare Calculated Draw [DIV-029]
- P1: replace Foretell [DIV-011] with Entropy [DIV-032]
- P1: replace Reclaim [DIV-015] with Convergent Future [DIV-034]
- P1: done preparing
> **P0 thinks:** Load Stone Stance. Note: opp just added Entropy (DIV-032, MMM, 7-dmg doom in 3 turns) — the doctrine's flagged killer card. At HP12 this needs denying via Counterbind/Phase Shift/Runic Seal once its slot reveals.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Counterbind.
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
> **P0 thinks:** First half of Phase Shift.
- P0: attach Somatic [CMP-S] → prepared[6]
> **P0 thinks:** Completes Phase Shift.
- P0: attach Somatic [CMP-S] → prepared[6]
> **P0 thinks:** Arm Sealed Verdict.
- P0: attach Somatic [CMP-S] → prepared[1]
> **P0 thinks:** Partial-load Runic Seal (need 1 more S) with our last useful component.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[6]
- P1: attach Material x2 [CMP-MM] → prepared[5]
- P1: attach Material [CMP-M] → prepared[1]
- P1: CAST Unbind [DIV-019] (prepared[5])
    P1 casts Unbind [DIV-019]
- P1: pass priority
> **P0 thinks:** Unbind again — will strip Stone Stance (no ward up currently). Not spending Counterbind/Phase Shift on it per doctrine ('cancels on DOOMS ONLY') — saving both for Entropy once it reveals enough investment. Losing the reduction stings but isn't close to lethal; Entropy at 7 dmg with us at HP12 would be.
- P0: pass priority
    → Unbind [DIV-019] resolves
- P1: pass (end turn)
> **P0 thinks:** Completes Runic Seal.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[0]
> **P0 thinks:** Casting Runic Seal — Entropy's candidate slots (1,3,6) only have 1 M each so far, not close to MMM. Sealing the known Foreclosure for reliable value; Counterbind+Phase Shift stay in reserve for Entropy when it's actually cast.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal known Foreclosure again.
- P0: choose Foreclosure [DIV-020]
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Verbal/Material [CMP-VM] → prepared[3]
- P1: PLAY Disarm [GAM-020] (trainer)
    P1 plays Disarm [GAM-020]
- P1: choose Somatic [CMP-S]
    P0's Somatic [CMP-S] is put on top of their deck
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Material x2 [CMP-MM]
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: CAST Entropy [DIV-032] (prepared[1])
    P1 casts Entropy [DIV-032]
- P1: pass priority
> **P0 thinks:** CRITICAL: Counterbind cancels Entropy (MMM, 7-dmg doom in 3 turns) — the exact card the doctrine flags as THE killer. At HP12, 7 unanswered damage would be near-fatal. This is the highest-value denial of the match so far, and it cost zero bank.
- P0: REACT with Counterbind [ABJ-015] (prepared[4])
    P0 reacts with Counterbind [ABJ-015]
- P1: pass priority
- P0: pass priority
    → Counterbind [ABJ-015] resolves
- P1: pass priority
- P0: pass priority
    → Entropy [DIV-032] CANCELLED
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[0]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Card flow, nothing else productive.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Return one Quenching Salts — still a no-op with 0 burn markers.
- P0: choose Quenching Salts [GAM-013]
- P0: pass (end turn)
- P1: pass (end turn)
    round 10 ends — level up
- P1: replace Omen [DIV-012] with Echoes of the Past [DIV-028]
- P1: done preparing
- P0: done preparing
- P1: pass (end turn)
> **P0 thinks:** Load Stone Stance.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Counterbind.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
> **P0 thinks:** Arm Phase Shift fully.
- P0: attach Somatic x2 [CMP-SS] → prepared[6]
> **P0 thinks:** First half of Runic Seal — prioritizing this over Verdict since bank is likely still near 0.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Somatic [CMP-S] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Arm Sealed Verdict too.
- P0: attach Somatic [CMP-S] → prepared[1]
> **P0 thinks:** Cast Runic Seal — targeting known Foreclosure or Entropy again.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal Entropy this time (7 dmg, the bigger threat) — Counterbind and Phase Shift are both armed to answer Foreclosure/whatever else gets cast.
- P0: choose Entropy [DIV-032]
- P0: pass (end turn)
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Verbal/Material [CMP-VM] → prepared[0]
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
    P0 reshuffles discard into deck (#2) — exhaustion 4
    P0 takes 4 damage
> **P0 thinks:** HP8 — critical. Deck-exhaustion penalty scales (1st reshuffle=2dmg, 2nd=4dmg) — did not anticipate this drain. Checking if Restoring Rune is castable (bank>=2) as emergency healing.
- P0: attach Somatic [CMP-S] → prepared[5]
> **P0 thinks:** Restoring Rune not offered as castable — bank confirmed still under 2. Nothing else to do; HP8 is critical, relying on Counterbind/Phase Shift/sealed-Entropy to hold this round.
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Holding Arcane Study — at HP8, avoiding extra deck cycling given the scaling exhaustion penalty (1st reshuffle 2dmg, 2nd 4dmg) even though deck28 gives plenty of buffer.
- P0: pass (end turn)
- P1: attach Material [CMP-M] → prepared[0]
- P1: pass (end turn)
- P0: pass (end turn)
    round 11 ends — level up
- P0: done preparing
- P1: replace Echoes of the Past [DIV-028] with Foretold Strike [DIV-038]
- P1: done preparing
> **P0 thinks:** Load Stone Stance. Opp just added Foretold Strike (MMV, draw 2 + 1 dmg per card above 5 in hand) — a real reactable direct-damage spell, unlike the doom-clock cards. With their hand already at 8, this could hit for several once cast.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Phase Shift fully with the CMP-SS. No M-bearing component left for Counterbind this turn.
- P0: attach Somatic x2 [CMP-SS] → prepared[6]
> **P0 thinks:** Prioritizing Runic Seal over Verdict — bank still likely too low for Verdict to matter.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Completes Runic Seal.
- P0: attach Somatic [CMP-S] → prepared[0]
> **P0 thinks:** Card flow to refill components for Counterbind/Verdict next turn — deck26 is plenty safe from exhaustion.
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Return a Quenching Salts.
- P0: choose Quenching Salts [GAM-013]
> **P0 thinks:** Arm Sealed Verdict.
- P0: attach Somatic [CMP-S] → prepared[1]
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: attach Somatic/Material [CMP-SM] → prepared[1]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: attach Material [CMP-M] → prepared[3]
- P1: attach Somatic/Material [CMP-SM] → prepared[3]
- P1: attach Material [CMP-M] → prepared[6]
- P1: CAST Entropy [DIV-032] (prepared[1])
    P1 casts Entropy [DIV-032]
- P1: pass priority
> **P0 thinks:** CRITICAL: Phase Shift cancels Entropy (7-dmg doom) — Counterbind wasn't armed this turn (no M-bearing component left), but Phase Shift is unconditional and covers it. HP8 cannot take 7 unanswered.
- P0: REACT with Phase Shift [ABJ-014] (prepared[6])
    P0 reacts with Phase Shift [ABJ-014]
- P1: pass priority
- P0: pass priority
    → Phase Shift [ABJ-014] resolves
- P1: pass priority
> **P0 thinks:** Free attach from Phase Shift's bonus effect — arming Restoring Rune in case bank charges.
- P0: attach Somatic [CMP-S] → prepared[5]
- P0: pass priority
    → Entropy [DIV-032] CANCELLED
- P1: pass (end turn)
> **P0 thinks:** Cast Runic Seal on the known Foreclosure — Echo Shield is still armed as backup for whatever Foretold-Strike-like spell is building in slot2/3.
- P0: CAST Runic Seal [ABJ-010] (prepared[0])
    P0 casts Runic Seal [ABJ-010]
- P0: pass priority
- P1: pass priority
    → Runic Seal [ABJ-010] resolves
> **P0 thinks:** Seal Foreclosure.
- P0: choose Foreclosure [DIV-020]
- P0: pass (end turn)
- P1: PLAY Sealed Vault [GAM-016] (trainer)
    P1 plays Sealed Vault [GAM-016]
- P1: attach Material x2 [CMP-MM] → prepared[6]
- P1: CAST Calculated Draw [DIV-029] (prepared[6])
    P1 casts Calculated Draw [DIV-029]
- P1: pass priority
- P0: pass priority
    → Calculated Draw [DIV-029] resolves
- P1: choose Material x2 [CMP-MM]
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: attach Material [CMP-M] → prepared[5]
- P1: attach Material [CMP-M] → prepared[5]
- P1: pass (end turn)
> **P0 thinks:** Arm Counterbind now that we have an SM component.
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** New Ward — HP buffer at HP8 and restores Echo Shield's 2x prevent.
- P0: PLAY Aegis Charm [GAM-011] (trainer)
    P0 plays Aegis Charm [GAM-011]
    P0 ward → 3 HP
> **P0 thinks:** Boost the ward further.
- P0: PLAY Bulwark Shard [ITM-008] (trainer)
    P0 plays Bulwark Shard [ITM-008]
    P0 ward → 5 HP
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
- P0: pass (end turn)
- P1: pass (end turn)
    round 12 ends — level up
- P1: replace Unbind [DIV-019] with Manipulate Fate [DIV-030]
- P1: done preparing
- P0: done preparing
- P1: PLAY Disarm [GAM-020] (trainer)
    P1 plays Disarm [GAM-020]
- P1: choose Somatic/Material [CMP-SM]
    P0's Somatic/Material [CMP-SM] is put on top of their deck
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: attach Material x2 [CMP-MM] → prepared[1]
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: attach Material x2 [CMP-MM] → prepared[3]
- P1: CAST Entropy [DIV-032] (prepared[1])
    P1 casts Entropy [DIV-032]
- P1: pass priority
> **P0 thinks:** DANGER: no reactions armed yet this fresh round (haven't had a main turn), Entropy resolves uncontested — 7-dmg prophecy about to inscribe with us at HP8. 3-turn delay gives a window to find healing, but pierce damage can't be blocked once inscribed. This is the position risk of denial-only play: if the timing doesn't line up (fresh round, no components yet), a big doom slips through.
- P0: pass priority
    prophecy inscribed on P0: 7 damage in 3 turns (Entropy [DIV-032])
    → Entropy [DIV-032] resolves
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Verbal/Material [CMP-VM]
- P1: pass (end turn)
> **P0 thinks:** HP8, doom 7 in 2 turns — checking if Restoring Rune (needs bank>=2) is finally castable for emergency healing.
- P0: attach Somatic [CMP-S] → prepared[5]
> **P0 thinks:** Rune not castable — bank still <2. Falling back to pure denial: must ensure nothing else lands this round, then hope to draw healing before the 7-dmg doom ticks in 2 turns.
- P0: attach Somatic [CMP-S] → prepared[2]
- P0: CAST Stone Stance [ABJ-005] (prepared[2])
    P0 casts Stone Stance [ABJ-005]
- P0: pass priority
- P1: pass priority
    → Stone Stance [ABJ-005] resolves
> **P0 thinks:** Arm Echo Shield.
- P0: attach Somatic x2 [CMP-SS] → prepared[3]
> **P0 thinks:** Arm Counterbind.
- P0: attach Somatic/Material [CMP-SM] → prepared[4]
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[0]
- P1: pass (end turn)
> **P0 thinks:** Boost ward — won't help the doom (pierces wards) but helps against any other damage this round.
- P0: PLAY Bulwark Shard [ITM-008] (trainer)
    P0 plays Bulwark Shard [ITM-008]
    P0 ward → 7 HP
- P0: pass (end turn)
- P1: detach Material x2 [CMP-MM]
- P1: attach Material x2 [CMP-MM] → prepared[4]
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: attach Material [CMP-M] → prepared[3]
- P1: CAST Far Sight [DIV-023] (prepared[0])
    P1 casts Far Sight [DIV-023]
- P1: pass priority
> **P0 thinks:** MUST CANCEL: Entropy's 7 dmg already lands next turn at HP8 — adding Far Sight's 2 on top would be LETHAL (9 total vs 8 HP). Counterbind stops this stacking.
- P0: REACT with Counterbind [ABJ-015] (prepared[4])
    P0 reacts with Counterbind [ABJ-015]
- P1: pass priority
- P0: pass priority
    → Counterbind [ABJ-015] resolves
- P1: pass priority
- P0: pass priority
    → Far Sight [DIV-023] CANCELLED
- P1: pass (end turn)
    → P0's doom arrives — Entropy [DIV-032]
    P0 takes 7 damage
> **P0 thinks:** HP1 — maximum danger, any further hit ends the game. Building toward Runic Seal as one more denial layer alongside armed Phase Shift and Echo Shield.
- P0: attach Somatic/Material [CMP-SM] → prepared[0]
- P0: pass (end turn)
- P1: CAST Foreclosure [DIV-020] (prepared[4])
    P1 casts Foreclosure [DIV-020]
- P1: pass priority
> **P0 thinks:** Mistake this turn: ran out of components before arming Phase Shift (slot6 still shows unattached) — only had enough for Runic Seal/Echo Shield/Counterbind. Foreclosure resolves uncontested, inscribing 4 dmg in 2 turns. At HP1 that's fatal unless healing is found. Component-allocation triage under multi-threat pressure is a real cost of this denial-heavy plan — armed reactions run out before all threats are covered.
- P0: pass priority
    prophecy inscribed on P0: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
- P1: attach Somatic/Material [CMP-SM] → prepared[6]
- P1: pass (end turn)
> **P0 thinks:** HP1, Foreclosure's 4-dmg doom already inscribed and due in 1 turn — no reaction window exists when a doom actually lands (confirmed every prior instance in this match), and no heal source is available (Rune still under the bank-2 threshold, no other healing in hand). This is effectively a loss next turn barring a miracle.
- P0: pass (end turn)
- P1: pass (end turn)
    → P0's doom arrives — Foreclosure [DIV-020]
    P0 takes 4 damage
    GAME OVER — P1 wins (hp)

**Result:** P1 wins (hp), round 13.

## Analysis

### RESULT: LOSS for Abjuration, round 13. Final HP: Abj -3 / Div 28.

Kill shot: Foreclosure [DIV-020] (L1, MM, 4-damage prophecy), inscribed at R13T160 while Phase Shift sat completely unarmed — a component-allocation miss, not a doctrine failure. That same turn Counterbind had already been spent cancelling Far Sight, and I ran out of hand fuel before reaching Phase Shift's slot. The 4 damage landed on an HP1 body (itself the result of an Entropy [DIV-032] 7-damage prophecy that slipped through two turns earlier, on the very first turn of a fresh round before any reaction had been armed). Two clean kill windows, both explainable, neither a ledger-family problem specifically.

### Bank charge rate vs Divination: catastrophically low — worse than m31's already-slow read

Manual tally across 13 rounds: the bank reached at most ~6 total over the whole match (charged briefly to 6 exactly once, at R5, immediately spent on Sealed Verdict — see below), then sat at 0 for the final 8 rounds straight. Contributing events: R2 Foretell (Grounding 1 + Stone Stance 1 = 2), R3 Foretell (0, no defense up), R4 Foretell (Grounding 1 + Stone Stance 1 = 2), R5 Foretell (ward-soak 2, confirmed the passive ward-absorption income path). That's the entire lifetime bank income of the match: **4 separate Foretell casts, ~6 total prevented, then nothing for 8 more rounds.** After round 5 the opponent never cast Foretell again — every subsequent threat was Omen/Foreclosure/Entropy/Far Sight (all pierce-doom, zero bank contribution) or Unbind/Premonition/Reclaim/Calculated Draw/Foretold Strike (utility, no damage to prevent). This confirms the assignment's warned catch in its sharpest form yet: a Divination line that leans into doom+utility can starve the bank completely for the majority of a long game, not just slow it down.

### Verdict verdict: went live exactly once, and it mattered enormously

Sealed Verdict fired at R5T55, spending the full 6-bank to cancel Foreclosure (DIV-020, the exact MM-dense doom-clock card the family was built to answer) before its prophecy could be inscribed. This is a clean, unambiguous positive result — direct confirmation that a bank-funded cancel is possible with real play and that it denies exactly the threat class the brief described. But it was a **one-time event**: the bank never rebuilt to 6 again in the remaining 8 rounds. Verdict sat armed (S attached, detach-rescued when unused) essentially every round after that as dead weight, never once re-offered as a legal reaction because damagePreventedTotal never cleared 6 again. One live cancel in 13 rounds is a real result, not a null one — but it is nowhere near "the extra answer per round" the brief hoped for; it is closer to "a one-shot emergency valve that recharges on a timescale longer than most games will run."

### The real fix wasn't the ledger family — it was stacking unconditional cancels

The turning point of this game had nothing to do with Tithe/Verdict/Rune: at level 10 I added Phase Shift (SS, unconditional cancel, no bank gate) alongside the already-present Counterbind (SM, cancels any M-cost spell — which is *every* Divination spell seen this match) and Runic Seal (SS, preemptive pre-cast lock, 1/round). With three denial tools instead of one, R10-R12 went perfectly: Foreclosure sealed or Entropy Counterbound/Phase-Shifted clean, three rounds straight of **zero net spell damage**, matching the assignment's framing exactly — "the doom clock presents 2-3 funded threats/round vs a denial kit that answers ~1." Answering 3/round (Seal + Counterbind + Phase Shift) is what stabilized HP at 8-12 for three full rounds after a rough start. The loss came from a resource-allocation failure at the boundary (fresh round, no components yet, two Entropy-class threats in one round) — not from the fundamental toolkit being insufficient.

### Restoring Rune and Warding Tithe: never cast, honestly dead weight this game

Both spent the entire match either unarmed or armed-but-never-castable (LEDGER_MIN 1 and 2 respectively — lower bars than Verdict's 6, but the bank was at 0 for 8 of 13 rounds, so even Tithe's minimum was usually unmet). Warding Tithe was deliberately never cast on a small bank per the assignment's explicit warning against "tiny Tithes on autopilot" — correct discipline, but it means the card contributed nothing all game. Restoring Rune got one emergency check at HP8/HP1 (both times the bank was under 2, confirmed via the missing cast-abj-048 legal action) and never fired. Neither is a "bad card" verdict so much as "starved of the resource they spend" — same root cause as Verdict's near-uselessness, just with lower thresholds that still weren't met.

### Anomalies / engine notes

1. **Deck-exhaustion penalty SCALES with reshuffle count** — first reshuffle cost 2 HP (R11T133), second cost 4 HP (R11T133→ actually the second reshuffle event, same turn cluster). This is a materially bigger and more dangerous drain than the flat-2 assumption from prior playtests (m22, m31); it should be flagged as an active HP-pressure source in its own right, not a footnote. At HP8 a 4-damage reshuffle tick is as dangerous as a small doom.
2. **Runic Seal can target a spell by REVEALED IDENTITY, not just facedown slot index**, once that spell has been cast and resolved earlier in the match (its defId becomes a pickable option in the seal-choice list alongside FACEDOWN-N entries). This is strictly better than guessing blind on unrevealed slots whenever a repeat-cast threat (Foreclosure, Entropy, Omen) is already known — used this every round from R7 onward once the opponent's kit was scouted, and it never missed.
3. **Ward absorption charges damagePreventedTotal even without any reaction** — confirmed directly by code read (`state-ops.ts` `dealDamageToPlayer`) and in play (R5T54: Foretell's 2 dmg silently soaked 7→5 wards, no react needed, still fed the bank). A ward sitting in play is a passive bank-income source, not just a body — worth remembering it competes with Stone Stance for "free" charge rather than needing active reaction spend.
4. **Component-allocation triage is the real bottleneck of a 3-tool denial kit**, not card design: with Runic Seal + Counterbind + Phase Shift + Echo Shield + Sealed Verdict + Restoring Rune all wanting components in the same turn, hand fuel ran out before Phase Shift could be armed on the exact turn (R13) two big threats needed answering. A denial-stacked build needs proportionally more component draw/fixing to keep all its tools loaded simultaneously, or it just shifts the failure mode from "no cancel available" to "cancel exists but unfunded."
5. **Stone Stance's -2 reduction is a flat repeatable per-instance modifier for the whole round, not a depleting pool** — confirmed via engine read (`addOngoing`/`sumOngoing`, `packages/engine/src/state-ops.ts`); it fully absorbs unlimited separate ≤2-damage spell instances for one S + one cast-slot per round. This makes it strictly better value than spending a reaction on any single ≤2-damage hit when it's already up (own-goal to burn Echo Shield/Grounding on a Foretell that Stone Stance would eat for free).

