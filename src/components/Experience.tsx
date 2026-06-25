import { motion } from "framer-motion";
import { KeyboardEvent, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ExperienceItem, experienceBehavior, experiences } from "../content/portfolio";

interface ExperienceTabProps {
  experience: ExperienceItem;
  index: number;
  isSelected: boolean;
  tabRef: (element: HTMLButtonElement | null) => void;
  onSelect: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

export default function Experience() {
  const [selectedCompany, setSelectedCompany] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectCompany = (index: number) => {
    setSelectedCompany(index);
    tabRefs.current[index]?.focus();
  };

  const handleCompanyKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = experiences.length - 1;

    if (experienceBehavior.keyboardNavigationKeys.next.includes(event.key)) {
      event.preventDefault();
      selectCompany(index === lastIndex ? 0 : index + 1);
    }

    if (experienceBehavior.keyboardNavigationKeys.previous.includes(event.key)) {
      event.preventDefault();
      selectCompany(index === 0 ? lastIndex : index - 1);
    }

    if (event.key === experienceBehavior.keyboardNavigationKeys.first) {
      event.preventDefault();
      selectCompany(0);
    }

    if (event.key === experienceBehavior.keyboardNavigationKeys.last) {
      event.preventDefault();
      selectCompany(lastIndex);
    }
  };

  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-36 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          id="experience-heading"
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
                <ExperienceTab
                  key={exp.company}
                  experience={exp}
                  index={index}
                  isSelected={selectedCompany === index}
                  tabRef={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  onSelect={selectCompany}
                  onKeyDown={handleCompanyKeyDown}
                />
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

function ExperienceTab({
  experience,
  index,
  isSelected,
  tabRef,
  onSelect,
  onKeyDown,
}: ExperienceTabProps) {
  return (
    <motion.button
      id={`experience-tab-${index}`}
      ref={tabRef}
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`experience-panel-${index}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onSelect(index)}
      onKeyDown={(event) => onKeyDown(event, index)}
      className={`relative w-full text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff] ${
        isSelected ? 'text-[#007bff]' : 'text-gray-400 hover:text-gray-200'
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
        isSelected ? 'bg-[#007bff]' : 'bg-transparent'
      }`}></div>

      <h3 className="font-medium text-sm lg:text-base tracking-wider lg:pl-4">
        {experience.company}
      </h3>
    </motion.button>
  );
}
