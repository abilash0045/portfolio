export type CaseStudy = {
  slug: string;
  title: string;
  stack: string[];
  headline: string;
  body: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "render-reliability",
    title: "The render failures that survived a week of debugging",
    stack: ["Java", "Spring Boot", "AWS EFS", "MLT", "GKE"],
    headline: "Render success sat at 60%. It took a root cause nobody expected to reach 98%.",
    body: [
      "Renders failed roughly four times in ten, and the failures were not reproducible on demand. The whole team had spent a week on it. Retries papered over some of it and made the cost problem worse.",
      "The output files were corrupt rather than missing, which pointed at the write path instead of the render logic. The pipeline read and wrote media on shared EFS storage while several renders ran concurrently, and concurrent access was corrupting MOV atoms mid-write. The renderer was doing its job on input that had already been damaged.",
      "The fix was to stop rendering against shared storage: stage media on pod-local ephemeral disk first, render there, then publish. Success rate went from 60% to 98%.",
      "The lesson I keep from it is that a week of looking at the wrong layer beats no time at all, but only if you eventually ask which layer the evidence actually implicates. Corrupt output was the tell, and it was there the whole time.",
    ],
  },
  {
    slug: "cloud-cost",
    title: "Cutting cloud spend around 40%, in two unrelated pieces of work",
    stack: ["Redis", "GCP Pub/Sub", "Cloud Run", "KEDA", "Kafka"],
    headline: "A cache win and an autoscaling win. They add up, but they are not one story.",
    body: [
      "The first was a segment-level Redis cache over the personalised media pipeline. Renders are personalised, but not uniquely: users share first names, birth dates, and other parameters, so the TTS, voice-clone and lip-sync segments generated for them are frequently identical. Caching at the segment level rather than the render level reached about an 80% hit rate and removed roughly 30% of monthly infrastructure spend.",
      "The second was autoscaling. Render workers ran on GKE with KEDA scaling on Kafka consumer lag, which worked but kept pods warm through quiet stretches. Moving to Cloud Run behind a Pub/Sub queue-depth autoscaler allowed genuine scale-to-zero, cutting a further 10%.",
      "I keep these separate when I talk about them. They are independent wins on independent problems, and folding them into one 40% headline would make the reasoning behind each of them disappear.",
    ],
  },
  {
    slug: "config-playground",
    title: "A config playground built on the Visitor pattern",
    stack: ["Java", "Design patterns", "Internal tooling"],
    headline: "Config approval went from three days to one, by letting non-engineers try things.",
    body: [
      "Solution engineers needed to tune TTS, voice-clone, lip-sync and video-template configuration per client, and every iteration went through an engineer. Three days per approval cycle, most of it waiting.",
      "The config types were a small, closed, and stable set, with operations over them that kept growing: validate, preview, serialise, diff. That shape is what the Visitor pattern is for, so the operations live outside the config types and a new one is a new visitor rather than a change to every node.",
      "Wrapped in a playground UI, it let the solution engineering team iterate against live client previews without an engineer in the loop. The approval cycle went from three days to one.",
    ],
  },
  {
    slug: "dartboard",
    title: "This site's dartboard",
    stack: ["Next.js", "TypeScript", "Leaflet", "OpenStreetMap"],
    headline: "A wall map you throw a dart at, built around an API that fails one call in three.",
    body: [
      "Pick a range from where you are, throw a dart, go wherever it lands. The sampling is uniform over the area of the circle rather than over its radius, which is a one-character difference in the code and the difference between a real throw and one that clusters in the middle.",
      "The interesting constraint was Overpass, the OpenStreetMap query API that finds interesting things near a point. Measured before any code was written, three identical requests returned a timeout, a ten-second success, and a rate limit. So it is not on the critical path: Nominatim names the landing spot in under a second and the card renders, then Overpass fills in what else is nearby if it feels like answering.",
      "If the dart lands in the sea, the site says so. Silently re-rolling until it hit land would bias the distribution while still calling itself random.",
    ],
  },
];
