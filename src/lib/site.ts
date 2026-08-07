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
