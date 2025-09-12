import { useState, useEffect } from "react";
import NetworkAnimation from "./NetworkAnimation";
import { motion } from "framer-motion";

export default function IntroSection() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Hi, I'm Rico";
  const typingSpeed = 150; // milliseconds per character
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  return (
    <section id="intro" className="relative flex flex-col items-center justify-center min-h-[80vh] text-center pt-16 px-4 overflow-hidden">
      {/* Network Grid Animation Background */}
      <div className="network-grid absolute top-0 left-0 w-full h-full pointer-events-none z-0"></div>
      
      {/* Animated Nodes & Connections */}
      <NetworkAnimation />
      
      {/* Hero Content with Animation */}
      <motion.div 
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
          <span className="text-primary inline-flex items-center">
            {displayText}
            <span className="animate-blink ml-1 h-8 w-2 bg-primary inline-block"></span>
          </span>
        </h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          I build things when inspiration strikes.
        </motion.p>

        {/* Profile Image */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <img 
            src="/images/profile.jpg" 
            alt="Michael Rico Profile" 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-cover object-top border-4 border-primary/20 shadow-lg"
          />
        </motion.div>
        
        <motion.p 
          className="max-w-2xl text-lg md:text-xl mb-10 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          I'm a Sr. Threat Hunter from Chicago, Illinois. I'm passionate about sharpening my skills in high-stake environments. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable.
        </motion.p>
        
        {/* Social Links */}
        <motion.div 
          className="flex justify-center space-x-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <a href="https://github.com/ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="GitHub" 
             className="text-primary hover:text-secondary transition duration-300 transform hover:-translate-y-1 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.44-1-3.46 0 0-1.02-.35-3.36 1.38A13.37 13.37 0 0 0 9 3c-1.03 0-2.14.15-3.36.87C2.35 4.96 1.33 5.31 1.33 5.31A4.8 4.8 0 0 0 0 8.8c0 3.5 3 5.5 6 5.5-.39 1.39-.72 2.69-.72 4.2V22"></path>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/michael-rico-19600314a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" 
             className="text-primary hover:text-secondary transition duration-300 transform hover:-translate-y-1 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect width="4" height="12" x="2" y="9"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <a href="https://medium.com/@ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="Medium" 
             className="text-primary hover:text-secondary transition duration-300 transform hover:-translate-y-1 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.17 6.6L9.33 20.83M5.5 19.5l-2-2M19.5 4.5l2 2M12.08 12.08l-1.5-1.5M10 5l-2 2M14 17l2-2"></path>
            </svg>
          </a>
          <a href="mailto:michaelrico124@gmail.com" aria-label="Email" 
             className="text-primary hover:text-secondary transition duration-300 transform hover:-translate-y-1 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
