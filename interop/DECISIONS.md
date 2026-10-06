# Decision log

Shared, git-tracked memory for the two vendors. Every disagreement ends here as a
numbered decision. Both sides cite the number in later briefs ("per DECISIONS
#N"). Do not re-litigate a logged decision without a NEW piece of evidence.

## How to add one

Append a block in the numbered format below, incrementing the number. `Winner` /
`Conceded` record who moved and on what evidence, so every decision is traceable
and reversible.

---

## DECISIONS #1 — adopt the interop protocol (2026-08-25)

- **What:** Claude Code and the DSH org coordinate through git + `interop/` using
  branch-per-task and enforced cross-vendor review pairing (Claude reviews DSH
  builder output; DSH Lead-Auditor reviews Claude output).
- **Who:** the human; no party conceded.
- **Reversible:** only by a later numbered decision.

---

## DECISIONS #2 — one git worktree per agent (2026-09-01)

- **What (from inbox #8):** each agent — every Claude session and the DSH org —
  does branch work in its own `git worktree` of the same `.git`
  (`git worktree add F:\Programming\ibokki-<agent> <branch>`), so a checkout in
  one tree never moves another agent's files. The repo-home tree
  `F:\Programming\ibokki` is the NEUTRAL tree: it stays on `main` (session-start
  reads, inbox drains, bus commits) and hosts no branch work. `main` remains the
  integration point exactly as before. Standing rules in any shared tree:
  `git status` before switching branches, no `git add -A`, never switch a tree
  that holds another agent's uncommitted changes.
- **Practical constraints (measured):** (a) a branch can be checked out in only
  ONE worktree — the author removes its worktree before the reviewer checks the
  branch out (or the reviewer uses `git worktree add --detach`); (b) a fresh
  worktree needs its own `npm ci` (~1 min) before the gate/sims run; (c) while
  the repo-home tree is transitionally off `main`, agents needing `main` use a
  transient worktree and remove it immediately after.
- **Evidence:** two same-day near-misses, 2026-09-01. Reflog of
  `F:\Programming\ibokki`: HEAD moved main → `claude/bot-mode-card` (13:45:28,
  Claude) → `dsh/fix-skills-presets` (13:47:10, DSH) →
  `claude/exp9-evo-tune-ledger-hud` (13:48:32, a second Claude session). DSH's
  untracked `.dsh/agent-presets/*` + `.dsh/skills/*` work and a live
  `.dsh/README.md` edit rode along on a Claude branch for ~10 minutes; any DSH
  commit in that window would have landed on the wrong branch. Recovered with no
  damage; the Claude work finished from worktrees.
- **Who:** the human, ratifying inbox #8 (2026-09-01); Claude side already
  adopted; DSH notified via inbox #10 and may append its ack here. No party
  conceded — this amends COORDINATION.md's "one path" rule, which was written
  against divergent copies, not shared working directories.
- **DSH ack (2026-09-01):** adopted. The DSH org does branch work from its own
  worktree (`F:\Programming\ibokki-dsh`) and keeps the repo-home tree
  `F:\Programming\ibokki` on `main`.
- **Reversible:** only by a later numbered decision.

---

## DECISIONS #3 — Mana Burn (EVO-029) M-requirement is a targeting restriction (2026-09-01)

- **What:** the human ruled the print is a targeting restriction: Mana Burn may
  only be cast in reaction to a spell/Reaction whose cost requires M. The
  engine's current behavior — gating only the *cancel* on the M requirement and
  letting the reaction ping ANY spell for 2 — is a bug of the historical
  proxy-condition kind ("the card isn't supposed to be that strong"). Engine
  fix required; the print stays as-is.
- **Evidence:** pilots m56–m58 / exp-9 A/B — 77% of Mana Burn's 30 bot
  reactions were pings at non-M spells (m56 fired it at Stone Stance);
  surfaced in `interop/reviews/exp9-evo-tune-ledger-hud.md`.
- **Who:** the human (design authority), 2026-09-01. No party conceded.
- **Assignment:** Claude takes the engine-fix branch
  (`packages/engine/src/effects/evocation.ts` + engine tests); DSH reviews per
  the pairing. Balance note for the fix's evidence: this weakens a card exp-9
  widened to "spell or Reaction" — cite this decision, and let the next
  triangle matrix pick up the magnitude.
- **Reversible:** only by a later numbered decision.

---

## DECISIONS #4 — keyword vocabulary adopted (2026-10-03)

- **What:** the 20-keyword player-facing vocabulary in `packages/cards/data/keywords.json`
  (projecting the 28 engine-derived tags; Design_Doc "Keywords & Icons") is the language
  cards are written in and the icon set the card face shows. Card text (#38) and the
  keyword glyph art (#43) follow it; changes go through the JSON + the cards test.
- **Who:** the user (design authority), on Claude's proposal. No party conceded.
- **Reversible:** by editing the JSON; the derive/keyword tests keep tags, keywords and
  card faces consistent.

---

## DECISIONS #5 — audio is not in 1.0; target 1.5 (2026-10-03)

- **What:** 1.0 ships with no audio. A minimal cue set (cast / damage / turn / win) plus
  the settings toggle is scheduled for the 1.5 milestone. #71 (settings surface) drops
  its audio toggle; #72 keeps only the arena and balance-threshold decisions open.
- **Who:** the user. No party conceded.
- **Reversible:** only by a later numbered decision.

---

## DECISIONS #6 — elements are the horizontal axis; 1.0 is all Fire (2026-10-05)

- **What:** progression is horizontal by **element** (type). Every element ships the
  same three schools (Evocation = aggro, Abjuration = protection, Divination =
  utility), so the triangle is measured per element. 1.0 ships one element, Fire, and
  all three existing decks are Fire: Evocation = the Blaze (unchanged), Abjuration =
  the Forge, Divination = the Lamp. Implemented as text + data only: `element` and
  `flavor` fields on every card (xlsx columns, importer, loader, protocol catalog,
  client detail surfaces), 99 card renames (48 Abjuration, 44 Divination, 8 Evocation
  lightning-out; "Reckoning" now names exactly one card; the two names that collided
  with the Unravel keyword are gone), presets Emberworks / **Crucible** / **Ashlight**
  (legacy names Bastion / Riptide still resolve), a flavor line on every school card,
  and the Design Doc "Elements, Schools & Affinity" section with the type-chart
  principles. Vess of the Undertow is reserved for the Water release; the Lamp's
  archmage is a new, unnamed character (text only). No mechanics changed; no
  element hooks or type chart are built; palette and art direction are owned by the
  visual-redesign track and untouched here.
- **Who:** the user (design authority), on Claude's proposal (`ELEMENTS_PLAN.md`).
- **Reversible:** names and flavor through a retext pass; the element field is
  additive.

---

## DECISIONS #7 — adopt the OpenSky patterns, as patterns (2026-10-06)

- **What:** the open-sourced Skyweaver repo (horizon-games/OpenSky) was reviewed at
  source level (`OPENSKY_REVIEW.md`). Its CODE is not reused — Rust/wasm state
  channel, Three.js ECS, Go/Redis/Postgres services — but these patterns are adopted:
  frames presented one at a time with legal actions released only after the board
  catches up (frame player, per-move bot frames); engine events stamped with their
  cause and bracketed resolutions; card text authored in `{tokens}` validated at
  import; a text-implemented ledger; hidden-information, invariant and simultaneity
  tests as standing instruments; plus the three verified server gaps (heartbeat,
  stale-act epoch, rules-hash stamp). The post-1.0 systems (ladder, settle/rewards,
  `match_players`, replay telemetry, tasks table, deck codes, allow-list, art cache,
  debug tooling, tutorial-as-filter) are on the board as P2 so they are never lost;
  whether any ships in 1.0 is a later decision.
- **Who:** the user, on Claude's review; `whyNot` (#88) left open pending an estimate
  the issue now carries.
- **Reversible:** each item is its own issue/commit.

---

## Open / undecided

(none — add blocks here as disagreements arise)
