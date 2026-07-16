"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { asset } from "../lib/asset";

/**
 * The site's one audio track, plus the splash's "entered" state.
 *
 * Browsers won't autoplay sound, which is exactly why Beat 0 exists: clicking
 * "Enter with Sound" is the user gesture that unlocks playback. Nothing plays
 * before it — and scrolling in is a deliberate way past the splash *without*
 * sound, so entering and playing are separate.
 */
type Audio = {
  /** Has the visitor come through the splash yet? */
  entered: boolean;
  muted: boolean;
  /** Leave the splash. `withSound` only when they asked for it by clicking. */
  enter: (withSound: boolean) => void;
  toggleMute: () => void;
};

const AudioCtx = createContext<Audio | null>(null);

/** Kept low on purpose — 40% of system volume, per Shreeyash. */
const VOLUME = 0.4;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(true);

  const enter = useCallback((withSound: boolean) => {
    setEntered(true);
    const el = ref.current;
    if (!el || !withSound) return; // scrolled in — stay silent, stay muted
    el.volume = VOLUME;
    el.muted = false;
    // Can still be refused (e.g. a media-autoplay block); the mute toggle is
    // then the way back in, so don't let a rejection break entering.
    el.play().then(
      () => setMuted(false),
      () => setMuted(true),
    );
  }, []);

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Derive from `muted` (what the icon shows), NOT from el.muted: someone who
    // scrolled past the splash has never played anything, so el.muted is still
    // false while the icon rightly reads muted — flipping el.muted would mute an
    // already-silent track and the first click would do nothing audible.
    const next = !muted;
    el.muted = next;
    // Also set here: a silent entry never went through enter(true), so without
    // this the first unmute would play at full volume.
    el.volume = VOLUME;
    setMuted(next);
    if (!next && el.paused) el.play().catch(() => setMuted(true));
  }, [muted]);

  const value = useMemo(
    () => ({ entered, muted, enter, toggleMute }),
    [entered, muted, enter, toggleMute],
  );

  return (
    <AudioCtx.Provider value={value}>
      {/* next/image applies basePath itself, but a plain <audio src> doesn't —
          on GitHub Pages the site lives under /Portfolio-story-2026/, so this
          one has to prefix itself or the track 404s. Empty at the root. */}
      <audio
        ref={ref}
        src={asset("/audio/veridis-quo.mp3")}
        loop
        preload="auto"
      />
      {children}
    </AudioCtx.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
};
