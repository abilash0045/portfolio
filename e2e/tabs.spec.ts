import { test, expect } from "@playwright/test";

// The visitor playground carried role="tablist" over four role="tab" buttons
// with no tabpanel, no aria-controls and no arrow-key handling: a role that
// promises a keyboard pattern the component never implemented. These fail if
// any part of the promise goes missing again.

const TABS = ["ValidateVisitor", "DiffVisitor", "SerialiseVisitor", "PreviewVisitor"];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#playground").scrollIntoViewIfNeeded();
});

test("the tablist is wired to a real panel", async ({ page }) => {
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(4);

  const panel = page.getByRole("tabpanel");
  await expect(panel).toHaveCount(1);

  const panelId = await panel.getAttribute("id");
  expect(panelId, "the panel has no id to point at").toBeTruthy();

  for (const name of TABS) {
    const tab = page.getByRole("tab", { name });
    await expect(tab).toHaveAttribute("aria-controls", panelId!);
  }

  // The panel names itself after whichever tab is selected.
  const selectedId = await page
    .getByRole("tab", { selected: true })
    .getAttribute("id");
  await expect(panel).toHaveAttribute("aria-labelledby", selectedId!);
});

test("only the selected tab is in the tab order", async ({ page }) => {
  const indexes = await page
    .getByRole("tab")
    .evaluateAll((els) => els.map((el) => el.getAttribute("tabindex")));
  expect(indexes).toEqual(["0", "-1", "-1", "-1"]);

  await page.getByRole("tab", { name: "SerialiseVisitor" }).click();
  const after = await page
    .getByRole("tab")
    .evaluateAll((els) => els.map((el) => el.getAttribute("tabindex")));
  expect(after).toEqual(["-1", "-1", "0", "-1"]);
});

test("arrow keys move between tabs and wrap at both ends", async ({ page }) => {
  await page.getByRole("tab", { name: "ValidateVisitor" }).focus();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("DiffVisitor");
  await expect(page.getByRole("tabpanel")).toContainText("DiffVisitor");

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("PreviewVisitor");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("ValidateVisitor");

  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("PreviewVisitor");

  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { selected: true })).toHaveText("ValidateVisitor");

  // Focus follows selection, or the next Tab press starts from the wrong place.
  await expect(page.getByRole("tab", { name: "ValidateVisitor" })).toBeFocused();
});

test("arrow keys do not swallow page scrolling", async ({ page }) => {
  await page.getByRole("tab", { name: "ValidateVisitor" }).focus();
  const before = await page.evaluate(() => window.scrollY);

  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);

  const after = await page.evaluate(() => window.scrollY);
  expect(after, "ArrowDown was captured by the tablist").toBeGreaterThan(before);
  await expect(page.getByRole("tab", { selected: true })).toHaveText(
    "ValidateVisitor",
  );
});

test("Tab leaves the group instead of walking all four", async ({ page }) => {
  await page.getByRole("tab", { name: "ValidateVisitor" }).focus();
  await page.keyboard.press("Tab");

  const role = await page.evaluate(() =>
    document.activeElement?.getAttribute("role"),
  );
  expect(role, "Tab moved to another tab instead of out of the tablist").not.toBe(
    "tab",
  );
});
