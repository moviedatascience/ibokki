/**
 * Derives packages/cards/data/tags.json from the engine's effect registrations.
 * Runs automatically after `npm run import-cards`; run `npm run derive-tags`
 * after any change in packages/engine/src/effects/ or cardFlags.ts. The derive
 * test fails when the committed file is stale.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { derive, readInputs } from "./derive.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT_PATH = resolve(REPO_ROOT, "packages/cards/data/tags.json");

const input = readInputs(REPO_ROOT);
const { tags, unmapped } = derive(input);
if (unmapped.length) {
  console.error(`derive-tags: unmapped primitives (add them to tools/derive-tags/src/primitives.ts): ${unmapped.join(", ")}`);
  process.exit(1);
}
const empty = Object.entries(tags)
  .filter(([, t]) => t.length === 0)
  .map(([id]) => id);
writeFileSync(OUT_PATH, JSON.stringify(tags, null, 2) + "\n", "utf8");
const counts: Record<string, number> = {};
for (const t of Object.values(tags).flat()) counts[t] = (counts[t] ?? 0) + 1;
console.log(`Derived tags for ${Object.keys(tags).length} cards -> ${OUT_PATH}`);
console.log(
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${t}:${n}`)
    .join("  "),
);
if (empty.length) console.log(`No tags (no-op, or needs a flag/override?): ${empty.join(", ")}`);
