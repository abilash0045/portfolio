import { test, expect, type Page } from "@playwright/test";

// The header is two pills in a flex row with no wrap. Below about 420px they
// were squeezed narrower than their own labels, so "Open the full map" ran past
// the pill's right edge and the arrow dropped to a second line outside the
// border. These check the pills against their own text, not against a snapshot.

async function overflowing(page: Page) {
  return page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        ".dartboard__back-btn, .dartboard__fullscreen-btn, .dartboard__header-title",
      ),
    )
      .filter((el) => el.offsetParent !== null)
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => ({
        cls: el.className,
        text: (el.textContent ?? "").trim(),
        scroll: el.scrollWidth,
        client: el.clientWidth,
      })),
  );
}

for (const width of [320, 360, 390, 430, 520, 768, 1440]) {
  test(`header pills hold their labels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const path of ["/", "/dartboard"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      if (path === "/") {
        await page.locator("#dartboard-embedded-section").scrollIntoViewIfNeeded();
        await expect(page.locator(".dartboard__header")).toBeVisible();
      }

      expect(await overflowing(page), `${path} at ${width}px`).toEqual([]);

      // Nothing may sit outside the board it belongs to either.
      const spill = await page.evaluate(() => {
        const board = document.querySelector(".dartboard")!.getBoundingClientRect();
        return Array.from(
          document.querySelectorAll<HTMLElement>(".dartboard__header > *, .dartboard__header-actions > *"),
        )
          .filter((el) => el.offsetParent !== null)
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.right > board.right + 1 || r.left < board.left - 1;
          })
          .map((el) => (el.textContent ?? "").trim());
      });
      expect(spill, `${path} at ${width}px: header spills the board`).toEqual([]);
    }
  });
}

test("the instruction pill gives way to the action on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#dartboard-embedded-section").scrollIntoViewIfNeeded();

  // The slider label and the throw button say the same thing, right below.
  await expect(page.locator(".dartboard__header-title")).toBeHidden();
  await expect(page.locator(".dartboard__fullscreen-btn")).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".dartboard__header-title")).toBeVisible();
});
