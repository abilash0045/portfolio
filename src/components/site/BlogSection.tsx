import "./blog.css";

type Article = {
  tag: string;
  title: string;
  desc: string;
  readTime: string;
};

const articles: Article[] = [
  {
    tag: "Distributed Systems",
    title: "Root-Causing MOV Atom Corruption in Shared Storage Pipelines",
    desc: "Why concurrent EFS access corrupted video headers under load and how pod-local staging raised render success from 60% to 98%.",
    readTime: "6 min read",
  },
  {
    tag: "Caching Architecture",
    title: "Segment-Level Caching for Media Pipelines: Reaching 80% Hit Rates",
    desc: "Designing sub-render cache keys for audio synthesis and lip-sync models to trim ~30% off monthly infrastructure costs.",
    readTime: "5 min read",
  },
  {
    tag: "Cloud Infrastructure",
    title: "Scale-to-Zero Worker Autoscaling with GCP Pub/Sub and Cloud Run",
    desc: "Replacing warm GKE pool overhead with event-driven queue-depth autoscaling for bursty processing workloads.",
    readTime: "4 min read",
  },
  {
    tag: "Design Patterns",
    title: "Extensible Configuration Engines Built on the Visitor Pattern",
    desc: "Adding new operations over closed AST node hierarchies without mutating core data structures, reducing approval cycles to 1 day.",
    readTime: "7 min read",
  },
];

export default function BlogSection() {
  return (
    <section className="blog-section" id="blog">
      <h2 className="section-title">Engineering Insights</h2>
      <p className="section-subtitle">
        Technical notes on distributed systems, concurrency, caching, and infrastructure
      </p>

      <div className="blog-grid">
        {articles.map((article) => (
          <div key={article.title} className="blog-card">
            <div>
              <div className="blog-tag">{article.tag}</div>
              <h3 className="blog-title">{article.title}</h3>
              <p className="blog-desc">{article.desc}</p>
            </div>
            <div className="blog-footer">
              <span>Technical Article</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
