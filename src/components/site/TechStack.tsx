import "./tech-stack.css";

type TechGroup = {
  category: string;
  icon: string;
  items: string[];
};

const groups: TechGroup[] = [
  {
    category: "Languages",
    icon: "💻",
    items: ["Java", "Python", "SQL", "TypeScript"],
  },
  {
    category: "Backend",
    icon: "⚙️",
    items: ["Spring Boot", "Spring Security", "REST APIs", "Microservices"],
  },
  {
    category: "Messaging",
    icon: "📡",
    items: ["Kafka", "GCP Pub/Sub", "RabbitMQ"],
  },
  {
    category: "Databases",
    icon: "🗄️",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
  },
  {
    category: "Cloud",
    icon: "☁️",
    items: ["AWS", "EKS", "S3", "ECR", "GCP Cloud Run"],
  },
  {
    category: "DevOps",
    icon: "🛠️",
    items: ["Docker", "Kubernetes", "Git", "Maven", "Linux"],
  },
];

export default function TechStack() {
  return (
    <section className="tech-section" id="tech-stack">
      <h2 className="section-title">Categorized Tech Stack</h2>
      <p className="section-subtitle">
        Core technologies and infrastructure tools used in high-throughput backend services
      </p>

      <div className="tech-grid">
        {groups.map((group) => (
          <div key={group.category} className="tech-card">
            <div className="tech-card__header">
              <span className="tech-card__icon" aria-hidden="true">{group.icon}</span>
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
