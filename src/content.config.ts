import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const contentBlockSchema = z.object({ _component: z.string() }).passthrough();

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  image: z.string().optional(),
  canonical: z.string().optional(),
  pageSections: z.array(contentBlockSchema).optional().default([]),
});

const docsPageSchema = z.object({
  title: z.string(),
  contentSections: z.array(contentBlockSchema),
});

const docsComponentSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  order: z.number().optional(),
  overview: z.string().optional(),
  spacing: z.string().optional().nullable(),
  component: z.string().optional(),
  component_path: z.string().optional(),
  blocks: z
    .union([z.record(z.string(), z.any()), z.array(z.record(z.string(), z.any()))])
    .optional(),
  slots: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        fallback_for: z.string().optional().nullable(),
        child_component: z
          .object({
            name: z.string(),
            props: z.array(z.string()).optional(),
          })
          .optional()
          .nullable(),
      })
    )
    .optional(),
  examples: z
    .union([
      z.array(
        z.object({
          title: z.string().optional(),
          slugs: z.array(z.string()),
        })
      ),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (!val) return [];

      return val.map((example) => ({
        title:
          example.title ||
          (example.slugs?.[0]
            ? example.slugs[0].replace(/-/g, " ").charAt(0).toUpperCase() +
              example.slugs[0].replace(/-/g, " ").slice(1)
            : "Example"),
        slugs: example.slugs,
        size: example.size ?? "md",
      }));
    }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: pageSchema,
});

const docsPagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/component-docs/content/pages" }),
  schema: docsPageSchema,
});

const docsComponentsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/component-docs/content/components" }),
  schema: docsComponentSchema,
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
  "docs-pages": docsPagesCollection,
  "docs-components": docsComponentsCollection,
  blog: blogCollection,
};
