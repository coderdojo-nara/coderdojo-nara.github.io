import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const contentBlockSchema = z.object({ _component: z.string() }).passthrough();

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  image: z.string().optional(),
  canonical: z.string().optional(),
  sitemap: z.boolean().optional().default(true),
  pageSections: z.array(contentBlockSchema).optional().default([]),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: pageSchema,
});

const blogPostSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
  date: z.coerce.date(),
  author: z.string().default("CoderDojo 奈良"),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().nullable().optional().default("").transform((v) => v ?? ""),
      })
    )
    .optional()
    .default([]),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: blogPostSchema,
});

export const collections = {
  pages: pagesCollection,
  blog: blogCollection,
};
