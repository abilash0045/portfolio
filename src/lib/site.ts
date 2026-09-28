/**
 * One place for the canonical origin. It used to be written out twice in
 * layout.tsx, both copies pointing at portfolio-abilash.vercel.app, which is
 * not a host this site has ever been served from. The canonical link and every
 * Open Graph url on the live site were wrong for as long as that stood.
 */
export const SITE_URL = "https://portfolio-madcap1.vercel.app";

export const SITE_NAME = "Abilash S L";
export const SITE_ROLE = "Backend Engineer, distributed systems";

/** Where people reach him. Written out once, used by the hero, the contact
    section and the footer. */
export const EMAIL = "abilash0045@gmail.com";
export const GITHUB_URL = "https://github.com/abilash0045";
export const LINKEDIN_URL = "https://www.linkedin.com/in/abilash0045/";
export const SOURCE_URL = "https://github.com/abilash0045/portfolio";

export const SITE_DESCRIPTION =
  "Backend engineer. Lead and architect of CiteOS, an AI search-visibility platform " +
  "built AI-first on TypeScript, NestJS, PostgreSQL and AWS EKS. Before that, one of " +
  "the core engineers on a Java and Spring Boot video pipeline running 25,000+ renders a day.";

/**
 * Open Graph fields every page shares. A page that sets its own openGraph
 * replaces the layout's whole object rather than merging into it, so these
 * have to travel with it.
 */
export const SHARED_OPEN_GRAPH = {
  siteName: "Abilash S L Portfolio",
  type: "website",
  locale: "en_US",
} as const;

/**
 * The dark theme's tokens from globals.css resolved to hex, for the images
 * Satori draws (the link preview card and the tab icon). Satori does not read
 * CSS variables, so a palette change has to be made here as well.
 */
export const RESOLVED_COLOURS = {
  ink: "#f1f0ed", // --color-ink
  muted: "#b9b7b3", // --color-muted
  neutral: "#94928e", // --color-neutral
  rule: "#2b2826", // --color-rule
  accent: "#f77647", // --color-accent
  paper: "#0c0b09", // --color-paper
} as const;

/**
 * The link preview card drawn by app/opengraph-image.tsx. Only the segment
 * the file sits in gets it automatically; a page that sets its own openGraph
 * loses it and has to name it again, with these.
 */
export const SITE_CARD = {
  url: "/opengraph-image",
  type: "image/png",
  width: 1200,
  height: 630,
  alt:
    "Abilash S L, backend engineer. CiteOS from an empty repo to production in three " +
    "weeks. 25,000 renders a day and 60% to 98% render reliability on the video pipeline.",
} as const;
