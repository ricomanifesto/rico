import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import { experienceBehavior, experiences } from "../content/portfolio";
import type { ExperienceItem } from "../content/portfolio";

interface ExperienceTabProps {
  experience: ExperienceItem;
  index: number;
  isSelected: boolean;
  tabRef: (element: HTMLButtonElement | null) => void;
  onSelect: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

type ExperienceTabNavigationDirection = "next" | "previous";

interface ExperiencePanelViewState {
  readonly tabIndex: 0 | -1;
  readonly hidden: boolean;
  readonly animate: {
    readonly opacity: number;
    readonly x: number;
  };
}

interface ExperienceTabViewState {
  readonly tabIndex: 0 | -1;
  readonly textClass: string;
  readonly indicatorClass: string;
}

const getWrappedExperienceTabIndex = (
  index: number,
  lastIndex: number,
  direction: ExperienceTabNavigationDirection,
) => {
  if (direction === "next") {
    return index === lastIndex ? 0 : index + 1;
  }

  return index === 0 ? lastIndex : index - 1;
};

const getExperiencePanelViewState = (isSelected: boolean): ExperiencePanelViewState => ({
  tabIndex: isSelected ? 0 : -1,
  hidden: !isSelected,
  animate: isSelected ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 },
});

const getExperienceTabViewState = (isSelected: boolean): ExperienceTabViewState => ({
  tabIndex: isSelected ? 0 : -1,
  textClass: isSelected ? "experience-tab-selected" : "experience-tab-idle",
  indicatorClass: isSelected ? "experience-tab-indicator-selected" : "experience-tab-indicator-idle",
});

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
      selectCompany(getWrappedExperienceTabIndex(index, lastIndex, "next"));
    }

    if (experienceBehavior.keyboardNavigationKeys.previous.includes(event.key)) {
      event.preventDefault();
      selectCompany(getWrappedExperienceTabIndex(index, lastIndex, "previous"));
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
    <section id="experience" aria-labelledby="experience-heading" className="portfolio-section">
      <div className="experience-content">
        <motion.h2 
          id="experience-heading"
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: experienceBehavior.sectionHeadingMotion.duration }}
        >
          / experience
        </motion.h2>

        <div className="experience-layout">
          <div className="experience-tab-column">
            <div
              role="tablist"
              aria-label="Experience companies"
              aria-orientation="vertical"
              className="experience-tab-list"
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

          <div className="experience-panel-column">
            {experiences.map((exp, index) => {
              const panelViewState = getExperiencePanelViewState(selectedCompany === index);

              return (
                <motion.div
                  key={exp.company}
                  id={`experience-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`experience-tab-${index}`}
                  tabIndex={panelViewState.tabIndex}
                  hidden={panelViewState.hidden}
                  className="experience-panel"
                  initial={false}
                  animate={panelViewState.animate}
                  transition={{ duration: experienceBehavior.panelMotion.duration }}
                >
                  <h4 className="experience-panel-title">
                    {exp.title} @ <span className="experience-company-accent">{exp.displayCompany}</span>
                  </h4>

                  <p className="experience-period">
                    {exp.period}
                  </p>

                  <ul className="experience-highlight-list">
                    {exp.highlights.map((highlight, highlightIndex) => (
                      <motion.li
                        key={highlight}
                        className="experience-highlight"
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
                          className="experience-highlight-icon"
                          aria-hidden="true"
                          focusable="false"
                        />
                        <p className="experience-highlight-copy">
                          {highlight}
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
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
  const tabViewState = getExperienceTabViewState(isSelected);

  return (
    <motion.button
      id={`experience-tab-${index}`}
      ref={tabRef}
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`experience-panel-${index}`}
      tabIndex={tabViewState.tabIndex}
      onClick={() => onSelect(index)}
      onKeyDown={(event) => onKeyDown(event, index)}
      className={`experience-tab ${tabViewState.textClass}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: experienceBehavior.tabMotion.duration,
        delay: index * experienceBehavior.tabMotion.staggerDelay,
      }}
    >
      <div className={`experience-tab-indicator ${tabViewState.indicatorClass}`}></div>

      <h3 className="font-medium text-sm lg:text-base tracking-wider lg:pl-4">
        {experience.company}
      </h3>
    </motion.button>
  );
}
