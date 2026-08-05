import "./timeline.css";

type Role = {
  title: string;
  company: string;
  period: string;
  bullets: string[];
};

const roles: Role[] = [
  {
    title: "Senior Backend Engineer",
    company: "Whilter · Video Processing Platform",
    period: "2023 - Present",
    bullets: [
      "Architected and operated core video rendering pipeline processing 25,000+ daily renders across GKE and Cloud Run.",
      "Root-caused un-reproducible MOV atom file corruption on concurrent EFS reads/writes, shifting execution to pod-local ephemeral storage to raise reliability from 60% to 98%.",
      "Implemented segment-level Redis caching reaching an 80% hit rate, trimming monthly cloud spend by ~30%.",
      "Migrated queue-worker workloads from fixed GKE nodes to Cloud Run with Pub/Sub queue-depth autoscaling, achieving scale-to-zero and cutting spend by a further ~10%.",
      "Engineered an extensible Visitor pattern config engine and playground UI, reducing solution approval cycles from 3 days to 1 day.",
    ],
  },
  {
    title: "Software Development Engineer",
    company: "Distributed Systems & Automation",
    period: "2021 - 2023",
    bullets: [
      "Built resilient RESTful microservices using Spring Boot, PostgreSQL, and Redis for high-concurrency workflows.",
      "Integrated Kafka message brokers for async event handling, decoupled notification systems, and reliable task queues.",
      "Optimized Docker container builds and Kubernetes EKS deployment pipelines for zero-downtime rolling updates.",
    ],
  },
];

export default function ExperienceTimeline() {
  return (
    <section className="timeline-section" id="timeline">
      <h2 className="section-title">Experience & Timeline</h2>
      <p className="section-subtitle">
        Engineering career highlights and distributed systems production impacts
      </p>

      <div className="timeline">
        {roles.map((role) => (
          <div key={role.company} className="timeline-item">
            <div className="timeline-dot" aria-hidden="true" />
            <div className="timeline-card">
              <h3 className="timeline-role">{role.title}</h3>
              <div className="timeline-company">{role.company} ({role.period})</div>
              <ul className="timeline-bullets">
                {role.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 30)}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
