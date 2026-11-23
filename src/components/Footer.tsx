export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-shell">
      <div className="footer-content">
        <p className="footer-copy">
          © <time dateTime={String(currentYear)}>{currentYear}</time> Rico Manifesto. All rights reserved.
        </p>
        <div className="footer-links">
          <a className="footer-privacy-link" href="https://newsletter.ricomanifesto.com/">Newsletter</a>
          <a className="footer-privacy-link" href="/privacy/">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
