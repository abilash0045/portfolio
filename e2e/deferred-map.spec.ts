import { test, expect } from "@playwright/test";

// The dartboard sits five sections down the home page. It used to boot Leaflet,
// pull its stylesheet and fetch a screen of CARTO tiles during first paint, and
// ask for the visitor's location while they were still reading the hero. These
// assertions fail if any of that moves back above the fold.

function tileWatcher(page: import("@playwright/test").Page) {
  const tiles: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("basemaps.cartocdn.com")) tiles.push(request.url());
  });
  return tiles;
}

test("the map does not load until the visitor gets near it", async ({ page }) => {
  const tiles = tileWatcher(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  expect(await page.evaluate(() => window.scrollY), "test scrolled itself").toBe(0);
  expect(tiles, "tile requests fired before the visitor scrolled").toHaveLength(0);
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  expect(
    await page.evaluate(() => "L" in window),
    "Leaflet was evaluated on first paint",
  ).toBe(false);

  await page.locator("#dartboard-embedded-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".leaflet-container")).toHaveCount(1);
  await expect
    .poll(() => tiles.length, { message: "no tiles after scrolling to the map" })
    .toBeGreaterThan(0);
});

test("the map still loads immediately on its own page", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.locator(".leaflet-container")).toHaveCount(1);
});

test("tabbing into the board loads it and leaves the controls usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".leaflet-container")).toHaveCount(0);

  await page.locator(".dartboard__fullscreen-btn").focus();
  await expect(page.locator(".leaflet-container")).toHaveCount(1);
  await expect(page.locator(".controls__throw")).toBeEnabled();
});

test("the stage holds its height, so nothing shifts when the map arrives", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const stage = page.locator(".dartboard__stage");
  const before = (await stage.boundingBox())?.height ?? 0;
  expect(before, "stage has no height before the map loads").toBeGreaterThan(300);

  await page.locator("#dartboard-embedded-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".leaflet-container")).toHaveCount(1);

  const after = (await stage.boundingBox())?.height ?? 0;
  expect(after, "stage resized when the map arrived").toBe(before);
});
