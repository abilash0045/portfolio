import type { Metadata } from "next";
import Dartboard from "@/components/dartboard/Dartboard";

export const metadata: Metadata = {
  title: "Dartboard: Abilash",
  description:
    "A wall map you throw a dart at. Pick a range, throw, go wherever it lands.",
};

export default function DartboardPage() {
  return (
    <>
      <noscript>
        <p style={{ padding: 24 }}>
          The dartboard needs JavaScript. The rest of the site does not.
        </p>
      </noscript>
      <Dartboard />
    </>
  );
}
