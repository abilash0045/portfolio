import type { Metadata } from "next";
import Dartboard from "@/components/dartboard/Dartboard";

export const metadata: Metadata = {
  title: "Dartboard: Abilash",
  description:
    "A wall map you throw a dart at. Pick a range, throw, go wherever it lands.",
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
