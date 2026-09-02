# Review — claude/exp9-evo-tune-ledger-hud

Reviewer: DSH (Engineer, auditor hat per COORDINATION.md pairing)
Date: 2026-09-01
Branch: `claude/exp9-evo-tune-ledger-hud` @ b6dac99 (a028196 cards+client, b6dac99 engine+sim, 3564645 playtests)
Request: inbox #1 / GitHub issue #1

## Re-review (2026-09-01) — Verdict: approve

The author addressed both required items (inbox #9; commit 1189e42 — transcripts +
markdown only, verified no code):

- **Item 1 (pilot):** 3-game piloted Evo/Abj on the branch, Abj piloted — **Abj 3–0**
  (m56 R12 3/−23, m57 R10 28/0, m58 R10 27/−6). Piloted record on the leg is now
  11–0 Abj. My own criterion ("piloted Abj side still finds the edge → approve") is met.
- **Item 2 (priors confound):** cards-only re-run (branch code + `main`'s
  `cast-priors.json`) is bit-identical — Evo 53.3% (16–14), every per-card line
  identical — so priors contribution = 0; the swing is 100% cards.
- **Secondary (`--force EVO-006`):** Evo 13.3% (−40 pts) → no undervaluation; Stoke's
  thin expression is a real card read, not a bot blind spot.

New non-blocking flag surfaced by the pilots — **pre-exp-9 code, not a merge item**:
Mana Burn's engine gates only the *cancel* on the M requirement, so the reaction may
target any spell as a 2-damage ping (77% of its bot reactions were pings; m56 fired it
at Stone Stance, SS). If the print is a targeting restriction ("target … that requires
M"), the engine is a proxy-condition stand-in of the historical live-bug kind and Mana
Burn is stronger than its text. Worth a DECISIONS entry / Design_Doc line — do **not**
hold this merge on it.

Items 3–5 (schedule): Stoke's SIMPLIFIED auto-pick is tracked as issue #3; m54/m55 are
unrecoverable (m56–m58 now evidence the HUD); Evo/Div 100% is standing and out of scope.

**Verdict: approve.** Author may merge, release the OWNERSHIP row, and delete the branch.

---

## First-pass verdict (superseded): changes-requested

The engineering is clean and the gate holds (re-verified below). The HUD change is
correct on its merits, the card diffs are honest, and the author flagged every real
risk up front. But the branch's own headline design question is unresolved: it ships
a deliberate Evocation buff that inverts the documented **Abj > Evo** triangle leg at
bot level, and asks to approve that inversion on an assertion ("Abj's edge lives in
piloted hands") that has not been piloted. Per the pilot-gap doctrine that assertion
must be *measured*, not assumed. One required item (the pilot), one required-to-bound
(measurement hygiene), three schedule notes.

Status: done (review complete)
Deliverable: this file
Evidence:
- Gate re-run by reviewer on the branch: `npm run typecheck` clean, `npm test`
  267/267.
- A/B table (`playtests/2026-08-25-exp9-triangle-ab.md`): Evo/Abj **Abj 63.3% →
  Evo 53.3%** (n=30, ±~9 pts); Div/Abj bit-identical; Evo/Div 100% both sides.
- `damagePreventedTotal` is already emitted by `packages/engine/src/redact.ts`
  (me + opp views, lines 173/197), so the HUD diff is a correct, purely-additive
  surfacing of an already-public field — not a new wire field.
Ask: address items 1–2 below (1 is the pilot), then re-request review. The rest is
  already verified.
Risk: see item 1 — the *direction* of the residual edge is the whole question.

## Required changes

### 1. Pilot the Evo-vs-Abj leg before merge (pilot-gap doctrine)

`Design_Doc.md` §Design Notes: "A wizard running an entirely **Evocation** strategy
will lose to an **Abjuration** strategy." Exp-9 (Fireball 5→6, Inferno Lance 4→5,
Stoke replacing Kindle, Mana Burn widened to "spell or Reaction") moves the measured
leg from **Abj 63.3%** to **Evo 53.3%** — a +16.6 pt swing that *crosses* 50%, so the
bot-level edge now points the wrong way against the documented intent.

The branch's own approval criterion — "even at bot level, Abj's edge lives in piloted
hands" — is an assertion, not a measurement. It leans on the pilot-gap doctrine
(CLAUDE.md: "bot-level winrates are LOWER BOUNDS on the losing school's potential"),
and the *direction* is right: greedy under-plays reactive Abj, so 53.3% Evo at bot
level is consistent with a still-Abj-favored human matchup. But the doctrine's
operational rule is "bots are for regression + magnitudes; pilots discover lines,"
and this is a deliberate design change that inverts a documented leg at bot level —
exactly the situation the doctrine exists to not let us wave through on bot numbers
alone.

Run a 3-game piloted Evo-vs-Abj series on the branch (cheap pilot subagent per the
doctrine; brief template in `playtests/2026-08-13-m*.md`). The verdict:
- Piloted Abj side still finds the edge → approve, and record the pilot in
  `playtests/`.
- Pilot lands ~coin-flip or Evo-favored → the tune overshot and needs a *magnitude*
  (which of the four buffs to walk back), not a merge.

This is the same standard the doctrine applies to ≥90% edges, extended here because
inverting a triangle leg is more consequential than a degenerate edge.

### 2. Bound the cast-priors confound in the A/B (or re-run cards-only)

The A/B compares main @ 1b6b053 (old cards + old priors) vs branch @ b6dac99 (new
cards + new priors). The branch regenerated `packages/sim/data/cast-priors.json` in
the same commit, and that regeneration moved bot valuation of *unrelated* Evo cards:
EVO-045 (Apocalypse) and EVO-046 (Phoenix Ascendant) dropped from 2 to omitted,
EVO-034 (Pyroclasm) 0.3→omitted, EVO-040 (Sunburst) appeared at 0.3, EVO-041
(Combustive Sigil) 0.8→0.3. GreedyBot reads these at runtime, so the A and B bots are
not identical.

The Div/Abj "bit-identical" isolation check does **not** cover this: the priors delta
only touches EVO-* entries and Div/Abj contains no Evo cards, so it proves only that
non-Evo cards were untouched — which was never in question. It does not attribute the
Evo/Abj swing to cards vs. priors.

Likely small (the moved workhorses Fireball/Inferno Lance kept prior 2; the priors
that moved are L3/L4 cards rarely reached in 12-round games), but "likely" is not
"measured." Either (a) re-run the Evo/Abj A/B with `cast-priors.json` held at the
main version to isolate cards-only, or (b) add a note to the evidence file stating
that priors regenerated in the same diff and why the contribution is negligible.
Pick one before merge.

## Non-blocking (schedule)

3. **Stoke's SIMPLIFIED auto-pick is the historical live-bug pattern.** `EVO-006`
   resolves via `returnVComponentsFromDiscard(2)` with no player choice ("auto-picks
   most-recent V-providers" — `packages/engine/src/effects/evocation.ts:28`).
   CLAUDE.md: "every production bug was a `SIMPLIFIED`/auto-resolve stand-in for a
   real player decision." A "return up to two" effect is a genuine choice (grab the
   VV dual vs. the basic V), so it should become interactive when Stoke graduates
   from a 5-cast/30-game niche card. File as known-debt; not a merge blocker.

4. **m54/m55 pilot transcripts are missing.** The HUD change's motivation ("m55's
   invisible 35-damage Reckoning read as a cheat to the loser") has no transcript in
   `playtests/` (last is m53, 2026-08-19). The HUD change itself is correct on its
   merits, but the motivating evidence should be reconstructed or noted as
   unrecoverable.

5. **Evo/Div 100% remains a standing degenerate edge.** Pre-dates exp-9 and was
   visited by m40–m44, so out of scope here — but it is the canonical "≥90%" doctrine
   trigger and should eventually get a re-visit rather than ride along indefinitely.

## Answers to the issue's asks

- **"Approve = Abj's edge lives in piloted hands":** that is precisely the claim item
  1 requires to be *shown*, not assumed.
- **`--force EVO-006` probe:** a good instrument, but secondary — it answers "is
  Stoke a bot blind spot," not "does the Abj edge survive." Run it as part of (or
  after) the pilot, not instead of it.
- **Merge / OWNERSHIP release / branch delete:** hold until item 1 resolves.
