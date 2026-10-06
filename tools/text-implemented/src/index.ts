/**
 * Usage:
 *   npm run text-implemented -- status
 *   npm run text-implemented -- stamp <id> [<id>...]
 *   npm run text-implemented -- stamp --all
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, hasFailures, readCards, readLedger, writeLedger } from "./ledger.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [cmd, ...args] = process.argv.slice(2);

if (cmd === "status") {
  const r = buildReport(ROOT);
  const where = (w: string[]) => (w.length ? w.join(", ") : "no register() found");
  for (const d of r.drift) {
    console.log(`DRIFT ${d.id} (${d.name}) - re-check: ${where(d.where)}`);
    console.log(`  was: ${d.before}`);
    console.log(`  now: ${d.after}`);
  }
  for (const m of r.missing) console.log(`MISSING from ledger: ${m.id} (${m.name}) - re-check: ${where(m.where)}`);
  for (const id of r.orphanLedger) console.log(`ORPHAN ledger entry (not in cards.json): ${id}`);
  for (const o of r.orphanRegisters) console.log(`ERROR register("${o.id}") has no card in cards.json: ${o.where}`);
  for (const id of r.textWithoutEffect) console.log(`WARN ${id}: text without an effect (no register() or cardFlags entry)`);
  const bad = hasFailures(r);
  console.log(bad ? "text-implemented: DRIFT/ERRORS found" : "text-implemented: clean");
  process.exit(bad ? 1 : 0);
} else if (cmd === "stamp") {
  const cards = readCards(ROOT);
  const all = args.includes("--all");
  const ledger = { ...readLedger(ROOT).cards };
  const ids = all ? cards.map((c) => c.id) : args;
  if (!ids.length) {
    console.error("usage: stamp <id> [<id>...] | stamp --all");
    process.exit(2);
  }
  const byId = new Map(cards.map((c) => [c.id, c.text]));
  const unknown = ids.filter((id) => !byId.has(id));
  if (unknown.length) {
    console.error(`stamp: not in cards.json: ${unknown.join(", ")}`);
    process.exit(2);
  }
  for (const id of ids) ledger[id] = byId.get(id)!;
  if (all) for (const id of Object.keys(ledger)) if (!byId.has(id)) delete ledger[id];
  writeLedger(ROOT, ledger);
  console.log(`stamped ${ids.length} card(s)`);
} else {
  console.error("usage: text-implemented status | stamp <id>... | stamp --all");
  process.exit(2);
}
