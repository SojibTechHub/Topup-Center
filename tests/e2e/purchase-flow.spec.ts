import { test, expect } from "@playwright/test";

test.describe("Topup Center Happy Path Purchase Flow", () => {
  test("User can browse catalog, select package, and view checkout wizard", async ({ page }) => {
    // 1. Visit Homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Topup Center/i);

    // Check branding and live ticker
    const ticker = page.locator(".ticker-bar");
    await expect(ticker).toBeVisible();

    // 2. Navigate to Catalog
    await page.click("text=সব গেম");
    await expect(page).toHaveURL(/\/games/);

    // 3. Search for Free Fire
    const searchInput = page.locator("input[name='q']");
    await searchInput.fill("Free Fire");
    await page.click("button:has-text('খুঁজুন')");

    // 4. Click Free Fire Game Card
    const ffCard = page.locator("a[href*='free-fire']").first();
    await expect(ffCard).toBeVisible();
    await ffCard.click();

    // 5. Verify Game Details & Form
    await expect(page).toHaveURL(/\/games\/free-fire/);
    await expect(page.locator("h1")).toContainText(/ফ্রি ফায়ার|Free Fire/);

    // Enter Player ID
    const uidInput = page.locator("input[placeholder*='e.g. 123456789']");
    await expect(uidInput).toBeVisible();
    await uidInput.fill("123456789");

    // Select a package (e.g. 115 Diamonds)
    const pkgOption = page.locator("text=115 💎").first();
    await pkgOption.click();

    // Check sticky summary price updates
    const buyButton = page.locator("button:has-text('পেমেন্টে এগিয়ে যান')");
    await expect(buyButton).toBeVisible();
  });
});
