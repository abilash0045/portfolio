import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import Work from "@/components/site/Work";
import Experience from "@/components/site/Experience";
import Approach from "@/components/site/Approach";
import SectionHead from "@/components/site/SectionHead";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import Dartboard from "@/components/dartboard/Dartboard";
import ScrollReveal from "@/components/site/ScrollReveal";
import "@/components/site/site.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      <main id="main">
        <Hero />
        <Work />
        <Experience />
        <Approach />

        <section
          className="section"
          id="dartboard-embedded-section"
          aria-labelledby="dartboard-title"
        >
          <div className="container">
            <SectionHead
              index="04"
              id="dartboard-title"
              title="Throw a dart at the map"
              intro="I am bad at deciding where to go on a free weekend, so I let a dart decide. Pick how far you are willing to travel, throw, and go wherever it lands. If it lands in the sea, it says so."
            />
            <Dartboard embedded />
          </div>
        </section>

        <Contact />
      </main>

      {/* Outside main, so it is the page's contentinfo landmark. */}
      <Footer />
    </>
  );
}
