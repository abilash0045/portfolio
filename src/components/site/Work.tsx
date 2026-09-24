import CaseStudy from "./CaseStudy";
import SectionHead from "./SectionHead";
import { caseStudies } from "@/content/case-studies";
import "./work.css";

export default function Work() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <SectionHead
          index="01"
          id="work-title"
          title="Selected work"
          intro="Things I built or fixed, with what broke, what I changed, and what it moved."
        />

        <ol className="work-list">
          {caseStudies.map((study, index) => (
            <li key={study.slug}>
              <CaseStudy study={study} number={index + 1} total={caseStudies.length} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
