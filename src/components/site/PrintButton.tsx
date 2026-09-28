"use client";

/**
 * The résumé as a PDF, made by the browser from the page itself, so there is
 * no second copy to fall out of date. resume.css lays it out for paper.
 */
export default function PrintButton() {
  return (
    <button type="button" className="button button--primary" onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}
