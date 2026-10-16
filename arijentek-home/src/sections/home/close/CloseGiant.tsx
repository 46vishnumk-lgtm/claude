import { useState } from "react";
import { useMediaQuery, useReducedMotion, useScrollProgress } from "../../../lib/motion";
import { CloseActions, INVITE, NextSteps, clamp01 } from "./shared";

const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const LINES = ["What are", "you building?"];

/**
 * Close B — the giant type takeover (PRØDUX ending).
 *
 * The question rises in a soft wave of letters, grows to fill the screen,
 * and turns into a window: the orange seam gradient and a slowly drifting
 * drafting grid show through its letters. Then the answer, the next steps
 * and the actions settle in underneath.
 *
 * Everything runs as one continuous move rather than in steps: the phases
 * overlap on the same eased curve, the growth is a gentle 70% → 100%, and
 * the change of colour is a crossfade between two copies of the question
 * stacked on each other — the white one, built letter by letter, and the
 * filled one (plain text, since background-clip: text does not survive
 * transformed letters) — so the colour blends instead of flashing over.
 */
export function CloseGiant() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top bottom", end: "bottom bottom" });
  // Phones scroll freely with no hand-off to hold the section, so the held
  // build would show its empty top half first; they get the finished close
  // in the page, as reduced motion does.
  const wide = useMediaQuery("(min-width: 900px)");
  const still = useReducedMotion() || !wide;
  // p runs from the section's top at the foot of the screen (0) to its end
  // (1); it settles at the top of the screen at 0.5.
  const build = still ? 1 : clamp01((p - 0.28) / 0.32); // letters, 0.28 → 0.6
  const grow = still ? 1 : smooth((p - 0.36) / 0.4); // size, 0.36 → 0.76
  const fill = still ? 1 : smooth((p - 0.56) / 0.26); // colour, 0.56 → 0.82
  const after = (k: number) => (still ? 1 : smooth((p - 0.72 - k * 0.05) / 0.2)); // copy, 0.72 → 1

  const total = LINES.join("").length;
  const titleClass = "pb-[0.14em] font-medium leading-[0.86] tracking-[-0.06em] whitespace-nowrap";
  // The longer line, "you building?", is about 5.2em wide: sized so it
  // always fits the column, and no taller than a quarter of the screen.
  const titleSize = { fontSize: "min(calc((100vw - 2 * var(--gutter)) / 5.3), 26svh)" };
  const rise = (a: number) => (a >= 1 ? undefined : { opacity: a, transform: `translateY(${((1 - a) * 16).toFixed(1)}px)` });

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="close-title"
      className="chapter chapter--dark relative"
      style={{ height: still ? "auto" : "200svh", background: "var(--brand-black)" }}
      data-snap="1"
    >
      <div className={`${still ? "py-24" : "sticky top-0 h-[100svh]"} flex flex-col justify-center overflow-hidden`}>
        <div className="shell over-trail">
          <div className="relative origin-left" style={{ transform: `scale(${(0.7 + grow * 0.3).toFixed(4)})` }}>
            {/* The white question, built letter by letter. */}
            <h2 id="close-title" className={titleClass} style={{ ...titleSize, opacity: 1 - fill, color: "var(--color-white)" }}>
              {LINES.map((line, li) => (
                <span key={line} className="block">
                  {build >= 1
                    ? line
                    : line.split("").map((c, k) => {
                        const idx = k + (li ? LINES[0].length : 0);
                        // A soft wave: each letter takes 40% of the build.
                        const a = smooth((build - (idx / total) * 0.6) / 0.4);
                        return (
                          <span key={k} className="inline-block whitespace-pre" style={{ opacity: a, transform: `translateY(${((1 - a) * 30).toFixed(1)}%)` }}>
                            {c}
                          </span>
                        );
                      })}
                </span>
              ))}
            </h2>
            {/* The same question as a window onto the seam gradient and a
                drifting grid, fading in over the white one. */}
            {fill > 0 && (
              <p aria-hidden="true" className={`close-window absolute inset-0 ${titleClass}`} style={{ ...titleSize, opacity: fill }}>
                {LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="max-w-[44ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)]" style={rise(after(0))}>
                {INVITE}
              </p>
              <div style={rise(after(1))}>
                <NextSteps className="mt-6" />
              </div>
            </div>
            <div style={rise(after(2))}>
              <CloseActions />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
