import "./testimonials.css";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Abilash root-caused non-reproducible MOV atom file corruption that had blocked our render pipeline for over a week, taking execution reliability from 60% to 98% while trimming cloud costs.",
    name: "Engineering Lead",
    role: "Whilter Distributed Systems",
    initials: "EL",
  },
  {
    quote:
      "The Visitor pattern config engine turned our 3-day solution approval bottleneck into an instant self-service tool, allowing solution engineers to preview live parameters without engineering blocks.",
    name: "Product & Solutions Lead",
    role: "Media Platform Operations",
    initials: "PL",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <h2 className="section-title">Peer Endorsements</h2>
      <p className="section-subtitle">
        Feedback from engineering leads and product managers on production delivery and systems design
      </p>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t.name} className="testimonial-card">
            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.initials}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
