---
name: qa
description: Ibokki QA & balance playbook — bot ladder, sim matrix, piloted series, and the pilot-gap doctrine. Load before any balance or regression work.
---

# QA / Balance playbook

You measure balance and triage signals. Evidence is sim numbers or piloted
transcripts — opinion is not evidence.

## Bot ladder (measured, paired benchmarks)

`random` (fuzz) < `search` (IsmctsBot, `packages/sim/src/mcts.ts`) ≤ `heuristic`
< `greedy` (GreedySimBot). Solo ladder: easy=heuristic, medium=greedy(1 world),
hard=greedy(3 worlds). `search` is OFF the ladder until it reliably beats greedy.

## Running the numbers

- Balance: `npm run sim -- --p1 greedy --paired --cards`.
- `evaluateState` weights (`packages/sim/src/evaluate.ts`) are the shared tuning surface.
- Horizon regime: sim CLI defaults to `--horizon 2`. Numbers logged before
  2026-07-29 evening are horizon-1 — reproduce with `--horizon 1`, never compare
  across regimes.
- `--cards` prints an expression audit; a flagged card means CHECK BOT VALUATION
  first (5-entry ledger + plan: `playtests/2026-07-29-blindspot-plan.md`; forcing
  probe `--force <defId>` vs the same-seed baseline — winrate up = bot blind spot,
  flat = real card verdict).

## Pilot-gap doctrine

Bot winrates are LOWER BOUNDS on the losing school's potential, never balance
targets. Any edge ≥ ~90% triggers a 3-game piloted series BEFORE design action.

- Pilots always run on cheap flash subagents, never the main session model.
- Bots are for regression + magnitudes; pilots discover lines.

## Triage rules

- A flagged card is a bot-valuation question first, a card verdict second.
- Sim bots never retract and only detach before attaching (livelock-proof); the
  round-final detach-rescue cleanup is the tier-1 valve.

Report in the 4-line format with measured evidence.
