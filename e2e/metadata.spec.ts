import { test, expect, type Page } from "@playwright/test";
import { SITE_URL } from "../src/lib/site";

// The canonical link and every Open Graph url pointed at
// portfolio-abilash.vercel.app, a host this site has never been served from,
// because the origin was written out twice and only one copy was ever right.
// And twitter:card claimed summary_large_image with no image anywhere, so
// every share of this link rendered as a bare text card.

const content = (page: Page, selector: string) =>
  page.locator(selector).getAttribute("content");

test("the canonical and Open Graph urls point at the real host", async ({
  page,
}) => {
  await page.goto("/");

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonical).toBe(SITE_URL);
  expect(await content(page, 'meta[property="og:url"]')).toBe(SITE_URL);

  for (const value of [canonical, await content(page, 'meta[property="og:url"]')]) {
    expect(value, "a url still points at a host that is not this site").not.toContain(
      "portfolio-abilash",
    );
  }
});

test("the link preview has an image, sized and described", async ({ page }) => {
  await page.goto("/");

  const image = await content(page, 'meta[property="og:image"]');
  expect(image, "no og:image, so shares render as a bare text card").toBeTruthy();
  expect(image!.startsWith(SITE_URL), "og:image must be absolute").toBe(true);

  expect(await content(page, 'meta[property="og:image:width"]')).toBe("1200");
  expect(await content(page, 'meta[property="og:image:height"]')).toBe("630");

  const alt = await content(page, 'meta[property="og:image:alt"]');
  expect(alt?.length ?? 0).toBeGreaterThan(20);

  // summary_large_image without an image is the combination that was shipped.
  expect(await content(page, 'meta[name="twitter:card"]')).toBe(
    "summary_large_image",
  );
  expect(await content(page, 'meta[name="twitter:image"]')).toBeTruthy();
});

test("the card renders at the size it claims", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");

  const body = await response.body();
  // PNG header: width and height are big-endian uint32 at bytes 16 and 20.
  expect(body.subarray(1, 4).toString()).toBe("PNG");
  expect(body.readUInt32BE(16)).toBe(1200);
  expect(body.readUInt32BE(20)).toBe(630);

  // Facebook rejects over 8MB, X over 5MB.
  expect(body.byteLength).toBeLessThan(5 * 1024 * 1024);
});
