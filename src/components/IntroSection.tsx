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
    <section id="intro" className="relative flex flex-col items-center justify-center min-h-[80vh] text-center pt-16 px-4 overflow-hidden bg-slate-900 text-white">
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
          <span className="text-cyan-400 inline-flex items-center">
            {displayText}
            <span className="animate-blink ml-1 h-8 w-2 bg-cyan-400 inline-block"></span>
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

        
        <motion.p 
          className="max-w-2xl text-lg md:text-xl mb-10 mx-auto text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          I'm a Sr. Threat Hunter from Chicago, Illinois. I'm passionate about sharpening my skills in high-stake environments. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable.
        </motion.p>
        
      </motion.div>
    </section>
  );
}
