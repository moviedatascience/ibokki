/**
 * Tiny tween engine driven off Pixi's ticker. Pixi v8 ships no tweening, and we don't want a heavy
 * dep for placeholder motion. Each tween is a progress-based closure: `onUpdate(easedProgress)` does
 * the interpolation, so we can animate anything (x/y/rotation/alpha/scale/graphics redraws) uniformly.
 *
 * Tweens may carry a `tag`; adding a tween replaces any live tween with the same tag, so re-issuing a
 * card's "move" every sync cleanly supersedes the in-flight one instead of fighting it.
 */

export type Easing = (t: number) => number;

export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic: Easing = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack: Easing = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export interface TweenSpec {
  duration: number;
  delay?: number;
  ease?: Easing;
  tag?: string;
  onUpdate: (p: number) => void;
  onComplete?: () => void;
}

interface Live extends TweenSpec {
  elapsed: number;
}

export class Tweener {
  private items: Live[] = [];

  add(spec: TweenSpec): void {
    if (spec.tag) this.items = this.items.filter((it) => it.tag !== spec.tag);
    this.items.push({ ...spec, elapsed: 0 });
  }

  /**
   * Complete all tweens with `tag` right now: apply their final frame and fire onComplete.
   * Needed where add()'s silent same-tag replacement would drop an onComplete that MUST run
   * (e.g. the exit fade that destroys a leaving card — see PixiBoard.reconcile).
   */
  finish(tag: string): void {
    const done = this.items.filter((it) => it.tag === tag);
    if (!done.length) return;
    this.items = this.items.filter((it) => it.tag !== tag);
    for (const it of done) {
      it.onUpdate((it.ease ?? easeOutCubic)(1));
      it.onComplete?.();
    }
  }

  /** Advance all tweens by `dtMs`. Call once per frame from the ticker. */
  update(dtMs: number): void {
    if (!this.items.length) return;
    const survivors: Live[] = [];
    for (const it of this.items) {
      it.elapsed += dtMs;
      const active = it.elapsed - (it.delay ?? 0);
      if (active < 0) {
        survivors.push(it);
        continue;
      }
      const raw = Math.min(1, active / it.duration);
      const eased = (it.ease ?? easeOutCubic)(raw);
      it.onUpdate(eased);
      if (raw >= 1) it.onComplete?.();
      else survivors.push(it);
    }
    this.items = survivors;
  }

  clear(): void {
    this.items = [];
  }
}
