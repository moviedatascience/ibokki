# Ibokki — Design Document

## North Star

**Vision:** A fast-paced wizard duel focused on building and re-building spell and
component combinations each round to defeat your opponent.

**Player Fantasy:** The ultimate Wizard is equal parts cunning and wise — wisdom in
knowing the fine details of spellwork, and cunning in how they leverage arcane
knowledge to their advantage in battle. An advanced Wizard duel is like a grandmaster
chess match: careful study and countless hours of preparation whip by as each Wizard
attempts to crack through the defenses of their foe.

**Target Experience Goals:** 10–25 minute matches; frequent interaction; low play-field
clutter; deep skill expression.

**Design Pillars:**

- **Spell vs Spell Combat:** Direct, stack-based interaction.
- **Counterplay:** Using tags (V/S/M) to anticipate and shut down opponent lines.
- **Ramping Persistent Complexity:** A resource system that becomes a more difficult
  "puzzle" as levels increase.
- **Combo Depth:** Synergizing multi-symbol components with prepared spells.

---

## Core Rules Overview

- **Match Structure:** Best of 1.
- **Win Condition:** Reduce the opponent's HP to 0. (An empty Resource Deck is *not* a
  loss — see Exhaustion below.)
- **Exhaustion:** When a Wizard must draw and their Resource Deck is empty, they shuffle
  their discard pile back into the deck and take **exhaustion damage equal to 2 × the
  number of times they have reshuffled this game** (2, then 4, then 6, …). Exhaustion is
  internal strain, not an attack: it **cannot be prevented, reduced, or absorbed by
  Wards** — it hits the Wizard's HP directly. The deck is a cycling engine, not a clock —
  but each cycle strains the Wizard a little more. Milling an opponent's deck therefore
  pressures them toward their next exhaustion tick rather than toward an instant loss.
- **Zones:** Hand, Prepared Spells, Casting Zone, Discard.
- **Objects:** Spell Deck, Resource Deck, HP / Level / Slot tracker, Status Markers
  (Spent, Channel, Delayed, Ward).

At a high level the game consists of turns within rounds. Wizards take turns to either
attach component cards to spell cards or cast spells. When a Wizard exhausts their spell
slots, the **other Wizard takes one final turn** and then the round ends (the final turn
keeps slot-exhaustion from being a first-player tempo weapon). A round **also** ends once
both Wizards have taken 8 turns in it, so two passive Wizards can't stall a round forever.
Each time a round ends, the Wizards level up.

**Maximum hand size:** at the end of a Wizard's turn they discard down to 10 cards.

---

## The Component System (V/S/M)

To minimize sprawl while maximizing complexity, components use a multi-symbol model.

### 1. Component Types (The Deck)

- **Basic Components:** Single-symbol cards (Verbal, Somatic, or Material).
- **Dual Components:** Two-symbol cards. These come as cross-duals (VS, VM, SM) and
  same-symbol duals (VV, SS, MM). The same-symbol duals are what let high-level
  same-color costs be paid within the two-card cap.
- **Tri-Components:** Rare cards containing all three (VSM).
- **Trainer Cards (Items and Gambits):** No-cost, single-use utility cards shuffled into
  the Resource Deck that provide hand-fixing, ramp, protection, disruption, or matchup
  tech. Played from hand, not attached. (Full rules under Round Structure.)
- **Ongoing Effects:** Some Spells, Items, and Gambits leave a lasting effect in play — a
  buff, a tax, or a Ward that persists for a stated duration, tracked with a marker.
  Ongoing Effects and Wards are the only persistent objects on the board, and
  dispel-style cards (such as Unbind and Dispelling Powder) remove them. There is no
  separate "Enchantment" card type; that role is filled by Gambits and the Ongoing
  Effects they leave behind.

### 2. Spell Costs

Spells require specific combinations of V, S, and M symbols.

- **Level 1:** Usually 1 symbol (e.g., V).
- **Level 2:** 2 symbols (e.g., VS or MM).
- **Level 3+:** 3+ symbols (e.g., VSM or VSS).

**2-Card Cap:** No spell can ever have more than 2 component cards attached at once.
Because the pool includes same-symbol duals (VV/SS/MM), every cost from Level 1 through
Level 4 can be paid within this cap.

**Paying costs:** Level 1 = one Basic; Level 2 = one Dual (or two Basics); Level 3 = a
Dual + a Basic (SSS = SS + S, MMV = MM + V); Level 4 = two Duals (SSSS = SS + SS,
MMMV = MM + VM). Set how often decks reach their L3/L4 costs by tuning the rarity of
same-symbol duals in the Resource Deck — that ratio is the ramp dial, not the cap.

---

## Round Structure

### Prepare Spells

Wizards simultaneously pull cards directly from their Spell Deck and place them
face-down into the prepared spells area. At Level 1, a Wizard may have 4 prepared spells.

### Main

- **Draw:** At the **start of the game**, each Wizard draws an opening hand of 5 cards from the
  Resource Deck. After that, a player draws **1 card at the start of each of their turns** — the
  only exception is your first turn of the game, where you act with your opening hand and take no
  extra draw. There is **no per-round bulk draw**: your hand persists between rounds and grows one
  card per turn.
- **Mulligans:** Only for your **opening hand** (the start of your first turn of the game). If you
  are unhappy with it, you can take a mulligan — shuffle your hand back into your Resource Deck and
  draw a new hand with one fewer card. There is no mulligan in later rounds (there is no bulk draw
  to redo).
- **Component Allocation:** On your turn, a Wizard may attach **as many component cards
  as they like** onto their prepared spells (subject to the 2-card cap per spell). There
  is no longer a once-per-turn limit on attaching — you can fully load a spell in a
  single turn if you have the components for it.
- **Reveal Rule:** Component cards are played face-up. This creates a "guessing game" as
  the opponent sees the requirements being met for a face-down spell.
- **Trainer Cards (Items and Gambits):** Played from your hand during your Main Phase
  with no V/S/M cost; resolve it, then discard it (single use). Items may be played any
  number of times per turn; you may play at most one Gambit per turn. Trainers are played
  only on your own turn — reactive interaction stays on Reaction spells, so trainers
  never become free "gotcha" counters. Because component-recursion effects return
  component cards specifically, trainers cannot be recurred. Deckbuilding guideline: keep
  trainers to roughly a third of the Resource Deck or less, since every trainer is a
  component you won't draw.
- **Cast:** Once per turn, a Wizard can cast **one** (non-Reaction) spell, if they have
  an available slot and the required components attached. Casting more than one spell in a
  round therefore takes multiple turns. **Reactions are separate:** you may still play a
  Reaction in a reaction window (typically on the opponent's turn) in addition to your one
  cast per turn.
- **Resolution:** Cast spells return face-up to the prepared area. Components used to
  cast a spell are discarded into the discard pile; the spell card returns, now face-up,
  to the prepared spells section.

Once the first Wizard has exhausted their spell slots for the round, players move to
**Level Up**.

### Reactions

Wizards can mitigate or counter an opponent's cast using Reaction Spells.

- **The Window:** When a Wizard announces a "Cast," the opponent has a priority window to
  play a Reaction spell from their hand or a previously prepared face-down spell.
- **Tag-Based Counterplay:** Many reactions are "Tag-Sensitive" (e.g., a "Silence" spell
  might specifically target and cancel any spell with a Verbal (V) component requirement).

### Level Up
1
- **Leveling:** Once a round, upon leveling, each Wizard can replace one prepared spell
  with a spell from the Spell Deck. This is in addition to any additional prepared spells
  that become available through leveling. With each new level comes an increase in spell
  slots, level of spells available to cast, a larger quantity of prepared spells, or any
  combination of these.
- **End-of-Round Component Discard:** Any component cards still attached to spells at the
  end of the round are **discarded** into the discard pile. Components do not persist
  across rounds — you rebuild your spells' components each round. (You may detach a
  component back to your hand on your own turn if you want to keep it instead.)

Below is a table outlining the potential level curve:

| Wizard Level | Max Spell Level | Spell Slots / Round | Prepared Spells | Notes |
|:---:|:---:|:---:|:---:|---|
| 1  | 1 | 2 | 4  | L1 baseline; small, tight opener. |
| 2  | 1 | 2 | 4  | Same slots, same prepared; players refine early game. |
| 3  | 1 | 3 | 5  | First big bump: 3 casts/round, +1 prepared. |
| 4  | 1 | 3 | 5  | Plateau to stabilize pacing. |
| 5  | 2 | 3 | 5  | Unlock Level 2 spells; action count unchanged. |
| 6  | 2 | 3 | 6  | +1 prepared; opens more lines, sprawl still modest. |
| 7  | 2 | 3 | 6  | Expected game-end band starts (L2 online). |
| 8  | 2 | 3 | 6  | Same; component sequencing really matters now. |
| 9  | 2 | 3 | 6  | Very long "normal" game might end here. |
| 10 | 3 | 3 | 7  | Unlock Level 3 spells; more payoff, same slots. |
| 11 | 3 | 3 | 7  | Plateau to let players live in L3 for a bit. |
| 12 | 3 | 3 | 7  | Ultra-long matches hover here. |
| 13 | 3 | 4 | 7  | 4th slot appears; only in epic games. |
| 14 | 3 | 4 | 7  | Plateau; any further power is in card design, not more slots. |
| 15 | 4 | 4 | 8  | Unlock Level 4 "signature" spells. Rare but real. |
| 16 | 4 | 4 | 8  | Stable top-end; complexity is now from cards. |
| 17 | 4 | 4 | 8  | Only the grind-iest matches reach here. |
| 18 | 4 | 4 | 8  | Same. |
| 19 | 4 | 4 | 8  | Same. |
| 20 | 4 | 5 | 8  | "True Archmage." Almost purely aspirational. |
| 21 | 4 | Unlimited | 10 | Unlimited spell slots: Wizards cast until one is reduced to 0 HP or runs out of Resource-Deck cards. |

---

## Magic Schools & Affinity

While any Wizard can learn any spell, magical disciplines require specific component
concentrations. To cast high-level spells consistently, Wizards must tune their Resource
Deck to match their Spell Deck.

**The "Soft Constraint" Rule:** There are no hard restrictions on mixing schools. A Wizard
may prepare Fireball (Evocation) and Recover (Divination). However, Fireball requires
heavy Verbal (V) components, while Recover requires Material (M) components. A deck split
between both risks "bricking" (drawing V cards when you need M cards).

**Core Schools (Prototype Phase):**

- **Evocation (The School of Energy)** — Primary Component: Verbal (V). Playstyle:
  Aggressive, High Burst, Fast. Spends components aggressively to push damage through,
  often burning resources faster than a Wizard can recover them.
- **Abjuration (The School of Protection)** — Primary Component: Somatic (S). Playstyle:
  Defensive, Reactive, Control. Holds components in reserve to react on the opponent's
  turn, trading card efficiency for disruption and board protection.
- **Divination (The School of Manipulation)** — Primary Component: Material (M).
  Playstyle: Tempo, Utility, Precision. Searches and recycles its Resource Deck to ensure
  it always has the right piece at the right time, prioritizing consistency over raw power.

---

## Priority & Stack Model

- Spells and Reactions resolve in a Last-In, First-Out (LIFO) stack.
- A Wizard keeps priority after casting (they may retract a spell or add more to the
  stack); Wizards continue passing priority back and forth, and the top of the stack
  resolves once both players pass in succession.

---

## Design Notes

Part of the fun of a D&D campaign is the idea of building toward a late game that is
functionally never going to happen. You build your puny level-1 wizard in the hopes that
one day you emerge as an all-powerful mage, knowing full well the campaign will peter out
after a few sessions. So in deck construction for this game, you should want to build
things that ramp toward that all-powerful wizard level, knowing that ultimately you won't
be getting to late game very often. **Most games will end in fewer than 10 rounds.**

There's no limit on how many spells can be brought to a match in a Wizard's spell book.
Most Wizards who put any effort into collecting cards will get copies of all the spells
for all the schools. Wizards only need to put one of each spell into the spell book.

Generally speaking, the schools create a rock-paper-scissors environment. There aren't
strict 1-to-1 counters the way you typically think about RPS, but generally:

- A wizard running an entirely **Evocation** strategy will lose to an **Abjuration**
  strategy — Abjuration's defenses are enough to prevent Evocation's upfront damage.
- When the Evocation deck mixes in resources to also pull from **Divination**, it ramps
  damage faster than an Abjuration wizard can defend.
- An **Abjuration** strategy should typically lose outright to a **Divination** strategy,
  but a wizard who mixes Abjuration and Evocation will typically beat a purely Divination
  strategy.

---

## Brainstorming

- Cards that give bonus spell slots for a round.
- Converting damage into spell slots.
- Giving an additional (temporary) spell slot based on how much damage you've done that
  round.

> **Note (rules update):** **Quicken** (DIV-013) has been **retired** — its effect
> ("attach 1 additional component this turn") became redundant once attaching is unlimited
> per turn.
