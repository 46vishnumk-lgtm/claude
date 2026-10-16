import { useEffect, useRef, useState } from "react";
import { SplitMark } from "../../../components/Logo";
import { useMediaQuery, useReducedMotion, useScrollProgress } from "../../../lib/motion";
import type { BlueprintScene } from "../../../three/blueprintScene";
import { CloseActions, INVITE, NextSteps, QUESTION, clamp01, ease } from "./shared";

/**
 * Close A — the mark finale (Noomo Storytelling's ending + the hero's
 * blueprint).
 *
 * The A mark returns for the first time since the opening, finished: solid,
 * its seam lit. The page opened on it as a drawing and closes on it as the
 * object. The scroll raises it from below while the question reveals word by
 * word beside it, the seam brightens, and its light runs out along the foot of
 * the section into the orange line that opens the footer. The two answers
 * arrive last, on a 45° wipe.
 */
export function CloseFinale() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(
    (v) => {
      setP(v);
      sceneRef.current?.setProgress(v / 0.7);
    },
    { start: "top bottom", end: "bottom bottom" },
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BlueprintScene | null>(null);
  const [ready, setReady] = useState(false);
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();

  // The scene loads when the section first comes near, not with the page.
  useEffect(() => {
    const el = (ref as React.RefObject<HTMLElement | null>).current;
    if (!el) return;
    let scene: BlueprintScene | null = null;
    let cancelled = false;
    let visible = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        visible = e.isIntersecting;
        if (visible && !scene && !cancelled) {
          const mod = await import("../../../three/blueprintScene");
          if (cancelled || !canvasRef.current || !mod.canWebGL()) return;
          const isWide = window.matchMedia("(min-width: 900px)").matches;
          scene = mod.createBlueprintScene(canvasRef.current, { finale: true, lite: !isWide, onFirstFrame: () => setReady(true) });
          scene.setLayout(isWide ? "wide" : "narrow");
          sceneRef.current = scene;
        }
        if (scene && !reduced) visible ? scene.start() : scene.stop();
        if (scene && reduced) {
          scene.setProgress(1);
          scene.renderOnce();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    const onResize = () => scene?.resize();
    const onMove = (ev: PointerEvent) => scene?.setPointer((ev.clientX / innerWidth) * 2 - 1, -((ev.clientY / innerHeight) * 2 - 1));
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [ref, reduced]);

  const words = QUESTION.split(" ");
  const textIn = reduced ? 1 : clamp01((p - 0.25) / 0.4);
  const actions = reduced ? 1 : ease((p - 0.68) / 0.22);
  const seam = reduced ? 1 : ease((p - 0.6) / 0.4);

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="close-title"
      className="chapter chapter--dark relative"
      style={{ height: reduced ? "auto" : "170svh", background: "var(--brand-black)" }}
      data-snap="1"
    >
      <div className={`${reduced ? "" : "sticky top-0 h-[100svh]"} relative overflow-hidden`}>
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(50% 55% at 70% 60%, rgb(234 88 12 / 0.1), transparent 70%)" }} />
        {/* Stand-in until the first frame, and wherever WebGL is missing. */}
        <SplitMark
          className="pointer-events-none absolute transition-opacity duration-700"
          style={{
            opacity: ready ? 0 : 0.9,
            right: wide ? "10%" : "50%",
            transform: wide ? undefined : "translateX(50%)",
            top: wide ? "26%" : "18%",
            width: wide ? "30vw" : "60vw",
          }}
        />
        <canvas ref={canvasRef} aria-hidden="true" className="theme-invert pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }} />

        <div className="shell over-trail relative flex h-full flex-col justify-end pb-[7rem] pt-28 md:justify-center md:pb-24">
          <p className="bracket text-[var(--ink-inv-soft)]" style={{ opacity: ease(textIn * 2) }}>
            Next step
          </p>
          <h2 id="close-title" className="mt-6 max-w-[11ch] text-[clamp(3rem,8vw,8rem)] leading-[0.9] tracking-[-0.055em] text-white">
            {words.map((w, k) => {
              const a = ease(textIn * words.length * 0.55 - k * 0.55 + 0.3);
              return (
                <span key={k} className="inline-block overflow-hidden pb-[0.06em] align-top">
                  <span className="inline-block" style={{ transform: `translateY(${(1 - a) * 105}%)` }}>
                    {w}
                    {k < words.length - 1 ? " " : ""}
                  </span>
                </span>
              );
            })}
          </h2>
          <div
            className="mt-10 max-w-[44rem]"
            style={{ clipPath: actions < 1 ? `polygon(0 0, ${actions * 200}% 0, 0 ${actions * 200}%)` : undefined, opacity: actions > 0 ? 1 : 0 }}
          >
            <p className="max-w-[40ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)]">{INVITE}</p>
            <div className="mt-7">
              <CloseActions />
            </div>
            <NextSteps className="mt-8" />
          </div>
        </div>

        {/* The seam's light running out along the foot, into the footer's line. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full origin-right"
          style={{ background: "var(--seam)", transform: `scaleX(${seam})`, boxShadow: "0 0 18px rgb(234 88 12 / 0.6)" }}
        />
      </div>
    </section>
  );
}
