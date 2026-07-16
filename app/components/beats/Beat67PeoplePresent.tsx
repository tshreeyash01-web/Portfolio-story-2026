"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * BEATS 6 + 7 — "People" → "Present".
 *
 * A 1:1 rebuild of Figma frame 60:284 (1728×3021), and the first beat that is
 * NOT pinned: per Shreeyash it's "the normal scroll — one line comes out, one
 * frame after the other". So the canvas is a tall strip in normal flow and each
 * element simply reveals as it arrives, scrubbed like everything else.
 *
 * `--u` still resolves to the same design pixel as the pinned beats (see
 * .canvas-strip), so type and images sit at the same scale as the rest of the
 * story — the strip is just 3021 units tall instead of 991.
 *
 * Figma centres several of these texts with `-translate-x-1/2`; we use their
 * measured boxes instead, because GSAP tweens `y` on the same elements and would
 * bake the -50% into fixed pixels (the Beat 2 trap).
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

const CANVAS_H = 3021;

/** Frame 121 / image 1776 — the blurred crowd. */
const CROWD = { x: 320, y: 626, w: 1089, h: 627 } as const;

/** Frame 128 (62:372) — the four portraits. Figma sets the row to 90% opacity. */
const SHOTS = { x: 164, y: 1955, w: 1400, h: 466, cw: 335, gap: 20 } as const;
const PORTRAITS = [
  { src: "/beat67/img1.jpg", alt: "Presenting work to a room" },
  { src: "/beat67/img3.jpg", alt: "A building in Germany, under a wide sky" },
  { src: "/beat67/img2.jpg", alt: "Working at a studio bench" },
  { src: "/beat67/img4.jpg", alt: "In a workshop, among people" },
];

export default function Beat67PeoplePresent() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One line out, then the next: each element scrubs itself in as it
        // arrives, so the cadence comes from the layout rather than a timeline.
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
                start: "top 88%",
                end: "top 58%",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // The portraits share a row, so they'd otherwise arrive together —
        // stagger them off the row's own trigger.
        gsap.fromTo(
          "[data-shot]",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            stagger: 0.5,
            scrollTrigger: {
              trigger: "[data-shots]",
              start: "top 85%",
              end: "top 40%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="canvas-strip-wrap relative w-full">
      <div className="canvas-strip motion-reduce:hidden" style={{ height: u(CANVAS_H) }}>
        {/* ---- Beat 6: "Different cultures and interests / taught me what drives design." (60:302) ---- */}
        <p
          data-reveal
          className="beat67-display beat67-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(348), top: u(398), width: u(767), fontSize: u(64) }}
        >
          <span className="beat67-display--bold">Different cultures</span>
          <span style={{ fontSize: u(54) }}> </span>
          <span style={{ fontSize: u(32) }}>and</span>
          <span style={{ fontSize: u(54) }}> </span>
          <span className="beat67-display--bold">interests</span>
        </p>
        <p
          data-reveal
          className="beat67-display beat67-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(833), top: u(460), width: u(563), fontSize: u(64) }}
        >
          <span style={{ fontSize: u(32) }}>taught me what </span>
          <span className="beat67-display--bold">drives design</span>
          <span style={{ fontSize: u(54) }}>.</span>
        </p>

        {/* ---- Beat 6: the crowd (60:285) ---- */}
        <div
          data-reveal
          className="absolute"
          style={{ left: u(CROWD.x), top: u(CROWD.y), width: u(CROWD.w), height: u(CROWD.h) }}
        >
          <Image
            src="/beat67/crowd.jpg"
            alt="A crowd of figures blurred into ghosts as they walk"
            fill
            sizes="65vw"
            className="object-cover"
          />
        </div>

        {/* ---- Beat 6: "How to read people and What they need." (60:305) ---- */}
        <p
          data-reveal
          className="beat67-display beat67-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(366), top: u(1283), width: u(1012), fontSize: u(64) }}
        >
          <span className="beat67-display--bold">How to read people</span>
          <span> </span>
          <span style={{ fontSize: u(32) }}>and</span>
          <span> W</span>
          <span className="beat67-display--bold">hat they need.</span>
        </p>

        {/* ---- Beat 7: "Thats what pulled me upstream / Now in Germany…" (60:306) ---- */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ left: u(358), top: u(1748), width: u(990), gap: u(20) }}
        >
          <p
            data-reveal
            className="beat67-display beat67-display--trim w-full text-center"
            style={{ fontSize: u(32) }}
          >
            Thats what pulled me upstream
          </p>
          <p
            data-reveal
            className="beat67-display beat67-display--trim w-full text-center"
            style={{ fontSize: u(64) }}
          >
            <span style={{ fontSize: u(32) }}>Now in</span>
            <span> </span>
            <span className="beat67-display--bold">Germany</span>
            <span> </span>
            <span style={{ fontSize: u(32) }}>studying</span>
            <span> D</span>
            <span className="beat67-display--bold">esign Leadership</span>
          </p>
        </div>

        {/* ---- Beat 7: the four portraits (62:372) ---- */}
        <div
          data-shots
          className="absolute flex opacity-90"
          style={{ left: u(SHOTS.x), top: u(SHOTS.y), width: u(SHOTS.w), height: u(SHOTS.h), gap: u(SHOTS.gap) }}
        >
          {PORTRAITS.map((p) => (
            <div
              key={p.src}
              data-shot
              className="relative shrink-0"
              style={{ width: u(SHOTS.cw), height: u(SHOTS.h) }}
            >
              <Image src={p.src} alt={p.alt} fill sizes="20vw" className="object-cover" />
            </div>
          ))}
        </div>

        {/* ---- Beat 7: "Moving from making the product to / shaping the strategy behind it." (62:379) ---- */}
        <p
          data-reveal
          className="beat67-display beat67-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(249), top: u(2519), width: u(734), fontSize: u(64) }}
        >
          <span className="beat67-display--bold" style={{ fontSize: u(32) }}>Moving</span>
          <span> </span>
          <span style={{ fontSize: u(32) }}>from </span>
          <span className="beat67-display--bold">making the product</span>
          <span style={{ fontSize: u(32) }}> to</span>
        </p>
        <p
          data-reveal
          className="beat67-display beat67-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(688), top: u(2581), width: u(770), fontSize: u(64) }}
        >
          <span className="beat67-display--bold">shaping the strategy behind</span>
          <span> </span>
          <span style={{ fontSize: u(32) }}>it.</span>
        </p>
      </div>

      {/* Reduced-motion fallback: same copy and images, plain flow, no reveals. */}
      <div className="hidden flex-col gap-16 px-6 py-32 motion-reduce:flex md:px-10">
        <p className="beat67-display mx-auto max-w-4xl text-center text-3xl md:text-5xl">
          <span className="beat67-display--bold">Different cultures</span> and{" "}
          <span className="beat67-display--bold">interests</span> taught me what{" "}
          <span className="beat67-display--bold">drives design</span>.
        </p>
        <div className="relative mx-auto aspect-[1089/627] w-full max-w-4xl">
          <Image src="/beat67/crowd.jpg" alt="A crowd of figures blurred into ghosts as they walk" fill sizes="56rem" className="object-cover" />
        </div>
        <p className="beat67-display mx-auto max-w-4xl text-center text-3xl md:text-5xl">
          <span className="beat67-display--bold">How to read people</span> and{" "}
          <span className="beat67-display--bold">What they need.</span>
        </p>
        <p className="beat67-display mx-auto max-w-4xl text-center text-2xl md:text-4xl">
          Thats what pulled me upstream — Now in{" "}
          <span className="beat67-display--bold">Germany</span> studying{" "}
          <span className="beat67-display--bold">Design Leadership</span>
        </p>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5 opacity-90">
          {PORTRAITS.map((p) => (
            <div key={p.src} className="relative aspect-[335/466] w-56">
              <Image src={p.src} alt={p.alt} fill sizes="14rem" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="beat67-display mx-auto max-w-4xl text-center text-2xl md:text-4xl">
          <span className="beat67-display--bold">Moving</span> from{" "}
          <span className="beat67-display--bold">making the product</span> to{" "}
          <span className="beat67-display--bold">shaping the strategy behind</span> it.
        </p>
      </div>
    </section>
  );
}
