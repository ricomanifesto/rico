import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const workflowPath = path.join(root, ".github/workflows/deploy.yml");
const portfolioPath = path.join(root, "src/content/portfolio.ts");
const heroPath = path.join(root, "src/content/hero.ts");
const introSectionPath = path.join(root, "src/components/IntroSection.tsx");
const experiencePath = path.join(root, "src/components/Experience.tsx");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const packageJson = fs.readFileSync(packagePath, "utf8");
const workflow = fs.readFileSync(workflowPath, "utf8");
const portfolio = fs.readFileSync(portfolioPath, "utf8");
const hero = fs.existsSync(heroPath) ? fs.readFileSync(heroPath, "utf8") : "";
const introSection = fs.readFileSync(introSectionPath, "utf8");
const experienceSection = fs.readFileSync(experiencePath, "utf8");
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
    label: "experience behavior is typed as readonly metadata",
    pattern: /export interface ExperienceBehavior \{[\s\S]*readonly sectionHeadingMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly tabMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*readonly staggerDelay:\s*number;[\s\S]*\};[\s\S]*readonly panelMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly highlightMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*readonly staggerDelay:\s*number;[\s\S]*readonly baseDelay:\s*number;[\s\S]*\};[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "experience behavior preserves current motion timings",
    pattern: /export const experienceBehavior:\s*ExperienceBehavior\s*=\s*\{[\s\S]*sectionHeadingMotion:\s*\{[\s\S]*duration:\s*0\.6[\s\S]*\}[\s\S]*tabMotion:\s*\{[\s\S]*duration:\s*0\.6,[\s\S]*staggerDelay:\s*0\.1[\s\S]*\}[\s\S]*panelMotion:\s*\{[\s\S]*duration:\s*0\.6[\s\S]*\}[\s\S]*highlightMotion:\s*\{[\s\S]*duration:\s*0\.6,[\s\S]*staggerDelay:\s*0\.1,[\s\S]*baseDelay:\s*0\.2[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "experience section uses behavior metadata for motion timing",
    pattern: /import\s*\{\s*experienceBehavior,\s*experiences\s*\}\s*from\s*["']\.\.\/content\/portfolio["'];[\s\S]*transition=\{\{ duration: experienceBehavior\.sectionHeadingMotion\.duration \}\}[\s\S]*duration:\s*experienceBehavior\.tabMotion\.duration,[\s\S]*delay:\s*index\s*\*\s*experienceBehavior\.tabMotion\.staggerDelay,[\s\S]*transition=\{\{ duration: experienceBehavior\.panelMotion\.duration \}\}[\s\S]*duration: experienceBehavior\.highlightMotion\.duration,[\s\S]*delay:\s*highlightIndex\s*\*\s*experienceBehavior\.highlightMotion\.staggerDelay\s*\+\s*experienceBehavior\.highlightMotion\.baseDelay/,
    source: experienceSection,
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
    label: "hero copy is typed as readonly content",
    pattern: /export interface HeroContent \{[\s\S]*readonly headline:\s*string;[\s\S]*readonly subtitle:\s*string;[\s\S]*readonly body:\s*string;[\s\S]*readonly ctaLabel:\s*string;[\s\S]*\}/,
    source: hero,
  },
  {
    label: "hero behavior is typed as readonly metadata",
    pattern: /export interface HeroBehavior \{[\s\S]*readonly typewriterIntervalMs:\s*number;[\s\S]*readonly containerMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*readonly ease:\s*"easeOut";[\s\S]*\};[\s\S]*readonly subtitleMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly bodyMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly ctaMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*\}/,
    source: hero,
  },
  {
    label: "hero content preserves current public copy",
    pattern: /export const heroContent:\s*HeroContent\s*=\s*\{[\s\S]*headline:\s*"Hi, I'm Rico"[\s\S]*subtitle:\s*"I build things when inspiration strikes\."[\s\S]*body:\s*"I'm a Staff Threat Hunter from Chicago, Illinois\. I'm passionate about sharpening my skills in high-stake environments\. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable\."[\s\S]*ctaLabel:\s*"Say hi!"[\s\S]*\}/,
    source: hero,
  },
  {
    label: "hero behavior preserves current typewriter timing",
    pattern: /export const heroBehavior:\s*HeroBehavior\s*=\s*\{[\s\S]*typewriterIntervalMs:\s*150[\s\S]*\}/,
    source: hero,
  },
  {
    label: "hero behavior preserves current motion timings",
    pattern: /containerMotion:\s*\{[\s\S]*duration:\s*0\.8,[\s\S]*ease:\s*"easeOut"[\s\S]*\}[\s\S]*subtitleMotion:\s*\{[\s\S]*delay:\s*0\.5,[\s\S]*duration:\s*0\.8[\s\S]*\}[\s\S]*bodyMotion:\s*\{[\s\S]*delay:\s*0\.7,[\s\S]*duration:\s*0\.8[\s\S]*\}[\s\S]*ctaMotion:\s*\{[\s\S]*delay:\s*0\.9,[\s\S]*duration:\s*0\.8[\s\S]*\}/,
    source: hero,
  },
  {
    label: "intro section renders hero copy from metadata",
    pattern: /import\s*\{\s*heroBehavior,\s*heroContent\s*\}\s*from\s*["']\.\.\/content\/hero["'];[\s\S]*useState\(shouldReduceMotion \? heroContent\.headline : ""\)[\s\S]*setDisplayText\(heroContent\.headline\)[\s\S]*heroContent\.headline\.slice\(0, currentIndex\)[\s\S]*\{heroContent\.subtitle\}[\s\S]*\{heroContent\.body\}[\s\S]*\{heroContent\.ctaLabel\}/,
    source: introSection,
  },
  {
    label: "intro section uses hero behavior metadata for typewriter timing",
    pattern: /import\s*\{\s*heroBehavior,\s*heroContent\s*\}\s*from\s*["']\.\.\/content\/hero["'];[\s\S]*\}, heroBehavior\.typewriterIntervalMs\);/,
    source: introSection,
  },
  {
    label: "intro section uses hero behavior metadata for motion timing",
    pattern: /transition=\{\{ duration: heroBehavior\.containerMotion\.duration, ease: heroBehavior\.containerMotion\.ease \}\}[\s\S]*transition=\{\{ delay: heroBehavior\.subtitleMotion\.delay, duration: heroBehavior\.subtitleMotion\.duration \}\}[\s\S]*transition=\{\{ delay: heroBehavior\.bodyMotion\.delay, duration: heroBehavior\.bodyMotion\.duration \}\}[\s\S]*transition=\{\{ delay: heroBehavior\.ctaMotion\.delay, duration: heroBehavior\.ctaMotion\.duration \}\}/,
    source: introSection,
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
