import { test, expect } from "@playwright/test";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../src/lib/site";

// A 473-byte stub once sat behind a resume download. The résumé is a page now,
// built from the same data as the home page's Experience section, and prints.

test("the résumé carries every section, and the one employer", async ({ page }) => {
  await page.goto("/resume");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Abilash S L");
  for (const name of ["Summary", "Experience", "Skills", "Projects", "Education", "Recognition"]) {
    await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("heading", { level: 3 })).toHaveText(
    "Software Development Engineer, Whilter Technologies (Whilter.ai)",
  );
  await expect(page.getByRole("heading", { level: 4 })).toHaveText([
    /^CiteOS/,
    /^Personalized video platform/,
  ]);

  const dates = await page
    .locator("main time")
    .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  expect(dates.length).toBeGreaterThan(0);
  for (const date of dates) expect(date >= "2023-05", `${date} is before the first job`).toBe(true);
});

test("every way to reach him works, and a phone number is not one of them", async ({ page }) => {
  await page.goto("/resume");
  const contact = page.locator(".resume__contact");

  await expect(contact.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
  await expect(contact.locator(`a[href="${GITHUB_URL}"]`)).toHaveCount(1);
  await expect(contact.locator(`a[href="${LINKEDIN_URL}"]`)).toHaveCount(1);

  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  expect((await page.textContent("main")) ?? "").not.toMatch(/\+?\d[\d\s-]{9,}\d/);
});

test("the print button opens the print dialog", async ({ page }) => {
  await page.goto("/resume");
  await page.evaluate(() => {
    const w = window as Window & { printed?: number };
    w.printed = 0;
    w.print = () => {
      w.printed! += 1;
    };
  });

  await page.getByRole("button", { name: "Print or save as PDF" }).click();
  expect(await page.evaluate(() => (window as Window & { printed?: number }).printed)).toBe(1);
});

// On paper it is the résumé and nothing else, dark on white whatever the theme.
test("the printed page is the résumé alone", async ({ page }) => {
  await page.goto("/resume");
  await page.emulateMedia({ media: "print" });

  await expect(page.locator(".navbar-wrapper")).toBeHidden();
  await expect(page.locator(".footer")).toBeHidden();
  await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeHidden();
  await expect(page.locator(".resume__contact")).toBeVisible();

  const [ink, paper] = await page.evaluate(() => [
    getComputedStyle(document.querySelector(".resume__name")!).color,
    getComputedStyle(document.body).backgroundColor,
  ]);
  expect(paper).toBe("rgb(255, 255, 255)");
  expect(ink).toBe("rgb(17, 17, 17)");
});

test("the bar reaches the résumé from the home page, on a phone too", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Résumé" }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Abilash S L");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Main menu" }).click();
  await page.locator("#primary-nav").getByRole("link", { name: "Résumé" }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.locator("#primary-nav")).toBeHidden();
});
