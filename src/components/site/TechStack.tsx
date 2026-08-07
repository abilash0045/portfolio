import "./tech-stack.css";

type TechGroup = {
  category: string;
  items: string[];
};

const groups: TechGroup[] = [
  {
    category: "Languages",
    items: ["Java", "Python", "SQL", "TypeScript"],
  },
  {
    category: "Backend",
    items: ["Spring Boot", "Spring Security", "REST APIs", "Microservices"],
  },
  {
    category: "Messaging",
    items: ["Kafka", "GCP Pub/Sub", "RabbitMQ"],
  },
  {
    category: "Databases",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
  },
  {
    category: "Cloud",
    items: ["AWS", "EKS", "S3", "ECR", "GCP Cloud Run"],
  },
  {
    category: "DevOps",
    items: ["Docker", "Kubernetes", "Git", "Maven", "Linux"],
  },
];

export default function TechStack() {
  return (
    <section className="tech-section" id="tech-stack">
      <h2 className="section-title" data-reveal>Technology Ecosystem</h2>
      <p className="section-subtitle" data-reveal>
        Core languages, frameworks, databases, and infrastructure tools used in production backend architectures
      </p>

      <div className="tech-grid">
        {groups.map((group) => (
          <div key={group.category} className="tech-card" data-reveal>
            <div className="tech-card__header">
              <h3 className="tech-card__category">{group.category}</h3>
            </div>
            <ul className="tech-card__list">
              {group.items.map((item) => (
                <li key={item} className="tech-pill">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
