/**
 * Client e2e: the prepare-phase spellbook book, the detach affordance, and the
 * post-game summary. Game state is driven through the play server's HTTP API
 * (side 0) where UI clicks would be slow or canvas-bound; the assertions are
 * against the real DOM the player sees.
 */
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const API = "http://localhost:7777";

interface Legal {
  index: number;
  type: string;
  defId: string | null;
  preparedIndex: number | null;
}
interface State {
  phase: string;
  yourTurn: boolean;
  gameOver: boolean;
  legal: Legal[];
  view: {
    self: {
      hand?: string[];
      prepared: { spellDefId?: string; attached: string[] }[];
    };
  };
}

async function apiState(rq: APIRequestContext): Promise<State> {
  return (await rq.get(`${API}/api/state?side=0`)).json();
}
async function apiAct(rq: APIRequestContext, index: number): Promise<State> {
  return (await rq.post(`${API}/api/act?side=0`, { data: { index } })).json();
}
async function apiNew(rq: APIRequestContext, bots: number[], seed = 42): Promise<State> {
  return (await rq.post(`${API}/api/new`, { data: { p0: "Evocation", p1: "Abjuration", seed, bots } })).json();
}

/** Land on the board: the app opens on the home screen; resume the server's current match. */
async function openBoard(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByTestId("resume-match").click();
}

/** Play API actions until predicate holds (drives through prepare/opponent turns). */
async function driveUntil(rq: APIRequestContext, done: (s: State) => boolean, pick: (s: State) => Legal | undefined): Promise<State> {
  let s = await apiState(rq);
  for (let guard = 0; guard < 60 && !done(s); guard++) {
    if (!s.yourTurn) {
      await new Promise((r) => setTimeout(r, 150)); // bot resolves synchronously; just re-poll
      s = await apiState(rq);
      continue;
    }
    const a = pick(s);
    if (!a) throw new Error(`no action to pick in phase ${s.phase}; legal: ${s.legal.map((x) => x.type).join(",")}`);
    s = await apiAct(rq, a.index);
  }
  return s;
}

test.describe("spellbook book (prepare phase)", () => {
  test("paginates low→high level and tracks prepared slots", async ({ page, request }) => {
    await apiNew(request, [1]);
    await openBoard(page);
    await page.waitForSelector(".spellbook", { timeout: 15_000 });

    // Page 1 of the book: prev disabled, indicator present, no horizontal scroll.
    await expect(page.locator(".sbturn").first()).toBeDisabled();
    await expect(page.locator(".sbpageno")).toContainText("page 1/");
    const scrollable = await page.evaluate(() => {
      const p = document.querySelector(".sbpage")!;
      return p.scrollWidth > p.clientWidth + 1;
    });
    expect(scrollable).toBe(false);

    // Walk the whole book: levels never decrease.
    const levels: number[] = [];
    for (let guard = 0; guard < 10; guard++) {
      const pageLevels = await page.$$eval(".sbcard .sbtypeline", (els) =>
        els.map((e) => parseInt(/L(\d+)/.exec(e.textContent ?? "")?.[1] ?? "0", 10)),
      );
      levels.push(...pageLevels);
      if (await page.locator(".sbturn").nth(1).isDisabled()) break;
      await page.locator(".sbturn").nth(1).click();
    }
    expect(levels.length).toBeGreaterThan(30);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);

    // Back to page 1; preparing fills the numbered strip.
    while (!(await page.locator(".sbturn").first().isDisabled())) await page.locator(".sbturn").first().click();
    await expect(page.locator(".sbpreplabel")).toContainText("0/");
    const name = await page.locator(".sbcard.playable .sbname").first().textContent();
    await page.locator(".sbcard.playable").first().click();
    await expect(page.locator(".sbpreplabel")).toContainText("1/");
    await expect(page.locator(".sbprepslot").first()).toContainText(name!);
  });
});

test.describe("detach", () => {
  test("attached component can be taken back from the action bar", async ({ page, request }) => {
    await apiNew(request, [1]);
    // Prepare two spells, finish preparing, then reach our main-phase turn.
    let s = await driveUntil(
      request,
      (x) => x.phase !== "prepare",
      (x) => {
        const preps = x.legal.filter((a) => a.type === "prepareSpell");
        const prepared = x.view.self.prepared.length;
        return prepared < 2 && preps.length ? preps[0] : x.legal.find((a) => a.type === "donePreparing");
      },
    );
    s = await driveUntil(request, (x) => x.yourTurn && x.phase === "main", () => undefined);

    // Attach a component via the API, then load the UI: the ↩ button must be there.
    const attach = s.legal.find((a) => a.type === "attach");
    expect(attach, "expected an attach action on our first main turn").toBeTruthy();
    s = await apiAct(request, attach!.index);
    const slot = s.view.self.prepared.findIndex((p) => p.attached.length > 0);
    expect(slot).toBeGreaterThanOrEqual(0);
    const handBefore = s.view.self.hand!.length;

    await openBoard(page);
    const detachBtn = page.locator(".actionbar button.detach");
    await expect(detachBtn.first()).toBeVisible({ timeout: 15_000 });
    await expect(detachBtn.first()).toContainText("↩");
    await detachBtn.first().click();
    await expect(detachBtn).toHaveCount(0);

    const after = await apiState(request);
    expect(after.view.self.prepared[slot]!.attached.length).toBe(0);
    expect(after.view.self.hand!.length).toBe(handBefore + 1);
  });
});

test.describe("post-game summary", () => {
  test("shows result, stats and full log; dismiss reveals the board", async ({ page, request }) => {
    // Both sides bot-driven: the match auto-plays to completion at creation.
    const s = await apiNew(request, [0, 1], 7);
    expect(s.gameOver).toBe(true);

    await openBoard(page);
    const panel = page.locator(".gopanel");
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await expect(panel.locator("h2")).toContainText(/You win!|Opponent wins|Draw/);
    await expect(panel.locator(".gostats tbody tr")).toHaveCount(8);
    // Full transcript, not the 100-line tail: a finished game logs far more.
    const logLines = await panel.locator(".golog div").count();
    expect(logLines).toBeGreaterThan(100);

    await panel.getByRole("button", { name: "View final board" }).click();
    await expect(page.locator(".gameover")).toHaveCount(0);
    await expect(page.locator(".actionbar")).toContainText("Game over");
  });
});
