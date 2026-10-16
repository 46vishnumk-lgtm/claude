import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useReducedMotion, useScrollProgress } from "../../../lib/motion";
import { type Case } from "../../../data/pages";
import { Meta, PROJECTS, WorkHeader, clamp01, ease } from "./shared";

/**
 * Work C — tile assembly (PRØDUX's square-tile grammar).
 *
 * Each project image arrives as scattered square tiles that fly in and lock
 * together as the project scrolls into view, holds, then breaks back into
 * tiles as it leaves. The copy beside it reveals line by line. Projects
 * alternate sides down the page.
 */
const COLS = 6;
const ROWS = 4;

export function WorkTiles() {
  return (
    // Top padding clears the nav; the bottom leaves room to centre the last
    // project. Snap stops: the header with the first project, then each
    // later project centred ([data-snap-item]).
    <section id="work" className="chapter pb-[24svh] pt-24 md:pt-28" style={{ background: "var(--color-white)", overflowX: "clip" }}>
      <div className="shell">
        <WorkHeader />
        {/* The gap keeps neighbours off screen while a project is centred. */}
        <ul className="mt-10 grid gap-24 md:mt-12 md:gap-[30svh]">
          {PROJECTS.map((c, k) => (
            <TileProject key={c.slug} c={c} flip={k % 2 === 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TileProject({ c, flip }: { c: Case; flip: boolean }) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced ? 0.5 : 0);
  const ref = useScrollProgress<HTMLLIElement>(setP, { start: "top bottom", end: "bottom top" });

  // Each tile's scatter vector, fixed per project.
  const scatter = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, t) => {
        const r = (seed: number) => {
          const x = Math.sin((t + 1) * seed + c.n.charCodeAt(1)) * 10000;
          return x - Math.floor(x);
        };
        return { x: (r(12.9) - 0.5) * 260, y: (r(78.2) - 0.2) * 220, rot: (r(37.7) - 0.5) * 50, delay: r(4.1) * 0.35 };
      }),
    [c.n],
  );

  // Assembled by the time the whole project is in view (p ≈ 0.35), held
  // while it is, scattered again only once it starts to leave (0.66 on).
  const assemble = reduced ? 1 : clamp01((p - 0.04) / 0.3);
  const release = reduced ? 0 : clamp01((p - 0.66) / 0.34);
  const text = reduced ? 1 : p;

  return (
    <li ref={ref} data-snap-item className={`relative isolate grid items-center gap-10 md:grid-cols-[1.35fr_1fr] md:gap-16 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
      {/* At most 55% of the screen tall, so a project is always seen whole. */}
      <Link to={`/work/${c.slug}`} className="group relative block aspect-[3/2] w-full max-w-[82svh]" aria-label={`${c.name} — view case`}>
        {/* Brand duotone, approximated per tile with a filter chain on the
            whole assembly (an overlay would cover the empty gaps too). */}
        <div className="absolute inset-0" style={{ filter: "grayscale(1) sepia(1) hue-rotate(-32deg) saturate(2.6) brightness(0.8) contrast(1.12)" }}>
          {scatter.map((s, t) => {
            const col = t % COLS;
            const row = Math.floor(t / COLS);
            const a = ease((assemble - s.delay) / (1 - s.delay));
            const b = ease((release - s.delay * 0.6) / (1 - s.delay * 0.6));
            const off = 1 - a + b;
            return (
              <div
                key={t}
                className="absolute"
                style={{
                  left: `${(col / COLS) * 100}%`,
                  top: `${(row / ROWS) * 100}%`,
                  width: `${100 / COLS + 0.15}%`,
                  height: `${100 / ROWS + 0.15}%`,
                  backgroundImage: `url(${c.images[0]})`,
                  backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                  backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
                  transform: off > 0.001 ? `translate(${s.x * off}px, ${s.y * off}px) rotate(${s.rot * off}deg) scale(${1 - off * 0.35})` : undefined,
                  opacity: 1 - Math.min(1, off * 1.2),
                }}
              />
            );
          })}
        </div>
        <span
          aria-hidden="true"
          className="cut absolute bottom-3 right-3 bg-white px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ ["--cut" as string]: "6px" }}
        >
          &#8599; View case
        </span>
      </Link>

      <div>
        {[
          <Meta key="m" c={c} className="text-[var(--ink-mute)]" />,
          <h3 key="h" className="mt-3 text-[clamp(2rem,3.6vw,3.25rem)] leading-[1] tracking-[-0.045em]">
            {c.name}
          </h3>,
          <p key="l" className="mt-4 max-w-[38ch] text-[1.125rem] leading-[1.45]">
            {c.line}
          </p>,
          <p key="d" className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-[var(--ink-soft)]">
            {c.detail}
          </p>,
          <Link key="a" to={`/work/${c.slug}`} className="pbtn pbtn--line pbtn--sm mt-6">
            View the case
            <span className="pbtn__icon" aria-hidden="true">
            <span>&rarr;</span>
            <span>&rarr;</span>
          </span>
          </Link>,
        ].map((node, k) => {
          // Line by line, all in by p = 0.34.
          const a = reduced ? 1 : ease((text - 0.06 - k * 0.035) / 0.14);
          return (
            <div key={k} style={{ opacity: a, transform: `translateY(${(1 - a) * 22}px)` }}>
              {node}
            </div>
          );
        })}
      </div>
      {/* A drafting sheet round the image (last, so the order swap above
          still moves the image). */}
      <div
        aria-hidden="true"
        className={`drafting-glow absolute -inset-x-[var(--gutter)] -inset-y-[14svh] -z-10 [--glow-size:46%_44%] [--gx:50%] [--gy:34%] md:[--gy:50%] ${flip ? "md:[--gx:72%]" : "md:[--gx:30%]"}`}
      />
    </li>
  );
}
