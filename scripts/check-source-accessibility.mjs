import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentsRoot = path.join(root, "src/components");
const appPath = path.join(root, "src/App.tsx");
const homePath = path.join(root, "src/Home.tsx");
const reducedMotionHookPath = path.join(root, "src/hooks/usePrefersReducedMotion.ts");
const introSectionPath = path.join(root, "src/components/IntroSection.tsx");
const skipLinkPath = path.join(root, "src/components/SkipLink.tsx");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const networkAnimationPath = path.join(root, "src/components/NetworkAnimation.tsx");
const indexCssPath = path.join(root, "src/index.css");
const appSource = fs.readFileSync(appPath, "utf8");
const homeSource = fs.readFileSync(homePath, "utf8");
const reducedMotionHook = fs.existsSync(reducedMotionHookPath)
  ? fs.readFileSync(reducedMotionHookPath, "utf8")
  : "";
const introSection = fs.readFileSync(introSectionPath, "utf8");
const projectsSection = fs.readFileSync(projectsSectionPath, "utf8");
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
    label: "project carousel uses shared reduced-motion preference hook",
    pattern: /usePrefersReducedMotion\(\)/,
    source: projectsSection,
  },
  {
    label: "project carousel skips auto-rotation for reduced motion",
    pattern: /shouldReduceMotion\)\s*\{\s*return;/,
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
];

const failedChecks = checks.filter(({ pattern, source }) => !pattern.test(source));
const failures = failedChecks.map(({ label }) => label);

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

for (const componentPath of walkFiles(componentsRoot)) {
  const source = fs.readFileSync(componentPath, "utf8");
  const svgTags = source.match(/<svg\b[\s\S]*?>/g) ?? [];
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
