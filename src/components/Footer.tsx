export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-shell">
      <div className="footer-content">
        <p className="footer-copy">
          © <time dateTime={String(currentYear)}>{currentYear}</time> Rico Manifesto. All rights reserved.
        </p>
        <a className="footer-privacy-link" href="/privacy/">Privacy</a>
      </div>
    </footer>
  );
}
