import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "../lib/motion";

/**
 * Scroll-scrubbed word reveal.
 *
 * Ref 1 uses this on its statements: the sentence is present from the start
 * in a light grey, and scroll darkens it word by word so reading is paced by
 * the wheel. Every word stays selectable and the sentence stays one string
 * for a screen reader.
 */
export function WordReveal({
  text,
  className = "",
  from = "top 82%",
  to = "bottom 62%",
  as: Tag = "p",
  tone = "light",
  blur = false,
  progress,
  id,
}: {
  text: string;
  className?: string;
  from?: string;
  to?: string;
  as?: "p" | "h2" | "h3";
  /** "dark" for white-on-black chapters. */
  tone?: "light" | "dark";
  /** Words also come out of a blur, as in Noomo Storytelling. */
  blur?: boolean;
  /** Drive it from outside (0 → 1) instead of its own scroll window. The
   *  words then start fully hidden, so the sentence appears in place. */
  progress?: number;
  id?: string;
}) {
  // The theme's ink, which is right on every chapter in either theme.
  const ink = tone === "dark" ? "var(--color-white)" : "var(--fg)";
  const mute = tone === "dark" ? "var(--ink-inv-mute)" : "var(--fg-mute)";
  const [own, setOwn] = useState(0);
  const controlled = progress !== undefined;
  const trackRef = useScrollProgress<HTMLHeadingElement>(setOwn, {
    start: from,
    end: to,
    enabled: !controlled,
  });
  const p = controlled ? progress : own;
  const floor = controlled ? 0 : tone === "dark" ? 0.2 : 0.28;
  const words = useRef(text.split(" "));

  // Keep the split in sync if the copy ever changes.
  useEffect(() => {
    words.current = text.split(" ");
  }, [text]);

  const n = words.current.length;

  return (
    <Tag ref={trackRef} id={id} className={className}>
      {words.current.map((w, i) => {
        // Each word gets its own slice of the scrub, with a short ramp so
        // the darkening reads as a wave rather than a switch.
        const start = i / n;
        const t = Math.max(0, Math.min(1, (p - start) * n * 0.75 + 0.25));
        return (
          <span
            key={`${w}-${i}`}
            style={{
              color: `color-mix(in srgb, ${ink} ${t * 100}%, ${mute} ${(1 - t) * 100}%)`,
              opacity: floor + t * (1 - floor),
              filter: blur && t < 1 ? `blur(${((1 - t) * 6).toFixed(2)}px)` : undefined,
              transition: controlled ? undefined : "opacity 180ms linear, color 180ms linear, filter 180ms linear",
            }}
          >
            {w}
            {i < n - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
