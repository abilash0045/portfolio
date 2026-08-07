import { test, expect, type Page } from "@playwright/test";

const opacityOf = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).opacity));

test("content below the fold arrives hidden and settles in on scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const card = page.locator(".tech-card").first();
  expect(await opacityOf(page, ".tech-card"), "started visible").toBeLessThan(0.1);

  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => opacityOf(page, ".tech-card"), { message: "never revealed" })
    .toBeGreaterThan(0.99);

  // Once revealed it stays revealed; scrolling away must not hide it again.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await opacityOf(page, ".tech-card")).toBeGreaterThan(0.99);
});

test("what is already on screen is not animated in", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  // The hero carries no data-reveal, so it must never be transparent.
  expect(await opacityOf(page, ".hero__name")).toBe(1);
});

test("reduced motion gets the content, not a shortened animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  // The hidden state must not apply at all, so nothing depends on JS running.
  for (const sel of [".tech-card", ".study", ".philosophy-card", ".magazine-card"]) {
    expect(await opacityOf(page, sel), `${sel} hidden under reduced motion`).toBe(1);
  }
});

test("with JavaScript off the page is not left blank", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  // ScrollReveal never runs here. If the hidden state were unconditional,
  // every card below the fold would be invisible forever.
  for (const sel of [".tech-card", ".study", ".philosophy-card"]) {
    expect(await opacityOf(page, sel), `${sel} invisible without JS`).toBe(1);
  }
  await context.close();
});

test("every revealed element ends up visible after a full pass", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  // All the way to the bottom. A negative bottom rootMargin used to strand the
  // last section's heading here: it sat inside the shrunk band and the page had
  // nowhere further to scroll to lift it clear.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 200));
  });
  await page.waitForTimeout(800);

  const stuck = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-reveal]"))
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.className || el.tagName),
  );
  expect(stuck, "elements left hidden after scrolling past them").toEqual([]);
});
