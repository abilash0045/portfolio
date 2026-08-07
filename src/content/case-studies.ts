export type CaseStudy = {
  slug: string;
  title: string;
  headline: string;
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
    slug: "render-reliability",
    title: "AI Video Generation Platform",
    headline: "Scalable event-driven video rendering microservices processing 25,000+ daily renders across GKE and Cloud Run.",
    stack: ["Java", "Spring Boot", "Kafka", "Kubernetes", "AWS EFS", "GCP Cloud Run", "MongoDB"],
    problem:
      "Render success sat at 60%. Four out of ten renders failed un-reproducibly under concurrent load, with retries consuming excessive cloud compute and delaying output delivery.",
    architecture:
      "Distributed event-driven architecture using Kafka for task ingestion, GKE worker clusters for rendering, Redis for media segment caching, and Pub/Sub queue-depth autoscaling.",
    contribution:
      "Architected core rendering microservices, root-caused EFS concurrent write atom corruption, and implemented pod-local ephemeral storage staging for render workloads.",
    challenges:
      "Diagnosing non-reproducible MOV atom file header corruption caused by simultaneous read/write locks across shared network file systems.",
    results:
      "Raised pipeline render reliability from 60% to 98%, eliminated un-reproducible MOV atom errors, and scaled daily throughput to 25,000+ videos.",
    inPageAnchor: "#architecture",
  },
  {
    slug: "whatsapp-automation",
    title: "WhatsApp Automation Platform",
    headline: "High-throughput messaging and notification workflows integrating Spring Boot, bot engines, and REST APIs.",
    stack: ["Java", "Spring Boot", "Spring Security", "REST APIs", "Botpress", "MySQL", "Redis"],
    problem:
      "Manual customer response flows and fragmented messaging systems caused high latency and low engagement during high-volume notification bursts.",
    architecture:
      "Spring Boot RESTful microservices layer connected to automated bot webhooks, MySQL transactional stores, and Redis rate limiters.",
    contribution:
      "Designed REST API contracts, implemented secure webhook handlers, integrated bot message engines, and built automated notification retry queues.",
    challenges:
      "Handling upstream WhatsApp API rate limits and preventing message duplication under sudden burst traffic.",
    results:
      "Automated 85% of customer response workflows, reduced notification delivery latency to under 1.2 seconds, and achieved zero message loss.",
    inPageAnchor: "#contact",
  },
  {
    slug: "cloud-cost",
    title: "Kubernetes Auto Scaling & Performance Optimization",
    headline: "Cost-optimized Kubernetes microservices with KEDA consumer-lag autoscaling and scale-to-zero Cloud Run instances.",
    stack: ["Kubernetes", "KEDA", "AWS EKS", "GCP Pub/Sub", "Cloud Run", "Redis", "Kafka"],
    problem:
      "Static worker pools on GKE created high idle infrastructure spend during off-peak hours while causing buffer lag during peak traffic spikes.",
    architecture:
      "Hybrid autoscaling architecture combining KEDA Kafka consumer lag metrics for heavy pod clusters with GCP Cloud Run scale-to-zero queue depth triggers.",
    contribution:
      "Configured KEDA autoscalers, implemented segment-level Redis caching reaching an 80% hit rate, and migrated bursty queues to Cloud Run.",
    challenges:
      "Decoupling monolithic render steps into granular segment tasks suitable for rapid spin-up and zero-downtime scaling.",
    results:
      "Reduced monthly cloud spend by ~40% across two independent wins: ~30% from segment caching (80% hit rate) and ~10% from scale-to-zero autoscaling.",
    inPageAnchor: "#architecture",
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
    title: "Visitor Pattern Config Engine",
    headline: "Extensible domain configuration engine reducing solution engineering approval cycles from 3 days to 1 day.",
    stack: ["Java", "Design Patterns", "Spring Boot", "TypeScript", "React"],
    problem:
      "Every client configuration adjustment required manual engineer intervention and code deployment, creating a 3-day bottleneck for non-technical teams.",
    architecture:
      "Closed AST node hierarchy evaluated by external Visitor operations (ValidateVisitor, DiffVisitor, SerialiseVisitor, PreviewVisitor) wrapped in an interactive playground UI.",
    contribution:
      "Designed Visitor pattern AST structures, implemented validation/diff algorithms, and created the interactive web playground.",
    challenges:
      "Safely exposing complex model parameters (voice cloning, TTS, lip sync) to non-engineers without risking invalid production configurations.",
    results:
      "Shortened client configuration approval cycles from 3 days to 1 day and enabled self-service tuning for solution engineering teams.",
    inPageAnchor: "#playground",
  },
];
