"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { asset } from "../../lib/asset";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

/**
 * BEAT 3 — "The Archive".
 *
 * A 1:1 rebuild of Figma frame 53:490, same shape as Beat 2: two stacked 991
 * canvases on one 1728×991 design, played as one locked, scrubbed window.
 *   state 1 — grid + photos + "I wanted to understand how the things I loved
 *             〈glyph〉 were actually made"
 *   state 2 — same grid, same photos + "Curiosity is why I chose Industrial design"
 *
 * As in Beat 2, the constant layer (here the eight photos) is rendered ONCE and
 * never animated between states — only the marigold text swaps. Figma draws the
 * photo grid 13px lower in state 2 (y=47 vs y=34); per Shreeyash that's drift,
 * so state 1's position wins and the photos never move.
 *
 * Two interactions on top of the scroll:
 *   - the inline glyph cycles 911 → basketball → iPod → Kodak H35 → Jordan 1
 *     every 2s, and hovering it advances immediately (and restarts the dwell)
 *   - each photo can be pulled around and springs back to its Figma position
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

/** Grid vector 53:491 — bleeds 67px past the canvas on both sides. */
const GRID = { x: -67, y: 0, w: 1862, h: 991 } as const;

/** Frame 105 (53:771) — the box the photos are laid out in. */
const SHEET = { x: 113, y: 34, w: 1488, h: 898 } as const;

type Photo = {
  /** The caption number, which is also the file name. */
  n: string;
  src: string;
  alt: string;
  /** Position/size within SHEET, and the image box's aspect, straight from Figma. */
  x: number;
  y: number;
  w: number;
  aspect: string;
  gap: number;
  fit: "contain" | "cover" | "bottom";
  rounded: boolean;
};

const PHOTOS: Photo[] = [
  { n: "01", src: "/Beat 3_Curiosity/Png_FIle 01.png", alt: "A lone figure silhouetted against a blown-out sky", x: 74, y: 145, w: 120.608, aspect: "141 / 214", gap: 4, fit: "contain", rounded: true },
  { n: "02", src: "/Beat 3_Curiosity/Png_File 02.png", alt: "A sneaker, drawn", x: 421, y: 0, w: 264, aspect: "3508 / 2480", gap: 4, fit: "contain", rounded: true },
  { n: "03", src: "/Beat 3_Curiosity/Png_File 03.png", alt: "A hand, close up", x: 904.984, y: 52, w: 119.016, aspect: "119 / 181", gap: 5, fit: "contain", rounded: true },
  { n: "04", src: "/Beat 3_Curiosity/Png_File 04.png", alt: "A figure standing on a rock, arms out, above a valley", x: 1273, y: 39, w: 215, aspect: "215 / 328", gap: 5, fit: "contain", rounded: true },
  { n: "05", src: "/Beat 3_Curiosity/Png_File 05.png", alt: "Faces at night, lit from below", x: 0, y: 493, w: 213, aspect: "213 / 323", gap: 5, fit: "bottom", rounded: true },
  { n: "06", src: "/Beat 3_Curiosity/Png_File 06.png", alt: "A portrait, camera raised to the eye", x: 429, y: 640, w: 135, aspect: "141 / 223", gap: 5, fit: "cover", rounded: true },
  { n: "07", src: "/Beat 3_Curiosity/Png_File 07.png", alt: "A street scene", x: 806, y: 729, w: 218, aspect: "218 / 141", gap: 5, fit: "contain", rounded: false },
  { n: "08", src: "/Beat 3_Curiosity/Png_File 08.png", alt: "A kid mid-dance, arms flung wide", x: 1142, y: 514, w: 213, aspect: "213 / 324", gap: 5, fit: "contain", rounded: true },
];

/**
 * Frame 108 (53:824) — the inline glyph slot, which the Porsche defines: 108×35,
 * its bottom edge at y=530. Shreeyash re-cut the other icons to the same 35px
 * height in Figma (59:243); each keeps its own width, and they all sit on the
 * Porsche's bottom edge, centred across its box — so the cycle turns over in
 * place instead of shifting. The slot stays the Porsche's box: it's the widest,
 * so it's also the hover target.
 */
const GLYPH = { x: 865, y: 495, w: 108, h: 35 } as const;

/** `w`/`h` are the Figma display size in design px; `natW`/`natH` the baked file. */
const ICONS = [
  { id: "porsche", src: "/beat3/icon-porsche.png", w: 108, h: 35, natW: 432, natH: 140, alt: "A Porsche 911, drawn in line art" },
  { id: "basketball", src: "/beat3/icon-basketball.png", w: 35, h: 35, natW: 280, natH: 280, alt: "A basketball, drawn in line art" },
  { id: "ipod", src: "/beat3/icon-ipod.png", w: 36, h: 35, natW: 288, natH: 280, alt: "An iPod nano, drawn in line art" },
  { id: "camera", src: "/beat3/icon-camera.png", w: 59, h: 34.93, natW: 432, natH: 256, alt: "A Kodak Ektar H35 half-frame camera, drawn in line art" },
  { id: "shoe", src: "/beat3/icon-shoe.png", w: 58, h: 35.01, natW: 432, natH: 261, alt: "An Air Jordan 1 sneaker, drawn in line art" },
];

/** How long each icon holds before the next one flips in. Hover advances early. */
const GLYPH_MS = 2000;

/** Frame 107 (53:823) — the state-2 marigold block. */
const S2 = { x: 214, y: 369, w: 1296, h: 147 } as const;

export default function Beat3Archive() {
  const root = useRef<HTMLElement>(null);
  const [icon, setIcon] = useState(0);
  const [cycling, setCycling] = useState(false);

  // Only run the timer when motion is welcome; under reduced motion the glyph
  // just rests on the 911.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const sync = () => setCycling(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Keyed on `icon`, so advancing by hover also restarts the dwell.
  useEffect(() => {
    if (!cycling) return;
    const id = setTimeout(() => setIcon((i) => (i + 1) % ICONS.length), GLYPH_MS);
    return () => clearTimeout(id);
  }, [icon, cycling]);

  const advance = () => setIcon((i) => (i + 1) % ICONS.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-grid]", { opacity: 0 });
        gsap.set("[data-photo]", { opacity: 0 });
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

        // ---- State 1: grid, then the archive, then the line ----
        tl.to("[data-grid]", { opacity: 1, duration: 1.2, ease: "power2.out" })
          .to(
            "[data-photo]",
            {
              opacity: 1,
              duration: 0.9,
              stagger: { each: 0.14, from: "random" },
              ease: "power2.out",
            },
            0.7,
          )
          .to("[data-s1]", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 3.1)
          .to({}, { duration: 1.6 });

        // ---- State 2: only the marigold text changes ----
        tl.addLabel("swap")
          .to("[data-s1]", { opacity: 0, y: -18, duration: 0.8, ease: "power2.in" }, "swap")
          .to("[data-s2]", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "swap+=0.5")
          .to({}, { duration: 1.6 });

        // ---- Pull the photos around; they spring home on release ----
        // Draggable owns the inner element's transform outright, which is why the
        // reveal above only ever touches opacity on the outer one.
        const drags = Draggable.create("[data-drag]", {
          type: "x,y",
          cursor: "grab",
          activeCursor: "grabbing",
          dragResistance: 0.18,
          onRelease() {
            gsap.to(this.target, {
              x: 0,
              y: 0,
              duration: 1.1,
              ease: "elastic.out(1, 0.45)",
            });
          },
        });
        return () => drags.forEach((d) => d.kill());
      });
    },
    { scope: root },
  );

  const glyph = (
    <span
      className="beat3-glyph pointer-events-auto"
      style={{ left: u(GLYPH.x), top: u(GLYPH.y), width: u(GLYPH.w), height: u(GLYPH.h) }}
      onMouseEnter={advance}
    >
      {ICONS.map((ic, i) => (
        <span
          key={ic.id}
          className="beat3-glyph__icon"
          data-active={i === icon ? "" : undefined}
          style={{ width: u(ic.w), height: u(ic.h) }}
        >
          <Image src={asset(ic.src)} alt={i === icon ? ic.alt : ""} width={ic.natW} height={ic.natH} className="h-full w-full" />
        </span>
      ))}
    </span>
  );

  return (
    <section
      ref={root}
      className="relative h-screen w-full overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible"
    >
      <div className="canvas-container absolute inset-0 motion-reduce:hidden">
        <div className="canvas-frame">
          {/* Grid — vector 53:491, shared by both states */}
          <div
            data-grid
            aria-hidden
            className="absolute z-0"
            style={{ left: u(GRID.x), top: u(GRID.y), width: u(GRID.w), height: u(GRID.h) }}
          >
            <Image src={asset("/beat3/grid.svg")} alt="" width={GRID.w} height={GRID.h} className="h-full w-full" />
          </div>

          {/* Frame 105 — the archive. Constant across both states; only ever
              moved by the pointer, and it springs back. */}
          <div
            className="absolute z-10"
            style={{ left: u(SHEET.x), top: u(SHEET.y), width: u(SHEET.w), height: u(SHEET.h) }}
          >
            {PHOTOS.map((p) => (
              <div
                key={p.n}
                data-photo
                className="absolute"
                style={{ left: u(p.x), top: u(p.y), width: u(p.w) }}
              >
                <div data-drag className="beat3-photo flex flex-col items-start" style={{ gap: u(p.gap) }}>
                  <div
                    className={`relative w-full shrink-0 ${p.rounded ? "overflow-hidden" : ""}`}
                    style={{ aspectRatio: p.aspect, borderRadius: p.rounded ? u(5) : undefined }}
                  >
                    {/* `unoptimized`: these are halftones, and Next's variants
                        were resampling the dot screens away (a 120px box was
                        being served a 48px file). See .halftone in globals.css. */}
                    <Image
                      src={asset(p.src)}
                      alt={p.alt}
                      fill
                      sizes="25vw"
                      unoptimized
                      draggable={false}
                      className={`halftone ${
                        p.fit === "cover"
                          ? "object-cover"
                          : p.fit === "bottom"
                            ? "object-cover object-bottom"
                            : "object-contain"
                      }`}
                    />
                  </div>
                  <div className="beat3-caption flex w-full justify-between">
                    <span>Png_File</span>
                    <span>{p.n}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ---- State 1 (53:507 / 53:508 / 53:509 + the glyph) ----
              `pointer-events-none` is load-bearing: this layer spans the whole
              canvas above the photos, so without it the text swallows every
              press and the photos can't be grabbed at all. The glyph opts back
              in, since it needs hover. */}
          <div data-s1 className="pointer-events-none absolute inset-0 z-20">
            <p
              className="beat3-display absolute text-center"
              style={{ left: u(355), top: u(392), width: u(1019), fontSize: u(64) }}
            >
              I wanted to <span className="beat3-display--bold">understand</span> how the things
            </p>
            <p
              className="beat3-display absolute whitespace-nowrap text-center"
              style={{ left: u(666), top: u(471), width: u(176), fontSize: u(64) }}
            >
              I loved
            </p>
            <p
              className="beat3-display absolute whitespace-nowrap text-center"
              style={{ left: u(615), top: u(545), width: u(500), fontSize: u(64) }}
            >
              were actually made
            </p>
            {glyph}
          </div>

          {/* ---- State 2 (53:823) ---- */}
          <div
            data-s2
            className="beat3-display pointer-events-none absolute z-20"
            style={{ left: u(S2.x), top: u(S2.y), width: u(S2.w), height: u(S2.h) }}
          >
            <p
              className="beat3-display--trim absolute w-full text-center"
              style={{ top: 0, fontSize: u(64) }}
            >
              Curiosity is
            </p>
            <p
              className="beat3-display--bold beat3-display--trim absolute"
              style={{ left: u(372), top: u(62), width: u(924), fontSize: u(128) }}
            >
              Industrial design
            </p>
            <p
              className="beat3-display--trim absolute text-center"
              style={{ left: 0, top: u(105), width: u(376), fontSize: u(64) }}
            >
              why I chose
            </p>
          </div>
        </div>
      </div>

      {/* Reduced-motion fallback: both marigold lines readable, no pin, no drag. */}
      <div className="hidden min-h-screen flex-col justify-center gap-16 px-6 py-32 motion-reduce:flex md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8">
          {PHOTOS.map((p) => (
            <figure key={p.n} className="w-40">
              <div className="relative w-full" style={{ aspectRatio: p.aspect }}>
                <Image src={asset(p.src)} alt={p.alt} fill sizes="10rem" className="object-contain" />
              </div>
              <figcaption className="beat3-caption flex justify-between">
                <span>Png_File</span>
                <span>{p.n}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="beat3-display mx-auto max-w-4xl text-center">
          <p className="text-3xl md:text-5xl">
            I wanted to <span className="beat3-display--bold">understand</span> how the things I
            loved were actually made
          </p>
          <p className="mt-12 text-3xl md:text-5xl">
            Curiosity is why I chose{" "}
            <span className="beat3-display--bold">Industrial design</span>
          </p>
        </div>
      </div>
    </section>
  );
}
