/**
 * Prefix a `/public` path with the deploy's base path.
 *
 * GitHub Pages serves this repo under /Portfolio-story-2026/; Cloudflare Pages
 * and `next dev` serve it at the root. Next normally handles that for you — but
 * only for images that go through the optimizer. **Every image here is
 * `unoptimized`** (the halftones must be, or resampling destroys the dot
 * screen — see .halftone in globals.css), and an unoptimized <Image> emits its
 * `src` verbatim. Same for a plain <audio src>.
 *
 * So anything pointing at /public has to go through this. Returns the path
 * unchanged when there's no base path, which is every deploy except Pages.
 */
export const asset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
