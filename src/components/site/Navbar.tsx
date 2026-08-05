"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./navbar.css";

const SECTIONS = [
  { href: "#overview", label: "Overview" },
  { href: "#case-studies", label: "Selected Work" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#tech-stack", label: "Technology" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as
      | "dark"
      | "light"
      | null;
    const initial =
      saved ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    queueMicrotask(() => {
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    });
  }, []);

  const closeMenu = useCallback((returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Escape closes the menu and puts focus back on the control that opened it,
  // so a keyboard user is never stranded inside a panel they cannot leave.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  // A resize past the breakpoint leaves the panel open but invisible, which
  // would trap focus in links nobody can see.
  useEffect(() => {
    if (!menuOpen) return;
    const wide = window.matchMedia("(min-width: 769px)");
    const onChange = () => closeMenu();
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [menuOpen, closeMenu]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("portfolio-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main">
        <Link href="/" className="navbar__brand">
          <span className="navbar__avatar">A</span>
          <span>Abilash S L</span>
        </Link>

        <ul className="navbar__nav" id="primary-nav" data-open={menuOpen}>
          {SECTIONS.map((section) => (
            <li key={section.href}>
              <a
                href={section.href}
                className="navbar__link"
                onClick={() => closeMenu()}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <div className="navbar__status" title="Daily renders on the pipeline I work on">
            <span className="navbar__status-dot" aria-hidden="true" />
            <span>25k/day</span>
          </div>

          <button
            type="button"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            ref={toggleRef}
            type="button"
            className="navbar__menu-btn"
            // The accessible name stays put while aria-expanded carries the
            // state. A name that flips to "Close" makes the control harder to
            // find again and duplicates what the state already announces.
            aria-label="Main menu"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar__menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
    </header>
  );
}
