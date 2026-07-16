"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * BEATS 4 + 5 — "Adaptability → Brands & Proof".
 *
 * Frames 53:584 (Beat 4) and 53:590 (Beat 5, 1728×3176 = three stacked 991
 * canvases), played as ONE pinned scrub:
 *   0  Beat 4: the statement, big and centred on the graph grid
 *   A  it shrinks and slides to its small slot on the right; the wheel turns
 *   B  "Some of them are in homes right now. One Launches this year." centred
 *   C  that line rises, and the projects conveyor runs in
 *
 * **Why they're merged** (Shreeyash, 2026-07-16): the statement has to *travel*
 * from Beat 4's centre to Beat 5's right-hand slot. As two separate pinned
 * sections that's impossible — ScrollTrigger's pinSpacing leaves exactly one
 * viewport between Beat 4 unpinning and Beat 5 pinning, so the title scrolled
 * out and a second copy scrolled back in. One pin, one element, one tween.
 *
 * Figma only ever draws the *static* layout; the motion comes from Shreeyash's
 * reference videos (fromanother.love).
 *
 * 0 → A — THE TITLE. Both frames hold the same sentence, so it's one element
 * driven by layoutTitle(): font-size 64→32, width 1062→587, centre
 * (864,496)→(1327.5,506). Tweening the box (rather than `scale`) means the text
 * genuinely reflows into Figma's 587×58 slot instead of just being drawn
 * smaller. Beat 4's frame splits "Adaptability is" onto its own line and Beat
 * 5's doesn't; one element can't do both, so the flowing (Beat 5) version wins
 * and Beat 4's opening reads as 2 lines rather than 3.
 *
 * A — THE WHEEL. Figma shows a flat list at x=257.5, 104px apart. The video
 * puts the names on a big circle whose centre is off to the LEFT: the active
 * name sits at the rightmost point, horizontal and opaque, while names above
 * rotate up-right and names below rotate down-right, all fading with distance.
 * That's a pure `rotation` tween once the pivot is right — see .beat5-brand,
 * which puts transform-origin one radius to the element's left. Sanity check on
 * R=500/step=12°: at mid-spin the eight names span y≈171–910, against Figma's
 * flat 173–943. The wheel and the frame agree.
 *
 * C — THE CONVEYOR. Shreeyash re-cut the strip (frame 63:402) into a plain flex
 * row: eight identical 466×335 landscape cards, 20px apart, unrotated. The
 * motion comes from the video: the strip slides RIGHT→LEFT, so cards enter at
 * the right edge and Zephyr leads.
 * The cards don't sit on a straight line — they ride a very shallow arch
 * (ARC_R), apex at the middle of the frame. A card is upright and highest at
 * the apex, then tilts tangentially and drops as it heads for either edge, so
 * it curves away rather than sliding off flat. Because the arch is fixed in
 * *viewport* space, each card's y/rotation depends on where it currently is —
 * hence the per-frame layout() rather than one rigid strip transform.
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

/* ---------- A: the wheel ---------- */

/** Frame 113 (53:853) — where the active name sits, and Figma's row spacing. */
const BRAND = { x: 257.5, cy: 506, h: 42, gap: 104 } as const;
/** Wheel radius, in design px. Chosen so sin(STEP)·R === Figma's 104px gap. */
const WHEEL_R = 500;
const WHEEL_STEP = 12;

/** Figma's spelling — 01-context.md notes the brand is really "Philips". */
const BRANDS = [
  "Metal Fabrik",
  "Bajaj Electricals",
  "Hindustan Unilever",
  "Indian Oil",
  "TATA Elxsi",
  "Versuni",
  "Phillips",
  "Preethi",
];

/* ---------- 0: Beat 4's scene (frame 53:584) ---------- */

/** Grid vector 53:586 — Beat 4 has it; Beat 5's frame hides its own (53:593),
 *  so it fades out as the title leaves. */
const GRID = { x: -67, y: 0, w: 1862, h: 991 } as const;

/* ---------- B/C: the statement ---------- */

/** 53:604 (centred) → 53:875 (raised). Same box, so C is B plus an offset. */
const LINE = { x: 367, y: 425.3, w: 995, h: 116 } as const;
const LINE_RISE = { dx: -9, dy: -230.1 } as const;

/* ---------- C: the conveyor (Frame 133 / 63:402) ---------- */

/** Every card is the same box now, laid out in a flex row with a 20px gap. */
const CARD = { w: 466, h: 335 } as const;
const SPACING = 486;
/** Where the arch peaks, and how gently it curves. */
const BAND_CY = 600;
const ARC_R = 6000;
const APEX_X = 864;

/** Cards enter at the right and exit left; Zephyr leads. */
const OFF_START = 1728;
const OFF_END = -3868;

/** Baked from Figma 63:402 at 3x — see docs/05-build-plan.md. */
const PROJECTS = [
  { name: "Zephyr", src: "/beat5/zephyr.jpg" },
  { name: "Preethi Silverin", src: "/beat5/silverin.jpg" },
  { name: "Pasco", src: "/beat5/pasco.jpg" },
  { name: "Fathom", src: "/beat5/fathom.jpg" },
  { name: "C-32", src: "/beat5/c32.jpg" },
  { name: "Bajaj BLDC Ceiling Fan", src: "/beat5/fan.jpg" },
  { name: "Bajaj Instant Water Heater", src: "/beat5/heater.jpg" },
  { name: "Preethi Blue Leaf", src: "/beat5/blueleaf.jpg" },
];

/* ---------- 0 → A: the title's flight ---------- */

/**
 * From Beat 4's box (53:832: x=333 w=1062, centred on 864/496, 64px) to Beat 5's
 * (53:594: x=1034 y=477 w=587 h=58 → centre 1327.5/506, 32px). Driven as a live
 * box tween rather than `scale`, so the copy reflows into Figma's real slot.
 */
const TITLE_FROM = { fs: 64, w: 1062, cx: 864, cy: 496 } as const;
const TITLE_TO = { fs: 32, w: 587, cx: 1327.5, cy: 506 } as const;

export default function Beat5Proof() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const brands = gsap.utils.toArray<HTMLElement>("[data-brand]");

        /** Place the wheel for a fractional active index. */
        const spin = (active: number) => {
          brands.forEach((el, i) => {
            const theta = (i - active) * WHEEL_STEP;
            const slots = Math.abs(i - active);
            gsap.set(el, {
              rotation: theta,
              opacity: Math.max(0.08, 1 - slots * 0.28),
            });
          });
        };

        const cards = gsap.utils.toArray<HTMLElement>("[data-project]");
        const title = root.current!.querySelector<HTMLElement>("[data-title]")!;
        const conv = { p: 0 };
        const flight = { p: 0 };

        const unit = () =>
          (root.current!.querySelector(".canvas-frame") as HTMLElement).clientWidth / 1728;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        /**
         * The title's flight: a live box tween, so the copy reflows on the way.
         * The box is anchored by its CENTRE, because reflowing changes its
         * height — but that centring can't be `translateY(-50%)`, since GSAP
         * tweens `y`/`opacity` here and would bake the % into stale pixels (the
         * Beat 2 trap). So we measure the height and set `top` outright.
         */
        const layoutTitle = () => {
          const uu = unit();
          const p = flight.p;
          const fs = lerp(TITLE_FROM.fs, TITLE_TO.fs, p);
          const w = lerp(TITLE_FROM.w, TITLE_TO.w, p);
          const cx = lerp(TITLE_FROM.cx, TITLE_TO.cx, p);
          const cy = lerp(TITLE_FROM.cy, TITLE_TO.cy, p);
          title.style.fontSize = `${fs * uu}px`;
          title.style.width = `${w * uu}px`;
          title.style.left = `${(cx - w / 2) * uu}px`;
          title.style.top = `${cy * uu - title.offsetHeight / 2}px`;
        };

        /**
         * Lay the conveyor out for its current progress. The arch lives in
         * viewport space, so y/rotation follow each card's *live* x — which is
         * also why this re-runs on refresh, not just on scroll.
         */
        const layout = () => {
          const uu = unit();
          const offset = OFF_START + (OFF_END - OFF_START) * conv.p;
          cards.forEach((el, i) => {
            const vx = i * SPACING + CARD.w / 2 + offset;
            const phi = Math.asin(gsap.utils.clamp(-1, 1, (vx - APEX_X) / ARC_R));
            gsap.set(el, {
              x: offset * uu,
              y: ARC_R * (1 - Math.cos(phi)) * uu,
              rotation: (phi * 180) / Math.PI,
            });
          });
        };
        const relayout = () => {
          layoutTitle();
          layout();
        };

        // The wheel fades as a group — spin() owns each name's own opacity, so
        // tweening [data-brand] directly would fight it.
        gsap.set("[data-grid]", { opacity: 0 });
        gsap.set(title, { opacity: 0, y: 18 });
        gsap.set("[data-line]", { opacity: 0, y: 18 });
        gsap.set("[data-strip]", { opacity: 0 });
        gsap.set("[data-wheel]", { opacity: 0 });
        spin(0);
        relayout();

        const wheel = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=1100%",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: relayout,
          },
        });

        // ---- 0: Beat 4's scene — grid, then the statement, big and centred ----
        tl.to("[data-grid]", { opacity: 1, duration: 1.2, ease: "power2.out" })
          .to(title, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.8)
          .to({}, { duration: 1.6 });

        // ---- 0 → A: it shrinks and slides right; the grid goes with Beat 4 ----
        tl.addLabel("dock")
          .to(
            flight,
            { p: 1, duration: 2.2, ease: "power2.inOut", onUpdate: layoutTitle },
            "dock",
          )
          .to("[data-grid]", { opacity: 0, duration: 1.6, ease: "power1.inOut" }, "dock");

        // ---- A: the wheel arrives and turns ----
        tl.addLabel("wheel", "dock+=1.8")
          .to("[data-wheel]", { opacity: 1, duration: 0.8, ease: "power2.out" }, "wheel")
          .to(
            wheel,
            {
              p: 1,
              duration: 8,
              ease: "none",
              onUpdate: () => spin(wheel.p * (BRANDS.length - 1)),
            },
            "wheel+=0.4",
          );

        // ---- A → B: the wheel clears, the statement arrives centred ----
        tl.addLabel("b", "+=0.6")
          .to("[data-wheel]", { opacity: 0, duration: 0.8, ease: "power2.in" }, "b")
          .to(title, { opacity: 0, y: -18, duration: 0.8, ease: "power2.in" }, "b")
          .to("[data-line]", { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "b+=0.7")
          .to({}, { duration: 1.4 });

        // ---- B → C: the line rises, the conveyor runs in from the left ----
        tl.addLabel("c")
          .to(
            "[data-line]",
            {
              xPercent: (LINE_RISE.dx / LINE.w) * 100,
              yPercent: (LINE_RISE.dy / LINE.h) * 100,
              duration: 1.6,
              ease: "power2.inOut",
            },
            "c",
          )
          .to("[data-strip]", { opacity: 1, duration: 0.8 }, "c+=0.4")
          .to(conv, { p: 1, duration: 7, ease: "none", onUpdate: layout }, "c+=0.8")
          .to({}, { duration: 1 });
      });

      // The name label rides the pointer. Written straight to style rather than
      // through a GSAP tween so it tracks the cursor with no ticker lag.
      const strip = root.current?.querySelector<HTMLElement>("[data-strip]");
      const label = root.current?.querySelector<HTMLElement>("[data-cursor]");
      if (!strip || !label) return;

      const move = (e: PointerEvent) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>("[data-project]");
        if (!card) {
          label.dataset.on = "";
          return;
        }
        label.dataset.on = "1";
        label.textContent = card.dataset.project ?? "";
        const box = root.current!.getBoundingClientRect();
        label.style.transform = `translate(${e.clientX - box.left}px, ${e.clientY - box.top}px)`;
      };
      const leave = () => {
        label.dataset.on = "";
      };
      strip.addEventListener("pointermove", move);
      strip.addEventListener("pointerleave", leave);
      return () => {
        strip.removeEventListener("pointermove", move);
        strip.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  const statement = (
    <>
      Some of them are in <span className="beat5-display--bold">homes</span> right now.{" "}
      <span className="beat5-display--bold">One Launches</span> this year.
    </>
  );

  return (
    <section
      ref={root}
      className="relative h-screen w-full overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible"
    >
      <div className="canvas-container absolute inset-0 motion-reduce:hidden">
        <div className="canvas-frame">
          {/* ---- 0: Beat 4's grid (53:586). Leaves with Beat 4. ---- */}
          <div
            data-grid
            aria-hidden
            className="absolute z-0"
            style={{ left: u(GRID.x), top: u(GRID.y), width: u(GRID.w), height: u(GRID.h) }}
          >
            <Image src="/beat4/grid.svg" alt="" width={GRID.w} height={GRID.h} className="h-full w-full" />
          </div>

          {/* ---- A: the wheel (Frame 113). Grouped so it can fade as one —
                   spin() owns each name's own opacity. ---- */}
          <div data-wheel aria-hidden className="pointer-events-none absolute inset-0 z-10">
            {BRANDS.map((b, i) => (
              <span
                key={b}
                data-brand={i}
                className="beat5-brand absolute"
                style={{
                  left: u(BRAND.x),
                  top: u(BRAND.cy - BRAND.h / 2),
                  fontSize: u(64),
                  transformOrigin: `${u(-WHEEL_R)} 50%`,
                }}
              >
                {b}
              </span>
            ))}
          </div>

          {/* ---- 0 → A: the statement. One element for both frames; its box is
                   driven live by layoutTitle(), and `top` is its CENTRE. ---- */}
          <p
            data-title
            className="beat5-display beat5-display--trim absolute z-20 text-center"
            style={{ left: u(TITLE_FROM.cx - TITLE_FROM.w / 2), top: u(TITLE_FROM.cy), width: u(TITLE_FROM.w), fontSize: u(TITLE_FROM.fs) }}
          >
            <span className="beat5-display--bold">Adaptability is</span> why the work spans{" "}
            <span className="beat5-display--bold">across Companies, Countries &amp; Markets.</span>
          </p>

          {/* ---- B/C: the statement (53:604 → 53:875) ---- */}
          <p
            data-line
            className="beat5-display beat5-display--trim absolute z-20 text-center"
            style={{ left: u(LINE.x), top: u(LINE.y), width: u(LINE.w), fontSize: u(64) }}
          >
            {statement}
          </p>

          {/* ---- C: the conveyor (Frame 123) ---- */}
          <div data-strip className="beat5-strip absolute inset-0 z-10">
            {PROJECTS.map((p, i) => (
              <div
                key={p.name}
                data-project={p.name}
                className="beat5-project absolute"
                style={{
                  left: u(i * SPACING),
                  top: u(BAND_CY - CARD.h / 2),
                  width: u(CARD.w),
                  height: u(CARD.h),
                }}
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="30vw"
                  draggable={false}
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* The cursor-following project name. Same voice as Beat 2's
              questions — Arial, 16 design px, black — per Shreeyash. */}
          <span data-cursor className="beat5-cursor" aria-hidden />
        </div>
      </div>

      {/* Reduced-motion fallback: no wheel, no conveyor, everything readable. */}
      <div className="hidden min-h-screen flex-col justify-center gap-14 px-6 py-32 motion-reduce:flex md:px-10">
        <p className="beat5-display mx-auto max-w-3xl text-center text-xl md:text-2xl">
          <span className="beat5-display--bold">Adaptability is</span> why the work spans{" "}
          <span className="beat5-display--bold">across Companies, Countries &amp; Markets.</span>
        </p>
        <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-10 gap-y-3">
          {BRANDS.map((b) => (
            <li key={b} className="beat5-brand static text-3xl md:text-4xl">
              {b}
            </li>
          ))}
        </ul>
        <p className="beat5-display mx-auto max-w-4xl text-center text-3xl md:text-5xl">
          {statement}
        </p>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8">
          {PROJECTS.map((p) => (
            <figure key={p.name} className="w-64">
              <div className="relative w-full" style={{ aspectRatio: `${CARD.w} / ${CARD.h}` }}>
                <Image src={p.src} alt={p.name} fill sizes="16rem" className="object-cover" />
              </div>
              <figcaption className="beat5-cursor static block">{p.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
