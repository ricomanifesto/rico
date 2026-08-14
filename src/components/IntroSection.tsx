import { heroContent } from "../content/hero";
import { contactLink } from "../content/navigation";

export default function IntroSection() {
  return (
    <section id="intro" className="hero-section">
      <div data-testid="hero-copy" className="hero-content">
        <h1 className="hero-headline">{heroContent.headline}</h1>
        <p className="hero-introduction">{heroContent.introduction}</p>
        <p className="hero-body">{heroContent.body}</p>
        <nav aria-label="Introduction" className="hero-links">
          <a href="#projects">Selected work</a>
          <a href="/writing/">Writing</a>
          <a href={contactLink.href}>Email me</a>
        </nav>
      </div>
    </section>
  );
}
