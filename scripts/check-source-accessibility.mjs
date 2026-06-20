import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentsRoot = path.join(root, "src/components");
const projectsSectionPath = path.join(root, "src/components/ProjectsSection.tsx");
const projectsSection = fs.readFileSync(projectsSectionPath, "utf8");

const checks = [
  {
    label: "project repository links include accessible names",
    pattern: /aria-label=\{`View \$\{project\.title\} repository`\}/,
  },
  {
    label: "project demo links include accessible names",
    pattern: /aria-label=\{`Open \$\{project\.title\} demo`\}/,
  },
  {
    label: "carousel dot buttons include project names",
    pattern: /aria-label=\{`Show \$\{project\.title\}`\}/,
  },
];

const failedChecks = checks.filter(({ pattern }) => !pattern.test(projectsSection));
const failures = failedChecks.map(({ label }) => label);

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".tsx") ? [entryPath] : [];
  });
}

for (const componentPath of walkFiles(componentsRoot)) {
  const source = fs.readFileSync(componentPath, "utf8");
  const svgTags = source.match(/<svg\b[\s\S]*?>/g) ?? [];

  for (const svgTag of svgTags) {
    if (!/aria-hidden="true"/.test(svgTag) || !/focusable="false"/.test(svgTag)) {
      failures.push(`${path.relative(root, componentPath)}: inline SVGs are decorative`);
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
