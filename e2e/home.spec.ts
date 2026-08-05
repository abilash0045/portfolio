import { test, expect } from "@playwright/test";

test("home page carries the work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();
  await expect(page.getByText("25,000+").first()).toBeVisible();
  await expect(page.getByText("Selected Work").first()).toBeVisible();
  await expect(page.getByText("Engineering Philosophy")).toBeVisible();
  await expect(page.getByText("Technology Ecosystem")).toBeVisible();
  await expect(page.getByText("Production Engineering Experience")).toBeVisible();
  await expect(page.getByText("Get in touch")).toBeVisible();
});

// These assertions are the point of this file. Fabricated content reached this
// page once already: invented testimonials credited to people at a real
// employer, a blog whose articles linked nowhere, self-assigned skill
// percentage bars, a contact form that reported success while sending nothing,
// and a 473-byte stub behind a resume download. Each check below names one of
// those so it cannot come back quietly.
test.describe("nothing on this page claims something untrue", () => {
  test("no invented endorsements", async ({ page }) => {
    await page.goto("/");
    const body = ((await page.textContent("body")) ?? "").toLowerCase();
    expect(body).not.toContain("peer endorsement");
    expect(body).not.toContain("testimonial");
  });

  test("no self-assigned skill percentages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".skill-pct")).toHaveCount(0);
    await expect(page.locator(".skill-fill")).toHaveCount(0);
  });

  test("no title inflation and no tenure claim", async ({ page }) => {
    await page.goto("/");
    const body = ((await page.textContent("body")) ?? "").toLowerCase();
    expect(body).not.toContain("senior backend");
    expect(body).not.toMatch(/\d\+?\s*years/);
  });

  test("every link goes somewhere real", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("a")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute("href")),
      );
    for (const href of hrefs) {
      expect(
        href,
        "an anchor with no href is decoration pretending to be a link",
      ).toBeTruthy();
      expect(href).not.toBe("#");
    }

    // An in-page anchor pointing at a section that no longer exists is a dead
    // link that still looks alive. Removing the testimonials section left one.
    const fragments = hrefs.filter(
      (h): h is string => !!h && h.startsWith("#") && h.length > 1,
    );
    for (const fragment of fragments) {
      await expect(
        page.locator(fragment),
        `${fragment} has no matching element on the page`,
      ).toHaveCount(1);
    }
  });

  test("the contact form does not fake a send", async ({ page }) => {
    await page.goto("/");
    await page.fill("#contact-name", "Alex Recruiter");
    await page.fill("#contact-email", "alex@example.com");
    await page.fill("#contact-message", "Are you free to talk this week?");

    await expect(
      page.getByRole("button", { name: /open in your mail app/i }),
    ).toBeVisible();

    // The page says plainly that it sends nothing itself.
    await expect(page.getByText(/nothing is sent from this page/i)).toBeVisible();

    const body = ((await page.textContent("body")) ?? "").toLowerCase();
    expect(body).not.toContain("message sent");
  });

  test("no download link points at a missing or stub file", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const downloads = await page
      .locator("a[download]")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute("href")),
      );
    for (const href of downloads) {
      if (!href) continue;
      const response = await request.get(href);
      expect(response.status(), `${href} should exist`).toBe(200);
      const body = await response.body();
      // A real document is not a few hundred bytes.
      expect(body.byteLength, `${href} looks like a stub`).toBeGreaterThan(20_000);
    }
  });
});

test("home page stays about the work", async ({ page }) => {
  await page.goto("/");
  const body = ((await page.textContent("body")) ?? "").toLowerCase();
  expect(body).not.toContain("open to work");
  expect(body).not.toContain("lpa");
});

test("home page is responsive from small mobile to ultra-wide", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByText("Abilash S L").first()).toBeVisible();

  // Nothing should push the document wider than the viewport.
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "page scrolls horizontally at 375px").toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByText("Production Engineering Experience")).toBeVisible();

  await page.setViewportSize({ width: 2560, height: 1440 });
  await expect(page.getByText("Engineering Philosophy")).toBeVisible();
});
