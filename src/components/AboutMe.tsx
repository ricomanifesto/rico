import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { aboutBehavior, aboutContent } from "../content/portfolio";

export default function AboutMe() {
  const getTechnologyItemOffsetX = (index: number) =>
    index < aboutBehavior.technologyGrid.rowCount
      ? aboutBehavior.technologyItemMotion.leadingColumnOffsetX
      : aboutBehavior.technologyItemMotion.trailingColumnOffsetX;

  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-36 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          id="about-heading"
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-8 text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: aboutBehavior.sectionHeadingMotion.duration }}
        >
          / about me
        </motion.h2>

        <div className="mb-12 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <motion.p 
              className="text-lg md:text-xl mb-8 leading-relaxed text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: aboutBehavior.introMotion.delay,
                duration: aboutBehavior.introMotion.duration,
              }}
              viewport={{ once: true }}
            >
              I am currently a Staff Threat Hunter at SentinelOne, working in the ThreatOps organization under team Incident Readiness and Response. Here are some technologies I have been working with:
            </motion.p>

            <motion.ul 
              aria-label="Technologies"
              role="list"
              className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-8 gap-y-3 mb-8"
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
                  className="flex items-center justify-start"
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
                    className="w-4 h-4 mr-3 flex-shrink-0 text-[#007bff]"
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="text-lg text-gray-200">{tech}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.p 
              className="text-lg md:text-xl leading-relaxed text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{
                delay: aboutBehavior.interestsMotion.delay,
                duration: aboutBehavior.interestsMotion.duration,
              }}
              viewport={{ once: true }}
            >
              Outside of work I'm interested in keeping tabs on geopolitics and how it shapes our world.
            </motion.p>
          </div>

          <motion.div
            className="flex-shrink-0 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              delay: aboutBehavior.imageMotion.delay,
              duration: aboutBehavior.imageMotion.duration,
            }}
            viewport={{ once: true }}
          >
            <img 
              src="/images/profile.jpg" 
              width="369"
              height="800"
              alt="Michael Rico Profile" 
              loading="lazy"
              decoding="async"
              className="about-profile-surface h-40 w-40 object-cover object-[50%_35%] md:h-48 md:w-48"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
