import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ProjectActionLink as ProjectActionLinkData, projectActionLinkBehavior, projectCarouselBehavior, projects } from "../content/portfolio";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type ProjectActionLinkKind = "repository" | "demo";
type ProjectCarouselArrowDirection = "previous" | "next";

interface ProjectActionLinkProps {
  kind: ProjectActionLinkKind;
  link: ProjectActionLinkData;
  projectTitle: string;
  isActive: boolean;
  actionRef?: (element: HTMLAnchorElement | null) => void;
}

interface ProjectCarouselArrowButtonProps {
  direction: ProjectCarouselArrowDirection;
  label: string;
  onClick: () => void;
  onKeyboardActivate: () => number;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, activate: () => number) => void;
  onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

interface ProjectActionMetadata {
  readonly Icon: LucideIcon;
  readonly getLabel: (projectTitle: string) => string;
}

interface ProjectActionLinkAnchorBehavior {
  readonly target?: "_blank";
  readonly rel?: "noopener noreferrer";
}

interface ProjectCarouselArrowMetadata {
  readonly Icon: LucideIcon;
  readonly positionClass: string;
}

interface ProjectCarouselDotViewState {
  readonly ariaCurrent?: "true";
  readonly className: string;
}

const projectActionMetadata: Record<ProjectActionLinkKind, ProjectActionMetadata> = {
  repository: {
    Icon: Github,
    getLabel: (projectTitle) => `View ${projectTitle} repository`,
  },
  demo: {
    Icon: ExternalLink,
    getLabel: (projectTitle) => `Open ${projectTitle} demo`,
  },
};

const projectCarouselArrowMetadata: Record<ProjectCarouselArrowDirection, ProjectCarouselArrowMetadata> = {
  previous: {
    Icon: ChevronLeft,
    positionClass: "project-carousel-arrow-previous",
  },
  next: {
    Icon: ChevronRight,
    positionClass: "project-carousel-arrow-next",
  },
};

const getProjectCarouselDotViewState = (isCurrent: boolean): ProjectCarouselDotViewState => ({
  ariaCurrent: isCurrent ? "true" : undefined,
  className: isCurrent ? "project-carousel-dot-marker-current" : "project-carousel-dot-marker-idle",
});

const getProjectActionLinkAnchorBehavior = (
  isExternal: boolean,
): ProjectActionLinkAnchorBehavior => ({
  target: isExternal ? projectActionLinkBehavior.externalTarget : undefined,
  rel: isExternal ? projectActionLinkBehavior.externalRel : undefined,
});

export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCarouselFocus, setHasCarouselFocus] = useState(false);
  const [hasCarouselHover, setHasCarouselHover] = useState(false);
  const activeActionRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const pendingFocusIndexRef = useRef<number | null>(null);
  const shouldReduceMotion = usePrefersReducedMotion();
  const shouldAnnounceCarouselStatus = shouldReduceMotion || hasCarouselFocus || hasCarouselHover;

  useEffect(() => {
    if (shouldReduceMotion || hasCarouselFocus || hasCarouselHover) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, projectCarouselBehavior.autoRotationIntervalMs);

    return () => clearInterval(interval);
  }, [currentIndex, hasCarouselFocus, hasCarouselHover, shouldReduceMotion]);

  const focusProjectAction = (index: number) => {
    window.requestAnimationFrame(() => {
      activeActionRefs.current[index]?.focus();
    });
  };

  const goToPrevious = () => {
    const nextIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;

    setCurrentIndex(nextIndex);
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % projects.length;

    setCurrentIndex(nextIndex);
  };

  const handleCarouselButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    activate: () => number,
  ) => {
    if (!projectCarouselBehavior.keyboardActivationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.repeat) {
      return;
    }

    const nextIndex = activate();

    pendingFocusIndexRef.current = nextIndex;
  };

  const handleCarouselButtonKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!projectCarouselBehavior.keyboardActivationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (pendingFocusIndexRef.current !== null) {
      focusProjectAction(pendingFocusIndexRef.current);
      pendingFocusIndexRef.current = null;
    }
  };

  const activatePreviousProjectFromKeyboard = () => {
    const nextIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;

    setCurrentIndex(nextIndex);
    return nextIndex;
  };

  const activateNextProjectFromKeyboard = () => {
    const nextIndex = (currentIndex + 1) % projects.length;

    setCurrentIndex(nextIndex);
    return nextIndex;
  };

  return (
    <section id="projects" aria-labelledby="projects-heading" className="portfolio-section">
      <div className="projects-content">
      <motion.h2 
        id="projects-heading"
        className="section-title"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: projectCarouselBehavior.sectionHeadingMotion.duration }}
      >
        / projects
      </motion.h2>
      
      <div
        role="region"
        aria-label="Featured projects"
        aria-roledescription="carousel"
        className="project-carousel"
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
        <div className="project-carousel-viewport">
          <motion.div 
            className="project-carousel-track"
            animate={shouldReduceMotion ? undefined : { x: `${-currentIndex * projectCarouselBehavior.slideStepPercent}%` }}
            style={shouldReduceMotion ? { transform: `translateX(${-currentIndex * projectCarouselBehavior.slideStepPercent}%)` } : undefined}
          >
            {projects.map((project, index) => {
              const isActive = index === currentIndex;

              return (
                <div
                  key={project.title}
                  role="group"
                  aria-roledescription="slide"
                  aria-hidden={index !== currentIndex}
                  aria-label={`${project.title}, project slide ${index + 1} of ${projects.length}`}
                  className="project-carousel-slide"
                >
                  <motion.div
                    className="project-slide-surface"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: projectCarouselBehavior.slideMotion.duration,
                      delay: index * projectCarouselBehavior.slideMotion.staggerDelay,
                    }}
                    whileHover={
                      shouldReduceMotion ? undefined : { scale: projectCarouselBehavior.hoverMotion.scale }
                    }
                  >
                  {project.image?.decorative ? (
                    <div className="project-slide-media">
                      <img 
                        src={project.image.src} 
                        width={project.image.width}
                        height={project.image.height}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="project-slide-image"
                      />
                      <div className="project-slide-image-overlay"></div>
                    </div>
                  ) : (
                    <div className={`project-slide-gradient ${project.bgGradient}`}></div>
                  )}
                  
                  <div className="project-slide-caption-dock">
                    <div className="project-slide-caption">
                      <h3 className="project-slide-title">{project.title}</h3>
                      <p className="project-slide-description">
                        {project.description}
                      </p>
                      <div className="project-slide-tech-stack">
                        {project.techStack.join(", ")}
                      </div>
                      
                      <div className="project-slide-actions">
                        <ProjectActionLink
                          kind="repository"
                          link={project.links.repository}
                          projectTitle={project.title}
                          isActive={isActive}
                          actionRef={(element) => {
                            activeActionRefs.current[index] = element;
                          }}
                        />
                        {project.links.demo && (
                          <ProjectActionLink
                            kind="demo"
                            link={project.links.demo}
                            projectTitle={project.title}
                            isActive={isActive}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <ProjectCarouselArrowButton
          direction="previous"
          label="Previous project"
          onClick={goToPrevious}
          onKeyboardActivate={activatePreviousProjectFromKeyboard}
          onKeyDown={handleCarouselButtonKeyDown}
          onKeyUp={handleCarouselButtonKeyUp}
        />

        <ProjectCarouselArrowButton
          direction="next"
          label="Next project"
          onClick={goToNext}
          onKeyboardActivate={activateNextProjectFromKeyboard}
          onKeyDown={handleCarouselButtonKeyDown}
          onKeyUp={handleCarouselButtonKeyUp}
        />

        <div className="project-carousel-dot-list">
          {projects.map((project, index) => {
            const dotViewState = getProjectCarouselDotViewState(index === currentIndex);

            return (
              <button
                key={project.title}
                onClick={() => setCurrentIndex(index)}
                className="project-carousel-dot-button"
                aria-label={`Show ${project.title}`}
                aria-current={dotViewState.ariaCurrent}
              >
                <span
                  className={`project-carousel-dot-marker ${dotViewState.className}`}
                />
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}

function ProjectActionLink({
  kind,
  link,
  projectTitle,
  isActive,
  actionRef,
}: ProjectActionLinkProps) {
  const { Icon, getLabel } = projectActionMetadata[kind];
  const actionLabel = getLabel(projectTitle);
  const anchorBehavior = getProjectActionLinkAnchorBehavior(link.external);

  return (
    <a
      href={link.href}
      target={anchorBehavior.target}
      rel={anchorBehavior.rel}
      aria-label={actionLabel}
      ref={actionRef}
      tabIndex={isActive ? 0 : -1}
      className="project-action-link"
    >
      <Icon size={24} aria-hidden="true" focusable="false" />
    </a>
  );
}

function ProjectCarouselArrowButton({
  direction,
  label,
  onClick,
  onKeyboardActivate,
  onKeyDown,
  onKeyUp,
}: ProjectCarouselArrowButtonProps) {
  const { Icon, positionClass } = projectCarouselArrowMetadata[direction];

  return (
    <button
      onClick={onClick}
      onKeyDown={(event) => onKeyDown(event, onKeyboardActivate)}
      onKeyUp={onKeyUp}
      className={`project-carousel-arrow-button ${positionClass}`}
      aria-label={label}
    >
      <Icon size={24} className="project-carousel-arrow-icon" aria-hidden="true" focusable="false" />
    </button>
  );
}
