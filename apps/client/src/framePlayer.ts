/**
 * Frame player (#78): the server streams one frame per action — the human's own, then
 * each bot move, each timeout line — and this queue presents them ONE AT A TIME. A
 * frame is handed to React (`onShown`) only after the board has finished playing it,
 * so legal actions, the prompt and the action bar never jump ahead of what the table
 * shows; the transcript advances with the animation, not before it (OpenSky's
 * `syncState`-behind-the-animations rule).
 *
 * Speed: a backlog means the player is behind (a long bot turn, a tab that was
 * hidden), so the presenter runs faster the deeper the queue — the opponent's turn is
 * paced beat by beat, but a ten-move burst never takes ten seconds. A hidden tab
 * fast-forwards outright.
 *
 * Refreshes: a frame with the SAME epoch as the newest one we hold (a local poll, a
 * stale-act resync, an error echo) is never a new beat — it replaces that frame
 * quietly, events dropped, so polling can't re-fire animations.
 */
import type { MatchState } from "./api.ts";

export interface FramePresenter {
  /** Draw `frame` and play its events; resolves once the beat has landed (dwell included). */
  present(frame: MatchState, speed: number): Promise<void>;
  /** Change the speed of the presentation in flight (catch-up). */
  setSpeed(speed: number): void;
}

export class FramePlayer {
  private queue: MatchState[] = [];
  private shown: MatchState | null = null;
  /** A same-epoch refresh that arrived while its frame was still being presented. */
  private refresh: MatchState | null = null;
  private pumping = false;
  private presenter: FramePresenter | null = null;
  /** Debug / e2e: a fixed playback rate (machine-speed drivers set 20); null = adaptive. */
  speedOverride: number | null = null;

  constructor(private readonly onShown: (frame: MatchState | null, busy: boolean) => void) {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => this.presenter?.setSpeed(this.speed()));
    }
  }

  /** The frame the player is looking at (what `act` must echo as its epoch). */
  get current(): MatchState | null {
    return this.shown;
  }

  /** Frames still waiting to be presented. */
  get backlog(): number {
    return this.queue.length;
  }

  attach(p: FramePresenter): void {
    this.presenter = p;
    // A board mounting mid-match paints what the player already shows, without replaying it.
    if (this.shown) void p.present({ ...this.shown, events: [] }, 1);
    void this.pump();
  }

  detach(p: FramePresenter): void {
    if (this.presenter === p) this.presenter = null;
  }

  /** Forget everything (leaving a match / starting a new one). */
  reset(): void {
    this.queue = [];
    this.refresh = null;
    this.shown = null;
    this.onShown(null, false);
  }

  push(frame: MatchState): void {
    const tail = this.queue.length ? this.queue[this.queue.length - 1]! : this.shown;
    if (tail && tail.epoch === frame.epoch) {
      const quiet = { ...frame, events: [] };
      if (this.queue.length) {
        this.queue[this.queue.length - 1] = quiet;
      } else if (this.pumping) {
        this.refresh = quiet; // applied as soon as the in-flight presentation lands
      } else {
        this.shown = quiet;
        void this.presenter?.present(quiet, 1);
        this.onShown(quiet, false);
      }
      return;
    }
    this.queue.push(frame);
    this.presenter?.setSpeed(this.speed()); // a growing backlog speeds up the beat in flight
    void this.pump();
  }

  private speed(): number {
    if (this.speedOverride !== null) return this.speedOverride;
    if (typeof document !== "undefined" && document.hidden) return 8;
    const n = this.queue.length;
    return n >= 6 ? 4 : n >= 3 ? 2.5 : n >= 1 ? 1.5 : 1;
  }

  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;
    try {
      while (this.queue.length) {
        const frame = this.queue.shift()!;
        if (this.presenter) {
          try {
            await this.presenter.present(frame, this.speed());
          } catch {
            /* a presenter that died mid-beat must not stall the match */
          }
        }
        const refreshed = this.refresh && this.refresh.epoch === frame.epoch ? this.refresh : null;
        this.refresh = null;
        this.shown = refreshed ?? frame;
        if (refreshed) void this.presenter?.present(refreshed, 1);
        this.onShown(this.shown, this.queue.length > 0);
      }
    } finally {
      this.pumping = false;
    }
  }
}
