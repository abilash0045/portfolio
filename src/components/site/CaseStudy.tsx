import type { CaseStudy as Study } from "@/content/case-studies";

export default function CaseStudy({ study }: { study: Study }) {
  return (
    <article className="study" id={study.slug}>
      <h2 className="study__title">{study.title}</h2>
      <p className="study__headline">{study.headline}</p>
      <div className="study__body">
        {study.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <ul className="study__stack">
        {study.stack.map((tech) => (
          <li key={tech} className="study__tech">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
