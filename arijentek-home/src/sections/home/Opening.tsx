import { useEffect, useRef, useState } from "react";
import { SplitMark } from "../../components/Logo";
import { useMediaQuery, useReducedMotion, useScrollProgress } from "../../lib/motion";
import type { BlueprintScene } from "../../three/blueprintScene";
import { Hero } from "./Hero";
import { Statement } from "./Statement";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Opening — the hero and the Statement, sharing one mark.
 *
 * On wide screens the two are one held stage: a single screen stays put for
 * the whole opening while the scroll plays it like a sequence, with nothing
 * travelling up from below and no empty screen between the two:
 *   0.00 – 0.42  act 1: the blueprint mark turns into the object (hero);
 *   0.42 – 0.55  the hero's copy clears where it stands, the mark steps on;
 *   0.55 – 0.85  the statement brightens word by word in the same place;
 *   0.85 – 0.95  its support copy and the four points settle in;
 *   0.95 – 1.00  held, complete, before the hand-off to Practices.
 * Two snap stops (data-snap): the hero with the drawing, and the finished
 * statement; the build plays in the glide between them.
 *
 * Phones and reduced motion keep the plain flow: the hero holds on its own,
 * and the Statement follows it in the page.
 *
 * The scene is code-split and loads after first paint. Until its first frame,
 * and wherever WebGL is unavailable, an outline SVG of the mark stands in.
 */
const ACT = 0.42;
const CLEAR = [0.42, 0.55] as const;
const WORDS = [0.55, 0.85] as const;
const EXTRAS = [0.85, 0.95] as const;

export function Opening() {
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();
  const staged = wide && !reduced;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BlueprintScene | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  // Staged: one progress for the whole opening.
  const [P, setP] = useState(0);
  const stageRef = useScrollProgress<HTMLDivElement>(
    (v) => {
      setP(v);
      sceneRef.current?.setProgress(clamp01(v / ACT));
      sceneRef.current?.setPhase2(clamp01((v - CLEAR[0]) / (1 - CLEAR[0])));
    },
    { start: "top top", end: "bottom bottom", enabled: staged },
  );

  // Flow: the hero and the Statement each drive their own act.
  const [heroP, setHeroP] = useState(0);
  const heroRef = useScrollProgress<HTMLElement>(
    (v) => {
      setHeroP(v);
      sceneRef.current?.setProgress(v);
    },
    { start: "top top", end: "bottom bottom", enabled: !staged },
  );
  const statementRef = useScrollProgress<HTMLElement>(
    (v) => {
      sceneRef.current?.setPhase2(reduced ? 0 : v);
      // Phones: the column is too narrow for the mark to step aside, so it
      // would sit behind the statement's copy; it fades out as the
      // statement arrives instead (and back in on the way up to the hero).
      if (!wide && layerRef.current) {
        const k = clamp01(v / 0.3);
        layerRef.current.style.opacity = (1 - k * k * (3 - 2 * k)).toFixed(3);
      }
    },
    { start: "top 85%", end: "bottom bottom", enabled: !staged },
  );

  useEffect(() => {
    let cancelled = false;
    let scene: BlueprintScene | null = null;
    const boot = async () => {
      const mod = await import("../../three/blueprintScene");
      if (cancelled || !canvasRef.current || !mod.canWebGL()) return;
      const isWide = window.matchMedia("(min-width: 900px)").matches;
      scene = mod.createBlueprintScene(canvasRef.current, {
        lite: !isWide,
        onFirstFrame: () => !cancelled && setReady(true),
      });
      sceneRef.current = scene;
      scene.setLayout(isWide ? "wide" : "narrow");
      if (reduced) {
        // One still frame, halfway: drawing and object at once.
        scene.setProgress(0.5);
        scene.renderOnce();
      } else scene.start();
    };
    const id = window.setTimeout(boot, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    sceneRef.current?.setLayout(wide ? "wide" : "narrow");
    sceneRef.current?.resize();
    // The phone fade (above) does not apply once the screen is wide.
    if (wide && layerRef.current) layerRef.current.style.opacity = "";
  }, [wide]);

  // Render only while the layer is on screen and the tab is visible.
  useEffect(() => {
    const el = layerRef.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [staged]);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s || reduced) return;
    const sync = () => (inView && document.visibilityState === "visible" ? s.start() : s.stop());
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [inView, ready, reduced]);

  useEffect(() => {
    const onResize = () => sceneRef.current?.resize();
    const onMove = (e: PointerEvent) =>
      sceneRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const scene = (
    <>
      {/* Ground: a warm glow behind the mark and a fine dot screen (Labs). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 55% at 74% 56%, rgb(234 88 12 / 0.10), transparent 70%), radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-white) 5%, transparent) 1px, transparent 0) 0 0 / 6px 6px",
        }}
      />
      {/* Outline stand-in until the first WebGL frame. */}
      <div
        className="absolute transition-opacity duration-700"
        style={{
          opacity: ready ? 0 : 1,
          // Wide: where the mark's hero pose (HERO in blueprintScene) draws it.
          right: wide ? "7%" : "50%",
          transform: wide ? undefined : "translateX(50%)",
          // Narrow: under the hero's buttons (NARROW_HERO_Y in blueprintScene).
          top: wide ? "22.5%" : "45%",
          width: wide ? "44vw" : "76vw",
        }}
      >
        <SplitMark outline className="w-full" />
      </div>
      <canvas
        ref={canvasRef}
        className="theme-invert absolute inset-0 h-full w-full transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </>
  );

  if (staged) {
    const heroAct = clamp01(P / ACT);
    const out = clamp01((P - CLEAR[0]) / (CLEAR[1] - CLEAR[0]));
    const words = clamp01((P - WORDS[0]) / (WORDS[1] - WORDS[0]));
    const extras = clamp01((P - EXTRAS[0]) / (EXTRAS[1] - EXTRAS[0]));
    return (
      <div
        ref={stageRef}
        className="tone-dark relative"
        style={{ height: "340svh", background: "var(--brand-black)" }}
        // Snap stops: the hero (the drawing) and the read statement. One
        // scroll between them plays the whole build as a single glide.
        data-snap="0,1"
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
            {scene}
          </div>
          <Hero staged progress={heroAct} out={out} wide reduced={false} />
          <Statement staged words={words} extras={extras} />
        </div>
      </div>
    );
  }

  return (
    <div className="tone-dark relative" style={{ background: "var(--brand-black)" }}>
      <div ref={layerRef} aria-hidden="true" className="pointer-events-none sticky top-0 z-0 -mb-[100svh] h-[100svh] overflow-hidden">
        {scene}
      </div>
      <div className="relative z-[1]">
        <Hero trackRef={heroRef} progress={heroP} out={0} wide={wide} reduced={reduced} />
        <Statement trackRef={statementRef} />
      </div>
    </div>
  );
}
