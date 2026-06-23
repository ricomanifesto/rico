import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentsRoot = path.join(root, "src/components");
const portfolioPath = path.join(root, "src/content/portfolio.ts");
const projectsSectionPath = path.join(componentsRoot, "ProjectsSection.tsx");
const portfolioSource = fs.readFileSync(portfolioPath, "utf8");
const projectsSectionSource = fs.readFileSync(projectsSectionPath, "utf8");

const checks = [
  {
    label: "images use lazy loading",
    pattern: /loading="lazy"/,
  },
  {
    label: "images use async decoding",
    pattern: /decoding="async"/,
  },
  {
    label: "images declare intrinsic dimensions",
    pattern: /width=(?:\{[^}]+\}|"[\d]+")/,
  },
  {
    label: "images declare intrinsic heights",
    pattern: /height=(?:\{[^}]+\}|"[\d]+")/,
  },
];

const failures = [];

if (!/export interface ProjectImage \{[\s\S]*readonly src:\s*string;[\s\S]*readonly decorative:\s*true;[\s\S]*\}/.test(portfolioSource)) {
  failures.push("project images use explicit decorative metadata");
}

if (/readonly bgImage:\s*string;/.test(portfolioSource) || /\n\s*bgImage:\s*"/.test(portfolioSource)) {
  failures.push("project data avoids bare background image strings");
}

if (!/project\.image\?\.decorative[\s\S]*src=\{project\.image\.src\}[\s\S]*alt=""[\s\S]*aria-hidden="true"/.test(projectsSectionSource)) {
  failures.push("project cards render decorative image metadata accessibly");
}

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
  const imageTags = source.match(/<img\b[\s\S]*?\/>/g) ?? [];

  for (const imageTag of imageTags) {
    if (
      componentPath === projectsSectionPath
      && /src=\{project\.bgImage\}/.test(imageTag)
      && !(/alt=""/.test(imageTag) && /aria-hidden="true"/.test(imageTag))
    ) {
      failures.push(`${path.relative(root, componentPath)}: project carousel background images are decorative`);
    }

    for (const { label, pattern } of checks) {
      if (!pattern.test(imageTag)) {
        failures.push(`${path.relative(root, componentPath)}: ${label}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Source image check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source image check passed.");
