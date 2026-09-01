---
name: art
description: Ibokki art generation (ComfyUI card art + PixelLab pixel art) — delegates to the canonical Claude art skill. Load before any visual work.
---

# Art skill (shim)

The canonical art playbook lives on the Claude side. Read it in full and follow it:

- **Skill:** `.claude/skills/art/SKILL.md`
- **Art-direction law:** `art/STYLE_BIBLE.md`
- **Prioritized asset list + integration points:** `art/MANIFEST.md`
- **Style anchors (accepted prompts/seeds):** `art/chosen.json`

## Non-negotiables

- The user is the art director: never generate batches or file winners without being asked.
- Card illustrations / icons / branding → ComfyUI (Krea2). Board/arena + champions → PixelLab.
- Stage options in `art/review/`; winners land in `apps/client/public/art/` keyed by defId.

This file exists only so the DSH `designer` preset has a discoverable `art` skill in
`.dsh/skills/`. The `.claude/skills/art/SKILL.md` file is the single source of truth;
do not diverge from it.
