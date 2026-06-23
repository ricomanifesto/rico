import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { projects } from "../content/portfolio";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCarouselFocus, setHasCarouselFocus] = useState(false);
  const [hasCarouselHover, setHasCarouselHover] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();
  const shouldAnnounceCarouselStatus = shouldReduceMotion || hasCarouselFocus || hasCarouselHover;

  useEffect(() => {
    if (shouldReduceMotion || hasCarouselFocus || hasCarouselHover) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex, hasCarouselFocus, hasCarouselHover, shouldReduceMotion]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  return (
    <section id="projects" className="scroll-mt-36 py-16 px-4 bg-slate-900 text-white md:scroll-mt-20">
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
      
      <div
        role="region"
        aria-label="Featured projects"
        aria-roledescription="carousel"
        className="relative"
        onMouseEnter={() => setHasCarouselHover(true)}
        onMouseLeave={() => setHasCarouselHover(false)}
        onFocusCapture={() => setHasCarouselFocus(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHasCarouselFocus(false);
          }
        }}
      >
        <div
          role="status"
          aria-label="Current project"
          aria-live={shouldAnnounceCarouselStatus ? "polite" : "off"}
          aria-atomic="true"
          className="sr-only"
        >
          {`Project ${currentIndex + 1} of ${projects.length}: ${projects[currentIndex].title}`}
        </div>
        <div className="overflow-hidden">
          <motion.div 
            className="flex transition-transform duration-500 ease-in-out"
            animate={shouldReduceMotion ? undefined : { x: `${-currentIndex * 100}%` }}
            style={shouldReduceMotion ? { transform: `translateX(${-currentIndex * 100}%)` } : undefined}
          >
            {projects.map((project, index) => (
              <div
                key={project.title}
                role="group"
                aria-roledescription="slide"
                aria-hidden={index !== currentIndex}
                aria-label={`${project.title}, project slide ${index + 1} of ${projects.length}`}
                className="w-full flex-shrink-0"
              >
                <motion.div 
                  className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 mx-4 h-96"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                >
                  {project.image?.decorative ? (
                    <div className="absolute inset-0">
                      <img 
                        src={project.image.src} 
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.bgGradient} opacity-90`}></div>
                  )}
                  
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="bg-black/60 backdrop-blur-sm p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="text-xs font-semibold tracking-wider mb-4 text-[#66b3ff]">
                        {project.techStack.join(", ")}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} repository`}
                           tabIndex={index === currentIndex ? 0 : -1}
                           className="inline-flex min-h-11 min-w-11 items-center justify-center text-white transition duration-300 hover:scale-110 hover:text-[#66b3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]">
                          <Github size={24} aria-hidden="true" focusable="false" />
                        </a>
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} demo`}
                             tabIndex={index === currentIndex ? 0 : -1}
                             className="inline-flex min-h-11 min-w-11 items-center justify-center text-white transition duration-300 hover:scale-110 hover:text-[#66b3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]">
                            <ExternalLink size={24} aria-hidden="true" focusable="false" />
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

        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 bg-slate-600 border border-gray-500 rounded-full p-3 md:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
          aria-label="Previous project"
        >
          <ChevronLeft size={24} className="text-[#007bff]" aria-hidden="true" focusable="false" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 bg-slate-600 border border-gray-500 rounded-full p-3 md:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
          aria-label="Next project"
        >
          <ChevronRight size={24} className="text-[#007bff]" aria-hidden="true" focusable="false" />
        </button>

        <div className="flex justify-center mt-6 space-x-2">
          {projects.map((project, index) => (
            <button
              key={project.title}
              onClick={() => setCurrentIndex(index)}
              className="group flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
              aria-label={`Show ${project.title}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <span
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'scale-110 bg-[#007bff]' : 'bg-gray-500 group-hover:bg-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
