import { test, expect, type Page } from "@playwright/test";

// The location search appears when geolocation is denied. Zero results, a
// failed call and a too-short query all used to render as nothing at all: the
// button went back to "Find it" and the visitor was told neither what had
// happened nor what to do next.

/** Deny geolocation deterministically, whatever the project config grants. */
async function denyLocation(page: Page) {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_ok, fail) => {
      fail?.({ code: 1, message: "denied" } as GeolocationPositionError);
    };
  });
}

async function openSearch(page: Page) {
  await denyLocation(page);
  await page.goto("/dartboard");
  await expect(page.getByLabel("Search for your location")).toBeVisible();
}

const status = (page: Page) => page.locator(".locsearch__status");
const findIt = (page: Page) => page.getByRole("button", { name: "Find it" });

test("a search that matches nothing says so, and names what it looked for", async ({
  page,
}) => {
  await page.route("**/api/search*", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await openSearch(page);

  await page.getByLabel("Search for your location").fill("qqqzzz");
  await findIt(page).click();

  await expect(status(page)).toContainText("Nothing matched");
  await expect(status(page)).toContainText("qqqzzz");
  await expect(page.locator(".locsearch__results")).toHaveCount(0);
});

test("a failed lookup says it failed, not that nothing matched", async ({
  page,
}) => {
  await page.route("**/api/search*", (route) =>
    route.fulfill({ json: { results: [], error: "upstream" } }),
  );
  await openSearch(page);

  await page.getByLabel("Search for your location").fill("Chandigarh");
  await findIt(page).click();

  await expect(status(page)).toContainText("Couldn't reach the place lookup");
  await expect(status(page)).not.toContainText("Nothing matched");
});

test("a dropped connection reads the same as a failed lookup", async ({
  page,
}) => {
  await page.route("**/api/search*", (route) => route.abort());
  await openSearch(page);

  await page.getByLabel("Search for your location").fill("Chandigarh");
  await findIt(page).click();

  await expect(status(page)).toContainText("Couldn't reach the place lookup");
});

test("a query too short to search says what to do instead of nothing", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/search*", (route) => {
    requests += 1;
    return route.fulfill({ json: { results: [] } });
  });
  await openSearch(page);

  await page.getByLabel("Search for your location").fill("a");
  await findIt(page).click();

  await expect(status(page)).toContainText("at least two letters");
  expect(requests, "searched anyway on a one-letter query").toBe(0);
});

test("typing again clears the last answer", async ({ page }) => {
  await page.route("**/api/search*", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await openSearch(page);

  const input = page.getByLabel("Search for your location");
  await input.fill("qqqzzz");
  await findIt(page).click();
  await expect(status(page)).toContainText("Nothing matched");

  await input.fill("qqqzzzy");
  await expect(status(page)).toBeEmpty();
});

test("results still work, and choosing one clears the search", async ({
  page,
}) => {
  await page.route("**/api/search*", (route) =>
    route.fulfill({
      json: {
        results: [
          { name: "Chandigarh, India", lat: 30.7333, lon: 76.7794 },
          { name: "Chandigarh, Haryana, India", lat: 30.72, lon: 76.78 },
        ],
      },
    }),
  );
  await openSearch(page);

  const input = page.getByLabel("Search for your location");
  await input.fill("Chandigarh");
  await findIt(page).click();

  await expect(page.getByRole("button", { name: "Chandigarh, India" })).toBeVisible();
  await page.getByRole("button", { name: "Chandigarh, India" }).click();

  // The results clear and the query empties, but the box stays: see below.
  await expect(page.locator(".locsearch__results")).toHaveCount(0);
  await expect(input).toHaveValue("");
  await expect(page.locator(".controls__throw")).toBeEnabled();
});

test("the search stays after you use it, and says where you landed", async ({
  page,
}) => {
  await page.route("**/api/search*", (route) =>
    route.fulfill({
      json: { results: [{ name: "Chandigarh, India", lat: 30.7333, lon: 76.7794 }] },
    }),
  );
  await openSearch(page);

  const input = page.getByLabel("Search for your location");
  await input.fill("Chandigarh");
  await findIt(page).click();
  await page.getByRole("button", { name: "Chandigarh, India" }).click();

  // It used to unmount here, so picking the wrong Chandigarh meant a reload.
  await expect(page.locator(".locsearch")).toHaveCount(1);
  await expect(input).toBeVisible();

  // Losing the box also lost the only confirmation anything had happened.
  await expect(status(page)).toContainText("Throwing from Chandigarh, India");

  // And it has to work a second time.
  await input.fill("Chandigarh");
  await findIt(page).click();
  await expect(page.getByRole("button", { name: "Chandigarh, India" })).toBeVisible();
});

test("the live region is in the DOM before there is anything to announce", async ({
  page,
}) => {
  await openSearch(page);

  // A status region added at the same moment as its text is unreliable to
  // announce, so it ships empty and collapsed rather than conditionally.
  await expect(status(page)).toHaveAttribute("role", "status");
  await expect(status(page)).toBeEmpty();
  await expect(status(page)).toBeHidden();
});
