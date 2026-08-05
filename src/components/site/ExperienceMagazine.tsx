import "./magazine.css";

export default function ExperienceMagazine() {
  return (
    <section className="magazine-section" id="experience">
      <h2 className="section-title">Production Engineering Experience</h2>
      <p className="section-subtitle">
        Magazine-style breakdown of systems architecture milestones and measurable business impact
      </p>

      <div className="magazine-grid">
        <article className="magazine-card magazine-card--featured">
          <div>
            <div className="magazine-meta">
              <span className="magazine-company">Whilter · Video Platform</span>
              <span className="magazine-period">2023 - Present</span>
            </div>
            <h3 className="magazine-title">Senior Backend &amp; Systems Engineer</h3>
            <p className="magazine-lead">
              Operating core video rendering microservices processing <strong>25,000+ daily renders</strong> across GKE and GCP Cloud Run.
            </p>
            <ul className="magazine-highlights">
              <li>Root-caused non-reproducible MOV atom file corruption on concurrent EFS mounts, shifting processing to pod-local ephemeral disk to raise reliability from 60% to 98%.</li>
              <li>Engineered segment-level Redis caching reaching an 80% hit rate, trimming monthly cloud spend by ~30%.</li>
              <li>Migrated warm pool GKE workers to Cloud Run with Pub/Sub queue-depth triggers, enabling scale-to-zero for an additional ~10% spend reduction.</li>
              <li>Created an extensible Visitor pattern config engine, cutting client solution approval cycles from 3 days to 1 day.</li>
            </ul>
          </div>
        </article>

        <article className="magazine-card">
          <div>
            <div className="magazine-meta">
              <span className="magazine-company">Distributed Systems</span>
              <span className="magazine-period">2021 - 2023</span>
            </div>
            <h3 className="magazine-title">Software Development Engineer</h3>
            <p className="magazine-lead">
              Designing high-performance Java REST APIs, notification queues, and automated bot integrations.
            </p>
            <ul className="magazine-highlights">
              <li>Built resilient Spring Boot microservices with MySQL transactional integrity and Redis rate limiters.</li>
              <li>Integrated WhatsApp automation workflows handling burst traffic with under 1.2s delivery latency.</li>
              <li>Configured Docker container builds and Kubernetes EKS deployment manifests for zero-downtime rolling updates.</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
