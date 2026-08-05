import { test, expect } from "@playwright/test";

test("home page carries the work and links to the dartboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Abilash S L" })).toBeVisible();
  await expect(page.getByText("25,000")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /render failures that survived a week/i,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: /throw a dart at a map/i }).click();
  await expect(page).toHaveURL(/\/dartboard$/);
});

test("home page stays about the work", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body")) ?? "";
  expect(body.toLowerCase()).not.toContain("open to work");
  expect(body.toLowerCase()).not.toContain("lpa");
});
