import SectionHead from "./SectionHead";
import { TOOLBOX } from "@/content/resume";
import "./approach.css";

// Each one is something he did, not a slogan: the render bug, the move off
// always-on Kafka, CiteOS's tenancy check, and how CiteOS gets built.
const PRINCIPLES = [
  {
    title: "Reproduce It Before Theorising",
    desc: "The render failure survived a week of theories about the renderer. Run one record at a time, it never failed; run in parallel, it failed every time. That split said concurrency, and the pod logs said which file.",
  },
  {
    title: "Pay for Traffic, Not for Idle",
    desc: "Brokers running around the clock and render pods waiting between bursts were a fixed bill against bursty load. A queue that costs nothing when empty, and instances that scale to zero, made the spend follow the work.",
  },
  {
    title: "Make the Unsafe State Refuse to Start",
    desc: "CiteOS keeps tenants apart with row-level security, so the API checks every tenant table's policy at startup and will not boot if one is missing. A guarantee that can fail quietly is not a guarantee.",
  },
  {
    title: "Agents Write the Code, Tests Decide",
    desc: "I run AI agents like a small team: a clear spec, tests as the gate, and a review before anything ships. CiteOS reached production in three weeks with 4,300+ automated tests behind it.",
  },
];

export default function Approach() {
  return (
    <section className="section" id="approach" aria-labelledby="approach-title">
      <div className="container">
        <SectionHead
          index="03"
          id="approach-title"
          title="How I work"
          intro="I like problems that end up on the cloud bill or the on-call dashboard. On CiteOS I set the direction and own the decisions, and the agents write the code."
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
