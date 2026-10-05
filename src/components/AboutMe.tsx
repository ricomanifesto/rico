import { aboutContent } from "../content/portfolio";
import { githubProfileLink, socialLinkBehavior } from "../content/navigation";

export default function AboutMe() {
  return (
    <section id="about" aria-labelledby="about-heading" className="portfolio-section">
      <div className="about-content">
        <h2 id="about-heading" className="section-title">
          About
        </h2>

        <div className="about-layout">
          <div className="about-copy">
            <p className="about-body-copy about-body-spaced">
              I build security systems around a simple idea: a result is only useful when someone can inspect how it was produced. At SentinelOne, my work spans proactive threat hunting, detection engineering, automation, and analyst workflows for incident readiness and response.
            </p>

            <p className="about-body-copy about-body-spaced">
              The projects below apply that approach to threat research, security briefings, exploitation intelligence, and GRC reporting. Each one keeps the evidence visible and makes the next decision clearer.
            </p>

            <p className="about-body-copy about-body-spaced">
              See{" "}
              <a
                href={githubProfileLink.href}
                target={socialLinkBehavior.externalTarget}
                rel={socialLinkBehavior.externalRel}
                className="about-profile-link"
              >
                Michael Rico on GitHub
              </a>{" "}
              for public code and project evidence.
            </p>

            <ul
              aria-label="Technologies"
              role="list"
              className="about-technology-grid"
            >
              {aboutContent.technologies.map((tech) => (
                <li
                  key={tech}
                  className="about-technology-item"
                >
                  <span className="about-technology-label">{tech}</span>
                </li>
              ))}
            </ul>

            <p className="about-body-copy">
              Outside of work, I am interested in geopolitics, security research, and how technical systems shape real-world decisions.
            </p>
          </div>

          <div className="about-profile-frame">
            <picture>
              <source srcSet="/images/profile-384.webp" type="image/webp" />
              <img
                src="/images/profile.jpg"
                width="369"
                height="800"
                alt="Michael Rico Profile"
                loading="lazy"
                decoding="async"
                className="about-profile-surface"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
