import { getJstFullYear } from "@utils/date";
import { getCollection, type CollectionEntry } from "astro:content";

/**
 * 記事ファイル名（YYYY-MM-DD-slug）から日付プレフィックスを除いた slug を返す。
 * glob loader の id には拡張子は含まれない。
 */
export function getPostSlug(post: CollectionEntry<"blog">): string {
  const filename = post.id.split("/").pop() ?? post.id;

  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

/** frontmatter の date から記事の年（JST基準）を返す。 */
export function getPostYear(post: CollectionEntry<"blog">): string {
  return getJstFullYear(post.data.date);
}

/** 記事のURL（/YYYY/slug/）を返す。 */
export function getPostUrl(post: CollectionEntry<"blog">): string {
  return `/${getPostYear(post)}/${getPostSlug(post)}/`;
}

/** 記事一覧を新しい順に並べ替えて返す。 */
export function sortPostsByDateDesc(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * 記事一覧を取得する。
 * 本番ビルド時は draft: true の記事を除外し、ローカルの dev サーバーでは表示する。
 */
export async function getBlogPosts(): Promise<CollectionEntry<"blog">[]> {
  return await getCollection("blog", ({ data }) => !import.meta.env.PROD || !data.draft);
}
