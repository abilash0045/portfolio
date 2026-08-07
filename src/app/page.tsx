import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import CaseStudy from "@/components/site/CaseStudy";
import EngineeringPhilosophy from "@/components/site/EngineeringPhilosophy";
import TechStack from "@/components/site/TechStack";
import ExperienceMagazine from "@/components/site/ExperienceMagazine";
import ContactSection from "@/components/site/ContactSection";
import Footer from "@/components/site/Footer";
import Dartboard from "@/components/dartboard/Dartboard";
import ScrollReveal from "@/components/site/ScrollReveal";
import { caseStudies } from "@/content/case-studies";
import "@/components/site/site.css";

export default function Home() {
  return (
    <>
      {/* Ambient background mesh */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-bg__grid" />
      </div>

      <Navbar />
      <ScrollReveal />

      <main className="site">
        <Hero />

        <section id="case-studies" className="studies-section">
          <h2 className="section-title" data-reveal>Selected Work</h2>
          <p className="section-subtitle" data-reveal>
            Things I built or fixed at work, with what broke, what I changed, and what it moved.
          </p>
          <div className="studies-grid">
            {caseStudies.map((study) => (
              <CaseStudy key={study.slug} study={study} />
            ))}
          </div>
        </section>

        <EngineeringPhilosophy />

        <TechStack />

        <ExperienceMagazine />

        {/* Embedded Interactive Dartboard Map Section */}
        <section id="dartboard-embedded-section" style={{ margin: "72px 0" }}>
          <h2 className="section-title" data-reveal>Throw a dart at the map</h2>
          <p className="section-subtitle" data-reveal>
            I am bad at deciding where to go on a free weekend, so I let a dart
            decide. Pick how far you are willing to travel, throw, and go
            wherever it lands. If it lands in the sea, it says so.
          </p>
          <Dartboard embedded={true} />
        </section>

        <ContactSection />

        <Footer />
      </main>
    </>
  );
}
