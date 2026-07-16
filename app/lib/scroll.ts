import type Lenis from "lenis";

/**
 * Lenis owns the scroll position and animates the page back to its own target,
 * so `window.scrollTo` silently gets undone. Anything that wants to move the
 * page has to go through the live instance — which SmoothScroll registers here.
 *
 * It stays null under prefers-reduced-motion (Lenis is never created), which is
 * exactly when native scrolling is the right fallback.
 */
let lenis: Lenis | null = null;

export const registerLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Take the page back to the very top — the nav's "Story". */
export const scrollToTop = () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.8 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * Hold the page still while Beat 0's splash is up. Lenis owns the wheel, so
 * stopping it is what actually freezes the page; `overflow: hidden` is the
 * fallback for reduced motion, where Lenis never exists.
 */
export const lockScroll = () => {
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = "hidden";
};

export const unlockScroll = () => {
  if (lenis) lenis.start();
  else document.documentElement.style.overflow = "";
};
