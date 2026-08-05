"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./navbar.css";

export default function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as "dark" | "light" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    queueMicrotask(() => {
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("portfolio-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <Link href="/" className="navbar__brand">
          <span className="navbar__avatar">A</span>
          <span>Abilash S L</span>
        </Link>

        <ul className="navbar__nav">
          <li>
            <a href="#overview" className="navbar__link">Overview</a>
          </li>
          <li>
            <a href="#tech-stack" className="navbar__link">Tech Stack</a>
          </li>
          <li>
            <a href="#case-studies" className="navbar__link">Projects</a>
          </li>
          <li>
            <a href="#timeline" className="navbar__link">Timeline</a>
          </li>
          <li>
            <a href="#skills" className="navbar__link">Skills</a>
          </li>
          <li>
            <a href="#dartboard-embedded" className="navbar__link">Dartboard</a>
          </li>
          <li>
            <a href="#contact" className="navbar__link">Contact</a>
          </li>
        </ul>

        <div className="navbar__actions">
          <div className="navbar__status" title="Production Pipeline Health">
            <span className="navbar__status-dot" aria-hidden="true" />
            <span>25k/day</span>
          </div>

          <button
            type="button"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
