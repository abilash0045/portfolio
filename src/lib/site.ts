/**
 * One place for the canonical origin. It used to be written out twice in
 * layout.tsx, both copies pointing at portfolio-abilash.vercel.app, which is
 * not a host this site has ever been served from. The canonical link and every
 * Open Graph url on the live site were wrong for as long as that stood.
 */
export const SITE_URL = "https://portfolio-madcap1.vercel.app";

export const SITE_NAME = "Abilash S L";
export const SITE_ROLE = "Backend Engineer, distributed systems";

export const SITE_DESCRIPTION =
  "Backend engineer on a video rendering pipeline handling 25,000+ renders a day " +
  "across GKE and Cloud Run. Java, Spring Boot, Kafka, Redis, Kubernetes, GCP and AWS.";

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
    "Abilash S L, backend engineer. 25,000 renders a day, 60% to 98% render " +
    "reliability, 3 days to 1 day config approval.",
} as const;
