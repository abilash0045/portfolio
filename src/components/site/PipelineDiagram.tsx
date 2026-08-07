import "./pipeline-diagram.css";

/**
 * The render path, at exactly the level of detail the case studies already
 * state in prose on this same page. No internal service names, no topic or
 * cluster names, no config. `docs/DESIGN.md` caps employer detail at what is
 * already public, and this does not go past that line.
 *
 * The two things hanging off the render stage are the two separate wins and
 * must stay separate: pod-local staging is the 60% to 98% reliability fix
 * (EFS concurrent-write atom corruption, never autoscaling), and the segment
 * cache is one of the two independent cost wins.
 */
const LABEL =
  "The render path. Kafka takes task ingestion. GKE workers render, reading from a " +
  "Redis segment cache at about an 80 percent hit rate and staging media on pod-local " +
  "disk before render. Cloud Run scales to zero on Pub/Sub queue depth.";

export default function PipelineDiagram() {
  return (
    <figure className="pipeline" aria-labelledby="pipeline-caption">
      <svg
        className="pipeline__svg"
        viewBox="0 0 400 292"
        role="img"
        aria-label={LABEL}
        preserveAspectRatio="xMinYMin meet"
      >
        {/* Spine */}
        <line className="pipeline__spine" x1="10" y1="26" x2="10" y2="252" />

        {/* Ingest */}
        <circle className="pipeline__node" cx="10" cy="26" r="4.5" />
        <text className="pipeline__name" x="28" y="31">
          Kafka
        </text>
        <text className="pipeline__note" x="28" y="49">
          task ingestion
        </text>

        {/* Render. The accent marks where the work actually happens. */}
        <circle className="pipeline__node pipeline__node--live" cx="10" cy="110" r="6" />
        <text className="pipeline__name" x="28" y="115">
          GKE workers
        </text>
        <text className="pipeline__note" x="28" y="133">
          render
        </text>

        {/* What makes the render stage cheap, and what makes it reliable. */}
        <path className="pipeline__branch" d="M42 145 V 196" />
        <path className="pipeline__branch" d="M42 158 H 54" />
        <path className="pipeline__branch" d="M42 190 H 54" />

        <text className="pipeline__sub" x="60" y="162">
          <tspan className="pipeline__sub-name">Redis</tspan>
          <tspan dx="8">segment cache, ~80% hit</tspan>
        </text>
        <text className="pipeline__sub" x="60" y="194">
          <tspan className="pipeline__sub-name">pod-local disk</tspan>
          <tspan dx="8">staged before render</tspan>
        </text>

        {/* Scale */}
        <circle className="pipeline__node" cx="10" cy="252" r="4.5" />
        <text className="pipeline__name" x="28" y="257">
          Cloud Run
        </text>
        <text className="pipeline__note" x="28" y="275">
          Pub/Sub queue depth, scales to zero
        </text>
      </svg>

      <figcaption className="pipeline__caption" id="pipeline-caption">
        The shape of it. The numbers are below.
      </figcaption>
    </figure>
  );
}
