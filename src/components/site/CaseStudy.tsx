import type { CaseStudy as Study } from "@/content/case-studies";
import Figure from "./Figure";
import PipelineDiagram from "./PipelineDiagram";
import PipelineSimulator from "./PipelineSimulator";
import ConfigVisitorPlayground from "./ConfigVisitorPlayground";

/** The prose fields, in reading order, with the label each one gets. */
const FACTS = [
  { key: "problem", label: "Problem" },
  { key: "architecture", label: "Architecture" },
  { key: "contribution", label: "What I did" },
  { key: "challenges", label: "The hard part" },
  { key: "results", label: "Result" },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

type Props = { study: Study; number: number; total: number };

/**
 * One case study. The left column holds what a skim needs, the title, the
 * figure and the stack, and stays put on a wide screen while the right column
 * carries the reading. The two studies with something to try get it below.
 */
export default function CaseStudy({ study, number, total }: Props) {
  const titleId = `${study.slug}-title`;

  return (
    <article className="study" id={study.slug} aria-labelledby={titleId} data-reveal>
      <div className="study__aside">
        <p className="study__number">
          {pad(number)} <span className="study__of">/ {pad(total)}</span>
        </p>
        <h3 className="study__title" id={titleId}>
          {study.title}
        </h3>
        <p className="study__headline">{study.headline}</p>

        <p className="study__metric">
          <span className="study__metric-value">
            <Figure value={study.metric.value} />
          </span>
          <span className="study__metric-label">{study.metric.label}</span>
        </p>

        <ul className="study__stack" aria-label="Stack">
          {study.stack.map((tech) => (
            <li key={tech} className="study__tech">
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="study__body">
        <dl className="study__facts">
          {FACTS.map(({ key, label }) => (
            <div
              key={key}
              className={`study__fact${key === "results" ? " study__fact--result" : ""}`}
            >
              <dt>{label}</dt>
              <dd>{study[key]}</dd>
            </div>
          ))}
        </dl>

        {study.slug === "render-reliability" && <PipelineDiagram />}

        {study.inPageAnchor && (
          <a className="text-link study__jump" href={study.inPageAnchor}>
            See it below ↓
          </a>
        )}
      </div>

      {study.slug === "render-reliability" && (
        <div className="study__extra">
          <PipelineSimulator />
        </div>
      )}
      {study.slug === "config-playground" && (
        <div className="study__extra">
          <ConfigVisitorPlayground />
        </div>
      )}
    </article>
  );
}
