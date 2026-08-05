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
      <div className="hero__badge">
        <span className="hero__badge-pulse" aria-hidden="true" />
        <span>Senior Backend Engineer &amp; Architecture</span>
      </div>

      <h1 className="hero__name">
        Building high-scale backend pipelines that run reliably and save millions.
      </h1>

      <p className="hero__lede">
        Backend engineer at Whilter. I design and operate the core video rendering pipeline
        turning out <strong>25,000+ renders daily</strong> across GKE and Cloud Run, built with
        Java, Spring Boot, Kafka, Redis, and MongoDB.
      </p>

      <p className="hero__lede hero__lede--muted">
        My work lives where concurrency, shared storage, and bursty traffic intersect:
        caching media segments for 80% hit rates, root-causing MOV atom corruption to move
        from 60% to 98% reliability, and trimming 40% off the cloud bill.
      </p>

      {/* Key Metric Highlights Grid */}
      <div className="hero__metrics">
        <div className="hero__metric">
          <div className="hero__metric-value">25,000+</div>
          <div className="hero__metric-label">Daily Video Renders</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value" style={{ color: "var(--accent-green)" }}>60% ➔ 98%</div>
          <div className="hero__metric-label">Pipeline Reliability</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value" style={{ color: "var(--accent-cyan)" }}>~40%</div>
          <div className="hero__metric-label">Cloud Spend Saved</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value" style={{ color: "var(--accent-purple)" }}>3d ➔ 1d</div>
          <div className="hero__metric-label">Config Approval Cycle</div>
        </div>
      </div>

      <div className="hero__cta-group">
        <a className="hero__btn hero__btn--primary" href="#architecture">
          View Pipeline Architecture
        </a>
        <a className="hero__btn hero__btn--secondary" href="#dartboard-embedded">
          Throw a Dart on Map
        </a>
        <button
          type="button"
          className="hero__btn hero__btn--ghost"
          onClick={copyEmail}
          title="Copy email to clipboard"
        >
          {copied ? "✓ Copied to Clipboard!" : "Copy Email"}
        </button>
      </div>
    </header>
  );
}
