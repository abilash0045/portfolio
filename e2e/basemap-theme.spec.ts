import { test, expect, type Page } from "@playwright/test";

// The basemap was CARTO's dark_all in both themes, so in light theme the map
// was a black slab dropped into a cream page. The tiles follow the theme now,
// and so do the two edge shades that were written assuming dark tiles.

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  }, theme);
}

const tileUrls = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>(".leaflet-tile")).map(
      (img) => img.src,
    ),
  );

test("the basemap follows the theme, including when it changes live", async ({
  page,
}) => {
  await page.goto("/dartboard", { waitUntil: "networkidle" });
  await expect(page.locator(".leaflet-container")).toHaveCount(1);

  await setTheme(page, "light");
  await expect
    .poll(async () => (await tileUrls(page)).some((u) => u.includes("light_all")), {
      message: "light theme still serving dark tiles",
    })
    .toBe(true);
  expect((await tileUrls(page)).every((u) => !u.includes("dark_all"))).toBe(true);

  // The toggle writes an attribute and broadcasts nothing, so this is the part
  // that breaks quietly: switching back has to swap the tiles again.
  await setTheme(page, "dark");
  await expect
    .poll(async () => (await tileUrls(page)).some((u) => u.includes("dark_all")), {
      message: "dark theme still serving light tiles",
    })
    .toBe(true);
});

test("no near-black edge shading is left over the light map", async ({ page }) => {
  await page.goto("/dartboard", { waitUntil: "networkidle" });
  await expect(page.locator(".leaflet-container")).toHaveCount(1);

  const read = () =>
    page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      const alphaOf = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css.trim();
        ctx.fillRect(0, 0, 1, 1);
        return ctx.getImageData(0, 0, 1, 1).data[3] / 255;
      };
      return {
        vignette: alphaOf(root.getPropertyValue("--wallmap-vignette")),
        hud: alphaOf(root.getPropertyValue("--wallmap-hud-edge")),
      };
    });

  await setTheme(page, "dark");
  const dark = await read();
  await setTheme(page, "light");
  const light = await read();

  // Not asserting an exact value, only that light theme is meaningfully less
  // shaded. 0.85 alpha of near-black over a cream map is the failure.
  expect(light.vignette, "vignette as heavy in light as in dark").toBeLessThan(
    dark.vignette / 2,
  );
  expect(light.hud, "hud edge as heavy in light as in dark").toBeLessThan(
    dark.hud / 2,
  );
});

test("the code sample keeps its shape instead of breaking mid-token", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#playground").scrollIntoViewIfNeeded();

  const pre = page.locator(".pg-code--input");
  const shape = await pre.evaluate((el) => ({
    whiteSpace: getComputedStyle(el).whiteSpace,
    wordBreak: getComputedStyle(el).wordBreak,
    overflowX: getComputedStyle(el).overflowX,
    scrollable: el.scrollWidth > el.clientWidth,
  }));

  // break-all is what split "sample-a" into "sampl e-a" and "1080p" into "1 080p".
  expect(shape.wordBreak).not.toBe("break-all");
  expect(shape.whiteSpace).toBe("pre");
  expect(shape.overflowX).toBe("auto");

  // The line count must match the source exactly: no line may have rewrapped.
  const lines = await pre.evaluate((el) => {
    const text = el.textContent ?? "";
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return { source: text.trimEnd().split("\n").length, rendered: Math.round(el.scrollHeight / lh) };
  });
  expect(lines.rendered, "the sample rewrapped").toBe(lines.source);
});
