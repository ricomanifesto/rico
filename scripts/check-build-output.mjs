import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const dist = process.env.BUILD_OUTPUT_DIR || join(root, "dist");
const indexPath = join(dist, "index.html");
const sourceContentPath = join(root, "src", "content", "portfolio.ts");

const siteUrl = "https://ricomanifesto.com";
const firstWritingPost = {
  path: join("writing", "i-thought-i-was-reading-a-repo", "index.html"),
  url: `${siteUrl}/writing/i-thought-i-was-reading-a-repo/`,
  title: "I Thought I Was Reading a Repo",
  description: "How tracing an open-source agent turned a familiar cybersecurity habit into a lesson about observability.",
  imagePath: "/images/writing/i-thought-i-was-reading-a-repo.png",
  imageAlt: "Signal paths converging into a clear execution trace for I Thought I Was Reading a Repo.",
};
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
requireFile(join(dist, "favicon.ico"), "ICO favicon");
requireFile(join(dist, "apple-touch-icon.png"), "Apple touch icon");
requireFile(join(dist, "safari-pinned-tab.svg"), "Safari pinned-tab icon");
requireFile(join(dist, "site.webmanifest"), "web app manifest");
requireFile(join(dist, "icons", "icon-192.png"), "192px install icon");
requireFile(join(dist, "icons", "icon-512.png"), "512px install icon");
requireFile(join(dist, "icons", "icon-512-maskable.png"), "512px maskable install icon");
requireFile(join(dist, "images", "profile.jpg"), "profile image");
requireFile(join(dist, "images", "profile-384.webp"), "optimized profile image");
requireFile(join(dist, "images", "social-card.png"), "social card");
requireFile(join(dist, "robots.txt"), "robots policy");
requireFile(join(dist, "sitemap.xml"), "XML sitemap");
requireFile(join(dist, "rss.xml"), "writing RSS feed");
requireFile(join(dist, "rss.xsl"), "writing RSS stylesheet");
requireFile(join(dist, "writing", "index.html"), "writing archive");
requireFile(join(dist, firstWritingPost.path), "first writing article");
requireFile(join(dist, firstWritingPost.imagePath.replace(/^\//, "")), "first writing social image");

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

  if (!index.includes("<astro-island") || !index.includes("/ writing")) {
    failures.push("Built index is missing the server-rendered portfolio island and writing preview");
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
      label: "Open Graph social card",
      pattern: /<meta\s+property="og:image"\s+content="https:\/\/ricomanifesto\.com\/images\/social-card\.png"\s*\/?>/,
    },
    {
      label: "Open Graph social card dimensions",
      pattern: /<meta\s+property="og:image:width"\s+content="1200"\s*\/?>[\s\S]*<meta\s+property="og:image:height"\s+content="630"\s*\/?>/,
    },
    {
      label: "Twitter card",
      pattern: /<meta\s+name="twitter:card"\s+content="summary_large_image"\s*\/?>/,
    },
    {
      label: "Twitter social card",
      pattern: /<meta\s+name="twitter:image"\s+content="https:\/\/ricomanifesto\.com\/images\/social-card\.png"\s*\/?>/,
    },
    {
      label: "structured data",
      pattern: /<script\s+type="application\/ld\+json">[\s\S]*?"@type":\s*"Person"[\s\S]*?"name":\s*"Michael Rico"[\s\S]*?<\/script>/,
    },
    {
      label: "ProfilePage structured data",
      pattern: /"@type":\s*"ProfilePage"/,
    },
    {
      label: "ProfilePage main entity",
      pattern: /"mainEntity":\s*\{\s*"@id":\s*"https:\/\/ricomanifesto\.com\/#michael-rico"\s*\}/,
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
      label: "ICO favicon link",
      pattern: /<link\s+rel="icon"\s+href="\/favicon\.ico"\s+sizes="any"\s*\/?>/,
    },
    {
      label: "Apple touch icon link",
      pattern: /<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="\/apple-touch-icon\.png"\s*\/?>/,
    },
    {
      label: "Safari pinned-tab link",
      pattern: /<link\s+rel="mask-icon"\s+href="\/safari-pinned-tab\.svg"\s+color="#66b2ff"\s*\/?>/,
    },
    {
      label: "web app manifest link",
      pattern: /<link\s+rel="manifest"\s+href="\/site\.webmanifest"\s*\/?>/,
    },
    {
      label: "navy browser theme",
      pattern: /<meta\s+name="theme-color"\s+content="#0a192f"\s*\/?>/,
    },
    {
      label: "module entry",
      pattern: /component-url="\/_astro\/App\.[^"]+\.js"/,
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
    `${siteUrl}/writing/`,
    firstWritingPost.url,
    ...projectPages.map(({ slug }) => `${siteUrl}/projects/${slug}/`),
    sentrySearchCaseStudy.url,
  ];

  for (const expectedUrl of expectedUrls) {
    if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) {
      failures.push(`Sitemap is missing URL: ${expectedUrl}`);
    }
  }
}

const writingArchivePath = join(dist, "writing", "index.html");
if (existsSync(writingArchivePath)) {
  const writingArchive = readFileSync(writingArchivePath, "utf8");

  for (const [label, expected] of [
    ["title", "<title>Writing | Michael Rico</title>"],
    ["heading", "<h1>Writing</h1>"],
    ["canonical URL", `<link rel="canonical" href="${siteUrl}/writing/">`],
    ["article link", `href="/writing/i-thought-i-was-reading-a-repo/"`],
    ["RSS link", 'href="/rss.xml"'],
  ]) {
    if (!writingArchive.includes(expected)) {
      failures.push(`Writing archive is missing ${label}`);
    }
  }
}

const firstWritingPostPath = join(dist, firstWritingPost.path);
if (existsSync(firstWritingPostPath)) {
  const article = readFileSync(firstWritingPostPath, "utf8");

  for (const [label, expected] of [
    ["title", `<title>${firstWritingPost.title} | Michael Rico</title>`],
    ["heading", `<h1>${firstWritingPost.title}</h1>`],
    ["description", firstWritingPost.description],
    ["canonical URL", `<link rel="canonical" href="${firstWritingPost.url}">`],
    ["article metadata", '<meta property="og:type" content="article">'],
    ["publication date", '<meta property="article:published_time" content="2026-08-11">'],
    ["social image", `<meta property="og:image" content="${siteUrl}${firstWritingPost.imagePath}">`],
    ["social image alt", `<meta property="og:image:alt" content="${firstWritingPost.imageAlt}">`],
    ["BlogPosting image", `"image":"${siteUrl}${firstWritingPost.imagePath}"`],
    ["BlogPosting structured data", '"@type":"BlogPosting"'],
    ["Anthropic source link", 'href="https://www.anthropic.com/research/team/interpretability"'],
    ["Prime Agent source link", 'href="https://github.com/PrimeIntellect-ai/prime-agent"'],
  ]) {
    if (!article.includes(expected)) {
      failures.push(`First writing article is missing ${label}`);
    }
  }
}

const rssPath = join(dist, "rss.xml");
if (existsSync(rssPath)) {
  const rssFeed = readFileSync(rssPath, "utf8");

  for (const expected of [
    "<?xml-stylesheet",
    'href="/rss.xsl"',
    firstWritingPost.title,
    firstWritingPost.url,
    "<rss",
  ]) {
    if (!rssFeed.includes(expected)) {
      failures.push(`Writing RSS feed is missing: ${expected}`);
    }
  }
}

const publishedWritingArticlePaths = walkFiles(join(dist, "writing"))
  .filter((artifactPath) => artifactPath.endsWith(`${sep}index.html`) && artifactPath !== writingArchivePath)
  .sort();
const writingArchiveOutput = existsSync(writingArchivePath) ? readFileSync(writingArchivePath, "utf8") : "";
const sitemapOutput = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";
const rssOutput = existsSync(rssPath) ? readFileSync(rssPath, "utf8") : "";

if (publishedWritingArticlePaths.length === 0) {
  failures.push("Writing build has no published article routes");
}

for (const articlePath of publishedWritingArticlePaths) {
  const relativeArticlePath = relative(dist, articlePath).split(sep).join("/");
  const routePath = `/${relativeArticlePath.replace(/index\.html$/, "")}`;
  const articleUrl = `${siteUrl}${routePath}`;
  const article = readFileSync(articlePath, "utf8");

  for (const [label, pattern] of [
    ["heading", /<h1(?:\s[^>]*)?>[^<]+<\/h1>/],
    ["canonical URL", new RegExp(`<link rel="canonical" href="${escapeRegExp(articleUrl)}">`)],
    ["article Open Graph type", /<meta property="og:type" content="article">/],
    ["published date", /<meta property="article:published_time" content="[^"]+">/],
    ["social image alt", /<meta property="og:image:alt" content="[^"]+">/],
    ["BlogPosting structured data", /"@type":"BlogPosting"/],
    ["visible author link", /By <a[^>]*href="\/"[^>]*rel="author"[^>]*>Michael Rico<\/a>/],
  ]) {
    if (!pattern.test(article)) {
      failures.push(`${routePath} is missing ${label}`);
    }
  }

  if (article.includes("<astro-island")) {
    failures.push(`${routePath} unexpectedly hydrates client JavaScript`);
  }

  const socialImageUrl = article.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  if (!socialImageUrl?.startsWith(`${siteUrl}/`)) {
    failures.push(`${routePath} does not use a first-party social image`);
  } else {
    const socialImagePath = new URL(socialImageUrl).pathname.replace(/^\//, "");
    requireFile(join(dist, socialImagePath), `${routePath} social image`);

    if (!article.includes(`"image":"${socialImageUrl}"`)) {
      failures.push(`${routePath} BlogPosting image does not match Open Graph`);
    }
  }

  if (!writingArchiveOutput.includes(`href="${routePath}"`)) {
    failures.push(`Writing archive is missing ${routePath}`);
  }

  if (!sitemapOutput.includes(`<loc>${articleUrl}</loc>`)) {
    failures.push(`Sitemap is missing ${articleUrl}`);
  }

  if (!rssOutput.includes(articleUrl)) {
    failures.push(`RSS is missing ${articleUrl}`);
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
