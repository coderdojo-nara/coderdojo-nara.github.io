import rss from "@astrojs/rss";
import { getPostUrl, sortPostsByDateDesc } from "@utils/blog";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = sortPostsByDateDesc(await getCollection("blog"));

  return rss({
    title: "CoderDojo 奈良",
    description: "奈良市で開催している子どものためのプログラミングコミュニティ",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || "",
      pubDate: post.data.date,
      author: post.data.author,
      link: getPostUrl(post),
    })),
    customData: `<language>ja</language>`,
  });
}
