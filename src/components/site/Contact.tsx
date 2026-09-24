import CopyEmail from "./CopyEmail";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/site";
import "./contact.css";

// No form. There is no backend to send one, and a mailto link does the same
// job without pretending otherwise.
export default function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <span className="section-head__index" aria-hidden="true">
          05
        </span>
        <h2 className="contact__title" id="contact-title" data-reveal>
          Get in <em>touch</em>.
        </h2>

        <div className="contact__grid">
          <p className="contact__lede" data-reveal>
            If your team works on high-throughput backends, caching, or the
            kind of infrastructure problems that show up on the bill, I&apos;m
            happy to talk shop.
          </p>

          <div className="contact__reach" data-reveal>
            <a className="contact__email" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>

            <div className="contact__actions">
              <CopyEmail className="button button--secondary copy-email" addressIs="above" />
              <ul className="contact-channels">
                <li>
                  <a
                    className="contact-channel-link"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                </li>
                <li>
                  <a
                    className="contact-channel-link"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
