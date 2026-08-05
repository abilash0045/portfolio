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
            <span>Senior Backend &amp; Distributed Systems Engineer</span>
          </div>

          <h1 className="hero__name">
            Backend Engineer building scalable distributed systems.
          </h1>

          <p className="hero__value-prop">
            Backend Engineer with 2+ years building event-driven microservices that power AI video generation at scale.
          </p>

          <p className="hero__lede">
            I build high-performance backend systems with Java, Spring Boot, Kafka, Kubernetes, AWS, and modern cloud infrastructure.
          </p>

          <p className="hero__lede hero__lede--muted">
            At Whilter, I design and operate the core video rendering pipeline processing <strong>25,000+ daily renders</strong> across GKE and Cloud Run, caching media segments for 80% hit rates, root-causing MOV atom corruption to move from 60% to 98% reliability, and trimming 40% off cloud spend.
          </p>
        </div>

        {/* Professional Avatar Card */}
        <div className="hero__avatar-card">
          <div className="hero__avatar-circle">
            <span>ASL</span>
          </div>
          <div className="hero__avatar-info">
            <div className="hero__avatar-name">Abilash S L</div>
            <div className="hero__avatar-role">Senior Backend Engineer</div>
            <div className="hero__avatar-tech">Java · Spring · Kafka · K8s</div>
          </div>
        </div>
      </div>

      {/* Floating Tech Stack Badges without emojis */}
      <div className="hero__tech-badges" aria-label="Core Stack">
        <span className="hero__tech-tag">Java</span>
        <span className="hero__tech-tag">Spring Boot</span>
        <span className="hero__tech-tag">Kafka</span>
        <span className="hero__tech-tag">Kubernetes</span>
        <span className="hero__tech-tag">AWS / GCP</span>
        <span className="hero__tech-tag">Redis</span>
      </div>

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
          <div className="hero__metric-value" style={{ color: "var(--accent-blue)" }}>~40%</div>
          <div className="hero__metric-label">Cloud Spend Saved</div>
        </div>
        <div className="hero__metric">
          <div className="hero__metric-value" style={{ color: "var(--accent-violet)" }}>3d ➔ 1d</div>
          <div className="hero__metric-label">Config Approval Cycle</div>
        </div>
      </div>

      <div className="hero__cta-group">
        <a className="hero__btn hero__btn--primary" href="#case-studies">
          View Selected Work
        </a>
        <a
          href="/resume.pdf"
          download="Abilash_SL_Resume.pdf"
          className="hero__btn hero__btn--secondary"
        >
          Download Resume
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

      {/* Social Links */}
      <div className="hero__socials">
        <a href="https://github.com/abilash0045" target="_blank" rel="noopener noreferrer" className="hero__social-link">
          GitHub (Pinned Repositories) ↗
        </a>
        <span>·</span>
        <a href="https://www.linkedin.com/in/abilash0045/" target="_blank" rel="noopener noreferrer" className="hero__social-link">
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
