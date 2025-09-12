import { motion } from "framer-motion";

export default function AboutMe() {
  const technologies = [
    "Python",
    "asyncio", 
    "FastAPI",
    "SQLAlchemy",
    "Pydantic",
    "LangGraph"
  ];

  const leftColumn = technologies.slice(0, 3);
  const rightColumn = technologies.slice(3, 6);

  return (
    <section id="about" className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="section-title text-3xl md:text-4xl font-serif font-bold mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          / about me
        </motion.h2>

        <div className="mb-12">
          <motion.p 
            className="text-lg md:text-xl mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            I am currently a Sr. Threat Hunter at SentinelOne, working in the ThreatOps organization under team Incident Readiness and Response. Here are some technologies I have been working with:
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            I am currently a Sr. Threat Hunter at SentinelOne, working in the ThreatOps organization under team Incident Readiness and Response. Here are some technologies I have been working with:
          </motion.p>

          {/* Technologies and Profile Picture */}
          <motion.div 
            className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Technologies Grid */}
            <div className="grid grid-cols-2 gap-8 flex-1">
              {/* Left Column */}
              <div className="space-y-3">
                {leftColumn.map((tech, index) => (
                  <motion.div
                    key={tech}
                    className="flex items-center justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <svg 
                      className="w-4 h-4 text-primary mr-3 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-lg text-gray-700">{tech}</span>
                  </motion.div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {rightColumn.map((tech, index) => (
                  <motion.div
                    key={tech}
                    className="flex items-center justify-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <svg 
                      className="w-4 h-4 text-primary mr-3 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-lg text-gray-700">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Profile Picture */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src="/images/profile.jpg" 
                alt="Michael Rico Profile" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-[50%_35%] border-4 border-primary/20 shadow-lg"
              />
            </motion.div>
          </motion.div>

          {/* Personal Interests */}
          <motion.p 
            className="text-lg md:text-xl leading-relaxed text-gray-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Outside of work I'm interested in keeping tabs on geopolitics and how it shapes our world.
          </motion.p>
        </div>
      </div>
    </section>
  );
}