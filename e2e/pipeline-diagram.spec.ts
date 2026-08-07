import { test, expect } from "@playwright/test";

// docs/DESIGN.md caps employer detail at what is already public and rules out
// real architecture diagrams of the employer's system. This one is allowed to
// exist only because it says nothing the case-study prose on the same page
// does not already say. These assertions are the fence around that.

test("the diagram is described to a screen reader", async ({ page }) => {
  await page.goto("/");

  const svg = page.locator(".pipeline__svg");
  await expect(svg).toHaveAttribute("role", "img");

  const label = await svg.getAttribute("aria-label");
  expect(label?.length ?? 0, "no accessible description").toBeGreaterThan(60);
  expect(label).toContain("Kafka");
  expect(label).toContain("Cloud Run");
});

test("every component named is one the page already names in prose", async ({
  page,
}) => {
  await page.goto("/");

  const named = await page.locator(".pipeline__svg").evaluate((svg) =>
    Array.from(svg.querySelectorAll("text, tspan"))
      .map((n) => n.textContent?.trim() ?? "")
      .join(" "),
  );

  // Everything the diagram names has to appear in the case studies too.
  const prose = (await page.textContent("#case-studies")) ?? "";
  for (const component of [
    "Kafka",
    "GKE",
    "Redis",
    "Cloud Run",
    "Pub/Sub",
  ]) {
    expect(named, `${component} missing from the diagram`).toContain(component);
    expect(
      prose,
      `the diagram names ${component} but the page never does in prose`,
    ).toContain(component);
  }
});

test("the diagram does not merge the wins that must stay separate", async ({
  page,
}) => {
  await page.goto("/");

  const text = (
    (await page.locator(".pipeline").textContent()) ?? ""
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

test("the diagram carries no internal or client detail", async ({ page }) => {
  await page.goto("/");
  const text = ((await page.locator(".pipeline").textContent()) ?? "").toLowerCase();

  for (const forbidden of ["whilter", "svc-", "prod-", "topic:", "cluster:"]) {
    expect(text, `internal detail leaked: ${forbidden}`).not.toContain(forbidden);
  }
});
