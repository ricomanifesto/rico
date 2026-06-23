import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const componentsRoot = path.join(root, "src/components");
const appPath = path.join(root, "src/App.tsx");
const homePath = path.join(root, "src/Home.tsx");
const reducedMotionHookPath = path.join(root, "src/hooks/usePrefersReducedMotion.ts");
const aboutMePath = path.join(root, "src/components/AboutMe.tsx");
const introSectionPath = path.join(root, "src/components/IntroSection.tsx");
const experiencePath = path.join(root, "src/components/Experience.tsx");
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
const aboutMeSource = fs.readFileSync(aboutMePath, "utf8");
const experienceSource = fs.readFileSync(experiencePath, "utf8");
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
    label: "footer copyright year uses machine-readable time markup",
    pattern: /<time\s+dateTime=\{String\(currentYear\)\}>\{currentYear\}<\/time>/,
    source: footerSource,
  },
  {
    label: "project repository links include accessible names",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}/,
    source: projectsSection,
  },
  {
    label: "project demo links include accessible names",
    pattern: /aria-label=\{`Open \$\{project\.title\} demo`\}/,
    source: projectsSection,
  },
  {
    label: "carousel dot buttons include project names",
    pattern: /aria-label=\{`Show \$\{project\.title\}`\}/,
    source: projectsSection,
  },
  {
    label: "project carousel dot buttons expose current slide state",
    pattern: /aria-current=\{index === currentIndex \? "true" : undefined\}/,
    source: projectsSection,
  },
  {
    label: "app configures Framer Motion to honor user reduced motion",
    pattern: /<MotionConfig[^>]*reducedMotion="user"/,
    source: appSource,
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
    pattern: /shouldReduceMotion\)\s*\{\s*setDisplayText\(fullText\);\s*return;/,
    source: introSection,
  },
  {
    label: "intro typewriter text uses a class-based accent style",
    pattern: /<span className="[^"]*text-\[#007bff\][^"]*">\s*\{displayText\}/,
    source: introSection,
  },
  {
    label: "intro typewriter cursor uses a class-based accent style",
    pattern: /<span className="[^"]*bg-\[#007bff\][^"]*"><\/span>/,
    source: introSection,
  },
  {
    label: "intro CTA uses class-based hover styles",
    pattern: /href="mailto:michaelrico124@gmail\.com"[\s\S]*className="[^"]*hover:bg-\[#007bff1a\][^"]*"/,
    source: introSection,
  },
  {
    label: "intro CTA hover styles include text and border states",
    pattern: /href="mailto:michaelrico124@gmail\.com"[\s\S]*className="[^"]*hover:text-\[#0056b3\][^"]*hover:border-\[#007bff\][^"]*|href="mailto:michaelrico124@gmail\.com"[\s\S]*className="[^"]*hover:border-\[#007bff\][^"]*hover:text-\[#0056b3\][^"]*"/,
    source: introSection,
  },
  {
    label: "intro CTA has a visible keyboard focus style",
    pattern: /href="mailto:michaelrico124@gmail\.com"[\s\S]*className="[^"]*focus-visible:outline[^"]*"/,
    source: introSection,
  },
  {
    label: "about technology chevrons use class-based accent styles",
    pattern: /<svg\s+className="[^"]*text-\[#007bff\][^"]*"[\s\S]*?<span className="text-lg text-gray-200">\{tech\}<\/span>/,
    source: aboutMeSource,
  },
  {
    label: "about profile image border uses a class-based accent style",
    pattern: /alt="Michael Rico Profile"[\s\S]*className="[^"]*border-\[#007bff33\][^"]*"/,
    source: aboutMeSource,
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
    pattern: /whileHover=\{shouldReduceMotion\s*\?\s*undefined\s*:\s*\{\s*scale:\s*1\.02\s*\}\}/,
    source: projectsSection,
  },
  {
    label: "experience selector exposes a tablist",
    pattern: /role="tablist"/,
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
    pattern: /id=\{`experience-panel-\$\{index\}`\}[\s\S]*hidden=\{selectedCompany !== index\}/,
    source: experienceSource,
  },
  {
    label: "experience tabs expose selected state",
    pattern: /aria-selected=\{selectedCompany === index\}/,
    source: experienceSource,
  },
  {
    label: "experience selected tabs use class-based accent styles",
    pattern: /selectedCompany === index\s*\?\s*'[^']*text-\[#007bff\][^']*'/,
    source: experienceSource,
  },
  {
    label: "experience selected tab bars use class-based accent styles",
    pattern: /selectedCompany === index\s*\?\s*'[^']*bg-\[#007bff\][^']*'/,
    source: experienceSource,
  },
  {
    label: "experience tabs support arrow-key navigation",
    pattern: /onKeyDown=\{\(event\)\s*=>\s*handleCompanyKeyDown\(event,\s*index\)\}/,
    source: experienceSource,
  },
  {
    label: "experience panel company names use class-based accent styles",
    pattern: /<span\s+className="[^"]*text-\[#007bff\][^"]*">\{exp\.displayCompany\}<\/span>/,
    source: experienceSource,
  },
  {
    label: "experience highlight chevrons use class-based accent styles",
    pattern: /<svg\s+className="[^"]*text-\[#007bff\][^"]*"[\s\S]*?<p className="text-gray-200 leading-relaxed">\s*\{highlight\}\s*<\/p>/,
    source: experienceSource,
  },
  {
    label: "header brand link has a visible keyboard focus style",
    pattern: /href="#intro"[\s\S]*className="[^"]*focus-visible:outline[^"]*"[\s\S]*>\s*rico\s*<\/a>/,
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
    label: "project action links have visible keyboard focus styles",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}[\s\S]*focus-visible:outline[\s\S]*aria-label=\{`Open \$\{project\.title\} demo`\}[\s\S]*focus-visible:outline/,
    source: projectsSection,
  },
  {
    label: "project action links use mobile-friendly touch targets",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}[\s\S]*className="[^"]*\bmin-h-11\b[^"]*\bmin-w-11\b[^"]*"[\s\S]*aria-label=\{`Open \$\{project\.title\} demo`\}[\s\S]*className="[^"]*\bmin-h-11\b[^"]*\bmin-w-11\b[^"]*"/,
    source: projectsSection,
  },
  {
    label: "project action links use class-based hover styles",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}[\s\S]*hover:text-\[#66b3ff\][\s\S]*aria-label=\{`Open \$\{project\.title\} demo`\}[\s\S]*hover:text-\[#66b3ff\]/,
    source: projectsSection,
  },
  {
    label: "project tech labels use class-based accent styles",
    pattern: /className="[^"]*text-\[#66b3ff\][^"]*"[^>]*>\s*\{project\.tech\}\s*<\/div>/,
    source: projectsSection,
  },
  {
    label: "project carousel hides inactive slides from assistive technology",
    pattern: /role="group"[\s\S]*aria-roledescription="slide"[\s\S]*aria-hidden=\{index !== currentIndex\}/,
    source: projectsSection,
  },
  {
    label: "project carousel exposes active slide status politely",
    pattern: /shouldAnnounceCarouselStatus[\s\S]*role="status"[\s\S]*aria-live=\{shouldAnnounceCarouselStatus \? "polite" : "off"\}[\s\S]*aria-atomic="true"[\s\S]*projects\[currentIndex\]\.title/,
    source: projectsSection,
  },
  {
    label: "project repository links are tabbable only on the active slide",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}[\s\S]*tabIndex=\{index === currentIndex \? 0 : -1\}/,
    source: projectsSection,
  },
  {
    label: "project demo links are tabbable only on the active slide",
    pattern: /aria-label=\{`Open \$\{project\.title\} demo`\}[\s\S]*tabIndex=\{index === currentIndex \? 0 : -1\}/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow buttons have visible keyboard focus styles",
    pattern: /aria-label="Previous project"[\s\S]*focus-visible:outline[\s\S]*aria-label="Next project"[\s\S]*focus-visible:outline/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow buttons keep mobile touch targets inside the viewport",
    pattern: /left-2 md:left-0[\s\S]*md:-translate-x-4[\s\S]*p-3 md:p-2[\s\S]*aria-label="Previous project"[\s\S]*right-2 md:right-0[\s\S]*md:translate-x-4[\s\S]*p-3 md:p-2[\s\S]*aria-label="Next project"/,
    source: projectsSection,
  },
  {
    label: "project carousel arrow icons use class-based accent styles",
    pattern: /<ChevronLeft[^>]*className="[^"]*text-\[#007bff\][^"]*"[\s\S]*<ChevronRight[^>]*className="[^"]*text-\[#007bff\][^"]*"/,
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
    pattern: /index === currentIndex\s*\?\s*'[^']*bg-\[#007bff\][^']*scale-110[^']*'|index === currentIndex\s*\?\s*'[^']*scale-110[^']*bg-\[#007bff\][^']*'/,
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
    /aria-label=\{`View \$\{project\.title\} repository`\}[\s\S]*aria-label=\{`Open \$\{project\.title\} demo`\}[\s\S]*<\/a>/,
  );

  return /onMouseEnter|onMouseLeave/.test(actionLinksMatch?.[0] ?? "");
}

function introCtaUsesMouseHandlers(source) {
  const introCtaMatch = source.match(/href="mailto:michaelrico124@gmail\.com"[\s\S]*?<\/a>/);

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
    /role="tablist"[\s\S]*?<\/motion\.button>\s*\)\)}/,
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
  const controlsMatch = source.match(
    /aria-label="Previous project"[\s\S]*aria-label=\{`Show \$\{project\.title\}`\}[\s\S]*<\/div>/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(controlsMatch?.[0] ?? "");
}

function projectCardContentUsesInlineAccentStyles(source) {
  const contentMatch = source.match(
    /<h3 className="text-2xl font-bold text-white mb-2">[\s\S]*?<div className="flex items-center space-x-4">/,
  );

  return /style=\{[^}]*#[0-9a-fA-F]{6}/.test(contentMatch?.[0] ?? "");
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
