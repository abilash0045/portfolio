import { EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_NAME, SOURCE_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__credit">
          <span className="footer__name">{SITE_NAME}</span>. Built with Next.js,
          Leaflet and OpenStreetMap.
        </p>

        <ul className="footer__links">
          <li>
            <a className="footer__link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a className="footer__link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="footer__link" href={`mailto:${EMAIL}`}>
              Email
            </a>
          </li>
          <li>
            <a className="footer__link" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
