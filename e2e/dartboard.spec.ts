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

test("the map credits OpenStreetMap", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.locator(".leaflet-control-attribution")).toContainText(
    "OpenStreetMap",
    { timeout: 20_000 },
  );
});
