import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const srcRoot = join(root, "src");
const failures = [];

const read = (path) => readFileSync(join(root, path), "utf8");
const sourceFiles = walk(srcRoot).filter((path) => /\.(astro|tsx)$/.test(path));
const source = sourceFiles.map((path) => ({ path, content: readFileSync(path, "utf8") }));
const home = read("src/Home.tsx");
const about = read("src/components/AboutMe.tsx");
const experience = read("src/components/Experience.tsx");
const projects = read("src/components/ProjectsSection.tsx");
const projectPage = read("src/pages/projects/[slug].astro");
const footer = read("src/components/Footer.tsx");
const indexCss = read("src/index.css");

// This check intentionally owns source-level semantic invariants only.
// Contrast, focus visibility/order, tap targets, responsive overflow, reduced
// motion, and visitor journeys are measured in Playwright against the build.
for (const { path, content } of source) {
  if (/\btabIndex=\{[1-9]\d*\}|\btabindex=["'][1-9]\d*["']/.test(content)) {
    failures.push(`${relative(root, path)} uses a positive tabindex`);
  }

  if (/<(?:div|span)\b[^>]*\bonClick=/.test(content)) {
    failures.push(`${relative(root, path)} puts click behavior on a non-interactive element`);
  }
}

if (/outline\s*:\s*(?:none|0)\b/.test(indexCss)) {
  failures.push("src/index.css removes focus outlines");
}

for (const [label, content] of [
  ["About", about],
  ["Experience", experience],
  ["Projects", projects],
  ["Footer", footer],
]) {
  if (content.includes("whileInView") || /initial=\{\{[^}]*opacity:\s*0/.test(content)) {
    failures.push(`${label} content is hidden until it enters the viewport`);
  }
}

for (const required of ["<SkipLink />", "<main id=\"main-content\" tabIndex={-1}", "<Header />"]) {
  if (!home.includes(required)) {
    failures.push(`Home is missing semantic shell element: ${required}`);
  }
}

for (const [label, content, id, headingId] of [
  ["About", about, "about", "about-heading"],
  ["Experience", experience, "experience", "experience-heading"],
  ["Projects", projects, "projects", "projects-heading"],
]) {
  if (!content.includes(`id=\"${id}\"`) || !content.includes(`aria-labelledby=\"${headingId}\"`)) {
    failures.push(`${label} section is not named by its visible heading`);
  }
}

for (const required of [
  'role="tablist"',
  'aria-orientation="vertical"',
  'role="tab"',
  'aria-selected={isSelected}',
  'aria-controls={`experience-panel-${index}`}',
  'role="tabpanel"',
  'aria-labelledby={`experience-tab-${index}`}',
]) {
  if (!experience.includes(required)) {
    failures.push(`Experience is missing tab semantic: ${required}`);
  }
}

for (const required of [
  "<article",
  'data-testid="project-collection"',
  'aria-label={`Read ${project.page.name} case study`}',
  'aria-label={`Inspect ${project.page.name} evidence`}',
  'aria-label={getLabel(projectTitle)}',
  'alt=""',
  'aria-hidden="true"',
]) {
  if (!projects.includes(required)) {
    failures.push(`Projects is missing semantic: ${required}`);
  }
}

for (const content of [projects, projectPage]) {
  if (!content.includes('aria-label={`Inspect ${project.page.name} evidence`}')) {
    failures.push("Project evidence links do not have project-specific accessible names");
  }
}

if (!indexCss.includes("@media (prefers-reduced-motion: reduce)")) {
  failures.push("Global styles do not declare a reduced-motion fallback");
}

if (!/prefers-reduced-motion:\s*reduce[\s\S]*scroll-behavior:\s*auto/.test(indexCss)) {
  failures.push("Reduced-motion styles do not disable smooth scrolling");
}

if (failures.length > 0) {
  console.error("Source accessibility check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source accessibility check passed.");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
