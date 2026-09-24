import { test, expect } from "@playwright/test";

/**
 * Interaction states, which the site had almost none of.
 *
 * Before this file, `:focus-visible` was declared on four selectors in
 * navbar.css and nowhere else, so tabbing past the header left no visible
 * indicator at all. `:active` did not exist anywhere. contact.css set
 * `outline: none` on the form fields. These checks fail if any of that
 * comes back.
 */

type FocusInfo = {
  tag: string;
  label: string;
  outlineStyle: string;
  outlineWidth: number;
  matchesFocusVisible: boolean;
  revisited: boolean;
};

/** Reads the focus indicator off whatever currently holds focus. */
async function activeFocusInfo(page: import("@playwright/test").Page) {
  return page.evaluate<FocusInfo | null>(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body || el === document.documentElement) {
      return null;
    }
    // The walk below used to decide it had wrapped when a label repeated, and
    // the page has several links that share one. It stopped at the second,
    // two sections in. Marking the element itself is what "been here" means.
    const revisited = el.hasAttribute("data-tab-walk");
    el.setAttribute("data-tab-walk", "");
    // The ring is the element's outline, or its ::after's where the element's
    // own would be buried under its children. The map is the one that does it.
    const own = getComputedStyle(el);
    const style =
      own.outlineStyle === "none" ? getComputedStyle(el, "::after") : own;
    const label =
      el.getAttribute("aria-label") ??
      (el.textContent ?? "").trim().slice(0, 40) ??
      "";
    return {
      tag: el.tagName.toLowerCase(),
      label: `${el.tagName.toLowerCase()}.${el.className || "-"} "${label}"`,
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth) || 0,
      matchesFocusVisible: el.matches(":focus-visible"),
      revisited,
    };
  });
}

test("every control reachable by Tab shows a focus ring", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const seen: string[] = [];
  const unringed: string[] = [];

  // Enough presses to walk the header, the hero, both widgets, the map
  // controls, the form and the footer.
  for (let i = 0; i < 70; i += 1) {
    await page.keyboard.press("Tab");
    const info = await activeFocusInfo(page);
    if (!info) continue;
    if (info.revisited) break; // wrapped back to the start
    seen.push(info.label);

    const ringed =
      info.matchesFocusVisible &&
      info.outlineStyle !== "none" &&
      info.outlineWidth >= 2;
    if (!ringed) {
      unringed.push(
        `${info.label} -> outline: ${info.outlineStyle} ${info.outlineWidth}px, ` +
          `:focus-visible=${info.matchesFocusVisible}`,
      );
    }
  }

  expect(seen.length, "tab order should reach the page at all").toBeGreaterThan(
    10,
  );
  expect(
    seen.some((label) => label.includes("footer__link")),
    "the walk stopped before the footer",
  ).toBe(true);
  expect(unringed, "controls with no visible keyboard focus").toEqual([]);
});

test("the form fields keep their focus ring", async ({ page }) => {
  await page.goto("/");

  for (const id of ["#contact-name", "#contact-email", "#contact-message"]) {
    await page.locator(id).focus();
    const info = await activeFocusInfo(page);
    expect(info, `${id} did not take focus`).not.toBeNull();
    expect(info!.outlineStyle, `${id} has outline: none`).not.toBe("none");
    expect(info!.outlineWidth, `${id} ring too thin`).toBeGreaterThanOrEqual(2);
  }
});

// The map and its credit links sit flush against an overflow: hidden edge, so
// the standard ring 3px outside them was cut off completely. Computed style
// reports a perfectly good outline either way, which is why this measures
// where the ring lands against every ancestor that clips.
test("focus rings on the map are not cut off by its edges", async ({ page }) => {
  await page.goto("/dartboard");
  const credits = page.locator(".leaflet-control-attribution a");
  await expect(credits.first()).toBeVisible();

  const targets = [page.locator(".leaflet-container"), ...(await credits.all())];
  for (const target of targets) {
    await target.focus();
    const cut = await target.evaluate((el) => {
      const own = getComputedStyle(el);
      const style = own.outlineStyle === "none" ? getComputedStyle(el, "::after") : own;
      if (style.outlineStyle === "none") return `${el.className} has no ring at all`;
      const reach = (parseFloat(style.outlineOffset) || 0) + (parseFloat(style.outlineWidth) || 0);
      const box = el.getBoundingClientRect();
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === "visible" && ps.overflowY === "visible") continue;
        const clip = p.getBoundingClientRect();
        if (
          box.left - reach < clip.left - 0.5 ||
          box.top - reach < clip.top - 0.5 ||
          box.right + reach > clip.right + 0.5 ||
          box.bottom + reach > clip.bottom + 0.5
        ) {
          return `${el.textContent?.trim().slice(0, 20) || el.className} by ${p.className}`;
        }
      }
      return null;
    });
    expect(cut, "focus ring cut off").toBeNull();
  }
});

// The ring colour is a per-theme token, so it has to be checked in both.
for (const scheme of ["dark", "light"] as const) {
  test(`the focus ring holds up in the ${scheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);

    await page.keyboard.press("Tab");
    const info = await activeFocusInfo(page);
    expect(info, "nothing took focus on the first Tab").not.toBeNull();
    expect(info!.outlineStyle).not.toBe("none");
    expect(info!.outlineWidth).toBeGreaterThanOrEqual(2);
  });
}

// Three lists of plain text carried hover styles: the hero stack tags, the
// per-study tech list and the tech-stack pills. A cursor change or a colour
// shift on something that cannot be clicked is a promise the page breaks.
test("text that is not a control does not behave like one", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  for (const selector of [".hero__tech-tag", ".study__tech", ".tech-pill"]) {
    const item = page.locator(selector).first();
    await item.scrollIntoViewIfNeeded();

    const before = await item.evaluate((el) => getComputedStyle(el).color);
    await item.hover();
    const after = await item.evaluate((el) => getComputedStyle(el).color);
    const cursor = await item.evaluate((el) => getComputedStyle(el).cursor);

    expect(after, `${selector} changes colour on hover but is not a control`).toBe(
      before,
    );
    expect(cursor, `${selector} shows a pointer but is not a control`).not.toBe(
      "pointer",
    );
  }
});

// The two segmented toggles carried their state in a CSS class only, so a
// screen reader announced four identical unlabelled buttons.
test("the segmented toggles report their state", async ({ page }) => {
  await page.goto("/");

  const efs = page.getByRole("button", { name: "Shared EFS (Legacy)" });
  const ephemeral = page.getByRole("button", { name: "Ephemeral Disk (Current)" });

  // The widget opens on the current architecture, not the legacy one.
  await expect(ephemeral).toHaveAttribute("aria-pressed", "true");
  await expect(efs).toHaveAttribute("aria-pressed", "false");

  await efs.click();
  await expect(efs).toHaveAttribute("aria-pressed", "true");
  await expect(ephemeral).toHaveAttribute("aria-pressed", "false");

  await expect(page.getByRole("group", { name: "Storage mode" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Caching mode" })).toBeVisible();
});

// The project rule is that every animation respects this. It used to be
// honoured by three stylesheets for a handful of their own rules.
test.describe("reduced motion is respected", () => {
  test("transitions and smooth scrolling are off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const scrollBehavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior, "smooth scrolling ignores the preference").toBe(
      "auto",
    );

    const durations = await page
      .locator(".hero__btn, .submit-btn, .sim-btn")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionDuration),
      );
    expect(durations.length).toBeGreaterThan(2);
    for (const duration of durations) {
      const seconds = Math.max(
        ...duration.split(",").map((part) => parseFloat(part) || 0),
      );
      expect(seconds, `transition still runs for ${duration}`).toBeLessThan(0.01);
    }

    // And nothing that never had a transition is given one. transition-property
    // defaults to all, so a blanket near-zero duration turned every style change
    // on every element into a transition that reached layout a frame late.
    const plain = await page
      .locator("h1")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(plain, "reduced motion gave a plain heading a transition").toBe("0s");
  });

  // Leaflet flies and pans in JavaScript, which no stylesheet can stop, so the
  // map took 0.9s to fly to every landing whatever the setting said. Set to
  // jump, the pin is dead centre by the time the card is up; mid-flight it is
  // nowhere near.
  test("the map jumps to where the dart landed instead of flying there", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dartboard");
    const throwButton = page.getByRole("button", { name: /throw the dart/i });
    await expect(throwButton).toBeEnabled({ timeout: 15_000 });

    await throwButton.click();
    await expect(page.locator(".card")).toBeVisible({ timeout: 25_000 });
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);

    // Two frames first, so a jump has been painted before its box is read.
    // Until globals.css stopped giving every element a 0.01ms transition, an
    // instant jump reached layout a frame late and this read it mid-frame.
    // Two frames is a settled jump, and 2% of a 0.9s flight.
    const offCentre = await page.evaluate(async () => {
      for (let i = 0; i < 2; i += 1) await new Promise(requestAnimationFrame);
      const pin = document.querySelector(".leaflet-marker-icon")!.getBoundingClientRect();
      const map = document.querySelector(".leaflet-container")!.getBoundingClientRect();
      return Math.hypot(
        pin.left + pin.width / 2 - (map.left + map.width / 2),
        pin.top + pin.height / 2 - (map.top + map.height / 2),
      );
    });
    expect(offCentre, "the map was still flying when the card appeared").toBeLessThan(2);
  });
});

// The hero's dot and the storage widget's failure node both pulsed forever:
// motion nobody asked for, on a page whose one unprompted movement is meant to
// be content settling in once.
test("nothing on the page loops forever", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Shared EFS (Legacy)" }).click();

  const looping = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((el) => {
        const style = getComputedStyle(el);
        return style.animationName !== "none" && style.animationIterationCount.includes("infinite");
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
  );
  expect(looping).toEqual([]);
});
