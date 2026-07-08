# Playtest m1: Evocation (P0) vs Divination (P1) — seed 1301
> **P0 thinks:** Evo R1 vs Div: race + setup-tax plan. Firebolt first — 3 for V is the best rate in the L1 book; the random self-discard is cheapest now while the hand is full of interchangeable fuel.
- P0: prepare Firebolt [EVO-002]
> **P0 thinks:** Volatile Bolt is THE anti-Div tech: every Div spell costs M, so each fueling attach risks feeding the trap 2 face damage. Even unsprung it taxes their tempo — they must play around it all game.
- P0: prepare Volatile Bolt [EVO-015]
> **P0 thinks:** Searing Word: 2 damage AND snipes a random component from their hand — direct attack on Div's M economy, which is also their Volatile Bolt workaround budget.
- P0: prepare Searing Word [EVO-004]
> **P0 thinks:** 4th slot: Backdraft over Burning Hands — Div MUST cast spells to function (draw engines, Foretell), and 2 free damage per enemy cast out-races 1 burn tick vs a school with no wards to chip.
- P0: prepare Backdraft [EVO-013]
- P0: done preparing
> **P1 thinks:** Div R1 vs Evo: this is the triangle's bad matchup — no wards, so the plan is Kit-prophecy pressure + stings while digging to the R5 doom spells. Foretell is the only prepared damage; its intel also scouts which traps Evo prepared.
- P1: prepare Foretell [DIV-011]
> **P1 thinks:** Anticipate: the card-neutral sting. Against burn tempo every reaction that trades up matters.
- P1: prepare Anticipate [DIV-014]
> **P1 thinks:** Insight: draw 2 for M — dig for Saboteur's Kits, the only prophecy source until L2 unlocks at round 5.
- P1: prepare Insight [DIV-001]
> **P1 thinks:** Premonition over Omen for the 4th: raw velocity beats M-sculpting when the clock is Evo burn — need Kits and fuel NOW.
- P1: prepare Premonition [DIV-005]
- P1: done preparing
> **P0 thinks:** Single V onto the Volatile Bolt trap FIRST — it must sit fueled before Div's first fueling turn. Their entire book is M-cost; every attach now risks 2 face damage.
- P0: attach Verbal [CMP-V] → prepared[1]
> **P0 thinks:** VS onto Backdraft (S is dead weight in this book) — react-ready before their first cast.
- P0: attach Verbal/Somatic [CMP-VS] → prepared[3]
> **P0 thinks:** VM fuels Firebolt (M is the wasted symbol either way at Evo L1). Cast it this turn; keep both VVs for Searing Word + R2 refuel.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
> **P0 thinks:** Firebolt: 3 to face. Div has no fueled reaction yet (R1, no prior turn) — free window.
- P0: CAST Firebolt [EVO-002] (prepared[0])
    P0 casts Firebolt [EVO-002]
> **P0 thinks:** BUG FINDING: legalActions offers "REACT with Backdraft" in MY OWN cast's reaction window — its text is opponent-cast-triggered ("When your opponent casts a spell, deal 2 damage"). If the effect resolves as written it is 2 free damage in any window, own casts included. Classic trigger-condition-not-checked-in-castReaction pattern. NOT exploiting; passing.
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Firebolt [EVO-002] resolves
> **P0 thinks:** 27-30 after one cast (Firebolt's self-discard ate a VV — the real cost). Hold the last VV; Searing Word fires next turn.
- P0: pass (end turn)
> **P1 thinks:** Div T1: Evo pre-fueled two face-down slots before casting — assume Volatile Bolt and/or Backdraft. Scrying Lens first: trainer plays don't attach, so it's trap-immune value while I decide how to eat the M-attach tax.
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Material [CMP-M]
> **P1 thinks:** Spring the suspected trap on MY schedule with the cheapest card: single M onto Insight. If Volatile Bolt is armed I take 2 now — then every later attach this round is free.
- P1: attach Material [CMP-M] → prepared[2]
    P0 reacts with Volatile Bolt [EVO-015]
    P1 takes 2 damage
    → Volatile Bolt [EVO-015] resolves
> **P1 thinks:** Trap spent — free fueling window. MM arms Anticipate for a sting in his next cast window.
- P1: attach Material x2 [CMP-MM] → prepared[1]
> **P1 thinks:** Spare M onto Foretell — next turn's cast pre-paid; attached fuel is also safe from Searing Word's random hand-discard.
- P1: attach Material [CMP-M] → prepared[2]
> **P1 thinks:** Misattach (pilot error, same failure mode as cvc10/12 logs) — take the second M back off Insight.
- P1: detach Material [CMP-M]
> **P1 thinks:** M onto Foretell [0] this time — next turn's damage pre-paid.
- P1: attach Material [CMP-M] → prepared[0]
> **P1 thinks:** Cast Insight: dig 2 for Kits. Backdraft threat noted — but Div cannot win without casting; the 2-per-cast tax is just the matchup.
- P1: CAST Insight [DIV-001] (prepared[2])
    P1 casts Insight [DIV-001]
> **P1 thinks:** (Same legality quirk mirrored: Anticipate offered against my own Insight. Passing.)
- P1: pass priority
> **P0 thinks:** Backdraft fires on the intended trigger (opponent's cast). Flat 2, no better window exists later — every Div cast this game pays the cast-tax.
- P0: REACT with Backdraft [EVO-013] (prepared[3])
    P0 reacts with Backdraft [EVO-013]
> **P1 thinks:** Sting now — m10's refuel-tax lesson: reaction fuel strands at round end, so guaranteed value now beats hoping for a second window. LIFO: Anticipate resolves before Backdraft.
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P1: pass priority
- P0: pass priority
    P1 takes 2 damage
    → Backdraft [EVO-013] resolves
- P1: pass priority
- P0: pass priority
    → Insight [DIV-001] resolves
> **P1 thinks:** Insight drew fuel, no Kits. Slot 2 goes to Premonition (dig deeper) — racing Evo at L1 from 6 down is chess I lose; card velocity into Kits/R5 dooms is the only line. Fueling it.
- P1: attach Material [CMP-M] → prepared[3]
> **P1 thinks:** Take the M back OFF Foretell — it can't be cast this round (both slots spoken for) and attached components discard at round end; in hand it survives into R2. The refuel-tax bookkeeping IS the skill.
- P1: detach Material [CMP-M]
- P1: pass (end turn)
> **P0 thinks:** Evo T2: single V fuels Searing Word — spend the exact cost, bank the VV for R2.
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** Searing Word: 2 face + snipe a random component from their 5-card hand of pure fuel. Their Anticipate is spent — free window.
- P0: CAST Searing Word [EVO-004] (prepared[2])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Searing Word [EVO-004] resolves
    slots exhausted — P1 gets one final turn
> **P0 thinks:** 21-29 after R1's casts. Slots done; bank the VV in hand for R2 (it survives, attached fuel wouldn't).
- P0: pass (end turn)
> **P1 thinks:** Final R1 slot: Premonition digs 2-3. Still zero Saboteur's Kits seen — the L1 doom gap means these dig turns are Div's whole early game.
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
- P0: pass priority
    → Premonition [DIV-005] resolves
> **P1 thinks:** R1 ends 21-29. Div dug 7 cards deep this round and found ZERO payoff — hand is literally 7 components. The L1 doom gap in one image: velocity with nothing to find.
- P1: pass (end turn)
    round 1 ends — level up
> **P1 thinks:** Keep the loadout — nothing at L1 changes the plan. (Round leader alternated to Div this round.)
- P1: done preparing
> **P0 thinks:** Evo keeps the R1 kit — it produced 8 damage/round with a rearming trap+tax engine.
- P0: done preparing
> **P1 thinks:** Div leads R2 — Evo's trap/Backdraft are dry until his turn. Fuel EVERYTHING in the free window: this alternating-lead rhythm is Div's only safe fueling in the matchup.
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: attach Material [CMP-M] → prepared[2]
- P1: attach Material [CMP-M] → prepared[3]
> **P1 thinks:** All four fueled tax-free. Cast Foretell in the same safe window — Backdraft is dry, so this is Div's one untaxed damage spell of the round. 2 face + peek at his hand.
- P1: CAST Foretell [DIV-011] (prepared[0])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
> **P1 thinks:** Intel: his hand is one VV — enough to rearm exactly two of trap/Backdraft/spells. 21-27 and Div is fully fueled; the round-leader window did its job.
- P1: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Evo T2: V→Firebolt. Sequencing trick: attach BOTH cards before casting so Firebolt's random self-discard hits an empty hand — the drawback evaporates.
- P0: attach Verbal [CMP-V] → prepared[0]
> **P0 thinks:** VV arms Backdraft — their last dig slot this round pays the 2-tax. Trap stays dry: they're already fueled, so it has nothing to catch until R3.
- P0: attach Verbal x2 [CMP-VV] → prepared[3]
- P0: CAST Firebolt [EVO-002] (prepared[0])
    P0 casts Firebolt [EVO-002]
- P0: pass priority
> **P1 thinks:** Sting the Firebolt — same refuel-tax logic as R1: armed fuel must convert before round end.
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
> **P0 thinks:** Backdraft their Anticipate — a Reaction is still an opponent cast (intended trigger). Guaranteed 2 now over taxing a cast they might sandbag.
- P0: REACT with Backdraft [EVO-013] (prepared[3])
    P0 reacts with Backdraft [EVO-013]
- P1: pass priority
- P0: pass priority
    P1 takes 2 damage
    → Backdraft [EVO-013] resolves
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Firebolt [EVO-002] resolves
> **P0 thinks:** Stack fully unwound: 16-26. The full exchange cost Div 5 HP to deal 1 — Backdraft turned their sting into a losing trade.
- P0: pass (end turn)
> **P1 thinks:** Hold Sealed Vault (recycles discard — late-game deckout insurance, worthless at 25 deck). Backdraft is spent, so the dig is tax-free: Premonition again.
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
- P0: pass priority
    → Premonition [DIV-005] resolves
    slots exhausted — P0 gets one final turn
> **P1 thinks:** 14 cards seen, zero Saboteur's Kits — the whole round was setup for nothing. Detach Insight's M back to hand before it strands (slots are spent; it can't be cast).
- P1: detach Material [CMP-M]
- P1: pass (end turn)
> **P0 thinks:** Evo's final R2 slot: VSM covers Searing Word's V. Their hand is 10 deep in fuel — the component snipe is guaranteed value.
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[0]
> **P0 thinks:** Pilot error #2 (index misread): VSM went to the spent Firebolt slot. Detach.
- P0: detach Verbal/Somatic/Material [CMP-VSM]
- P0: attach Verbal/Somatic/Material [CMP-VSM] → prepared[2]
- P0: CAST Searing Word [EVO-004] (prepared[2])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Searing Word [EVO-004] resolves
> **P0 thinks:** R2 closes 14-26. Evo's engine: ~7/round with zero risk. Div's whole round of digging produced fuel it can't convert into pressure.
- P0: pass (end turn)
    round 2 ends — level up
> **P0 thinks:** L3: 5th slot + 3 casts/round. Spark — clean 2 for V, keeps the kill math simple. Div is at 14; three casts/round ends this by R4.
- P0: prepare Spark [EVO-001]
- P0: done preparing
> **P1 thinks:** 5th slot is a shrug: Div's ENTIRE L1 book is card-flow — Recover/Refocus are fuel bookkeeping, zero defense, zero damage. Nothing here changes the race. Omen for the M-sculpt.
- P1: prepare Omen [DIV-012]
- P1: done preparing
> **P0 thinks:** Evo leads R3 but drew only 1 fuel — the refuel tax bites the aggressor too. VM→Firebolt, empty-hand cast again.
- P0: attach Verbal/Material [CMP-VM] → prepared[0]
- P0: CAST Firebolt [EVO-002] (prepared[0])
    P0 casts Firebolt [EVO-002]
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Firebolt [EVO-002] resolves
- P0: pass (end turn)
> **P1 thinks:** FIRST Kit at 16 cards deep, round 3, 11 HP. In cvc12 the Div opener held TWO of these — that variance gap is the whole matchup story. 2-in-2 inscribed.
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    prophecy inscribed on P0: 2 damage in 2 turns (Saboteur's Kit [GAM-019])
> **P1 thinks:** Evo's hand is empty — trap and Backdraft both dry. Free window: fuel Foretell + Anticipate.
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[0])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
> **P1 thinks:** 24-11 with a 2-doom ticking. Div's best-case round still loses the race — Evo has 2 casts left this round to my 2.
- P1: pass (end turn)
> **P0 thinks:** V→Searing Word: 2 face + strip a component. Their Anticipate is armed; the sting trade is acceptable when they're the one on a clock.
- P0: attach Verbal [CMP-V] → prepared[2]
- P0: CAST Searing Word [EVO-004] (prepared[2])
    P0 casts Searing Word [EVO-004]
- P0: pass priority
> **P1 thinks:** Sting the Searing Word — fuel converts now or strands. Backdraft is dry so the sting is finally untaxed.
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Searing Word [EVO-004] resolves
> **P0 thinks:** 9-23. Div's under 10 with a round and a half to survive before L2 even unlocks.
- P0: pass (end turn)
> **P1 thinks:** Play out one more beat to watch the doom land, then call it — the diagnostic is complete.
- P1: attach Material [CMP-M] → prepared[0]
> **P1 thinks:** Pilot error #3 (index shift between listings — recurring CLI ergonomics friction, same as cvc10/12). Detach, re-aim at Insight.
- P1: detach Material [CMP-M]
- P1: attach Material [CMP-M] → prepared[2]
- P1: CAST Insight [DIV-001] (prepared[2])
    P1 casts Insight [DIV-001]
- P1: pass priority
- P0: pass priority
    → Insight [DIV-001] resolves
> **P1 thinks:** Insight: 2 more cards, still no second Kit (a Disarm, at least interactive). End turn — the doom lands on his upkeep.
- P1: pass (end turn)
    → P0's doom arrives — Saboteur's Kit [GAM-019]
    P0 takes 2 damage
- P0: attach Verbal [CMP-V] → prepared[4]
- P0: CAST Spark [EVO-001] (prepared[4])
    P0 casts Spark [EVO-001]
- P0: pass priority
- P1: pass priority
    P1 takes 2 damage
    → Spark [EVO-001] resolves
    slots exhausted — P1 gets one final turn

**Result:** (in progress)

## Analysis

CALLED at end of R3: Evocation 21, Divination 7 — Div dies mid-R4 at current pace, a full round before L2 spells (and therefore ANY prophecy spell) unlock. VERDICT: with both sides piloted well, Evo>Div is a STOMP, not the intended soft counter. The 91.6% bot matrix number is corroborated, and unlike Abj-vs-Evo (where piloting flips the bot read), piloting does NOT soften this edge — good play on both sides WIDENED it, because Evo's taxes punish exactly the things good Div play does more of.

WHY IT'S STRUCTURAL (three stacked taxes, all L1, all V-cheap):
(1) Volatile Bolt taxes ATTACHING — Div's entire book is M-cost, so its fuel economy feeds the trap. Even the optimal counterplay (spring it on schedule with the cheapest M, then fuel freely) concedes 2/round plus tempo distortion. (2) Backdraft taxes CASTING — Div must cast draw engines to function, so the 2-per-cast tax converts Div's velocity into Evo damage; Div's Anticipate sting trades INTO it (R2's full exchange: Div spent 5 HP to deal 1). (3) Searing Word taxes the HAND — random component strips attack the fuel bank the other two taxes force Div to hold. Net: ~7-8 damage/round for Evo with near-zero risk, while Div's best-case rounds produce 2-3 damage and card flow toward nothing.

THE L1 DOOM GAP TURNS A COUNTER INTO A ROUT: Div saw 16+ cards before finding its FIRST Saboteur's Kit (R3, at 11 HP); cvc12's healthy Div-vs-Abj read had two Kits in the opener — that variance IS Div's early game. The L1 Divination book is 100% card-flow/sculpt: no defense of any kind, no damage beyond Foretell-2/Anticipate-1, no prophecy source. Every dig turn that whiffs on Kits is a pass. Against Abj's slow wall game that's survivable; against Evo's clock it's fatal before the school's identity comes online.

MECHANICS VERIFIED LIVE: prophecy inscribe/tick/arrival works cleanly vs a wardless target (2 straight to face on schedule); round-lead alternation + the refuel tax produce a real emergent rhythm — the round LEADER fuels tax-free before the opponent can re-arm traps/reactions (both sides exploited this correctly); the refuel tax also bit the aggressor (Evo's R3 one-fuel draw slowed the kill by nearly a round).

BUG FOUND (not exploited): legalActions offers castReaction with NO trigger-condition check — Backdraft ("when your OPPONENT casts") was offered in my own cast's reaction window, Anticipate likewise vs its owner's casts. If the effect resolves as written this is free damage in any window; even if benign it's a misleading option. Matches the known SIMPLIFIED/proxy-condition bug pattern — suspect castReaction legality.

TOOLING FRICTION: three pilot misattach errors this match purely from action indices shifting between listings (same failure mode noted in cvc10/cvc12) — the detach take-back recovered all three, but stable action addressing would remove the noise.

RECOMMENDATIONS: (a) The cvc12 Omen [DIV-012] → L1 starter-doom conversion ("Prophecy — deal 2 at the start of your opponent's second turn from now", cost M) is now URGENT rather than optional: it decouples Div's early game from Kit variance and puts a guaranteed clock into every Div opener. Re-pilot THIS matchup after the change before considering anything further. (b) Fix the castReaction trigger-condition bug. (c) Reconcile the bot matrix's Div>Abj 99.4% (n=500) against cvc12's cited ~56% (n=40) — one of deck config, rules drift, or sample size is lying. (d) Only if post-Omen Evo-Div still reads >75-25 piloted: consider whether Div's L1 book needs one defensive tool; do not pre-empt.

## CORRECTION (same day, post-match)

Two of this log's structural findings are WRONG — discovered while implementing the recommendations:

1. **The "L1 doom gap" was already fixed before this match was played.** Omen [DIV-012] became the
   L1 starter doom (Prophecy — 3 damage in 2 turns, cost M) in commit c0bc734 (the mill-removal
   rework), implementing exactly the cvc12 recommendation (at 3 damage, not 2). The pilot mis-modeled
   Omen as its OLD look-4-take-M text from the cvc12-era notes: it was prepared in R3 and never cast.
   Div therefore played this entire match without its primary L1 win-condition tool.
2. **The 21-7 stomp verdict is accordingly INVALID** — it measures a Div pilot missing its main
   weapon, not the matchup. Superseded by the m2 re-pilot (see
   `2026-07-08-m2-evo-div-recheck` log) played with correct Omen usage AND the castReaction
   trigger fix this match's bug finding produced.

Findings that STAND: the three-tax structure read (Volatile Bolt / Backdraft / Searing Word), the
round-leader free-fueling-window rhythm, prophecy tick mechanics verified vs a wardless target, and
the castReaction bug (fixed 2026-07-08: reactions now legal only against an opponent-controlled
top-of-stack item — legal.ts + apply.ts + 3 regression tests).
