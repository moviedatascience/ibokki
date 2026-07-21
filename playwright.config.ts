import { defineConfig } from "@playwright/test";

/**
 * Client e2e tests (apps/client/test). Boots the play server (:7777), the online
 * server (:7788) and the Vite client (:5173) automatically; reuses them if
 * they're already running locally (never on CI — fresh servers there).
 *   npx playwright test
 */
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "apps/client/test",
  timeout: 60_000,
  // CI runners are slow 2-core boxes: one worker (three node servers already
  // share the box), one retry to ride out cold-start flakes, and an HTML report
  // saved for the failure artifact.
  workers: CI ? 1 : undefined,
  retries: CI ? 1 : 0,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1500, height: 950 },
    trace: CI ? "on-first-retry" : "off",
  },
  webServer: [
    {
      command: "npm run play",
      url: "http://localhost:7777/api/cards",
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: "npm run online",
      url: "http://localhost:7788/health",
      reuseExistingServer: !CI,
      timeout: 120_000,
      // The in-page driver acts at machine speed (~100 msg/s/tab); the per-connection
      // rate limit (unit-tested elsewhere) would throttle that synthetic load, so turn
      // it effectively off here — this test isn't exercising the limiter.
      // IBOKKI_START_HP: full random matches at 30 HP run ~8 rounds and outpaced the
      // full-match spec's 300s budget on CI's 2-core runners (trace-analyzed: healthy
      // ~1.4 epochs/s, round 5 of ~8 at deadline). Low HP bounds match length by
      // construction; the e2e exercises transport/UI, not match-length realism.
      env: { IBOKKI_MSG_BURST: "1000000000", IBOKKI_MSG_REFILL_PER_SEC: "1000000000", IBOKKI_START_HP: "10" },
    },
    {
      command: "npm run client",
      url: "http://localhost:5173",
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
});
