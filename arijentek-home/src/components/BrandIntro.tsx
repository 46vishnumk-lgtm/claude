import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { SplitMark } from "./Logo";

/**
 * Brand intro — under a second, once per session.
 *
 * The mark's two halves, drawn as blueprint lines, slide together along the
 * seam; a line of orange light runs the seam; then the curtain lifts on the
 * page, which has been rendering underneath the whole time. It never waits
 * on loading and any click or key ends it at once. Reduced motion, repeat
 * visits in the same session, and the admin skip it entirely.
 *
 * Fires INTRO_DONE on window when the curtain starts to lift, so the hero
 * can hold its own reveal until it will actually be seen.
 */
export const INTRO_DONE = "arijentek:intro-done";
const KEY = "arijentek:intro";

let pending = false;
/** True while the intro is covering the page. */
export const introPending = () => pending;

const shouldPlay = () => {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(KEY) !== "seen";
  } catch {
    return true;
  }
};

export function BrandIntro() {
  const [stage, setStage] = useState<"apart" | "together" | "lift" | "gone">(() => {
    const play = shouldPlay();
    pending = play;
    return play ? "apart" : "gone";
  });

  useEffect(() => {
    if (stage === "gone") return;
    try {
      sessionStorage.setItem(KEY, "seen");
    } catch {
      /* still plays once for this page load */
    }
    const lift = () => {
      pending = false;
      window.dispatchEvent(new Event(INTRO_DONE));
      setStage("lift");
      window.setTimeout(() => setStage("gone"), 650);
    };
    const t1 = window.setTimeout(() => setStage("together"), 40);
    const t2 = window.setTimeout(lift, 900);
    const skip = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      lift();
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    // Runs once on mount; later stages are driven by the timers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "gone") return null;
  const lifting = stage === "lift";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[95] grid place-items-center"
      style={{
        background: "var(--brand-black)",
        clipPath: lifting ? "polygon(0 0, 100% 0, 100% 0, 0 0)" : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        transition: "clip-path 650ms cubic-bezier(0.65, 0, 0.35, 1)",
      }}
    >
      <div className="relative w-[min(46vw,22rem)]">
        <SplitMark outline apart={stage === "apart" ? 150 : 0} duration={760} className="w-full" />
        {/* The seam lights as the halves meet. */}
        {/* Centred on the seam line (x + y = 1191 in logo units ≈ 64% / 50%
            of this viewBox), at its 45°. */}
        <span
          className="absolute h-[2px] w-[62%]"
          style={{
            left: "64%",
            top: "50%",
            background: "var(--seam)",
            transform: `translate(-50%, -50%) rotate(-45deg) scaleX(${stage === "apart" ? 0 : 1})`,
            transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 380ms",
          }}
        />
      </div>
    </div>
  );
}
