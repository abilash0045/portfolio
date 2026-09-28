import SectionHead from "./SectionHead";
import Highlighted from "./Highlighted";
import When from "./When";
import {
  EDUCATION,
  EMPLOYER,
  PARTS,
  RECOGNITION,
  SIDE_PROJECTS,
  monthLabel,
} from "@/content/resume";
import "./experience.css";

export default function Experience() {
  return (
    <section
      className="section"
      id="experience"
      aria-labelledby="experience-title"
      data-lazy-layout
    >
      <div className="container">
        <SectionHead
          index="02"
          id="experience-title"
          title="Experience"
          intro="The same work in longer form, most recent first."
        />

        <ol className="timeline">
          <li className="timeline__item" data-reveal>
            <div className="timeline__head">
              <h3 className="timeline__title">{EMPLOYER.title}</h3>
              <p className="timeline__org">{EMPLOYER.org}</p>
              <p className="timeline__period">
                <When start={EMPLOYER.start} />
              </p>
            </div>

            <div className="timeline__body">
              {PARTS.map((part) => (
                <div className="timeline__part" key={part.name}>
                  <h4 className="timeline__part-name">
                    {part.name}
                    {part.role && <span className="timeline__part-role">{part.role}</span>}
                  </h4>
                  <p className="timeline__period">
                    <When start={part.start} end={part.end} />
                  </p>
                  <p className="timeline__lead">
                    <Highlighted text={part.lead} highlight={part.highlight} />
                  </p>
                  <ul className="timeline__points">
                    {part.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        </ol>

        <dl className="resume-extra">
          <div className="resume-extra__row" data-reveal>
            <dt className="resume-extra__label">Side projects</dt>
            <dd className="resume-extra__body">
              <ul className="resume-extra__list">
                {SIDE_PROJECTS.map((project) => (
                  <li key={project.name}>
                    <strong>{project.name}</strong>
                    {project.note && `, ${project.note}`}, {monthLabel(project.when)}.{" "}
                    {project.description}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="resume-extra__row" data-reveal>
            <dt className="resume-extra__label">Education</dt>
            <dd className="resume-extra__body">
              {EDUCATION.degree}, {EDUCATION.school}, {EDUCATION.start} to {EDUCATION.end}.
            </dd>
          </div>
          <div className="resume-extra__row" data-reveal>
            <dt className="resume-extra__label">Recognition</dt>
            <dd className="resume-extra__body">
              {RECOGNITION.map((award) => `${award.name}, ${award.from}.`).join(" ")}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
