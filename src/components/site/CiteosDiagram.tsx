import "./pipeline-diagram.css";

/**
 * CiteOS, at exactly the level of detail its case study already states in
 * prose on this page, like the render path above it. docs/DESIGN.md rules out
 * real architecture diagrams of Whilter's systems: no internal hostnames, no
 * service or queue names, no config. e2e/pipeline-diagram.spec.ts holds every
 * name drawn here to the study's own text.
 */
const LABEL =
  "How CiteOS fits together. A React web app talks to a NestJS API on Fastify, and " +
  "Keycloak issues the tokens. The API runs pg-boss jobs for the scanner, crawler and " +
  "integration workers, which ask the answer engines on a schedule and archive their " +
  "answers verbatim so extraction can be replayed. PostgreSQL holds every tenant behind " +
  "row-level security, and the API will not boot if a tenant table loses its policy. It " +
  "runs on AWS EKS, with pinned image digests and a database snapshot before every apply.";

export default function CiteosDiagram() {
  return (
    <figure className="pipeline" aria-labelledby="citeos-diagram-caption">
      <svg
        className="pipeline__svg"
        viewBox="0 0 400 380"
        role="img"
        aria-label={LABEL}
        preserveAspectRatio="xMinYMin meet"
      >
        <line className="pipeline__spine" x1="10" y1="26" x2="10" y2="336" />

        <circle className="pipeline__node" cx="10" cy="26" r="4.5" />
        <text className="pipeline__name" x="28" y="31">
          React web app
        </text>
        <text className="pipeline__note" x="28" y="49">
          scores, citations and fixes
        </text>

        {/* The API is where tenancy, auth and the scan pipeline meet. */}
        <circle className="pipeline__node pipeline__node--live" cx="10" cy="110" r="6" />
        <text className="pipeline__name" x="28" y="115">
          NestJS API
        </text>
        <text className="pipeline__note" x="28" y="133">
          on Fastify; Keycloak issues the tokens
        </text>

        <path className="pipeline__branch" d="M42 145 V 196" />
        <path className="pipeline__branch" d="M42 158 H 54" />
        <path className="pipeline__branch" d="M42 190 H 54" />

        <text className="pipeline__sub" x="60" y="162">
          <tspan className="pipeline__sub-name">pg-boss jobs</tspan>
          <tspan dx="8">scanner, crawler, integration workers</tspan>
        </text>
        <text className="pipeline__sub" x="60" y="194">
          <tspan className="pipeline__sub-name">engine answers</tspan>
          <tspan dx="8">archived verbatim, replayable</tspan>
        </text>

        <circle className="pipeline__node" cx="10" cy="252" r="4.5" />
        <text className="pipeline__name" x="28" y="257">
          PostgreSQL
        </text>
        <text className="pipeline__note" x="28" y="275">
          every tenant behind row-level security
        </text>
        <text className="pipeline__note" x="28" y="291">
          no policy, no boot
        </text>

        <circle className="pipeline__node" cx="10" cy="336" r="4.5" />
        <text className="pipeline__name" x="28" y="341">
          AWS EKS
        </text>
        <text className="pipeline__note" x="28" y="359">
          pinned image digests, snapshot before every apply
        </text>
      </svg>

      <figcaption className="pipeline__caption" id="citeos-diagram-caption">
        CiteOS, drawn at the level the text above describes it.
      </figcaption>
    </figure>
  );
}
