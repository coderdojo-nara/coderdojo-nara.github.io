import rss from "@astrojs/rss";
import seoData from "@data/seo.json";
import { getBlogPosts, getPostUrl, sortPostsByDateDesc } from "@utils/blog";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = sortPostsByDateDesc(await getBlogPosts());

  return rss({
    title: seoData.name,
    description: seoData.description,
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
