/**
 * Error monitoring (board #22): every server fault funnels through
 * Monitor.report — console + a deduped `errors` row + a rate-limited alert
 * mail. The monitor must never throw, whatever state the db/mailer are in.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import { Db } from "../src/db.ts";
import type { Mailer } from "../src/mail.ts";
import { createMonitor } from "../src/monitor.ts";
import { createOnlineServer } from "../src/app.ts";

interface SentMail {
  to: string;
  subject: string;
  text: string;
}

function captureMailer(): Mailer & { sent: SentMail[] } {
  const sent: SentMail[] = [];
  return {
    sent,
    async send(to, subject, text) {
      sent.push({ to, subject, text });
    },
  };
}

describe("monitor", () => {
  beforeEach(() => {
    // report() always mirrors to the console — keep test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("persists errors deduped by scope + message, counting repeats", () => {
    const db = new Db(":memory:");
    const monitor = createMonitor({ db, mailer: captureMailer() });
    monitor.report("ws-message", new Error("boom"), "room ABCDE");
    monitor.report("ws-message", new Error("boom"), "room FGHJK"); // same fault, other room
    monitor.report("api", new Error("boom"));
    const rows = db.errorsSince(0);
    expect(rows).toHaveLength(2);
    const ws = rows.find((r) => r.scope === "ws-message")!;
    expect(ws.count).toBe(2);
    expect(ws.message).toBe("boom");
    expect(ws.stack).toContain("boom");
    expect(rows.find((r) => r.scope === "api")!.count).toBe(1);
    monitor.dispose();
    db.close();
  });

  it("alerts immediately when quiet, then batches within the window", () => {
    vi.useFakeTimers();
    const db = new Db(":memory:");
    const mailer = captureMailer();
    const monitor = createMonitor({ db, mailer, alertTo: "ops@ibokki.com", minIntervalMs: 60_000 });

    monitor.report("http", new Error("first"));
    expect(mailer.sent).toHaveLength(1); // quiet period ⇒ immediate
    expect(mailer.sent[0]!.to).toBe("ops@ibokki.com");
    expect(mailer.sent[0]!.text).toContain("http: first");

    monitor.report("http", new Error("second"));
    monitor.report("http", new Error("second"));
    expect(mailer.sent).toHaveLength(1); // inside the window ⇒ held

    vi.advanceTimersByTime(60_000);
    expect(mailer.sent).toHaveLength(2); // window elapsed ⇒ the batch flushes
    expect(mailer.sent[1]!.subject).toContain("2 server errors");
    expect(mailer.sent[1]!.text).toContain("2× http: second");
    monitor.dispose();
    db.close();
  });

  it("sends no mail without an alert address", () => {
    const db = new Db(":memory:");
    const mailer = captureMailer();
    const monitor = createMonitor({ db, mailer });
    monitor.report("api", new Error("boom"));
    monitor.dispose();
    expect(mailer.sent).toHaveLength(0);
    db.close();
  });

  it("dispose flushes what is still pending", () => {
    vi.useFakeTimers();
    const db = new Db(":memory:");
    const mailer = captureMailer();
    const monitor = createMonitor({ db, mailer, alertTo: "ops@ibokki.com", minIntervalMs: 60_000 });
    monitor.report("api", new Error("early")); // immediate mail 1
    monitor.report("api", new Error("late")); // pending
    monitor.dispose();
    expect(mailer.sent).toHaveLength(2);
    expect(mailer.sent[1]!.text).toContain("api: late");
    db.close();
  });

  it("never throws: closed db and failing mailer degrade to console", () => {
    const db = new Db(":memory:");
    db.close();
    const mailer: Mailer = {
      send: () => Promise.reject(new Error("smtp down")),
    };
    const monitor = createMonitor({ db, mailer, alertTo: "ops@ibokki.com" });
    expect(() => monitor.report("api", new Error("boom"))).not.toThrow();
    expect(() => monitor.report("api", "a plain string reason")).not.toThrow();
    monitor.dispose();
  });

  it("is wired into the online server and its shutdown", async () => {
    const srv = createOnlineServer({ dbFile: ":memory:" });
    await new Promise<void>((res) => srv.http.listen(0, res));
    expect((srv.http.address() as AddressInfo).port).toBeGreaterThan(0);
    srv.monitor.report("test-scope", new Error("wired"), "integration");
    const rows = srv.db.errorsSince(0);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.scope).toBe("test-scope");
    await srv.shutdown(); // disposes the monitor and closes the db without throwing
  });
});
