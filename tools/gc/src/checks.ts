/**
 * Mechanical GC checks. Each returns findings; external commands (knip, tsc,
 * npm, git) are wrapped so a missing binary or a sandbox restriction degrades
 * to a "skipped" finding rather than crashing the whole report.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { daysBetween, slug } from "./report.ts";
import type { Finding, Severity } from "./report.ts";

interface CheckContext {
  repoRoot: string;
  sinceDays: number;
}

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "coverage",
  "test-results",
  "playwright-report",
  ".sessions",
]);

const CODE_EXTS = new Set([".ts", ".tsx", ".mjs", ".js"]);
const MARKER_RE = /\b(TODO|FIXME|HACK)\b|@deprecated\b/i;
const SIMPLIFIED_RE = /\bSIMPLIFIED\b/;

const MAX_PER_CHECK = 100;

function extOf(p: string): string {
  const i = p.lastIndexOf(".");
  return i < 0 ? "" : p.slice(i);
}

function walk(dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let isDir: boolean;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }
    if (isDir) walk(full, out);
    else out.push(full);
  }
}

interface RunResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
  launchError?: string;
}

function run(ctx: CheckContext, cmd: string, args: string[]): RunResult {
  try {
    // On Windows, `.cmd`/`.bat` shims (node_modules/.bin) and npm are not directly
    // executable, so route them through cmd.exe — equivalent to shell:true but without
    // the DEP0190 deprecation warning. All args are hardcoded, never user input.
    const win = process.platform === "win32";
    const r = win
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", cmd, ...args], {
          cwd: ctx.repoRoot,
          encoding: "utf8",
          timeout: 120_000,
          windowsHide: true,
        })
      : spawnSync(cmd, args, { cwd: ctx.repoRoot, encoding: "utf8", timeout: 120_000 });
    return {
      ok: r.status === 0,
      code: r.status ?? null,
      stdout: r.stdout ?? "",
      stderr: r.stderr ?? "",
      launchError: r.error ? (r.error.message ?? String(r.error)) : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      code: null,
      stdout: "",
      stderr: "",
      launchError: e instanceof Error ? e.message : String(e),
    };
  }
}

function localBin(ctx: CheckContext, name: string): string {
  const base = join(ctx.repoRoot, "node_modules", ".bin");
  return process.platform === "win32" ? join(base, `${name}.cmd`) : join(base, name);
}

function npmCmd(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function skipped(rule: string, check: string, reason: string): Finding {
  return {
    id: slug(`${rule}:skipped:${check}`),
    rule,
    title: `${check} skipped`,
    detail: reason.slice(0, 200),
    severity: "next",
    decision: "schedule",
  };
}

function cap(list: Finding[]): Finding[] {
  return list.slice(0, MAX_PER_CHECK);
}

// --- R1: dead exports / files / scripts (knip) ---

interface KnipRef {
  name: string;
  line?: number;
  col?: number;
}
interface KnipIssue {
  file?: string;
  binaries?: KnipRef[];
  dependencies?: KnipRef[];
  devDependencies?: KnipRef[];
  duplicates?: KnipRef[];
  enumMembers?: KnipRef[];
  exports?: KnipRef[];
  files?: KnipRef[];
  types?: KnipRef[];
  unresolved?: KnipRef[];
}
interface KnipReport {
  issues?: KnipIssue[];
}

function knipFindings(ctx: CheckContext): Finding[] {
  const r = run(ctx, localBin(ctx, "knip"), ["--no-progress", "--reporter", "json"]);
  if (r.launchError) return [skipped("R1", "knip", r.launchError)];

  let parsed: KnipReport | null = null;
  try {
    parsed = JSON.parse(r.stdout) as KnipReport;
  } catch {
    parsed = null;
  }

  if (!parsed) {
    const text = (r.stdout || r.stderr || "").trim();
    if (!text) return [];
    return [
      {
        id: slug("R1:knip-summary"),
        rule: "R1",
        title: "knip reported issues (see excerpt)",
        detail: text.split("\n").slice(0, 12).join(" | "),
        severity: "next",
        decision: "schedule",
      },
    ];
  }

  const findings: Finding[] = [];
  const push = (kind: string, file: string, name: string): void => {
    findings.push({
      id: slug(`R1:${kind}:${file}:${name}`),
      rule: "R1",
      title: `unused ${kind} \`${name}\``,
      file,
      severity: "next",
      decision: "schedule",
    });
  };

  for (const issue of parsed.issues ?? []) {
    const file = issue.file ?? "?";
    for (const ref of issue.files ?? []) {
      findings.push({
        id: slug(`R1:file:${ref.name}`),
        rule: "R1",
        title: "unused file",
        file: ref.name,
        severity: "next",
        decision: "schedule",
      });
    }
    for (const ref of issue.exports ?? []) push("export", file, ref.name);
    for (const ref of issue.types ?? []) push("type export", file, ref.name);
    for (const ref of issue.dependencies ?? []) push("dependency", file, ref.name);
    for (const ref of issue.devDependencies ?? []) push("devDependency", file, ref.name);
    for (const ref of issue.binaries ?? []) push("binary", file, ref.name);
    for (const ref of issue.enumMembers ?? []) push("enum member", file, ref.name);
    for (const ref of issue.duplicates ?? []) push("duplicate export", file, ref.name);
    for (const ref of issue.unresolved ?? []) push("unresolved import", file, ref.name);
  }
  return cap(findings);
}

// --- R2: unused locals / params (tsc, report-only) ---

const TSC_ERROR_RE = /^(.+?)\((\d+),(\d+)\): error TS(\d+): (.*)$/;

function unusedLocalsFindings(ctx: CheckContext): Finding[] {
  const r = run(ctx, localBin(ctx, "tsc"), [
    "-p",
    "tsconfig.json",
    "--noUnusedLocals",
    "--noUnusedParameters",
  ]);
  if (r.launchError) return [skipped("R2", "tsc --noUnusedLocals", r.launchError)];

  // The base `npm run typecheck` is green, so any error from a run that only
  // ADDS the two unused flags is an unused-local/param diagnostic.
  const byFile = new Map<string, { count: number; sample: string }>();
  for (const line of (r.stdout || r.stderr || "").split("\n")) {
    const m = TSC_ERROR_RE.exec(line);
    if (!m) continue;
    const file = m[1];
    if (!file) continue;
    const cur = byFile.get(file) ?? { count: 0, sample: line.trim() };
    cur.count++;
    byFile.set(file, cur);
  }
  if (byFile.size === 0) return [];

  const findings: Finding[] = [];
  for (const [file, v] of byFile) {
    findings.push({
      id: slug(`R2:${file}`),
      rule: "R2",
      title: `${v.count} unused local/param diagnostic${v.count === 1 ? "" : "s"}`,
      detail: v.sample,
      file,
      severity: "next",
      decision: "schedule",
    });
  }
  return cap(findings);
}

// --- R3: marker aging ---

function fileAge(ctx: CheckContext, absPath: string, rel: string): number | undefined {
  const r = run(ctx, "git", ["log", "-1", "--format=%cI", "--", rel]);
  const iso = r.stdout.trim();
  if (r.ok && iso) {
    const d = daysBetween(iso, new Date().toISOString());
    if (d >= 0) return d;
  }
  try {
    return Math.round((Date.now() - statSync(absPath).mtimeMs) / 86_400_000);
  } catch {
    return undefined;
  }
}

/** Extract comment text per 1-based line, tracking `/* ... *​/` blocks. */
function commentLines(text: string): Map<number, string> {
  const map = new Map<number, string>();
  const lines = text.split("\n");
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    let comment = "";
    if (inBlock) {
      const end = line.indexOf("*/");
      if (end >= 0) {
        comment = line.slice(0, end);
        inBlock = false;
      } else {
        comment = line;
      }
    } else {
      const bc = line.indexOf("/*");
      const lc = line.indexOf("//");
      if (bc >= 0 && (lc < 0 || bc < lc)) {
        const end = line.indexOf("*/", bc + 2);
        if (end >= 0) comment = line.slice(bc, end);
        else {
          comment = line.slice(bc);
          inBlock = true;
        }
      } else if (lc >= 0) {
        comment = line.slice(lc);
      }
    }
    if (comment.length > 0) map.set(i + 1, comment);
  }
  return map;
}

function markerFindings(ctx: CheckContext): Finding[] {
  const findings: Finding[] = [];
  const files: string[] = [];
  walk(ctx.repoRoot, files);
  const code = files.filter((p) => CODE_EXTS.has(extOf(p)));
  const ageCache = new Map<string, number | undefined>();

  for (const file of code) {
    const rel = relative(ctx.repoRoot, file).replace(/\\/g, "/");
    if (rel.startsWith("playtests/")) continue;
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const [lineNo, comment] of commentLines(text)) {
      const m = MARKER_RE.exec(comment);
      if (!m) continue;
      const marker = m[0];
      if (!ageCache.has(rel)) ageCache.set(rel, fileAge(ctx, file, rel));
      findings.push({
        id: slug(`R3:${rel}:${lineNo}:${marker}`),
        rule: "R3",
        title: `${marker} marker`,
        detail: comment.trim().slice(0, 160),
        file: rel,
        line: lineNo,
        severity: "next",
        decision: "schedule",
        ageDays: ageCache.get(rel),
      });
    }
  }
  return cap(findings);
}

// --- R4: dependencies (npm outdated / audit) ---

interface OutdatedEntry {
  current?: string;
  wanted?: string;
  latest?: string;
}
interface AuditMetadata {
  vulnerabilities?: Record<string, number>;
}
interface AuditVuln {
  severity?: string;
  isDirect?: boolean;
}
interface AuditReport {
  metadata?: AuditMetadata;
  vulnerabilities?: Record<string, AuditVuln>;
}

function outdatedFindings(ctx: CheckContext): Finding[] {
  const r = run(ctx, npmCmd(), ["outdated", "--json"]);
  if (r.launchError) return [skipped("R4", "npm outdated", r.launchError)];
  if (!r.stdout.trim()) {
    if (!r.ok) return [skipped("R4", "npm outdated", r.stderr.slice(0, 200) || "non-zero exit, no output")];
    return [];
  }
  let parsed: Record<string, OutdatedEntry>;
  try {
    parsed = JSON.parse(r.stdout) as Record<string, OutdatedEntry>;
  } catch {
    return [skipped("R4", "npm outdated", "unparseable JSON output")];
  }
  const findings: Finding[] = [];
  for (const [name, e] of Object.entries(parsed)) {
    findings.push({
      id: slug(`R4:outdated:${name}`),
      rule: "R4",
      title: `${name} outdated`,
      detail: `${e.current ?? "?"} → wanted ${e.wanted ?? "?"} → latest ${e.latest ?? "?"}`,
      severity: "next",
      decision: "schedule",
    });
  }
  return cap(findings);
}

function auditFindings(ctx: CheckContext): Finding[] {
  const r = run(ctx, npmCmd(), ["audit", "--json"]);
  if (r.launchError) return [skipped("R4", "npm audit", r.launchError)];
  if (!r.stdout.trim()) {
    if (!r.ok) return [skipped("R4", "npm audit", r.stderr.slice(0, 200) || "non-zero exit, no output")];
    return [];
  }
  let parsed: AuditReport;
  try {
    parsed = JSON.parse(r.stdout) as AuditReport;
  } catch {
    return [skipped("R4", "npm audit", "unparseable JSON output")];
  }
  const c = parsed.metadata?.vulnerabilities ?? {};
  const critical = c.critical ?? 0;
  const high = c.high ?? 0;
  const moderate = c.moderate ?? 0;
  const low = c.low ?? 0;
  const total = critical + high + moderate + low;
  if (total === 0) return [];

  const sev: Severity = critical > 0 || high > 0 ? "now" : "next";
  const findings: Finding[] = [
    {
      id: "R4:audit",
      rule: "R4",
      title: `${total} npm audit advisorie${total === 1 ? "" : "s"}`,
      detail: `critical ${critical}, high ${high}, moderate ${moderate}, low ${low}`,
      severity: sev,
      decision: sev === "now" ? "act" : "schedule",
    },
  ];
  for (const [name, v] of Object.entries(parsed.vulnerabilities ?? {})) {
    if (v.severity === "high" || v.severity === "critical") {
      findings.push({
        id: slug(`R4:audit:${name}`),
        rule: "R4",
        title: `${name}: ${v.severity} advisory`,
        detail: `direct dependency: ${v.isDirect ?? false}`,
        severity: "now",
        decision: "act",
      });
    }
  }
  return cap(findings);
}

// --- R6: artifact accretion ---

function countDirect(dir: string, ext: string): number {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return 0;
  }
  let n = 0;
  for (const name of entries) {
    const full = join(dir, name);
    try {
      if (statSync(full).isFile() && (ext === "" || name.endsWith(ext))) n++;
    } catch {
      // ignore unreadable entries
    }
  }
  return n;
}

function countRecursive(dir: string): number {
  const files: string[] = [];
  walk(dir, files);
  return files.length;
}

function accretionFindings(ctx: CheckContext): Finding[] {
  const targets: { dir: string; label: string; max: number; recursive: boolean; ext: string }[] = [
    { dir: "playtests", label: "playtests (top-level .md)", max: 100, recursive: false, ext: ".md" },
    { dir: "playtests/archive", label: "playtests/archive", max: 80, recursive: false, ext: ".md" },
    { dir: "art/review", label: "art/review", max: 20, recursive: true, ext: "" },
    { dir: ".dsh/notes", label: ".dsh/notes", max: 30, recursive: true, ext: "" },
  ];
  const findings: Finding[] = [];
  for (const t of targets) {
    const full = join(ctx.repoRoot, t.dir);
    if (!existsSync(full)) continue;
    const count = t.recursive ? countRecursive(full) : countDirect(full, t.ext);
    if (count > t.max) {
      findings.push({
        id: slug(`R6:${t.label}`),
        rule: "R6",
        title: `${t.label} holds ${count} files (cap ${t.max})`,
        detail: "archive/delete or raise the cap in GC.md",
        severity: "next",
        decision: "schedule",
      });
    }
  }
  return findings;
}

// --- R8: SIMPLIFIED convention (the standing suspect list) ---

function simplifiedFindings(ctx: CheckContext): Finding[] {
  const findings: Finding[] = [];
  const engineDir = join(ctx.repoRoot, "packages", "engine");
  const files: string[] = [];
  walk(engineDir, files);
  for (const file of files.filter((p) => CODE_EXTS.has(extOf(p)))) {
    const rel = relative(ctx.repoRoot, file).replace(/\\/g, "/");
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      if (!SIMPLIFIED_RE.test(line)) continue;
      findings.push({
        id: slug(`R8:${rel}:${i + 1}`),
        rule: "R8",
        title: "SIMPLIFIED stand-in (the live-bug suspect list)",
        detail: line.trim().slice(0, 160),
        file: rel,
        line: i + 1,
        severity: "next",
        decision: "schedule",
      });
    }
  }
  return cap(findings);
}

export function runChecks(ctx: CheckContext): Finding[] {
  const checks: { rule: string; run: (c: CheckContext) => Finding[] }[] = [
    { rule: "R1", run: knipFindings },
    { rule: "R2", run: unusedLocalsFindings },
    { rule: "R3", run: markerFindings },
    { rule: "R4", run: (c) => [...outdatedFindings(c), ...auditFindings(c)] },
    { rule: "R6", run: accretionFindings },
    { rule: "R8", run: simplifiedFindings },
  ];
  const out: Finding[] = [];
  for (const c of checks) {
    try {
      out.push(...c.run(ctx));
    } catch (e) {
      out.push(skipped(c.rule, "check", e instanceof Error ? e.message : String(e)));
    }
  }
  return out;
}
