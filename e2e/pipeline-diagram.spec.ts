import { test, expect, type Page } from "@playwright/test";

// docs/DESIGN.md caps employer detail at what is already public and rules out
// real architecture diagrams of the employer's system. The two diagrams are
// allowed to exist only because each says nothing its own case study's prose
// does not already say. These assertions are the fence around that.

/** Studies' headlines and facts: their own words, which leave out the diagrams' labels. */
async function prose(page: Page, scope: string) {
  return (
    await page.locator(scope).locator(".study__headline, .study__facts").allTextContents()
  ).join(" ");
}

/** Every label drawn in a diagram, as one string. */
async function labels(page: Page, study: string) {
  return page.locator(`#${study} .pipeline__svg`).evaluate((svg) =>
    Array.from(svg.querySelectorAll("text, tspan"))
      .map((n) => n.textContent?.trim() ?? "")
      .join(" "),
  );
}

test.describe("the render path diagram", () => {
  test("is described to a screen reader", async ({ page }) => {
    await page.goto("/");

    const svg = page.locator("#render-reliability .pipeline__svg");
    await expect(svg).toHaveAttribute("role", "img");

    const label = await svg.getAttribute("aria-label");
    expect(label?.length ?? 0, "no accessible description").toBeGreaterThan(60);
    expect(label).toContain("Kafka");
    expect(label).toContain("Cloud Run");
  });

  test("names only components the studies already name in prose", async ({ page }) => {
    await page.goto("/");

    // It draws the whole render path, so the cost study's cache and
    // scale-to-zero are on it too. Their words are the page's, not this study's.
    const named = await labels(page, "render-reliability");
    const text = await prose(page, "#work");
    for (const component of ["Kafka", "GKE", "Redis", "Cloud Run", "Pub/Sub"]) {
      expect(named, `${component} missing from the diagram`).toContain(component);
      expect(text, `the diagram names ${component} but no study does in prose`).toContain(
        component,
      );
    }
  });

  test("does not merge the wins that must stay separate", async ({ page }) => {
    await page.goto("/");

    const text = (
      (await page.locator("#render-reliability .pipeline").textContent()) ?? ""
    ).toLowerCase();

    // The 60->98% reliability win was EFS concurrent-write atom corruption fixed
    // by pod-local staging. It was never autoscaling, and the diagram must not
    // put a reliability number next to the autoscaling stage.
    expect(text, "the diagram claims a reliability figure").not.toMatch(/98\s*%/);
    expect(text, "KEDA has no business in this diagram").not.toContain("keda");

    // The two cost wins are independent and must not read as one ~40% story.
    expect(text, "the diagram merges the two cost wins").not.toContain("40%");

    // The one number it may carry is the cache hit rate, which is the segment
    // caching win on its own and is stated in the case study in those words.
    expect(text).toContain("80%");
  });

  test("carries no internal or client detail", async ({ page }) => {
    await page.goto("/");
    const text = (
      (await page.locator("#render-reliability .pipeline").textContent()) ?? ""
    ).toLowerCase();

    for (const forbidden of ["whilter", "svc-", "prod-", "topic:", "cluster:"]) {
      expect(text, `internal detail leaked: ${forbidden}`).not.toContain(forbidden);
    }
  });
});

// CiteOS runs on test brands, so the diagram names no customer, and its spend
// cut is a percentage in the text because the dollar figures stay internal.
test.describe("the CiteOS diagram", () => {
  test("is described to a screen reader", async ({ page }) => {
    await page.goto("/");

    const svg = page.locator("#citeos .pipeline__svg");
    await expect(svg).toHaveAttribute("role", "img");

    const label = await svg.getAttribute("aria-label");
    expect(label?.length ?? 0, "no accessible description").toBeGreaterThan(60);
    expect(label).toContain("NestJS");
    expect(label).toContain("row-level security");
  });

  test("names only components its study already names in prose", async ({ page }) => {
    await page.goto("/");

    const named = await labels(page, "citeos");
    const text = await prose(page, "#citeos");
    for (const component of [
      "React web app",
      "NestJS API",
      "Fastify",
      "Keycloak",
      "pg-boss",
      "PostgreSQL",
      "row-level security",
      "AWS EKS",
    ]) {
      expect(named, `${component} missing from the diagram`).toContain(component);
      expect(text, `the diagram names ${component} but the study never does in prose`).toContain(
        component,
      );
    }
  });

  test("states no figures and no internal or customer detail", async ({ page }) => {
    await page.goto("/");
    const text = ((await page.locator("#citeos .pipeline").textContent()) ?? "").toLowerCase();

    // Numbers live in the prose, where they have their context.
    expect(text, "the diagram states a figure").not.toMatch(/\d/);
    for (const forbidden of ["whilter", "customer", "client", "$", "http", ".internal", "svc-", "prod-"]) {
      expect(text, `detail leaked: ${forbidden}`).not.toContain(forbidden);
    }
  });
});
