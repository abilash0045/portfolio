export type CaseStudy = {
  slug: string;
  title: string;
  headline: string;
  /** The one figure the card leads with. Every number in it is one the study's
      own text already states; case-studies.test.ts holds it to that. */
  metric: { value: string; label: string };
  stack: string[];
  problem: string;
  architecture: string;
  contribution: string;
  challenges: string;
  results: string;
  githubUrl?: string;
  /** An anchor further down this page, not an external demo. */
  inPageAnchor?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    // DESIGN.md content item 0. Built AI-first and said so: he writes no code
    // by hand. Production runs on test brands, so no customer claims, and the
    // spend cut is a percentage because the dollar figures stay internal.
    slug: "citeos",
    title: "CiteOS, AI Search Visibility",
    headline:
      "A multi-tenant platform that measures how brands show up in ChatGPT, Perplexity, Gemini, Copilot and Google AI Overviews answers, taken from an empty repo to production in three weeks.",
    metric: { value: "~68%", label: "LLM spend per domain, cut" },
    stack: ["TypeScript", "NestJS", "PostgreSQL", "Keycloak", "pg-boss", "Playwright", "AWS EKS", "Claude Code"],
    problem:
      "People now find brands through AI answers as much as through search results, and a brand has no way to see how often an answer engine mentions it, which pages it cites, or whether what it says is true. CiteOS asks the engines on a schedule and turns their answers into visibility scores, citations, accuracy checks and a list of fixes.",
    architecture:
      "Two deployables: a NestJS API on Fastify that also runs the scanner, crawler and integration workers as pg-boss jobs, and a React web app. PostgreSQL holds every tenant behind row-level security and Keycloak issues the tokens. Engine answers are archived verbatim, so extraction can be replayed without paying for another engine call. It runs on AWS EKS behind a pipeline that pins image digests and snapshots the database before every apply.",
    contribution:
      "Lead and architect. Chose TypeScript over the mandated Java/Spring stack in a written decision record, directed the design of tenancy, auth and the scan pipeline, and built it AI-first with one other engineer and Claude Code.",
    challenges:
      "Tenant isolation that cannot fail quietly: a startup check refuses to boot the API if any tenant table has lost its row-level security policy. And an auth trap where the token names Keycloak by the browser's hostname while the API has to fetch signing keys by an internal one, so the issuer and the key URL became two settings.",
    results:
      "In production three weeks after the first commit and on AWS EKS nine days later, with 4,300+ automated tests. Per-domain LLM vendor spend down ~68% after retuning scan cadence, quotas and queue tiers, with the cost model kept in code and asserted by tests.",
  },
  {
    slug: "render-reliability",
    title: "AI Video Generation Platform",
    headline: "Scalable event-driven video rendering microservices processing 25,000+ daily renders across GKE and Cloud Run.",
    metric: { value: "60% → 98%", label: "Render reliability" },
    stack: ["Java", "Spring Boot", "Kafka", "Kubernetes", "AWS EFS", "GCP Cloud Run", "MongoDB"],
    problem:
      "Render success sat at 60%. Four out of ten renders failed un-reproducibly under concurrent load, with retries consuming excessive cloud compute and delaying output delivery.",
    architecture:
      "Distributed event-driven architecture using Kafka for task ingestion, GKE worker clusters for rendering, Redis for media segment caching, and Pub/Sub queue-depth autoscaling.",
    contribution:
      "Engineered core rendering microservices as one of the pipeline's core engineers, root-caused EFS concurrent write atom corruption, and implemented pod-local ephemeral storage staging for render workloads.",
    challenges:
      "Diagnosing non-reproducible MOV atom file header corruption caused by simultaneous read/write locks across shared network file systems.",
    results:
      "Raised pipeline render reliability from 60% to 98% and eliminated the un-reproducible MOV atom errors.",
  },
  {
    // Told the way docs/DESIGN.md tells it: two independent wins, and the
    // autoscaling change is a move off KEDA on GKE, not a KEDA setup.
    slug: "cloud-cost",
    title: "Cutting Cloud Spend, Twice",
    headline:
      "Two independent cuts to cloud spend: a segment-level Redis cache, then moving render autoscaling off KEDA on GKE onto Cloud Run, scaled on Pub/Sub queue depth.",
    metric: { value: "~30% + ~10%", label: "Cloud spend, cut twice" },
    stack: ["Redis", "GKE", "KEDA", "Kafka", "Pub/Sub", "Cloud Run"],
    problem:
      "Spend was leaking two ways. TTS, voice-clone and lip-sync segments were generated again for every user, even when their parameters overlapped with someone else's. And the render pods on GKE, autoscaled by KEDA on Kafka lag, still cost money while they sat idle.",
    architecture:
      "A Redis cache at segment level, shared across users, so a TTS, voice-clone or lip-sync segment with the same parameters is generated once. Render autoscaling moved from KEDA on GKE, which scaled on Kafka consumer lag, to a Cloud Run autoscaler driven by Pub/Sub queue depth that scales to zero between bursts.",
    contribution:
      "Built the segment cache, which holds about an 80% hit rate, and migrated render autoscaling off KEDA onto the Cloud Run autoscaler.",
    challenges:
      "Decoupling monolithic render steps into granular segment tasks, small enough to cache and quick enough to start from zero.",
    results:
      "Reduced monthly cloud spend by ~40% across two independent wins: ~30% from segment caching (80% hit rate) and ~10% from scale-to-zero autoscaling.",
  },
  {
    // This one is on this site, so nothing here is reconstructed from memory.
    // Every number is from the upstream measurements in docs/DESIGN.md, taken
    // 2026-08-05, and the behaviour described is the behaviour you can go and
    // trigger further down the page.
    slug: "dartboard",
    title: "Weekend Dartboard",
    headline:
      "A map you throw a dart at, built on two public APIs where one of them fails about a third of the time.",
    metric: { value: "504 · 200 · 429", label: "Three identical Overpass calls, measured" },
    stack: ["TypeScript", "Next.js", "Leaflet", "Nominatim", "Overpass", "OpenStreetMap"],
    problem:
      "Pick how far you will travel, throw, and go wherever it lands. The interesting part is underneath: the two upstreams it needs behave nothing alike. One answers in about a second. The other fails roughly one call in three and takes eight to ten seconds to do it.",
    architecture:
      "Sampling is a pure function with no network in it. Reverse geocoding through Nominatim is the single blocking call and the result card renders on it. Overpass enrichment is fired alongside and never awaited. Both upstreams sit behind server routes that cache answers and hold each API to one request at a time, so a visitor cannot spend a shared rate limit.",
    contribution:
      "All of it. Measured both upstreams before designing around either, kept the unreliable one off the critical path, and wrote the sampling to distribute darts over the circle's area rather than its radius, which is the difference between an even scatter and a clump around the middle.",
    challenges:
      "Nominatim returns the same 'unable to geocode' body for open ocean and for unmapped land, with no field separating them. The card says the map has no record of the spot instead of picking one and sounding certain.",
    results:
      "A failed Overpass call is silence rather than an error: the nearby-places strip does not appear and the throw is untouched. Measured across three identical calls on 2026-08-05, Nominatim answered in 0.39s, 0.93s and 0.88s, while Overpass returned a 504, a 200 and a 429.",
    inPageAnchor: "#dartboard-embedded-section",
  },
  {
    slug: "config-playground",
    title: "Visitor Pattern Config Playground",
    headline: "A playground microservice that lets solution engineers try client configurations on their own, cutting approval cycles from 3 days to 1 day.",
    metric: { value: "3 days → 1 day", label: "Config approval cycle" },
    stack: ["Java", "Spring Boot", "Jackson", "Design Patterns"],
    problem:
      "Every client configuration change for TTS, voice cloning or lip sync needed an engineer to run it, so solution engineers waited on us and an approval took 3 days.",
    architecture:
      "One PlaygroundRequest type with a subtype per engine: TtsRequest, VoiceCloneRequest and LipSyncRequest. Jackson reads the type field and builds the right subtype, and a PlaygroundVisitor sends each one to its engine, so supporting a new engine means a new subtype and a new visit method rather than another branch in a switch.",
    contribution:
      "Built the playground microservice: the request hierarchy, the visitor and the service that runs each request.",
    challenges:
      "Letting non-engineers try TTS, voice-clone and lip-sync settings in isolation against client previews, without touching production configuration.",
    results:
      "Solution engineers test configurations themselves, and the approval cycle went from 3 days to 1 day.",
  },
];
