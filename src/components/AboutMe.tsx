import { motion } from "framer-motion";

export default function AboutMe() {
  const technologies = [
    "Python",
    "Next.js",
    "FastAPI",
    "Go",
    "scikit-learn",
    "LangGraph"
  ];

  return (
    <section id="about" className="scroll-mt-36 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-8 text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          / about me
        </motion.h2>

        <div className="mb-12 flex flex-col md:flex-row gap-8">
          {/* Content Section */}
          <div className="flex-1">
            <motion.p 
              className="text-lg md:text-xl mb-8 leading-relaxed text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              I am currently a Staff Threat Hunter at SentinelOne, working in the ThreatOps organization under team Incident Readiness and Response. Here are some technologies I have been working with:
            </motion.p>

            {/* Technologies Grid */}
            <motion.ul 
              aria-label="Technologies"
              role="list"
              className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              {technologies.map((tech, index) => (
                <motion.li
                  key={tech}
                  className="flex items-center justify-start"
                  initial={{ opacity: 0, x: index < 3 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index % 3) * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <svg
                    className="w-4 h-4 mr-3 flex-shrink-0 text-[#007bff]"
                    aria-hidden="true"
                    focusable="false"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-lg text-gray-200">{tech}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Personal Interests */}
            <motion.p 
              className="text-lg md:text-xl leading-relaxed text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              viewport={{ once: true }}
            >
              Outside of work I'm interested in keeping tabs on geopolitics and how it shapes our world.
            </motion.p>
          </div>

          {/* Profile Picture - Right Aligned */}
          <motion.div
            className="flex-shrink-0 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src="/images/profile.jpg" 
              alt="Michael Rico Profile" 
              loading="lazy"
              decoding="async"
              className="w-40 h-40 md:w-48 md:h-48 object-cover object-[50%_35%] border-4 border-[#007bff33] shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
