import { ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";

// Project data
const projects = [
  {
    title: "Cybersecurity News Aggregator",
    description: "A low-maintenance website that automatically pulls in the day's top cybersecurity stories using GitHub Actions and is easily configurable via a JSON feed list. Hosted on GitHub Pages.",
    technologies: "Technologies: GitHub Actions, GitHub Pages, RSS, JSON, JavaScript",
    repoUrl: "https://github.com/ricomanifesto/SentryDigest",
    demoUrl: "https://ricomanifesto.github.io/SentryDigest/"
  },
  {
    title: "SentryInsight",
    description: "An AI-powered tool that doesn't just collect security news but analyzes it to identify active threats, vulnerabilities, and attack patterns, turning news feeds into actionable threat intelligence.",
    technologies: "Technologies: LangGraph, Model Context Protocol (MCP), LangChain, OpenAI, GitHub Actions, Python",
    repoUrl: "https://github.com/ricomanifesto/SentryInsight",
    demoUrl: "https://ricomanifesto.github.io/SentryInsight/"
  },
  {
    title: "SentrySearch",
    description: "AI-Powered Threat Intelligence Platform. SentrySearch leverages Anthropic's Claude with web search capabilities to generate comprehensive threat intelligence profiles for malware, attack tools, and targeted technologies.",
    technologies: "Technologies: Gradio, Anthropic Web Search, Hugging Face Spaces, Python, Pydantic",
    repoUrl: "https://github.com/ricomanifesto/SentrySearch",
    demoUrl: "https://huggingface.co/spaces/ricomanifesto/SentrySearch"
  }
];

export default function ProjectsSection() {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
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
      
      <motion.div 
        className="grid grid-cols-1 gap-8 max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {projects.map((project, index) => (
          <motion.div 
            key={index} 
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-3">{project.title}</h3>
              <p className="mb-4">
                {project.description}
              </p>
              <p className="text-sm text-secondary mb-5">
                {project.technologies}
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
        ))}
      </motion.div>
    </section>
  );
}