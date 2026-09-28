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
          {/* The id sits on the item rather than the article, because the
              article slides 14px as it appears and a link straight to it was
              scrolled into place mid-slide, then left 14px high. */}
          {caseStudies.map((study, index) => (
            <li key={study.slug} id={study.slug}>
              <CaseStudy study={study} number={index + 1} total={caseStudies.length} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
