/**
 * Persistence-loop e2e: register, play a solo bot match to game over, find it in
 * the Home match-history panel with a W-L record, watch the replay in the
 * standalone viewer, scrub to the end card, and exit back to the app.
 */
import { test, expect, type Page } from "@playwright/test";

interface HookState {
  yourTurn: boolean;
  gameOver: boolean;
  legal: { index: number }[];
}

const hookState = (page: Page) =>
  page.evaluate(() => (window as unknown as { __ibokki?: { state: unknown } }).__ibokki?.state ?? null) as Promise<HookState | null>;

/** In-page random self-play driver (online.spec.ts pattern — one act per state identity). */
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

test("a finished solo match shows up in history and replays in the viewer", async ({ page }) => {
  test.setTimeout(360_000);
  const uniq = Date.now().toString(36);

  // Register (history is a signed-in feature).
  await page.goto("/");
  await page.getByTestId("auth-to-register").click();
  await page.getByTestId("auth-email").fill(`replay_${uniq}@example.com`);
  await page.getByTestId("auth-username").fill(`replay_${uniq}`);
  await page.getByTestId("auth-password").fill("longenough1");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("auth-logout")).toBeVisible({ timeout: 10_000 });

  // Play a solo bot match to game over (IBOKKI_START_HP=10 bounds the length).
  await page.getByTestId("online-bot").click();
  await expect.poll(async () => (await hookState(page)) !== null, { timeout: 15_000 }).toBe(true);
  await startDriver(page);
  const deadline = Date.now() + 300_000;
  let over = false;
  while (Date.now() < deadline && !over) {
    await page.waitForTimeout(250);
    over = !!(await hookState(page))?.gameOver;
  }
  expect(over, "solo match should reach game over").toBe(true);

  // Back on Home the match is history: a record line and a watchable row.
  await page.getByTestId("to-menu").click();
  await expect(page.getByTestId("history-panel")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("history-record")).toContainText("Solo");
  await expect(page.locator(".historylist li")).toHaveCount(1);

  // Watch it: the standalone viewer loads every frame, the end card renders.
  await page.locator('[data-testid^="history-watch-"]').first().click();
  await expect(page.getByTestId("replay-title")).toContainText("Emberworks", { timeout: 15_000 });
  await expect
    .poll(async () => (await page.getByTestId("replay-pos").textContent()) ?? "", { timeout: 60_000 })
    .not.toContain("loaded"); // all chunks fetched
  await page.getByTestId("replay-end").click();
  await expect(page.getByTestId("replay-verdict")).toBeVisible();
  await expect(page.getByTestId("replay-verdict")).toContainText(/wins|Draw/);

  // Scrubbing back to the start shows the opening position again.
  await page.getByTestId("replay-start").click();
  await expect(page.getByTestId("replay-pos")).toContainText(/^1 \//);

  // Exit returns to the app shell.
  await page.getByTestId("replay-exit").click();
  await expect(page.getByTestId("mode-solo")).toBeVisible({ timeout: 10_000 });
});
