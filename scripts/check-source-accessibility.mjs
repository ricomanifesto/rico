import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
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

if (failedChecks.length > 0) {
  console.error("Source accessibility check failed:");
  for (const { label } of failedChecks) {
    console.error(`- ${label}`);
  }
  process.exit(1);
}

console.log("Source accessibility check passed.");
