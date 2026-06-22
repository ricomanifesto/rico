import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workflowPath = path.join(root, ".github/workflows/deploy.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");

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
  },
];

const failures = checks
  .filter(({ pattern }) => !pattern.test(workflow))
  .map(({ label }) => label);

if (failures.length > 0) {
  console.error("Source workflow check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source workflow check passed.");
