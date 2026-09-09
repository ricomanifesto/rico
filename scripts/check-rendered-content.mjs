import { realpath, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { chromium } from "@playwright/test";
import { containsTextMarker, contentFiles } from "./check-public-content.mjs";

const origin = "http://publication.invalid";

export async function assertRenderedPageAllowed(page) {
  const text = await page.evaluate(() => [
    document.body?.innerText ?? "",
    document.title,
    // innerText omits native controls. The browser owns visibility and placeholder state.
    ...Array.from(document.querySelectorAll("input, textarea"), (node) => {
      if (!node.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return "";
      if (node.matches(":placeholder-shown")) return node.placeholder;
      if (node instanceof HTMLTextAreaElement
        || ["text", "search", "tel", "url", "email", "number", "button", "submit", "reset"].includes(node.type)) return node.value;
      return "";
    }),
    ...Array.from(document.querySelectorAll("meta[content], [alt], [aria-label], [title]"),
      (node) => ["content", "alt", "aria-label", "title"].map((name) => node.getAttribute(name))),
    ...Array.from(document.querySelectorAll('script[type="application/ld+json"]'),
      (node) => JSON.parse(node.textContent || "null")),
  ]);
  if (containsTextMarker(text)) throw new Error("Rendered content contains an excluded virtual-event promotion");
}

export async function feedPayloads(page, xml) {
  return page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    if (document.querySelector("parsererror") || document.doctype) throw new Error("Invalid or unsupported publication XML");
    const atom = document.documentElement.localName === "feed";
    const rss = document.documentElement.localName === "rss";
    const payloads = [];
    function visit(node) {
      if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
        payloads.push({ type: "text", value: node.textContent || "" });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const html = rss && ["description", "encoded"].includes(node.localName);
      const atomContent = atom && ["title", "subtitle", "summary", "content"].includes(node.localName);
      if (html || atomContent) {
        const type = html ? "html" : node.getAttribute("type") || "text";
        if (!["html", "text", "xhtml"].includes(type)) throw new Error("Unsupported feed content type");
        if (type !== "xhtml" && node.children.length) throw new Error("Feed text payload contains unexpected XML elements");
        payloads.push({
          type: type === "xhtml" ? "html" : type,
          value: type === "xhtml"
            ? Array.from(node.childNodes, (child) => new XMLSerializer().serializeToString(child)).join("")
            : node.textContent || "",
        });
        return;
      }
      for (const attribute of node.attributes) payloads.push({ type: "text", value: attribute.value });
      if (!node.children.length) {
        // A plain XML field is one string even when comments or CDATA split its nodes.
        payloads.push({ type: "text", value: node.textContent || "" });
        return;
      }
      for (const child of node.childNodes) visit(child);
    }
    visit(document.documentElement);
    return payloads;
  }, xml);
}

export async function checkRenderedArtifacts(directory, options = {}) {
  const root = await realpath(resolve(directory));
  const browser = options.browser ?? await chromium.launch({
    channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined,
  });
  const context = await browser.newContext();
  const failures = [];
  const resources = [];
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Publication verification timed out")), options.timeoutMs ?? 30000);
  });
  async function verify() {
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) {
        // The site uses these public font assets. Never run analytics or permit
        // arbitrary remote application/API requests during publication checks.
        if (url.protocol === "https:" && ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)
          && ["stylesheet", "font"].includes(route.request().resourceType())) return route.continue();
        if (route.request().resourceType() === "stylesheet") resources.push("Unsupported external publication stylesheet");
        return route.abort();
      }
      try {
        let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
        if (!path.startsWith(`${root}${sep}`) && path !== root) throw new Error("Invalid artifact path");
        if ((await stat(path)).isDirectory()) path = join(path, "index.html");
        path = await realpath(path);
        if (!path.startsWith(`${root}${sep}`)) throw new Error("Artifact escapes publication root");
        await route.fulfill({ path });
      } catch {
        resources.push(`Missing publication resource: ${url.pathname}`);
        await route.fulfill({ status: 404, body: "Not found" });
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(10000);
    const pages = contentFiles(root, new Set([".html"]));
    if (!pages.length) throw new Error("No HTML artifacts to verify");
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        const route = relative(root, path).split(sep).map(encodeURIComponent).join("/");
        await page.goto(`${origin}/${route}`, { waitUntil: "load" });
        try {
          await assertRenderedPageAllowed(page);
        } catch (error) {
          failures.push(`${relative(root, path)} (${width}px): ${error.message}`);
        }
      }
    }
    for (const path of contentFiles(root, new Set([".xml", ".rss", ".atom"]))) {
      for (const payload of await feedPayloads(page, readFileSync(path, "utf8"))) {
        if (payload.type === "text") {
          if (containsTextMarker(payload.value)) failures.push(`${relative(root, path)} contains an excluded virtual-event promotion`);
        } else {
          for (const width of [390, 1280]) {
            await page.setViewportSize({ width, height: 900 });
            await page.setContent(payload.value);
            try {
              await assertRenderedPageAllowed(page);
            } catch (error) {
              failures.push(`${relative(root, path)} (${width}px): ${error.message}`);
            }
          }
        }
      }
    }
    return [...failures, ...new Set(resources)];
  }
  try {
    return await Promise.race([verify(), deadline]);
  } finally {
    clearTimeout(timer);
    await context.close();
    if (!options.browser) await browser.close();
  }
}
