import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const navigationPath = path.join(srcRoot, "content/navigation.ts");
const headerPath = path.join(srcRoot, "components/Header.tsx");
const headerNavLinkPath = path.join(srcRoot, "components/HeaderNavLink.tsx");
const socialLinkPath = path.join(srcRoot, "components/SocialLink.tsx");
const headerBrandHoverAccentClass = "hover:text-[#66b2ff]";
const navHoverAccentClass = "hover:text-[#007bff]";
const socialBaseAccentClass = "text-[#007bff]";

const failures = [];

if (!fs.existsSync(navigationPath)) {
  failures.push("src/content/navigation.ts defines typed navigation data");
} else {
  const navigationSource = fs.readFileSync(navigationPath, "utf8");
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
    !/export const siteBrand:\s*SiteBrand\s*=\s*\{[\s\S]*label:\s*["']rico["'][\s\S]*href:\s*["']#intro["'][\s\S]*\}/.test(navigationSource)
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
      if (
        !sectionClassName ||
        !sectionClassName.includes("pt-36") ||
        !sectionClassName.includes("md:pt-16")
      ) {
        failures.push("Navigation target #intro reserves mobile header space");
      }
    } else if (!sectionClassName || !sectionClassName.includes("scroll-mt-36")) {
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

  if (!/import\s+\{\s*headerNavItems,\s*siteBrand,\s*socialLinks\s*\}\s+from\s+["']@\/content\/navigation["'];/.test(headerSource)) {
    failures.push("Header imports the typed brand metadata");
  }

  if (!/<a[\s\S]*href=\{siteBrand\.href\}[\s\S]*>\s*\{siteBrand\.label\}\s*<\/a>/.test(headerSource)) {
    failures.push("Header brand text links back to the intro section from metadata");
  }

  if (!headerSource.includes(headerBrandHoverAccentClass)) {
    failures.push("Header brand link keeps a readable hover color on the dark header");
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

  if (!/md:hidden/.test(headerSource)) {
    failures.push("Header keeps mobile navigation scoped below the desktop breakpoint");
  }

  if (!/aria-label="Mobile primary"[\s\S]*?headerNavItems\.map\(\(item\)\s*=>/.test(headerSource)) {
    failures.push("Header mobile navigation renders from shared typed navigation data");
  }

  if (!/aria-label="Mobile primary"[\s\S]*<ul\b[^>]*className="[^"]*overflow-x-auto/.test(headerSource)) {
    failures.push("Header mobile navigation exposes the horizontal link rail as a list");
  }

  if (!/aria-label="Mobile primary"[\s\S]*<ul\b[^>]*role="list"/.test(headerSource)) {
    failures.push("Header mobile navigation uses an explicit list role");
  }

  if (!/aria-label="Mobile primary"[\s\S]*headerNavItems\.map\(\(item\)\s*=>\s*\(\s*<li\b[^>]*role="listitem"/.test(headerSource)) {
    failures.push("Header mobile navigation wraps each shared nav item in a list item");
  }

  if (!/aria-label="Mobile primary"[\s\S]*<a\b[\s\S]*className=\{?`?["']?[\s\S]*\bmin-h-11\b[\s\S]*\bmin-w-11\b/.test(headerSource)) {
    failures.push("Header mobile navigation links use mobile-friendly touch targets");
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

  if (componentPath === headerNavLinkPath && !source.includes(navHoverAccentClass)) {
    failures.push(`${path.relative(root, componentPath)} uses the header accent hover class`);
  }

  if (componentPath === socialLinkPath && !source.includes(socialBaseAccentClass)) {
    failures.push(`${path.relative(root, componentPath)} uses the social accent text class`);
  }

  if (
    componentPath === socialLinkPath &&
    !/className="[^"]*\bmin-h-11\b[^"]*\bmin-w-11\b/.test(source)
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
    !/kind === "email"[\s\S]*<Mail\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the email social link with the shared mail icon`);
  }

  if (
    componentPath === socialLinkPath &&
    !/kind === "github"[\s\S]*<Github\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the GitHub social link with the shared GitHub icon`);
  }

  if (
    componentPath === socialLinkPath &&
    !/kind === "linkedin"[\s\S]*<Linkedin\b/.test(source)
  ) {
    failures.push(`${path.relative(root, componentPath)} renders the LinkedIn social link with the shared LinkedIn icon`);
  }
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
