import { test, expect } from "@playwright/test";

// The three font tokens in globals.css were each defined in terms of
// themselves: `--font-body: var(--font-body), ...`. A self-referential custom
// property is invalid at computed-value time, so the browser threw the whole
// declaration away, fallback chain included. All three computed to nothing,
// every element fell through to the browser default, and the entire site
// rendered in Times while 114 KB of webfont downloaded and styled none of it.
//
// Nothing about that failure looks like a failure. It renders, it passes a
// build, and it reads as a deliberate serif choice. Hence these.

test("the font tokens actually resolve", async ({ page }) => {
  await page.goto("/");

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      body: root.getPropertyValue("--font-body").trim(),
      display: root.getPropertyValue("--font-display").trim(),
      mono: root.getPropertyValue("--font-mono").trim(),
      serif: root.getPropertyValue("--font-serif").trim(),
    };
  });

  expect(tokens.body, "--font-body resolves to nothing").toMatch(/^['"]?Geist['"]?,/);
  // Display type is the body family, set heavier and tighter.
  expect(tokens.display, "--font-display resolves to nothing").toMatch(/^['"]?Geist['"]?,/);
  expect(tokens.mono, "--font-mono resolves to nothing").toContain("Geist Mono");
  expect(tokens.serif, "--font-serif resolves to nothing").toContain("Instrument Serif");
});

test("the page renders in the fonts it downloads, not a browser default", async ({
  page,
}) => {
  await page.goto("/");

  const resolved = await page.evaluate(() => {
    const fam = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontFamily : `MISSING ${sel}`;
    };
    return {
      body: fam("body"),
      heading: fam(".hero__title"),
      lede: fam(".hero__lede"),
      mono: fam(".hero__eyebrow"),
      serif: fam(".hero__title em"),
    };
  });

  for (const [where, family] of Object.entries(resolved)) {
    expect(family, `${where} fell back to a system serif`).not.toMatch(
      /^(Times|serif|Georgia)/i,
    );
  }

  const first = (family: string) => family.split(",")[0].replace(/["']/g, "").trim();
  expect(first(resolved.body)).toBe("Geist");
  expect(first(resolved.heading)).toBe("Geist");
  expect(first(resolved.lede)).toBe("Geist");
  expect(first(resolved.mono)).toBe("Geist Mono");
  // The serif is meant to be seen: the two italic words in the headline.
  expect(first(resolved.serif)).toBe("Instrument Serif");
});

test("every downloaded family is used by something", async ({ page }) => {
  await page.goto("/");

  const unused = await page.evaluate(() => {
    const wanted = ["Geist", "Geist Mono", "Instrument Serif"];
    const inUse = new Set<string>();
    document.querySelectorAll("*").forEach((el) => {
      const first = getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
      inUse.add(first);
    });
    return wanted.filter((family) => !inUse.has(family));
  });

  expect(unused, "a font is downloaded on every page load and styles nothing").toEqual(
    [],
  );
});
