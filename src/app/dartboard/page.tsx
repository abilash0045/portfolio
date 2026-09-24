import type { Metadata } from "next";
import Dartboard from "@/components/dartboard/Dartboard";
import { SHARED_OPEN_GRAPH, SITE_CARD } from "@/lib/site";

const TITLE = "Dartboard: Abilash";
const DESCRIPTION =
  "A wall map you throw a dart at. Pick a range, throw, go wherever it lands.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Left to inherit from the layout, these all described the home page. A
  // canonical of "/" tells a search engine this page is a copy of that one to
  // be dropped, and og:url sent every shared link's preview there as well.
  alternates: {
    canonical: "/dartboard",
  },
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    url: "/dartboard",
    images: [SITE_CARD],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SITE_CARD],
  },
};

// <main> so the page has a landmark to hold its content. Without one, a
// screen reader's landmark list offered nothing but the header pills.
export default function DartboardPage() {
  return (
    <main>
      <noscript>
        <p style={{ padding: 24 }}>
          The dartboard needs JavaScript. The rest of the site does not.
        </p>
      </noscript>
      <Dartboard />
    </main>
  );
}
