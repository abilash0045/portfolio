import { test, expect } from "@playwright/test";

test("throwing a dart lands somewhere real", async ({ page }) => {
  await page.goto("/dartboard");

  const throwButton = page.getByRole("button", { name: /throw the dart/i });
  await expect(throwButton).toBeEnabled({ timeout: 15_000 });

  await expect(page.getByText(/throwing range/i)).toBeVisible();
  await throwButton.click();

  // The card is gated on the reverse geocode, which is a live call.
  const card = page.locator(".card");
  await expect(card).toBeVisible({ timeout: 25_000 });

  const text = (await card.textContent()) ?? "";
  expect(text.trim().length).toBeGreaterThan(0);
  // Every outcome the card can render carries a coordinate pair.
  expect(text).toMatch(/-?\d+\.\d{4},\s*-?\d+\.\d{4}/);
});

test("the radius slider changes the stated range", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.getByRole("button", { name: /throw the dart/i })).toBeEnabled({
    timeout: 15_000,
  });

  const before = await page.getByText(/throwing range/i).textContent();
  await page.locator("#radius").fill("400000");
  const after = await page.getByText(/throwing range/i).textContent();

  expect(after).not.toBe(before);
  expect(after).toContain("400 km");
});

test("the page keeps its content in a main landmark", async ({ page }) => {
  await page.goto("/dartboard");
  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);
  await expect(main.getByRole("button", { name: /throw the dart/i })).toBeVisible();
  await expect(main.locator(".leaflet-container")).toHaveCount(1);
});

// The credit strip inherited the page's 16px type, sat across the bottom of
// the control panel, and on a phone wrapped to two lines to cover even more
// of it. The credit has to stay visible and stay out of the way.
for (const width of [320, 390, 1280]) {
  test(`at ${width}px the map's credits sit on one line, clear of the controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/dartboard");
    const credits = page.locator(".leaflet-control-attribution");
    await expect(credits).toContainText("OpenStreetMap");

    const box = await credits.boundingBox();
    const panel = await page.locator(".dartboard__panel").boundingBox();
    const lineHeight = await credits.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect(box!.height, "the credits wrapped").toBeLessThan(lineHeight * 2);
    expect(panel!.y + panel!.height, "the credits cover the controls").toBeLessThanOrEqual(box!.y);
  });
}

test("the map credits OpenStreetMap", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.locator(".leaflet-control-attribution")).toContainText(
    "OpenStreetMap",
    { timeout: 20_000 },
  );
});
