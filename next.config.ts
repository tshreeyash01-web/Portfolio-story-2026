import type { NextConfig } from "next";

/**
 * GitHub Pages serves this repo at /Portfolio-story-2026/, not at the root, so
 * every asset URL needs that prefix. Cloudflare Pages (and `next dev`) serve at
 * the root and must NOT have it — hence an env var rather than a hard-coded
 * value. The Pages workflow sets it; nothing else does.
 *
 * It's NEXT_PUBLIC_ because one asset can't be rewritten by the framework: the
 * <audio> tag in components/Audio.tsx. next/image and next/link apply basePath
 * themselves, but a plain <audio src> is untouched, so that one reads this at
 * runtime.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /**
   * Built as a static export: Cloudflare Pages and GitHub Pages both serve
   * static files and can't run Next's server or its image optimiser. Every route
   * here is prerendered anyway, so this is the honest fit — `npm run build`
   * emits `out/`.
   *
   * `images.unoptimized` is required by `output: "export"` (there's no optimizer
   * to call). It costs us nothing: every image in `public/` is already baked at
   * its display size, and the halftones had to opt out of optimization
   * regardless — resampling destroys a dot screen (see .halftone in globals.css).
   */
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
