import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import CaseStudy from "@/components/site/CaseStudy";
import EngineeringPhilosophy from "@/components/site/EngineeringPhilosophy";
import TechStack from "@/components/site/TechStack";
import ExperienceMagazine from "@/components/site/ExperienceMagazine";
import Testimonials from "@/components/site/Testimonials";
import ContactSection from "@/components/site/ContactSection";
import Footer from "@/components/site/Footer";
import Dartboard from "@/components/dartboard/Dartboard";
import { caseStudies } from "@/content/case-studies";
import "@/components/site/site.css";

export default function Home() {
  return (
    <>
      {/* Ambient background mesh */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-bg__glow ambient-bg__glow--1" />
        <div className="ambient-bg__glow ambient-bg__glow--2" />
        <div className="ambient-bg__glow ambient-bg__glow--3" />
        <div className="ambient-bg__grid" />
      </div>

      <Navbar />

      <main className="site">
        <Hero />

        <section id="case-studies" className="studies-section">
          <h2 className="section-title">Selected Work</h2>
          <p className="section-subtitle">
            Structured bento-grid analysis of production distributed systems, media processing microservices, and performance wins
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

        <Testimonials />

        {/* Embedded Interactive Dartboard Map Section */}
        <section id="dartboard-embedded-section" style={{ margin: "72px 0" }}>
          <h2 className="section-title">Interactive Map &amp; Geocoding Sandbox</h2>
          <p className="section-subtitle">
            Uniform area dart sampling map backed by Nominatim and Overpass API query fallbacks
          </p>
          <Dartboard embedded={true} />
        </section>

        <ContactSection />

        <Footer />
      </main>
    </>
  );
}
