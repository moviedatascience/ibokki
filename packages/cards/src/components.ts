/**
 * The Resource Deck component catalog (V/S/M).
 *
 * These cards are defined by the design doc's component model (Basic / Dual /
 * Tri), not by the spreadsheet, so they are declared here in code. Same-symbol
 * duals (VV/SS/MM) are what let high-level same-color costs be paid within the
 * 2-card-per-spell cap.
 */
import type { ComponentDef, Cost } from "./types.ts";

function symbols(V: number, S: number, M: number): Cost {
  return { V, S, M };
}

export const COMPONENTS: ComponentDef[] = [
  // Basics (1 symbol)
  { id: "CMP-V", name: "Verbal", kind: "basic", symbols: symbols(1, 0, 0) },
  { id: "CMP-S", name: "Somatic", kind: "basic", symbols: symbols(0, 1, 0) },
  { id: "CMP-M", name: "Material", kind: "basic", symbols: symbols(0, 0, 1) },
  // Same-symbol duals (2 symbols, one color) — the ramp dial for L3/L4 costs
  { id: "CMP-VV", name: "Verbal x2", kind: "dual", symbols: symbols(2, 0, 0) },
  { id: "CMP-SS", name: "Somatic x2", kind: "dual", symbols: symbols(0, 2, 0) },
  { id: "CMP-MM", name: "Material x2", kind: "dual", symbols: symbols(0, 0, 2) },
  // Cross duals (2 symbols, two colors)
  { id: "CMP-VS", name: "Verbal/Somatic", kind: "dual", symbols: symbols(1, 1, 0) },
  { id: "CMP-VM", name: "Verbal/Material", kind: "dual", symbols: symbols(1, 0, 1) },
  { id: "CMP-SM", name: "Somatic/Material", kind: "dual", symbols: symbols(0, 1, 1) },
  // Tri (rare, all three)
  { id: "CMP-VSM", name: "Verbal/Somatic/Material", kind: "tri", symbols: symbols(1, 1, 1) },
];

export const COMPONENTS_BY_ID: Map<string, ComponentDef> = new Map(
  COMPONENTS.map((c) => [c.id, c]),
);

export function getComponent(id: string): ComponentDef | undefined {
  return COMPONENTS_BY_ID.get(id);
}
