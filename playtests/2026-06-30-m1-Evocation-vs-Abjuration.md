# Playtest m1: Evocation (P0) vs Abjuration (P1) — seed 42
> **P0 thinks:** P0 Evocation: prepare Firebolt (3 dmg) — top L1 damage.
- P0: prepare Firebolt [EVO-002]
> **P0 thinks:** P0 Evocation: prepare Spark (clean 2 dmg, single V).
- P0: prepare Spark [EVO-001]
> **P0 thinks:** P0 Evocation: prepare Searing Word (2 dmg + opponent discards a component — disruption).
- P0: prepare Searing Word [EVO-004]
> **P0 thinks:** P0 Evocation: prepare Kindle (2 Burn markers) for reach. 4/4 prepared, all aggro.
- P0: prepare Kindle [EVO-006]
> **P0 thinks:** P0 Evocation done preparing: Firebolt, Spark, Searing Word, Kindle (aggressive opener).
- P0: done preparing
> **P1 thinks:** P1 Abjuration: prepare Arcane Shell (1hp ward; draw 2 if it dies this round — soak + card advantage vs aggro).
- P1: prepare Arcane Shell [ABJ-002]
> **P1 thinks:** P1 Abjuration: prepare Grounding (reaction: prevent 1 + draw 1 — defense plus card advantage).
- P1: prepare Grounding [ABJ-008]
> **P1 thinks:** P1 Abjuration: prepare Echo Shield (reaction: prevent 1, or 2 with a ward — synergizes with Arcane Shell).
- P1: prepare Echo Shield [ABJ-007]
> **P1 thinks:** P1 Abjuration: prepare Aegis (untargetable by 1-component spells — hard counter to Evo's single-V L1 attacks).
- P1: prepare Aegis [ABJ-004]
> **P1 thinks:** P1 Abjuration done: Arcane Shell, Grounding, Echo Shield, Aegis (ward + 3 reactions, all card-neutral/positive).
- P1: done preparing
> **P0 thinks:** P0: attach single Verbal to Searing Word (exact pay, save VV duals).
- P0: attach Verbal [CMP-V] → prepared[2]
> **P0 thinks:** P0: cast Searing Word at Abjuration (2 dmg + they discard a random component). Watch for P1 reaction window.
- P0: CAST Searing Word [EVO-004] (prepared[2])
    P0 casts Searing Word [EVO-004]
> **P1 thinks:** FINDING: Abjuration reaction window offers only pass — prepared reactions (Grounding/Echo Shield) are unfueled (no S pre-attached), and you cannot attach during the opponent turn. Reactions require committing your once-per-turn attach to a face-down reaction a full turn in advance, blind. Turn-1 reaction is impossible. Pass.
- P1: pass priority
> **P0 thinks:** P0: pass priority — let Searing Word resolve.
- P0: pass priority
    P1 takes 2 damage
    → Searing Word [EVO-004] resolves
> **P0 thinks:** P0: end turn 1. Used attach+cast (Searing Word). Abjuration at 28, down a component.
- P0: pass (end turn)
> **P1 thinks:** P1 Abjuration: attach single S to Aegis. Plan: cast it to blank Evo's single-component attacks next turn (hard-counter test).
- P1: attach Somatic [CMP-S] → prepared[3]
> **P1 thinks:** P1 Abjuration: cast Aegis — untargetable by 1-component spells until start of my next turn.
- P1: CAST Aegis [ABJ-004] (prepared[3])
    P1 casts Aegis [ABJ-004]
> **P0 thinks:** P0: pass priority, Aegis resolves.
- P0: pass priority
> **P1 thinks:** P1: pass priority, Aegis resolves — should grant untargetable-by-1-component until start of my next turn.
- P1: pass priority
    → Aegis [ABJ-004] resolves
> **P1 thinks:** P1: end turn 2. Aegis active. Now watch P0 turn 3: do single-V attacks get blocked? Does P0 draw at start of turn 3?
- P1: pass (end turn)
> **P0 thinks:** P0: attach VV dual to Spark (only V sources left are duals). Will cast into Aegis to test untargetable.
- P0: attach Verbal x2 [CMP-VV] → prepared[1]
> **P0 thinks:** P0: cast Spark (1 component) into Aegis. Expect: blocked/no damage (Abjuration untargetable by 1-component spells).
- P0: CAST Spark [EVO-001] (prepared[1])
    P0 casts Spark [EVO-001]
> **P1 thinks:** P1: pass priority.
- P1: pass priority
> **P0 thinks:** P0: pass priority — resolve Spark into Aegis.
- P0: pass priority
    P1 takes 2 damage
    → Spark [EVO-001] resolves
    round 1 ends — level up

**Result:** (in progress)

## Analysis

Self-play diagnostic (Claude piloting BOTH sides), Evocation (P0) vs Abjuration (P1), seed 42, paired with a full heuristic-bot win-rate matrix (2000 games/cell). Goal: assess balance + functionality vs Design_Doc.docx.

INTENDED TRIANGLE (design doc): Abjuration > Evocation > Divination > Abjuration (a cycle). "A pure Evocation strategy loses to Abjuration; a pure Abjuration strategy loses outright to Divination."

HEURISTIC-BOT MATRIX (row win%): Evo beats Abj ~58%, Evo beats Div ~91%, Abj beats Div ~89%. So power order is Evo > Abj >> Div. Two of three triangle edges are INVERTED (design wants Abj>Evo and Div>Abj). Mirrors ~50/50 (slight ~52% first-player edge). ~90% of ALL games end by DECK-OUT, not HP (even the Evo mirror is ~79% deckout).

ROOT CAUSES (confirmed in engine source, not guesses):
1. WARDS DO NOT ABSORB DAMAGE. context.dealDamage -> dealDamageToPlayer subtracts directly from target.hp after only flat 'damageReduction' ongoing effects (state-ops.ts:51-66). Ward HP is tracked but never consulted on incoming spell/burn damage. Abjuration's entire low-level ward kit (Fortify, Arcane Shell, Ward Pulse, Stonewarden, Sentinel Rune, Fortress, Ritual Ward) creates wards that don't block anything. This is the single biggest reason Abjuration can't wall Evocation.
2. AEGIS (ABJ-004) IS A NO-OP: register("ABJ-004", () => {}) // single-component targeting immunity DEFERRED. In play, Aegis was cast and Spark (1 component attached) still dealt full 2 dmg. Abjuration's premier L1 anti-Evocation tool does nothing. Stone Stance (ABJ-005) likewise a no-op.
3. REACTIONS ARE EFFECTIVELY UNUSABLE. To play a prepared reaction in the opponent's priority window it must already have its component PRE-ATTACHED (you cannot attach during the opponent's turn; attach is 1/turn on your own turn). On turn 1 the reactive player has had no main turn, so reacting to the opening attack is impossible; thereafter holding a reaction costs your single attach a full turn in advance, blind. The whole 'hold components in reserve to react' identity is strangled by the cost/timing model. (Observed: reaction window offered only 'pass' despite holding 5 Somatic and 3 prepared reactions.)
4. DIVINATION'S IDENTITY IS UNIMPLEMENTED. Its selection/sculpting/scry effects are no-ops or substituted with plain draw (DIV-008 Scry Glyph, DIV-009 Attune, DIV-011 Foretell, DIV-022 Index = () => {}; many others SIMPLIFIED to draw). 'Searches and recycles to always have the right piece' becomes 'draw a card,' so Divination plays as a worse Evocation with no damage -> ~10% win rates.
5. BURN vs ROUND-END (known finding #3, code-confirmed). Burn ticks only at the START of the burned player's turn (mechanics.ts:56-59) and is zeroed at round end (mechanics.ts:99). Casting to exhaust your slots ends the round, often wiping burn before it ever ticks.

WHAT WORKS (verified live): LIFO stack + priority windows; leveling/round-end; the Prepare/replace phase; direct damage; Searing Word's component discard; start-of-turn draw rule (no draw on each player's FIRST turn of a round, draw 1 thereafter — coherent, matches doc spirit).

DATA/LEVELING INCONSISTENCY: 2-symbol-cost spells are classified L1 (Inferno Lance VV, Hex Bolt VV, Combust VV, Battery VM, Runic Seal SS all offered at an L1 prepare), while Fireball (VV) is L2 — identical cost, different level. Design doc says 'Level 2 = 2 symbols.' Either the level field is authored independently of cost (a balance knob) or an importer mismap; worth reconciling.

BOTTOM LINE: The inverted triangle is NOT primarily a numbers-tuning problem — it's that Evocation's core mechanic (damage) is fully implemented while Abjuration's (ward absorption + immunity + reactions) and Divination's (deck sculpting) cores are partially or largely stubbed. Fixing #1 (route damage through wards) and #2/#3 (Aegis + reaction fueling) should be done BEFORE trusting any balance numbers. Also resolve the deck-out dominance (hand cap / smaller round draw) so the HP/damage axis the triangle rests on can actually decide games.
