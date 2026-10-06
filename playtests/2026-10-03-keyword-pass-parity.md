# Keyword rewrite pass — text ↔ engine parity log (2026-10-03, issue #38)

Every card text was re-read against its `register()` body in
`packages/engine/src/effects/` (and `cardFlags.ts`) while being templated around
the adopted keyword vocabulary (DECISIONS #4). Rule applied: **the text says what
the engine does.** Where the old text promised something the engine never did, the
text moved, not the engine — each such case is listed here so balance (#4/#6) and
design can decide whether the engine should move instead.

Pass file: `packages/cards/data/rewrites/2026-10-03-keyword-pass.json` (applied by
`npm run retext`, then `npm run import-cards`). Lengths: median 87 → 74 chars, max
179 → 148; "negate"/"counter" gone; durations normalized.

## Text moved to match the engine (design may want the engine to move instead)

| Card | Old text claimed | Engine does | New text |
|---|---|---|---|
| ABJ-025 Sanctum | opponent must target Wards first + all Wards +2 | `buffAllOwnWards(2)` only | "Each Ward you control gains 2 HP." |
| ABJ-041 Archmage's Seal | NEITHER player may cast/react until your next turn | cancels stack; locks the OPPONENT only (casts this turn, Reactions until your next turn) | opponent-only lock |
| ABJ-013 Interrupt | strips a *prepared* spell | strips the target spell on the stack; cancels it if it no longer meets its cost; opponent draws 1 | stack wording + the conditional cancel |
| ABJ-030 Penumbral Seal | exile face-down until end of round | `requestSealOpponentPrepared()` — identical to Runic Seal (ABJ-010) | identical text to Runic Seal — **L3 SSM duplicate of an L1 SS card; dead slot candidate** |
| DIV-025 Read the Signs | look at their hand AND draw 1 | `draw(1)` only (no reveal) | reveal clause dropped — **consider adding `requestRevealOpponentHand()` to the engine instead** |
| EVO-020 Scorching Ray | 2 damage divided as you choose, up to 3 targets | 1 to face + 1 to one Ward if any, else 2 to face | the fixed split |
| ABJ-009 Mana Drain | "you may discard this card to…" (optional) | attach TRAP, auto-fires, bounces the component | "Trap: …" (accepted auto-fire, issue #3) |
| ABJ-018 Aetheric Lock | +1 **S** to play Reactions | `addReactionTax(1)` — generic +1 component (same as Concussive Blast) | "1 additional component" |
| EVO-030 Flame Riposte | "when a spell deals damage to you" | plain reaction: castable in any opponent-cast window, deals 3 | "Deal 3 damage to your opponent. The spell still resolves." |
| DIV-027/037/045 Borrowed Spell / Borrowed Power / Convergence | copy a spell "in your discard pile" | recast an already-cast *prepared* spell (documented spec adaptation) | "a spell you have already cast this round" |
| EVO-003 Burning Hands | carried the full Burn reminder in parentheses | — | reminder lives in the Burn keyword |

## Duplicates surfaced by the pass (for #4 card-pool audit / #6 freeze doc)

- **EVO-034 Pyroclasm (L3 VVV) ≡ EVO-021 Detonate (L2 VV)** — identical effect
  (`discardSelfHand` → 2 × n damage). Pyroclasm is strictly worse.
- **ABJ-030 Penumbral Seal (L3 SSM) ≡ ABJ-010 Runic Seal (L1 SS)** — identical effect.

## Wording conventions now in force

- `Deal N damage to your opponent.` always names the target; Ward damage says "to a
  Ward they control".
- Prophecies: `Prophecy (N turns): <payload>.` — the fuse is counted in the opponent's
  turns (reminder text on the keyword).
- Burn: "give them N Burn" / "Remove N Burn from yourself".
- Ledger family: "Spend up to N from your ledger" / "half your ledger".
- Traps: text begins `Trap:`.
- Reactions that don't cancel end with "The spell still resolves." / "The Reaction
  still resolves."
- Durations: "this turn" · "this round" · "until the start of your next turn".
- "cancel" (never negate/counter); "cancelled" spelling throughout.
- "your deck" for the Resource Deck inside card text.

## 2026-10-06 token conversion

Card text is now authored with tokens instead of being keyword-bolded by regex at render
time: `{id}` / `{id|display}` for keywords, `{V}`/`{S}`/`{M}` pips, `{card:DEFID}` refs
(grammar: `packages/cards/src/text.ts`; client mirror `apps/client/src/textTokens.ts`).
Tokens are validated at `npm run import-cards` and at load (all errors collected).

The conversion was **mechanical and rendering-preserving**: `tools/import-cards/src/tokenize-pass.ts`
replaced exactly the spans the old `TERM_RE` bolded (longest term first, whole word,
case-insensitive) and asserted, per card, `plainText(new) === old` and that the keyword
spans equal the old bold spans. 166 of 167 cards changed, 312 keyword tokens (damage 88,
ward 34, draw 29, prevent 22, cancel 21, scry 20, discard 14, cost 10, heal 9, disrupt 9,
burn 9, recover 9, lock 7, prophecy 7, reveal 6, empower 4, ledger 4, unravel 4, trap 3,
seal 3). Pass: `packages/cards/data/rewrites/2026-10-06-tokens.json`.

Review list (34 items, full list in `packages/cards/data/rewrites/2026-10-06-tokens.review.md`)
— places where the old regex already bolded a word that may be prose, now visible as
authored tokens to fix by hand:

- **Cost phrases that aren't costs** — ABJ-034 / GAM-018 "they {cost|take 3 damage}" is
  damage to the *opponent* shown as the Cost keyword; EVO-023's drawback "you take 1
  damage at the start of each of your turns" likewise. (Real costs: EVO-008, EVO-039,
  GAM-008, GAM-010, ABJ-013, ABJ-021, ABJ-036.)
- **"redirected" rendered as Cancel** — EVO-035, EVO-045, DIV-026, DIV-040, GAM-014.
- **"damage" inside prevention sentences** — ABJ-005, ABJ-011 ×2, ABJ-012 ×2, ABJ-021,
  ABJ-022, EVO-014 ×2, EVO-018, DIV-002.
- **draw/discard with the opponent (or nobody) as subject** — ABJ-028 "They draw",
  GAM-017 "their normal turn draw", GAM-015, DIV-044 "discard pile", EVO-021/EVO-034
  "each card discarded".
- **The opponent's Wards** — EVO-040.

Non-fatal `TEXT_WARNINGS` (exported by `@ibokki/cards`): 56 cards whose text mentions a
keyword their tags don't project to — mostly the items above plus Ward/damage mentions on
prevention cards.
