import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Project data
const projects = [
  {
    title: "AI-Powered Threat Intelligence Platform",
    description: "Leverages Anthropic's Claude with web search capabilities to generate comprehensive threat intelligence profiles for malware, attack tools, and targeted technologies.",
    repoUrl: "https://github.com/ricomanifesto/SentrySearch",
    demoUrl: "https://sentry-search.vercel.app/"
  },
  {
    title: "Cybersecurity News Aggregator",
    description: "A low-maintenance website that automatically pulls in the day's top cybersecurity stories using GitHub Actions.",
    repoUrl: "https://github.com/ricomanifesto/SentryDigest",
    demoUrl: "https://ricomanifesto.github.io/SentryDigest/"
  },
  {
    title: "Cybersecurity Exploit Reporter",
    description: "An AI-powered tool that doesn't just collect security news but analyzes it to identify active threats, vulnerabilities, and attack patterns, turning news feeds into actionable threat intelligence.",
    repoUrl: "https://github.com/ricomanifesto/SentryInsight",
    demoUrl: "https://ricomanifesto.github.io/SentryInsight/"
  },
  {
    title: "Cybersecurity GRC Reporter",
    description: "Automated governance, risk & compliance intelligence that monitors RSS feeds and generates GRC reports using AI analysis.",
    repoUrl: "https://github.com/ricomanifesto/GRCInsight",
    demoUrl: "https://ricomanifesto.github.io/GRCInsight/"
  }
];

export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  return (
    <section id="projects" className="pt-0 pb-16 px-4 max-w-4xl mx-auto">
      <motion.h2 
        className="section-title text-3xl md:text-4xl font-serif font-bold mb-8"
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
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary mb-3">{project.title}</h3>
                    <p className="mb-6">
                      {project.description}
                    </p>
                    <div className="flex items-center">
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center text-primary hover:text-secondary transition duration-300 hover:scale-105">
                        <Github className="mr-2" size={20} />
                        GitHub Repo
                      </a>
                      
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center text-primary hover:text-secondary transition duration-300 ml-5 hover:scale-105">
                          <ExternalLink className="mr-2" size={20} />
                          Live Demo
                        </a>
                      )}
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
          aria-label="Previous project"
        >
          <ChevronLeft size={24} className="text-primary" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
          aria-label="Next project"
        >
          <ChevronRight size={24} className="text-primary" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-110' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}