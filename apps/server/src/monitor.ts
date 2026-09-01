/**
 * Minimal production error monitoring (board #22). Every server error funnels
 * through `Monitor.report(scope, err)`, which
 *   1. logs to the console (docker logs — unchanged from the old console.error),
 *   2. persists a deduped row in the `errors` table (fingerprint = scope + first
 *      line of the message) so incidents survive restarts and are inspectable
 *      with plain sqlite3, and
 *   3. emails IBOKKI_ALERT_EMAIL through the same SMTP mailer the account flows
 *      use — rate-limited to one mail per window, everything in between batched
 *      into the next one (first error of a quiet period alerts immediately).
 * With no alert address configured (local dev / tests) it is console + DB only.
 * Monitoring must never take the server down: report() swallows its own
 * failures, degrading to plain console output.
 */
import type { Db } from "./db.ts";
import type { Mailer } from "./mail.ts";

export interface MonitorOptions {
  db: Db;
  mailer: Mailer;
  /** Alert destination; unset ⇒ no mail, console + DB only. */
  alertTo?: string;
  /** Minimum gap between alert mails. Default 15 minutes. */
  minIntervalMs?: number;
}

export interface Monitor {
  /**
   * Record one error. `context` (room code etc.) is logged and mailed but kept
   * out of the fingerprint, so the same fault dedupes across rooms/requests.
   */
  report(scope: string, err: unknown, context?: string): void;
  /** Stop the alert timer, flushing a final mail if reports are pending. */
  dispose(): void;
}

const DEFAULT_MIN_INTERVAL_MS = 15 * 60_000;
const MAX_MESSAGE = 500;
const MAX_STACK = 4000;

interface PendingAlert {
  scope: string;
  message: string;
  context?: string;
  count: number;
}

export function createMonitor(opts: MonitorOptions): Monitor {
  const minIntervalMs = opts.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const pending = new Map<string, PendingAlert>();
  let lastSentAt = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  function flush(): void {
    timer = null;
    if (!opts.alertTo || pending.size === 0) return;
    const items = [...pending.values()];
    pending.clear();
    lastSentAt = Date.now();
    const total = items.reduce((n, p) => n + p.count, 0);
    const subject = `[ibokki] ${total} server error${total === 1 ? "" : "s"}`;
    const body = items
      .map((p) => `${p.count}× ${p.scope}: ${p.message}${p.context ? `\n   last context: ${p.context}` : ""}`)
      .join("\n\n");
    opts.mailer
      .send(opts.alertTo, subject, `${body}\n\nFull stacks: the errors table in the server SQLite DB (and docker logs).`)
      .catch((err) => console.error("alert mail failed:", err));
  }

  return {
    report(scope, err, context) {
      try {
        console.error(`[${scope}]${context ? ` (${context})` : ""}`, err);
        const message = (err instanceof Error ? err.message : String(err)).slice(0, MAX_MESSAGE);
        const stack = (err instanceof Error ? (err.stack ?? "") : "").slice(0, MAX_STACK);
        const fingerprint = `${scope}:${message.split("\n")[0]}`.slice(0, 200);
        try {
          opts.db.recordError(fingerprint, scope, message, stack);
        } catch (dbErr) {
          console.error("monitor: failed to persist error:", dbErr);
        }
        if (!opts.alertTo || disposed) return;
        const cur = pending.get(fingerprint);
        if (cur) {
          cur.count++;
          if (context) cur.context = context;
        } else {
          pending.set(fingerprint, { scope, message, context, count: 1 });
        }
        const wait = lastSentAt + minIntervalMs - Date.now();
        if (wait <= 0) {
          flush();
        } else if (!timer) {
          timer = setTimeout(flush, wait);
          timer.unref?.();
        }
      } catch (reportErr) {
        console.error("monitor: report failed:", reportErr);
      }
    },
    dispose() {
      disposed = true;
      if (timer) clearTimeout(timer);
      timer = null;
      flush(); // the process is likely going away — send what's pending now
    },
  };
}
