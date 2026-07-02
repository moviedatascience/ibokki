/**
 * Static, cast-time card properties read by pushToStack — immutable per card and
 * active *before* the reaction window (so Reactions can't strip them). Effect-time
 * behavior still lives in the effect registry; these are only the "what kind of
 * spell is this on the stack" flags.
 */

/** Cannot be the target of Reactions. */
export const REACTION_PROOF: ReadonlySet<string> = new Set([
  "EVO-012", // Hex Bolt
]);

/** Cannot be cancelled / redirected / reduced by Reactions. */
export const UNSTOPPABLE: ReadonlySet<string> = new Set([
  "EVO-035", // Unstoppable Bolt
  "EVO-045", // Apocalypse
]);

/** This spell's damage cannot be reduced below the given floor. */
export const MIN_DAMAGE: Readonly<Record<string, number>> = {
  "EVO-018": 1, // Lightning Bolt
};
