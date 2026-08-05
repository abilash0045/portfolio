import "./wins.css";

type Win = {
  icon: string;
  title: string;
  desc: string;
  metric: string;
};

const wins: Win[] = [
  {
    icon: "📡",
    title: "Kafka Event-Driven Microservices",
    desc: "Architected asynchronous processing pipelines handling 25,000+ daily AI video renders across GKE and Cloud Run.",
    metric: "25,000+ Renders/Day",
  },
  {
    icon: "☸️",
    title: "Kubernetes Auto Scaling with KEDA",
    desc: "Scaled queue-worker clusters dynamically based on Kafka consumer lag and Pub/Sub queue depth triggers.",
    metric: "Scale-to-Zero Efficiency",
  },
  {
    icon: "🎯",
    title: "Render Reliability Boost (60% ➔ 98%)",
    desc: "Root-caused non-reproducible MOV atom file header corruption and moved execution to pod-local ephemeral storage.",
    metric: "60% ➔ 98% Reliability",
  },
  {
    icon: "💬",
    title: "WhatsApp Automation Platform",
    desc: "Integrated Spring Boot microservices with Botpress engines and REST APIs for automated customer notification workflows.",
    metric: "< 1.2s Delivery Latency",
  },
  {
    icon: "⚡",
    title: "Segment Caching & Spend Savings (~40%)",
    desc: "Designed segment-level Redis caching reaching an 80% hit rate and paired with Cloud Run to trim ~40% monthly cloud spend.",
    metric: "~40% Monthly Spend Cut",
  },
];

export default function EngineeringWins() {
  return (
    <section className="wins-section" id="engineering-wins">
      <h2 className="section-title">Engineering Wins &amp; Production Impact</h2>
      <p className="section-subtitle">
        Key technical achievements in high-scale backend systems, distributed architecture, and reliability engineering
      </p>

      <div className="wins-grid">
        {wins.map((win) => (
          <div key={win.title} className="win-card">
            <div>
              <div className="win-icon" aria-hidden="true">{win.icon}</div>
              <h3 className="win-title">{win.title}</h3>
              <p className="win-desc">{win.desc}</p>
            </div>
            <div>
              <span className="win-metric">{win.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
