# Playtest m23: Abjuration (P0) vs Divination (P1) — seed 6202 — bot greedy — NEW-DECK calibration

> **P0 thinks:** R1 prep: Runic Seal (denial), Mana Drain (component-removal denial — strand mid-assembly doom fuel), Fortify (ward/battery seed), Echo Shield (prevention, feeds Reckoning).
- P0: prepare Runic Seal [ABJ-010]
- P0: prepare Mana Drain [ABJ-009]
- P0: prepare Fortify [ABJ-001]
- P0: prepare Echo Shield [ABJ-007]
- P0: done preparing
- P1: attach Material [CMP-M] → prepared[3]
- P1: CAST Premonition [DIV-005] (prepared[3])
- P1: pass priority
- P0: pass priority → Premonition resolves
- P1: attaches components to slots 0,1,2 (overfund/kicker pattern) → PLAY Saboteur's Kit [GAM-019] (trainer)
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit)
- P1: pass (end turn)
> **P0 thinks:** Gambit doom, uncancellable — eat it. Cast Fortify: first ward (2 HP), then Bulwark Shard item for free +2 (ward 4).
- P0: attach Somatic [CMP-S] → prepared[2]; CAST Fortify [ABJ-001]
- P0: pass priority / P1 pass → ward 2 HP → Fortify resolves
- P0: PLAY Bulwark Shard [ITM-008] → ward 4 HP
> **P0 thinks:** Pre-fund Runic Seal (single CMP-SS card = SS) for next turn's denial.
- P0: attach Somatic x2 [CMP-SS] → prepared[0]
- P0: pass (end turn)
- P1: pass (end turn) → P0's doom arrives — Saboteur's Kit: P0 takes 2 (HP 28)
> **P0 thinks:** Last cast slot this round — cast Runic Seal now on opp slot2 (heaviest [M,M] investment) to strand it and test whether spending my final slot ends the round early.
- P0: CAST Runic Seal [ABJ-010] → CHOICE seal FACEDOWN-2
- P0: choose FACEDOWN-2 → "slots exhausted — P1 gets one final turn"
- P0: pass (end turn) / P1: pass (end turn) → round 1 ends — level up

## Round 2 (lv2, still max spell level L1 — matches level table, L2 unlocks lv5)
> **P0 thinks:** Keep the set — Runic Seal stranded opp's 2M last round (confirmed: slot2's investment vanished at round transition, not returned to hand).
- P0: done preparing / P1: done preparing
> **P0 thinks:** I act first this round (turn order alternates by round parity). Nothing to seal yet — cast Fortify (ward 4→6), pre-fund Runic Seal for later.
- P0: CAST Fortify [ABJ-001] → ward 6 HP
- P0: attach Somatic x2 [CMP-SS] → prepared[0] (Runic Seal funded)
- P0: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[0]; attach Material x2 [CMP-MM] → prepared[1] (funds TWO MM slots via single dual cards, doesn't cast either)
> **P0 thinks:** KEY OBSERVATION — new-deck MM duals let them fully fund an MM spell in ONE attach action. Sealing slot0 now to strand it before they can fire it.
- P0: CAST Runic Seal → choose FACEDOWN-0 → "slots exhausted — P1 gets one final turn"
- P0: fund Echo Shield (CMP-SM) → pass
- P1: attach Material [CMP-M] → prepared[0] (dumping MORE fuel into the SEALED slot — wasted); CAST Foretell [DIV-011] (prepared[1]) — 2 dmg
> **P0 thinks:** React Echo Shield — ward in play grants prevent-2, fully blocks it.
- P0: REACT Echo Shield → Foretell fully prevented (HP still 31)
- P1: pass (end turn) → detach Material x2 [CMP-MM]; detach Material x2 [CMP-MM] (reclaims resources before round end — contrast with sealed slots, which lose attached fuel permanently)
- round 2 ends — level up

## Round 3 (lv3, 5 prepared slots, 3 casts/round)
> **P0 thinks:** Add Grounding (5th slot) — second prevention reaction.
- P0: prepare Grounding [ABJ-008] → done
- P1: attach Material x2 [CMP-MM] → prepared[2]; CAST Omen [DIV-012] (prepared[2]) — P1's FIRST ACTION of the round, fully funded via one dual card same turn.
> **P0 thinks:** Zero reactions available — no L2 cancel until player level 5 (Runic Seal is a Spell, can't respond mid-stack). This confirms the brief's "first-action doom window is unanswerable."
- P0: pass priority → prophecy inscribed: 2 dmg in 2 turns (Omen)
- P1: attach Material [CMP-M] → prepared[0]; pass
> **P0 thinks:** Seal the freshly-reloaded MM slot0 before they can cast again.
- P0: fund + CAST Runic Seal → seal FACEDOWN-0
- P0: CAST Fortify → ward 8 HP
- P1: pass (end turn) → P0's doom arrives — Omen: P0 takes 2 (HP 26)
- P0: fund Grounding; several quiet turns; P1 attaches more MM to slot0 (still sealed, wasted); round 3 ends — level up. Confirmed at round4 transition: slot0's stacked MM funding is gone (stranded again).

## Round 4 (lv4)
- P0: done preparing (kit unchanged) / P1: done preparing
> **P0 thinks:** I'm first. Cast Fortify (ward 10), pre-fund Runic Seal, Echo Shield, Grounding.
- P0: CAST Fortify → ward 10 HP; funds Runic Seal/Echo Shield/Grounding; pass
- P1: PLAY Arcane Study; attach M → prepared[0]; attach M → prepared[1]; CAST Foretell (prepared[1]) — 2 dmg
- P0: REACT Echo Shield → fully prevented
- P1: pass; attaches VM+M to slot2 (Omen, kicked), M to slot3 (Premonition, kicked), MM to slot4 (new, fully funded); pass (end turn)
> **P0 thinks:** Play Second Wind gambit (+5 HP, free value). Cast Runic Seal — target slot2 (Omen, over-funded with VM+M kicker, biggest identified threat).
- P0: PLAY Second Wind → heal 5 (HP 31)
- P0: CAST Runic Seal → seal Omen [DIV-012] (all 3 kicker components stranded)
- P0: fund Grounding; pass; several quiet exchanges; round 4 ends — level up

## Round 5 (lv5 — L2 UNLOCKS)
> **P0 thinks:** Swap Mana Drain → Phase Shift. Mana Drain never triggered a reaction window across 4 rounds of opponent attach actions (dead-trigger anomaly). Phase Shift is the universal reactive cancel — finally available. (Only 1 replacement offered despite this being a maxSpellLevel level-up round; the level-table comment suggests 2 should apply here — minor discrepancy, not exploited.)
- P0: replace Mana Drain [ABJ-009] with Phase Shift [ABJ-014] → done
- P1: attach M+VM → prepared[0]; CAST Foretell (prepared[1]) — 2 dmg
- P0: (Echo Shield not pre-funded yet this round) — eats the 2 dmg (HP 31)
- P1: heavy funding turn — attaches to slots 1,2,3,4; PLAY Disarm (puts my CMP-SS from hand onto top of MY OWN deck — resource denial, not ward damage); PLAY Scrying Lens
> **P0 thinks:** Ward dropped 10→8 with HP UNCHANGED — confirms Foretell's damage was auto-absorbed by the ward, not my HP (wards intercept automatically; this counts as "prevented" for Reckoning). Fund Runic Seal to seal slot4 (clean fresh MM — likely the newly-prepared Foreclosure, which just entered their kit this round per the L2 unlock).
- P0: CAST Runic Seal → seal FACEDOWN-4
- P0: fund Phase Shift + Echo Shield; pass
- P1: detach M; CAST Omen [DIV-012] (prepared[2])
> **P0 thinks:** React Phase Shift to CANCEL Omen outright — first live reactive cancel of the game.
- P0: REACT Phase Shift → Omen CANCELLED (clean denial: no damage, no seal-slot spent, cost them a full cast-slot + MM funding)
- P1: PLAY Saboteur's Kit — eaten (uncancellable)
- P0: CAST Fortify → ward 10 HP; fund Grounding; pass → P0's doom arrives — Saboteur's Kit: P0 takes 2 (HP 29)
- round 5 ends — level up

## Round 6 (lv6, 6 prepared slots)
> **P0 thinks:** Add Counterbind (6th slot) — second cancel reaction, cheap SM cost with the new-deck SM duals.
- P0: prepare Counterbind [ABJ-015] → done
- P0: PLAY Bulwark Shard → ward 12; CAST Fortify → ward 14
> **P0 thinks:** Fund full denial suite: Runic Seal, Phase Shift (VS+S combo), Counterbind, Echo Shield, Grounding.
- P0: funds all five tools; pass
- P1: attach M → prepared[1]; MM → prepared[0]; M+VSM → prepared[3]; CAST Reclaim [DIV-015] (prepared[3])
> **P0 thinks:** Their deck is down to 1 card — Reclaim is their only remaining refuel engine. Cancel with Counterbind (save Phase Shift for a bigger threat).
- P0: REACT Counterbind → Reclaim CANCELLED
- P0: CAST Runic Seal → seal FACEDOWN-0 (fresh MM, unidentified)
- P1: detach MM; PLAY Sealed Vault (shuffles discard into deck — 1→34!); attach VM → prepared[4]; MM → prepared[5]; CAST Unbind [DIV-019] (prepared[5])
> **P0 thinks:** Unbind destroys a Ward — surely my 14HP one, my Ward Collapse fuel. Cancel with Phase Shift.
- P0: REACT Phase Shift → Unbind CANCELLED (ward saved) — Phase Shift MVP moment #2
- P1: pass; round 6 ends via autoplay-covered filler turns
- P1: PLAY Saboteur's Kit; CAST Foreclosure [DIV-020] (prepared[4]) — P1's slots exhausted AFTER this cast
> **P0 thinks:** Autopilot let this resolve unanswered — I'd already spent Runic Seal+Phase Shift+Counterbind this round on Reclaim/Unbind/slot0. THIS is the answer-economy gap: 3 MM threats (Reclaim, Unbind, Foreclosure) vs 3 answer-uses, and prevention reactions (Echo Shield/Grounding) never trigger against delayed-prophecy damage (established pattern all game) — only cancel-type tools work on dooms.
- prophecy inscribed: 4 dmg in 2 turns (Foreclosure)
- round 6 ends — level up

## Round 7 (lv7)
> **P0 thinks:** KEY FINDING from R6 — P1 cast 3 MM spells in one round; I only had 3 answers and Foreclosure got through. Prevention reactions are dead vs dooms. Swap Grounding for Interrupt (SS reaction, strips a spell's components) — 4th denial tool.
- P0: swap Grounding → Interrupt [ABJ-013] → done
- P1: pass → P0's doom arrives — Saboteur's Kit (2) + Foreclosure (4): P0 takes 6 (HP 23)
- P0: CAST Fortify → ward 16; funds Runic Seal/Counterbind/Phase Shift/Echo Shield
> **P0 thinks:** Far Sight is a FASTER prophecy doom (2dmg at start of my very NEXT turn, faster clock than Omen/Foreclosure's "second turn from now"). Cancel with Counterbind.
- P1: CAST Far Sight [DIV-023] → REACT Counterbind → CANCELLED
- P0: CAST Runic Seal → preemptively seal Foreclosure's slot (before they can even fund it) — guaranteed denial
- P1: attach MM → cast Reclaim → REACT Phase Shift → CANCELLED (no opportunity cost — P1's last slot this round)
- round 7 ends with ZERO doom damage taken — round-7 recap: Omen/Foreclosure/Far Sight/Unbind all denied

## Round 8 (lv8)
- P0: done preparing (kit unchanged) → P1 done
- round-start: "P0 reshuffles discard into deck (#1) — exhaustion 2" — P0 takes 2 dmg (HP 21)
> **P0 thinks:** DECK-OUT MECHANIC — auto-reshuffle discard costs HP. Real cost of my reaction-heavy playstyle burning through resources fast.
- P0: CAST Fortify → ward 18; funds Echo Shield
- P1: CAST Far Sight [DIV-023] — no cancel tools funded yet this round; Echo Shield can't stop delayed prophecy damage (established). Eaten: 2 dmg (HP 19)
- P0: PLAY Arcane Study (bank a Quenching Salts); funds Counterbind + Echo Shield
- P1: CAST Reclaim — let through (deck healthy at 23, low-value to deny)
- P1: attach MM → CAST Unbind [DIV-019] → REACT Counterbind → CANCELLED (ward protected)
- round 8 ends — level up

## Round 9 (lv9)
- P0: done preparing → P1: attach MM → CAST Unbind [DIV-019] — P1 acts FIRST this round, I have ZERO reactions funded (fresh round, hadn't had a turn yet).
> **P0 thinks:** KEY FINDING — my 18HP battery ward destroyed by unanswered Unbind. Real counter to the ward-battery line: going second in a round with no pre-funded reactions is a genuine vulnerability window.
- P0: ward destroyed (wards [3] only remains) — rebuild with Aegis Charm gambit (+3) and Fortify (ward 5)
- P0: CAST Runic Seal → preemptively seal Foreclosure
- P1: CAST Reclaim (P1's last slot, no opportunity cost) → REACT Phase Shift → CANCELLED
- round 9 ends — level up

## Round 10 (lv10 — L3 UNLOCKS)
> **P0 thinks:** LEVEL 10 — Ward Collapse and Reckoning available! Add Ward Collapse (7th slot). Swap Echo Shield (weak vs dooms) for Reckoning — second parallel burst wincon.
- P0: prepare Ward Collapse [ABJ-031]; swap Echo Shield → Reckoning [ABJ-032] → done
- P0: CAST Fortify → ward 7 (growing again); PLAY Second Wind (+5, HP 22)
- P0: CAST Runic Seal → seal Foreclosure
- P1: CAST Foretell — no reaction funded, ward absorbs it (7→5, HP unaffected)
- P0: PLAY Bulwark Shard → ward 7
- P1: CAST Unbind [DIV-019] — no reactions funded (out of components) → ward DESTROYED again (2nd time this game)
- P1: PLAY Saboteur's Kit — eaten; round 10 ends — level up

## Round 11 (lv11)
- P0: CAST Fortify → ward rebuild (5); fund + CAST Runic Seal → seal Unbind (protecting the ward this time)
- P1: CAST Far Sight → REACT Counterbind → CANCELLED. Also noted: P1 hit the SAME deck-out exhaustion mechanic this round (reshuffle, 2 dmg, HP 30→28) — confirms it's symmetric.
- P1: heavy funding turn (Arcane Study, multiple attaches) — Foreclosure fully funded [MM] again
- P0: partial-funds Ward Collapse (SM+SM = 2S, capped short of SSS's 3S under the 2-card-max rule)
- P0: funds + arms Phase Shift for the live Foreclosure threat; round 11 ends — level up

## Round 12 (lv12)
- P0: partial-funds Reckoning
- P1: CAST Foreclosure [DIV-020] — NO reaction funded yet this round (funding resets every round boundary) → unanswered, prophecy inscribed 4 dmg in 2 turns
> **P0 thinks:** Complete Reckoning funding and cast it — testing accumulated prevented-damage burst for the first time.
- P0: CAST Reckoning → **P1 takes 4 damage** (opp HP 28→24) — first offense of the game
- P0: fund + CAST Runic Seal → seal Unbind → P0's doom arrives — Foreclosure: P0 takes 4 (HP 16)
- (autoplay covers several quiet turns, prep swap Absorb↔Counterbind via autopilot)
- deck-out hits again: "P0 reshuffles discard into deck (#2) — exhaustion 4" — **P0 takes 4** (this is where HP crashes)
- 2x Saboteur's Kit played across the stretch; P1 hand cap discards twice
- round 13 begins — HP now 10 after the accumulated chip

## Round 13 (lv13, 4 slots)
- P1: CAST Foretell [DIV-011] — HP critical (10). REACT Absorb (funded [S,SM]) — prevents all 2 dmg AND heals 1 (HP 9→10 net after the eat).
- P1: PLAY Saboteur's Kit → P0's doom arrives: P0 takes 2 (HP 9)
> **P0 thinks:** No opportunity cost to casting Reckoning again (Phase Shift/Interrupt reactions remain armed regardless of my one-spell-per-turn budget).
- P0: CAST Reckoning → **P1 takes 5 damage** (opp HP 24→19) — confirms Reckoning is repeatable/growing, not one-shot
- round 13 ends — level up

## Round 14 (lv14) — THE TURNING POINT
> **P0 thinks:** HP9 vs opp19, critical margin. Swap Absorb back to Counterbind (3rd cancel tool) — surviving multi-threat rounds is now life-or-death.
- P0: swap → done. Fund + CAST Runic Seal → seal Foreclosure preemptively.
- P1: heavy funding turn across 7+ attach actions; PLAY Scrying Lens; **CAST Entropy [DIV-032] (prepared[6])** — MMM cost, L3
> **P0 thinks:** Entropy is a 7-DAMAGE prophecy doom (3 turns) — a doom type NOT SEEN in the old-deck references at all. No cancel funded (out of components). At HP9 this is likely lethal once it lands.
- P0: pass priority → prophecy inscribed: 7 dmg in 3 turns (Entropy)
- P1: CAST Far Sight [DIV-023] → REACT Counterbind → CANCELLED (must-answer at this HP)
- → P0's doom arrives — Entropy: **P0 takes 7 damage (HP 9→2)**
- P1: CAST Unbind [DIV-019] — ward destroyed (3rd ward loss this game); not lethal, HP unaffected, so let it through to save Phase Shift
- round 14 ends — level up

## Round 15 (lv15 — L4 UNLOCKS) — FINAL ROUND
> **P0 thinks:** HP2 is critical. L4 unlocks Absolute Defense (SSSS: "cannot be damaged by spells" for the round) — emergency panic button. Also noting Final Reckoning (4dmg × rounds passed) and Ward Eternal for later, if I survive.
- P0: prepare Absolute Defense [ABJ-039] → done
- P1: CAST Mind Theft [DIV-039] (hand disruption, not damage) — let through, save Phase Shift
- P0: fund Absolute Defense — 2-card cap blocks completing SSSS with SS+S (only 3 of 4 S); need a 2nd double-symbol card
- P1: CAST Unbind — no ward left to lose, let through
> **P0 thinks:** Drew a 2nd CMP-SS! Detach the lone S, attach the SS instead (2×SS = 4S) — fully funds Absolute Defense under the 2-card cap.
- P0: CAST Absolute Defense — **active: immune to spell damage this round; P1 can't play Reactions.**
- P1: attach M → PLAY Saboteur's Kit [GAM-019] — prophecy inscribed: 2 damage in 2 turns
> **P0 thinks:** Saboteur's Kit is a GAMBIT, not a Spell — Absolute Defense's "cannot be damaged by spells" likely does not cover it. No heal available (Second Wind not in hand). Nothing more I can do.
- P0: pass (end turn) / P1: pass (end turn) → P0's doom arrives — Saboteur's Kit: **P0 takes 2 damage (HP 2→0)**

**GAME OVER — P1 (Divination) wins (hp). HP P0: 0, P1: 19. Round 15.**

## Analysis

## Abjuration (piloted) vs Divination (greedy bot), NEW-DECK calibration — seed 6202

**RESULT: LOSS for Abjuration, round 15. Final HP: Abj 0 / Div 19.** Killing sequence: Entropy [DIV-032] (L3, MMM, 7-dmg prophecy — a doom type absent from the old-deck m5-m7 references) dropped HP from 9 to 2 unanswered in round 14; Absolute Defense [ABJ-039] (L4, "cannot be damaged by spells") bought one round of spell-damage immunity in round 15, but the closing blow was Saboteur's Kit — a **Gambit** doom, which bypasses the stack and is not a spell, so it was not covered by Absolute Defense's protection. Final tick: 2 damage into 2 HP.

### Does the skilled-Abj verdict survive the faster doom clock? NO — not with this line.
The old-deck m5-m7 series (3-0 Abj, "arguably Abj-favored") ran on total doom denial funded by Runic Seal → Phase Shift → (eventually) Counterbind, with the bot largely restricted to Omen (2 dmg) and Saboteur's Kit (2 dmg) as its only kill pressure through round 10. This game's new decks changed the math on both sides of the ledger:
- **Assembly speed**: single MM/SM/SS dual cards let Divination fully fund a doom in ONE attach action (vs. needing 2 attaches with the old single-symbol-heavy deck), so a doom can be funded-and-cast in the SAME turn — confirmed repeatedly from round 2 onward.
- **Doom escalation**: Foreclosure (L2, 4 dmg) arrived at level 5 as briefed, landed 2 of 3 times it was live (unanswered in R6 and R12 — the answer-economy gap, see below). Far Sight (L2, 2 dmg, "next turn" — faster clock than Omen/Foreclosure's "second turn") added a third fast doom. **Entropy (L3, MMM, 7 damage)** was the real escalation the old references never faced: it's larger than Omen+Foreclosure combined and only needs L3 (level 10) — arriving exactly when Abjuration also unlocks Ward Collapse/Reckoning, so the two schools' burst tools race each other rather than Abj safely out-teching Divination's damage ceiling.
- **Answer-economy overflow**: Abjuration's per-round denial budget is small and mostly Spell-gated (one cast per turn) — Runic Seal (1/round, proactive only), Phase Shift (1/round, reactive-anything), Counterbind (1/round, reactive M-only), Interrupt (1/round, added lv7, strips fuel). That's at most 3-4 answers/round. Round 6 alone saw Divination cast THREE MM spells (Reclaim, Unbind, Foreclosure) in a single round; spending answers on the first two (ward-protection, resource-denial value) left Foreclosure's 4 dmg unanswered. This is the load-bearing failure mode: the new deck's easier funding lets Divination present more simultaneous threats per round than Abjuration has matching answers for.

### Wincon used: Reckoning (partial), Ward Collapse never fired
- **Reckoning fired twice** for 4 and 5 damage (opp HP 28→24→19) — the ONLY offense dealt all game (9 total damage to Div's 19-HP-remaining total). It is repeatable/growing (not a one-shot), and — critically — its "banked" value can't be destroyed by the opponent the way a ward can.
- **Ward Collapse was NEVER cast.** The ward-battery line was disrupted three separate times by Unbind [DIV-019] (round 9: 18 HP destroyed; round 10: 7 HP destroyed; round 14-adjacent: destroyed again at 0-relevance since I let it go), always landing when I had zero reactions funded (either P1 acting first in a fresh round, or all answers already spent that round). The battery never survived long enough to reach a burst-worthy size, let alone get cast. This directly contradicts the doctrine's framing of Ward Collapse as the reliable closer — against THIS deck, with Unbind recurring in the Divination kit, the ward is a standing liability, not a stored kill, unless the pilot can guarantee a cancel is always pre-armed the instant a new round opens (structurally impossible against a school that alternates going first).

### Denial economics observed (running tally)
Successful denials: Reclaim ×2 (Counterbind, Phase Shift), Unbind ×3 (Counterbind ×2, Phase Shift ×1 — plus 1 intentionally allowed twice when no ward was at risk), Omen ×2 (Phase Shift ×1, Runic Seal ×1 preemptive), Far Sight ×3 (Counterbind ×2, allowed once when unfunded), Foreclosure ×3 (Runic Seal preemptive ×3). That is roughly **13 successful answers across 15 rounds** — a very high hit rate — and it still wasn't enough, because unanswered gaps (Foreclosure R6 unfunded-answers, Foreclosure R12 fresh-round-no-fuel, Entropy R14 completely unseen threat, 2x deck-out exhaustion self-damage, and the final unstoppable gambit) compounded to exactly 30 HP of damage across the game.

### Anomalies / findings for the design log
1. **Mana Drain (ABJ-009) never triggered once** across 4 full rounds of opponent attach actions before being swapped out at level 5. Its "when your opponent attaches a component" reaction window never appeared as a legal action despite dozens of qualifying attach events — looks like a dead/unwired trigger, not merely bad luck. Worth a `grep -rn "Mana Drain\|ABJ-009"` in the effects DSL.
2. **Prophecy/delayed-doom damage is un-mitigable once inscribed.** Across the whole game, no prevention reaction (Echo Shield, Grounding, Absorb) ever got offered a reaction window against Omen/Foreclosure/Far Sight/Entropy's actual damage tick — only the CAST itself (before "prophecy inscribed") is interceptable, via Seal (proactive) or Cancel (reactive). This is consistent but worth stating explicitly as a design fact: Abjuration's whole answer to Divination's doom clock is upstream denial; there is no downstream mitigation once a doom lands.
3. **Absolute Defense ("cannot be damaged by spells") does not stop Gambit damage.** Confirmed by the death: Saboteur's Kit killed through it. This is a real, sharp-edged gap in Abjuration's L4 emergency toolkit specifically against a deck that carries an uncancellable, unsealable Gambit doom (Saboteur's Kit appears to be Neutral/shared, not Divination-exclusive, so this generalizes).
4. **SSSS (L4) spells are hard to fund under the 2-card-max-per-spell rule.** Confirmed same mechanic noted in the m5 reference for SSS (needs a CMP-SS + CMP-S, or two SS-type cards) — but at SSSS the requirement tightens to needing **two double-symbol cards** (e.g., 2× CMP-SS) since 2 cards of 2-symbols-each is the only way to reach 4. A single SS+S combo caps at 3 and cannot be topped up with a 3rd card. This nearly cost me the Absolute Defense play in round 15; I only completed it because I happened to draw a second CMP-SS at the exact right moment.
5. **Component funding resets at every round boundary** unless deliberately detached first, or unless the spell is currently Sealed (in which case the attached components are simply lost/discarded, not returned to hand) — this is the mechanism underneath Runic Seal's "strand mid-assembly fuel" line, and it was reconfirmed twice this game (round 1→2 and round 3→4 transitions both showed sealed-slot investment vanish).
6. **Deck-out reshuffle exhaustion is symmetric and escalating.** Both P0 and P1 hit it this game (P0 twice: 2 dmg then 4 dmg; P1 once: 2 dmg). For Abjuration specifically, the reaction-heavy, every-turn-attach playstyle burns through the resource deck fast — the 2nd P0 exhaustion (4 damage) landed during round 12-13 exactly when HP was already getting thin, compounding the crisis. This is a real, previously-unmeasured cost of "fund everything every turn" denial-heavy play.
7. **Turn order alternates by round parity** (P1 first in odd rounds, P0 first in even rounds, this seed) — this creates a structural vulnerability: any round where the opponent goes first AND I haven't pre-funded a reaction from the prior round (funding resets each round, see #5) leaves a genuine unanswerable window for their opening cast. Two of the three ward-destructions this game (R9, R10) trace directly to this pattern.

### Verdict
The skilled-Abjuration doctrine (deny the doom slot every round, Phase Shift as load-bearing cancel, wards as a battery for Ward Collapse) is still the right SHAPE of play — it produced a 13-for-~16 denial hit rate — but the new decks' easier MM/SS/SM assembly lets Divination present more simultaneous per-round threats than Abjuration's per-round answer budget can cover, and introduces a genuinely bigger doom (Entropy, 7 dmg) that the old-deck references never had to answer. Combined with Unbind repeatedly gutting the ward-battery before it could ever fire, and a Gambit doom that slips past even the best defensive spell in the book, Abjuration lost a game it was playing very well tactically. This is a LOWER BOUND on the losing side's potential (per pilot-gap doctrine) — a different prep/answer allocation (e.g., prioritizing Interrupt/Counterbind earlier, banking Reckoning charge more aggressively for an earlier burst, or accepting ward losses and pivoting fully to Reckoning-only offense) might recover the matchup, but this specific well-piloted attempt did not survive the faster doom clock.
