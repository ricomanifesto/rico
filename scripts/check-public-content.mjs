import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseFrontmatter } from "astro/markdown";

const marker = /\[\s*virtual\s+event\s*\\?\]/i;

// Text is already interpreted by its owner. Never turn escaped markup into nodes.
export function containsTextMarker(value) {
  if (typeof value === "string") return marker.test(value);
  if (Array.isArray(value)) return value.some(containsTextMarker);
  if (value && typeof value === "object") return Object.values(value).some(containsTextMarker);
  return false;
}

export function contentFiles(directory, extensions) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return contentFiles(path, extensions);
    return extensions.has(extname(path).toLowerCase()) ? [path] : [];
  });
}

export function checkPublicContent(root) {
  // Bodies and public HTML need the compiled page's CSS context. The mandatory
  // artifact guard verifies those after Astro renders them.
  return contentFiles(join(root, "src/content/writing"), new Set([".md", ".mdx"]))
    .filter((path) => containsTextMarker(parseFrontmatter(readFileSync(path, "utf8")).frontmatter))
    .map((path) => `Public content ${relative(root, path)} contains an excluded virtual-event promotion`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const failures = checkPublicContent(process.env.CONTENT_ROOT || process.cwd());
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Writing metadata check passed; rendered content is checked at build time.");
  }
}
