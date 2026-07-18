import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = process.env.BUILD_OUTPUT_DIR || join(root, "dist");
const indexPath = join(dist, "index.html");
const sourceContentPath = join(root, "src", "content", "portfolio.ts");

const siteUrl = "https://ricomanifesto.com";
const projectPages = [
  {
    slug: "sentrysearch",
    title: "Threat Intelligence Research Workspace",
    repository: "https://github.com/ricomanifesto/SentrySearch",
  },
  {
    slug: "sentrydigest",
    title: "Analyst-Ready Security Briefings",
    repository: "https://github.com/ricomanifesto/SentryDigest",
  },
  {
    slug: "sentryinsight",
    title: "Exploitation Intelligence Reports",
    repository: "https://github.com/ricomanifesto/SentryInsight",
  },
  {
    slug: "grcinsight",
    title: "Audit-Ready GRC Intelligence",
    repository: "https://github.com/ricomanifesto/GRCInsight",
  },
];
const sentrySearchCaseStudy = {
  path: join("projects", "sentrysearch", "llm-evaluation", "index.html"),
  url: `${siteUrl}/projects/sentrysearch/llm-evaluation/`,
  title: "LLM Evaluation for Threat-Intelligence Workflows",
  evidenceUrls: [
    "https://github.com/ricomanifesto/SentrySearch/blob/1f45ad31fe093d6b39f6e6ef08d97189db3c6cb4/src/core/section_validator.py",
    "https://github.com/ricomanifesto/SentrySearch/blob/1f45ad31fe093d6b39f6e6ef08d97189db3c6cb4/src/core/validation_criteria.py",
    "https://github.com/ricomanifesto/SentrySearch/blob/1f45ad31fe093d6b39f6e6ef08d97189db3c6cb4/src/core/parallel_section_validator.py",
    "https://github.com/ricomanifesto/SentrySearch/blob/1f45ad31fe093d6b39f6e6ef08d97189db3c6cb4/src/core/markdown_generator.py",
  ],
};

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
requireFile(join(dist, "robots.txt"), "robots policy");
requireFile(join(dist, "sitemap.xml"), "XML sitemap");

for (const { slug } of projectPages) {
  requireFile(join(dist, "projects", slug, "index.html"), `${slug} project page`);
}
requireFile(join(dist, sentrySearchCaseStudy.path), "SentrySearch LLM evaluation case study");

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
      pattern: /<meta\s+name="description"\s+content="Michael Rico is a Staff Threat Hunter building threat intelligence, detection engineering, and analyst-facing security systems\."\s*\/?>/,
    },
    {
      label: "document title",
      pattern: /<title>Michael Rico \| Staff Threat Hunter<\/title>/,
    },
    {
      label: "canonical URL",
      pattern: /<link\s+rel="canonical"\s+href="https:\/\/ricomanifesto\.com\/"\s*\/?>/,
    },
    {
      label: "crawler directive",
      pattern: /<meta\s+name="robots"\s+content="index, follow, max-image-preview:large"\s*\/?>/,
    },
    {
      label: "Search Console verification",
      pattern: /<meta\s+name="google-site-verification"\s+content="riZBCn3pciK8WdJHcJRRgTNbJrqnZWq5KUkk4r3iQ5c"\s*\/?>/,
    },
    {
      label: "Open Graph title",
      pattern: /<meta\s+property="og:title"\s+content="Michael Rico \| Staff Threat Hunter"\s*\/?>/,
    },
    {
      label: "Open Graph URL",
      pattern: /<meta\s+property="og:url"\s+content="https:\/\/ricomanifesto\.com\/"\s*\/?>/,
    },
    {
      label: "Twitter card",
      pattern: /<meta\s+name="twitter:card"\s+content="summary_large_image"\s*\/?>/,
    },
    {
      label: "structured data",
      pattern: /<script\s+type="application\/ld\+json">[\s\S]*?"@type":\s*"Person"[\s\S]*?"name":\s*"Michael Rico"[\s\S]*?<\/script>/,
    },
    {
      label: "SentrySearch case-study entity",
      pattern: /https:\/\/ricomanifesto\.com\/projects\/sentrysearch\/llm-evaluation\//,
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

const robotsPath = join(dist, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");

  for (const directive of ["User-agent: *", "Allow: /", `Sitemap: ${siteUrl}/sitemap.xml`]) {
    if (!robots.includes(directive)) {
      failures.push(`Robots policy is missing: ${directive}`);
    }
  }
}

const sitemapPath = join(dist, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const expectedUrls = [
    `${siteUrl}/`,
    ...projectPages.map(({ slug }) => `${siteUrl}/projects/${slug}/`),
    sentrySearchCaseStudy.url,
  ];

  for (const expectedUrl of expectedUrls) {
    if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) {
      failures.push(`Sitemap is missing URL: ${expectedUrl}`);
    }
  }
}

const caseStudyPath = join(dist, sentrySearchCaseStudy.path);
if (existsSync(caseStudyPath)) {
  const caseStudy = readFileSync(caseStudyPath, "utf8");
  const expectations = [
    ["title", `<title>${sentrySearchCaseStudy.title} | Michael Rico</title>`],
    ["heading", `<h1>${sentrySearchCaseStudy.title}</h1>`],
    ["canonical URL", `<link rel="canonical" href="${sentrySearchCaseStudy.url}" />`],
    ["claim boundary", "What this proves and what it does not"],
    ["structured data", 'type="application/ld+json"'],
  ];

  for (const evidenceUrl of sentrySearchCaseStudy.evidenceUrls) {
    expectations.push(["pinned public evidence", `href="${evidenceUrl}"`]);
  }

  for (const [label, expected] of expectations) {
    if (!caseStudy.includes(expected)) {
      failures.push(`SentrySearch case study is missing ${label}`);
    }
  }
}

for (const { slug, title, repository } of projectPages) {
  const projectPath = join(dist, "projects", slug, "index.html");

  if (!existsSync(projectPath)) {
    continue;
  }

  const projectPage = readFileSync(projectPath, "utf8");
  const expectedCanonical = `${siteUrl}/projects/${slug}/`;

  for (const [label, expected] of [
    ["title", `<title>${title} | Michael Rico</title>`],
    ["heading", `<h1>${title}</h1>`],
    ["canonical URL", `<link rel="canonical" href="${expectedCanonical}" />`],
    ["repository link", `href="${repository}"`],
    ["structured data", 'type="application/ld+json"'],
  ]) {
    if (!projectPage.includes(expected)) {
      failures.push(`${slug} project page is missing ${label}`);
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
