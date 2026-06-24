import { useState, useEffect } from "react";
import NetworkAnimation from "./NetworkAnimation";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { heroBehavior, heroContent } from "../content/hero";
import { contactLink } from "../content/navigation";

const heroVisualViewportQuery = "(min-width: 768px) and (min-height: 640px)";
const compactLandscapeHeroViewportQuery = "(min-width: 768px) and (max-height: 639px)";

function canShowHeroVisual(hasRoomyHeroViewport: boolean, shouldReduceMotion: boolean) {
  return hasRoomyHeroViewport && !shouldReduceMotion;
}

export default function IntroSection() {
  const shouldReduceMotion = usePrefersReducedMotion();
  const hasRoomyHeroViewport = useMediaQuery(heroVisualViewportQuery);
  const hasCompactLandscapeHeroViewport = useMediaQuery(compactLandscapeHeroViewportQuery);
  const showHeroVisual = canShowHeroVisual(hasRoomyHeroViewport, shouldReduceMotion);
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
    <section
      id="intro"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-slate-900 px-4 pt-36 text-center text-white md:px-8 md:pt-16"
      style={hasCompactLandscapeHeroViewport ? { paddingTop: "4.5rem" } : undefined}
    >
      <div className="network-grid absolute top-0 left-0 w-full h-full pointer-events-none z-0"></div>

      <motion.div
        className={`relative z-10 mx-auto grid w-full items-center gap-6 md:gap-10 ${
          showHeroVisual
            ? "max-w-6xl md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] md:text-left"
            : "max-w-3xl"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: heroBehavior.containerMotion.duration, ease: heroBehavior.containerMotion.ease }}
      >
        {showHeroVisual ? (
          <div
            aria-hidden="true"
            data-testid="hero-visual"
            className="relative mx-auto hidden w-full max-w-sm overflow-hidden md:block md:h-[28rem] md:max-w-none"
          >
            <NetworkAnimation />
          </div>
        ) : null}

        <div data-testid="hero-copy" className={`mx-auto max-w-2xl ${showHeroVisual ? "md:mx-0" : ""}`}>
          <h1 className={`mb-4 font-mono text-4xl font-bold ${hasRoomyHeroViewport ? "md:text-6xl" : ""}`}>
            <span className="inline-flex items-center text-[#007bff]">
              {displayText}
              <span aria-hidden="true" className="animate-blink ml-1 inline-block h-8 w-2 bg-[#007bff]"></span>
            </span>
          </h1>
          <motion.p
            className={`${hasCompactLandscapeHeroViewport ? "mb-3" : "mb-8"} text-xl ${
              hasRoomyHeroViewport ? "md:text-2xl" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: heroBehavior.subtitleMotion.delay, duration: heroBehavior.subtitleMotion.duration }}
          >
            {heroContent.subtitle}
          </motion.p>

          <motion.p
            className={`mx-auto max-w-2xl text-lg text-gray-200 md:mx-0 ${
              hasCompactLandscapeHeroViewport ? "mb-3" : "mb-12"
            } ${
              hasRoomyHeroViewport ? "md:text-xl" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: heroBehavior.bodyMotion.delay, duration: heroBehavior.bodyMotion.duration }}
          >
            {heroContent.body}
          </motion.p>

          <motion.div
            className={`flex justify-center ${showHeroVisual ? "md:justify-start" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: heroBehavior.ctaMotion.delay, duration: heroBehavior.ctaMotion.duration }}
          >
            <a
              href={contactLink.href}
              className="inline-flex items-center px-6 py-3 border-2 border-[#007bff80] rounded-xl bg-transparent text-[#007bff] transition-all duration-300 hover:scale-105 hover:border-[#007bff] hover:bg-[#007bff1a] hover:text-[#0056b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
            >
              <Mail className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" />
              {heroContent.ctaLabel}
            </a>
          </motion.div>
        </div>
        
      </motion.div>
    </section>
  );
}
