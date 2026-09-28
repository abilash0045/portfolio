import type { ReactNode } from "react";
import SectionHead from "./SectionHead";
import "./experience.css";

type Period = { start: string; end?: string };

type Part = Period & {
  name: string;
  role?: string;
  lead: ReactNode;
  points: string[];
};

// One employer since May 2023, with two products under the same title, as on
// the resume. A second, earlier job used to sit here that never existed.
// Employer claims are worded as on the resume: check docs/DESIGN.md before
// changing a number.
const EMPLOYER = {
  title: "Software Development Engineer",
  org: "Whilter Technologies (Whilter.ai)",
  start: "2023-05",
};

const PARTS: Part[] = [
  {
    name: "CiteOS",
    role: "Lead and architect",
    start: "2026-07",
    lead: (
      <>
        CiteOS measures how a brand shows up in ChatGPT, Perplexity, Gemini,
        Copilot and Google AI Overviews answers, and turns it into visibility
        scores, citation tracking and prioritized fixes. I took it from an
        empty repo to <strong>production in three weeks</strong> with one other
        engineer, building AI-first with Claude Code.
      </>
    ),
    points: [
      "Chose TypeScript and NestJS over the mandated Java/Spring stack in a written decision record, for a product that spends most of its time waiting on LLM vendor APIs.",
      "Led the design of the multi-tenant core: PostgreSQL row-level security behind a startup check that refuses to boot the API if any tenant table loses its policy, and Keycloak OIDC with membership checked on every request.",
      "Cut per-domain LLM vendor spend ~68% by retuning scan cadence, quotas and queue tiers, then turned the cost model into code the test suite asserts against.",
      "Moved it from a single VM to AWS EKS behind a push-to-deploy pipeline: digest-pinned images, a database snapshot before every apply, quota changes left to a human. 4,300+ automated tests.",
    ],
  },
  {
    name: "Personalized video platform",
    start: "2023-05",
    end: "2026-07",
    lead: (
      <>
        One of the core engineers on a Java, Spring Boot and Kafka rendering
        pipeline producing <strong>25,000+ personalized videos a day</strong> on
        GKE and Cloud Run.
      </>
    ),
    // The EFS move comes before the failure it later exposed, as it happened.
    points: [
      "Decoupled producers from consumers over Kafka to keep render waits out of the request path.",
      "Moved media storage from S3 to AWS EFS to take the per-render S3 round trip off the critical path.",
      "Lifted render success from 60% to 98% by tracing a failure that had survived a week of team-wide debugging to MOV-atom corruption from concurrent EFS reads and writes, then staging media on pod-local disk before render.",
      "Cut monthly cloud spend ~40% in two independent changes: a segment-level Redis cache that dedupes TTS, voice-clone and lip-sync segments across users (~80% hit rate, ~30% saved), and moving render autoscaling off KEDA on GKE to a Pub/Sub queue-depth Cloud Run autoscaler that scales to zero (~10%).",
      "Built the config playground microservice, a Visitor pattern over TTS, voice-clone and lip-sync requests, so solution engineers test client configs in isolation. Config approval went from 3 days to 1.",
      "Integrated Botpress (WhatsApp) with backend APIs to automate routine support queries.",
    ],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-05" reads as "May 2023", in a <time> a machine can read too. */
function Month({ value }: { value: string }) {
  const [year, month] = value.split("-");
  return <time dateTime={value}>{`${MONTHS[Number(month) - 1]} ${year}`}</time>;
}

function When({ start, end }: Period) {
  return (
    <>
      <Month value={start} /> to {end ? <Month value={end} /> : "now"}
    </>
  );
}

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
                  <p className="timeline__lead">{part.lead}</p>
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
                <li>
                  <strong>Reelsmith</strong>, with a colleague, August 2026. An
                  AI pipeline that turns a topic into an approved YouTube
                  Short, with one human approval before any paid rendering. I
                  built its Next.js studio; the pipeline runs on Python and
                  FastAPI, with Postgres and pgvector.
                </li>
                <li>
                  <strong>small-llm</strong>, September 2026. A GPT-style
                  model trained from scratch in PyTorch on Apple Silicon, to
                  learn how LLMs work.
                </li>
              </ul>
            </dd>
          </div>
          <div className="resume-extra__row" data-reveal>
            <dt className="resume-extra__label">Education</dt>
            <dd className="resume-extra__body">
              Bachelor of Engineering, Sona College of Technology, 2018 to 2022.
            </dd>
          </div>
          <div className="resume-extra__row" data-reveal>
            <dt className="resume-extra__label">Recognition</dt>
            <dd className="resume-extra__body">
              Red Carpet Avengers Award for Outstanding Technical Contribution,
              Whilter.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
