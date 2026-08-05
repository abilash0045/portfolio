import "./skills.css";

type Skill = {
  name: string;
  percentage: number;
};

const skills: Skill[] = [
  { name: "Backend Development (Java / Spring Boot)", percentage: 95 },
  { name: "System Design & Architecture", percentage: 92 },
  { name: "Distributed Systems & Event-Driven (Kafka)", percentage: 90 },
  { name: "Cloud Infrastructure (AWS / GCP)", percentage: 88 },
  { name: "Databases & Caching (Redis / Mongo / SQL)", percentage: 88 },
  { name: "DevOps & Containers (Docker / K8s)", percentage: 85 },
];

export default function SkillsVisualization() {
  return (
    <section className="skills-section" id="skills">
      <h2 className="section-title">Skills Capability Breakdown</h2>
      <p className="section-subtitle">
        Core competency levels across backend development and infrastructure engineering
      </p>

      <div className="skills-grid">
        {skills.map((skill) => (
          <div key={skill.name} className="skill-card">
            <div className="skill-header">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-pct">{skill.percentage}%</span>
            </div>
            <div className="skill-track">
              <div className="skill-fill" style={{ width: `${skill.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
