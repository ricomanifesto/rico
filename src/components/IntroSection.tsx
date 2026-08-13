import SignalAnimation from "./SignalAnimation";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { heroBehavior, heroContent } from "../content/hero";
import { contactLink } from "../content/navigation";

export default function IntroSection() {
  const hasRoomyHeroViewport = useMediaQuery(heroBehavior.roomyVisualViewportQuery);
  const hasCompactLandscapeHeroViewport = useMediaQuery(heroBehavior.compactLandscapeViewportQuery);
  const hasCompactLandscapeNarrowViewport = useMediaQuery(heroBehavior.compactLandscapeNarrowViewportQuery);
  const showHeroVisual = hasRoomyHeroViewport;
  const compactLandscapePaddingTop = hasCompactLandscapeNarrowViewport
    ? heroBehavior.compactLandscapeNarrowPaddingTop
    : heroBehavior.compactLandscapePaddingTop;
  return (
    <section
      id="intro"
      className="hero-section"
      style={hasCompactLandscapeHeroViewport ? { paddingTop: compactLandscapePaddingTop } : undefined}
    >
      <div className="network-grid absolute top-0 left-0 w-full h-full pointer-events-none z-0"></div>

      <motion.div
        className={`hero-content ${
          showHeroVisual
            ? "hero-content-with-visual"
            : "hero-content-centered"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: heroBehavior.containerMotion.duration, ease: heroBehavior.containerMotion.ease }}
      >
        {showHeroVisual ? (
          <div
            aria-hidden="true"
            data-testid="hero-visual"
            className="hero-visual"
          >
            <SignalAnimation />
          </div>
        ) : null}

        <div data-testid="hero-copy" className={`hero-copy ${showHeroVisual ? "hero-copy-with-visual" : ""}`}>
          <h1 className={`hero-headline ${hasRoomyHeroViewport ? "hero-headline-roomy" : ""}`}>
            <span className="hero-headline-accent">
              {heroContent.headline}
            </span>
          </h1>
          <motion.p
            className={`hero-subtitle ${hasCompactLandscapeHeroViewport ? "hero-copy-compact" : "hero-copy-spacious"} ${
              hasRoomyHeroViewport ? "hero-subtitle-roomy" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: heroBehavior.subtitleMotion.delay, duration: heroBehavior.subtitleMotion.duration }}
          >
            {heroContent.subtitle}
          </motion.p>

          <motion.p
            className={`hero-body ${
              hasCompactLandscapeHeroViewport ? "hero-copy-compact" : "hero-copy-spacious"
            } ${
              hasRoomyHeroViewport ? "hero-body-roomy" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: heroBehavior.bodyMotion.delay, duration: heroBehavior.bodyMotion.duration }}
          >
            {heroContent.body}
          </motion.p>

          <motion.div
            className={`hero-cta-row ${showHeroVisual ? "hero-cta-row-with-visual" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: heroBehavior.ctaMotion.delay, duration: heroBehavior.ctaMotion.duration }}
          >
            <a
              href={contactLink.href}
              className="hero-cta-link"
            >
              <Mail className="h-5 w-5" aria-hidden="true" focusable="false" />
              {heroContent.ctaLabel}
            </a>
          </motion.div>
        </div>
        
      </motion.div>
    </section>
  );
}
