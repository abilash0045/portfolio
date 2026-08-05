export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text-primary)" }}>
            Abilash S L
          </p>
          <p style={{ margin: 0 }}>
            Open source engineering portfolio. Built with Next.js 16, TypeScript, Leaflet &amp; OpenStreetMap.
          </p>
        </div>

        <ul className="footer__links">
          <li>
            <a className="footer__link" href="https://github.com/abilash0045" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a className="footer__link" href="https://www.linkedin.com/in/abilash0045/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="footer__link" href="mailto:abilash0045@gmail.com">
              Email
            </a>
          </li>
          <li>
            <a className="footer__link" href="https://github.com/abilash0045/portfolio" target="_blank" rel="noopener noreferrer">
              Source Code
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
