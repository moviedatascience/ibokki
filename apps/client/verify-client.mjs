/**
 * Headless verification for the React + Pixi client. Drives a full vs-bot flow and screenshots each
 * beat so we can eyeball the mockup layout + animations:
 *   1. initial board (zones)          2. fresh new game
 *   3. prepare a few spells           4. main phase (hand fans in)
 *   5. cast a prepared spell → stack  6. confirm → resolve (+ any damage floater)
 *
 * Start `npm run play` (:7777) and `npm run client` (:5173) first, then:
 *   node apps/client/verify-client.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.CLIENT_BASE || "http://localhost:5173";
const OUT = process.env.CLIENT_OUT ||
  "C:/Users/ericd/AppData/Local/Temp/claude/c--Users-ericd-OneDrive-Desktop-Programming-ibokki/45aa2e24-0edb-4119-8f8c-d86e97803871/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));

const sleep = (ms) => page.waitForTimeout(ms);
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("shot", name); };
const getState = () => page.evaluate(async () => (await fetch("/api/state?side=0")).json());

// Click a world-space point on the Pixi canvas (world is 1280x800, letterboxed & centered in the host).
async function clickWorld(wx, wy) {
  const box = await page.locator(".canvas-host canvas").boundingBox();
  const s = Math.min(box.width / 1280, box.height / 800);
  const ox = (box.width - 1280 * s) / 2;
  const oy = (box.height - 800 * s) / 2;
  await page.mouse.click(box.x + ox + wx * s, box.y + oy + wy * s);
}
const preparedYou = (i) => ({ x: 250 + i * 108 + 46, y: 528 }); // mirror layout.preparedCenter("you", i)

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".canvas-host canvas", { timeout: 15000 });
await sleep(1400);
await shot("01-initial");

// Fresh game.
await page.getByRole("button", { name: "New game" }).click();
await sleep(1600);
await shot("02-newgame");

// Prepare phase: click a few playable spellbook cards, then finish preparing.
let st = await getState();
console.log("after new:", st.phase, "yourTurn", st.yourTurn);
if (st.phase === "prepare") {
  for (let i = 0; i < 4; i++) {
    const card = page.locator(".sbcard.playable").first();
    if (await card.count().catch(() => 0)) {
      await card.click().catch(() => {});
      await sleep(450);
    }
  }
  await shot("03-prepared");
  const done = page.getByRole("button", { name: /Done preparing/ });
  if (await done.count()) { await done.click(); await sleep(1300); }
}
await shot("04-main");

// Cast: find a legal `cast` action's prepared slot and click it on the canvas.
st = await getState();
console.log("main:", st.phase, "yourTurn", st.yourTurn, "legal types", [...new Set(st.legal.map((a) => a.type))].join(","));
const castable = st.legal.find((a) => a.type === "cast");
if (castable && typeof castable.preparedIndex === "number") {
  const p = preparedYou(castable.preparedIndex);
  await clickWorld(p.x, p.y);
  await sleep(1200);
  await shot("05-cast-onstack");
  // Confirm (pass priority) so it resolves.
  const confirm = page.getByRole("button", { name: /Confirm|End turn|Pass/ });
  if (await confirm.count()) { await confirm.first().click(); await sleep(1600); }
  await shot("06-resolved");
} else {
  console.log("no castable spell this turn (ok) — skipping cast beat");
}

console.log(errs.length ? "ERRORS:\n" + errs.join("\n") : "NO CONSOLE ERRORS");
await browser.close();
