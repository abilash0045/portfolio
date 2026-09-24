import CopyEmail from "./CopyEmail";
import Figure from "./Figure";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_NAME, SITE_ROLE } from "@/lib/site";

const METRICS = [
  { value: "25,000+", label: "Daily video renders" },
  { value: "60% → 98%", label: "Render reliability" },
  // Two independent cuts that happen to sum, which is how DESIGN.md words it.
  // A bare "~40%" read as one win.
  { value: "~40%", label: "Cloud spend, cut twice" },
  { value: "3d → 1d", label: "Config approval cycle" },
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
          I keep a 25,000-render-a-day pipeline <em>cheap</em> and{" "}
          <em>standing&nbsp;up</em>.
        </h1>

        <div className="hero__row">
          <p className="hero__lede">
            At Whilter I work on the video rendering pipeline: Java and Spring
            Boot over Kafka, Redis and MongoDB, running on GKE and Cloud Run
            across GCP and AWS.
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
