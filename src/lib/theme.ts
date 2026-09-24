/**
 * The theme is one attribute, `data-theme` on <html>, and globals.css keys
 * every token off it. Nothing else holds theme state.
 */
export type Theme = "dark" | "light";

export const THEME_KEY = "portfolio-theme";

/**
 * Sets `data-theme` from the visitor's saved choice, or from their system
 * preference when there is none.
 *
 * layout.tsx inlines this function's source into <head>, so it runs while the
 * HTML is still being parsed, before anything paints. That is why it takes the
 * key as an argument and closes over nothing: only its text travels. It used to
 * run in the navbar's effect, after hydration, which gave every light-theme
 * visitor a dark page first and left the dartboard, which has no navbar, dark
 * for everyone.
 *
 * Storage can be switched off outright, and then merely reading
 * `localStorage` throws. Uncaught, that took the whole page down.
 */
export function applyInitialTheme(key: string): void {
  let theme: string | null = null;
  try {
    theme = window.localStorage.getItem(key);
  } catch {
    // Storage is blocked. Fall through to the system preference.
  }
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
}

/** What the page is showing right now. */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** Shows `theme` now and remembers it if storage allows. */
export function chooseTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Blocked storage. The switch still happens; it just won't be remembered.
  }
}
