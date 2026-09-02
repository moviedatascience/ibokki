/**
 * Pure report model + rendering for the GC tool. No I/O here so the logic is
 * unit-testable without spawning knip/npm/git.
 */

export type Severity = "now" | "next" | "ignore";
type Decision = "act" | "schedule" | "ignore";

export interface Finding {
  /** Stable key across runs: `<rule>:<file-or-scope>:<slug>`. */
  id: string;
  rule: string;
  title: string;
  detail?: string;
  file?: string;
  line?: number;
  severity: Severity;
  decision: Decision;
  ageDays?: number;
  /** Set during reconcile when the id was absent from the previous report. */
  new?: boolean;
}

interface IgnoreDecision {
  reason: string;
  recheckAfterDays: number;
  decidedAt: string; // ISO date
}

export interface GcState {
  generatedAt: string; // ISO timestamp
  sinceDays: number;
  findings: Finding[];
  decisions: Record<string, IgnoreDecision>;
}

const SEVERITY_RANK: Record<Severity, number> = { ignore: 0, next: 1, now: 2 };

function severityAtLeast(a: Severity, b: Severity): boolean {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(earlierIso: string, laterIso: string): number {
  const a = Date.parse(earlierIso);
  const b = Date.parse(laterIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / DAY_MS);
}

/** Normalize arbitrary text (paths, symbols) into a stable, lowercase id token. */
export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Mark findings new-vs-previous and apply persisted ignore decisions. An
 * unexpired ignore demotes a finding to `ignore`; an expired one resurfaces it
 * as `[new]`.
 */
export function reconcile(prev: GcState | null, findings: Finding[], nowIso: string): Finding[] {
  const prevIds = new Set(prev?.findings.map((f) => f.id) ?? []);
  const decisions = prev?.decisions ?? {};
  return findings.map((f) => {
    const out: Finding = { ...f };
    if (!prevIds.has(f.id)) out.new = true;
    const dec = decisions[f.id];
    if (dec) {
      const elapsed = daysBetween(dec.decidedAt, nowIso);
      if (elapsed < dec.recheckAfterDays) {
        out.severity = "ignore";
        out.decision = "ignore";
        out.detail = `ignored (rechecks in ${dec.recheckAfterDays - elapsed}d): ${dec.reason}`;
      } else {
        out.new = true;
        out.detail = `${f.detail ?? ""} (ignore expired after ${elapsed}d)`.trim();
      }
    }
    return out;
  });
}

/** Findings at or above the given severity threshold (default `next`). */
export function actionable(findings: Finding[], threshold: Severity = "next"): Finding[] {
  return findings.filter((f) => severityAtLeast(f.severity, threshold));
}

export function renderReport(state: GcState): string {
  const byRule = new Map<string, Finding[]>();
  for (const f of state.findings) {
    const arr = byRule.get(f.rule) ?? [];
    arr.push(f);
    byRule.set(f.rule, arr);
  }
  const count = (s: Severity) => state.findings.filter((f) => f.severity === s).length;

  const lines: string[] = [];
  lines.push(`# GC report — ${state.generatedAt.slice(0, 10)}`);
  lines.push("");
  lines.push(`Generated \`${state.generatedAt}\`, marker-age window ${state.sinceDays}d.`);
  lines.push("");
  lines.push(
    `**Summary:** ${count("now")} now · ${count("next")} next · ${count("ignore")} ignored · ${state.findings.length} total.`,
  );
  lines.push("");
  lines.push("GC never blocks a PR. These are attention, not errors — triage each as");
  lines.push("`act` / `schedule` / `ignore:<reason>`, then fix via normal branch-per-task work.");
  lines.push("");

  for (const rule of [...byRule.keys()].sort()) {
    const fs = (byRule.get(rule) ?? []).slice().sort((a, b) => a.id.localeCompare(b.id));
    lines.push(`## ${rule}`);
    lines.push("");
    for (const f of fs) {
      const tag = f.severity === "now" ? "now" : f.severity === "ignore" ? "ignored" : "next";
      const loc = f.file ? ` — \`${f.file}${f.line !== undefined ? `:${f.line}` : ""}\`` : "";
      const age = f.ageDays !== undefined ? ` (${f.ageDays}d)` : "";
      lines.push(`- [${tag}${f.new ? ", new" : ""}] ${f.title}${age}${loc}`);
      if (f.detail) lines.push(`  - ${f.detail}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}
