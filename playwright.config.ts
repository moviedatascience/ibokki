import { defineConfig } from "@playwright/test";

/**
 * Client e2e tests (apps/client/test). Boots the play server (:7777), the online
 * server (:7788) and the Vite client (:5173) automatically; reuses them if
 * they're already running locally.
 *   npx playwright test
 */
export default defineConfig({
  testDir: "apps/client/test",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1500, height: 950 },
  },
  webServer: [
    {
      command: "npm run play",
      url: "http://localhost:7777/api/cards",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm run online",
      url: "http://localhost:7788/health",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm run client",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
