"use client";

import { useState } from "react";

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("abilash0045@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="hero" id="overview">
      <div className="hero__top-row">
        <div>
          <div className="hero__badge">
            <span className="hero__badge-pulse" aria-hidden="true" />
            <span>Backend engineer, distributed systems</span>
          </div>

          <h1 className="hero__name">
            I keep a 25,000-render-a-day pipeline cheap and standing up.
          </h1>

          <p className="hero__lede">
            At Whilter I work on the video rendering pipeline: Java and Spring
            Boot over Kafka, Redis and MongoDB, running on GKE and Cloud Run
            across GCP and AWS.
          </p>

          <p className="hero__lede hero__lede--muted">
            Most of what I do lands on either the cloud bill or the on-call
            dashboard. How media gets cached, how render jobs get queued and
            scaled, and what breaks when shared storage, concurrency and bursty
            traffic all arrive at once.
          </p>
        </div>

        <div className="hero__avatar-card">
          <div className="hero__avatar-circle">
            <span>ASL</span>
          </div>
          <div className="hero__avatar-info">
            <div className="hero__avatar-name">Abilash S L</div>
            <div className="hero__avatar-role">Backend Engineer</div>
            <div className="hero__avatar-tech">Java · Spring · Kafka · K8s</div>
          </div>
        </div>
      </div>

      <div className="hero__tech-badges" aria-label="Core stack">
        <span className="hero__tech-tag">Java</span>
        <span className="hero__tech-tag">Spring Boot</span>
        <span className="hero__tech-tag">Kafka</span>
        <span className="hero__tech-tag">Kubernetes</span>
        <span className="hero__tech-tag">AWS / GCP</span>
        <span className="hero__tech-tag">Redis</span>
      </div>

      <div className="hero__metrics">
        <div className="hero__metric">
          <div className="hero__metric-value">25,000+</div>
          <div className="hero__metric-label">Daily video renders</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value">
            60% → 98%
          </div>
          <div className="hero__metric-label">Render reliability</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value">
            ~40%
          </div>
          <div className="hero__metric-label">Cloud spend cut</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value">
            3d → 1d
          </div>
          <div className="hero__metric-label">Config approval cycle</div>
        </div>
      </div>

      <div className="hero__cta-group">
        <a className="hero__btn hero__btn--primary" href="#case-studies">
          Read the case studies
        </a>
        <button
          type="button"
          className="hero__btn hero__btn--ghost"
          onClick={copyEmail}
        >
          {copied ? "Copied" : "Copy email"}
        </button>
      </div>

      <div className="hero__socials">
        <a
          href="https://github.com/abilash0045"
          target="_blank"
          rel="noopener noreferrer"
          className="hero__social-link"
        >
          GitHub ↗
        </a>
        <span>·</span>
        <a
          href="https://www.linkedin.com/in/abilash0045/"
          target="_blank"
          rel="noopener noreferrer"
          className="hero__social-link"
        >
          LinkedIn ↗
        </a>
        <span>·</span>
        <a href="mailto:abilash0045@gmail.com" className="hero__social-link">
          abilash0045@gmail.com
        </a>
      </div>
    </header>
  );
}
