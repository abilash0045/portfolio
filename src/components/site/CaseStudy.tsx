import type { CaseStudy as Study } from "@/content/case-studies";
import PipelineSimulator from "./PipelineSimulator";
import ConfigVisitorPlayground from "./ConfigVisitorPlayground";

export default function CaseStudy({ study }: { study: Study }) {
  const isFullWidth = study.slug === "render-reliability" || study.slug === "config-playground";

  return (
    <article className={`study ${isFullWidth ? "study--full" : ""}`} id={study.slug}>
      <div className="study__header">
        <span className="study__number">FEATURED PROJECT</span>
        <h3 className="study__title">{study.title}</h3>
        <p className="study__headline">{study.headline}</p>
      </div>

      <div className="study__structured-grid">
        <div className="study__field">
          <h4 className="study__field-title">Problem</h4>
          <p className="study__field-text">{study.problem}</p>
        </div>

        <div className="study__field">
          <h4 className="study__field-title">Architecture</h4>
          <p className="study__field-text">{study.architecture}</p>
        </div>

        <div className="study__field">
          <h4 className="study__field-title">My Contribution</h4>
          <p className="study__field-text">{study.contribution}</p>
        </div>

        <div className="study__field">
          <h4 className="study__field-title">Challenges</h4>
          <p className="study__field-text">{study.challenges}</p>
        </div>

        <div className="study__field study__field--full">
          <h4 className="study__field-title">Results &amp; Impact</h4>
          <p className="study__field-text" style={{ color: "var(--accent-green)", fontWeight: 600 }}>
            {study.results}
          </p>
        </div>
      </div>

      {/* Embedded Interactive Simulators */}
      {study.slug === "render-reliability" && <PipelineSimulator />}
      {study.slug === "config-playground" && <ConfigVisitorPlayground />}

      <div className="study__footer">
        <ul className="study__stack" aria-label="Tech Stack">
          {study.stack.map((tech) => (
            <li key={tech} className="study__tech">
              {tech}
            </li>
          ))}
        </ul>

        <div className="study__links">
          {study.githubUrl && (
            <a
              href={study.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="study__link-btn"
            >
              GitHub ↗
            </a>
          )}
          {study.liveDemoUrl && (
            <a href={study.liveDemoUrl} className="study__link-btn study__link-btn--primary">
              Live Demo ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
