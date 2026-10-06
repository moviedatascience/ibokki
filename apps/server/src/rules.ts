/**
 * Rules hash (#76): a fingerprint of everything that decides how a persisted match
 * replays — the rule-bearing card fields and the engine's source. Stamped on every
 * `matches` row at creation. On boot, a live row whose hash differs from the running
 * server's is ABANDONED instead of rehydrated: replaying it under changed rules would
 * silently mutate a match mid-game (only illegal actions throw; a changed damage
 * number does not). Replays of finished rows under a different hash are refused too.
 *
 * Deliberately NOT the git sha: most deploys change the client or the server, not the
 * rules, and those must keep live matches alive (the whole point of persistence).
 * Deliberately excludes card TEXT, names and flavor (a retext pass changes no rule)
 * and engine files that `apply` never reads (presets, deck rules, redaction, search
 * helpers). CRLF-normalised so a Windows checkout and the Linux image agree.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CARDS } from "@ibokki/cards";

const ENGINE_SRC = fileURLToPath(new URL("../../../packages/engine/src/", import.meta.url));

/** Engine files that cannot change how a stored action log replays. */
const RULE_FREE = new Set(["decks.ts", "deckrules.ts", "determinize.ts", "redact.ts", "index.ts"]);

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (name.endsWith(".ts") && !RULE_FREE.has(name)) yield full;
  }
}

export function computeRulesHash(): string {
  const h = createHash("sha256");
  // Rule-bearing card data only: what a card IS to the engine, not what it says.
  h.update(JSON.stringify(CARDS.map((c) => [c.id, c.type, c.level, c.costText, c.tags])));
  if (existsSync(ENGINE_SRC)) {
    for (const file of walk(ENGINE_SRC)) {
      h.update(file.slice(ENGINE_SRC.length).replace(/\\/g, "/"));
      h.update(readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
    }
  }
  return h.digest("hex").slice(0, 16);
}
