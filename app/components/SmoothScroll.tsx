"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis } from "../lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Disabled entirely under prefers-reduced-motion — native scroll takes over.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | undefined;
    let raf: ((time: number) => void) | undefined;

    if (!reduced) {
      lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      // The nav's "Story" needs the live instance to move the page (see lib/scroll).
      registerLenis(lenis);

      // Lenis owns the scroll position and will animate the page back to its
      // own target, so window.scrollTo() silently gets undone. Expose it in dev
      // so the scroll can actually be driven: lenis.scrollTo(y, {immediate:true})
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { lenis?: Lenis }).lenis = lenis;
      }
    }

    // Beat triggers are created in child layout effects, which run before this
    // effect. Their own initial refresh gets missed after hydration (start/end
    // never resolve, so scrubs stay frozen at 0), so force one here. Refresh
    // again once webfonts settle — type metrics change every pin distance.
    ScrollTrigger.refresh();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      if (raf) gsap.ticker.remove(raf);
      registerLenis(null);
      lenis?.destroy();
    };
  }, []);

  return null;
}
