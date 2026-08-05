import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import ts from "typescript";

const root = process.cwd();
const componentsRoot = path.join(root, "src/components");
const portfolioPath = path.join(root, "src/content/portfolio.ts");
const projectsSectionPath = path.join(componentsRoot, "ProjectsSection.tsx");
const aboutMePath = path.join(componentsRoot, "AboutMe.tsx");
const portfolioSource = fs.readFileSync(portfolioPath, "utf8");
const projectsSectionSource = fs.readFileSync(projectsSectionPath, "utf8");
const aboutMeSource = fs.readFileSync(aboutMePath, "utf8");

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

const requiredBrandFiles = [
  "favicon.svg",
  "favicon.ico",
  "safari-pinned-tab.svg",
  "site.webmanifest",
];

const requiredBrandImages = [
  { src: "apple-touch-icon.png", width: 180, height: 180 },
  { src: "icons/icon-192.png", width: 192, height: 192 },
  { src: "icons/icon-512.png", width: 512, height: 512 },
  { src: "icons/icon-512-maskable.png", width: 512, height: 512 },
  { src: "images/social-card.png", width: 1200, height: 630 },
  { src: "images/profile-384.webp", width: 384, height: 833 },
];

const rasterAssetBudgets = [
  { src: "images/profile.jpg", type: "jpg", maxBytes: 100 * 1024 },
  { src: "images/profile-384.webp", type: "webp", maxBytes: 25 * 1024 },
  { src: "apple-touch-icon.png", type: "png", maxBytes: 20 * 1024, maxBitDepth: 8 },
  { src: "icons/icon-192.png", type: "png", maxBytes: 20 * 1024, maxBitDepth: 8 },
  { src: "icons/icon-512.png", type: "png", maxBytes: 50 * 1024, maxBitDepth: 8 },
  { src: "icons/icon-512-maskable.png", type: "png", maxBytes: 50 * 1024, maxBitDepth: 8 },
  { src: "images/social-card.png", type: "png", maxBytes: 100 * 1024, maxBitDepth: 8 },
  { src: "images/SentryInsight.jpg", type: "jpg", maxBytes: 300 * 1024 },
];

for (const brandFile of requiredBrandFiles) {
  if (!fs.existsSync(path.join(root, "public", brandFile))) {
    failures.push(`${brandFile}: required brand asset exists`);
  }
}

for (const brandImage of requiredBrandImages) {
  const actualDimensions = readImageDimensions(path.join(root, "public", brandImage.src));

  if (!actualDimensions) {
    failures.push(`${brandImage.src}: image dimensions can be read`);
    continue;
  }

  if (actualDimensions.width !== brandImage.width || actualDimensions.height !== brandImage.height) {
    failures.push(
      `${brandImage.src}: expected ${brandImage.width}x${brandImage.height}, received ${actualDimensions.width}x${actualDimensions.height}`,
    );
  }
}

for (const budget of rasterAssetBudgets) {
  const assetPath = path.join(root, "public", budget.src);
  const assetInfo = readImageInfo(assetPath);

  if (!assetInfo) {
    failures.push(`${budget.src}: image format and size can be read`);
    continue;
  }

  if (assetInfo.type !== budget.type) {
    failures.push(`${budget.src}: expected ${budget.type} bytes, received ${assetInfo.type}`);
  }

  if (assetInfo.bytes > budget.maxBytes) {
    failures.push(
      `${budget.src}: ${assetInfo.bytes} bytes exceeds ${budget.maxBytes}-byte budget`,
    );
  }

  if (
    budget.maxBitDepth
    && assetInfo.pngBitDepth
    && assetInfo.pngBitDepth > budget.maxBitDepth
  ) {
    failures.push(
      `${budget.src}: ${assetInfo.pngBitDepth}-bit PNG exceeds ${budget.maxBitDepth}-bit export budget`,
    );
  }
}

if (!/<picture>[\s\S]*<source srcSet="\/images\/profile-384\.webp" type="image\/webp" \/>[\s\S]*<img[\s\S]*src="\/images\/profile\.jpg"/.test(aboutMeSource)) {
  failures.push("About profile prefers the optimized WebP with a JPEG fallback");
}

if (!/export interface ProjectImage \{[\s\S]*readonly src:\s*string;[\s\S]*readonly decorative:\s*true;[\s\S]*\}/.test(portfolioSource)) {
  failures.push("project images use explicit decorative metadata");
}

if (/readonly bgImage:\s*string;/.test(portfolioSource) || /\n\s*bgImage:\s*"/.test(portfolioSource)) {
  failures.push("project data avoids bare background image strings");
}

if (!/project\.image\?\.decorative[\s\S]*src=\{project\.image\.src\}[\s\S]*alt=""[\s\S]*aria-hidden="true"/.test(projectsSectionSource)) {
  failures.push("project cards render decorative image metadata accessibly");
}

for (const image of findProjectImages(portfolioSource)) {
  const actualDimensions = readImageDimensions(path.join(root, "public", image.src));

  if (!actualDimensions) {
    failures.push(`${image.src}: image dimensions can be read`);
    continue;
  }

  if (actualDimensions.width !== image.width || actualDimensions.height !== image.height) {
    failures.push(
      `${image.src}: metadata dimensions ${image.width}x${image.height} do not match asset dimensions ${actualDimensions.width}x${actualDimensions.height}`,
    );
  }
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

    const literalImage = parseLiteralImageTag(imageTag);
    if (!literalImage) {
      continue;
    }

    const actualDimensions = readImageDimensions(path.join(root, "public", literalImage.src));
    if (!actualDimensions) {
      failures.push(`${path.relative(root, componentPath)}: ${literalImage.src} dimensions can be read`);
      continue;
    }

    if (literalImage.width !== actualDimensions.width || literalImage.height !== actualDimensions.height) {
      failures.push(
        `${path.relative(root, componentPath)}: ${literalImage.src} attributes ${literalImage.width}x${literalImage.height} do not match asset dimensions ${actualDimensions.width}x${actualDimensions.height}`,
      );
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

function findProjectImages(source) {
  const sourceFile = ts.createSourceFile(portfolioPath, source, ts.ScriptTarget.Latest, true);
  const images = [];

  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(node.name) === "image" &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const src = stringProperty(node.initializer, "src");
      const width = numberProperty(node.initializer, "width");
      const height = numberProperty(node.initializer, "height");
      const decorative = booleanProperty(node.initializer, "decorative");

      if (src && width !== null && height !== null && decorative === true) {
        images.push({
          src: src.replace(/^\//, ""),
          width,
          height,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return images;
}

function stringProperty(objectLiteral, propertyName) {
  const property = findProperty(objectLiteral, propertyName);

  if (!property || !ts.isStringLiteral(property.initializer)) {
    return null;
  }

  return property.initializer.text;
}

function numberProperty(objectLiteral, propertyName) {
  const property = findProperty(objectLiteral, propertyName);

  if (!property || !ts.isNumericLiteral(property.initializer)) {
    return null;
  }

  return Number(property.initializer.text);
}

function booleanProperty(objectLiteral, propertyName) {
  const property = findProperty(objectLiteral, propertyName);

  if (!property || property.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
    return null;
  }

  return true;
}

function findProperty(objectLiteral, propertyName) {
  return objectLiteral.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      propertyNameText(property.name) === propertyName,
  );
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

function parseLiteralImageTag(imageTag) {
  const src = imageTag.match(/\bsrc="([^"]+)"/)?.[1];
  const width = readNumericJsxAttribute(imageTag, "width");
  const height = readNumericJsxAttribute(imageTag, "height");

  if (!src || !width || !height || !src.startsWith("/")) {
    return null;
  }

  return {
    src: src.replace(/^\//, ""),
    width,
    height,
  };
}

function readNumericJsxAttribute(source, attributeName) {
  const attributeMatch = source.match(new RegExp(`\\b${attributeName}=(?:"(\\d+)"|\\{(\\d+)\\})`));
  const value = attributeMatch?.[1] ?? attributeMatch?.[2];

  return value ? Number(value) : null;
}

function readImageDimensions(imagePath) {
  const imageInfo = readImageInfo(imagePath);

  return imageInfo
    ? {
      width: imageInfo.width,
      height: imageInfo.height,
    }
    : null;
}

function readImageInfo(imagePath) {
  if (!fs.existsSync(imagePath)) {
    return null;
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const dimensions = imageSize(imageBuffer);
    if (!dimensions.width || !dimensions.height) {
      return null;
    }

    return {
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
      bytes: imageBuffer.byteLength,
      pngBitDepth: dimensions.type === "png" ? imageBuffer[24] : null,
    };
  } catch {
    return null;
  }
}
