import { motion } from "framer-motion";

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
        "Fill me in",
        "Fill me in"
      ]
    },
    {
      company: "UBER",
      title: "Threat Detection Engineer II",
      period: "OCTOBER 2023 - JULY 2024",
      highlights: [
        "Fill me in",
        "Fill me in"
      ]
    },
    {
      company: "DELL SECUREWORKS",
      title: "Information Security Researcher",
      period: "AUGUST 2013 - AUGUST 2023",
      highlights: [
        "Fill me in",
        "Fill me in"
      ]
    }
  ];

  return (
    <section id="experience" className="py-16 px-4 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-12 text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          / experience
        </motion.h2>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="flex flex-col lg:flex-row gap-8 lg:gap-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Company Names Timeline */}
              <div className="lg:w-1/4 flex-shrink-0">
                <div className="relative">
                  {/* Timeline Line */}
                  {index < experiences.length - 1 && (
                    <div className="hidden lg:block absolute left-0 top-8 w-px h-24 bg-gradient-to-b from-cyan-400 to-transparent opacity-30"></div>
                  )}
                  
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute -left-2 top-6 w-4 h-4 bg-cyan-400 rounded-full"></div>
                  
                  {/* Company Name */}
                  <h3 className="text-gray-300 font-medium text-sm lg:text-base tracking-wider lg:pl-6">
                    {exp.company}
                  </h3>
                </div>
              </div>

              {/* Experience Details */}
              <div className="lg:w-3/4 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.1 }}
                >
                  <h4 className="text-xl md:text-2xl font-semibold mb-2">
                    {exp.title} @ <span className="text-cyan-400">{exp.company.charAt(0) + exp.company.slice(1).toLowerCase()}</span>
                  </h4>
                  
                  <p className="text-gray-400 text-sm md:text-base mb-6 font-medium tracking-wide">
                    {exp.period}
                  </p>

                  <ul className="space-y-4">
                    {exp.highlights.map((highlight, highlightIndex) => (
                      <motion.li
                        key={highlightIndex}
                        className="flex items-start"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.2 + highlightIndex * 0.1 + 0.3 
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}