import { test, expect } from "@playwright/test";

test("home page carries the work and embeds the interactive dartboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();
  await expect(page.getByText("25,000+").first()).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /render failures that survived a week/i,
    }),
  ).toBeVisible();

  // Verify embedded dartboard on home page
  await expect(page.locator("#dartboard-embedded")).toBeVisible();
  await page.getByRole("link", { name: /open full screen/i }).click();
  await expect(page).toHaveURL(/\/dartboard$/);
});

test("home page renders interactive architecture simulator and playground", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Interactive Architecture Simulator")).toBeVisible();
  await expect(page.getByText("Visitor Pattern Playground")).toBeVisible();

  // Test interactive simulator toggle
  const efsBtn = page.getByRole("button", { name: /shared efs/i });
  await efsBtn.click();
  await expect(page.locator(".sim-container").getByText("60%", { exact: true })).toBeVisible();

  const ephBtn = page.getByRole("button", { name: /ephemeral disk/i });
  await ephBtn.click();
  await expect(page.locator(".sim-container").getByText("98%", { exact: true })).toBeVisible();
});

test("home page is responsive across mobile, tablet, and ultra-wide viewports", async ({ page }) => {
  // Mobile Viewport (iPhone SE / 375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();
  await expect(page.getByText("Interactive Architecture Simulator")).toBeVisible();

  // Tablet Viewport (768x1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByText("Interactive Architecture Simulator")).toBeVisible();

  // Ultra-wide Desktop Viewport (2560x1440)
  await page.setViewportSize({ width: 2560, height: 1440 });
  await expect(page.getByText("Interactive Architecture Simulator")).toBeVisible();
});

test("home page stays about the work", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body")) ?? "";
  expect(body.toLowerCase()).not.toContain("open to work");
  expect(body.toLowerCase()).not.toContain("lpa");
});
