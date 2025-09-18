import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Project data
const projects = [
  {
    title: "AI-Powered Threat Intelligence Platform",
    description: "Leverages Anthropic's Claude with web search capabilities to generate comprehensive threat intelligence profiles for malware, attack tools, and targeted technologies.",
    tech: "PYTHON, FASTAPI, PYDANTIC",
    repoUrl: "https://github.com/ricomanifesto/SentrySearch",
    demoUrl: "https://sentry-search.vercel.app/",
    bgGradient: "from-purple-600 via-blue-600 to-cyan-600",
    bgImage: "/images/SentrySearch.jpg"
  },
  {
    title: "Cybersecurity News Aggregator",
    description: "A low-maintenance website that automatically pulls in the day's top cybersecurity stories using GitHub Actions.",
    tech: "NODE.JS (COMMONJS)",
    repoUrl: "https://github.com/ricomanifesto/SentryDigest",
    demoUrl: "https://ricomanifesto.github.io/SentryDigest/",
    bgGradient: "from-green-600 via-teal-600 to-blue-600",
    bgImage: "/images/SentryDigest.jpg"
  },
  {
    title: "Cybersecurity Exploit Reporter",
    description: "An AI-powered tool that doesn't just collect security news but analyzes it to identify active threats, vulnerabilities, and attack patterns, turning news feeds into actionable threat intelligence.",
    tech: "PYTHON, ASYNCIO, LANGGRAPH, MCP",
    repoUrl: "https://github.com/ricomanifesto/SentryInsight",
    demoUrl: "https://ricomanifesto.github.io/SentryInsight/",
    bgGradient: "from-red-600 via-pink-600 to-purple-600",
    bgImage: "/images/SentryInsight.jpg"
  },
  {
    title: "Cybersecurity GRC Reporter",
    description: "Automated governance, risk & compliance intelligence that monitors RSS feeds and generates GRC reports using AI analysis.",
    tech: "GO, PYTHON, LANGGRAPH, FASTAPI",
    repoUrl: "https://github.com/ricomanifesto/GRCInsight",
    demoUrl: "https://ricomanifesto.github.io/GRCInsight/",
    bgGradient: "from-orange-600 via-red-600 to-pink-600",
    bgImage: "/images/GRCInsight.jpg"
  }
];

export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation every 10 seconds with reset capability
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex]); // Reset timer when currentIndex changes

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  return (
    <section id="projects" className="py-16 px-4 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
      <motion.h2 
        className="section-title text-3xl md:text-4xl font-serif font-bold mb-8 text-white"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        / projects
      </motion.h2>
      
      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <motion.div 
            className="flex transition-transform duration-500 ease-in-out"
            animate={{ x: `${-currentIndex * 100}%` }}
          >
            {projects.map((project, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <motion.div 
                  className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 mx-4 h-96"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Background */}
                  {project.bgImage ? (
                    <div className="absolute inset-0">
                      <img 
                        src={project.bgImage} 
                        alt={`${project.title} preview`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.bgGradient} opacity-90`}></div>
                  )}
                  
                  {/* Abstract Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute bottom-20 right-16 w-24 h-24 rounded-full bg-white/15 blur-lg"></div>
                    <div className="absolute top-1/3 right-8 w-16 h-16 rounded-full bg-white/10 blur-md"></div>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="bg-black/60 backdrop-blur-sm p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="text-xs font-semibold tracking-wider mb-4" style={{color: '#66b3ff'}}>
                        {project.tech}
                      </div>
                      
                      {/* Icons */}
                      <div className="flex items-center space-x-4">
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                           className="text-white transition duration-300 hover:scale-110" onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#66b3ff'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'white'}>
                          <Github size={24} />
                        </a>
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                             className="text-white transition duration-300 hover:scale-110" onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#66b3ff'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'white'}>
                            <ExternalLink size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-slate-600 border border-gray-500 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-500"
          aria-label="Previous project"
        >
          <ChevronLeft size={24} style={{color: '#007bff'}} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-slate-600 border border-gray-500 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-500"
          aria-label="Next project"
        >
          <ChevronRight size={24} style={{color: '#007bff'}} />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'scale-110' : 'bg-gray-500 hover:bg-gray-400'
              }`}
              style={index === currentIndex ? {backgroundColor: '#007bff'} : {}}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}