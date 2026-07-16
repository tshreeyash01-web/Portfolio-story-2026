"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { asset } from "../../lib/asset";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * BEAT 2 — "Two Things".
 *
 * A 1:1 rebuild of Figma frame 53:470, which stacks the beat's two states on
 * one 1728×991 canvas (so every raw number below is a literal Figma value,
 * scaled at render by `--u` — see .canvas-frame in globals.css):
 *   state 1 — 58:190  grid + questions + "It taught me the two things…"
 *   state 2 — 53:727  grid + questions + "Curiosity, and the ability to adapt…"
 *
 * The window is locked (pinned) for the whole beat. The grid and the ten
 * questions are byte-identical between the two Figma states — same coords, same
 * style — so they are rendered ONCE and never move. Only the marigold text
 * swaps. Reveal order per Shreeyash: grid → questions → marigold line.
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

/** Grid vector 53:471 — bleeds 67px past the canvas on both sides. */
const GRID = { x: -67, y: 0, w: 1862, h: 991 } as const;

/** Frame 58:190 / 53:745 — the box the questions are laid out in. */
const GROUP = { x: 139, y: 142, w: 1449, h: 708 } as const;

/**
 * Group 37. `cx` is the text box's centre (Figma centres these), `y` its top —
 * both relative to GROUP. Strings are Figma's source text; the lowercasing is
 * a text-transform, exactly as in the design.
 */
const QUESTIONS: Array<{ text: string; cx: number; y: number }> = [
  { text: "Real problem?", cx: 404, y: 0 },
  { text: "why is it failing?", cx: 1110.5, y: 7 },
  { text: "Reset, rebuild.", cx: 753, y: 85 },
  { text: "What's inside?", cx: 69.5, y: 121 },
  { text: "Does it matter?", cx: 1396, y: 159 },
  { text: "Do they need it?", cx: 1379, y: 505 },
  { text: "Lets try another way", cx: 69.5, y: 542 },
  { text: "Will it work?", cx: 617, y: 580 },
  { text: "Patterns in noise?", cx: 1048.5, y: 672 },
  { text: "Feel right.", cx: 278, y: 690 },
];

/** Text 58:191 — the state-1 marigold line, as its own measured box. */
const S1 = { x: 311, y: 459, w: 1107 } as const;

/** Frame 90 — the state-2 marigold block. */
const CURIOSITY = { x: 190, y: 379, w: 1346 } as const;

export default function Beat2TwoThings() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-grid]", { opacity: 0 });
        gsap.set("[data-question]", { opacity: 0 });
        gsap.set("[data-s1], [data-s2]", { opacity: 0, y: 18 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // ---- State 1: the grid, then the questions, then the line ----
        tl.to("[data-grid]", { opacity: 1, duration: 1.2, ease: "power2.out" })
          .to(
            "[data-question]",
            {
              opacity: 1,
              duration: 0.8,
              stagger: { each: 0.12, from: "random" },
              ease: "power2.out",
            },
            0.7,
          )
          .to(
            "[data-s1]",
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            2.9,
          )
          .to({}, { duration: 1.6 });

        // ---- State 2: only the marigold text changes ----
        tl.addLabel("swap")
          .to(
            "[data-s1]",
            { opacity: 0, y: -18, duration: 0.8, ease: "power2.in" },
            "swap",
          )
          .to(
            "[data-s2]",
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            "swap+=0.5",
          )
          .to({}, { duration: 1.6 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative h-screen w-full overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible"
    >
      {/* The scroll-driven canvas. Hidden outright under reduced motion, which
          gets the linear fallback below instead. */}
      <div className="canvas-container absolute inset-0 motion-reduce:hidden">
        <div className="canvas-frame">
          {/* Grid — vector 53:471, shared by both states */}
          <div
            data-grid
            aria-hidden
            className="absolute z-0"
            style={{
              left: u(GRID.x),
              top: u(GRID.y),
              width: u(GRID.w),
              height: u(GRID.h),
            }}
          >
            <Image
              src={asset("/beat2/grid.svg")}
              alt=""
              width={GRID.w}
              height={GRID.h}
              className="h-full w-full"
            />
          </div>

          {/* Group 37 — the working questions. Identical in both states, so they
              are rendered once and simply stay put. Hover magnifies. */}
          <div
            className="absolute z-10"
            style={{
              left: u(GROUP.x),
              top: u(GROUP.y),
              width: u(GROUP.w),
              height: u(GROUP.h),
            }}
          >
            {QUESTIONS.map((q) => (
              <span
                key={q.text}
                data-question
                className="beat2-question"
                style={{ left: u(q.cx), top: u(q.y) }}
              >
                <span className="beat2-question__text">{q.text}</span>
              </span>
            ))}
          </div>

          {/* ---- State 1 (58:191) ----
              Figma centres this on the group; using its measured box instead
              keeps the element transform-free, so GSAP's `y` tween can't bake
              a translateX(-50%) into fixed pixels and break centring on resize. */}
          <p
            data-s1
            className="beat2-display absolute z-20 whitespace-nowrap text-center"
            style={{
              left: u(S1.x),
              top: u(S1.y),
              width: u(S1.w),
              fontSize: u(64),
            }}
          >
            It taught me the{" "}
            <span className="beat2-display--bold">two things</span> i trust the
            most.
          </p>

          {/* ---- State 2 (53:724) ---- */}
          <div
            data-s2
            className="beat2-display absolute z-20 flex flex-col items-start"
            style={{
              left: u(CURIOSITY.x),
              top: u(CURIOSITY.y),
              width: u(CURIOSITY.w),
              gap: u(62),
            }}
          >
            <p
              className="beat2-display--trim whitespace-nowrap"
              style={{ fontSize: u(128) }}
            >
              <span className="beat2-display--bold">Curiosity</span>,
            </p>
            <div
              className="flex items-end whitespace-nowrap"
              style={{ gap: u(33) }}
            >
              <span className="beat2-display--trim" style={{ fontSize: u(64) }}>
                and the
              </span>
              <span
                className="beat2-display--bold beat2-display--trim"
                style={{ fontSize: u(128) }}
              >
                ability to adapt
              </span>
              <span className="beat2-display--trim" style={{ fontSize: u(64) }}>
                to anything.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced-motion fallback: the same copy as a readable linear block, no
          pin and no reveal. Both marigold lines are reachable here. */}
      <div className="bg-grid hidden min-h-screen flex-col justify-center gap-16 px-6 py-32 motion-reduce:flex md:px-10">
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-10 gap-y-3">
          {QUESTIONS.map((q) => (
            <li key={q.text} className="beat2-question__text static">
              {q.text}
            </li>
          ))}
        </ul>
        <div className="beat2-display mx-auto max-w-5xl text-center">
          <p className="text-3xl md:text-5xl">
            It taught me the{" "}
            <span className="beat2-display--bold">two things</span> i trust the
            most.
          </p>
          <p className="mt-12 text-4xl md:text-6xl">
            <span className="beat2-display--bold">Curiosity</span>, and the{" "}
            <span className="beat2-display--bold">ability to adapt</span> to
            anything.
          </p>
        </div>
      </div>
    </section>
  );
}
