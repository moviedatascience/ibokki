/**
 * Accounts + deckbuilder e2e: register from the home screen, copy the
 * Emberworks preset into the builder, tweak it, save, and see it as a
 * playable saved deck. Unique credentials per run — the dev server's SQLite
 * persists between runs.
 */
import { test, expect } from "@playwright/test";

test("register, build a deck from a preset, and see it in the deck picker", async ({ page }) => {
  const uniq = Date.now().toString(36);
  const username = `pw_${uniq}`;

  await page.goto("/");

  // Register a fresh account.
  await page.getByTestId("auth-to-register").click();
  await page.getByTestId("auth-email").fill(`${username}@example.com`);
  await page.getByTestId("auth-username").fill(username);
  await page.getByTestId("auth-password").fill("longenough1");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("auth-logout")).toBeVisible({ timeout: 10_000 });

  // Copy the Emberworks preset into the builder and rename it.
  await page.getByTestId("deck-copy-Emberworks").click();
  const name = page.getByTestId("builder-name");
  await expect(name).toHaveValue("Emberworks copy");
  await name.fill(`Burn ${uniq}`);

  // Steppers actually edit the resource deck (drop a Verbal, re-add it).
  const count = page.getByTestId("count-CMP-V");
  await expect(count).toHaveText("17");
  await page.getByTestId("count-CMP-V").locator("xpath=preceding-sibling::button").click(); // −
  await expect(count).toHaveText("16");
  await page.getByTestId("add-CMP-V").click();
  await expect(count).toHaveText("17");

  // An illegal deck is rejected with the validator's message; fixing it saves.
  await page.getByTestId("add-CMP-V").click(); // 41 cards now
  await page.getByTestId("builder-save").click();
  await expect(page.getByTestId("builder-errors")).toContainText("exactly 40");
  await page.getByTestId("count-CMP-V").locator("xpath=preceding-sibling::button").click();
  await page.getByTestId("builder-save").click();

  // Back home: the deck is listed and offered in the online deck picker.
  await expect(page.locator(".decklist")).toContainText(`Burn ${uniq}`, { timeout: 10_000 });
  await expect(page.getByTestId("deck-select")).toContainText(`Burn ${uniq} (saved)`);
});
