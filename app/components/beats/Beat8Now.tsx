"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollToTop } from "../../lib/scroll";
import MuteToggle from "../MuteToggle";
import { asset } from "../../lib/asset";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * BEAT 8 — "Now", the close.
 *
 * Three Figma frames, in order:
 *   71  53:632  the gradient scene — "Now / I turn ideas into products worth making."
 *   74  63:422  "I am Shreeyash Takarkhede", on flat orange
 *   73  63:407  the black footer
 *
 * **The world swap is a gradient, not a cut.** 53:632's own background runs
 * #fffdf8 → #fbb000 (35.1%) → #fb7100, so it starts on exactly the paper the
 * story has been on and lands on exactly the orange 63:422 sits on. Both seams
 * are therefore invisible with no cross-fade at all — the gradient *is* the
 * transition. (This replaces 04-design-language.md's blue world; Figma went
 * orange.)
 *
 * **The footer is deliberately hard to reach.** Per Shreeyash it must not fade
 * in "in a very smooth manner" — it should just arrive, and only after roughly
 * double the usual scroll. So 63:422 pins for +=200% (two extra viewports of
 * scrolling with nothing moving) and the footer has no reveal of its own: it
 * simply scrolls into view once the pin releases.
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

/** Frames 71 and 74 are 987 tall, not 991 — the canvas is 991, so they carry
 *  4 design px of extra bleed at the bottom. Every coordinate is absolute from
 *  the top, so nothing else shifts. */
const GRADIENT =
  "linear-gradient(to bottom, #fffdf8 0%, #fbb000 35.096%, #fb7100 100%)";

/** Frame 136 / 63:448 — the portrait. 63:449 sits entirely beneath it and is
 *  never visible, so it isn't rendered. */
const ME = { x: 249, y: 396, w: 1229, h: 424 } as const;

/** Frame 5 (63:418 / 63:427) — same nav geometry as the hero's. */
function Nav() {
  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute flex items-center" style={{ left: u(89), top: u(43), gap: u(14) }}>
        <button type="button" onClick={scrollToTop} className="canvas-nav cursor-pointer">
          Story
        </button>
        <MuteToggle />
      </div>
      <a
        href="mailto:t.shreeyash.01@gmail.com"
        className="canvas-nav absolute"
        style={{ right: u(89), top: u(43) }}
      >
        Contact
      </a>
    </div>
  );
}

export default function Beat8Now() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 55%",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // Hold 63:422 for two extra viewports, so the footer only turns up after
        // roughly double the usual scroll. Nothing animates during the hold —
        // that IS the point.
        ScrollTrigger.create({
          trigger: "[data-hold]",
          start: "top top",
          end: "+=200%",
          pin: true,
          invalidateOnRefresh: true,
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative w-full">
      {/* ---- Frame 71 (53:632) — the gradient ---- */}
      <div className="canvas-container relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0" style={{ background: GRADIENT }} />
        <div className="canvas-frame">
          <Nav />
          <p
            data-reveal
            className="beat8-display beat8-display--trim absolute whitespace-nowrap text-center"
            style={{ left: u(834), top: u(450), width: u(59), fontSize: u(32) }}
          >
            Now
          </p>
          <p
            data-reveal
            className="beat8-display beat8-display--bold beat8-display--trim absolute whitespace-nowrap text-center"
            style={{ left: u(329), top: u(491), width: u(1070), fontSize: u(64) }}
          >
            I turn ideas into products worth making.
          </p>
        </div>
      </div>

      {/* ---- Frame 74 (63:422) — flat orange, and the long hold ---- */}
      <div data-hold className="canvas-container relative h-screen w-full overflow-hidden bg-[#fb7100]">
        <div className="canvas-frame">
          <Nav />
          <div
            className="beat8-display beat8-display--bold absolute flex items-end text-center"
            style={{ left: u(522), top: u(314), gap: u(20) }}
          >
            {/* Figma's source text is "I am   " but its box measures 62px — it
                trims the trailing spaces, and the flex `gap` is the real
                spacing. Keeping them would widen the row past Figma's 683. */}
            <p data-reveal className="beat8-display--trim whitespace-nowrap" style={{ fontSize: u(32) }}>
              I am
            </p>
            <p data-reveal className="beat8-display--trim whitespace-nowrap" style={{ fontSize: u(64) }}>
              Shreeyash Takarkhede
            </p>
          </div>
          <div
            data-reveal
            className="absolute"
            style={{ left: u(ME.x), top: u(ME.y), width: u(ME.w), height: u(ME.h) }}
          >
            <Image
              src={asset("/beat8/me.jpg")}
              alt="Shreeyash on a mountain above Innsbruck, looking out over the valley"
              fill
              sizes="72vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* ---- Frame 73 (63:407) — the footer. No reveal: it just arrives. ---- */}
      <footer className="canvas-strip-wrap relative w-full bg-[#020108]">
        <div className="canvas-strip" style={{ height: u(94) }}>
          <div
            className="beat8-footer absolute flex items-center whitespace-nowrap"
            style={{ left: u(262), top: u(40), gap: u(107) }}
          >
            <p className="beat8-display--trim">Thank you for sticking till the end. </p>
            <p className="beat8-display--trim">
              Built with Claude and Figma.... And of course my Ai Guru&rsquo;s &ldquo;Pratea
              Patil&rdquo; &amp; &ldquo;Jatin Palande&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
