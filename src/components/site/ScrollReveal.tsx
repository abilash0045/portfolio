"use client";

import { useEffect } from "react";

/**
 * Marks `[data-reveal]` elements as revealed once they come near the viewport.
 * Mounted once; it owns no markup of its own.
 *
 * The hidden state lives in CSS behind `(scripting: enabled)` and
 * `(prefers-reduced-motion: no-preference)`, not here, for two reasons. It has
 * to be in the server-rendered HTML or the content would paint, hide, then
 * reveal. And a browser with JavaScript off, or one that does not understand
 * the `scripting` feature, never applies it at all, so nothing can strand the
 * page at opacity zero if this file never runs.
 *
 * A fixed CSS duration rather than a scroll-driven `view()` timeline, because
 * that timeline is proportional to element height and these targets run from a
 * 56px heading to a 1303px case-study card. The same declaration would take 16
 * times longer on one than the other.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-revealed])",
    );
    if (targets.length === 0) return;

    const reveal = (el: HTMLElement) => el.setAttribute("data-revealed", "");

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      // No negative margin. Shrinking the root to delay the trigger stranded
      // anything sitting in that band at full scroll: the last section's
      // heading could never satisfy the threshold, because the page had no
      // further to scroll to lift it clear. An unshrunk root means everything
      // the visitor can actually see has intersected, which is the property
      // that makes this safe.
      { rootMargin: "0px", threshold: 0.01 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
