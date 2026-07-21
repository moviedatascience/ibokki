/**
 * M5 e2e: two real browser tabs play a full online match through the
 * authoritative WebSocket server. Tab A creates a room via the lobby UI, tab B
 * joins with the code, then both tabs are driven to game over through the
 * window.__ibokki debug hook (random legal actions — clicking through a whole
 * match on the canvas would be slow and flaky). Assertions cover the lobby flow,
 * cross-tab consistency, hidden-info redaction, and the post-game summary.
 */
import { test, expect, type Page } from "@playwright/test";

interface HookState {
  yourTurn: boolean;
  gameOver: boolean;
  winner: number | null;
  round: number;
  schools: [string, string];
  epoch: number;
  legal: { index: number }[];
  view: { opponent: { hand?: string[]; handCount?: number; prepared: { spellDefId?: string | null; faceDown: boolean; cast: boolean }[] } };
}

const hookState = (page: Page) =>
  page.evaluate(() => (window as unknown as { __ibokki?: { state: unknown } }).__ibokki?.state ?? null) as Promise<HookState | null>;

/**
 * Install an in-page driver: a fast interval that plays a random legal action
 * whenever it's this tab's turn. Driving from inside the page keeps the match
 * moving at WS speed — one Playwright round-trip per action was far too slow on
 * CI runners (the match timed out mid-game). Each server frame builds a NEW
 * state object, so act once per state identity (with a 500ms stall re-try in
 * case an intent was rejected as stale). NB: `epoch` is HTTP-transport-only —
 * online frames don't carry it.
 */
const startDriver = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as {
      __ibokki?: { state: HookState | null; act: (i: number) => void };
      __driver?: number;
    };
    if (w.__driver) return;
    let lastState: HookState | null = null;
    let stall = 0;
    w.__driver = window.setInterval(() => {
      const s = w.__ibokki?.state as HookState | null;
      if (!w.__ibokki || !s || !s.yourTurn || s.gameOver || s.legal.length === 0) return;
      if (s === lastState && ++stall < 50) return;
      lastState = s;
      stall = 0;
      w.__ibokki.act(s.legal[Math.floor(Math.random() * s.legal.length)]!.index);
    }, 10);
  });

test("two tabs play a full online match to game over", async ({ browser }) => {
  // Random-length matches on CI's 2-core runners were finishing at ~3m of the old 4m budget
  // (run #25 timed out twice) — keep real headroom over the observed worst case.
  test.setTimeout(360_000);
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  // Tab A creates a room and shows the join code.
  await a.goto("/");
  await a.getByTestId("online-create").click();
  const code = (await a.getByTestId("online-room-code").textContent({ timeout: 10_000 }))!.trim();
  expect(code).toMatch(/^[A-Z2-9]{5}$/);

  // Tab B joins with the code; both tabs enter the match.
  await b.goto("/");
  await b.getByTestId("online-code-input").fill(code);
  await b.getByTestId("online-join").click();
  await expect(a.getByTestId("online-presence")).toContainText("connected", { timeout: 10_000 });
  await expect(b.getByTestId("online-presence")).toContainText("connected");

  // Each tab sees its own deck label first (both tabs default to the Emberworks preset).
  await expect.poll(async () => (await hookState(a))?.schools ?? null).toEqual(["Emberworks", "Emberworks"]);
  const sB = await hookState(b);
  expect(sB!.schools).toEqual(["Emberworks", "Emberworks"]);

  // Drive both tabs with in-page random players until the match terminates.
  await startDriver(a);
  await startDriver(b);
  let over = false;
  // Wall-clock deadline, not an iteration count: it must exhaust BEFORE test.setTimeout fires
  // so a hung match fails on the labeled assertion below instead of a generic timeout mid-loop.
  const deadline = Date.now() + 300_000;
  for (let guard = 0; Date.now() < deadline && !over; guard++) {
    await a.waitForTimeout(250);
    const [xa, xb] = [await hookState(a), await hookState(b)];
    over = !!xa?.gameOver && !!xb?.gameOver;

    // Redaction spot-checks while the match runs.
    if (xb && guard % 8 === 0) {
      expect(xb.view.opponent.hand).toBeUndefined();
      expect(typeof xb.view.opponent.handCount).toBe("number");
      for (const p of xb.view.opponent.prepared) {
        if (p.faceDown && !p.cast) expect(p.spellDefId ?? null).toBeNull();
      }
    }
  }
  expect(over, "match should reach game over").toBe(true);

  // Consistent, viewer-relative outcome + the post-game summary in both tabs.
  const [fa, fb] = [await hookState(a), await hookState(b)];
  if (fa!.winner === null) expect(fb!.winner).toBeNull();
  else expect(fa!.winner! ^ fb!.winner!).toBe(1);
  await expect(a.locator(".gopanel h2")).toContainText(/You win!|Opponent wins|Draw/);
  await expect(b.locator(".gopanel h2")).toContainText(/You win!|Opponent wins|Draw/);

  await ctxA.close();
  await ctxB.close();
});

test("?room=CODE invite links join the room directly", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  await a.goto("/");
  await a.getByTestId("online-create").click();
  const code = (await a.getByTestId("online-room-code").textContent({ timeout: 10_000 }))!.trim();

  // Tab B lands via the invite link and joins without touching the join form.
  await b.goto(`/?room=${code}`);
  await expect(a.getByTestId("online-presence")).toContainText("connected", { timeout: 10_000 });
  await expect(b.getByTestId("online-presence")).toContainText("connected");

  await ctxA.close();
  await ctxB.close();
});
