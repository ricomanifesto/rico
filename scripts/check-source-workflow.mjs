import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const packageJson = JSON.parse(read("package.json"));
const workflow = read(".github/workflows/deploy.yml");
const playwright = read("playwright.config.mjs");
const cleanup = read("scripts/clean-test-artifacts.mjs");
const portfolio = read("src/content/portfolio.ts");
const projectsSection = read("src/components/ProjectsSection.tsx");
const projectRoute = read("src/pages/projects/[slug].astro");
const sitemap = read("src/pages/sitemap.xml.ts");
const failures = [];

// Classification:
// - This script owns workflow wiring, canonical source ownership, and migration
//   boundaries.
// - Image files and budgets belong to check-source-images.
// - Route/metadata/public-file outcomes belong to check-build-output.
// - Interaction, accessibility, contrast, focus, and layout belong to Playwright.
for (const action of [
  "actions/checkout@",
  "actions/setup-node@",
  "actions/upload-pages-artifact@",
  "actions/deploy-pages@",
]) {
  if (!workflow.includes(action)) {
    failures.push(`Deployment workflow is missing ${action}`);
  }
}

for (const command of [
  "npm ci",
  "npx playwright install --with-deps chromium",
  "npm run check",
]) {
  if (!workflow.includes(`run: ${command}`)) {
    failures.push(`Deployment workflow is missing command: ${command}`);
  }
}

const minimumNode = packageJson.engines?.node?.replace(/^>=/, "");
if (!minimumNode || !workflow.includes(`node-version: '${minimumNode}'`)) {
  failures.push("Deployment workflow does not use the package minimum Node version");
}

for (const scriptName of ["lint", "typecheck", "a11y", "images", "nav", "workflow", "browser", "build", "smoke"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json is missing ${scriptName} script`);
  }
}

for (const command of [
  "npm run lint",
  "npm run typecheck",
  "npm run a11y",
  "npm run images",
  "npm run nav",
  "npm run workflow",
  "npm run browser",
  "npm run build",
  "npm run smoke",
]) {
  if (!packageJson.scripts.check?.includes(command)) {
    failures.push(`Full check does not include ${command}`);
  }
}

if (!packageJson.scripts.browser.includes("clean-test-artifacts.mjs")
  || !packageJson.scripts.browser.includes("playwright test")) {
  failures.push("Browser script does not clean stale artifacts and run Playwright");
}

for (const directory of ["test-results", "playwright-report", "blob-report"]) {
  if (!cleanup.includes(`"${directory}"`)) {
    failures.push(`Test cleanup does not remove ${directory}`);
  }
}

if (!playwright.includes('testDir: "./tests/browser"')
  || !playwright.includes('command: "npm run build && npm run preview')) {
  failures.push("Playwright does not test the built preview from tests/browser");
}

for (const [label, source, required] of [
  ["homepage projects", projectsSection, 'import { projectActionLinkBehavior, projects }'],
  ["project routes", projectRoute, 'import { projects, type PortfolioProject }'],
  ["sitemap", sitemap, 'import { projects }'],
]) {
  if (!source.includes(required)) {
    failures.push(`${label} do not use the canonical portfolio collection`);
  }
}

if (!projectRoute.includes("getStaticPaths()") || !projectRoute.includes("projects.map")) {
  failures.push("Project routes are not generated from the canonical collection");
}

if (projectsSection.includes("setInterval") || projectsSection.includes("projectCarousel")) {
  failures.push("Project collection still owns timer-driven carousel state");
}

if (!projectsSection.includes('href={`/projects/${project.page.slug}/`}')) {
  failures.push("Project cards do not derive first-party routes from their canonical slugs");
}

const nestedCaseStudy = join(root, "src/pages/projects/sentrysearch/llm-evaluation.astro");
const legacyCaseStudy = join(root, "public/projects/sentrysearch/llm-evaluation/index.html");
if (!existsSync(nestedCaseStudy) || existsSync(legacyCaseStudy)) {
  failures.push("Nested SentrySearch evidence is not owned by the shared Astro route");
}

for (const removedBehavior of ["projectCarouselBehavior", "aboutBehavior", "footerBehavior"]) {
  if (portfolio.includes(removedBehavior)) {
    failures.push(`Portfolio content still freezes presentation through ${removedBehavior}`);
  }
}

for (const script of [
  "scripts/check-source-accessibility.mjs",
  "scripts/check-source-navigation.mjs",
  "scripts/check-source-workflow.mjs",
]) {
  const scriptPath = join(root, script);
  const content = readFileSync(scriptPath, "utf8");
  if (statSync(scriptPath).size > 16 * 1024) {
    failures.push(`${script} is too large for its narrow source-level contract`);
  }
  if (/#[0-9a-f]{3,8}|font-size:\\s|padding:\\s/i.test(content)) {
    failures.push(`${script} pins cosmetic source literals`);
  }
}

if (failures.length > 0) {
  console.error("Source workflow check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source workflow check passed.");
