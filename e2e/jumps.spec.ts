import { test, expect, type Page } from "@playwright/test";

// The blocks below the hero are laid out as they near the screen, and until
// then their heights are estimates (site.css, LayoutAhead.tsx). Jumps that
// scrolled past estimates landed as much as 600px from their section: under
// the header, or in the middle of the section before. Every case here starts
// from a fresh page, so nothing has been drawn ahead of the jump.

// scroll-padding-top: the 64px header and 20px of air.
const CLEARANCE = 84;

async function expectLanded(page: Page, id: string) {
  // Smooth jumps take a moment. Wait for the page to stop moving.
  let last = -1;
  for (let still = 0, i = 0; still < 5 && i < 100; i++) {
    const y = await page.evaluate(() => window.scrollY);
    still = y === last ? still + 1 : 0;
    last = y;
    await page.waitForTimeout(100);
  }

  const { top, atBottom } = await page.evaluate((id) => {
    const root = document.documentElement;
    return {
      top: Math.round(document.getElementById(id)!.getBoundingClientRect().top),
      atBottom: Math.abs(window.scrollY - (root.scrollHeight - window.innerHeight)) < 2,
    };
  }, id);

  // At the foot of the page there can be no room to lift the last section higher.
  if (atBottom && top > CLEARANCE) return;
  expect(Math.abs(top - CLEARANCE), `#${id} landed at ${top}px, not ${CLEARANCE}px`).toBeLessThanOrEqual(2);
}

test.describe("a jump lands its section just under the header", () => {
  for (const [label, id] of [
    ["Experience", "experience"],
    ["Approach", "approach"],
    ["Contact", "contact"],
  ]) {
    test(`from the bar, before the page has drawn anything: ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.goto("/", { waitUntil: "commit" });
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label, exact: true }).click();
      await expectLanded(page, id);
    });
  }

  for (const width of [390, 1440]) {
    for (const [label, id] of [
      ["Approach", "approach"],
      ["Contact", "contact"],
    ]) {
      test(`from the résumé at ${width}px: ${label}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto("/resume");
        if (width < 821) await page.getByRole("button", { name: "Main menu" }).click();
        await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label, exact: true }).click();
        await page.waitForURL(`**/#${id}`);
        await expectLanded(page, id);
      });
    }
  }

  test("from the résumé's link to the case studies", async ({ page }) => {
    await page.goto("/resume");
    await page.getByRole("link", { name: "Read the case studies" }).click();
    await page.waitForURL("**/#work");
    await expectLanded(page, "work");
  });

  for (const id of ["render-reliability", "approach"]) {
    test(`arriving on a link to #${id}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/#${id}`);
      await expectLanded(page, id);
    });
  }
});

// Decoding the hash threw on "%", and it threw inside a layout effect, which
// takes the whole page down rather than just missing the jump.
test("a mangled #fragment still gets the page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#%E0%A4%A");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
