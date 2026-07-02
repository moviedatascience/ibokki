/**
 * Effect registry entry point. Importing this module registers every card's
 * effect (via side-effecting imports of each school file). Anything that needs
 * to resolve a card effect imports getEffect from here.
 */
import "./evocation.ts";
import "./divination.ts";
import "./abjuration.ts";
import "./trainers.ts";

export { getEffect, isImplemented, implementedIds } from "./registry.ts";
export { makeContext, type EffectContext } from "./context.ts";
