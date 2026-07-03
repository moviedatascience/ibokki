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

/** If it's this tab's turn, play one random legal action. Returns true if it acted. */
const actOnce = (page: Page) =>
  page.evaluate(() => {
    const hook = (window as unknown as { __ibokki?: { state: HookState | null; act: (i: number) => void } }).__ibokki;
    const s = hook?.state as HookState | null;
    if (!hook || !s || !s.yourTurn || s.gameOver || s.legal.length === 0) return false;
    hook.act(s.legal[Math.floor(Math.random() * s.legal.length)]!.index);
    return true;
  });

test("two tabs play a full online match to game over", async ({ browser }) => {
  test.setTimeout(240_000);
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

  // Drive both tabs with random legal actions until the match terminates.
  let over = false;
  for (let guard = 0; guard < 6000 && !over; guard++) {
    const acted = (await actOnce(a)) || (await actOnce(b));
    if (!acted) await a.waitForTimeout(25); // frames in flight
    const [xa, xb] = [await hookState(a), await hookState(b)];
    over = !!xa?.gameOver && !!xb?.gameOver;

    // Redaction spot-checks while the match runs.
    if (xb && guard % 50 === 0) {
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
