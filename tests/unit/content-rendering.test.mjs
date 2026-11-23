import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { build } from "astro";

test("serializes Writing content through the production Astro pipeline", async (t) => {
  const root = process.cwd();
  const output = await mkdtemp(join(tmpdir(), "rico-content-"));
  const fixtureDirectory = await mkdtemp(join(root, "src/content/writing/formatting-fixture-"));
  const fixturePath = join(fixtureDirectory, "notes.md");
  const title = "Formatting < notes > & \"quotes\" 'apostrophes'";
  const slug = "formatting&notes'edition";
  const fixture = `---
title: ${JSON.stringify(title)}
description: Benign punctuation and Markdown formatting.
slug: ${slug}
publishedAt: 2026-01-02
updatedAt: 2026-01-03
topics: [Formatting]
image:
  path: /images/social-card.png
  alt: Formatting notes
draft: false
---

## Markdown heading

Ordinary **text** and a [reference link](https://example.com/notes).

![Example image](/images/social-card.png)

Inline <em data-formatting="inline">HTML example</em> stays text.

<div data-formatting="block">Block HTML example</div>

\`\`\`html
<strong>Fenced example</strong>
\`\`\`
`;

  try {
    await writeFile(fixturePath, fixture, { flag: "wx" });
    await build({ root, outDir: output, logLevel: "error" });
    const articleDirectories = await readdir(join(output, "writing"));
    const articleDirectory = articleDirectories.find((entry) => entry.includes("formatting"));
    assert.ok(articleDirectory, "fixture article is built by the Writing route");
    const html = await readFile(join(output, "writing", articleDirectory, "index.html"), "utf8");

    await t.test("keeps Markdown and fenced examples while rendering raw HTML as text", () => {
      assert.match(html, /<h2[^>]*>Markdown heading<\/h2>/);
      assert.match(html, /<strong>text<\/strong>/);
      assert.match(html, /<a href="https:\/\/example.com\/notes">reference link<\/a>/);
      assert.match(html, /<img[^>]*alt="Example image"/);
      assert.ok(!/<(?:em|div) data-formatting=/.test(html), "raw inline and block HTML do not render as elements");
      assert.match(html, /&lt;em data-formatting=/);
      assert.match(html, /&lt;div data-formatting=/);
      assert.match(html, /<pre[\s\S]*Fenced example[\s\S]*<\/pre>/);
      assert.doesNotMatch(html, /<strong>Fenced example<\/strong>/);
    });

    await t.test("preserves JSON values without raw HTML delimiters in structured data", () => {
      const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      assert.ok(json, "structured data script exists");
      assert.ok(!json.includes("<"), "JSON script content has no raw less-than character");
      const article = JSON.parse(json)["@graph"].find((entry) => entry["@type"] === "BlogPosting");
      assert.equal(article.headline, title);
    });

    await t.test("escapes sitemap XML without changing the URL authority or dates", async () => {
      const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
      assert.ok(sitemap.includes("<loc>https://ricomanifesto.com/writing/formatting&amp;notes&apos;edition/</loc>"));
      assert.match(sitemap, /<lastmod>2026-01-03<\/lastmod>/);
      assert.ok(!sitemap.includes(`<loc>https://ricomanifesto.com/writing/${slug}/</loc>`));
    });
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
    await rm(output, { recursive: true, force: true });
  }
});
