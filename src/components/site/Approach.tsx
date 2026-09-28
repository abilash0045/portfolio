import SectionHead from "./SectionHead";
import "./approach.css";

const PRINCIPLES = [
  {
    title: "Fault Isolation over Silent Retries",
    desc: "Swallowed exceptions and papered-over retries increase cloud spend and mask bugs. Systems must isolate failure layers directly to reveal root causes.",
  },
  {
    title: "Pod-Local Ephemeral Work Execution",
    desc: "Concurrent media rendering should never mutate shared network storage mid-flight. Stage work on pod-local disk, complete execution, then publish output.",
  },
  {
    title: "Sub-Entity Caching Boundaries",
    desc: "Cache granular sub-segments (audio synthesis, lip sync vectors) rather than full monolithic outputs to reach cache hit rates around 80% across dynamic requests.",
  },
  {
    title: "Extensible Without Breaking Contracts",
    desc: "Architect closed data structures with visitor operations so new functionality can be introduced without mutating existing node types or breaking contracts.",
  },
];

// "Run in production" is the bar. RabbitMQ sat under Messaging without ever
// having been run; it only appears in CiteOS's docs as an alternative.
const TOOLBOX = [
  { category: "Languages", items: ["Java", "TypeScript", "Python", "SQL"] },
  { category: "Backend", items: ["Spring Boot", "Spring Security", "NestJS", "REST APIs", "Microservices"] },
  { category: "Messaging", items: ["Kafka", "GCP Pub/Sub", "pg-boss"] },
  { category: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { category: "Cloud", items: ["AWS", "EKS", "S3", "ECR", "GCP Cloud Run"] },
  { category: "DevOps", items: ["Docker", "Kubernetes", "Jenkins", "Git", "Maven", "Linux"] },
  { category: "AI", items: ["OpenAI API", "Anthropic API", "Gemini API", "Claude Code"] },
];

export default function Approach() {
  return (
    <section className="section" id="approach" aria-labelledby="approach-title">
      <div className="container">
        <SectionHead
          index="03"
          id="approach-title"
          title="How I work"
          intro="Most of what I do lands on either the cloud bill or the on-call dashboard. How media gets cached, how render jobs get queued and scaled, and what breaks when shared storage, concurrency and bursty traffic all arrive at once."
        />

        <ol className="principles">
          {PRINCIPLES.map((principle, index) => (
            <li className="principle" key={principle.title} data-reveal>
              <span className="principle__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="principle__title">{principle.title}</h3>
              <p className="principle__desc">{principle.desc}</p>
            </li>
          ))}
        </ol>

        <div className="toolbox">
          <div className="toolbox__head">
            <h3 className="toolbox__title">Toolbox</h3>
            <p className="toolbox__intro">
              Things I&apos;ve run in production, not things I&apos;ve read about.
            </p>
          </div>

          <dl className="toolbox__list">
            {TOOLBOX.map((group) => (
              <div className="toolbox__row" key={group.category} data-reveal>
                <dt className="toolbox__category">{group.category}</dt>
                <dd className="toolbox__items">
                  <ul>
                    {group.items.map((item) => (
                      <li className="toolbox__item" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
