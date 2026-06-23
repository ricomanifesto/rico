import { useState, useEffect } from "react";
import NetworkAnimation from "./NetworkAnimation";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { heroBehavior, heroContent } from "../content/hero";
import { contactLink } from "../content/navigation";

export default function IntroSection() {
  const shouldReduceMotion = usePrefersReducedMotion();
  const [displayText, setDisplayText] = useState(shouldReduceMotion ? heroContent.headline : "");

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayText(heroContent.headline);
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= heroContent.headline.length) {
        setDisplayText(heroContent.headline.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, heroBehavior.typewriterIntervalMs);
    
    return () => clearInterval(typingInterval);
  }, [shouldReduceMotion]);
  
  return (
    <section id="intro" className="relative flex flex-col items-center justify-center min-h-[80vh] text-center pt-36 px-4 overflow-hidden bg-slate-900 text-white md:pt-16">
      <div className="network-grid absolute top-0 left-0 w-full h-full pointer-events-none z-0"></div>
      
      <NetworkAnimation />
      
      <motion.div 
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
          <span className="inline-flex items-center text-[#007bff]">
            {displayText}
            <span className="animate-blink ml-1 h-8 w-2 inline-block bg-[#007bff]"></span>
          </span>
        </h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {heroContent.subtitle}
        </motion.p>

        
        <motion.p 
          className="max-w-2xl text-lg md:text-xl mb-12 mx-auto text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {heroContent.body}
        </motion.p>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <a 
            href={contactLink.href}
            className="inline-flex items-center px-6 py-3 border-2 border-[#007bff80] rounded-xl bg-transparent text-[#007bff] transition-all duration-300 hover:scale-105 hover:border-[#007bff] hover:bg-[#007bff1a] hover:text-[#0056b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
          >
            <Mail className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" />
            {heroContent.ctaLabel}
          </a>
        </motion.div>
        
      </motion.div>
    </section>
  );
}
