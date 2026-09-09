import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { decodeHTML } from "entities";
import { parseFragment } from "parse5";

const marker = /\[\s*virtual\s+event\s*\]/i;
const textSeparators = new Set([
  "address", "article", "aside", "blockquote", "br", "dd", "details", "dialog", "div",
  "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
  "h4", "h5", "h6", "header", "hgroup", "hr", "li", "main", "menu", "nav", "ol", "p",
  "pre", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
]);

function visibleText(node) {
  if (["script", "style", "template"].includes(node.tagName)) return "";
  // Source checks handle structural hiding; browser checks resolve the CSS cascade.
  if (node.attrs?.some((attribute) => attribute.name === "hidden")) return "";
  if (node.nodeName === "#text") return node.value;
  const text = (node.childNodes ?? []).map(visibleText).join("");
  return textSeparators.has(node.tagName) ? ` ${text} ` : text;
}

export function containsVirtualEventMarker(content) {
  let decoded = content;
  // RSS can contain entity-escaped HTML, including escaped bracket entities.
  for (;;) {
    const next = decodeHTML(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  decoded = decoded.replace(/\\([\[\]])/g, "$1");
  return marker.test(decoded) || marker.test(visibleText(parseFragment(decoded)));
}

function contentFiles(directory, extensions) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return contentFiles(path, extensions);
    return extensions.has(extname(path).toLowerCase()) ? [path] : [];
  });
}

export function checkPublicContent(root) {
  const extensions = new Set([".md", ".mdx", ".html", ".xml", ".rss", ".atom"]);
  const paths = [
    ...contentFiles(join(root, "src/content/writing"), extensions),
    ...contentFiles(join(root, "public"), extensions),
  ];
  return paths.filter((path) => containsVirtualEventMarker(readFileSync(path, "utf8")))
    .map((path) => `Public content ${relative(root, path)} contains an excluded virtual-event promotion`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const failures = checkPublicContent(process.env.CONTENT_ROOT || process.cwd());
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Public content check passed.");
  }
}
