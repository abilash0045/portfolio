/**
 * The resume, as data. The home page's Experience section, its toolbox and the
 * /resume page all read from here, so the three cannot drift apart.
 *
 * Every line comes from Abilash's resume. Employer claims are fixed wording:
 * check docs/DESIGN.md before changing a number. His phone number is on the
 * resume he sends out and deliberately not here; the site gives his email.
 */

/** A month as "YYYY-MM". resume.test.ts holds every date to that shape. */
export type Month = string;

export type Period = { start: Month; end?: Month };

export type RolePart = Period & {
  name: string;
  role?: string;
  lead: string;
  /** The part of `lead` set in bold. It must occur in `lead`. */
  highlight?: string;
  points: string[];
};

export const SUMMARY =
  "Backend engineer at Whilter.ai since May 2023. Lead and architect of CiteOS, an AI " +
  "search-visibility platform taken from an empty repo to production in three weeks, built " +
  "AI-first with Claude Code and one other engineer. Before that, one of the core engineers " +
  "on a Java and Spring Boot video pipeline running 25,000+ renders a day, where render " +
  "reliability went from 60% to 98% and cloud spend fell in two independent changes, ~30% " +
  "and ~10%.";

// One employer since May 2023, with two products under the same title. A
// second, earlier job used to sit on the page that never existed.
export const EMPLOYER: { title: string; org: string; start: Month } = {
  title: "Software Development Engineer",
  org: "Whilter Technologies (Whilter.ai)",
  start: "2023-05",
};

export const PARTS: RolePart[] = [
  {
    name: "CiteOS",
    role: "Lead and architect",
    start: "2026-07",
    lead:
      "CiteOS measures how a brand shows up in ChatGPT, Perplexity, Gemini, Copilot and " +
      "Google AI Overviews answers, and turns it into visibility scores, citation tracking " +
      "and prioritized fixes. I took it from an empty repo to production in three weeks " +
      "with one other engineer, building AI-first with Claude Code.",
    highlight: "production in three weeks",
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
    lead:
      "One of the core engineers on a Java, Spring Boot and Kafka rendering pipeline " +
      "producing 25,000+ personalized videos a day on GKE and Cloud Run.",
    highlight: "25,000+ personalized videos a day",
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

export type SideProject = { name: string; when: Month; note?: string; description: string };

export const SIDE_PROJECTS: SideProject[] = [
  {
    name: "Reelsmith",
    when: "2026-08",
    note: "with a colleague",
    description:
      "An AI pipeline that turns a topic into an approved YouTube Short, with one human " +
      "approval before any paid rendering. I built its Next.js studio; the pipeline runs on " +
      "Python and FastAPI, with Postgres and pgvector.",
  },
  {
    name: "small-llm",
    when: "2026-09",
    description:
      "A GPT-style model trained from scratch in PyTorch on Apple Silicon, to learn how LLMs work.",
  },
];

export const EDUCATION = {
  degree: "Bachelor of Engineering",
  school: "Sona College of Technology",
  start: "2018",
  end: "2022",
} as const;

export const RECOGNITION = [
  { name: "Red Carpet Avengers Award for Outstanding Technical Contribution", from: "Whilter" },
] as const;

// "Run in production" is the bar. RabbitMQ sat under Messaging without ever
// having been run; it only appears in CiteOS's docs as an alternative. KEDA
// did run, on GKE, before render autoscaling moved off it.
export const TOOLBOX = [
  { category: "Languages", items: ["Java", "TypeScript", "Python", "SQL"] },
  {
    category: "Backend",
    items: ["Spring Boot", "Spring Security", "NestJS", "Node.js", "REST APIs", "Microservices", "Keycloak"],
  },
  { category: "Messaging", items: ["Kafka", "GCP Pub/Sub", "pg-boss"] },
  { category: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { category: "Cloud", items: ["AWS EKS", "S3", "EFS", "ECR", "GKE", "GCP Cloud Run"] },
  { category: "DevOps", items: ["Docker", "Kubernetes", "KEDA", "Jenkins", "Git", "Maven", "Linux"] },
  { category: "AI", items: ["OpenAI API", "Anthropic API", "Gemini API", "Claude Code"] },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-05" as "May 2023". */
export function monthLabel(value: Month): string {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
