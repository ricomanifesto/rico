import { getCollection } from "astro:content";

const staticPaths = [
  "/",
  "/writing/",
  "/projects/sentrysearch/",
  "/projects/sentrysearch/llm-evaluation/",
  "/projects/sentrydigest/",
  "/projects/sentryinsight/",
  "/projects/grcinsight/",
];

export async function GET() {
  const posts = await getCollection("writing", ({ data }) => !data.draft);
  const paths = [...staticPaths, ...posts.map((post) => `/writing/${post.id}/`)];
  const urls = paths
    .map((path) => `  <url>\n    <loc>https://ricomanifesto.com${path}</loc>\n  </url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
