"use client";

import { useLayoutEffect } from "react";

type Idle = (callback: () => void, options?: { timeout: number }) => number;

/**
 * Lays out the blocks that site.css defers, ahead of anyone needing them.
 * Mounted once on the home page; it owns no markup of its own.
 *
 * Deferring them lets the first paint skip most of the page's text. Until a
 * block is drawn its height is an estimate, though, and a jump past estimated
 * blocks lands wherever the estimates put it: over 600px off in Chromium when
 * Next did the scrolling, and Safari has no scroll anchoring to correct even
 * the browser's own jumps. So this draws the blocks for real straight after
 * load, one per idle moment so that no single step is long enough to hold up
 * input, and draws the rest at once whenever a jump is about to happen.
 */
export default function LayoutAhead() {
  useLayoutEffect(() => {
    const pending = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lazy-layout]"),
    );
    const draw = (el: HTMLElement) =>
      el.style.setProperty("content-visibility", "visible");
    const drawAll = () => pending.splice(0).forEach(draw);

    // Arriving at a section, from another page or a link with a #section in
    // it. Next updates the URL before this runs and scrolls after it, so the
    // heights it scrolls past are real. The browser has already made its own
    // jump on a fresh load, against the estimates, so this makes it again.
    if (window.location.hash) {
      drawAll();
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
      return;
    }

    // Capture phase, so the rest is drawn before the browser or Next scrolls.
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href*="#"]')) {
        drawAll();
      }
    };
    document.addEventListener("click", onClick, true);

    // Safari has no requestIdleCallback.
    const idle: Idle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 50));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    let handle = idle(function next() {
      const el = pending.shift();
      if (!el) return;
      draw(el);
      handle = idle(next, { timeout: 1000 });
    }, { timeout: 1000 });

    return () => {
      cancel(handle);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
