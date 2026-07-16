"use client";

import { useAudio } from "./Audio";

/**
 * The nav's sound toggle — a speaker that flips to a crossed-out speaker.
 *
 * Sized to the nav's own 23-design-px line so it can sit in a flex row beside
 * "Story" without nudging it off its Figma y.
 */
export default function MuteToggle({ className = "" }: { className?: string }) {
  const { muted, toggleMute } = useAudio();

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={muted}
      aria-label={muted ? "Unmute the soundtrack" : "Mute the soundtrack"}
      title={muted ? "Sound off" : "Sound on"}
      className={`nav-mute ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {/* the speaker body, shared by both states */}
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {muted ? (
          <>
            <path d="m16 9 5 6" />
            <path d="m21 9-5 6" />
          </>
        ) : (
          <>
            <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" />
            <path d="M18.5 5.8a8.5 8.5 0 0 1 0 12.4" />
          </>
        )}
      </svg>
    </button>
  );
}
