import { motion } from "framer-motion";
import { KeyboardEvent, useRef, useState } from "react";
import { experiences } from "../content/portfolio";

export default function Experience() {
  const [selectedCompany, setSelectedCompany] = useState(0); // Default to SentinelOne
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentExperience = experiences[selectedCompany];

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
    <section id="experience" className="scroll-mt-28 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-12 text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          / experience
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Company Selection Timeline */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div
              role="tablist"
              aria-label="Experience companies"
              className="space-y-8"
            >
              {experiences.map((exp, index) => (
                <motion.button
                  key={index}
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
                  className={`relative w-full text-left transition-all duration-300 ${
                    selectedCompany === index 
                      ? '' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={selectedCompany === index ? {color: '#007bff'} : {}}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Selection Bar */}
                  <div className={`hidden lg:block absolute left-0 top-0 w-1 h-full transition-all duration-300 ${
                    selectedCompany === index ? '' : 'bg-transparent'
                  }}" style={selectedCompany === index ? {backgroundColor: '#007bff'} : {}}
                  }`}></div>
                  
                  {/* Company Name */}
                  <h3 className="font-medium text-sm lg:text-base tracking-wider lg:pl-4">
                    {exp.company}
                  </h3>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Experience Details */}
          <div className="lg:w-3/4 flex-1">
            <motion.div
              key={selectedCompany}
              id={`experience-panel-${selectedCompany}`}
              role="tabpanel"
              aria-labelledby={`experience-tab-${selectedCompany}`}
              tabIndex={0}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-xl md:text-2xl font-semibold mb-2">
                {currentExperience.title} @ <span style={{color: '#007bff'}}>{currentExperience.displayCompany}</span>
              </h4>
              
              <p className="text-gray-400 text-sm md:text-base mb-6 font-medium tracking-wide">
                {currentExperience.period}
              </p>

              <ul className="space-y-4">
                {currentExperience.highlights.map((highlight, highlightIndex) => (
                  <motion.li
                    key={highlightIndex}
                    className="flex items-start"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: highlightIndex * 0.1 + 0.2 
                    }}
                  >
                    <svg 
                      className="w-4 h-4 mt-1.5 mr-4 flex-shrink-0" style={{color: '#007bff'}} 
                      aria-hidden="true"
                      focusable="false"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <p className="text-gray-200 leading-relaxed">
                      {highlight}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
