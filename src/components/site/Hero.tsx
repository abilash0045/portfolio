export default function Hero() {
  return (
    <header className="hero">
      <h1 className="hero__name">Abilash S L</h1>
      <p className="hero__lede">
        Backend engineer. I work on the video rendering pipeline at Whilter,
        which turns out about 25,000 renders a day across GKE and Cloud Run,
        written in Java and Spring Boot over Kafka, Redis and MongoDB.
      </p>
      <p className="hero__lede hero__lede--muted">
        Most of what I do lands on either the cloud bill or the on-call
        dashboard: how media gets cached, how render jobs get queued and
        scaled, and what breaks when shared storage, concurrency and bursty
        traffic arrive at the same time.
      </p>
      <a className="hero__dart" href="/dartboard">
        Throw a dart at a map
      </a>
    </header>
  );
}
