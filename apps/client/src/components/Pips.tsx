import type { CSSProperties } from "react";
import { BASE } from "../api.ts";
import { SCHOOL_CREST, SCHOOL_VAR } from "../schools.ts";

/**
 * DOM-side woodcut glyphs (the same art/icons set the Pixi board uses). Rendered via
 * CSS mask so one white SVG tints to any color — see .icn in styles.css.
 */

const PIP_COLOR: Record<string, string> = { V: "var(--v)", S: "var(--s)", M: "var(--m)" };

/** Trainer accent (style bible §4) — tints the Item/Gambit type glyphs. */
const TRAINER_COLOR = "#caa46a";

export function Icon({ name, color, size = 12, title }: { name: string; color: string; size?: number; title?: string }) {
  return (
    <span
      className="icn"
      title={title}
      style={{ width: size, height: size, backgroundColor: color, "--icn": `url(${BASE}art/icons/${name}.svg)` } as CSSProperties}
    />
  );
}

/** School crest glyph (Eye/Bow/Key), tinted by school accent; nothing for a non-school. */
export function SchoolCrest({ school, size = 13 }: { school: string | null | undefined; size?: number }) {
  const name = school ? SCHOOL_CREST[school] : undefined;
  if (!name || !school) return null;
  return <Icon name={name} color={SCHOOL_VAR[school] ?? "currentColor"} size={size} title={school} />;
}

/** Item/Gambit type glyph in the trainer accent; nothing for spells/components. */
export function TypeIcon({ type, size = 12 }: { type: string; size?: number }) {
  const name = type === "Item" ? "item" : type === "Gambit" ? "gambit" : null;
  if (!name) return null;
  return <Icon name={name} color={TRAINER_COLOR} size={size} title={type} />;
}

/** A cost string ("VVM") as a row of component pips; renders nothing for empty cost. */
export function Pips({ cost }: { cost: string | null | undefined }) {
  if (!cost) return null;
  return (
    <span className="pips" aria-label={`cost ${cost}`}>
      {[...cost].map((c, i) => (
        <Icon key={i} name={c.toLowerCase()} color={PIP_COLOR[c] ?? "currentColor"} title={c} />
      ))}
    </span>
  );
}
