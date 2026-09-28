import CopyEmail from "./CopyEmail";
import Figure from "./Figure";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_NAME, SITE_ROLE } from "@/lib/site";

// CiteOS first, because it is the current work (DESIGN.md content item 0).
// The ~40% cost story left the hero rather than shrink to a bare number;
// the case study below tells it as the two cuts it was.
const METRICS = [
  { value: "3 weeks", label: "CiteOS, empty repo to production" },
  { value: "~68%", label: "CiteOS LLM spend per domain, cut" },
  { value: "25,000+", label: "Daily video renders" },
  { value: "60% → 98%", label: "Render reliability" },
];

export default function Hero() {
  return (
    <section className="hero" id="overview" aria-labelledby="hero-title">
      <div className="container">
        <p className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          {SITE_NAME}
          <span aria-hidden="true">/</span>
          {SITE_ROLE}
        </p>

        <h1 className="hero__title" id="hero-title">
          Empty repo in July. In production <em>three&nbsp;weeks</em> later.
        </h1>

        <div className="hero__row">
          <p className="hero__lede">
            That&apos;s CiteOS, the AI search-visibility platform I lead at
            Whilter: TypeScript, NestJS and PostgreSQL on AWS EKS, built
            AI-first with Claude Code and one other engineer. Before it, I was
            one of the core engineers on a Java and Spring Boot video pipeline
            running 25,000+ renders a day.
          </p>

          <div className="hero__actions">
            <div className="hero__cta">
              <a className="button button--primary" href="#work">
                See the work
              </a>
              <CopyEmail className="button button--secondary copy-email" addressIs="below" />
            </div>

            <div className="hero__socials">
              <a
                className="hero__social-link"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                className="hero__social-link"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn ↗
              </a>
              <a className="hero__social-link" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </div>
          </div>
        </div>

        <dl className="hero__metrics">
          {METRICS.map((metric) => (
            <div className="hero__metric" key={metric.label}>
              <dt className="hero__metric-label">{metric.label}</dt>
              <dd className="hero__metric-value">
                <Figure value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
