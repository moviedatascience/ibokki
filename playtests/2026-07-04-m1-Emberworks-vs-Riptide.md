# Playtest m1: Emberworks (P0) vs Riptide (P1) — seed 909
> **P1 thinks:** Div plan vs Evo: Foretell every round is my damage axis + hand intel (now real!); Anticipate as a fueled reaction sting; Insight/Premonition for velocity. No wards in this school — I race and grind exhaustion, I can't block.
- P1: prepare Foretell [DIV-011]
- P1: prepare Anticipate [DIV-014]
- P1: prepare Insight [DIV-001]
- P1: prepare Premonition [DIV-005]
- P1: done preparing
> **P0 thinks:** Evo plan vs ward-less Div: burn is unanswerable (Riptide carries no Quenching). Kindle + Burning Hands as the persistent clock, Spark/Firebolt as direct reach.
- P0: prepare Kindle [EVO-006]
- P0: prepare Burning Hands [EVO-003]
- P0: prepare Spark [EVO-001]
- P0: prepare Firebolt [EVO-002]
- P0: done preparing
> **P1 thinks:** Div T1: Lens for selection, then fuel Foretell (cast) AND pre-fuel Anticipate — reactions need their cost attached ahead of the window.
- P1: PLAY Scrying Lens [ITM-001] (trainer)
    P1 plays Scrying Lens [ITM-001]
- P1: choose Saboteur's Kit [GAM-019]
- P1: PLAY Saboteur's Kit [GAM-019] (trainer)
    P1 plays Saboteur's Kit [GAM-019]
    P0 mills 3
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Verbal/Material [CMP-VM] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[0])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
> **P1 thinks:** BUG FOUND (tooling): Foretell's reveal is pending but renderDecision doesn't display the revealed candidates — the intel is invisible to an MCP/CLI pilot. Client UI unaffected. Fix render.ts after this match.
- P1: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: attach Verbal/Somatic/Material [CMP-VSM] → prepared[3]
- P1: pass (end turn)
> **P0 thinks:** Evo T1: Kindle first (burn clock is unanswerable — Div has no wards/cleanse). Recharge grabs a VV for later ramp. NOTE: Dispelling Powder is a DEAD card all game in this matchup.
- P0: PLAY Recharge [GAM-004] (trainer)
    P0 plays Recharge [GAM-004]
- P0: choose Verbal x2 [CMP-VV]
    P0 searches out Verbal x2 [CMP-VV]
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: CAST Kindle [EVO-006] (prepared[0])
    P0 casts Kindle [EVO-006]
- P0: pass priority
> **P1 thinks:** Anticipate isn't a counter — flat draw+sting — so fire it for tempo; Kindle resolves anyway.
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P0: pass priority
- P1: pass priority
    → Kindle [EVO-006] resolves
- P0: attach Verbal x2 [CMP-VV] → prepared[2]
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
> **P1 thinks:** Detach MM first — attached components are discarded at round end, and casting Premonition (my last slot) will end the round. Banking the MM to hand for round 2.
- P1: detach Material x2 [CMP-MM]
- P1: CAST Premonition [DIV-005] (prepared[3])
    P1 casts Premonition [DIV-005]
- P1: pass priority
- P0: pass priority
    → Premonition [DIV-005] resolves
    slots exhausted — P0 gets one final turn
> **P1 thinks:** Round is ending (final-turn flagged) — attach nothing (it'd be discarded), but Disarm now: peek Evo's hand and bounce their best component before their final turn.
- P1: PLAY Disarm [GAM-020] (trainer)
    P1 plays Disarm [GAM-020]
> **P1 thinks:** Same render gap: Disarm's revealed-hand choice is pending but invisible in the CLI render (pass-only legal list is the tell). Their hand is trainers-only — nothing to bounce anyway.
- P1: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Evo final turn: only 1 slot left so Overclock is moot. Detach the VV to bank it for round 2, cast Burning Hands (the marker persists across rounds — better than Spark's flat 2 here).
- P0: detach Verbal x2 [CMP-VV]
- P0: CAST Burning Hands [EVO-003] (prepared[1])
    P0 casts Burning Hands [EVO-003]
- P0: pass priority
- P1: pass priority
    P1 takes 1 damage
    → Burning Hands [EVO-003] resolves
- P0: pass (end turn)
    round 1 ends — level up
> **P0 thinks:** R1 score: Evo 27, Div 28 with burn 1 ticking — dead even. Keeping the Evo kit as-is.
- P0: done preparing
- P1: done preparing
> **P0 thinks:** Evo leads R2: Overclock line — burn both slots THIS turn (Kindle + Spark) to strangle Div's round via the final-turn rule; they'll only get one cast.
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal x2 [CMP-VV] → prepared[2]
- P0: PLAY Overclock [GAM-008] (trainer)
    P0 plays Overclock [GAM-008]
- P0: CAST Kindle [EVO-006] (prepared[0])
    P0 casts Kindle [EVO-006]
- P0: pass priority
- P1: pass priority
    → Kindle [EVO-006] resolves
> **P0 thinks:** BUG FOUND (engine): Overclock's extra cast is never offered — Spark fueled, slot 1/2 free, same turn, yet no CAST action after Kindle. The 1-cast/turn gate ignores the Overclock grant. Card wasted; my slot-strangle line fizzles.
- P0: pass (end turn)
    P1 burns for 2
    P1 takes 2 damage
- P1: attach Material [CMP-M] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: CAST Foretell [DIV-011] (prepared[0])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: pass (end turn)
> **P0 thinks:** Chalk +1 on Spark = 3 damage, my last slot this round.
- P0: PLAY Empowered Chalk [ITM-007] (trainer)
    P0 plays Empowered Chalk [ITM-007]
- P0: CAST Spark [EVO-001] (prepared[2])
    P0 casts Spark [EVO-001]
- P0: pass priority
> **P1 thinks:** Their slots just hit 2/2 — round is ending, so Anticipate's fuel would be stranded. Fire it for value now.
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P0: pass priority
- P1: pass priority
    P1 takes 3 damage
    → Spark [EVO-001] resolves
    slots exhausted — P1 gets one final turn
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: CAST Insight [DIV-001] (prepared[2])
    P1 casts Insight [DIV-001]
- P1: pass priority
- P0: pass priority
    → Insight [DIV-001] resolves
- P1: pass (end turn)
    round 2 ends — level up
> **P1 thinks:** R2 ends: Evo 24, Div 22. L3 = 5th prep slot + 3 casting slots. Concern: I'm behind the exhaustion race (deck 24 vs 28) because my own draw engine mills me.
- P1: prepare Foresight [DIV-002]
- P1: done preparing
> **P0 thinks:** Evo 5th slot: Volatile Charge (3 dmg for 1 self-HP — efficient reach; I'm ahead on HP so the tax is fine).
- P0: prepare Volatile Charge [EVO-008]
- P0: done preparing
- P1: attach Somatic/Material [CMP-SM] → prepared[0]
- P1: attach Material [CMP-M] → prepared[1]
- P1: CAST Foretell [DIV-011] (prepared[0])
    P1 casts Foretell [DIV-011]
- P1: pass priority
- P0: pass priority
    P0 takes 2 damage
    → Foretell [DIV-011] resolves
- P1: pass (end turn)
- P1: attach Material x2 [CMP-MM] → prepared[2]
- P1: pass (end turn)
- P0: attach Verbal [CMP-V] → prepared[0]
- P0: attach Verbal x2 [CMP-VV] → prepared[4]
- P0: CAST Kindle [EVO-006] (prepared[0])
    P0 casts Kindle [EVO-006]
- P0: pass priority
- P1: REACT with Anticipate [DIV-014] (prepared[1])
    P1 reacts with Anticipate [DIV-014]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    → Anticipate [DIV-014] resolves
- P0: pass priority
- P1: pass priority
    → Kindle [EVO-006] resolves
- P0: pass (end turn)
    P1 burns for 1
    P1 takes 1 damage
- P1: CAST Insight [DIV-001] (prepared[2])
    P1 casts Insight [DIV-001]
- P1: pass priority
- P0: pass priority
    → Insight [DIV-001] resolves
- P1: attach Material [CMP-M] → prepared[4]
- P1: pass (end turn)
- P0: attach Verbal/Material [CMP-VM] → prepared[1]
- P0: CAST Volatile Charge [EVO-008] (prepared[4])
    P0 casts Volatile Charge [EVO-008]
- P0: pass priority
- P1: pass priority
    P0 takes 1 damage
    P1 takes 3 damage
    → Volatile Charge [EVO-008] resolves
- P0: pass (end turn)

**Result:** (in progress)

## Analysis

**CALLED AT ROUND 3 END (Evo 20, Div 18, decks 26 vs 18)** — trajectory unambiguous, playing on would only confirm it.

## Verdict: Evo > Div HOLDS, competitive-feeling but structurally decided (~R7-8 projected Evo win by HP)

Per-round damage math is the whole story:
- **Evo output ≈ 5-6/round**: Kindle tick(s) + one direct spell + Chalk amps, and Volatile Charge's self-HP cost is nearly free while ahead.
- **Div output ≈ 3/round hard cap at L1-3**: Foretell 2 (once/round) + Anticipate 1. Everything else Div does draws cards — and NOTHING converts card advantage into damage until L3+ (Foretold Strike). Div drew ~9 more cards than Evo by R3 and it changed nothing on the life race.
- **Exhaustion race also favors Evo**: Div deck 18 vs Evo 26 at R3 — Div's own engine mills itself faster than Saboteur's Kit mills Evo (one Kit = 3; Insight/Premonition cost Div ~3/round of its own deck). Sealed Vault will refund one cycle, not seven.

## Why it still feels like a GAME (unlike pre-nerf Evo-vs-Abj R4 kills)
Post-nerf Kindle (1 marker) is a slow clock; Div's stings + Anticipate value kept HP within 2-3 all game. Div gets real decisions every turn (what to fuel, when to fire Anticipate, final-turn banking). This is the DESIGN-INTENDED losing matchup and its texture is fine.

## Findings
1. **[ENGINE BUG] Overclock (GAM-008) extra cast never offered** — free slot, components attached, same turn; legalActions still blocks on the 1-cast/turn gate. Wasted the card + broke my slot-strangle line in R2. FIX QUEUED.
2. **[TOOLING BUG] `reveal`-mode choices are invisible in the CLI/MCP renderer** — Foretell/Disarm reveals show only a bare "pass" action; the intel (the reason the card costs what it costs) never reaches a text-mode pilot. Client UI unaffected. FIX QUEUED.
3. **[DECK NOTE] Emberworks carries dead weight vs Div**: Dispelling Powder (ward removal) is a mulligan-magnet all match. Riptide's Mana Sickness is similarly near-dead vs a school with almost no effect-draws. Acceptable — presets are archetype decks, not matchup-tuned.
4. **[TEXTURE NOTE] Div's turn is attach-heavy**: 8-9 card hands of M-components with nothing to spend them on; the hand cap will bite in longer games. A cheap M-sink ("discard 2 components: X") is a design lever if Div ever needs a buff — do NOT buff sting numbers; the guardrail (Evo preys on Div) is working as intended.

Reaction pre-attach ruling played fine for Div: refueling Anticipate each round was a real, manageable tax and firing it for value (not as a counter) felt correct.
