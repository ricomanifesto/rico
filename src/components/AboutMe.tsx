import { ChevronRight } from "lucide-react";
import { aboutContent } from "../content/portfolio";
import { githubProfileLink, socialLinkBehavior } from "../content/navigation";

export default function AboutMe() {
  return (
    <section id="about" aria-labelledby="about-heading" className="portfolio-section">
      <div className="about-content">
        <h2 id="about-heading" className="section-title">
          / about me
        </h2>

        <div className="about-layout">
          <div className="about-copy">
            <p className="about-body-copy about-body-spaced">
              I am currently a Staff Threat Hunter at SentinelOne, working in ThreatOps on Incident Readiness and Response. My work sits at the intersection of threat hunting, detection engineering, automation, and analyst workflows. These are some of the tools and technologies I have been working with:
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
                  <ChevronRight
                    className="about-technology-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
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
