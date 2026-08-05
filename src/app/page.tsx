import Hero from "@/components/site/Hero";
import CaseStudy from "@/components/site/CaseStudy";
import Footer from "@/components/site/Footer";
import { caseStudies } from "@/content/case-studies";
import "@/components/site/site.css";

export default function Home() {
  return (
    <div className="site">
      <Hero />
      {caseStudies.map((study) => (
        <CaseStudy key={study.slug} study={study} />
      ))}
      <Footer />
    </div>
  );
}
