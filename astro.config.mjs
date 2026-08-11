import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { globSync } from "glob";
import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rehypeExternalLinks from "rehype-external-links";

import mdx from "@astrojs/mdx";

import { siteFonts } from "./site-fonts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// frontmatter で sitemap: false が指定されたページのURLパスを集める
// （除外指定は各ページの frontmatter を唯一の情報源とする）
function collectSitemapExcludedPaths() {
  const base = path.resolve(__dirname, "src/content/pages");

  return globSync("**/*.md", { cwd: base }).flatMap((file) => {
    const source = fs.readFileSync(path.join(base, file), "utf8");
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!frontmatter) return [];
    const data = yaml.load(frontmatter[1]);

    if (data?.sitemap !== false) return [];
    // Content Collections の glob loader と同じく小文字のURLになる
    const slug = file
      .replace(/\.md$/, "")
      .replace(/(^|\/)index$/, "")
      .toLowerCase();

    return [slug === "" ? "/" : `/${slug}/`];
  });
}

const sitemapExcludedPaths = collectSitemapExcludedPaths();

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/2026/minecraft-workshp": "/2026/minecraft-workshop",
    "/dojo-coop/": "https://coderdojo-nara.github.io/dojo-bazaar/",
  },
  site: "https://coderdojo-nara.github.io",
  fonts: siteFonts,
  build: {
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4321,
  },
  integrations: [
    icon({
      iconDir: path.resolve(__dirname, "src/icons"),
      svgoOptions: {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupIds: false,
              },
            },
          },
        ],
      },
    }),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);

        // exclusive ディレクトリ配下は sitemap に載せない（noindex は [...slug].astro 側）
        if (pathname.split("/").includes("exclusive")) return false;

        return !sitemapExcludedPaths.includes(pathname);
      },
    }),
    mdx(),
  ],
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]],
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1024,
    },
    css: {
      devSourcemap: true,
      transformer: "lightningcss",
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@building-blocks": path.resolve(__dirname, "src/components/building-blocks"),
        "@core-elements": path.resolve(__dirname, "src/components/building-blocks/core-elements"),
        "@forms": path.resolve(__dirname, "src/components/building-blocks/forms"),
        "@wrappers": path.resolve(__dirname, "src/components/building-blocks/wrappers"),
        "@navigation": path.resolve(__dirname, "src/components/navigation"),
        "@page-sections": path.resolve(__dirname, "src/components/page-sections"),
        "@features": path.resolve(__dirname, "src/components/page-sections/features"),
        "@builders": path.resolve(__dirname, "src/components/page-sections/builders"),
        "@data": path.resolve(__dirname, "src/data"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@content": path.resolve(__dirname, "src/content"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@layouts": path.resolve(__dirname, "src/layouts"),
        "@component-utils": path.resolve(__dirname, "src/components/utils"),
        "@styles": path.resolve(__dirname, "src/styles"),
      },
    },
  },
});
