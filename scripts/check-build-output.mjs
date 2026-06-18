import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
const sourceContentPath = join(root, "src", "content", "portfolio.ts");

const failures = [];

function walkFiles(path) {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = join(path, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function requireFile(path, label) {
  if (!existsSync(path)) {
    failures.push(`Missing ${label}: ${path}`);
    return;
  }

  if (!statSync(path).isFile()) {
    failures.push(`${label} is not a file: ${path}`);
  }
}

requireFile(indexPath, "built index");
requireFile(join(dist, "CNAME"), "GitHub Pages CNAME");
requireFile(join(dist, "favicon.svg"), "favicon");
requireFile(join(dist, "images", "profile.jpg"), "profile image");

const forbiddenArtifacts = [
  join(dist, ".github"),
  ...walkFiles(dist).filter((filePath) => filePath.toLowerCase().endsWith(".heic")),
];

for (const artifactPath of forbiddenArtifacts) {
  if (existsSync(artifactPath)) {
    failures.push(`Forbidden public artifact: ${artifactPath}`);
  }
}

if (existsSync(join(dist, "CNAME"))) {
  const cname = readFileSync(join(dist, "CNAME"), "utf8").trim();
  if (cname !== "ricomanifesto.com") {
    failures.push(`Unexpected CNAME value: ${cname}`);
  }
}

if (existsSync(indexPath)) {
  const index = readFileSync(indexPath, "utf8");
  const assetPaths = Array.from(index.matchAll(/(?:href|src)="([^"]+)"/g))
    .map((match) => match[1])
    .filter((assetPath) => assetPath.startsWith("/assets/") || assetPath === "/favicon.svg");

  for (const assetPath of assetPaths) {
    requireFile(join(dist, assetPath.replace(/^\//, "")), `referenced asset ${assetPath}`);
  }

  if (!index.includes('<div id="root"></div>')) {
    failures.push("Built index is missing the React root element");
  }
}

if (existsSync(sourceContentPath)) {
  const sourceContent = readFileSync(sourceContentPath, "utf8");
  const imagePaths = Array.from(sourceContent.matchAll(/bgImage:\s*"([^"]+)"/g)).map(
    (match) => match[1],
  );

  for (const imagePath of imagePaths) {
    requireFile(join(dist, imagePath.replace(/^\//, "")), `project image ${imagePath}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Build output smoke check passed.");
