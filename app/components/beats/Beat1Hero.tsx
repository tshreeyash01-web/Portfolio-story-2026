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
 * BEAT 1 — "The Move".
 *
 * A 1:1 rebuild of three Figma frames from `Portfolio 2026`, played as one
 * pinned, scroll-scrubbed timeline:
 *   state 1 — 53:422  "Everything in my life kept moving."
 *   state 2 — 53:448  three horizontal bars: The Coast. / The Country. / The work.
 *   state 3 — 53:460  the bars merge into one image: "So I got good at Change"
 *
 * All three frames are a 1728×991 canvas, so every raw number below is the
 * literal Figma value in design pixels, scaled at render time by `--u`
 * (see .hero-frame in globals.css).
 *
 * The key insight from the design: each state-1 image is *exactly* an
 * edge-anchored window of the matching state-2 bar (verified by pixel-diffing
 * the exports). So there is one image per row, and "the images expand
 * horizontally" is a clip-path reveal, not a resize or a crossfade:
 *   coast — anchored right, reveals leftward   (rightmost 282 of 1229)
 *   country — anchored left, reveals rightward (leftmost 566 of 1229)
 *   work — anchored right, reveals leftward    (rightmost 513 of 1229)
 * And state 2's three bars tile state 3's image block exactly, which is what
 * lets them "bleed into one big image".
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

const BAR_W = 1229;
const BLOCK = { x: 177, y: 105, w: 1374, h: 780 } as const;
/** Each bar grows to one third of the state-3 block. */
const MERGED_H = BLOCK.h / 3; // 260

type Bar = {
  id: string;
  src: string;
  alt: string;
  /** State-2 geometry — the element's actual box. */
  x: number;
  y: number;
  h: number;
  /** State-1: which edge-anchored window of the bar is visible, and where it sits. */
  windowW: number;
  anchor: "left" | "right";
  y1: number;
  /** Opacity in state 1 → state 2 (Figma differs per bar). */
  o1: number;
  o2: number;
};

const BARS: Bar[] = [
  {
    id: "coast",
    src: "/hero/coast-bar.png",
    alt: "Palm trees along an empty beach on the coast",
    x: 322,
    y: 105,
    h: 253,
    windowW: 282,
    anchor: "right",
    y1: 103,
    o1: 0.9,
    o2: 1,
  },
  {
    id: "country",
    src: "/hero/country-bar.png",
    alt: "Two figures on a dry hillside, looking out over the country",
    x: 247,
    y: 367,
    h: 254,
    windowW: 566,
    anchor: "left",
    y1: 367,
    o1: 0.9,
    o2: 0.9,
  },
  {
    id: "work",
    src: "/hero/work-bar.png",
    alt: "Sketching beside a disassembled appliance at work",
    x: 177,
    y: 631,
    h: 254,
    windowW: 513,
    anchor: "right",
    y1: 620,
    o1: 0.9,
    o2: 1,
  },
];

/** State 1: clip the bar down to its visible window, as a %, so it stays resolution-independent. */
const clipFrom = (b: Bar) => {
  const hidden = ((BAR_W - b.windowW) / BAR_W) * 100;
  return b.anchor === "right"
    ? `inset(0% 0% 0% ${hidden}%)`
    : `inset(0% ${hidden}% 0% 0%)`;
};
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/** State 1 vertical offset, as a % of the bar's own height (viewport-independent). */
const yPercentFrom = (b: Bar) => ((b.y1 - b.y) / b.h) * 100;

/** State 3: transform each bar onto its third of the merged block. */
const merge = (b: Bar, i: number) => ({
  xPercent: ((BLOCK.x - b.x) / BAR_W) * 100,
  yPercent: ((BLOCK.y + i * MERGED_H - b.y) / b.h) * 100,
  scaleX: BLOCK.w / BAR_W,
  scaleY: MERGED_H / b.h,
});

export default function Beat1Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /** The page opens on a blank canvas; everything is revealed by scrolling. */
      const setStart = () => {
        gsap.set("[data-bar]", {
          transformOrigin: "0 0",
          clipPath: (i: number) => clipFrom(BARS[i]),
          yPercent: (i: number) => yPercentFrom(BARS[i]),
          opacity: 0,
        });
        gsap.set("[data-work-gradient]", { opacity: 0 });
        gsap.set("[data-s1], [data-label], [data-s3]", { opacity: 0, y: 18 });
        gsap.set("[data-s3-img]", { opacity: 0 });
      };

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        setStart();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=650%",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // ---- State 1: the three images appear, then the text, row by row ----
        tl.addLabel("s1")
          .to(
            "[data-bar]",
            {
              opacity: (i: number) => BARS[i].o1,
              duration: 1,
              stagger: 0.45,
              ease: "power2.out",
            },
            "s1",
          )
          .to(
            '[data-s1-row="1"]',
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
            "s1+=2.2",
          )
          .to(
            '[data-s1-row="2"]',
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
            "s1+=3",
          )
          .to(
            '[data-s1-row="3"]',
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
            "s1+=3.8",
          );

        // ---- State 2: text clears, then each bar opens and takes its label ----
        tl.addLabel("s2", "s1+=5.4")
          .to(
            "[data-s1]",
            { opacity: 0, y: -18, duration: 0.7, stagger: 0.07, ease: "power2.in" },
            "s2",
          );

        BARS.forEach((b, i) => {
          const at = 0.9 + i * 1.8;
          tl.to(
            `[data-bar="${b.id}"]`,
            {
              clipPath: CLIP_OPEN,
              yPercent: 0,
              opacity: b.o2,
              duration: 1.3,
              ease: "power2.inOut",
            },
            `s2+=${at}`,
          ).to(
            `[data-label="${b.id}"]`,
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            `s2+=${at + 1.1}`,
          );
        });
        // The white wash that keeps "The work." legible only exists in state 2.
        tl.to("[data-work-gradient]", { opacity: 1, duration: 1 }, "s2+=4.7");

        // ---- State 3: the three bars bleed into one image, then the text ----
        tl.addLabel("s3", "s2+=7.2")
          .to("[data-label]", { opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.in" }, "s3")
          .to(
            "[data-bar]",
            {
              xPercent: (i: number) => merge(BARS[i], i).xPercent,
              yPercent: (i: number) => merge(BARS[i], i).yPercent,
              scaleX: (i: number) => merge(BARS[i], i).scaleX,
              scaleY: (i: number) => merge(BARS[i], i).scaleY,
              duration: 1.5,
              ease: "power2.inOut",
            },
            "s3+=0.4",
          )
          .to("[data-s3-img]", { opacity: 0.85, duration: 1.2, ease: "power2.out" }, "s3+=0.9")
          .to("[data-bar]", { opacity: 0, duration: 0.9, ease: "power2.inOut" }, "s3+=1")
          .to(
            '[data-s3="left"]',
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
            "s3+=2.4",
          )
          .to(
            '[data-s3="right"]',
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
            "s3+=3.2",
          )
          .to({}, { duration: 1.2 });
      });

      // No pin and no reveal-on-scroll: settle on state 1, which carries the copy.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setStart();
        gsap.set("[data-bar]", { opacity: (i: number) => BARS[i].o1 });
        gsap.set("[data-s1]", { opacity: 1, y: 0 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-screen w-full overflow-hidden">
      <div className="hero-container absolute inset-0">
        <div className="hero-frame">
          {/* Nav — identical in all three frames. The row keeps Story's Figma
              left/top exactly; the toggle matches the nav's 23px line height so
              `items-center` can't nudge Story off its y. */}
          <div
            className="absolute z-50 flex items-center"
            style={{ left: u(89), top: u(43), gap: u(14) }}
          >
            <button
              type="button"
              onClick={scrollToTop}
              className="hero-nav cursor-pointer"
            >
              Story
            </button>
            <MuteToggle />
          </div>
          <a
            href="mailto:t.shreeyash.01@gmail.com"
            className="hero-nav absolute z-50"
            style={{ right: u(89), top: u(43) }}
          >
            Contact
          </a>

          {/* The three images. Boxes are state-2 geometry (53:448); state 1 is a
              clipped window of each, state 3 is a transform onto the block. */}
          {BARS.map((b) => (
            <div
              key={b.id}
              data-bar={b.id}
              className="absolute z-10 overflow-hidden"
              style={{ left: u(b.x), top: u(b.y), width: u(BAR_W), height: u(b.h) }}
            >
              <Image
                src={asset(b.src)}
                alt={b.alt}
                width={BAR_W}
                height={b.h}
                priority
                unoptimized
                className="halftone h-full w-full"
              />
              {b.id === "work" && (
                <div
                  data-work-gradient
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 63.462%)",
                  }}
                />
              )}
            </div>
          ))}

          {/* ---- State 1 (53:422) ---- */}
          <span
            data-s1
            data-s1-row="1"
            className="hero-display hero-display--trim absolute z-20"
            style={{ left: u(192), top: u(213), width: u(990), fontSize: u(216) }}
          >
            Everything
          </span>
          <span
            data-s1
            data-s1-row="1"
            className="hero-display absolute z-20"
            style={{ left: u(1192), top: u(282), width: u(68), fontSize: u(64) }}
          >
            in
          </span>
          <span
            data-s1
            data-s1-row="2"
            className="hero-display hero-display--trim absolute z-20 whitespace-nowrap"
            style={{ left: u(861), top: u(451), fontSize: u(128) }}
          >
            my life
          </span>
          <span
            data-s1
            data-s1-row="2"
            className="hero-display hero-display--trim absolute z-20"
            style={{ left: u(1269), top: u(472.5), width: u(123), fontSize: u(64) }}
          >
            kept
          </span>
          {/* 63:454 bottom-aligns this with the work bar (both end at 874), which
              sits 58px lower than the old frame had it. */}
          <span
            data-s1
            data-s1-row="3"
            className="hero-display hero-display--regular hero-display--trim absolute z-20 text-right"
            style={{ left: u(166), top: u(731), width: u(716), fontSize: u(216) }}
          >
            moving.
          </span>

          {/* ---- State 2 (53:448) ---- */}
          <span
            data-label="coast"
            className="hero-display hero-display--trim absolute z-20 whitespace-nowrap"
            style={{ left: u(322), top: u(254), fontSize: u(128) }}
          >
            The Coast.
          </span>
          <span
            data-label="country"
            className="hero-display hero-display--trim absolute z-20 whitespace-nowrap"
            style={{ right: u(252), top: u(517), fontSize: u(128) }}
          >
            The Country.
          </span>
          <span
            data-label="work"
            className="hero-display hero-display--trim absolute z-20 whitespace-nowrap"
            style={{ left: u(177), top: u(780), fontSize: u(128) }}
          >
            The work.
          </span>

          {/* ---- State 3 (53:460) ---- */}
          <div
            data-s3-img
            className="absolute z-30"
            style={{ left: u(BLOCK.x), top: u(BLOCK.y), width: u(BLOCK.w), height: u(BLOCK.h) }}
          >
            <Image
              src={asset("/hero/change.png")}
              alt="A long-exposure figure blurred into motion"
              width={BLOCK.w}
              height={BLOCK.h}
              unoptimized
              className="halftone h-full w-full"
            />
          </div>
          <div
            className="absolute z-40 flex items-end whitespace-nowrap"
            style={{ left: u(228), top: u(380), gap: u(25) }}
          >
            <span
              data-s3="left"
              className="hero-display hero-display--regular hero-display--trim"
              style={{ fontSize: u(64) }}
            >
              So I got
            </span>
            <span
              data-s3="left"
              className="hero-display hero-display--trim"
              style={{ fontSize: u(128) }}
            >
              good
            </span>
          </div>
          <div
            className="absolute z-40 flex items-end whitespace-nowrap"
            style={{ left: u(1033), top: u(424), gap: u(11) }}
          >
            <span
              data-s3="right"
              className="hero-display hero-display--regular hero-display--trim"
              style={{ fontSize: u(64) }}
            >
              at
            </span>
            <span
              data-s3="right"
              className="hero-display hero-display--trim"
              style={{ fontSize: u(128) }}
            >
              Change
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
