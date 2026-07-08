import type { CSSProperties } from "react";
import { BASE } from "../api.ts";

/**
 * DOM-side woodcut glyphs (the same art/icons set the Pixi board uses). Rendered via
 * CSS mask so one white SVG tints to any color — see .icn in styles.css.
 */

const PIP_COLOR: Record<string, string> = { V: "var(--v)", S: "var(--s)", M: "var(--m)" };

export function Icon({ name, color, size = 12, title }: { name: string; color: string; size?: number; title?: string }) {
  return (
    <span
      className="icn"
      title={title}
      style={{ width: size, height: size, backgroundColor: color, "--icn": `url(${BASE}art/icons/${name}.svg)` } as CSSProperties}
    />
  );
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
