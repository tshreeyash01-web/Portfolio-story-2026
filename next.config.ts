import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Built for Cloudflare Pages, which serves static files and can't run Next's
   * server or its image optimiser. Every route here is prerendered anyway, so a
   * static export is the honest fit — `npm run build` emits `out/`.
   *
   * `images.unoptimized` is required by `output: "export"` (there's no
   * optimizer to call). It costs us nothing: every image in `public/` is
   * already baked at its display size, and the halftones had to opt out of
   * optimization regardless — resampling destroys a dot screen (see .halftone
   * in globals.css).
   *
   * NB: dropping this config would make the build Vercel-shaped again.
   */
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
