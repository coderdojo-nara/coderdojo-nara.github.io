import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: "CoderDojo 奈良",
    description: "奈良市で開催している子どものためのプログラミングコミュニティ",
    site: context.site!,
    items: posts.map((post) => {
      const slug = post.id.replace(/\.(md|mdx)$/, "");
      return {
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.date,
        author: post.data.author,
        link: `/blog/${slug}/`,
      };
    }),
    customData: `<language>ja</language>`,
  });
}
