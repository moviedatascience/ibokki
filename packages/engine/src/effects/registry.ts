/** Registry mapping card id -> effect program. */
import { TRAP_REACTIONS } from "../cardFlags.ts";
import type { CardInstance } from "../types.ts";
import type { EffectContext } from "./context.ts";

export type EffectFn = (ctx: EffectContext, card: CardInstance) => void;

const EFFECTS = new Map<string, EffectFn>();

export function register(id: string, fn: EffectFn): void {
  if (EFFECTS.has(id)) throw new Error(`Effect already registered for ${id}`);
  EFFECTS.set(id, fn);
}

export function getEffect(id: string): EffectFn | undefined {
  return EFFECTS.get(id);
}

export function isImplemented(id: string): boolean {
  return EFFECTS.has(id) || TRAP_REACTIONS.has(id);
}

/** All card ids that currently have a real effect (for coverage reporting).
 *  Trap Reactions are implemented in cardFlags/stack, not as effect programs,
 *  so they're unioned in here — the registry alone undercounts them. */
export function implementedIds(): string[] {
  return [...new Set([...EFFECTS.keys(), ...TRAP_REACTIONS])];
}
