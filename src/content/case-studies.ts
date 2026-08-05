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
