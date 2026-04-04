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
        const year = String(post.data.date.getFullYear());
      const filename = post.id.split("/").pop() ?? post.id;
      const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(md|mdx)$/, "");
      return {
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.date,
        author: post.data.author,
        link: `/${year}/${slug}/`,
      };
    }),
    customData: `<language>ja</language>`,
  });
}
