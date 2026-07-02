/**
 * UI smoke test / screenshotter for the Ibokki board.
 * Loads the running play server, plays a vs-bot game by clicking cards, and saves
 * screenshots at each phase. Doubles as a visual regression check.
 *
 *   (start the server first, e.g. PORT=7799 npm run play)
 *   UI_BASE=http://localhost:7799 node apps/playvsclaude/uitest.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.UI_BASE || "http://localhost:7799";
const OUT = process.env.UI_OUT ||
  "C:/Users/ericd/AppData/Local/Temp/claude/c--Users-ericd-OneDrive-Desktop-Programming-ibokki/ddd68078-22e9-4e8a-a1f0-eb6da56ec2fb/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const log = [];
page.on("console", (m) => { if (m.type() === "error") log.push("PAGE ERROR: " + m.text()); });
page.on("pageerror", (e) => log.push("PAGE EXCEPTION: " + e.message));

const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); console.log("shot", name); };
const statusText = () => page.locator("#status").textContent();
const sleep = (ms) => page.waitForTimeout(ms);

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => {
  const s = document.getElementById("status");
  return s && s.textContent && s.textContent !== "loading…";
}, null, { timeout: 15000 });
// Start a Divination game (most look/loot/scry cards) so the choice prompt is exercised.
await page.selectOption("#p0", "Divination");
await page.click("#new");
await page.waitForFunction(() => {
  const s = document.getElementById("status");
  return s && s.textContent && s.textContent !== "loading…";
}, null, { timeout: 15000 });
await sleep(300);
await shot("01-prepare");
console.log("status:", await statusText());

// Prepare: click spellbook cards, then "Done preparing".
for (let i = 0; i < 5; i++) {
  const card = page.locator("#youSide .card.actionable").first();
  if (await card.count()) { await card.click().catch(() => {}); await sleep(250); } else break;
}
await shot("02-prepared");
const done = page.locator("#actbar button", { hasText: "Done preparing" });
if (await done.count()) { await done.click(); }

// Wait for Main (bot finishes preparing).
await page.waitForFunction(() => {
  const s = document.getElementById("status");
  return s && (/Your turn/.test(s.textContent) || /Game over/.test(s.textContent)) && !/prepare/i.test(s.textContent);
}, null, { timeout: 15000 }).catch(() => {});
await sleep(400);
await shot("03-main");
console.log("status:", await statusText());

// Play loop: resolve choices, click actionable cards (and drop targets), else end the turn.
let lastShot = 0, choiceShot = false;
for (let step = 0; step < 90; step++) {
  const st = await statusText();
  if (/Game over/.test(st)) break;

  // A look/loot/scry choice prompt is up: screenshot it once, then pick a candidate.
  if (/CHOOSE/.test(st)) {
    if (!choiceShot) { await shot("06-choice"); choiceShot = true; console.log("choice prompt:", st); }
    const cand = page.locator("#actbar .card.actionable, #actbar .comp.actionable").first();
    if (await cand.count()) { await cand.click().catch(() => {}); await sleep(300); continue; }
  }
  if (!/Your turn|REACTION|CHOOSE/.test(st)) { await sleep(400); continue; } // waiting on bot

  const trainer = page.locator("#youSide .zone:last-child .card.actionable.clickable").first(); // prefer trainers (trigger choices)
  const card = (await trainer.count()) ? trainer : page.locator("#youSide .card.actionable.clickable").first();
  if (await card.count()) {
    await card.click().catch(() => {});
    await sleep(300);
    const target = page.locator("#youSide .card.target").first(); // attach drop target highlighted
    if (await target.count()) { await target.click().catch(() => {}); await sleep(300); }
  } else {
    const btn = page.locator("#actbar button").filter({ hasText: /End turn|Pass|Done preparing|Mulligan/ }).first();
    if (await btn.count()) { await btn.click().catch(() => {}); await sleep(300); }
    else { await sleep(300); }
  }
  if (step - lastShot >= 15) { await shot(`04-mid-${step}`); lastShot = step; }
}
console.log("choice prompt captured:", choiceShot);
await sleep(500);
await shot("05-final");
console.log("final status:", await statusText());
console.log("page console errors:", log.length ? log : "none");
await browser.close();
