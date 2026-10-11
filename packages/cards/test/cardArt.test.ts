import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CARDS } from "../src/index.ts";

// The client loads web-sized derivatives (art/cards/web/<defId>.jpg), never the 1024x752
// masters — full-res PNGs on every board sprite blew the online e2e deadline on CI.
// `.claude/skills/art/ship-card-art.ps1` builds them; this guard catches a filed winner
// whose derivative was never (re)built.
const dir = resolve(import.meta.dirname, "../../../apps/client/public/art/cards");
const manifest = JSON.parse(readFileSync(resolve(dir, "manifest.json"), "utf8")) as string[];

describe("card art manifest", () => {
  it("lists only real card ids, once each", () => {
    const ids = new Set(CARDS.map((c) => c.id));
    for (const id of manifest) expect(ids.has(id), id).toBe(true);
    expect(new Set(manifest).size).toBe(manifest.length);
  });

  it("has a master and an up-to-date web derivative for every entry", () => {
    for (const id of manifest) {
      const master = resolve(dir, `${id}.png`);
      const web = resolve(dir, "web", `${id}.jpg`);
      expect(existsSync(master), `${id}.png`).toBe(true);
      expect(existsSync(web), `web/${id}.jpg — run .claude/skills/art/ship-card-art.ps1`).toBe(true);
      expect(statSync(web).size, `web/${id}.jpg is not web-sized`).toBeLessThan(200_000);
    }
  });
});
