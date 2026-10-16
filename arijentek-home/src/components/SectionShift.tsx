import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery, useReducedMotion } from "../lib/motion";
import { useVariant } from "../lib/variants";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/**
 * The hand-off between homepage sections, driven by the scroll and picked in
 * the Design menu ("Section change", lib/variants):
 *
 *   a  fade — in place and in sequence: both sections are held still; the
 *      outgoing one's parts leave one by one, then it dissolves and sinks
 *      away; after a beat of clean ground the incoming one focuses in and
 *      its parts assemble in reading order, finishing as it settles;
 *   b  stack — the outgoing section is held where it is and sinks back,
 *      dimming, while the incoming one slides up over it with seam light
 *      along its leading edge (Noomo's stacked chapters);
 *   c  zoom — a camera push, also in sequence: the outgoing section flies
 *      past the viewer and is gone before the incoming one grows up out of
 *      the distance;
 *   d  tiles — the ground breaks into square tiles: the outgoing section is
 *      covered tile by tile and the incoming one is uncovered the same way
 *      (PRØDUX's tile grammar, every surface made of parts);
 *   e  seam — the incoming section is cut in along a 45° line, the seam angle.
 *
 * Each wrapper tracks two windows: its entry, while its top crosses the
 * viewport, and its exit, while its bottom does. The two meet at the same
 * scroll position, so one section's exit and the next one's entry play
 * together. Everything is scrubbed, so scrolling back reverses it. The
 * effects go on an inner layer, with the outer one clipping sideways
 * (`overflow-x: clip` keeps the sticky scenes inside working), and they are
 * cleared completely while a section is at rest. Nothing under reduced motion.
 */
export function SectionShift({
  index,
  first = false,
  last = false,
  children,
}: {
  /** Position on the page; later sections stack above earlier ones. */
  index: number;
  /** No entry: the page starts here. */
  first?: boolean;
  /** No exit: the footer follows. */
  last?: boolean;
  children: ReactNode;
}) {
  const mode = useVariant("shift");
  // Phones scroll freely with a thumb, so a held hand-off reads as a blank
  // screen there; they get plain flow, as reduced motion does.
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion() || !wide;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // Entry and exit progress, only kept in state for the overlay modes.
  const [io, setIo] = useState({ e: first ? 1 : 0, x: 0 });

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || reduced) return;
    let e = first ? 1 : 0;
    let x = 0;

    // Fade's choreography: the parts on screen (headings, copy, labels,
    // buttons, list items, images) are picked up when a hand-off starts and
    // staged one by one in reading order, on top of the crossfade. Parts a
    // scene already animates itself (inline opacity / transform / filter)
    // are left alone so the two never fight.
    let inParts: Part[] | null = null;
    let outParts: Part[] | null = null;
    const release = (parts: Part[] | null) =>
      parts?.forEach(({ el }) => {
        el.style.opacity = el.style.translate = el.style.filter = el.style.scale = "";
      });

    const apply = () => {
      const s = inner.style;
      const resting = e >= 1 && x <= 0;
      if (mode !== "a" || e >= 1 || e <= 0) {
        release(inParts);
        inParts = null;
      }
      if (mode !== "a" || x <= 0 || x >= 1) {
        release(outParts);
        outParts = null;
      }
      if (resting || mode === "d" || mode === "e") {
        s.transform = s.opacity = s.filter = s.transformOrigin = "";
        outer.style.boxShadow = "";
        return;
      }
      // Scale about the middle of what is on screen, not of the whole
      // (often several screens tall) section.
      const originY = window.innerHeight / 2 - outer.getBoundingClientRect().top;
      s.transformOrigin = `50% ${originY.toFixed(1)}px`;
      const vh = window.innerHeight / 100;

      if (mode === "b") {
        // Held in place while it is covered: translate by exactly the
        // distance scrolled, less a little so it still drifts.
        const k = ease(x);
        const hold = x * window.innerHeight * 0.86;
        s.transform = x > 0 ? `translate3d(0, ${hold.toFixed(1)}px, 0) scale(${(1 - k * 0.1).toFixed(4)})` : "";
        s.opacity = x > 0 ? String(1 - k * 0.72) : "";
        s.filter = "";
        outer.style.boxShadow = e < 1 ? `0 -40px 90px -30px rgb(0 0 0 / ${(0.55 * (1 - e)).toFixed(3)})` : "";
        return;
      }

      // a fade and c zoom are sequential, never overlapping: across the
      // shared window (one section's exit is the next one's entry) the
      // outgoing section clears completely by the middle — its parts first,
      // then its ground, sinking slightly — there is a beat of clean ground,
      // and only then does the incoming one arrive, its parts finishing
      // exactly as it settles. Both are held still against the scroll the
      // whole time, so nothing travels up from below.
      const H = window.innerHeight;
      const held = (e < 1 ? -(1 - e) * H : 0) + x * H;
      const a = smooth((e - 0.52) / 0.2); // incoming ground, 0.52 → 0.72
      const b = smooth((x - 0.16) / 0.32); // outgoing ground, 0.16 → 0.48

      if (mode === "c") {
        // Zoom: the outgoing flies past the viewer, the incoming grows up
        // out of the distance.
        const scale = (0.86 + 0.14 * ease((e - 0.5) / 0.5)) * (1 + 0.28 * smooth(x / 0.5));
        s.transform = `translate3d(0, ${held.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        s.opacity = String(a * (1 - b));
        s.filter = a < 0.99 || b > 0.01 ? `blur(${((1 - a) * 6 + b * 8).toFixed(2)}px)` : "";
        return;
      }

      const sink = b * 3 * vh;
      s.transform = `translate3d(0, ${(held + sink).toFixed(1)}px, 0) scale(${((1.02 - 0.02 * a) * (1 - 0.025 * b)).toFixed(4)})`;
      s.opacity = String(a * (1 - b));
      s.filter = a < 0.99 || b > 0.01 ? `blur(${((1 - a) * 4 + b * 5).toFixed(2)}px)` : "";

      if (e > 0 && e < 1) {
        inParts ??= collectParts(inner);
        const n = inParts.length;
        inParts.forEach(({ el, media }, k) => {
          // In reading order from 0.58; each takes a fifth of the window,
          // the last finishing at 1, the moment the section settles.
          const start = 0.58 + (n > 1 ? k / (n - 1) : 0) * 0.22;
          stage(el, media, ease((e - start) / 0.2), 1);
        });
      }
      if (x > 0 && x < 1) {
        outParts ??= collectParts(inner);
        const n = outParts.length;
        outParts.forEach(({ el, media }, k) => {
          // All gone by 0.34, before the ground itself has faded.
          const start = (n > 1 ? k / (n - 1) : 0) * 0.16;
          stage(el, media, 1 - ease((x - start) / 0.18), -1);
        });
      }
    };

    const triggers: ScrollTrigger[] = [];
    if (!first)
      triggers.push(
        ScrollTrigger.create({
          trigger: outer,
          // Every mode takes exactly one screen of scroll, so a snap from
          // one section's last stop to the next one's first plays it whole.
          start: "top bottom",
          end: "top top",
          onUpdate: (st) => {
            e = st.progress;
            apply();
            setIo((v) => (v.e === e ? v : { ...v, e }));
          },
        }),
      );
    if (!last)
      triggers.push(
        ScrollTrigger.create({
          trigger: outer,
          start: "bottom bottom",
          end: "bottom top",
          onUpdate: (st) => {
            x = st.progress;
            apply();
            setIo((v) => (v.x === x ? v : { ...v, x }));
          },
        }),
      );
    // The scenes inside measure their own scroll positions, so the section
    // must be untransformed whenever ScrollTrigger measures: clear before
    // every refresh and put the effect back after it.
    const clear = () => {
      release(inParts);
      release(outParts);
      inParts = outParts = null;
      inner.style.transform = inner.style.opacity = inner.style.filter = inner.style.transformOrigin = "";
      outer.style.boxShadow = "";
    };
    ScrollTrigger.addEventListener("refreshInit", clear);
    ScrollTrigger.addEventListener("refresh", apply);
    // Pick up the current position (a reload part-way down the page).
    for (const t of triggers) t.refresh();
    apply();
    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.removeEventListener("refreshInit", clear);
      ScrollTrigger.removeEventListener("refresh", apply);
      clear();
    };
  }, [mode, reduced, first, last]);

  const live = !reduced;
  return (
    <div
      ref={outerRef}
      data-shift
      className="relative"
      // Only fade and stack need later sections painted over earlier ones; anywhere
      // else a stacking context would trap text under the pointer trail.
      style={{ zIndex: mode === "a" || mode === "b" || mode === "c" ? index + 1 : undefined, overflowX: "clip" }}
    >
      <div ref={innerRef}>{children}</div>
      {live && mode === "b" && !first && io.e > 0 && io.e < 1 && (
        // Seam light along the leading edge of the incoming section.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[2px] origin-left"
          style={{ background: "var(--seam)", transform: `scaleX(${ease(io.e * 1.4)})`, opacity: 1 - smooth((io.e - 0.75) / 0.25) }}
        />
      )}
      {live && mode === "d" && !first && io.e < 1 && <Tiles where="top" t={io.e} reveal />}
      {live && mode === "d" && !last && io.x > 0 && <Tiles where="bottom" t={io.x} />}
      {live && mode === "e" && !first && io.e < 1 && <Seam w={io.e} />}
    </div>
  );
}

type Part = { el: HTMLElement; media: boolean };

const PARTS = "h1, h2, h3, h4, p, blockquote, li, .bracket, .sbtn, .duo";

/**
 * The parts of a section that are on screen now, outermost only (an item and
 * the paragraph inside it are staged once, as the item), in reading order.
 */
function collectParts(root: HTMLElement): Part[] {
  const H = window.innerHeight;
  const found: { el: HTMLElement; top: number; left: number }[] = [];
  root.querySelectorAll<HTMLElement>(PARTS).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > H) return;
    const st = el.style;
    if (st.opacity || st.transform || st.filter || st.translate || st.scale) return;
    found.push({ el, top: Math.round(r.top / 24), left: r.left });
  });
  const picked = new Set(found.map((f) => f.el));
  return found
    .filter(({ el }) => {
      for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (picked.has(p)) return false;
      return true;
    })
    .sort((a, b) => a.top - b.top || a.left - b.left)
    .slice(0, 28)
    .map(({ el }) => ({ el, media: el.classList.contains("duo") }));
}

/**
 * One part at `l` (0 hidden → 1 in place). Text rises a little out of a
 * blur; images settle from a slight zoom instead, keeping their own filters.
 * `dir` 1 arrives from below, -1 leaves upwards.
 */
function stage(el: HTMLElement, media: boolean, l: number, dir: 1 | -1) {
  const st = el.style;
  if (l >= 1) {
    st.opacity = st.translate = st.filter = st.scale = "";
    return;
  }
  st.opacity = l.toFixed(3);
  st.translate = `0 ${((1 - l) * (dir === 1 ? 28 : -20)).toFixed(1)}px`;
  if (media) st.scale = (1 + (1 - l) * 0.06).toFixed(4);
  else st.filter = l < 0.99 ? `blur(${((1 - l) * 6).toFixed(2)}px)` : "";
}

/** A stable pseudo-random number per tile. */
const hash = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * A screen of square tiles in the page ground. Revealing (entry) they shrink
 * away and uncover the section; covering (exit) they grow over it. Tiles go
 * in a diagonal sweep with some scatter, and each flashes orange at its edge
 * while it is changing, so the sweep reads as a line of light.
 */
function Tiles({ where, t, reveal = false }: { where: "top" | "bottom"; t: number; reveal?: boolean }) {
  const cols = 14;
  const size = 100 / cols; // vw
  const rows = Math.ceil((window.innerHeight / window.innerWidth) * cols) + 1;
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      // Covering sweeps down from the top-left; revealing continues the same
      // way, so one diagonal front runs across the boundary.
      const d = ((c / cols) * 0.45 + (r / rows) * 0.55) * 0.7 + hash(i) * 0.3;
      const k = clamp01((t * 1.6 - d * 0.6) / 1);
      const shown = reveal ? 1 - ease(k) : ease(k);
      if (shown <= 0.001) continue;
      tiles.push(
        <span
          key={i}
          className="absolute"
          style={{
            left: `${c * size}vw`,
            top: `${r * size}vw`,
            width: `${size + 0.05}vw`,
            height: `${size + 0.05}vw`,
            background: "var(--bg)",
            transform: `scale(${shown.toFixed(3)})`,
            boxShadow: shown < 0.98 ? `inset 0 0 0 1px rgb(234 88 12 / ${(0.9 * (1 - shown)).toFixed(2)})` : undefined,
          }}
        />,
      );
    }
  }
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-[5] h-[100svh] overflow-hidden ${where === "top" ? "top-0" : "bottom-0"}`}
    >
      <div className={`absolute inset-x-0 ${where === "top" ? "top-0" : "bottom-0"}`} style={{ height: `${rows * size}vw` }}>
        {tiles}
      </div>
    </div>
  );
}

/**
 * The 45° cut: a sheet in the page ground over the top of the incoming
 * section, cut away along the seam angle as it rises, a line of seam light
 * riding the cut. The top edge travels from 0 to (width + height) and the
 * bottom edge trails it by exactly the height, so the line is a true 45°.
 */
function Seam({ w }: { w: number }) {
  const top = `calc(${w} * (100vw + 100svh))`;
  const bottom = `calc(${w} * (100vw + 100svh) - 100svh)`;
  const edge = (v: string) => `calc(${v} + 4px)`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[100svh]">
      <div className="absolute inset-0" style={{ background: "var(--bg)", clipPath: `polygon(${top} 0, 100% 0, 100% 100%, ${bottom} 100%)` }} />
      <div
        className="absolute inset-0"
        style={{
          background: "var(--seam)",
          clipPath: `polygon(${top} 0, ${edge(top)} 0, ${edge(bottom)} 100%, ${bottom} 100%)`,
          opacity: w > 0.02 ? 1 : 0,
        }}
      />
    </div>
  );
}
