import { test, expect, type Page } from "@playwright/test";
import { GITHUB_URL, LINKEDIN_URL, SITE_URL } from "../src/lib/site";

// The canonical link and every Open Graph url pointed at
// portfolio-abilash.vercel.app, a host this site has never been served from,
// because the origin was written out twice and only one copy was ever right.
// And twitter:card claimed summary_large_image with no image anywhere, so
// every share of this link rendered as a bare text card.

const content = (page: Page, selector: string) =>
  page.locator(selector).getAttribute("content");

// The dartboard inherited the home page's canonical and og:url, which tells a
// search engine it is a copy of the home page and sends every shared link's
// preview there. Each page has to name itself.
const PAGES = [
  { path: "/", url: SITE_URL },
  { path: "/resume", url: `${SITE_URL}/resume` },
  { path: "/dartboard", url: `${SITE_URL}/dartboard` },
];

for (const { path, url } of PAGES) {
  test(`${path}: the canonical and Open Graph urls name this page on the real host`, async ({
    page,
  }) => {
    await page.goto(path);

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBe(url);
    expect(await content(page, 'meta[property="og:url"]')).toBe(url);

    for (const value of [canonical, await content(page, 'meta[property="og:url"]')]) {
      expect(value, "a url still points at a host that is not this site").not.toContain(
        "portfolio-abilash",
      );
    }
  });

  test(`${path}: the link preview has an image, sized and described`, async ({ page }) => {
    await page.goto(path);

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
}

// The tab icon was create-next-app's favicon.ico, Vercel's triangle, on every
// tab and bookmark of this site.
test("the tab icon is this site's own", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect(href, "the icon link points somewhere else").toMatch(/^\/icon\b/);

  const icon = await request.get(href!);
  expect(icon.headers()["content-type"]).toContain("image/png");
  const body = await icon.body();
  expect(body.readUInt32BE(16) % 48, "search results want a multiple of 48px").toBe(0);

  expect((await request.get("/favicon.ico")).status(), "the stock favicon is still served").toBe(404);
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

// /api/ proxies Nominatim and Overpass, whose rate limits every visitor shares.
// A crawler walking those routes would spend them for nothing.
test("robots.txt keeps crawlers off the API and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/^Disallow: \/api\/$/m);
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});

test("the sitemap lists every page on the real host, and each one answers", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  expect(urls.map((url) => new URL(url).pathname).sort()).toEqual(["/", "/dartboard", "/resume"]);
  for (const url of urls) {
    expect(url.startsWith(SITE_URL), `${url} is not on the real host`).toBe(true);
    expect((await request.get(new URL(url).pathname)).status(), `${url} does not answer`).toBe(200);
  }
});

test("an unknown address answers 404, offers a way back, and is not indexed", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nothing here.");
  await expect(page).toHaveTitle("Page not found: Abilash S L");
  expect(await content(page, 'meta[name="robots"]')).toContain("noindex");
  // It inherited the home page's canonical, which called it a copy of /.
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const main = page.locator("main");
  await expect(main.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  await expect(main.getByRole("link", { name: "Read the résumé" })).toHaveAttribute("href", "/resume");
  await expect(main.getByRole("link", { name: "Throw a dart" })).toHaveAttribute("href", "/dartboard");
});

type Node = Record<string, unknown> & { "@type": string };

// Structured data that says more than the page is a claim nobody can check.
test("the structured data describes the person the page shows, and no more", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const graph = (JSON.parse(raw ?? "{}") as { "@graph": Node[] })["@graph"];

  const person = graph.find((node) => node["@type"] === "Person")!;
  expect(person.name).toBe("Abilash S L");
  expect(person.url).toBe(SITE_URL);
  expect(person.jobTitle).toBe("Software Development Engineer");
  expect(person.sameAs).toEqual([GITHUB_URL, LINKEDIN_URL]);
  expect(person.telephone, "the phone number stays off the site").toBeUndefined();

  const toolbox = (await page.locator("#approach").textContent()) ?? "";
  for (const skill of person.knowsAbout as string[]) {
    expect(toolbox, `claims ${skill}, which the page never lists`).toContain(skill);
  }

  const site = graph.find((node) => node["@type"] === "WebSite")!;
  expect(site.url).toBe(SITE_URL);
});
