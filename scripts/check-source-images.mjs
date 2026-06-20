import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const componentsRoot = path.join(root, "src/components");

const checks = [
  {
    label: "images use lazy loading",
    pattern: /loading="lazy"/,
  },
  {
    label: "images use async decoding",
    pattern: /decoding="async"/,
  },
];

const failures = [];

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
