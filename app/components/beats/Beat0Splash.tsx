"use client";

import { useEffect } from "react";
import { useAudio } from "../Audio";
import { lockScroll, unlockScroll } from "../../lib/scroll";

/**
 * BEAT 0 — the splash.
 *
 * A 1:1 rebuild of Figma frame 53:422 ("Beat 0" — the node that used to hold
 * the hero's state 1; the hero moved to 63:454).
 *
 * It's a fixed overlay rather than a section: the story behind it must not be
 * scrollable until the visitor comes through, and the "Enter with Sound" click
 * is also the user gesture browsers require before any audio can play.
 *
 * Two ways past it (Shreeyash, 2026-07-16): click for sound, or just scroll and
 * carry on silently. Either way the mute toggle beside "Story" is the way back.
 */

/** One Figma design pixel. */
const u = (n: number) => `calc(${n} * var(--u))`;

export default function Beat0Splash() {
  const { entered, enter } = useAudio();

  // Hold the page still underneath until they're through.
  useEffect(() => {
    if (entered) unlockScroll();
    else lockScroll();
    return unlockScroll;
  }, [entered]);

  /**
   * Two ways in, per Shreeyash: click "Enter with Sound" for sound, or just
   * scroll and carry on silently. Lenis is stopped while the splash is up, so
   * the page doesn't move — but the gesture still reaches us, and that's what
   * we listen for. Deliberately NOT a click-anywhere: a stray click shouldn't
   * skip past the one thing the splash is asking.
   */
  useEffect(() => {
    if (entered) return;
    const silently = () => enter(false);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "End", " ", "Enter"].includes(e.key)) silently();
    };
    // `passive` — we never preventDefault; the splash is leaving anyway.
    window.addEventListener("wheel", silently, { passive: true });
    window.addEventListener("touchmove", silently, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", silently);
      window.removeEventListener("touchmove", silently);
      window.removeEventListener("keydown", onKey);
    };
  }, [entered, enter]);

  return (
    <div
      aria-hidden={entered}
      className={`beat0 canvas-container fixed inset-0 z-100 bg-paper ${entered ? "beat0--gone" : ""}`}
    >
      <div className="canvas-frame">
        {/* Frame 6 (53:425) — the nav, exactly as the other frames carry it. */}
        <span className="canvas-nav absolute" style={{ left: u(89), top: u(43) }}>
          Story
        </span>
        <a
          href="mailto:t.shreeyash.01@gmail.com"
          className="canvas-nav absolute"
          style={{ right: u(89), top: u(43) }}
        >
          Contact
        </a>

        {/* 63:471 */}
        <p
          className="beat0-display beat0-display--trim absolute whitespace-nowrap text-center"
          style={{ left: u(589), top: u(475), width: u(551), fontSize: u(64) }}
        >
          Welcome to my world
        </p>

        {/* 63:473 — the way in *with* sound. Scrolling also enters, silently. */}
        <button
          type="button"
          onClick={() => enter(true)}
          className="beat0-display beat0-display--trim beat0-enter absolute whitespace-nowrap text-center"
          style={{ left: u(753), top: u(824), width: u(223), fontSize: u(32) }}
        >
          Enter with Sound
        </button>
      </div>
    </div>
  );
}
