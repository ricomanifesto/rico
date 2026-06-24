import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = process.env.BUILD_OUTPUT_DIR || join(root, "dist");
const indexPath = join(dist, "index.html");
const sourceContentPath = join(root, "src", "content", "portfolio.ts");

const failures = [];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const localPathPatterns = [
  {
    label: "repo root path",
    pattern: new RegExp(escapeRegExp(root)),
  },
  {
    label: "home directory path",
    pattern: new RegExp(["/", "(?:Users|home|workspace|workspaces)", "/"].join("")),
  },
  {
    label: "CI workspace path",
    pattern: new RegExp(["/", "work", "/"].join("")),
  },
  {
    label: "private temp path",
    pattern: new RegExp(["/", "private", "/", "tmp"].join("")),
  },
  {
    label: "shell path assignment",
    pattern: /\bPATH=/,
  },
];
const textArtifactExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".svg", ".txt", ".xml"]);

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

function isTextArtifact(path) {
  const lastDotIndex = path.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return false;
  }

  return textArtifactExtensions.has(path.slice(lastDotIndex).toLowerCase());
}

requireFile(indexPath, "built index");
requireFile(join(dist, "CNAME"), "GitHub Pages CNAME");
requireFile(join(dist, ".nojekyll"), "GitHub Pages nojekyll marker");
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

for (const artifactPath of walkFiles(dist).filter(isTextArtifact)) {
  const artifact = readFileSync(artifactPath, "utf8");
  const relativePath = artifactPath.replace(`${dist}/`, "");

  for (const { label, pattern } of localPathPatterns) {
    if (pattern.test(artifact)) {
      failures.push(`Public artifact ${relativePath} contains ${label}`);
    }
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

  const htmlMetadataChecks = [
    {
      label: "HTML language",
      pattern: /<html\s+lang="en">/,
    },
    {
      label: "viewport metadata",
      pattern: /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0"\s*\/?>/,
    },
    {
      label: "description metadata",
      pattern: /<meta\s+name="description"\s+content="Rico's Personal Portfolio \| Staff Threat Hunter"\s*\/?>/,
    },
    {
      label: "document title",
      pattern: /<title>Rico Manifesto \| Personal Portfolio<\/title>/,
    },
    {
      label: "favicon link",
      pattern: /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/favicon\.svg"\s*\/?>/,
    },
    {
      label: "module entry",
      pattern: /<script\s+type="module"\s+crossorigin\s+src="\/assets\/[^"]+\.js"><\/script>/,
    },
  ];

  for (const { label, pattern } of htmlMetadataChecks) {
    if (!pattern.test(index)) {
      failures.push(`Built index is missing ${label}`);
    }
  }
}

if (existsSync(sourceContentPath)) {
  const sourceContent = readFileSync(sourceContentPath, "utf8");
  const imagePaths = Array.from(sourceContent.matchAll(/image:\s*\{[\s\S]*?src:\s*"([^"]+)"/g)).map(
    (match) => match[1],
  );
  const hasProjectImageMetadata = /image:\s*\{/.test(sourceContent);

  if (hasProjectImageMetadata && imagePaths.length === 0) {
    failures.push("No project images found in portfolio content");
  }

  for (const imagePath of imagePaths) {
    requireFile(join(dist, imagePath.replace(/^\//, "")), `project image ${imagePath}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Build output smoke check passed.");
