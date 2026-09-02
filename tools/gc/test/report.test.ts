import { describe, expect, it } from "vitest";
import {
  actionable,
  daysBetween,
  reconcile,
  renderReport,
  slug,
  type Finding,
  type GcState,
} from "../src/report.ts";

function f(partial: Partial<Finding> & { id: string }): Finding {
  return { rule: "R1", title: "x", severity: "next", decision: "schedule", ...partial };
}

describe("slug", () => {
  it("normalizes ids to lowercase tokens", () => {
    expect(slug("R3:packages/engine/src/a.ts:12:TODO")).toBe("r3-packages-engine-src-a-ts-12-todo");
    expect(slug("  A B  C  ")).toBe("a-b-c");
  });
});

describe("daysBetween", () => {
  it("computes whole days", () => {
    expect(daysBetween("2026-08-20T00:00:00.000Z", "2026-08-26T00:00:00.000Z")).toBe(6);
  });
  it("returns 0 on unparseable input", () => {
    expect(daysBetween("not-a-date", "also-not")).toBe(0);
  });
});

describe("reconcile", () => {
  const now = "2026-08-26T00:00:00.000Z";

  it("marks new findings", () => {
    const prev: GcState = { generatedAt: now, sinceDays: 30, findings: [f({ id: "a" })], decisions: {} };
    const out = reconcile(prev, [f({ id: "a" }), f({ id: "b" })], now);
    expect(out.find((x) => x.id === "a")?.new).toBeUndefined();
    expect(out.find((x) => x.id === "b")?.new).toBe(true);
  });

  it("applies unexpired ignores", () => {
    const prev: GcState = {
      generatedAt: now,
      sinceDays: 30,
      findings: [],
      decisions: { a: { reason: "known", recheckAfterDays: 30, decidedAt: "2026-08-01T00:00:00.000Z" } },
    };
    const out = reconcile(prev, [f({ id: "a", severity: "next" })], now);
    expect(out[0]?.severity).toBe("ignore");
    expect(out[0]?.decision).toBe("ignore");
  });

  it("expires stale ignores and resurfaces as new", () => {
    const prev: GcState = {
      generatedAt: now,
      sinceDays: 30,
      findings: [],
      decisions: { a: { reason: "known", recheckAfterDays: 10, decidedAt: "2026-08-01T00:00:00.000Z" } },
    };
    const out = reconcile(prev, [f({ id: "a", severity: "next" })], now);
    expect(out[0]?.severity).toBe("next");
    expect(out[0]?.new).toBe(true);
  });

  it("treats a null previous state as all-new", () => {
    const out = reconcile(null, [f({ id: "a" })], now);
    expect(out[0]?.new).toBe(true);
  });
});

describe("actionable", () => {
  it("filters by severity threshold", () => {
    const items = [
      f({ id: "a", severity: "next" }),
      f({ id: "b", severity: "now" }),
      f({ id: "c", severity: "ignore" }),
    ];
    expect(actionable(items)).toHaveLength(2);
    expect(actionable(items, "now")).toHaveLength(1);
  });
});

describe("renderReport", () => {
  it("renders summary and per-rule sections", () => {
    const state: GcState = {
      generatedAt: "2026-08-26T00:00:00.000Z",
      sinceDays: 30,
      findings: [f({ id: "a", rule: "R1", title: "unused file", file: "x.ts", new: true })],
      decisions: {},
    };
    const md = renderReport(state);
    expect(md).toContain("# GC report — 2026-08-26");
    expect(md).toContain("## R1");
    expect(md).toContain("unused file");
    expect(md).toContain("new");
    expect(md).toContain("x.ts");
  });
});
