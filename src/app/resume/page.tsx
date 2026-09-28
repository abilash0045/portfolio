import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Highlighted from "@/components/site/Highlighted";
import PrintButton from "@/components/site/PrintButton";
import When from "@/components/site/When";
import {
  EDUCATION,
  EMPLOYER,
  PARTS,
  RECOGNITION,
  SIDE_PROJECTS,
  SUMMARY,
  TOOLBOX,
  monthLabel,
} from "@/content/resume";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  SHARED_OPEN_GRAPH,
  SITE_CARD,
  SITE_NAME,
  SITE_ROLE,
  SITE_URL,
} from "@/lib/site";
import "@/components/site/site.css";
import "./resume.css";

const TITLE = "Résumé: Abilash S L";
const DESCRIPTION =
  "Abilash S L's résumé: backend engineer at Whilter.ai, lead and architect of CiteOS, and " +
  "one of the core engineers on a Java and Spring Boot video pipeline running 25,000+ renders a day.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/resume" },
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    url: "/resume",
    images: [SITE_CARD],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SITE_CARD],
  },
};

/** The links printed as text, since a sheet of paper cannot be clicked. */
const shown = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function ResumePage() {
  return (
    <>
      <Navbar />

      <main id="main" className="resume container">
        <header className="resume__head">
          <h1 className="resume__name">{SITE_NAME}</h1>
          <p className="resume__role">{SITE_ROLE}</p>
          <ul className="resume__contact">
            <li>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <a href={LINKEDIN_URL}>{shown(LINKEDIN_URL)}</a>
            </li>
            <li>
              <a href={GITHUB_URL}>{shown(GITHUB_URL)}</a>
            </li>
            <li>
              <a href={SITE_URL}>{shown(SITE_URL)}</a>
            </li>
          </ul>
          <div className="resume__actions">
            <PrintButton />
            <Link className="text-link" href="/#work">
              Read the case studies
            </Link>
          </div>
        </header>

        <section className="resume__section" aria-labelledby="resume-summary">
          <h2 className="resume__label" id="resume-summary">
            Summary
          </h2>
          <p className="resume__body">{SUMMARY}</p>
        </section>

        <section className="resume__section" aria-labelledby="resume-experience">
          <h2 className="resume__label" id="resume-experience">
            Experience
          </h2>
          <div className="resume__body">
            <h3 className="resume__role-title">
              {EMPLOYER.title}, {EMPLOYER.org}
            </h3>
            <p className="resume__dates">
              <When start={EMPLOYER.start} />
            </p>

            {PARTS.map((part) => (
              <div className="resume__part" key={part.name}>
                <h4 className="resume__part-title">
                  {part.name}
                  {part.role && `, ${part.role.toLowerCase()}`}
                </h4>
                <p className="resume__dates">
                  <When start={part.start} end={part.end} />
                </p>
                <p className="resume__lead">
                  <Highlighted text={part.lead} highlight={part.highlight} />
                </p>
                <ul className="resume__points">
                  {part.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="resume__section" aria-labelledby="resume-skills">
          <h2 className="resume__label" id="resume-skills">
            Skills
          </h2>
          <dl className="resume__body resume__skills">
            {TOOLBOX.map((group) => (
              <div className="resume__skill" key={group.category}>
                <dt>{group.category}</dt>
                <dd>{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="resume__section" aria-labelledby="resume-projects">
          <h2 className="resume__label" id="resume-projects">
            Projects
          </h2>
          <ul className="resume__body resume__plain-list">
            {SIDE_PROJECTS.map((project) => (
              <li key={project.name}>
                <strong>{project.name}</strong>
                {project.note && `, ${project.note}`}, {monthLabel(project.when)}.{" "}
                {project.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="resume__section" aria-labelledby="resume-education">
          <h2 className="resume__label" id="resume-education">
            Education
          </h2>
          <p className="resume__body">
            {EDUCATION.degree}, {EDUCATION.school}, {EDUCATION.start} to {EDUCATION.end}.
          </p>
        </section>

        <section className="resume__section" aria-labelledby="resume-recognition">
          <h2 className="resume__label" id="resume-recognition">
            Recognition
          </h2>
          <p className="resume__body">
            {RECOGNITION.map((award) => `${award.name}, ${award.from}.`).join(" ")}
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
