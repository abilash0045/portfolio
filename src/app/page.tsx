import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import CaseStudy from "@/components/site/CaseStudy";
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

        {/* Embedded Interactive Dartboard Map Section */}
        <section id="dartboard-section" style={{ margin: "40px 0" }}>
          <Dartboard embedded={true} />
        </section>

        <section id="case-studies" className="studies-section">
          <div className="studies-grid">
            {caseStudies.map((study) => (
              <CaseStudy key={study.slug} study={study} />
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
