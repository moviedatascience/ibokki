/**
 * GC CLI: run the mechanical checks, reconcile against the previous state, and
 * write `interop/gc/gc-<date>.md` + `gc-state.json`. Report-only — exit code is
 * 0 unless `--fail-on` is given (used by the weekly workflow to decide whether
 * to notify, never to block a PR).
 *
 *   npm run gc                      # write the report, exit 0
 *   npm run gc -- --json            # also print a JSON summary
 *   npm run gc -- --fail-on next    # exit 1 when there is a `now`/`next` finding
 *   npm run gc -- --fail-on new     # exit 1 on NEW actionable (or any `now`) findings
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks } from "./checks.ts";
import { actionable, reconcile, renderReport } from "./report.ts";
import type { Finding, GcState } from "./report.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_OUT_DIR = join(REPO_ROOT, "interop", "gc");

interface Args {
  sinceDays: number;
  outputDir: string;
  json: boolean;
  failOn: "none" | "now" | "next" | "new";
}

function parseArgs(argv: string[]): Args {
  const args: Args = { sinceDays: 30, outputDir: DEFAULT_OUT_DIR, json: false, failOn: "none" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = argv[i + 1];
    if (a === "--since" && v) {
      const n = Number(v);
      args.sinceDays = Number.isFinite(n) && n > 0 ? n : args.sinceDays;
      i++;
    } else if (a === "--output" && v) {
      args.outputDir = resolve(REPO_ROOT, v);
      i++;
    } else if (a === "--json") {
      args.json = true;
    } else if (a === "--fail-on" && v) {
      if (v === "now" || v === "next" || v === "new" || v === "none") args.failOn = v;
      i++;
    }
  }
  return args;
}

function loadPrevState(outputDir: string): GcState | null {
  const p = join(outputDir, "gc-state.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as GcState;
  } catch {
    return null;
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const nowIso = new Date().toISOString();
  const prev = loadPrevState(args.outputDir);

  const raw = runChecks({ repoRoot: REPO_ROOT, sinceDays: args.sinceDays });
  const findings = reconcile(prev, raw, nowIso);
  const state: GcState = {
    generatedAt: nowIso,
    sinceDays: args.sinceDays,
    findings,
    decisions: prev?.decisions ?? {},
  };

  mkdirSync(args.outputDir, { recursive: true });
  const date = nowIso.slice(0, 10);
  writeFileSync(join(args.outputDir, `gc-${date}.md`), renderReport(state), "utf8");
  writeFileSync(join(args.outputDir, "gc-state.json"), JSON.stringify(state, null, 2) + "\n", "utf8");

  const nowCount = findings.filter((f) => f.severity === "now").length;
  const nextCount = findings.filter((f) => f.severity === "next").length;
  const ignoredCount = findings.filter((f) => f.severity === "ignore").length;
  const newCount = findings.filter((f) => f.new).length;
  const newActionableCount = findings.filter((f) => f.new && f.severity !== "ignore").length;

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          generatedAt: nowIso,
          total: findings.length,
          actionable: actionable(findings).length,
          now: nowCount,
          next: nextCount,
          ignored: ignoredCount,
          new: newCount,
          newActionable: newActionableCount,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`GC report: ${findings.length} findings (${nowCount} now, ${nextCount} next, ${ignoredCount} ignored, ${newCount} new).`);
    console.log(`Wrote ${join(args.outputDir, `gc-${date}.md`)}`);
  }

  if (args.failOn === "now" && nowCount > 0) process.exitCode = 1;
  else if (args.failOn === "next" && actionable(findings).length > 0) process.exitCode = 1;
  else if (args.failOn === "new" && (newActionableCount > 0 || nowCount > 0)) process.exitCode = 1;
}

main();
