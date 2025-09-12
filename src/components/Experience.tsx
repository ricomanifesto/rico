import { motion } from "framer-motion";
import { useState } from "react";

interface ExperienceItem {
  company: string;
  title: string;
  period: string;
  highlights: string[];
}

export default function Experience() {
  const experiences: ExperienceItem[] = [
    {
      company: "SENTINELONE",
      title: "Sr. Threat Hunter",
      period: "DECEMBER 2024 - PRESENT",
      highlights: [
        "Conduct proactive threat hunting services",
        "Build, evolve, and expand hunting tooling, techniques and use-cases"
      ]
    },
    {
      company: "UBER",
      title: "Threat Detection Engineer II",
      period: "OCTOBER 2023 - JULY 2024",
      highlights: [
        "Used big data and real-time streaming technologies to build and refine threat detections",
        "Built mechanisms that combined multiple detection signals to create higher fidelity threat detections"
      ]
    },
    {
      company: "DELL SECUREWORKS",
      title: "Information Security Researcher",
      period: "AUGUST 2013 - AUGUST 2023",
      highlights: [
        "Tracked threat actors and analyzed anomalous activity, uncovering new attack techniques and threats",
        "Wrote and deployed new countermeasures rapidly"
      ]
    }
  ];

  const [selectedCompany, setSelectedCompany] = useState(0); // Default to SentinelOne
  const currentExperience = experiences[selectedCompany];

  return (
    <section id="experience" className="py-16 px-4 bg-slate-900 text-white">
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
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedCompany(index)}
                  className={`relative w-full text-left transition-all duration-300 ${
                    selectedCompany === index 
                      ? 'text-cyan-400' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Selection Bar */}
                  <div className={`hidden lg:block absolute left-0 top-0 w-1 h-full transition-all duration-300 ${
                    selectedCompany === index ? 'bg-cyan-400' : 'bg-transparent'
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-xl md:text-2xl font-semibold mb-2">
                {currentExperience.title} @ <span className="text-cyan-400">
                  {currentExperience.company === "SENTINELONE" ? "SentinelOne" : 
                   currentExperience.company === "DELL SECUREWORKS" ? "Dell SecureWorks" : 
                   currentExperience.company.charAt(0) + currentExperience.company.slice(1).toLowerCase()}
                </span>
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
                      className="w-4 h-4 text-cyan-400 mt-1.5 mr-4 flex-shrink-0" 
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