import fs from "node:fs";
import path from "node:path";
import React from "react";
import ts from "typescript";
import { createServer } from "vite";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const componentsRoot = path.join(root, "src/components");
const appPath = path.join(root, "src/App.tsx");
const homePath = path.join(root, "src/Home.tsx");
const reducedMotionHookPath = path.join(root, "src/hooks/usePrefersReducedMotion.ts");
const mediaQueryHookPath = path.join(root, "src/hooks/useMediaQuery.ts");
const aboutMePath = path.join(root, "src/components/AboutMe.tsx");
const introSectionPath = path.join(root, "src/components/IntroSection.tsx");
const experiencePath = path.join(root, "src/components/Experience.tsx");
const errorBoundaryPath = path.join(root, "src/components/ErrorBoundary.tsx");
const footerPath = path.join(root, "src/components/Footer.tsx");
const headerPath = path.join(root, "src/components/Header.tsx");
const headerNavLinkPath = path.join(root, "src/components/HeaderNavLink.tsx");
const skipLinkPath = path.join(root, "src/components/SkipLink.tsx");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const socialLinkPath = path.join(root, "src/components/SocialLink.tsx");
const networkAnimationPath = path.join(root, "src/components/NetworkAnimation.tsx");
const indexCssPath = path.join(root, "src/index.css");
const appSource = fs.readFileSync(appPath, "utf8");
const homeSource = fs.readFileSync(homePath, "utf8");
const reducedMotionHook = fs.existsSync(reducedMotionHookPath)
  ? fs.readFileSync(reducedMotionHookPath, "utf8")
  : "";
const mediaQueryHook = fs.existsSync(mediaQueryHookPath)
  ? fs.readFileSync(mediaQueryHookPath, "utf8")
  : "";
const aboutMeSource = fs.readFileSync(aboutMePath, "utf8");
const experienceSource = fs.readFileSync(experiencePath, "utf8");
const errorBoundarySource = fs.readFileSync(errorBoundaryPath, "utf8");
const footerSource = fs.readFileSync(footerPath, "utf8");
const headerSource = fs.readFileSync(headerPath, "utf8");
const headerNavLinkSource = fs.readFileSync(headerNavLinkPath, "utf8");
const introSection = fs.readFileSync(introSectionPath, "utf8");
const projectsSection = fs.readFileSync(projectsSectionPath, "utf8");
const socialLinkSource = fs.readFileSync(socialLinkPath, "utf8");
const networkAnimation = fs.readFileSync(networkAnimationPath, "utf8");
const indexCss = fs.readFileSync(indexCssPath, "utf8");

const checks = [
  {
    label: "home renders a skip link before the fixed header",
    pattern: /<SkipLink\s*\/>\s*<Header\s*\/>/,
    source: homeSource,
  },
  {
    label: "main content exposes a skip-link target",
    pattern: /<main[^>]*id="main-content"/,
    source: homeSource,
  },
  {
    label: "main content skip-link target is programmatically focusable",
    pattern: /<main[^>]*id="main-content"[^>]*tabIndex=\{-1\}/,
    source: homeSource,
  },
  {
    label: "section headings use a shared title and rule treatment",
    pattern: /--section-rule:\s*#233554;[\s\S]*\.section-title\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*1rem;[\s\S]*width:\s*100%;[\s\S]*\.section-title::after\s*\{[\s\S]*flex:\s*1;[\s\S]*max-width:\s*18rem;[\s\S]*height:\s*1px;[\s\S]*background-color:\s*var\(--section-rule\);[\s\S]*@media \(max-width: 768px\)\s*\{[\s\S]*\.section-title::after\s*\{[\s\S]*display:\s*none;/,
    source: indexCss,
  },
  {
    label: "project slides use the shared dark surface treatment",
    pattern: /--portfolio-surface:\s*#112240;[\s\S]*--portfolio-surface-strong:\s*#233554;[\s\S]*--portfolio-surface-border:\s*rgba\(136,\s*146,\s*176,\s*0\.24\);[\s\S]*\.project-slide-surface\s*\{[\s\S]*border-radius:\s*var\(--radius\);[\s\S]*border:\s*1px solid var\(--portfolio-surface-border\);[\s\S]*background-color:\s*var\(--portfolio-surface\);[\s\S]*box-shadow:\s*0 18px 45px rgba\(2,\s*12,\s*27,\s*0\.45\);[\s\S]*\.project-slide-caption\s*\{[\s\S]*background:\s*rgba\(17,\s*34,\s*64,\s*0\.88\);[\s\S]*border-top:\s*1px solid var\(--portfolio-surface-border\);[\s\S]*backdrop-filter:\s*blur\(8px\);/,
    source: indexCss,
  },
  {
    label: "footer copyright year uses machine-readable time markup",
    pattern: /<time\s+dateTime=\{String\(currentYear\)\}>\{currentYear\}<\/time>/,
    source: footerSource,
  },
  {
    label: "project repository links include accessible names",
    pattern: /const projectActionMetadata:[\s\S]*repository:\s*\{[\s\S]*getLabel:\s*\(projectTitle\)\s*=>\s*`View \$\{projectTitle\} repository`[\s\S]*<ProjectActionLink[\s\S]*kind="repository"[\s\S]*projectTitle=\{project\.title\}[\s\S]*function ProjectActionLink\([\s\S]*const actionLabel = getLabel\(projectTitle\);[\s\S]*aria-label=\{actionLabel\}/,
    source: projectsSection,
  },
  {
    label: "project demo links include accessible names",
    pattern: /const projectActionMetadata:[\s\S]*demo:\s*\{[\s\S]*getLabel:\s*\(projectTitle\)\s*=>\s*`Open \$\{projectTitle\} demo`[\s\S]*<ProjectActionLink[\s\S]*kind="demo"[\s\S]*projectTitle=\{project\.title\}[\s\S]*function ProjectActionLink\([\s\S]*const actionLabel = getLabel\(projectTitle\);[\s\S]*aria-label=\{actionLabel\}/,
    source: projectsSection,
  },
  {
    label: "carousel dot buttons include project names",
    pattern: /aria-label=\{`Show \$\{project\.title\}`\}/,
    source: projectsSection,
  },
  {
    label: "project carousel dot buttons expose current slide state",
    pattern: /interface ProjectCarouselDotViewState \{[\s\S]*readonly ariaCurrent\?:\s*"true";[\s\S]*readonly className:\s*string;[\s\S]*\}[\s\S]*const getProjectCarouselDotViewState = \(isCurrent: boolean\): ProjectCarouselDotViewState => \(\{[\s\S]*ariaCurrent:\s*isCurrent \? "true" : undefined[\s\S]*\}\)[\s\S]*const dotViewState = getProjectCarouselDotViewState\(index === currentIndex\);[\s\S]*aria-current=\{dotViewState\.ariaCurrent\}/,
    source: projectsSection,
  },
  {
    label: "app configures Framer Motion to honor user reduced motion",
    pattern: /<MotionConfig[^>]*reducedMotion="user"/,
    source: appSource,
  },
  {
    label: "app wraps the portfolio in the top-level error boundary",
    pattern: /<MotionConfig[^>]*reducedMotion="user"[\s\S]*<ErrorBoundary>\s*<Home\s*\/>\s*<\/ErrorBoundary>[\s\S]*<\/MotionConfig>/,
    source: appSource,
  },
  {
    label: "error boundary records render failures",
    pattern: /componentDidCatch\(error:\s*Error,\s*errorInfo:\s*ErrorInfo\)[\s\S]*console\.error\("Portfolio render failed"/,
    source: errorBoundarySource,
  },
  {
    label: "global styles honor reduced motion preferences",
    pattern: /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/,
    source: indexCss,
  },
  {
    label: "smooth scrolling is disabled for reduced motion",
    pattern: /scroll-behavior:\s*auto/,
    source: indexCss,
  },
  {
    label: "decorative CSS animations are disabled for reduced motion",
    pattern: /animation:\s*none\s*!important/,
    source: indexCss,
  },
  {
    label: "reduced-motion preference hook reads reduced motion preference",
    pattern: /prefers-reduced-motion:\s*reduce/,
    source: reducedMotionHook,
  },
  {
    label: "reduced-motion preference hook guards browser media query access",
    pattern: /typeof window !== "undefined"[\s\S]*window\.matchMedia\(reducedMotionQuery\)\.matches/,
    source: reducedMotionHook,
  },
  {
    label: "reduced-motion preference hook tracks preference changes",
    pattern: /addEventListener\("change"/,
    source: reducedMotionHook,
  },
  {
    label: "reduced-motion preference hook removes preference listener",
    pattern: /removeEventListener\("change"/,
    source: reducedMotionHook,
  },
  {
    label: "reduced-motion preference hook returns the live media-query state",
    pattern: /return prefersReducedMotion;/,
    source: reducedMotionHook,
  },
  {
    label: "media query hook guards browser media query access",
    pattern: /typeof window !== "undefined"[\s\S]*window\.matchMedia\(query\)\.matches/,
    source: mediaQueryHook,
  },
  {
    label: "media query hook tracks query changes",
    pattern: /addEventListener\("change"/,
    source: mediaQueryHook,
  },
  {
    label: "media query hook removes query listener",
    pattern: /removeEventListener\("change"/,
    source: mediaQueryHook,
  },
  {
    label: "network animation uses shared reduced-motion preference hook",
    pattern: /usePrefersReducedMotion\(\)/,
    source: networkAnimation,
  },
  {
    label: "network animation tracks pending resize restart timeout",
    pattern: /resizeTimeoutRef/,
    source: networkAnimation,
  },
  {
    label: "network animation clears pending resize restart timeout",
    pattern: /clearTimeout\(resizeTimeoutRef\.current\)/,
    source: networkAnimation,
  },
  {
    label: "network animation guards delayed resize restart against reduced motion",
    pattern: /if\s*\(\s*shouldReduceMotionRef\.current\s*\)\s*\{\s*return;\s*\}/,
    source: networkAnimation,
  },
  {
    label: "network animation avoids narration-only source comments",
    pattern: /^(?![\s\S]*(\/\/\s*(Increased number of nodes|Only connect nodes within this distance|Color variations for nodes - blue shades|Adding teal accent color|Create nodes|Clear previous nodes|Random size between 4px and 10px|Random opacity between 0\.3 and 0\.9|Random color from our palette|Apply pulsing animation to some nodes only|Set size and style|Random position within the container|Slower movement for larger nodes|Create connections between nodes|Clear existing connections|Create dynamically calculated connections based on proximity|Only connect nodes that are within connectionThreshold distance|Opacity based on distance \(farther = more transparent\)|Update node positions and connections|Update position based on velocity|Bounce off edges with slight randomness in new velocity|Add some randomness to bounce|Apply new position|Initialize animation|Start animation when component mounts|Handle window resize|Re-initialize the animation after a short delay|Cleanup)))[\s\S]*$/,
    source: networkAnimation,
  },
  {
    label: "network animation skips moving nodes for reduced motion",
    pattern: /shouldReduceMotion\)\s*\{\s*return;/,
    source: networkAnimation,
  },
  {
    label: "intro typewriter uses shared reduced-motion preference hook",
    pattern: /usePrefersReducedMotion\(\)/,
    source: introSection,
  },
  {
    label: "intro typewriter renders full text for reduced motion",
    pattern: /shouldReduceMotion\)\s*\{\s*setDisplayText\(heroContent\.headline\);\s*return;/,
    source: introSection,
  },
  {
    label: "intro typewriter text uses a class-based accent style",
    pattern: /<span className="[^"]*text-\[#007bff\][^"]*">\s*\{displayText\}/,
    source: introSection,
  },
  {
    label: "intro typewriter cursor uses a class-based accent style",
    pattern: /<span[^>]*className="[^"]*bg-\[#007bff\][^"]*"[^>]*><\/span>/,
    source: introSection,
  },
  {
    label: "intro typewriter cursor is hidden from assistive technology",
    pattern: /<span[^>]*aria-hidden="true"[^>]*className="[^"]*bg-\[#007bff\][^"]*"><\/span>/,
    source: introSection,
  },
  {
    label: "intro CTA uses class-based hover styles",
    pattern: /href=\{contactLink\.href\}[\s\S]*className="[^"]*hover:bg-\[#007bff1a\][^"]*"/,
    source: introSection,
  },
  {
    label: "intro CTA hover styles include text and border states",
    pattern: /href=\{contactLink\.href\}[\s\S]*className="[^"]*hover:text-\[#0056b3\][^"]*hover:border-\[#007bff\][^"]*|href=\{contactLink\.href\}[\s\S]*className="[^"]*hover:border-\[#007bff\][^"]*hover:text-\[#0056b3\][^"]*"/,
    source: introSection,
  },
  {
    label: "intro CTA has a visible keyboard focus style",
    pattern: /href=\{contactLink\.href\}[\s\S]*className="[^"]*focus-visible:outline[^"]*"/,
    source: introSection,
  },
  {
    label: "intro CTA uses the shared mail icon component",
    pattern: /import\s*\{\s*Mail\s*\}\s*from\s*"lucide-react";[\s\S]*href=\{contactLink\.href\}[\s\S]*<Mail\b[\s\S]*aria-hidden="true"[\s\S]*focusable="false"/,
    source: introSection,
  },
  {
    label: "intro section avoids narration-only JSX comments",
    pattern: /^(?![\s\S]*\{\/\*\s*(Network Grid Animation Background|Animated Nodes & Connections|Hero Content with Animation|Say Hi Button)\s*\*\/\})[\s\S]*$/,
    source: introSection,
  },
  {
    label: "about technology chevrons use the shared icon component",
    pattern: /import\s*\{\s*ChevronRight\s*\}\s*from\s*"lucide-react";[\s\S]*<ChevronRight\b[^>]*className="[^"]*text-\[#007bff\][^"]*"[^>]*aria-hidden="true"[^>]*focusable="false"[\s\S]*<span className="text-lg text-gray-200">\{tech\}<\/span>/,
    source: aboutMeSource,
  },
  {
    label: "about section avoids narration-only JSX comments",
    pattern: /^(?![\s\S]*\{\/\*\s*(Content Section|Technologies Grid|Personal Interests|Profile Picture - Right Aligned)\s*\*\/\})[\s\S]*$/,
    source: aboutMeSource,
  },
  {
    label: "about section is named by its visible heading",
    pattern: /<section[^>]*id="about"[^>]*aria-labelledby="about-heading"[\s\S]*<motion\.h2[^>]*id="about-heading"/,
    source: aboutMeSource,
  },
  {
    label: "about profile image uses the shared image surface treatment",
    pattern: /\.about-profile-surface\s*\{[\s\S]*border-radius:\s*var\(--radius\);[\s\S]*border:\s*1px solid var\(--portfolio-surface-border\);[\s\S]*box-shadow:\s*0 18px 45px rgba\(2,\s*12,\s*27,\s*0\.36\);[\s\S]*alt="Michael Rico Profile"[\s\S]*className="[^"]*about-profile-surface[^"]*"/,
    source: `${indexCss}\n${aboutMeSource}`,
  },
  {
    label: "project carousel uses shared reduced-motion preference hook",
    pattern: /usePrefersReducedMotion\(\)/,
    source: projectsSection,
  },
  {
    label: "project carousel skips auto-rotation for reduced motion",
    pattern: /if\s*\(\s*shouldReduceMotion\s*\|\|\s*hasCarouselFocus\s*\|\|\s*hasCarouselHover\s*\)\s*\{\s*return;/,
    source: projectsSection,
  },
  {
    label: "project carousel exposes a named carousel region",
    pattern: /role="region"[\s\S]*aria-label="Featured projects"[\s\S]*aria-roledescription="carousel"/,
    source: projectsSection,
  },
  {
    label: "projects section is named by its visible heading",
    pattern: /<section[^>]*id="projects"[^>]*aria-labelledby="projects-heading"[\s\S]*<motion\.h2[^>]*id="projects-heading"/,
    source: projectsSection,
  },
  {
    label: "project section avoids narration-only comments",
    pattern: /^(?![\s\S]*(\{\/\*\s*(Carousel Container|Background|Content Overlay|Icons|Navigation Buttons|Dots Indicator)\s*\*\/\}|\/\/\s*Auto-rotation every 10 seconds with reset capability|\/\/\s*Reset timer when currentIndex changes))[\s\S]*$/,
    source: projectsSection,
  },
  {
    label: "project carousel pauses auto-rotation while it contains focus",
    pattern: /hasCarouselFocus[\s\S]*shouldReduceMotion \|\| hasCarouselFocus[\s\S]*onFocusCapture=\{\(\) => setHasCarouselFocus\(true\)\}/,
    source: projectsSection,
  },
  {
    label: "project carousel pauses auto-rotation while hovered",
    pattern: /hasCarouselHover[\s\S]*shouldReduceMotion \|\| hasCarouselFocus \|\| hasCarouselHover[\s\S]*onMouseEnter=\{\(\) => setHasCarouselHover\(true\)\}[\s\S]*onMouseLeave=\{\(\) => setHasCarouselHover\(false\)\}/,
    source: projectsSection,
  },
  {
    label: "project carousel disables slide animation for reduced motion",
    pattern: /shouldReduceMotion\s*\?\s*undefined\s*:\s*\{\s*x:/,
    source: projectsSection,
  },
  {
    label: "project cards disable hover scale for reduced motion",
    pattern: /whileHover=\{[\s\S]*shouldReduceMotion\s*\?\s*undefined\s*:\s*\{\s*scale:\s*projectCarouselBehavior\.hoverMotion\.scale\s*\}[\s\S]*\}/,
    source: projectsSection,
  },
  {
    label: "experience selector exposes a tablist",
    pattern: /role="tablist"/,
    source: experienceSource,
  },
  {
    label: "experience section avoids narration-only comments",
    pattern: /^(?![\s\S]*(\{\/\*\s*(Company Selection Timeline|Selection Bar|Company Name|Selected Experience Details)\s*\*\/\}|\/\/\s*Default to SentinelOne))[\s\S]*$/,
    source: experienceSource,
  },
  {
    label: "experience section is named by its visible heading",
    pattern: /<section[^>]*id="experience"[^>]*aria-labelledby="experience-heading"[\s\S]*<motion\.h2[^>]*id="experience-heading"/,
    source: experienceSource,
  },
  {
    label: "experience tablist declares vertical orientation",
    pattern: /aria-orientation="vertical"/,
    source: experienceSource,
  },
  {
    label: "experience company controls expose tab semantics",
    pattern: /role="tab"/,
    source: experienceSource,
  },
  {
    label: "experience tabpanel is labelled by the selected tab",
    pattern: /role="tabpanel"[\s\S]*aria-labelledby=\{`experience-tab-\$\{index\}`\}/,
    source: experienceSource,
  },
  {
    label: "experience tabpanels have visible keyboard focus styles",
    pattern: /role="tabpanel"[\s\S]*className="[^"]*focus-visible:outline[^"]*"/,
    source: experienceSource,
  },
  {
    label: "experience tabs have visible keyboard focus styles",
    pattern: /role="tab"[\s\S]*className=\{`[^`]*focus-visible:outline[^`]*`\}/,
    source: experienceSource,
  },
  {
    label: "experience renders persistent panels for tab controls",
    pattern: /interface ExperiencePanelViewState \{[\s\S]*readonly tabIndex:\s*0 \| -1;[\s\S]*readonly hidden:\s*boolean;[\s\S]*readonly animate:\s*\{[\s\S]*readonly opacity:\s*number;[\s\S]*readonly x:\s*number;[\s\S]*\};[\s\S]*\}[\s\S]*getExperiencePanelViewState[\s\S]*hidden:\s*!isSelected[\s\S]*animate:\s*isSelected \? \{ opacity: 1, x: 0 \} : \{ opacity: 0, x: 20 \}[\s\S]*const panelViewState = getExperiencePanelViewState\(selectedCompany === index\);[\s\S]*tabIndex=\{panelViewState\.tabIndex\}[\s\S]*hidden=\{panelViewState\.hidden\}[\s\S]*animate=\{panelViewState\.animate\}/,
    source: experienceSource,
  },
  {
    label: "experience tabs expose selected state",
    pattern: /<ExperienceTab[\s\S]*isSelected=\{selectedCompany === index\}[\s\S]*function ExperienceTab\([\s\S]*aria-selected=\{isSelected\}/,
    source: experienceSource,
  },
  {
    label: "experience selected tabs use class-based accent styles",
    pattern: /interface ExperienceTabViewState \{[\s\S]*readonly tabIndex:\s*0 \| -1;[\s\S]*readonly textClass:\s*string;[\s\S]*readonly indicatorClass:\s*string;[\s\S]*\}[\s\S]*getExperienceTabViewState[\s\S]*textClass:\s*isSelected \? "text-\[#007bff\]" : "text-gray-400 hover:text-gray-200"[\s\S]*function ExperienceTab\([\s\S]*const tabViewState = getExperienceTabViewState\(isSelected\);[\s\S]*className=\{`[^`]*\$\{tabViewState\.textClass\}`\}/,
    source: experienceSource,
  },
  {
    label: "experience selected tab bars use class-based accent styles",
    pattern: /getExperienceTabViewState[\s\S]*indicatorClass:\s*isSelected \? "bg-\[#007bff\]" : "bg-transparent"[\s\S]*function ExperienceTab\([\s\S]*className=\{`[^`]*\$\{tabViewState\.indicatorClass\}`\}/,
    source: experienceSource,
  },
  {
    label: "experience tabs support arrow-key navigation",
    pattern: /<ExperienceTab[\s\S]*onKeyDown=\{handleCompanyKeyDown\}[\s\S]*function ExperienceTab\([\s\S]*onKeyDown=\{\(event\) => onKeyDown\(event, index\)\}/,
    source: experienceSource,
  },
  {
    label: "experience tabs use a typed shared renderer",
    pattern: /interface ExperienceTabProps[\s\S]*index:\s*number;[\s\S]*function ExperienceTab\(/,
    source: experienceSource,
  },
  {
    label: "experience tab renderer owns selected tab semantics",
    pattern: /function ExperienceTab\([\s\S]*const tabViewState = getExperienceTabViewState\(isSelected\);[\s\S]*role="tab"[\s\S]*aria-selected=\{isSelected\}[\s\S]*aria-controls=\{`experience-panel-\$\{index\}`\}[\s\S]*tabIndex=\{tabViewState\.tabIndex\}/,
    source: experienceSource,
  },
  {
    label: "experience lists use stable content keys",
    pattern: /experiences\.map\(\(exp, index\) => \(\s*<ExperienceTab[\s\S]*key=\{exp\.company\}[\s\S]*exp\.highlights\.map\(\(highlight, highlightIndex\) => \(\s*<motion\.li[\s\S]*key=\{highlight\}/,
    source: experienceSource,
  },
  {
    label: "experience panel company names use class-based accent styles",
    pattern: /<span\s+className="[^"]*text-\[#007bff\][^"]*">\{exp\.displayCompany\}<\/span>/,
    source: experienceSource,
  },
  {
    label: "experience highlight chevrons use the shared icon component",
    pattern: /import\s*\{\s*ChevronRight\s*\}\s*from\s*"lucide-react";[\s\S]*<ChevronRight\b[^>]*className="[^"]*text-\[#007bff\][^"]*"[^>]*aria-hidden="true"[^>]*focusable="false"[\s\S]*<p className="text-gray-200 leading-relaxed">\s*\{highlight\}\s*<\/p>/,
    source: experienceSource,
  },
  {
    label: "header brand link has a visible keyboard focus style",
    pattern: /href=\{siteBrand\.href\}[\s\S]*className="[^"]*focus-visible:outline[^"]*"[\s\S]*>\s*\{siteBrand\.label\}\s*<\/a>/,
    source: headerSource,
  },
  {
    label: "desktop header navigation links have visible keyboard focus styles",
    pattern: /focus-visible:outline/,
    source: headerNavLinkSource,
  },
  {
    label: "header social links have visible keyboard focus styles",
    pattern: /focus-visible:outline/,
    source: socialLinkSource,
  },
  {
    label: "social icons use a typed shared registry",
    pattern: /type SocialIconRenderer = \(\) => ReactNode;[\s\S]*const socialIconRegistry:\s*Record<SocialLinkKind,\s*SocialIconRenderer>\s*=\s*\{[\s\S]*email:\s*\(\)\s*=>\s*<Mail\b[\s\S]*github:\s*\(\)\s*=>\s*<Github\b[\s\S]*linkedin:\s*\(\)\s*=>\s*<Linkedin\b[\s\S]*medium:\s*MediumIcon[\s\S]*\};[\s\S]*function SocialIcon\([\s\S]*const Icon = socialIconRegistry\[kind\];[\s\S]*return <Icon \/>/,
    source: socialLinkSource,
  },
  {
    label: "project action links have visible keyboard focus styles",
    pattern: /function ProjectActionLink\([\s\S]*aria-label=\{actionLabel\}[\s\S]*className="[^"]*focus-visible:outline[^"]*"/,
    source: projectsSection,
  },
  {
    label: "project action links use mobile-friendly touch targets",
    pattern: /function ProjectActionLink\([\s\S]*aria-label=\{actionLabel\}[\s\S]*className="[^"]*\bmin-h-11\b[^"]*\bmin-w-11\b[^"]*"/,
    source: projectsSection,
  },
  {
    label: "project action links use class-based hover styles",
    pattern: /function ProjectActionLink\([\s\S]*aria-label=\{actionLabel\}[\s\S]*className="[^"]*hover:text-\[#66b3ff\][^"]*"/,
    source: projectsSection,
  },
  {
    label: "project tech labels use class-based accent styles",
    pattern: /className="[^"]*text-\[#66b3ff\][^"]*"[^>]*>\s*\{project\.techStack\.join\(", "\)\}\s*<\/div>/,
    source: projectsSection,
  },
  {
    label: "project carousel hides inactive slides from assistive technology",
    pattern: /role="group"[\s\S]*aria-roledescription="slide"[\s\S]*aria-hidden=\{index !== currentIndex\}/,
    source: projectsSection,
  },
  {
    label: "project carousel slide groups include project titles in accessible names",
    pattern: /aria-label=\{`\$\{project\.title\}, project slide \$\{index \+ 1\} of \$\{projects\.length\}`\}/,
    source: projectsSection,
  },
  {
    label: "project carousel lists use stable project keys",
    pattern: /projects\.map\(\(project, index\) => \{[\s\S]*return \(\s*<div[\s\S]*key=\{project\.title\}[\s\S]*projects\.map\(\(project, index\) => \{[\s\S]*return \(\s*<button[\s\S]*key=\{project\.title\}/,
    source: projectsSection,
  },
  {
    label: "project carousel exposes active slide status politely",
    pattern: /shouldAnnounceCarouselStatus[\s\S]*role="status"[\s\S]*aria-live=\{shouldAnnounceCarouselStatus \? "polite" : "off"\}[\s\S]*aria-atomic="true"[\s\S]*projects\[currentIndex\]\.title/,
    source: projectsSection,
  },
  {
    label: "project repository links are tabbable only on the active slide",
    pattern: /<ProjectActionLink[\s\S]*kind="repository"[\s\S]*isActive=\{isActive\}[\s\S]*function ProjectActionLink\([\s\S]*tabIndex=\{isActive \? 0 : -1\}/,
    source: projectsSection,
  },
  {
    label: "project demo links are tabbable only on the active slide",
    pattern: /<ProjectActionLink[\s\S]*kind="demo"[\s\S]*isActive=\{isActive\}[\s\S]*function ProjectActionLink\([\s\S]*tabIndex=\{isActive \? 0 : -1\}/,
    source: projectsSection,
  },
  {
    label: "project action links use a typed shared renderer",
    pattern: /type ProjectActionLinkKind = "repository" \| "demo";[\s\S]*interface ProjectActionLinkProps[\s\S]*kind:\s*ProjectActionLinkKind;[\s\S]*function ProjectActionLink\(/,
    source: projectsSection,
  },
  {
    label: "project action links share icon and accessible label behavior",
    pattern: /interface ProjectActionMetadata \{[\s\S]*readonly Icon:\s*LucideIcon;[\s\S]*readonly getLabel:\s*\(projectTitle:\s*string\)\s*=>\s*string;[\s\S]*\}[\s\S]*const projectActionMetadata:\s*Record<ProjectActionLinkKind,\s*ProjectActionMetadata>\s*=\s*\{[\s\S]*repository:\s*\{[\s\S]*Icon:\s*Github,[\s\S]*getLabel:\s*\(projectTitle\)\s*=>\s*`View \$\{projectTitle\} repository`[\s\S]*demo:\s*\{[\s\S]*Icon:\s*ExternalLink,[\s\S]*getLabel:\s*\(projectTitle\)\s*=>\s*`Open \$\{projectTitle\} demo`[\s\S]*function ProjectActionLink\([\s\S]*const \{ Icon, getLabel \} = projectActionMetadata\[kind\];[\s\S]*const actionLabel = getLabel\(projectTitle\);[\s\S]*aria-label=\{actionLabel\}/,
    source: projectsSection,
  },
  {
    label: "project action links share active slide tab order behavior",
    pattern: /function ProjectActionLink\([\s\S]*tabIndex=\{isActive \? 0 : -1\}/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow buttons have visible keyboard focus styles",
    pattern: /function ProjectCarouselArrowButton[\s\S]*focus-visible:outline[\s\S]*aria-label=\{label\}/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow buttons keep mobile touch targets inside the viewport",
    pattern: /interface ProjectCarouselArrowMetadata \{[\s\S]*readonly Icon:\s*LucideIcon;[\s\S]*readonly positionClass:\s*string;[\s\S]*\}[\s\S]*const projectCarouselArrowMetadata:\s*Record<ProjectCarouselArrowDirection,\s*ProjectCarouselArrowMetadata>\s*=\s*\{[\s\S]*previous:\s*\{[\s\S]*Icon:\s*ChevronLeft,[\s\S]*positionClass:\s*"left-2 md:left-0 md:-translate-x-4"[\s\S]*next:\s*\{[\s\S]*Icon:\s*ChevronRight,[\s\S]*positionClass:\s*"right-2 md:right-0 md:translate-x-4"[\s\S]*function ProjectCarouselArrowButton\([\s\S]*const \{ Icon, positionClass \} = projectCarouselArrowMetadata\[direction\];[\s\S]*p-3 md:p-2/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow icons use class-based accent styles",
    pattern: /const projectCarouselArrowMetadata:[\s\S]*previous:\s*\{[\s\S]*Icon:\s*ChevronLeft[\s\S]*next:\s*\{[\s\S]*Icon:\s*ChevronRight[\s\S]*function ProjectCarouselArrowButton\([\s\S]*const \{ Icon, positionClass \} = projectCarouselArrowMetadata\[direction\];[\s\S]*<Icon[^>]*className="[^"]*text-\[#007bff\][^"]*"/,
    source: projectsSection,
  },
  {
    label: "project carousel dot buttons have visible keyboard focus styles",
    pattern: /focus-visible:outline[\s\S]*aria-label=\{`Show \$\{project\.title\}`\}/,
    source: projectsSection,
  },
  {
    label: "project carousel dot buttons use mobile-friendly touch targets",
    pattern: /className="[^"]*h-11[^"]*w-11[^"]*"[\s\S]*aria-label=\{`Show \$\{project\.title\}`\}[\s\S]*<span[\s\S]*className=\{`h-3 w-3 rounded-full/,
    source: projectsSection,
  },
  {
    label: "project carousel active dot uses a class-based accent style",
    pattern: /const getProjectCarouselDotViewState = \(isCurrent: boolean\): ProjectCarouselDotViewState => \(\{[\s\S]*className:\s*isCurrent \? "scale-110 bg-\[#007bff\]" : "bg-gray-500 group-hover:bg-gray-400"[\s\S]*\}\)[\s\S]*className=\{`h-3 w-3 rounded-full transition-all duration-300 \$\{dotViewState\.className\}`\}/,
    source: projectsSection,
  },
];

const failedChecks = checks.filter(({ pattern, source }) => !pattern.test(source));
const failures = failedChecks.map(({ label }) => label);

if (projectActionLinksUseMouseHandlers(projectsSection)) {
  failures.push("project action links avoid mouse-event hover styling");
}

if (introCtaUsesMouseHandlers(introSection)) {
  failures.push("intro CTA avoids mouse-event hover styling");
}

if (introTypewriterUsesInlineAccentStyles(introSection)) {
  failures.push("intro typewriter avoids inline accent styles");
}

if (aboutTechnologyChevronsUseInlineAccentStyles(aboutMeSource)) {
  failures.push("about technology chevrons avoid inline accent styles");
}

if (aboutProfileImageUsesInlineAccentStyles(aboutMeSource)) {
  failures.push("about profile image border avoids inline accent styles");
}

if (experienceTabsUseInlineAccentStyles(experienceSource)) {
  failures.push("experience tabs avoid inline accent styles");
}

if (experiencePanelHeadingUsesInlineAccentStyles(experienceSource)) {
  failures.push("experience panel heading avoids inline accent styles");
}

if (experienceHighlightChevronsUseInlineAccentStyles(experienceSource)) {
  failures.push("experience highlight chevrons avoid inline accent styles");
}

if (projectCarouselControlsUseInlineAccentStyles(projectsSection)) {
  failures.push("project carousel controls avoid inline accent styles");
}

if (projectCardContentUsesInlineAccentStyles(projectsSection)) {
  failures.push("project card content avoids inline accent styles");
}

if (projectCardsUseDecorativeBlurOverlays(projectsSection)) {
  failures.push("project cards avoid decorative blurred orb overlays");
}

if (!(await errorBoundaryFallbackReturnsAccessibleShell())) {
  failures.push("error boundary fallback returns a visible main landmark and failure heading");
}

if (!fs.existsSync(skipLinkPath)) {
  failures.push("src/components/SkipLink.tsx renders the skip link");
} else {
  const skipLinkSource = fs.readFileSync(skipLinkPath, "utf8");
  const skipLinkClassName = skipLinkSource.match(/className="([^"]+)"/)?.[1] ?? "";

  if (!/href="#main-content"/.test(skipLinkSource)) {
    failures.push("Skip link targets the main content landmark");
  }

  if (!/Skip to main content/.test(skipLinkSource)) {
    failures.push("Skip link has a clear accessible name");
  }

  if (
    !hasClassToken(skipLinkClassName, "sr-only") ||
    !hasClassToken(skipLinkClassName, "focus:not-sr-only")
  ) {
    failures.push("Skip link stays hidden until focused");
  }
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".tsx") ? [entryPath] : [];
  });
}

function hasClassToken(className, token) {
  return className.split(/\s+/).includes(token);
}

function projectActionLinksUseMouseHandlers(source) {
  const actionLinksMatch = source.match(
    /function ProjectActionLink\([\s\S]*?return \([\s\S]*?<\/a>/,
  );

  return /onMouseEnter|onMouseLeave/.test(actionLinksMatch?.[0] ?? "");
}

function introCtaUsesMouseHandlers(source) {
  const introCtaMatch = source.match(/href=\{contactLink\.href\}[\s\S]*?<\/a>/);

  return /onMouseEnter|onMouseLeave/.test(introCtaMatch?.[0] ?? "");
}

function introTypewriterUsesInlineAccentStyles(source) {
  const headingMatch = source.match(
    /<h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">[\s\S]*?<\/h1>/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(headingMatch?.[0] ?? "");
}

function aboutTechnologyChevronsUseInlineAccentStyles(source) {
  const technologyGridMatch = source.match(
    /\{leftColumn\.map\(\(tech, index\) => \([\s\S]*?\{rightColumn\.map\(\(tech, index\) => \([\s\S]*?<\/motion\.div>\s*\)\)}/,
  );

  return /<svg\b[^>]*style=\{[^}]*#[0-9a-fA-F]{6}/.test(technologyGridMatch?.[0] ?? "");
}

function aboutProfileImageUsesInlineAccentStyles(source) {
  const profileImageMatch = source.match(
    /alt="Michael Rico Profile"[\s\S]*?\/>/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6,8}/.test(profileImageMatch?.[0] ?? "");
}

function experienceTabsUseInlineAccentStyles(source) {
  const tablistMatch = source.match(
    /function ExperienceTab\([\s\S]*?return \([\s\S]*?<\/motion\.button>/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(tablistMatch?.[0] ?? "");
}

function experiencePanelHeadingUsesInlineAccentStyles(source) {
  const headingMatch = source.match(
    /<h4 className="text-xl md:text-2xl font-semibold mb-2">[\s\S]*?<\/h4>/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(headingMatch?.[0] ?? "");
}

function experienceHighlightChevronsUseInlineAccentStyles(source) {
  const highlightsMatch = source.match(
    /<ul className="space-y-4">[\s\S]*?<\/ul>/,
  );

  return /<svg\b[^>]*style=\{[^}]*#[0-9a-fA-F]{6}/.test(highlightsMatch?.[0] ?? "");
}

function projectCarouselControlsUseInlineAccentStyles(source) {
  const arrowControlsMatch = source.match(
    /function ProjectCarouselArrowButton[\s\S]*?return \([\s\S]*?<\/button>/,
  );
  const dotControlsMatch = source.match(
    /<div className="flex justify-center mt-6 space-x-2">[\s\S]*?<\/div>/,
  );
  const controlsSource = `${arrowControlsMatch?.[0] ?? ""}\n${dotControlsMatch?.[0] ?? ""}`;

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(controlsSource);
}

function projectCardContentUsesInlineAccentStyles(source) {
  const contentMatch = source.match(
    /<h3 className="text-2xl font-bold text-white mb-2">[\s\S]*?<div className="flex items-center space-x-4">/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(contentMatch?.[0] ?? "");
}

function projectCardsUseDecorativeBlurOverlays(source) {
  const projectCardMatch = source.match(
    /<motion\.div\s+className="project-slide-surface[\s\S]*?<\/motion\.div>/,
  );

  return /\brounded-full\b[\s\S]*\bbg-white\/\d+\b[\s\S]*\bblur-(?:md|lg|xl)\b/.test(
    projectCardMatch?.[0] ?? "",
  );
}

function sourceFilePosition(source, index) {
  const lines = source.slice(0, index).split("\n");

  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

function getJsxAttribute(openingElement, name) {
  return openingElement.attributes.properties.find(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === name,
  );
}

function getJsxAttributeExpression(attribute) {
  if (!attribute?.initializer) {
    return undefined;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer;
  }

  return ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : undefined;
}

function stringLiteralValue(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined;
}

function relValueUsesNewTabSafety(node) {
  const relValue = stringLiteralValue(node);

  if (!relValue) {
    return false;
  }

  const relTokens = relValue.split(/\s+/);

  return relTokens.includes("noopener") && relTokens.includes("noreferrer");
}

function relExpressionMatchesTargetBranch(sourceFile, relExpression, conditionText, branch) {
  if (!relExpression) {
    return false;
  }

  if (relValueUsesNewTabSafety(relExpression)) {
    return true;
  }

  if (!ts.isConditionalExpression(relExpression)) {
    return false;
  }

  if (relExpression.condition.getText(sourceFile) !== conditionText) {
    return false;
  }

  const relBranch = branch === "whenTrue" ? relExpression.whenTrue : relExpression.whenFalse;

  return relValueUsesNewTabSafety(relBranch);
}

function anchorUsesNewTabSafety(sourceFile, openingElement) {
  const targetExpression = getJsxAttributeExpression(getJsxAttribute(openingElement, "target"));
  const relExpression = getJsxAttributeExpression(getJsxAttribute(openingElement, "rel"));

  if (!targetExpression) {
    return true;
  }

  if (stringLiteralValue(targetExpression) === "_blank") {
    return relExpressionMatchesTargetBranch(sourceFile, relExpression, "", "whenTrue");
  }

  if (!ts.isConditionalExpression(targetExpression)) {
    return true;
  }

  const conditionText = targetExpression.condition.getText(sourceFile);

  if (
    stringLiteralValue(targetExpression.whenTrue) === "_blank" &&
    !relExpressionMatchesTargetBranch(sourceFile, relExpression, conditionText, "whenTrue")
  ) {
    return false;
  }

  if (
    stringLiteralValue(targetExpression.whenFalse) === "_blank" &&
    !relExpressionMatchesTargetBranch(sourceFile, relExpression, conditionText, "whenFalse")
  ) {
    return false;
  }

  return true;
}

function findUnsafeNewTabAnchors(source, componentPath) {
  const sourceFile = ts.createSourceFile(componentPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const unsafeAnchors = [];

  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(sourceFile) === "a" &&
      !anchorUsesNewTabSafety(sourceFile, node)
    ) {
      unsafeAnchors.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return unsafeAnchors;
}

async function importTsxDefaultExport(componentPath) {
  const server = await createServer({
    appType: "custom",
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "silent",
    root,
    server: { middlewareMode: true },
  });
  const modulePath = `/${path.relative(root, componentPath).split(path.sep).join("/")}`;

  try {
    const module = await server.ssrLoadModule(modulePath);

    return module.default;
  } finally {
    await server.close();
  }
}

function elementPropsAreHidden(props = {}) {
  const classNames = typeof props.className === "string" ? props.className.split(/\s+/) : [];
  const style = props.style && typeof props.style === "object" ? props.style : {};

  return (
    props.hidden === true ||
    props.hidden === "" ||
    props["aria-hidden"] === true ||
    props["aria-hidden"] === "true" ||
    classNames.some((className) => ["hidden", "sr-only", "invisible", "opacity-0"].includes(className)) ||
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === 0 ||
    style.opacity === "0"
  );
}

function visibleTextContent(node, ancestorsHidden = false) {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return ancestorsHidden ? "" : String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => visibleTextContent(child, ancestorsHidden)).join("");
  }

  if (!React.isValidElement(node)) {
    return "";
  }

  const hidden = ancestorsHidden || elementPropsAreHidden(node.props);

  return React.Children.toArray(node.props.children)
    .map((child) => visibleTextContent(child, hidden))
    .join("");
}

function elementTreeHasVisibleHeading(node, text, ancestorsHidden = false) {
  if (Array.isArray(node)) {
    return node.some((child) => elementTreeHasVisibleHeading(child, text, ancestorsHidden));
  }

  if (!React.isValidElement(node)) {
    return false;
  }

  const hidden = ancestorsHidden || elementPropsAreHidden(node.props);

  if (!hidden && node.type === "h1" && visibleTextContent(node).replace(/\s+/g, " ").trim() === text) {
    return true;
  }

  return React.Children.toArray(node.props.children).some((child) =>
    elementTreeHasVisibleHeading(child, text, hidden),
  );
}

function elementTreeHasVisibleMainWithHeading(node, text, ancestorsHidden = false) {
  if (Array.isArray(node)) {
    return node.some((child) => elementTreeHasVisibleMainWithHeading(child, text, ancestorsHidden));
  }

  if (!React.isValidElement(node)) {
    return false;
  }

  const hidden = ancestorsHidden || elementPropsAreHidden(node.props);

  if (!hidden && node.type === "main" && elementTreeHasVisibleHeading(node, text)) {
    return true;
  }

  return React.Children.toArray(node.props.children).some((child) =>
    elementTreeHasVisibleMainWithHeading(child, text, hidden),
  );
}

async function errorBoundaryFallbackReturnsAccessibleShell() {
  const ErrorBoundary = await importTsxDefaultExport(errorBoundaryPath);
  const derivedErrorState = ErrorBoundary.getDerivedStateFromError?.(new Error("Render failed during accessibility check"));
  const boundary = new ErrorBoundary({
    children: React.createElement("div", null, "Portfolio content"),
  });

  if (!derivedErrorState?.hasError) {
    return false;
  }

  boundary.state = derivedErrorState;

  return elementTreeHasVisibleMainWithHeading(boundary.render(), "Something failed while loading.");
}

const fallbackTreeGuardExamples = [
  {
    label: "rejects hidden main landmarks",
    element: React.createElement("main", { hidden: true }, React.createElement("h1", null, "Something failed while loading.")),
    expected: false,
  },
  {
    label: "rejects aria-hidden headings",
    element: React.createElement("main", null, React.createElement("h1", { "aria-hidden": true }, "Something failed while loading.")),
    expected: false,
  },
  {
    label: "rejects class-hidden fallback headings",
    element: React.createElement("main", null, React.createElement("h1", { className: "sr-only" }, "Something failed while loading.")),
    expected: false,
  },
  {
    label: "rejects style-hidden main landmarks",
    element: React.createElement(
      "main",
      { style: { display: "none" } },
      React.createElement("h1", null, "Something failed while loading."),
    ),
    expected: false,
  },
  {
    label: "rejects style-hidden fallback headings",
    element: React.createElement(
      "main",
      null,
      React.createElement("h1", { style: { visibility: "hidden" } }, "Something failed while loading."),
    ),
    expected: false,
  },
  {
    label: "rejects hidden descendant heading text",
    element: React.createElement(
      "main",
      null,
      React.createElement("h1", null, React.createElement("span", { className: "hidden" }, "Something failed while loading.")),
    ),
    expected: false,
  },
  {
    label: "accepts visible main landmarks with visible headings",
    element: React.createElement("main", { "aria-hidden": false }, React.createElement("h1", null, "Something failed while loading.")),
    expected: true,
  },
];

const newTabRelGuardExamples = [
  {
    label: "accepts whitespace-separated literal rel tokens",
    source: 'const Example = () => <a target="_blank" rel="noopener noreferrer">link</a>;',
    expected: 0,
  },
  {
    label: "rejects comma-separated literal rel tokens",
    source: 'const Example = () => <a target="_blank" rel="noopener,noreferrer">link</a>;',
    expected: 1,
  },
  {
    label: "accepts whitespace-separated expression rel tokens",
    source: 'const Example = () => <a target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}>link</a>;',
    expected: 0,
  },
  {
    label: "rejects comma-separated expression rel tokens",
    source: 'const Example = () => <a target={link.external ? "_blank" : undefined} rel={link.external ? "noopener,noreferrer" : undefined}>link</a>;',
    expected: 1,
  },
  {
    label: "rejects rel tokens on the opposite conditional branch",
    source: 'const Example = () => <a target={link.external ? "_blank" : undefined} rel={link.external ? undefined : "noopener noreferrer"}>link</a>;',
    expected: 1,
  },
];

for (const { label, source, expected } of newTabRelGuardExamples) {
  if (findUnsafeNewTabAnchors(source, `${label}.tsx`).length !== expected) {
    failures.push(`new-tab rel guard ${label}`);
  }
}

for (const { label, element, expected } of fallbackTreeGuardExamples) {
  if (elementTreeHasVisibleMainWithHeading(element, "Something failed while loading.") !== expected) {
    failures.push(`fallback element-tree guard ${label}`);
  }
}

for (const componentPath of walkFiles(srcRoot)) {
  const source = fs.readFileSync(componentPath, "utf8");
  const svgTags = source.match(/<svg\b[\s\S]*?>/g) ?? [];
  const unsafeNewTabLinks = findUnsafeNewTabAnchors(source, componentPath);
  const lucideNames = Array.from(
    source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];/g),
  ).flatMap(([, imports]) =>
    imports
      .split(",")
      .map((specifier) => specifier.trim().split(/\s+as\s+/).at(-1))
      .filter(Boolean),
  );

  for (const svgTag of svgTags) {
    if (!/aria-hidden="true"/.test(svgTag) || !/focusable="false"/.test(svgTag)) {
      failures.push(`${path.relative(root, componentPath)}: inline SVGs are decorative`);
    }
  }

  for (const link of unsafeNewTabLinks) {
    const position = sourceFilePosition(source, link.getStart());

    failures.push(
      `${path.relative(root, componentPath)}:${position.line}:${position.column}: new-tab links use noopener noreferrer`,
    );
  }

  for (const lucideName of lucideNames) {
    const iconTags = source.match(new RegExp(`<${lucideName}\\b[\\s\\S]*?>`, "g")) ?? [];
    for (const iconTag of iconTags) {
      if (!/aria-hidden="true"/.test(iconTag) || !/focusable="false"/.test(iconTag)) {
        failures.push(`${path.relative(root, componentPath)}: ${lucideName} icon is decorative`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Source accessibility check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source accessibility check passed.");
