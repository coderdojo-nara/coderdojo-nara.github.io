/**
 * Site font registration — single place to change families, weights, or provider.
 *
 * - Used by `astro.config.mjs` (`fonts`) and layout `<SiteFonts />` (preload / Font component).
 * - `cssVariable` values must match tokens consumed in CSS (`--font-body`, `--font-headings`).
 *
 * @see https://docs.astro.build/en/guides/fonts/
 */
import { fontProviders } from "astro/config";

export const siteFonts = [
  {
    name: "Noto Sans JP",
    cssVariable: "--font-body",
    provider: fontProviders.google(),
    weights: [400, 500, 700, 900],
    styles: ["normal"],
  },
];
