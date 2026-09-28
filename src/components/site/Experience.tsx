import type { ReactNode } from "react";
import SectionHead from "./SectionHead";
import "./experience.css";

type Role = {
  title: string;
  org: string;
  start: string;
  /** Omitted while the role is current. */
  end?: string;
  lead: ReactNode;
  points: string[];
};

// Employer claims, worded as on the resume. Check docs/DESIGN.md before
// changing a number.
const ROLES: Role[] = [
  {
    title: "Software Development Engineer",
    org: "Whilter · CiteOS, lead and architect",
    start: "2026",
    lead: (
      <>
        Lead and architect of CiteOS, an AI search-visibility platform taken
        from an empty repo to <strong>production in three weeks</strong>, built
        AI-first with Claude Code and one other engineer.
      </>
    ),
    points: [
      "Chose TypeScript and NestJS over the mandated Java/Spring stack in a written decision record, for a product that spends most of its time waiting on LLM vendor APIs.",
      "Directed the design of the multi-tenant core: PostgreSQL row-level security behind a startup check that refuses to boot the API if any tenant table loses its policy.",
      "Cut per-domain LLM vendor spend ~68% by retuning scan cadence, quotas and queue tiers, with the cost model kept in code and asserted by tests.",
      "Moved it from a single VM to AWS EKS behind a push-to-deploy pipeline that pins image digests and snapshots the database before every apply.",
    ],
  },
  {
    title: "Software Development Engineer",
    org: "Whilter · Video Platform",
    start: "2023",
    end: "2026",
    lead: (
      <>
        One of the core engineers on video rendering microservices processing{" "}
        <strong>25,000+ daily renders</strong> across GKE and GCP Cloud Run.
      </>
    ),
    points: [
      "Root-caused non-reproducible MOV atom file corruption on concurrent EFS mounts, shifting processing to pod-local ephemeral disk to raise reliability from 60% to 98%.",
      "Engineered segment-level Redis caching reaching an 80% hit rate, trimming monthly cloud spend by ~30%.",
      "Migrated warm pool GKE workers to Cloud Run with Pub/Sub queue-depth triggers, enabling scale-to-zero for an additional ~10% spend reduction.",
      "Created an extensible Visitor pattern config engine, cutting client solution approval cycles from 3 days to 1 day.",
    ],
  },
];

export default function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHead
          index="02"
          id="experience-title"
          title="Experience"
          intro="The same work in longer form, most recent first."
        />

        <ol className="timeline">
          {ROLES.map((role) => (
            <li className="timeline__item" key={role.start} data-reveal>
              <div className="timeline__head">
                <h3 className="timeline__title">{role.title}</h3>
                <p className="timeline__org">{role.org}</p>
                <p className="timeline__period">
                  <time dateTime={role.start}>{role.start}</time> to{" "}
                  {role.end ? <time dateTime={role.end}>{role.end}</time> : "now"}
                </p>
              </div>

              <div className="timeline__body">
                <p className="timeline__lead">{role.lead}</p>
                <ul className="timeline__points">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
