import "./philosophy.css";

type Principle = {
  num: string;
  title: string;
  desc: string;
};

const principles: Principle[] = [
  {
    num: "01",
    title: "Fault Isolation over Silent Retries",
    desc: "Swallowed exceptions and papered-over retries increase cloud spend and mask bugs. Systems must isolate failure layers directly to reveal root causes.",
  },
  {
    num: "02",
    title: "Pod-Local Ephemeral Work execution",
    desc: "Concurrent media rendering should never mutate shared network storage mid-flight. Stage work on pod-local disk, complete execution, then publish output.",
  },
  {
    num: "03",
    title: "Sub-Entity Caching Boundaries",
    desc: "Cache granular sub-segments (audio synthesis, lip sync vectors) rather than full monolithic outputs to achieve 80%+ cache hit rates across dynamic requests.",
  },
  {
    num: "04",
    title: "Extensible Zero-Downtime APIs",
    desc: "Architect closed data structures with visitor operations so new functionality can be introduced without mutating existing node types or breaking contracts.",
  },
];

export default function EngineeringPhilosophy() {
  return (
    <section className="philosophy-section" id="philosophy">
      <h2 className="section-title" data-reveal>Engineering Philosophy</h2>
      <p className="section-subtitle" data-reveal>
        What I reach for when a system has to stay up, and what I&apos;ve learned costs more than it saves.
      </p>

      <div className="philosophy-grid">
        {principles.map((p) => (
          <div key={p.num} className="philosophy-card" data-reveal>
            <div className="philosophy-number">{p.num}</div>
            <h3 className="philosophy-title">{p.title}</h3>
            <p className="philosophy-desc">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
