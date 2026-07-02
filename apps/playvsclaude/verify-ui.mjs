/**
 * Focused verification for the UI-improvement pass:
 *   1. Stack & reaction clarity  — glowing reaction target + clearer prompt
 *   2. Event animations          — floating combat text + hit/heal/ward flashes
 *   3. Drag-and-drop attach       — drag a hand component onto a prepared spell
 *   4. Layout & readability       — full-board screenshot
 *
 *   (start the server first, e.g. PORT=7799 npm run play)
 *   UI_BASE=http://localhost:7799 node apps/playvsclaude/verify-ui.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.UI_BASE || "http://localhost:7799";
const OUT = process.env.UI_OUT ||
  "C:/Users/ericd/AppData/Local/Temp/claude/c--Users-ericd-OneDrive-Desktop-Programming-ibokki/ddd68078-22e9-4e8a-a1f0-eb6da56ec2fb/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push("PAGE ERROR: " + m.text()); });
page.on("pageerror", (e) => errs.push("PAGE EXCEPTION: " + e.message));

const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); console.log("shot", name); };
const status = () => page.locator("#status").textContent();
const sleep = (ms) => page.waitForTimeout(ms);
const waitStatus = (re, t = 15000) =>
  page.waitForFunction((src) => { const s = document.getElementById("status"); return s && new RegExp(src).test(s.textContent); }, re.source, { timeout: t }).catch(() => {});

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await waitStatus(/[^…]/);

// Evocation (you) vs Abjuration (bot): produces damage (animations) and bot reactions (stack).
await page.selectOption("#p0", "Evocation");
await page.selectOption("#p1", "Abjuration");
await page.click("#new");
await waitStatus(/prepare|Your turn/);
await sleep(300);

// --- Prepare a few spells ---
for (let i = 0; i < 5; i++) {
  const c = page.locator("#youSide .card.actionable").first();
  if (await c.count()) { await c.click().catch(() => {}); await sleep(200); } else break;
}
const done = page.locator("#actbar button", { hasText: "Done preparing" });
if (await done.count()) await done.click();
await waitStatus(/Your turn|Game over/);
await sleep(400);
await shot("v1-board-main");
console.log("main status:", await status());

// --- 2. Event animations (synthetic batch, screenshot mid-flight) ---
const floats = await page.evaluate(() => {
  window.animateEvents([
    { type: "damage", target: 1, amount: 7 },
    { type: "healed", player: 0, amount: 4 },
    { type: "wardCreated", player: 0, hp: 5 },
    { type: "burnTick", player: 1, amount: 2 },
    { type: "spellResolved", controller: 0, spellDefId: "EVO-001" },
  ]);
  return document.querySelectorAll("#fx .float").length;
});
await sleep(180); // catch the numbers mid-rise
await shot("v3-animations");
console.log("floating combat-text elements spawned:", floats);

// Helper: legal attach actions on P0's turn right now (read straight from the server).
const attachOptions = () => page.evaluate(async () => {
  const s = await (await fetch("/api/state?side=0")).json();
  return (s.legal || []).filter((a) => a.type === "attach").map((a) => ({ defId: a.defId, pi: a.preparedIndex }));
});

// --- 1. Stack & reaction clarity + 3. Drag-and-drop attach: drive the game until all captured. ---
let dragOk = null, sawReaction = false, sawOwnStack = false, reactGlow = 0;
for (let step = 0; step < 160 && !(dragOk !== null && sawReaction && sawOwnStack); step++) {
  const st = await status();
  if (/Game over/.test(st)) break;

  if (/REACTION WINDOW/.test(st)) {
    reactGlow = await page.locator("#stackZone .card.reacttarget").count();
    if (!sawReaction) { await shot("v4-reaction-window"); sawReaction = true; console.log("reaction status:", st, "| glowing target cards:", reactGlow); }
    const react = page.locator("#youSide .card.actionable.clickable").first();
    if (await react.count()) { await react.click().catch(() => {}); await sleep(250); }
    const pass = page.locator("#actbar button").filter({ hasText: /Pass/ }).first();
    if (await pass.count()) { await pass.click().catch(() => {}); await sleep(250); }
    continue;
  }
  if (/CHOOSE/.test(st)) {
    const cand = page.locator("#actbar .card.actionable, #actbar .comp.actionable").first();
    if (await cand.count()) { await cand.click().catch(() => {}); await sleep(250); }
    continue;
  }
  if (!/Your turn/.test(st)) { await sleep(350); continue; }

  // Your turn. Priority: (a) drag-attach test once, (b) cast to see own stack once, (c) click-attach, (d) end turn.
  const attach = await attachOptions();
  if (dragOk === null && attach.length) {
    const { defId, pi } = attach[0];
    const src = page.locator(`#youSide .comp[data-def="${defId}"]`).first();
    const dst = page.locator("#youSide .zone").first().locator(".card").nth(pi); // first zone = prepared spells
    const before = await dst.locator(".att").count();
    if (await src.count() && await dst.count()) {
      await src.dragTo(dst);
      await sleep(500);
      const after = await page.locator("#youSide .zone").first().locator(".card").nth(pi).locator(".att").count();
      dragOk = after > before;
      console.log(`drag-attach: pips ${before} -> ${after} (${dragOk ? "OK" : "no change"})`);
      await shot("v2-drag-attached");
      continue;
    }
  }

  const cast = page.locator("#youSide .zone").first().locator(".card.actionable.clickable").first();
  if (!sawOwnStack && await cast.count()) {
    await cast.click().catch(() => {});
    await sleep(300);
    const retract = page.locator("#actbar button").filter({ hasText: /Retract/ });
    if (await retract.count()) { await shot("v5-own-stack"); sawOwnStack = true; console.log("own spell on stack captured"); }
    const confirm = page.locator("#actbar button").filter({ hasText: /Confirm/ }).first();
    if (await confirm.count()) { await confirm.click().catch(() => {}); await sleep(300); }
    continue;
  }

  // Click-attach any remaining component so slots fill and the round progresses.
  const comp = page.locator('#youSide .comp[draggable="true"]').first();
  if (await comp.count()) {
    await comp.click().catch(() => {});
    await sleep(250);
    const tgt = page.locator("#youSide .card.target").first();
    if (await tgt.count()) { await tgt.click().catch(() => {}); await sleep(250); }
    else { // single-target attaches fire immediately; nothing else to do
      continue;
    }
    continue;
  }
  if (await cast.count()) { await cast.click().catch(() => {}); await sleep(250); const cf = page.locator("#actbar button").filter({ hasText: /Confirm/ }).first(); if (await cf.count()) { await cf.click().catch(() => {}); await sleep(250); } continue; }
  const end = page.locator("#actbar button").filter({ hasText: /End turn|Pass|Mulligan/ }).first();
  if (await end.count()) { await end.click().catch(() => {}); await sleep(250); }
  else await sleep(250);
}

await sleep(400);
await shot("v6-final");
console.log("\n=== SUMMARY ===");
console.log("drag-attach worked:      ", dragOk);
console.log("floats spawned:          ", floats);
console.log("reaction window captured:", sawReaction, "| glow targets:", reactGlow);
console.log("own-stack captured:      ", sawOwnStack);
console.log("final status:            ", await status());
console.log("page console errors:     ", errs.length ? errs : "none");
await browser.close();
