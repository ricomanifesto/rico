import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const workflowPath = path.join(root, ".github/workflows/deploy.yml");
const cleanTestArtifactsPath = path.join(root, "scripts/clean-test-artifacts.mjs");
const portfolioPath = path.join(root, "src/content/portfolio.ts");
const heroPath = path.join(root, "src/content/hero.ts");
const navigationPath = path.join(root, "src/content/navigation.ts");
const homePath = path.join(root, "src/Home.tsx");
const headerPath = path.join(root, "src/components/Header.tsx");
const introSectionPath = path.join(root, "src/components/IntroSection.tsx");
const networkAnimationPath = path.join(root, "src/components/NetworkAnimation.tsx");
const aboutMePath = path.join(root, "src/components/AboutMe.tsx");
const experiencePath = path.join(root, "src/components/Experience.tsx");
const footerPath = path.join(root, "src/components/Footer.tsx");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const browserTestPath = path.join(root, "tests/browser/home.spec.mjs");
const packageJson = fs.readFileSync(packagePath, "utf8");
const workflow = fs.readFileSync(workflowPath, "utf8");
const cleanTestArtifacts = fs.readFileSync(cleanTestArtifactsPath, "utf8");
const portfolio = fs.readFileSync(portfolioPath, "utf8");
const hero = fs.existsSync(heroPath) ? fs.readFileSync(heroPath, "utf8") : "";
const navigation = fs.readFileSync(navigationPath, "utf8");
const home = fs.readFileSync(homePath, "utf8");
const header = fs.readFileSync(headerPath, "utf8");
const introSection = fs.readFileSync(introSectionPath, "utf8");
const networkAnimation = fs.readFileSync(networkAnimationPath, "utf8");
const aboutMeSection = fs.readFileSync(aboutMePath, "utf8");
const experienceSection = fs.readFileSync(experiencePath, "utf8");
const footerSection = fs.readFileSync(footerPath, "utf8");
const projectsSection = fs.readFileSync(projectsSectionPath, "utf8");
const browserTests = fs.readFileSync(browserTestPath, "utf8");

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
    label: "home shell avoids narration-only file comments",
    pattern: /^(?![\s\S]*\/\/\s*src\/Home\.tsx\s+-\s+This should NOT contain any CSS)[\s\S]*$/,
    source: home,
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
    pattern: /"browser":\s*"node scripts\/clean-test-artifacts\.mjs && playwright install chromium && playwright test"/,
    source: packageJson,
  },
  {
    label: "package browser check clears stale Playwright artifacts before running tests",
    pattern: /"browser":\s*"node scripts\/clean-test-artifacts\.mjs && playwright install chromium && playwright test"/,
    source: packageJson,
  },
  {
    label: "test artifact cleanup removes Playwright output directories",
    pattern: /const generatedArtifactDirs = \["test-results", "playwright-report", "blob-report"\];[\s\S]*rmSync\(join\(root, artifactDir\), \{ force: true, recursive: true \}\);/,
    source: cleanTestArtifacts,
  },
  {
    label: "browser tests guard mobile nav rail overflow behavior",
    pattern: /test\("keeps every mobile nav rail item reachable without page overflow"[\s\S]*scrollIntoViewIfNeeded\(\)[\s\S]*metrics\.scrollWidth\)\.toBe\(metrics\.clientWidth\)/,
    source: browserTests,
  },
  {
    label: "browser tests guard safe external link attributes",
    pattern: /test\("opens external portfolio links with safe new-tab attributes"[\s\S]*target",\s*"_blank"[\s\S]*rel",\s*"noopener noreferrer"/,
    source: browserTests,
  },
  {
    label: "portfolio project data exports as a readonly collection",
    pattern: /export const projects:\s*readonly ProjectSummary\[\]\s*=/,
    source: portfolio,
  },
  {
    label: "footer behavior is typed as readonly metadata",
    pattern: /export interface FooterBehavior \{[\s\S]*readonly containerMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "footer behavior preserves current motion timing",
    pattern: /export const footerBehavior:\s*FooterBehavior\s*=\s*\{[\s\S]*containerMotion:\s*\{[\s\S]*duration:\s*0\.5[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "footer uses behavior metadata for motion timing",
    pattern: /import\s*\{\s*footerBehavior\s*\}\s*from\s*["']\.\.\/content\/portfolio["'];[\s\S]*transition=\{\{ duration: footerBehavior\.containerMotion\.duration \}\}/,
    source: footerSection,
  },
  {
    label: "project carousel behavior is typed as readonly metadata",
    pattern: /export interface ProjectCarouselBehavior \{[\s\S]*readonly autoRotationIntervalMs:\s*number;[\s\S]*readonly keyboardActivationKeys:\s*readonly string\[\];[\s\S]*readonly sectionHeadingMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly slideMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*readonly staggerDelay:\s*number;[\s\S]*\};[\s\S]*readonly hoverMotion:\s*\{[\s\S]*readonly scale:\s*number;[\s\S]*\};[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "project carousel behavior preserves current motion timings",
    pattern: /export const projectCarouselBehavior:\s*ProjectCarouselBehavior\s*=\s*\{[\s\S]*autoRotationIntervalMs:\s*10000,[\s\S]*keyboardActivationKeys:\s*\["Enter",\s*" "\],[\s\S]*sectionHeadingMotion:\s*\{[\s\S]*duration:\s*0\.6[\s\S]*\}[\s\S]*slideMotion:\s*\{[\s\S]*duration:\s*0\.6,[\s\S]*staggerDelay:\s*0\.1[\s\S]*\}[\s\S]*hoverMotion:\s*\{[\s\S]*scale:\s*1\.02[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "project carousel uses behavior metadata for timing",
    pattern: /import\s*\{\s*projectCarouselBehavior,\s*projects\s*\}\s*from\s*["']\.\.\/content\/portfolio["'];[\s\S]*\},\s*projectCarouselBehavior\.autoRotationIntervalMs\);[\s\S]*projectCarouselBehavior\.keyboardActivationKeys\.includes\(event\.key\)[\s\S]*transition=\{\{ duration: projectCarouselBehavior\.sectionHeadingMotion\.duration \}\}[\s\S]*duration:\s*projectCarouselBehavior\.slideMotion\.duration,[\s\S]*delay:\s*index\s*\*\s*projectCarouselBehavior\.slideMotion\.staggerDelay[\s\S]*whileHover=\{[\s\S]*shouldReduceMotion\s*\?\s*undefined\s*:\s*\{\s*scale:\s*projectCarouselBehavior\.hoverMotion\.scale\s*\}[\s\S]*\}/,
    source: projectsSection,
  },
  {
    label: "about content is typed as readonly metadata",
    pattern: /export interface AboutContent \{[\s\S]*readonly technologies:\s*readonly string\[\];[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "about behavior is typed as readonly metadata",
    pattern: /export interface AboutBehavior \{[\s\S]*readonly sectionHeadingMotion:\s*\{[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly introMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly technologiesMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly technologyItemMotion:\s*\{[\s\S]*readonly baseDelay:\s*number;[\s\S]*readonly staggerDelay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly interestsMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*readonly imageMotion:\s*\{[\s\S]*readonly delay:\s*number;[\s\S]*readonly duration:\s*number;[\s\S]*\};[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "about content preserves current technologies",
    pattern: /export const aboutContent:\s*AboutContent\s*=\s*\{[\s\S]*technologies:\s*\[\s*"Python",\s*"Next\.js",\s*"FastAPI",\s*"Go",\s*"scikit-learn",\s*"LangGraph",?\s*\][\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "about behavior preserves current motion timings",
    pattern: /export const aboutBehavior:\s*AboutBehavior\s*=\s*\{[\s\S]*sectionHeadingMotion:\s*\{[\s\S]*duration:\s*0\.6[\s\S]*\}[\s\S]*introMotion:\s*\{[\s\S]*delay:\s*0\.2,[\s\S]*duration:\s*0\.8[\s\S]*\}[\s\S]*technologiesMotion:\s*\{[\s\S]*delay:\s*0\.4,[\s\S]*duration:\s*0\.8[\s\S]*\}[\s\S]*technologyItemMotion:\s*\{[\s\S]*baseDelay:\s*0\.6,[\s\S]*staggerDelay:\s*0\.1,[\s\S]*duration:\s*0\.6[\s\S]*\}[\s\S]*interestsMotion:\s*\{[\s\S]*delay:\s*1\.0,[\s\S]*duration:\s*0\.8[\s\S]*\}[\s\S]*imageMotion:\s*\{[\s\S]*delay:\s*0\.8,[\s\S]*duration:\s*0\.8[\s\S]*\}/,
    source: portfolio,
  },
  {
    label: "about section renders technologies from metadata",
    pattern: /import\s*\{\s*aboutBehavior,\s*aboutContent\s*\}\s*from\s*["']\.\.\/content\/portfolio["'];[\s\S]*aboutContent\.technologies\.map\(\(tech, index\)/,
    source: aboutMeSection,
  },
  {
    label: "about section uses behavior metadata for motion timing",
    pattern: /import\s*\{\s*aboutBehavior,\s*aboutContent\s*\}\s*from\s*["']\.\.\/content\/portfolio["'];[\s\S]*transition=\{\{ duration: aboutBehavior\.sectionHeadingMotion\.duration \}\}[\s\S]*delay:\s*aboutBehavior\.introMotion\.delay,\s*duration:\s*aboutBehavior\.introMotion\.duration[\s\S]*delay:\s*aboutBehavior\.technologiesMotion\.delay,[\s\S]*duration:\s*aboutBehavior\.technologiesMotion\.duration[\s\S]*aboutBehavior\.technologyItemMotion\.baseDelay[\s\S]*aboutBehavior\.technologyItemMotion\.staggerDelay[\s\S]*duration:\s*aboutBehavior\.technologyItemMotion\.duration[\s\S]*delay:\s*aboutBehavior\.interestsMotion\.delay,\s*duration:\s*aboutBehavior\.interestsMotion\.duration[\s\S]*delay:\s*aboutBehavior\.imageMotion\.delay,\s*duration:\s*aboutBehavior\.imageMotion\.duration/,
    source: aboutMeSection,
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
    pattern: /export const heroContent:\s*HeroContent\s*=\s*\{[\s\S]*headline:\s*"Hi, I'm Rico"[\s\S]*subtitle:\s*"I build things when inspiration strikes\."[\s\S]*body:\s*"I'm a Staff Threat Hunter from Chicago, Illinois\. I'm passionate about sharpening my skills in high-stakes environments\. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable\."[\s\S]*ctaLabel:\s*"Say hi!"[\s\S]*\}/,
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
    label: "hero network animation behavior is typed as readonly metadata",
    pattern: /export interface NetworkAnimationBehavior \{[\s\S]*readonly maxNodes:\s*number;[\s\S]*readonly connectionThresholdPx:\s*number;[\s\S]*readonly resizeDebounceMs:\s*number;[\s\S]*readonly nodeSizePx:\s*\{[\s\S]*readonly min:\s*number;[\s\S]*readonly variance:\s*number;[\s\S]*\};[\s\S]*readonly nodeOpacity:\s*\{[\s\S]*readonly min:\s*number;[\s\S]*readonly variance:\s*number;[\s\S]*\};[\s\S]*readonly nodeVelocity:\s*\{[\s\S]*readonly range:\s*number;[\s\S]*readonly offset:\s*number;[\s\S]*\};[\s\S]*readonly bounceDamping:\s*\{[\s\S]*readonly min:\s*number;[\s\S]*readonly variance:\s*number;[\s\S]*\};[\s\S]*readonly colors:\s*readonly string\[\];[\s\S]*\}/,
    source: hero,
  },
  {
    label: "hero network animation behavior preserves current visual constants",
    pattern: /export const networkAnimationBehavior:\s*NetworkAnimationBehavior\s*=\s*\{[\s\S]*maxNodes:\s*15,[\s\S]*connectionThresholdPx:\s*200,[\s\S]*resizeDebounceMs:\s*250,[\s\S]*nodeSizePx:\s*\{[\s\S]*min:\s*4,[\s\S]*variance:\s*6[\s\S]*\}[\s\S]*nodeOpacity:\s*\{[\s\S]*min:\s*0\.3,[\s\S]*variance:\s*0\.6[\s\S]*\}[\s\S]*nodeVelocity:\s*\{[\s\S]*range:\s*0\.4,[\s\S]*offset:\s*0\.2[\s\S]*\}[\s\S]*bounceDamping:\s*\{[\s\S]*min:\s*0\.9,[\s\S]*variance:\s*0\.2[\s\S]*\}[\s\S]*colors:\s*\[[\s\S]*rgba\(0, 123, 255, 0\.7\)[\s\S]*rgba\(32, 201, 151, 0\.6\)[\s\S]*\]/,
    source: hero,
  },
  {
    label: "network animation consumes typed hero behavior metadata",
    pattern: /import\s*\{\s*networkAnimationBehavior\s*\}\s*from\s*["']\.\.\/content\/hero["'];[\s\S]*networkAnimationBehavior\.maxNodes[\s\S]*networkAnimationBehavior\.nodeSizePx\.variance[\s\S]*networkAnimationBehavior\.nodeSizePx\.min[\s\S]*networkAnimationBehavior\.nodeOpacity\.variance[\s\S]*networkAnimationBehavior\.nodeOpacity\.min[\s\S]*networkAnimationBehavior\.colors[\s\S]*networkAnimationBehavior\.nodeVelocity\.range[\s\S]*networkAnimationBehavior\.nodeVelocity\.offset[\s\S]*networkAnimationBehavior\.connectionThresholdPx[\s\S]*networkAnimationBehavior\.bounceDamping\.min[\s\S]*networkAnimationBehavior\.bounceDamping\.variance[\s\S]*networkAnimationBehavior\.resizeDebounceMs/,
    source: networkAnimation,
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
  {
    label: "header navigation behavior is typed as readonly metadata",
    pattern: /export interface HeaderNavigationBehavior \{[\s\S]*readonly activeSectionOffsetPx:\s*number;[\s\S]*readonly scrolledShadowThresholdPx:\s*number;[\s\S]*readonly scrollListenerOptions:\s*AddEventListenerOptions;[\s\S]*\}/,
    source: navigation,
  },
  {
    label: "header navigation behavior preserves current scroll thresholds",
    pattern: /export const headerNavigationBehavior:\s*HeaderNavigationBehavior\s*=\s*\{[\s\S]*activeSectionOffsetPx:\s*160,[\s\S]*scrolledShadowThresholdPx:\s*10,[\s\S]*scrollListenerOptions:\s*\{ passive:\s*true \}[\s\S]*\}/,
    source: navigation,
  },
  {
    label: "header consumes typed navigation behavior metadata",
    pattern: /import\s*\{\s*headerNavItems,\s*headerNavigationBehavior,\s*siteBrand,\s*socialLinks\s*\}\s*from\s*["']@\/content\/navigation["'];[\s\S]*window\.scrollY > headerNavigationBehavior\.scrolledShadowThresholdPx[\s\S]*top <= headerNavigationBehavior\.activeSectionOffsetPx[\s\S]*window\.addEventListener\("scroll", handleScroll, headerNavigationBehavior\.scrollListenerOptions\)[\s\S]*window\.removeEventListener\("scroll", handleScroll, headerNavigationBehavior\.scrollListenerOptions\)/,
    source: header,
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
