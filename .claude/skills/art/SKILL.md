---
name: art
description: Generate art asset options for ibokki via the local ComfyUI Krea2 MCP, present them for review, and let the user pick the winner. Use when the user asks to create, generate, or choose art for the game (card illustrations, icons, board, card back, branding). Args - an asset name, a card defId (e.g. EVO-017), or "next" for the highest-priority unchosen asset.
---

# ibokki art generation & selection pipeline

Generate N options for one asset, show them, let the user choose, file the winner.
The user is the art director; never pick for them.

## Inputs & references

- `art/STYLE_BIBLE.md` — **the art-direction law.** Registers (Plate vs Cover, mapped to
  card tiers), palette, prompt kit (§13 master blocks + standing negative prompt), QA
  checklist (§15), anchoring process. Prompts MUST be composed from the bible's blocks;
  its style blocks are immutable — per-card creativity lives in the subject line only.
- `art/MANIFEST.md` — prioritized asset list (what's needed, target size/aspect, where it
  plugs in) and integration paths (§3). Its §2 style seeds are superseded by the bible.
- `art/chosen.json` — record of every accepted asset: prompt, seed, size, final path.
  Reuse these prompts/seeds as style anchors so new art matches accepted art.
- Card facts (name, school, cost, effect text) come from `packages/cards/data/cards.json`
  (components: `packages/cards/src/components.ts`). Asset key = defId.
- ComfyUI saves full-res originals to
  `E:\ai\ComfyUI_windows_portable\ComfyUI_windows_portable\ComfyUI\output\` (filenames are
  returned by the MCP call). ComfyUI must be running; if generation fails, check
  `mcp__comfyui__comfy_status` first and tell the user to start ComfyUI if it's down.

## Pipeline

1. **Pick target.** Resolve the arg against MANIFEST.md (or `next` = highest-priority item
   with no entry in chosen.json). Confirm the target size/aspect from the manifest table —
   card illustrations are **2:1 landscape masters, width=1024 height=512**; icons/glyphs are
   1:1; board/backgrounds per table.
2. **Compose prompts from the bible.** Pick the register for the card's tier (bible §2
   table: components/trainers/L1–2 = Plate, L3+ = Cover), take that register's master
   block + the school block verbatim from bible §13, and write only the [SUBJECT] line
   per option (concrete and Vancian; cost motif — V=voice/spoken runes, S=hands/gestures,
   M=crystals/reagents). The style block is IMMUTABLE across options; vary composition
   via the subject line only.
3. **Generate 3–4 options** with `mcp__comfyui__generate_image` (seed=-1, steps=0),
   always passing the bible §13 standing negative prompt as `negative_prompt` (use the
   Cover-register variant for Cover-tier pieces). Calls can
   be issued in parallel. Record the seed each call returns — seeds make winners
   reproducible and rerollable.
4. **Stage for review.** Copy each output PNG from the ComfyUI output dir into
   `art/review/<slug>/` named `<slug>__opt<N>__seed<seed>.png` (slug = defId or
   kebab-case asset name). Never re-encode; copy the original.
5. **Present.** Options already rendered inline when generated; for a side-by-side view run
   `powershell -NoProfile -ExecutionPolicy Bypass -File .claude/skills/art/build-gallery.ps1
   -InputDir art/review/<slug> -Output <scratchpad>/gallery-<slug>.html -Title "<Asset> — options"`
   and publish it with the Artifact tool (favicon 🎨; reuse the same html path when
   redeploying options for the same asset). Use the gallery whenever there are 3+ options.
6. **QA before asking.** Run every option against the bible §15 kill-on-sight list
   (glow/bloom is the #1 Krea2 failure; check the gallery's 92×74 board-crop strip for
   silhouette mud). Silently drop-and-regenerate obvious failures; never present art that
   violates the bible. Once anchors exist in chosen.json, show options beside the
   canonical anchor.
7. **Ask.** `AskUserQuestion`: one option per choice, labeled `Option N (seed …)` with a
   one-line description of how it differs; plus a `Reroll` option. On reroll, ask what to
   change, keep the style block, generate a fresh batch (reuse a liked seed with a tweaked
   prompt for near-variants).
8. **File the winner.** Copy full-res into the destination from MANIFEST.md §3 — card art:
   `apps/client/public/art/cards/<defId>.png`; battle-pass alternate scenes:
   `<defId>__alt.png` — and append to `art/chosen.json`:
   `{ "asset", "defId", "prompt", "negative_prompt", "seed", "width", "height", "file",
   "date", "model", "steps", "cast" }` (`model` = ComfyUI checkpoint/workflow identity,
   `steps` = resolved step count, `cast` = archmages depicted or [] — bible §13 drift audit
   depends on all three).
   Keep the losing options in `art/review/` (gitignored) until the user asks to clean up.
9. **Batch mode.** For "do the next 5" style requests, run assets through steps 2–6 as a
   batch (one gallery per asset), then a single AskUserQuestion per asset (max 4 questions
   per call). Don't wire client rendering code as part of this skill unless asked.

## Consistency rules

- PNG now; a later bulk webp conversion is mechanical because filenames are defId-keyed.
- Author raster at 2× logical display size (client renders at up to 2× DPR).
- Card art must read as a strong silhouette at 92×74 px (the board art window crops the
  2:1 master to ~5:4 center) — the gallery renders this crop at true size; judge with it.
- Palette, accents, figure canon, tone: all governed by STYLE_BIBLE.md (§4 palette law —
  in-art accents are the print-pigment hexes, NOT the UI chrome tokens).
- Glyphs/icons and anything containing letterforms are authored SVG, never generated
  (bible §10, §13) — diffusion output is only for illustrations.
