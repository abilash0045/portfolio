"use client";

import { useState } from "react";
import "./contact.css";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-card">
        <div className="contact-info">
          <div>
            <h2 className="contact-title">Let&apos;s Connect</h2>
            <p className="contact-desc">
              Interested in distributed systems engineering, high-throughput pipelines, or backend architecture? Reach out directly or send a message.
            </p>
          </div>

          <div className="contact-channels">
            <a
              href="mailto:abilash0045@gmail.com"
              className="contact-channel-link"
            >
              <span>📧</span>
              <span>abilash0045@gmail.com</span>
            </a>
            <a
              href="https://github.com/abilash0045"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-link"
            >
              <span>🐙</span>
              <span>github.com/abilash0045</span>
            </a>
            <a
              href="https://www.linkedin.com/in/abilash0045/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-link"
            >
              <span>💼</span>
              <span>linkedin.com/in/abilash0045</span>
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              className="form-input"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              className="form-textarea"
              placeholder="Share details about your team, system engineering challenge, or role..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            {submitted ? "✓ Message Sent Successfully!" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
