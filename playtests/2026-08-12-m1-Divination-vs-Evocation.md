# Playtest m1: Divination (P0) vs Evocation (P1) — seed 812 — bot greedy
- P1: prepare Spark [EVO-001]
- P1: prepare Firebolt [EVO-002]
- P1: prepare Burning Hands [EVO-003]
- P1: prepare Searing Word [EVO-004]
- P1: done preparing
> **P0 thinks:** R1 prep 1/4: Omen — start the doom clock immediately; every round it isn't ticking is a round Evo wins for free.
- P0: prepare Omen [DIV-012]
> **P0 thinks:** R1 prep 2/4: Anticipate — Evo will cast 3-5 spells per turn; a prepared reaction that draws + pings on their cast is pure value and the sim bot underuses reactions.
- P0: prepare Anticipate [DIV-014]
> **P0 thinks:** R1 prep 3/4: Foresight — the round-long -1/hit flinch. Against ~4 Evo hits/round it's worth ~3-4 HP per cast; I'll time casts for their heavy turns.
- P0: prepare Foresight [DIV-002]
> **P0 thinks:** R1 prep 4: Foretell — 2 damage + hand intel for one M. The race needs ~3.75 dmg/round average; Foretell + Omen is 4 this round if components allow.
- P0: prepare Foretell [DIV-011]
> **P0 thinks:** R1 prep locked: Omen/Anticipate/Foresight/Foretell. No draw engine yet — betting the natural draw supports 2 casts; will add Premonition once I see hand flow.
- P0: done preparing
- P1: mulligan (shuffle 5 back, draw 4)
    P1 mulligans to 4 cards
- P1: attach Verbal x2 [CMP-VV] → prepared[0]
- P1: attach Verbal [CMP-V] → prepared[1]
- P1: CAST Firebolt [EVO-002] (prepared[1])
    P1 casts Firebolt [EVO-002]
- P1: pass priority
> **P0 thinks:** Can't react (Anticipate unfueled). Lesson already: attach to Anticipate the moment I can — reaction components must be attached before the window.
- P0: pass priority
    P0 takes 3 damage
    → Firebolt [EVO-002] resolves
- P1: pass (end turn)
> **P0 thinks:** Fuel Anticipate before anything else — every future Evo cast should cost them 1 HP and draw me a card.
- P0: attach Material [CMP-M] → prepared[1]
> **P0 thinks:** Saboteur's Kit: free doom, 2 dmg in 2 turns. Clock #1.
- P0: PLAY Saboteur's Kit [GAM-019] (trainer)
    P0 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
> **P0 thinks:** Double-M card fully fuels Omen in one attach.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** Omen cast — clock #2. 4 total scheduled damage now inbound; slot 1 of 2 used.
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
> **P0 thinks:** Pass priority — let Omen resolve.
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
> **P0 thinks:** Fuel Foretell.
- P0: attach Material [CMP-M] → prepared[3]
> **P0 thinks:** Attach-first law: park the spare MM on cast Omen for next round's recast — safe from Searing Word strips there.
- P0: attach Material x2 [CMP-MM] → prepared[0]
> **P0 thinks:** One cast per turn (learned) — Foretell waits. Hand empty = strip-proof. 4 doom damage on their clock, Anticipate live.
- P0: pass (end turn)
- P1: attach Verbal [CMP-V] → prepared[2]
- P1: CAST Spark [EVO-001] (prepared[0])
    P1 casts Spark [EVO-001]
- P1: pass priority
> **P0 thinks:** Anticipate fires: 1 dmg + draw. Flat value — always fire on first cast, refuel next turn.
- P0: REACT with Anticipate [DIV-014] (prepared[1])
    P0 reacts with Anticipate [DIV-014]
- P1: pass priority
- P0: pass priority
    P1 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
> **P0 thinks:** Let Spark resolve; drew CMP-SM off Anticipate.
- P0: pass priority
    P0 takes 2 damage
    → Spark [EVO-001] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
> **P0 thinks:** Foretell: 2 dmg + hand intel, my final turn this round.
- P0: CAST Foretell [DIV-011] (prepared[3])
    P0 casts Foretell [DIV-011]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Foretell [DIV-011] resolves
> **P0 thinks:** Intel: their hand is just Dispelling Powder (anti-ward, dead vs me). Round 1 ledger: me 25, them 27 with 4 doom inbound — effectively 23. Race is even-to-ahead.
- P0: pass (end turn)
> **P0 thinks:** Refuel Anticipate for round 2.
- P0: attach Somatic/Material [CMP-SM] → prepared[1]
> **P0 thinks:** Park VM on Foretell for a round-2 recast. Everything attached, hand empty again.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
> **P0 thinks:** End round 1.
- P0: pass (end turn)
    round 1 ends — level up
> **P0 thinks:** Keep Omen/Anticipate/Foresight/Foretell. Target pace: Omen+Foretell every round = 4 dmg, Anticipate 1/round free, Foresight held for burst turns.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Scrying Lens: free selection — take the better of the top 2.
- P0: PLAY Scrying Lens [ITM-001] (trainer)
    P0 plays Scrying Lens [ITM-001]
> **P0 thinks:** Both M — take one, the other stays on top for next draw.
- P0: choose Material [CMP-M]
> **P0 thinks:** Their attachments were swept too — they can't react right now. Reaction-safe window: cast Foretell immediately over fueling Anticipate (2 guaranteed > 1 + draw in a race).
- P0: attach Material [CMP-M] → prepared[3]
- P0: CAST Foretell [DIV-011] (prepared[3])
    P0 casts Foretell [DIV-011]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Foretell [DIV-011] resolves
> **P0 thinks:** 25-25, 4 doom inbound at their turn start. Their hand still just Dispelling Powder.
- P0: pass (end turn)
- P0: pass (end turn)
    → P1's doom arrives — Saboteur's Kit [GAM-019]
    P1 takes 2 damage
    → P1's doom arrives — Omen [DIV-012]
    P1 takes 2 damage
- P1: attach Verbal [CMP-V] → prepared[1]
- P1: CAST Firebolt [EVO-002] (prepared[1])
    P1 casts Firebolt [EVO-002]
- P1: pass priority
> **P0 thinks:** Dooms landed — 21-25 me after they Firebolt. Race is genuinely close, unlike anything the sim produced.
- P0: pass priority
    P0 takes 3 damage
    → Firebolt [EVO-002] resolves
- P1: pass (end turn)
> **P0 thinks:** Fuel Anticipate for their final cast this round — 1 dmg + draw beats Foresight's ~1 HP saved.
- P0: attach Material [CMP-M] → prepared[1]
- P0: pass (end turn)
- P1: attach Verbal [CMP-V] → prepared[0]
- P1: CAST Spark [EVO-001] (prepared[0])
    P1 casts Spark [EVO-001]
- P1: pass priority
- P0: REACT with Anticipate [DIV-014] (prepared[1])
    P0 reacts with Anticipate [DIV-014]
- P1: pass priority
- P0: pass priority
    P1 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
> **P0 thinks:** Spark resolves (2 to me). They're slot-exhausted; I get a final turn with 1 cast + 1 M in hand.
- P0: pass priority
    P0 takes 2 damage
    → Spark [EVO-001] resolves
    slots exhausted — P0 gets one final turn
- P1: pass (end turn)
- P0: attach Material [CMP-M] → prepared[0]
- P0: attach Material [CMP-M] → prepared[0]
> **P0 thinks:** Omen recast before round end — components would be swept anyway; never bank what you can cast.
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
> **P0 thinks:** Round 2 ends: 20-20 with 2 doom inbound. Round ledger: I dealt 9 (4 doom + 2 Foretell + 2 Anticipate... plus round 1's 4), took 5 this round vs 10 in round 1's pace — their throughput is real but the clock is keeping pace.
- P0: pass (end turn)
    round 2 ends — level up
- P1: prepare Catalyst [EVO-005]
- P1: done preparing
> **P0 thinks:** 5th prep: Premonition. 3 casts/round now needs ~5 M-symbols/round of fuel; draw-2-maybe-3 sustains it. CtT dead while their hand is empty.
- P0: prepare Premonition [DIV-005]
- P0: done preparing
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Verbal/Material [CMP-VM]
- P1: attach Verbal/Material [CMP-VM] → prepared[1]
- P1: CAST Firebolt [EVO-002] (prepared[1])
    P1 casts Firebolt [EVO-002]
- P1: pass priority
> **P0 thinks:** Firebolt #3 — nothing to react with yet this round.
- P0: pass priority
    P0 takes 3 damage
    → Firebolt [EVO-002] resolves
- P1: pass (end turn)
> **P0 thinks:** Draw engine first — Premonition converts 1 M into 2-3 cards to fuel the rest of the turn.
- P0: attach Material [CMP-M] → prepared[4]
- P0: CAST Premonition [DIV-005] (prepared[4])
    P0 casts Premonition [DIV-005]
- P0: pass priority
- P1: pass priority
    → Premonition [DIV-005] resolves
- P0: attach Material [CMP-M] → prepared[3]
- P0: attach Material [CMP-M] → prepared[1]
- P0: pass (end turn)
    → P1's doom arrives — Omen [DIV-012]
    P1 takes 2 damage
- P1: pass (end turn)
- P0: PLAY Arcane Study [GAM-001] (trainer)
    P0 plays Arcane Study [GAM-001]
> **P0 thinks:** Bank SM on top — it's my guaranteed next draw to finish Omen's MM.
- P0: choose Somatic/Material [CMP-SM]
> **P0 thinks:** Half-fuel Omen now; SM banked on deck-top completes it next turn.
- P0: attach Material [CMP-M] → prepared[0]
- P0: CAST Foretell [DIV-011] (prepared[3])
    P0 casts Foretell [DIV-011]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Foretell [DIV-011] resolves
> **P0 thinks:** 17-16 me. Their hand: Empowered Chalk (attach accelerator) — no burst hiding. They passed last turn on fuel drought; the race has flipped my way.
- P0: pass (end turn)
- P0: pass (end turn)
- P1: attach Verbal x2 [CMP-VV] → prepared[0]
- P1: PLAY Empowered Chalk [ITM-007] (trainer)
    P1 plays Empowered Chalk [ITM-007]
- P1: CAST Spark [EVO-001] (prepared[0])
    P1 casts Spark [EVO-001]
- P1: pass priority
> **P0 thinks:** Anticipate on their Spark again.
- P0: REACT with Anticipate [DIV-014] (prepared[1])
    P0 reacts with Anticipate [DIV-014]
- P1: pass priority
- P0: pass priority
    P1 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
> **P0 thinks:** Anticipate's draw pulled the banked SM — Omen completes this turn.
- P0: pass priority
    P0 takes 3 damage
    → Spark [EVO-001] resolves
- P1: pass (end turn)
- P0: PLAY Saboteur's Kit [GAM-019] (trainer)
    P0 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P1: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
- P0: attach Somatic/Material [CMP-SM] → prepared[0]
> **P0 thinks:** Omen #3. Two dooms ticking again (4 scheduled).
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: CAST Burning Hands [EVO-003] (prepared[2])
    P1 casts Burning Hands [EVO-003]
- P1: pass priority
> **P0 thinks:** Burning Hands resolves (2 + burn markers, most likely) — can't react, Anticipate spent this round.
- P0: pass priority
    P0 takes 1 damage
    → Burning Hands [EVO-003] resolves
- P1: pass (end turn)
    round 3 ends — level up
> **P0 thinks:** R4 plan: Foresight early (blunt their 3-cast round), Omen + Foretell for the clock, Anticipate refuel. Need ~5 M-symbols.
- P0: done preparing
- P1: done preparing
    P0 burns for 1
    P0 takes 1 damage
- P0: attach Material [CMP-M] → prepared[2]
> **P0 thinks:** Foresight cast FIRST-seat, before all 3 of their casts this round — worth ~3 HP, the timing play the sim bot provably misses.
- P0: CAST Foresight [DIV-002] (prepared[2])
    P0 casts Foresight [DIV-002]
- P0: pass priority
- P1: pass priority
    → Foresight [DIV-002] resolves
> **P0 thinks:** Foresight's scry: take the MM — single-card Omen fuel.
- P0: choose Material x2 [CMP-MM]
> **P0 thinks:** Omen fueled for next turn's cast (one cast/turn — Foresight was this turn's).
- P0: attach Material x2 [CMP-MM] → prepared[0]
- P0: pass (end turn)
    → P1's doom arrives — Saboteur's Kit [GAM-019]
    P1 takes 2 damage
    → P1's doom arrives — Omen [DIV-012]
    P1 takes 2 damage
- P1: attach Verbal x2 [CMP-VV] → prepared[1]
- P1: CAST Firebolt [EVO-002] (prepared[1])
    P1 casts Firebolt [EVO-002]
- P1: pass priority
> **P0 thinks:** Dooms landed: 11 for them. Firebolt into Foresight = 2 instead of 3.
- P0: pass priority
    P0 takes 2 damage
    → Firebolt [EVO-002] resolves
- P1: pass (end turn)
- P0: attach Material [CMP-M] → prepared[1]
> **P0 thinks:** Omen #4. They're at 11 with 2 more scheduled.
- P0: CAST Omen [DIV-012] (prepared[0])
    P0 casts Omen [DIV-012]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 2 damage in 2 turns (Omen [DIV-012])
    → Omen [DIV-012] resolves
- P0: pass (end turn)
- P1: attach Verbal [CMP-V] → prepared[0]
- P1: CAST Spark [EVO-001] (prepared[0])
    P1 casts Spark [EVO-001]
- P1: pass priority
- P0: REACT with Anticipate [DIV-014] (prepared[1])
    P0 reacts with Anticipate [DIV-014]
- P1: pass priority
- P0: pass priority
    P1 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
> **P0 thinks:** 10-10 after Anticipate. Spark resolving into Foresight's -1.
- P0: pass priority
    P0 takes 1 damage
    → Spark [EVO-001] resolves
- P1: pass (end turn)
> **P0 thinks:** VM fuels Foretell; hold the VSM in hand — attachments sweep at round end but hand persists, and nothing else can cast this round.
- P0: attach Verbal/Material [CMP-VM] → prepared[3]
- P0: CAST Foretell [DIV-011] (prepared[3])
    P0 casts Foretell [DIV-011]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Foretell [DIV-011] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** 9-8 me, 2 doom inbound. Their final turn of the round — Burning Hands into Foresight, then round 5.
- P0: pass (end turn)
    → P1's doom arrives — Omen [DIV-012]
    P1 takes 2 damage
- P1: attach Verbal/Material [CMP-VM] → prepared[2]
- P1: CAST Burning Hands [EVO-003] (prepared[2])
    P1 casts Burning Hands [EVO-003]
- P1: pass priority
- P0: pass priority
    → Burning Hands [EVO-003] resolves
- P1: pass (end turn)
    round 4 ends — level up
- P1: replace Spark [EVO-001] with Inferno Lance [EVO-011]
- P1: replace Firebolt [EVO-002] with Hex Bolt [EVO-012]
- P1: done preparing
> **P0 thinks:** Premonition out, Foreclosure in. Lethal math: Foreclosure 4 + Foretell 2 + Anticipate 1 vs their 6 HP; Omen as insurance. Foresight stays to survive their Lance turns.
- P0: replace Premonition [DIV-005] with Foreclosure [DIV-020]
- P0: done preparing
- P1: attach Verbal x2 [CMP-VV] → prepared[0]
- P1: CAST Inferno Lance [EVO-011] (prepared[0])
    P1 casts Inferno Lance [EVO-011]
- P1: pass priority
> **P0 thinks:** Lance for 4 — taking it. Burn hasn't ticked yet this round display-wise; expect to be ~4-5 after.
- P0: pass priority
    P0 takes 4 damage
    → Inferno Lance [EVO-011] resolves
- P1: pass (end turn)
    P0 burns for 1
    P0 takes 1 damage
> **P0 thinks:** Foresight before their two remaining casts. The doom-timing line: Foreclosure on my next turn fires at round 6 turn-1 START — they die before acting if I get them to ≤4.
- P0: attach Verbal/Material [CMP-VM] → prepared[2]
- P0: CAST Foresight [DIV-002] (prepared[2])
    P0 casts Foresight [DIV-002]
- P0: pass priority
- P1: pass priority
    → Foresight [DIV-002] resolves
> **P0 thinks:** Take the M: VSM + M = Foreclosure's MM next turn. That's the kill card; Anticipate goes hungry.
- P0: choose Material [CMP-M]
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[4]
> **P0 thinks:** Foreclosure fully fueled for next turn.
- P0: attach Material [CMP-M] → prepared[4]
- P0: pass (end turn)
- P1: attach Verbal [CMP-V] → prepared[1]
- P1: pass (end turn)
> **P0 thinks:** Foreclosure: 4 dmg doom. Ticks their next turn, FIRES the turn after — with Anticipate+Foretell chip, they're dead before casting that turn.
- P0: CAST Foreclosure [DIV-020] (prepared[4])
    P0 casts Foreclosure [DIV-020]
- P0: pass priority
- P1: pass priority
    prophecy inscribed on P1: 4 damage in 2 turns (Foreclosure [DIV-020])
    → Foreclosure [DIV-020] resolves
> **P0 thinks:** SM fuels Anticipate for their Hex Bolt.
- P0: attach Somatic/Material [CMP-SM] → prepared[1]
- P0: pass (end turn)
- P1: attach Verbal [CMP-V] → prepared[1]
- P1: CAST Hex Bolt [EVO-012] (prepared[1])
    P1 casts Hex Bolt [EVO-012]
- P1: pass priority
> **P0 thinks:** Anticipate → them 5, doom 4 at their next turn start. Foretell on my turn makes it lethal-guaranteed.
- P0: REACT with Anticipate [DIV-014] (prepared[1])
    P0 reacts with Anticipate [DIV-014]
- P1: pass priority
- P0: pass priority
    P1 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
> **P0 thinks:** Hex Bolt resolves into Foresight. Drew Disarm off Anticipate — but no M for Foretell yet.
- P0: pass priority
    P0 takes 2 damage
    → Hex Bolt [EVO-012] resolves
- P1: pass (end turn)
- P0: attach Material [CMP-M] → prepared[3]
> **P0 thinks:** Foretell for the setup: 5→3, then Foreclosure's 4 fires at their turn start. Checkmate unless they hold a trick with zero attached components.
- P0: CAST Foretell [DIV-011] (prepared[3])
    P0 casts Foretell [DIV-011]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Foretell [DIV-011] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** They're at 3 with 4 inbound at turn start. Their "final turn" begins with the doom.
- P0: pass (end turn)
    → P1's doom arrives — Foreclosure [DIV-020]
    P1 takes 4 damage
    GAME OVER — P0 wins (hp)

**Result:** P0 wins (hp), round 5.

## Analysis

## PILOTED VALIDATION: Div (Claude-piloted) def. greedy Evocation — round 5, 2 HP left (seed 812)

The standing question from the balance journal — "is the Evo–Div 30–0 wall real, or a bot
artifact?" — gets its first piloted data point: **Divination won on the first attempt**,
against the same greedy horizon-2 bot that went 240-0 against bot-piloted Div. The wall is
substantially a PILOTING gap, not (only) a card gap.

### The winning lines, mapped to known bot blind spots
1. **Doom clock from turn 1, never idle.** Saboteur's Kit x2 + Omen x4 + Foreclosure — some
   scheduled damage was in flight on almost every enemy turn. Total doom damage: 16 of the 31
   dealt. The bot pilots underprep Omen (ledger #3, fixed) but still undercast it vs Evo.
2. **Anticipate as a value engine (ledger-adjacent: reaction pricing).** Fired every single
   round (5/5): 5 damage + 5 draws for 5 M. The draws twice delivered exactly the card the
   turn needed (banked SM for Omen; the M that became the lethal Foretell). The sim's Div
   NEVER got this: at horizon 1 reactions were invisible; at horizon 2 they express but
   aren't sequenced around.
3. **Foresight cast FIRST-SEAT before the enemy round (exp-4b's diagnosed gap, exploited).**
   Both casts came before 3+ enemy hits and saved ~4-5 HP total. I won with 2 HP. The exp-4b
   revert note said "a 1-ply bot undervalues round-long defense cast from the second seat" —
   a human sequencing it first-seat gets full value.
4. **Doom timing as checkmate geometry (ledger #5, the horizon gap).** The kill was arranged
   so Foreclosure fired at the START of their turn: they were dead before their action. The
   greedy rollout literally cannot see this — the payoff is 2+ turn-boundaries out.
5. **Attach-first economy.** Hand kept at 0-1 all game (strip-proof), components parked on
   the spells that would cast them the same round after learning round-end sweep the hard way
   (~4 components lost to the R1 sweep — new-player trap worth a UI hint someday).
6. **Evo's fuel droughts are real and exploitable.** The bot passed 2-3 full turns with an
   empty hand, top-decking; its 4-5 dmg/round early pace bought my clock the time it needed.
   Its round-5 curve-jump (Inferno Lance + Hex Bolt swap-ins) nearly closed the game — 9→4 HP
   in two casts — but one round too late.

### Scoreboard vs the sim's picture
Bot-piloted Div vs greedy Evo: 0-240 lifetime, avg loss round 5.5. Piloted: 1-0, win round 5
(the same round the sim says Div DIES). Same engine, same opponent, same deck.

### What this does NOT prove
One game, one seed, and a razor-thin 2-HP margin. It does not prove Div FAVORED vs Evo —
it proves the matchup is playable at human level, i.e. the 100% number is a measurement
ceiling of the greedy pilot, not a property of the cards. The exp-7 conclusion ("systemic
surgery needed") should be downgraded to "piloted winrate unknown, plausibly 30-50%".

### Follow-ups this suggests
1. 2-3 more piloted games (different seeds; try one where Evo doesn't brick fuel) before any
   systemic lever (start-HP asymmetry etc.) is touched. Current read: no surgery needed.
2. The ISMCTS promotion criterion (playtests/blindspot plan 3c) just got its motivating
   example: every winning line above is lookahead, exactly what search should find and greedy
   can't. Re-test search-vs-greedy on THIS matchup specifically.
3. Ladder implication: solo players piloting Div vs the hard (greedy) Evo bot have a real
   game — the matchup is not the auto-loss the sim table implies.
4. Card notes: Anticipate may be undercosted at M (fired 5/5 rounds for 5 dmg + 5 cards —
   watch it in PvP); Foreclosure's turn-start firing is the kill-geometry enabler and feels
   excellent to pilot; Foresight's exp-4 defensive rider earned its slot exactly as designed.
