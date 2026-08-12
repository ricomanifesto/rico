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
  const posts = (await getCollection("writing", ({ data }) => !data.draft))
    .sort((left, right) => right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf());
  const writingLastModified = posts
    .map((post) => post.data.updatedAt ?? post.data.publishedAt)
    .sort((left, right) => right.valueOf() - left.valueOf())[0];
  const entries = [
    ...staticPaths.map((path) => ({
      path,
      ...(path === "/writing/" && writingLastModified
        ? { lastModified: writingLastModified }
        : {}),
    })),
    ...posts.map((post) => ({
      path: `/writing/${post.id}/`,
      lastModified: post.data.updatedAt ?? post.data.publishedAt,
    })),
  ];
  const urls = entries
    .map(({ path, lastModified }) => [
      "  <url>",
      `    <loc>https://ricomanifesto.com${path}</loc>`,
      ...(lastModified ? [`    <lastmod>${lastModified.toISOString().slice(0, 10)}</lastmod>`] : []),
      "  </url>",
    ].join("\n"))
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
