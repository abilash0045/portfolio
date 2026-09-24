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

  // Four of the five case studies said "See it below" and meant something
  // else. Two pointed at the widget in their own card, which sits above the
  // link naming it; one pointed at that widget from the next card down; one
  // pointed at the contact form, which has nothing to do with WhatsApp.
  test("a link that says below points at something below it", async ({ page }) => {
    await page.goto("/");
    const links = await page.locator("a", { hasText: /below/i }).all();
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const where = await link.evaluate((a) => {
        const target = document.querySelector(a.getAttribute("href") ?? "");
        if (!target) return null;
        return {
          label: `${a.textContent?.trim()} -> ${a.getAttribute("href")}`,
          linkBottom: a.getBoundingClientRect().bottom,
          targetTop: target.getBoundingClientRect().top,
        };
      });
      expect(where, "a 'below' link to nothing on this page").not.toBeNull();
      expect(where!.targetTop, `${where!.label} points up`).toBeGreaterThan(
        where!.linkBottom,
      );
    }
  });

  // ~30% came from the segment cache and ~10% from scale-to-zero. They are
  // independent and must never read as one win. The widget's cache toggle
  // claimed all ~40% for the cache, and the hero stated ~40% as one number.
  test("the cache is credited with its own ~30%, not both wins", async ({ page }) => {
    await page.goto("/");
    const widget = page.locator("#architecture");
    await widget.getByRole("button", { name: "Redis Segment Cache" }).click();

    const spend = widget.locator(".sim-card", { hasText: /spend/i });
    await expect(spend).toContainText("~30%");
    await expect(spend).not.toContainText("40%");
  });

  test("wherever ~40% appears, it is shown as two cuts", async ({ page }) => {
    await page.goto("/");
    const contexts = await page.locator("main").evaluate((main) => {
      const found: string[] = [];
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.includes("40%")) continue;
        // The block holding the figure, then the block around that: the
        // metric with its label, the field with its heading.
        let el = node.parentElement!;
        while (getComputedStyle(el).display === "inline" && el.parentElement) {
          el = el.parentElement;
        }
        found.push((el.parentElement ?? el).textContent ?? "");
      }
      return found;
    });

    expect(contexts.length, "the combined figure is gone entirely").toBeGreaterThan(0);
    for (const text of contexts) {
      expect(text, "~40% stated as one win").toMatch(/twice|~30%[\s\S]*~10%/);
    }
  });

  // "Copy email" said "Copied" whether or not anything was copied. The
  // clipboard is missing outside a secure context and refuses when denied.
  test("the copy button never reports a copy that failed", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () =>
            Promise.reject(new DOMException("Write permission denied.", "NotAllowedError")),
        },
      });
    });
    await page.goto("/");

    await page.getByRole("button", { name: "Copy email" }).click();
    const button = page.locator(".hero__btn--ghost");
    await expect(button).toHaveText(/couldn't copy/i);
    await expect(button).not.toHaveText(/^copied$/i);
    // A screen reader is told what broke and handed the address instead.
    await expect(
      page.getByRole("status").filter({ hasText: "abilash0045@gmail.com" }),
    ).toHaveCount(1);
  });

  test("a copy that works says so, and copies the address", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.locator(".hero__btn--ghost")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "abilash0045@gmail.com",
    );
  });

  // The segment cache hits about 80%, as every other mention on the page says.
  // One card rounded that into a floor, "80%+".
  test("no measured percentage is turned into a floor", async ({ page }) => {
    await page.goto("/");
    const body = (await page.textContent("main")) ?? "";
    expect(body.match(/\d+%\+/g) ?? []).toEqual([]);
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

// Below 540px the nav list was simply display:none with nothing in its place,
// so a phone visitor could not reach any section of the page.
test.describe("navigation works on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu opens, navigates, and closes", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Main menu" });
    const nav = page.locator("#primary-nav");

    await expect(toggle).toBeVisible();
    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(nav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Selected Work" })).toBeVisible();

    // Choosing a destination should close the panel behind you.
    await page.getByRole("link", { name: "Selected Work" }).click();
    await expect(nav).toBeHidden();
  });

  test("escape closes the menu and returns focus to the control", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Main menu" });

    await toggle.click();
    await expect(page.locator("#primary-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#primary-nav")).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("menu links are reachable by keyboard and big enough to tap", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Main menu" }).click();

    const link = page.getByRole("link", { name: "Contact" });
    const box = await link.boundingBox();
    expect(box, "Contact link should be laid out").not.toBeNull();
    expect(box!.height, "touch target under 44px").toBeGreaterThanOrEqual(44);

    await link.focus();
    await expect(link).toBeFocused();
  });
});

test("the menu control is not shown when the full nav fits", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Main menu" })).toBeHidden();
  await expect(page.locator("#primary-nav")).toBeVisible();
});

test("home page stays about the work", async ({ page }) => {
  await page.goto("/");
  const body = ((await page.textContent("body")) ?? "").toLowerCase();
  expect(body).not.toContain("open to work");
  expect(body).not.toContain("lpa");
});

// The second role sat in the left half of its row next to nothing, and every
// case study wore the same "FEATURED PROJECT" label.
test("no card sits alone in half a row, and no two case studies share a label", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const holes = await page.locator(".magazine-grid").evaluate((grid) => {
    const width = grid.getBoundingClientRect().width;
    const rows = new Map<number, DOMRect[]>();
    for (const card of Array.from(grid.children)) {
      const box = card.getBoundingClientRect();
      const top = Math.round(box.top);
      rows.set(top, [...(rows.get(top) ?? []), box]);
    }
    return [...rows.values()]
      .filter((row) => row.length === 1 && row[0].width < width - 1)
      .map((row) => Math.round(row[0].width));
  });
  expect(holes, "a card sits alone in half a row").toEqual([]);

  const labels = await page.locator(".study__number").allTextContents();
  expect(new Set(labels).size, `labels repeat: ${labels.join(", ")}`).toBe(labels.length);
});

// At 390px "GitHub ↗" broke inside itself and stranded its arrow on a second
// line, and a wrapped row could open with a "·" that separated nothing.
test("link rows wrap between links, never inside one", async ({ page }) => {
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const rows = page.locator(".hero__socials, .contact-channels");

    const broken = await rows.locator("a").evaluateAll((links) =>
      links
        .filter(
          (a) => a.getBoundingClientRect().height > parseFloat(getComputedStyle(a).fontSize) * 2,
        )
        .map((a) => a.textContent?.trim()),
    );
    expect(broken, `links broken across lines at ${width}px`).toEqual([]);

    const strays = await rows.evaluateAll((els) =>
      els.flatMap((row) =>
        Array.from(row.children)
          .filter((child) => child.tagName !== "A")
          .map((child) => child.textContent?.trim()),
      ),
    );
    expect(strays, "separators that can strand at the start of a line").toEqual([]);
  }
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
