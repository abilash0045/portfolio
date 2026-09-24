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
    org: "Whilter · Video Platform",
    start: "2023",
    lead: (
      <>
        Operating core video rendering microservices processing{" "}
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
  {
    title: "Software Development Engineer",
    org: "Distributed Systems",
    start: "2021",
    end: "2023",
    lead: "Designing high-performance Java REST APIs, notification queues, and automated bot integrations.",
    points: [
      "Built resilient Spring Boot microservices with MySQL transactional integrity and Redis rate limiters.",
      "Integrated WhatsApp automation workflows handling burst traffic with under 1.2s delivery latency.",
      "Configured Docker container builds and Kubernetes EKS deployment manifests for zero-downtime rolling updates.",
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
