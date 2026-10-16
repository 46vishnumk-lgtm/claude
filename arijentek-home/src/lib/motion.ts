import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { stopFor } from "./stops";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The live smooth-scroll instance, if there is one.
 *
 * Anything that needs to stop the page scrolling has to go through Lenis:
 * it drives the scroll itself, so `overflow: hidden` on the document does
 * not stop it. There is no instance under reduced motion, hence the null.
 */
let scroller: Lenis | null = null;

/** How many things currently want the page held still. */
let locks = 0;

/**
 * Hold the page still while an overlay is open, and let it go again.
 *
 * Counted rather than boolean so two overlays cannot release each other's
 * lock. The overflow rule is the fallback for the reduced-motion path, where
 * no Lenis instance exists to stop.
 */
export function lockScroll(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const held = locks > 0;
  if (scroller) held ? scroller.stop() : scroller.start();
  document.documentElement.style.overflow = held ? "hidden" : "";
}

/**
 * Scroll the page to a position or element, through Lenis when it is running
 * (it overrides native scrolling, so `window.scrollTo` alone would be undone).
 * `immediate` jumps without the tween, for arriving on a new page.
 *
 * An element is resolved from the layout (stopFor in lib/stops.ts), not from
 * its box: a homepage section lands on its first stop, anything else just
 * clear of the floating nav. (Handing Lenis the element measured its box,
 * which on the homepage is held by a transform during a hand-off.)
 */
export function scrollPage(target: number | HTMLElement, immediate = false) {
  const y = typeof target === "number" ? target : stopFor(target);
  if (scroller) {
    // Lenis caches the page height and clamps to it; after a route change it
    // still holds the previous page's, so a jump down the new one stops short.
    scroller.resize();
    scroller.scrollTo(y, { immediate, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/**
 * In-page links (`href="#…"`) go through scrollPage, so they land on the
 * same settled state as everything else, every time (also when the URL
 * already has that hash), and focus moves to the target, so the next Tab
 * continues from there. The skip link (#main) keeps the browser's own
 * behaviour.
 */
export function useJumpLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const id = a?.getAttribute("href")?.slice(1);
      if (!id || id === "main") return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollPage(target);
      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.setAttribute("data-jump-target", "");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/**
 * Smooth scroll, driven by Lenis and synced to the GSAP ticker so
 * ScrollTrigger reads the same frame Lenis just wrote.
 */
type WheelData = { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent };
let wheelHook: ((data: WheelData) => boolean) | null = null;

/**
 * Hand wheel input to `fn` before Lenis sees it. Return false to consume the
 * event (and call preventDefault on it yourself), true to let Lenis scroll.
 */
export function setWheelHook(fn: ((data: WheelData) => boolean) | null) {
  wheelHook = fn;
}

/** The Lenis instance, when smooth scrolling is on. */
export function getScroller() {
  return scroller;
}

export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch keeps native scrolling; smoothing a thumb feels wrong.
      syncTouch: false,
      // Lets the snap scroller (lib/snap.ts) take wheel input first.
      virtualScroll: (data) => (wheelHook ? wheelHook(data) : true),
    });

    lenis.on("scroll", ScrollTrigger.update);
    scroller = lenis;
    if (locks > 0) lenis.stop();

    // Exposed in dev so the verification harness can drive real scroll
    // positions; Lenis owns the scroller and overrides window.scrollTo.
    if (import.meta.env.DEV) {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (scroller === lenis) scroller = null;
    };
  }, []);
}

/**
 * Adds [data-in] once the element enters the viewport, which is what the
 * CSS reveal primitives key off. One-way: content never un-reveals.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options?: { threshold?: number; rootMargin?: string },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.setAttribute("data-in", "");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? "0px 0px -10% 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return ref;
}

/**
 * Sets the page ground colour while this section owns the viewport.
 * The travelling ground is the reference's main structural device.
 */
export function useGround<T extends HTMLElement = HTMLElement>(color: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive) {
          document.body.style.setProperty("--ground", color);
        }
      },
    });

    return () => st.kill();
  }, [color]);

  return ref;
}

/**
 * Publishes the tone of the chapter under the middle of the viewport as
 * `data-tone` on the root element.
 *
 * The pointer trail is one viewport-fixed canvas, so it cannot carry a
 * per-section blend mode of its own; this is what the stylesheet switches on.
 */
export function useChapterTone(pageKey: string) {
  useEffect(() => {
    const dark = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) dark.add(entry.target);
          else dark.delete(entry.target);
        });
        document.documentElement.dataset.tone = dark.size ? "dark" : "light";
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document
      .querySelectorAll(".chapter--dark")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pageKey]);
}

/**
 * Normalised 0→1 scroll progress across an element, for scrubbed scenes.
 *
 * `enabled` is part of the dependency list, not just a guard: a caller that
 * mounts its scrubbed layout conditionally needs the trigger rebuilt when
 * that layout appears, or the effect runs once against a null ref and the
 * scene never scrubs.
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>(
  onProgress: (p: number) => void,
  config?: { start?: string; end?: string; pin?: boolean; enabled?: boolean },
) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  const enabled = config?.enabled ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Every scrubbed scene on this site resolves to a settled end state, so
    // reduced motion jumps straight to it instead of leaving content dimmed.
    if (prefersReducedMotion()) {
      cb.current(1);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: config?.start ?? "top top",
      end: config?.end ?? "bottom bottom",
      scrub: true,
      onUpdate: (self) => cb.current(self.progress),
    });

    return () => st.kill();
  }, [config?.start, config?.end, enabled]);

  return ref;
}

/**
 * Reactive media query, resolved on the first render rather than after it.
 *
 * This is a client-rendered app, so there is no hydration mismatch to protect
 * against — and a hook that reports false on mount makes a component that
 * branches on it render the wrong layout for one frame, which is both a
 * visible flash and enough to leave a ScrollTrigger bound to nothing.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Reactive form of `prefersReducedMotion`, for layout decisions. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * A counter that ticks when the viewport is resized, debounced.
 *
 * For layout decisions that have to be re-measured rather than re-queried.
 * Mobile browsers fire resize as the URL bar collapses, so the debounce is
 * what stops a measurement running mid-scroll.
 */
export function useResizeKey(delay = 180) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setKey((k) => k + 1), delay);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [delay]);

  return key;
}

/** Coarse pointer / small viewport, for dropping heavy scenes. */
export function useIsLite() {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setLite(mq.matches || prefersReducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return lite;
}

export { gsap, ScrollTrigger };
