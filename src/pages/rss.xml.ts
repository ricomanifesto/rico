import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site: URL }) {
  const posts = (await getCollection("writing", ({ data }) => !data.draft))
    .sort((left, right) => right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf());

  return rss({
    title: "Rico Manifesto Writing",
    description: "Notes from Michael Rico on security systems, AI agents, observability, and making complex behavior inspectable.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/writing/${post.id}/`,
      categories: post.data.topics,
    })),
  });
}
