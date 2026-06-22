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
        !sectionClassName.includes("pt-28") ||
        !sectionClassName.includes("md:pt-16")
      ) {
        failures.push("Navigation target #intro reserves mobile header space");
      }
    } else if (!sectionClassName || !sectionClassName.includes("scroll-mt-28")) {
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

  if (!/<a[\s\S]*href="#intro"[\s\S]*>\s*rico\s*<\/a>/.test(headerSource)) {
    failures.push("Header brand text links back to the intro section");
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

if (failures.length > 0) {
  console.error("Source navigation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source navigation check passed.");
