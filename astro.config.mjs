import sitemap from "@astrojs/sitemap";
import editableRegions from "@cloudcannon/editable-regions/astro-integration";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rehypeExternalLinks from "rehype-external-links";

import mdx from "@astrojs/mdx";

import { siteFonts } from "./site-fonts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/2026/minecraft-workshp": "/2026/minecraft-workshop",
    "/ninja/exclusive/minecraft/": "/ninja/minecraft/",
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
  image: {
    domains: ["picsum.photos"],
  },
  integrations: [
    {
      name: "builder-preview-dev-only",
      hooks: {
        "astro:config:setup": ({ command, injectRoute, updateConfig }) => {
          if (command === "dev") {
            injectRoute({
              pattern: "/component-docs/builder-preview",
              entrypoint: "./src/component-docs/pages/builder-preview.astro",
              prerender: false,
            });
            updateConfig({
              adapter: {
                name: "dev-only-server-preview",
                serverEntrypoint: "",
                supportedAstroFeatures: {
                  serverOutput: "stable",
                  staticOutput: "stable",
                  hybridOutput: "stable",
                  sharpImageService: "stable",
                },
              },
            });
          }
        },
      },
    },
    editableRegions(),
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
        if (pathname.startsWith("/component-docs/")) return false;
        // sitemap: false が指定されたページ
        if (pathname.startsWith("/ninja/exclusive/")) return false;
        if (pathname.startsWith("/redirect/")) return false;
        if (pathname === "/ninja/") return false;
        if (pathname === "/DojoMeeting/") return false;
        if (pathname === "/projects/ShakyoDojo/") return false;
        return true;
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
        "@content": path.resolve(__dirname, "src/content"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@component-docs": path.resolve(__dirname, "src/component-docs"),
        "@layouts": path.resolve(__dirname, "src/layouts"),
        "@component-utils": path.resolve(__dirname, "src/components/utils"),
        "@styles": path.resolve(__dirname, "src/styles"),
      },
    },
  },
});
