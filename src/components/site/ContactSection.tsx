"use client";

import { useState } from "react";
import "./contact.css";

const ADDRESS = "abilash0045@gmail.com";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  /**
   * Composes a real mail draft and hands it to the visitor's mail client.
   *
   * There is no backend and no mail service, so there is nothing here that
   * could actually deliver a message. Rather than show a success state for
   * something that never happened, this opens a prefilled draft the sender
   * can see and send themselves.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const subject = `Portfolio enquiry from ${name}`;
    const body = `${message}\n\n---\n${name}\n${email}`;
    window.location.href = `mailto:${ADDRESS}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-card">
        <h2 className="contact-title">Get in touch</h2>
        <p className="contact-desc">
          If your team works on high-throughput backends, caching, or the kind
          of infrastructure problems that show up on the bill, I&apos;m happy to
          talk shop.
        </p>

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
              placeholder="you@company.com"
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
              placeholder="What are you building, and where does it hurt?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            Open in your mail app
          </button>
          <p className="contact-note">
            This opens a draft in your own mail client. Nothing is sent from
            this page.
          </p>
        </form>

        <div className="contact-channels">
          <a href={`mailto:${ADDRESS}`} className="contact-channel-link">
            {ADDRESS}
          </a>
          <span>·</span>
          <a
            href="https://github.com/abilash0045"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel-link"
          >
            GitHub ↗
          </a>
          <span>·</span>
          <a
            href="https://www.linkedin.com/in/abilash0045/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel-link"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
    </section>
  );
}
