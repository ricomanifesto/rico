import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const navigationPath = path.join(srcRoot, "content/navigation.ts");
const headerPath = path.join(srcRoot, "components/Header.tsx");
const headerNavLinkPath = path.join(srcRoot, "components/HeaderNavLink.tsx");
const socialLinkPath = path.join(srcRoot, "components/SocialLink.tsx");
const indexCssPath = path.join(srcRoot, "index.css");
const headerBrandLinkClass = "header-brand-link";
const headerNavLinkClass = "header-nav-link";
const headerNavLinkActiveClass = "header-nav-link-active";
const headerSocialLinkClass = "header-social-link";

const failures = [];
const navigationSource = fs.existsSync(navigationPath) ? fs.readFileSync(navigationPath, "utf8") : "";
const indexCssSource = fs.existsSync(indexCssPath) ? fs.readFileSync(indexCssPath, "utf8") : "";

if (!fs.existsSync(navigationPath)) {
  failures.push("src/content/navigation.ts defines typed navigation data");
} else {
  const sectionHrefs = Array.from(navigationSource.matchAll(/href:\s*["']#([^"']+)["']/g)).map(
    ([, sectionId]) => sectionId,
  );

  if (sectionHrefs.length === 0) {
    failures.push("src/content/navigation.ts includes internal section hrefs");
  }

  if (
    !/export interface HeaderNavItem \{[^}]*readonly label:\s*string;[^}]*readonly href:\s*string;[^}]*\}/.test(navigationSource)
  ) {
    failures.push("Header navigation items expose readonly fields");
  }

  if (
    !/export interface SiteBrand \{[^}]*readonly label:\s*string;[^}]*readonly href:\s*string;[^}]*\}/.test(navigationSource)
  ) {
    failures.push("Header brand metadata exposes readonly fields");
  }

  if (
    !/export const siteBrand:\s*SiteBrand\s*=\s*\{[\s\S]*label:\s*["']Rico Manifesto["'][\s\S]*href:\s*["']#intro["'][\s\S]*\}/.test(navigationSource)
  ) {
    failures.push("Header brand metadata keeps the intro link target");
  }

  if (
    !/export interface SocialLink \{[^}]*readonly label:\s*string;[^}]*readonly href:\s*string;[^}]*readonly kind:\s*SocialLinkKind;[^}]*readonly external:\s*boolean;[^}]*\}/.test(navigationSource)
  ) {
    failures.push("Social links expose readonly fields");
  }

  if (
    !/export const contactLink:\s*SocialLink\s*=\s*\{[\s\S]*label:\s*["']Email["'][\s\S]*href:\s*["']mailto:michaelrico124@gmail\.com["'][\s\S]*kind:\s*["']email["'][\s\S]*external:\s*false[\s\S]*\};/.test(navigationSource)
  ) {
    failures.push("Contact link metadata preserves the email action");
  }

  if (!/export const socialLinks:\s*readonly SocialLink\[\]\s*=\s*\[\s*contactLink,/.test(navigationSource)) {
    failures.push("Social links reuse the typed contact link metadata");
  }

  const sourceFiles = walkFiles(srcRoot)
    .filter((filePath) => filePath.endsWith(".tsx"))
    .map((filePath) => fs.readFileSync(filePath, "utf8"))
    .join("\n");

  for (const sectionId of sectionHrefs) {
    const idPattern = new RegExp(`id=["']${escapeRegExp(sectionId)}["']`);
    if (!idPattern.test(sourceFiles)) {
      failures.push(`Navigation target #${sectionId} has a matching section id`);
    }

    const sectionClassName = findSectionClassName(sourceFiles, sectionId);

    if (sectionId === "intro") {
      if (!introPreservesMobileHeaderSpace(sectionClassName, indexCssSource)) {
        failures.push("Navigation target #intro reserves mobile header space");
      }
    } else if (!sectionPreservesMobileScrollOffset(sectionClassName, indexCssSource)) {
        failures.push(`Navigation target #${sectionId} preserves mobile scroll offset`);
    }
  }

  for (const [, href, external] of navigationSource.matchAll(
    /href:\s*["']([^"']+)["'][\s\S]*?external:\s*(true|false)/g,
  )) {
    if (href.startsWith("https://") && external !== "true") {
      failures.push(`${href} is marked as an external link`);
    }

    if (href.startsWith("mailto:") && external !== "false") {
      failures.push(`${href} is marked as an internal mail link`);
    }
  }
}

if (fs.existsSync(headerPath)) {
  const headerSource = fs.readFileSync(headerPath, "utf8");

  if (!/import\s+\{\s*headerNavItems,\s*headerNavigationBehavior,\s*siteBrand,\s*socialLinks\s*\}\s+from\s+["']@\/content\/navigation["'];/.test(headerSource)) {
    failures.push("Header imports the typed brand metadata");
  }

  if (!/<a[\s\S]*href=\{siteBrand\.href\}[\s\S]*>\s*\{siteBrand\.label\}\s*<\/a>/.test(headerSource)) {
    failures.push("Header brand text links back to the intro section from metadata");
  }

  if (!headerSource.includes(headerBrandLinkClass)) {
    failures.push("Header brand link uses the shared header interactive visual contract");
  }

  if (!fs.existsSync(headerNavLinkPath)) {
    failures.push("src/components/HeaderNavLink.tsx renders header navigation links");
  }

  if (!/import\s+HeaderNavLink\s+from\s+["']@\/components\/HeaderNavLink["'];/.test(headerSource)) {
    failures.push("Header uses the shared HeaderNavLink component");
  }

  if (!fs.existsSync(socialLinkPath)) {
    failures.push("src/components/SocialLink.tsx renders social links");
  }

  if (!/import\s+SocialLink\s+from\s+["']@\/components\/SocialLink["'];/.test(headerSource)) {
    failures.push("Header uses the shared SocialLink component");
  }

  if (!/aria-label="Mobile primary"/.test(headerSource)) {
    failures.push("Header exposes mobile primary navigation");
  }

  if (
    !/className="header-mobile-nav"/.test(headerSource) ||
    !/\.header-mobile-nav\s*\{[\s\S]*border-top:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);[\s\S]*@media \(min-width: 768px\)\s*\{[\s\S]*\.header-mobile-nav\s*\{[\s\S]*display:\s*none;/.test(indexCssSource)
  ) {
    failures.push("Header keeps mobile navigation scoped below the desktop breakpoint");
  }

  if (!/aria-label="Mobile primary"[\s\S]*?headerNavItems\.map\(\(item\)\s*=>/.test(headerSource)) {
    failures.push("Header mobile navigation renders from shared typed navigation data");
  }

  if (
    !/aria-label="Mobile primary"[\s\S]*<ul\b[^>]*className="header-mobile-list"/.test(headerSource) ||
    !/\.header-mobile-list\s*\{[\s\S]*display:\s*flex;[\s\S]*gap:\s*1rem;[\s\S]*overflow-x:\s*auto;/.test(indexCssSource)
  ) {
    failures.push("Header mobile navigation exposes the horizontal link rail as a list");
  }

  if (!/aria-label="Mobile primary"[\s\S]*<ul\b[^>]*role="list"/.test(headerSource)) {
    failures.push("Header mobile navigation uses an explicit list role");
  }

  if (!/aria-label="Mobile primary"[\s\S]*headerNavItems\.map\(\(item\)\s*=>\s*\(\s*<li\b[^>]*role="listitem"/.test(headerSource)) {
    failures.push("Header mobile navigation wraps each shared nav item in a list item");
  }

  if (
    !/aria-label="Mobile primary"[\s\S]*<HeaderNavLink[\s\S]*item=\{item\}[\s\S]*isActive=\{item\.href === activeHref\}[\s\S]*variant="mobile"/.test(
      headerSource,
    )
  ) {
    failures.push("Header mobile navigation uses the shared HeaderNavLink component");
  }

  if (
    !/scrollListenerOptions:\s*\{\s*passive:\s*true\s*\}/.test(navigationSource) ||
    !/window\.addEventListener\("scroll",\s*handleScroll,\s*headerNavigationBehavior\.scrollListenerOptions\);/.test(headerSource) ||
    !/window\.removeEventListener\("scroll",\s*handleScroll,\s*headerNavigationBehavior\.scrollListenerOptions\);/.test(headerSource)
  ) {
    failures.push("Header uses a passive scroll listener");
  }

  const socialNavSource = findNamedNavBlock(headerSource, "Social links");

  if (!socialNavSource) {
    failures.push("Header exposes social links as named navigation");
  }

  if (socialNavSource && !/socialLinks\.map\(\(link\)\s*=>/.test(socialNavSource)) {
    failures.push("Header social navigation renders from shared typed social link data");
  }

  if (socialNavSource && !/<ul\b[^>]*role="list"/.test(socialNavSource)) {
    failures.push("Header social navigation uses an explicit list role");
  }

  if (socialNavSource && !/socialLinks\.map\(\(link\)\s*=>\s*\(\s*<li\b[^>]*role="listitem"/.test(socialNavSource)) {
    failures.push("Header social navigation wraps each shared social link in a list item");
  }
}

for (const componentPath of [headerNavLinkPath, socialLinkPath]) {
  if (!fs.existsSync(componentPath)) {
    continue;
  }

  const source = fs.readFileSync(componentPath, "utf8");
  if (/onMouseEnter|onMouseLeave/.test(source)) {
    failures.push(`${path.relative(root, componentPath)} uses class-based hover styles`);
  }

  if (componentPath === headerNavLinkPath && !source.includes(headerNavLinkClass)) {
    failures.push(`${path.relative(root, componentPath)} uses the shared header nav visual contract`);
  }

  if (
    componentPath === headerNavLinkPath &&
    !/type HeaderNavLinkVariant = "desktop" \| "mobile";[\s\S]*variant\?: HeaderNavLinkVariant;/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} exposes a typed desktop/mobile variant`);
  }

  if (
    componentPath === headerNavLinkPath &&
    !/interface HeaderNavLinkClassContract \{[\s\S]*readonly getLayoutClass:\s*\(isLast:\s*boolean\)\s*=>\s*string;[\s\S]*readonly inactiveClass:\s*string;[\s\S]*\}[\s\S]*const headerNavLinkClassContract:\s*Record<HeaderNavLinkVariant,\s*HeaderNavLinkClassContract>\s*=\s*\{[\s\S]*desktop:\s*\{[\s\S]*getLayoutClass:\s*\(isLast\)\s*=>\s*\(isLast \? "" : "header-nav-link-desktop-spaced"\)[\s\S]*inactiveClass:\s*"header-nav-link-idle"[\s\S]*mobile:\s*\{[\s\S]*getLayoutClass:\s*\(\)\s*=>\s*"header-nav-link-mobile"[\s\S]*inactiveClass:\s*"header-nav-link-idle"[\s\S]*export default function HeaderNavLink[\s\S]*const \{ getLayoutClass, inactiveClass \} = headerNavLinkClassContract\[variant\];[\s\S]*const layoutClass = getLayoutClass\(isLast\);[\s\S]*const activeClass = isActive \? activeHeaderNavLinkClass : inactiveClass;/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} uses the typed nav link class contract`);
  }

  if (componentPath === headerNavLinkPath && !source.includes(headerNavLinkActiveClass)) {
    failures.push(`${path.relative(root, componentPath)} uses the shared active header nav visual contract`);
  }

  if (componentPath === socialLinkPath && !source.includes(headerSocialLinkClass)) {
    failures.push(`${path.relative(root, componentPath)} uses the shared header social visual contract`);
  }

  if (
    componentPath === socialLinkPath &&
    (
      !/className="header-social-link"/.test(source) ||
      !/\.header-social-link\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*min-width:\s*2\.75rem;[\s\S]*min-height:\s*2\.75rem;[\s\S]*align-items:\s*center;[\s\S]*justify-content:\s*center;/.test(indexCssSource)
    )
  ) {
    failures.push(`${path.relative(root, componentPath)} uses mobile-friendly touch targets`);
  }

  if (
    componentPath === socialLinkPath &&
    !/import\s+\{\s*Github,\s*Linkedin,\s*Mail/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} uses shared icon components for supported social links`);
  }

  if (
    componentPath === socialLinkPath &&
    !/const socialIconRegistry:[\s\S]*email:\s*\(\)\s*=>\s*<Mail\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the email social link with the shared mail icon`);
  }

  if (
    componentPath === socialLinkPath &&
    !/const socialIconRegistry:[\s\S]*github:\s*\(\)\s*=>\s*<Github\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the GitHub social link with the shared GitHub icon`);
  }

  if (
    componentPath === socialLinkPath &&
    !/const socialIconRegistry:[\s\S]*linkedin:\s*\(\)\s*=>\s*<Linkedin\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the LinkedIn social link with the shared LinkedIn icon`);
  }
}

if (
  !/\.header-brand-link\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*\.header-brand-link:hover\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*\.header-brand-link:focus-visible,[\s\S]*\.header-nav-link:focus-visible,[\s\S]*\.header-social-link:focus-visible\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*outline:\s*2px solid var\(--portfolio-focus-ring\);[\s\S]*\.header-nav-link\s*\{[\s\S]*color:\s*var\(--portfolio-page-foreground\);[\s\S]*\.header-nav-link-idle\s*\{[\s\S]*color:\s*var\(--portfolio-copy\);[\s\S]*\.header-nav-link:hover\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*\.header-nav-link-active\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*\.header-social-link\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);[\s\S]*\.header-social-link:hover\s*\{[\s\S]*color:\s*var\(--portfolio-active-accent\);/.test(indexCssSource)
) {
  failures.push("src/index.css defines the shared header interactive visual contract");
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSectionClassName(source, sectionId) {
  const sectionPattern = new RegExp(
    `<section\\b(?=[^>]*\\bid=["']${escapeRegExp(sectionId)}["'])(?=[^>]*\\bclassName=["']([^"']*)["'])[^>]*>`,
  );
  const match = source.match(sectionPattern);
  return match?.[1] ?? null;
}

function sectionPreservesMobileScrollOffset(sectionClassName, cssSource) {
  if (!sectionClassName) {
    return false;
  }

  if (sectionClassName.includes("scroll-mt-36")) {
    return true;
  }

  return (
    sectionClassName.split(/\s+/).includes("portfolio-section") &&
    /\.portfolio-section\s*\{[\s\S]*scroll-margin-top:\s*9rem;/.test(cssSource)
  );
}

function introPreservesMobileHeaderSpace(sectionClassName, cssSource) {
  if (!sectionClassName) {
    return false;
  }

  if (
    sectionClassName.includes("pt-36") &&
    sectionClassName.includes("md:pt-16")
  ) {
    return true;
  }

  return (
    sectionClassName.split(/\s+/).includes("hero-section") &&
    /\.hero-section\s*\{[\s\S]*padding:\s*9rem 1rem 0;[\s\S]*@media \(min-width: 768px\)\s*\{[\s\S]*\.hero-section\s*\{[\s\S]*padding-top:\s*4rem;/.test(cssSource)
  );
}

function findNamedNavBlock(source, label) {
  const navPattern = new RegExp(
    `<nav\\b(?=[^>]*\\baria-label=["']${escapeRegExp(label)}["'])[^>]*>[\\s\\S]*?<\\/nav>`,
  );
  return source.match(navPattern)?.[0] ?? null;
}

if (failures.length > 0) {
  console.error("Source navigation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source navigation check passed.");
