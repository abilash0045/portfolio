import { test, expect, type Page } from "@playwright/test";

// Sixteen backdrop-filter declarations sat on backgrounds measured at alpha
// 1.0, so every one was blurring something nothing could see through, and the
// --glass-* tokens were a second set of names for --bg-card and its border.

const opaqueBackdrops = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const alphaOf = (css: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[3] / 255;
    };
    const style = (el: Element) => getComputedStyle(el) as unknown as Record<string, string>;

    return Array.from(document.querySelectorAll("*"))
      .filter((el) => {
        const cs = style(el);
        const bf = cs.backdropFilter || cs.webkitBackdropFilter;
        return bf && bf !== "none";
      })
      .map((el) => ({
        cls: (el as HTMLElement).className.toString().split(" ")[0] || el.tagName,
        alpha: alphaOf(getComputedStyle(el).backgroundColor),
      }));
  });

for (const path of ["/", "/dartboard"]) {
  test(`no blur behind an opaque surface on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path, { waitUntil: "networkidle" });
    if (path === "/") await page.locator("#dartboard-embedded-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    // A backdrop-filter is only ever worth its compositing cost over something
    // you can see through. Anything at alpha 1.0 is paying for nothing.
    const wasted = (await opaqueBackdrops(page)).filter((e) => e.alpha >= 0.99);
    expect(wasted, "backdrop-filter over an opaque background").toEqual([]);
  });
}

test("the glass tokens are gone, not just unused", async ({ page }) => {
  await page.goto("/");

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      bg: root.getPropertyValue("--glass-bg").trim(),
      border: root.getPropertyValue("--glass-border").trim(),
      shadow: root.getPropertyValue("--glass-shadow").trim(),
      raised: root.getPropertyValue("--shadow-raised").trim(),
    };
  });

  expect(tokens.bg, "--glass-bg is back").toBe("");
  expect(tokens.border, "--glass-border is back").toBe("");
  expect(tokens.shadow, "--glass-shadow is back").toBe("");
  expect(tokens.raised, "nothing to elevate floating chrome with").not.toBe("");
});

test("only things that float are elevated", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#case-studies").scrollIntoViewIfNeeded();

  const shadowed = (sel: string) =>
    page.locator(sel).first().evaluate((el) => getComputedStyle(el).boxShadow);

  // In normal flow: a rule and a surface, nothing hovering.
  for (const sel of [".study", ".tech-card", ".philosophy-card", ".magazine-card"]) {
    expect(await shadowed(sel), `${sel} still casts a shadow`).toBe("none");
  }

  // Sticky over scrolling content, so it needs to sit above the page.
  expect(await shadowed(".navbar"), "the sticky bar lost its separation").not.toBe("none");
});
