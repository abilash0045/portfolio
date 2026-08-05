import type { CaseStudy as Study } from "@/content/case-studies";
import PipelineSimulator from "./PipelineSimulator";
import ConfigVisitorPlayground from "./ConfigVisitorPlayground";

export default function CaseStudy({ study }: { study: Study }) {
  return (
    <article className="study" id={study.slug}>
      <div className="study__header">
        <span className="study__number">CASE STUDY</span>
        <h2 className="study__title">{study.title}</h2>
        <p className="study__headline">{study.headline}</p>
      </div>

      <div className="study__body">
        {study.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      {/* Embed Interactive Widgets for Relevant Studies */}
      {study.slug === "render-reliability" && <PipelineSimulator />}
      {study.slug === "config-playground" && <ConfigVisitorPlayground />}

      <ul className="study__stack" aria-label="Tech Stack">
        {study.stack.map((tech) => (
          <li key={tech} className="study__tech">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
