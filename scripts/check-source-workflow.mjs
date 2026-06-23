import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const workflowPath = path.join(root, ".github/workflows/deploy.yml");
const portfolioPath = path.join(root, "src/content/portfolio.ts");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const packageJson = fs.readFileSync(packagePath, "utf8");
const workflow = fs.readFileSync(workflowPath, "utf8");
const portfolio = fs.readFileSync(portfolioPath, "utf8");
const projectsSection = fs.readFileSync(projectsSectionPath, "utf8");

const checks = [
  {
    label: "workflow checks out code with a Node 24-compatible action",
    pattern: /uses:\s*actions\/checkout@v7\b/,
  },
  {
    label: "workflow sets up Node with a Node 24-compatible action",
    pattern: /uses:\s*actions\/setup-node@v6\b/,
  },
  {
    label: "workflow uploads the Pages artifact with a Node 24-compatible action",
    pattern: /uses:\s*actions\/upload-pages-artifact@v5\b/,
  },
  {
    label: "workflow deploys Pages with a Node 24-compatible action",
    pattern: /uses:\s*actions\/deploy-pages@v5\b/,
  },
  {
    label: "site build still runs on the pinned project Node version",
    pattern: /node-version:\s*['"]18['"]/,
  },
  {
    label: "workflow installs Chromium for browser interaction checks",
    pattern: /npx playwright install --with-deps chromium/,
    source: workflow,
  },
  {
    label: "package browser check installs Chromium before running tests",
    pattern: /"browser":\s*"playwright install chromium && playwright test"/,
    source: packageJson,
  },
  {
    label: "portfolio project data exports as a readonly collection",
    pattern: /export const projects:\s*readonly ProjectSummary\[\]\s*=/,
    source: portfolio,
  },
  {
    label: "portfolio experience data exports as a readonly collection",
    pattern: /export const experiences:\s*readonly ExperienceItem\[\]\s*=/,
    source: portfolio,
  },
  {
    label: "experience highlights are typed as readonly content",
    pattern: /readonly highlights:\s*readonly string\[\];/,
    source: portfolio,
  },
  {
    label: "project technologies are typed as readonly content",
    pattern: /readonly techStack:\s*readonly string\[\];/,
    source: portfolio,
  },
  {
    label: "project data uses technology lists instead of comma-separated strings",
    pattern: /^(?![\s\S]*\n\s*tech:\s*")[\s\S]*techStack:\s*\[/,
    source: portfolio,
  },
  {
    label: "project cards render technology lists with stable separator text",
    pattern: /project\.techStack\.join\(", "\)/,
    source: projectsSection,
  },
  {
    label: "project action links are typed as readonly metadata",
    pattern: /export interface ProjectActionLink \{[\s\S]*readonly href:\s*string;[\s\S]*readonly external:\s*true;[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "project data groups action links by purpose",
    pattern: /readonly links:\s*\{[\s\S]*readonly repository:\s*ProjectActionLink;[\s\S]*readonly demo:\s*ProjectActionLink \| null;[\s\S]*\};/,
    source: portfolio,
  },
  {
    label: "project data avoids loose action URL fields",
    pattern: /^(?![\s\S]*(readonly repoUrl:\s*string;|readonly demoUrl:\s*string;|\n\s*repoUrl:\s*"|\n\s*demoUrl:\s*"))[\s\S]*links:\s*\{/,
    source: portfolio,
  },
  {
    label: "project cards render action links from metadata",
    pattern: /href=\{project\.links\.repository\.href\}[\s\S]*href=\{project\.links\.demo\.href\}/,
    source: projectsSection,
  },
  {
    label: "project cards apply external action link metadata",
    pattern: /const repositoryTarget = project\.links\.repository\.external \? "_blank" : undefined;[\s\S]*const repositoryRel = project\.links\.repository\.external \? "noopener noreferrer" : undefined;[\s\S]*const demoTarget = project\.links\.demo\?\.external \? "_blank" : undefined;[\s\S]*const demoRel = project\.links\.demo\?\.external \? "noopener noreferrer" : undefined;[\s\S]*target=\{repositoryTarget\}[\s\S]*rel=\{repositoryRel\}[\s\S]*target=\{demoTarget\}[\s\S]*rel=\{demoRel\}/,
    source: projectsSection,
  },
];

const failures = checks
  .filter(({ pattern, source = workflow }) => !pattern.test(source))
  .map(({ label }) => label);

if (failures.length > 0) {
  console.error("Source workflow check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source workflow check passed.");
