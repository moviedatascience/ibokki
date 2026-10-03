/**
 * Which glyph SVGs actually exist under /art/icons? The DOM renders glyphs as CSS
 * masks, which fail silently (a blank box) when the file is missing — and the
 * keyword vocabulary names glyphs that are not drawn yet. Probe each once with an
 * Image load and let consumers fall back to the keyword's abbreviation until the
 * art ships. Pixi has its own loader; this is the DOM side.
 */
import { useEffect, useState } from "react";
import { BASE } from "./api.ts";

const known = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();
const listeners = new Set<() => void>();

export function probeGlyph(name: string): Promise<boolean> {
  const k = known.get(name);
  if (k !== undefined) return Promise.resolve(k);
  let p = pending.get(name);
  if (p) return p;
  p = new Promise<boolean>((resolve) => {
    if (typeof Image === "undefined") return resolve(false);
    const img = new Image();
    const done = (ok: boolean) => {
      known.set(name, ok);
      pending.delete(name);
      for (const l of listeners) l();
      resolve(ok);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = `${BASE}art/icons/${name}.svg`;
  });
  pending.set(name, p);
  return p;
}

/** Synchronous answer: true/false once probed, undefined while unknown. */
export function glyphKnown(name: string): boolean | undefined {
  return known.get(name);
}

/** React: re-renders when any probe settles; kicks off probes for the given names. */
export function useGlyphs(names: readonly string[]): (name: string) => boolean {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    for (const n of names) if (known.get(n) === undefined) void probeGlyph(n);
    return () => {
      listeners.delete(l);
    };
    // names is treated as a stable vocabulary list; a new array each render is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join("|")]);
  return (name: string) => known.get(name) === true;
}
