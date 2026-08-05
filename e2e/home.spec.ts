import { test, expect } from "@playwright/test";

test("home page carries full senior portfolio sections and 30-second value prop", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();
  await expect(
    page.getByText("Backend Engineer with 2+ years building event-driven microservices that power AI video generation at scale.").first()
  ).toBeVisible();

  // Verify Linear/Vercel sections
  await expect(page.getByText("Selected Work").first()).toBeVisible();
  await expect(page.getByText("Engineering Philosophy")).toBeVisible();
  await expect(page.getByText("Technology Ecosystem")).toBeVisible();
  await expect(page.getByText("Production Engineering Experience")).toBeVisible();
  await expect(page.getByText("Peer Endorsements")).toBeVisible();
  await expect(page.getByText("Let's Build Systems Together")).toBeVisible();

  // Verify structured project fields
  await expect(page.getByText("Problem").first()).toBeVisible();
  await expect(page.getByText("Architecture").first()).toBeVisible();
  await expect(page.getByText("My Contribution").first()).toBeVisible();

  // Verify functional resume download link
  const resumeBtn = page.getByRole("link", { name: /download resume/i });
  await expect(resumeBtn).toBeVisible();
  await expect(resumeBtn).toHaveAttribute("href", "/resume.pdf");

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

test("contact form allows user submission feedback", async ({ page }) => {
  await page.goto("/");
  await page.fill("#contact-name", "Alex Recruiter");
  await page.fill("#contact-email", "alex@techcorp.com");
  await page.fill("#contact-message", "We would love to interview you for a Senior Backend role.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText("✓ Message Sent Successfully!")).toBeVisible();
});

test("home page is responsive across mobile, tablet, and ultra-wide viewports", async ({ page }) => {
  // Mobile Viewport (iPhone SE / 375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();
  await expect(page.getByText("Technology Ecosystem")).toBeVisible();

  // Tablet Viewport (768x1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByText("Production Engineering Experience")).toBeVisible();

  // Ultra-wide Desktop Viewport (2560x1440)
  await page.setViewportSize({ width: 2560, height: 1440 });
  await expect(page.getByText("Engineering Philosophy")).toBeVisible();
});

test("home page stays about the work", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body")) ?? "";
  expect(body.toLowerCase()).not.toContain("open to work");
  expect(body.toLowerCase()).not.toContain("lpa");
});
