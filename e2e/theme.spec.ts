import { test, expect, type Page } from "@playwright/test";

// The theme used to be applied by the navbar, in an effect, after hydration.
// So a light-theme visitor got a dark page until the JavaScript arrived, the
// dartboard (which has no navbar) was dark for everyone, and a browser with
// site data blocked, where merely reading localStorage throws, lost the whole
// home page to the error screen. These fail if any of that comes back.

const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("the theme is set before the app's JavaScript runs", async ({ page }) => {
  // With every script bundle refused, only the inline script in <head> can
  // have set the theme. This is what the page looks like before hydration.
  await page.route("**/_next/static/chunks/*.js", (route) => route.abort());
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  expect(await theme(page), "the theme waited for hydration").toBe("light");
  const lightBackground = await background(page);

  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(await theme(page)).toBe("dark");
  expect(await background(page), "both themes paint the same background").not.toBe(
    lightBackground,
  );
});

test("the dartboard follows the visitor's theme too", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dartboard");
  expect(await theme(page), "the dartboard ignored a light preference").toBe("light");
});

test("a choice made with the toggle beats the system preference, on every page", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(await theme(page)).toBe("dark");

  await page.goto("/dartboard");
  expect(await theme(page), "the choice did not carry to the dartboard").toBe("dark");
  await page.goto("/");
  expect(await theme(page), "the choice did not survive a reload").toBe("dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});

test("native controls are drawn for the theme on screen", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
  expect(scheme, "light page, dark scrollbars and form controls").toBe("light");
});

test("blocked site data costs the saved theme, not the page", async ({ page }) => {
  // What Chrome does with cookies and site data blocked: the getter throws.
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Access is denied for this document.", "SecurityError");
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1 })).toContainText("three weeks");
  expect(errors, "an uncaught storage error").toEqual([]);

  // The toggle still switches; it just can't be remembered.
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(await theme(page)).toBe("light");
  expect(errors).toEqual([]);
});
