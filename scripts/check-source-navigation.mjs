import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const navigationPath = path.join(srcRoot, "content/navigation.ts");
const headerPath = path.join(srcRoot, "components/Header.tsx");
const headerNavLinkPath = path.join(srcRoot, "components/HeaderNavLink.tsx");
const socialLinkPath = path.join(srcRoot, "components/SocialLink.tsx");

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

if (failures.length > 0) {
  console.error("Source navigation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source navigation check passed.");
