import { motion } from "framer-motion";
import { KeyboardEvent, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { experienceBehavior, experiences } from "../content/portfolio";

export default function Experience() {
  const [selectedCompany, setSelectedCompany] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectCompany = (index: number) => {
    setSelectedCompany(index);
    tabRefs.current[index]?.focus();
  };

  const handleCompanyKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = experiences.length - 1;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      selectCompany(index === lastIndex ? 0 : index + 1);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectCompany(index === 0 ? lastIndex : index - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectCompany(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectCompany(lastIndex);
    }
  };

  return (
    <section id="experience" className="scroll-mt-36 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-12 text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: experienceBehavior.sectionHeadingMotion.duration }}
        >
          / experience
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="lg:w-1/4 flex-shrink-0">
            <div
              role="tablist"
              aria-label="Experience companies"
              aria-orientation="vertical"
              className="space-y-8"
            >
              {experiences.map((exp, index) => (
                <motion.button
                  key={exp.company}
                  id={`experience-tab-${index}`}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={selectedCompany === index}
                  aria-controls={`experience-panel-${index}`}
                  tabIndex={selectedCompany === index ? 0 : -1}
                  onClick={() => selectCompany(index)}
                  onKeyDown={(event) => handleCompanyKeyDown(event, index)}
                  className={`relative w-full text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff] ${
                    selectedCompany === index 
                      ? 'text-[#007bff]' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: experienceBehavior.tabMotion.duration,
                    delay: index * experienceBehavior.tabMotion.staggerDelay,
                  }}
                >
                  <div className={`hidden lg:block absolute left-0 top-0 w-1 h-full transition-all duration-300 ${
                    selectedCompany === index ? 'bg-[#007bff]' : 'bg-transparent'
                  }`}></div>
                  
                  <h3 className="font-medium text-sm lg:text-base tracking-wider lg:pl-4">
                    {exp.company}
                  </h3>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="lg:w-3/4 flex-1">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.company}
                id={`experience-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`experience-tab-${index}`}
                tabIndex={selectedCompany === index ? 0 : -1}
                hidden={selectedCompany !== index}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
                initial={false}
                animate={selectedCompany === index ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: experienceBehavior.panelMotion.duration }}
              >
                <h4 className="text-xl md:text-2xl font-semibold mb-2">
                  {exp.title} @ <span className="text-[#007bff]">{exp.displayCompany}</span>
                </h4>

                <p className="text-gray-400 text-sm md:text-base mb-6 font-medium tracking-wide">
                  {exp.period}
                </p>

                <ul className="space-y-4">
                  {exp.highlights.map((highlight, highlightIndex) => (
                    <motion.li
                      key={highlight}
                      className="flex items-start"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: experienceBehavior.highlightMotion.duration,
                        delay:
                          highlightIndex * experienceBehavior.highlightMotion.staggerDelay +
                          experienceBehavior.highlightMotion.baseDelay,
                      }}
                    >
                      <ChevronRight
                        className="w-4 h-4 mt-1.5 mr-4 flex-shrink-0 text-[#007bff]"
                        aria-hidden="true"
                        focusable="false"
                      />
                      <p className="text-gray-200 leading-relaxed">
                        {highlight}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
