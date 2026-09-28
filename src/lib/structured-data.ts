import { EDUCATION, EMPLOYER, RECOGNITION, TOOLBOX } from "@/content/resume";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./site";

/**
 * The home page's schema.org description of the person and the site, built
 * from the same data the page shows, so it can say nothing the page doesn't.
 * The employer is named but not linked: no URL for it is on the page.
 */
export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: SITE_NAME,
      url: SITE_URL,
      email: `mailto:${EMAIL}`,
      jobTitle: EMPLOYER.title,
      worksFor: { "@type": "Organization", name: "Whilter Technologies" },
      alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.school },
      award: RECOGNITION.map((award) => `${award.name}, ${award.from}`),
      knowsAbout: TOOLBOX.flatMap((group) => group.items),
      sameAs: [GITHUB_URL, LINKEDIN_URL],
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      author: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

/** Serialised for a <script> tag. "<" is escaped so no string in it can close the tag. */
export const structuredDataScript = () => JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c");
