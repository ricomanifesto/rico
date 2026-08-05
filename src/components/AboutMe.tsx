import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { aboutBehavior, aboutContent } from "../content/portfolio";

export default function AboutMe() {
  const getTechnologyItemOffsetX = (index: number) =>
    index < aboutBehavior.technologyGrid.rowCount
      ? aboutBehavior.technologyItemMotion.leadingColumnOffsetX
      : aboutBehavior.technologyItemMotion.trailingColumnOffsetX;

  return (
    <section id="about" aria-labelledby="about-heading" className="portfolio-section">
      <div className="about-content">
        <motion.h2 
          id="about-heading"
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: aboutBehavior.sectionHeadingMotion.duration }}
        >
          / about me
        </motion.h2>

        <div className="about-layout">
          <div className="about-copy">
            <motion.p 
              className="about-body-copy about-body-spaced"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: aboutBehavior.introMotion.delay,
                duration: aboutBehavior.introMotion.duration,
              }}
              viewport={{ once: true }}
            >
              I am currently a Staff Threat Hunter at SentinelOne, working in ThreatOps on Incident Readiness and Response. My work sits at the intersection of threat hunting, detection engineering, automation, and analyst workflows. These are some of the tools and technologies I have been working with:
            </motion.p>

            <motion.ul 
              aria-label="Technologies"
              role="list"
              className="about-technology-grid"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: aboutBehavior.technologiesMotion.delay,
                duration: aboutBehavior.technologiesMotion.duration,
              }}
              viewport={{ once: true }}
            >
              {aboutContent.technologies.map((tech, index) => (
                <motion.li
                  key={tech}
                  className="about-technology-item"
                  initial={{ opacity: 0, x: getTechnologyItemOffsetX(index) }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    delay:
                      aboutBehavior.technologyItemMotion.baseDelay +
                      (index % aboutBehavior.technologyGrid.rowCount) * aboutBehavior.technologyItemMotion.staggerDelay,
                    duration: aboutBehavior.technologyItemMotion.duration,
                  }}
                  viewport={{ once: true }}
                >
                  <ChevronRight
                    className="about-technology-icon"
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="about-technology-label">{tech}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.p 
              className="about-body-copy"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: aboutBehavior.interestsMotion.delay,
                duration: aboutBehavior.interestsMotion.duration,
              }}
              viewport={{ once: true }}
            >
              Outside of work, I am interested in geopolitics, security research, and how technical systems shape real-world decisions.
            </motion.p>
          </div>

          <motion.div
            className="about-profile-frame"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              delay: aboutBehavior.imageMotion.delay,
              duration: aboutBehavior.imageMotion.duration,
            }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
