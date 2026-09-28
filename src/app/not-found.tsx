import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import "@/components/site/site.css";
import "./not-found.css";

// Without its own title the tab read like the home page, and the inherited
// canonical told search engines this address was a copy of it.
export const metadata: Metadata = {
  title: "Page not found: Abilash S L",
  alternates: { canonical: null },
};

/** Every unmatched URL lands here. Next marks it noindex and answers 404. */
export default function NotFound() {
  return (
    <>
      <Navbar />

      <main id="main" className="lost container">
        <span className="section-head__index" aria-hidden="true">
          404
        </span>
        <h1 className="lost__title">
          Nothing <em>here</em>.
        </h1>
        <p className="lost__lede">
          This address doesn&apos;t match a page on this site. The link may be old, or the
          address mistyped. The work, the résumé and the dartboard are all still where they
          were.
        </p>
        <div className="lost__actions">
          <Link className="button button--primary" href="/">
            Go to the home page
          </Link>
          <Link className="text-link" href="/resume">
            Read the résumé
          </Link>
          <Link className="text-link" href="/dartboard">
            Throw a dart
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
