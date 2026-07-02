/**
 * Deterministic PRNG (mulberry32). State is a single uint32 carried inside the
 * game state, so a given seed + action log always reproduces the same game.
 * The engine must never use Math.random / Date.now — only this.
 */

/** Advance the PRNG. Returns [float in [0,1), nextState]. */
export function rngNext(state: number): [number, number] {
  let a = state | 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, a];
}

/** Integer in [0, n). Returns [int, nextState]. */
export function rngInt(state: number, n: number): [number, number] {
  const [f, next] = rngNext(state);
  return [Math.floor(f * n), next];
}

/** Fisher-Yates shuffle in place. Returns the next PRNG state. */
export function shuffleInPlace<T>(arr: T[], state: number): number {
  let s = state;
  for (let i = arr.length - 1; i > 0; i--) {
    let j: number;
    [j, s] = rngInt(s, i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return s;
}
