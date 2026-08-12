# Ibokki — Roadmap (open work only)

Distilled 2026-08-12 from `PROJECT_PLAN.md` (now deleted — the full architectural
blueprint lives in git history; everything through online PvP + deploy shipped).
The working architecture is documented in `CLAUDE.md`; balance state lives in
`playtests/2026-07-27-greedy-triangle-balance.md`.

## Backlogs of record

- **UI & art:** `UI_POLISH_PLAN.md` — the five-wave plan (2026-07-09 audit; its
  file:line anchors refer to that tree). Wave 1 correctness items partially done
  (crests, pips, glyphs wired); most of waves 2–5 open.
- **Bots / balance instrumentation:** `playtests/2026-07-29-blindspot-plan.md`
  — next up: 1b forcing probes, 2 auto-derived cast priors; ISMCTS promotion
  pending an iterations sweep + paired runs (journal 2026-08-12 entries).

## Deferred features (user decisions on record)

- **VN tutorial / onboarding** (deferred 2026-07-08): chaptered visual novel
  teaching components → stack/reactions → prepare/leveling → the school
  triangle → deckbuilding capstone, as scripted engine duels on the real board.
  Open calls: in-client route vs separate app; dialogue system choice; scope.
- **Desktop / Steam wrap** (deferred): keep the client a pure web app behind a
  small `platform` seam (storage, fullscreen, deep-links, achievements);
  prototype Tauri first, Electron fallback. Steamworks via steamworks.js or
  tauri-plugin-steamworks.

## Server / infra (open)

- No horizontal scaling (single event loop + single-writer SQLite).
- No error monitoring/alerting.
- Matchmaking is room-code only — no queue, no MMR/ladder.
- Persistence loop: match history / replay share / W-L profile (the `matches`
  table already stores seed + action log; UI + protocol work remain).

## Meta systems (open)

- Ladder/leaderboards, collection/monetization decisions (doc intent: players
  collect one of each; keep monetization cosmetic-only if any).
- Live-ops cadence: importer + sim reports are the balance-patch pipeline.
