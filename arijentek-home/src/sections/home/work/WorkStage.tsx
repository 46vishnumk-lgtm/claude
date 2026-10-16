import { useRef, useState } from "react";
import { Link } from "react-router";
import { scrollPage, useScrollProgress } from "../../../lib/motion";
import { layoutTop } from "../../../lib/stops";
import { PROJECTS, WorkDraftNote, clamp01, ease } from "./shared";

/**
 * Work A — the project stage (Noomo's framed media window + PRØDUX's
 * full-bleed panel).
 *
 * The section holds while one project at a time fills a framed stage with
 * mono labels in its corners. Scroll drives everything:
 *   intro   — the frame opens from a small plate to nearly full screen;
 *   project — its image pushes in slowly, its name rises letter by letter;
 *   cut     — the image dissolves, revealing the next project waiting
 *             underneath (no split, no seam line).
 * A strip of thumbnails under the stage shows where you are and jumps there.
 */
export function WorkStage() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const sectionRef = useRef<HTMLElement | null>(null);
  const n = PROJECTS.length;

  const INTRO = 0.1;
  const intro = ease(p / INTRO);
  const q = clamp01((p - INTRO) / (1 - INTRO)) * n;
  const i = Math.min(n - 1, Math.floor(q));
  const sub = q - i;
  const out = i === n - 1 ? 0 : ease((sub - 0.72) / 0.28);
  const nameIn = i === 0 ? intro : ease(sub / 0.25);

  const jump = (k: number) => {
    const el = sectionRef.current;
    if (!el) return;
    // From the layout: the section's box can be held by a transform.
    const top = layoutTop(el);
    const span = el.offsetHeight - window.innerHeight;
    scrollPage(top + span * (INTRO + ((k + 0.3) / n) * (1 - INTRO)));
  };

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      id="work"
      aria-label="Selected work"
      className="chapter relative"
      style={{ height: `${n * 100 + 70}svh`, background: "var(--color-white)" }}
      // Snap stops: the opened stage with the first project, then each
      // project once its name has risen (the last holds to the end).
      data-snap={Array.from({ length: n }, (_, k) => (k === n - 1 ? 1 : INTRO + ((k + (k ? 0.45 : 0)) / n) * (1 - INTRO))).join(",")}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col gap-5 overflow-hidden pb-[5.5rem] pt-24">
        {/* Heading row: the title steps back as the stage opens. */}
        <div className="shell flex items-end justify-between gap-8">
          <h2
            className="origin-bottom-left text-[clamp(2.25rem,5vw,4.75rem)] leading-[0.95] tracking-[-0.05em]"
            style={{ transform: `scale(${1 - intro * 0.35})`, opacity: 1 - intro * 0.25 }}
          >
            Selected work.
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <WorkDraftNote className="hidden lg:inline-flex" />
            <Link to="/work" className="pbtn pbtn--line pbtn--sm">
              View all work
              <span className="pbtn__icon" aria-hidden="true">
                <span>&rarr;</span>
                <span>&rarr;</span>
              </span>
            </Link>
          </div>
        </div>

        {/* The stage. Every project is stacked; the current one sits on top. */}
        <div className="shell relative flex-1">
          <div
            className="relative h-full w-full"
            style={{
              clipPath: `inset(${(1 - intro) * 14}% ${(1 - intro) * 24}% ${(1 - intro) * 14}% ${(1 - intro) * 24}% )`,
            }}
          >
            {PROJECTS.map((c, k) => {
              if (k < i || k > i + 1) return null;
              const current = k === i;
              const zoom = current ? 1.12 - ease(sub) * 0.12 : 1.12;
              return (
                <Link
                  key={c.slug}
                  to={`/work/${c.slug}`}
                  tabIndex={current ? 0 : -1}
                  aria-hidden={!current}
                  // Named plainly; the project's details are read from the
                  // list below, since the stage shows one project at a time.
                  aria-label={`${c.name} — view case`}
                  className="group absolute inset-0 block overflow-hidden"
                  style={{ zIndex: current ? 2 : 1 }}
                >
                  {/* Whole, and dissolving away over the next one at its cut. */}
                  <div className="duo duo--quiet absolute inset-0" style={{ opacity: current ? 1 - out : 1 }}>
                    <img src={c.images[0]} alt="" style={{ transform: `scale(${zoom})` }} />
                  </div>
                  {/* Legibility scrim and the corner labels. */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(15_15_17/0.78),transparent_55%)]" style={{ opacity: current ? 1 - out : 1 }} />
                  {current && (
                    <div aria-hidden="true" className="on-media absolute inset-0 flex flex-col justify-between p-5 text-white md:p-8" style={{ opacity: 1 - out }}>
                      <div className="flex justify-between font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.12em]">
                        <span>
                          {c.n} <span className="text-white/60">/ {String(n).padStart(2, "0")}</span>
                        </span>
                        <span>
                          {c.sector} &nbsp;·&nbsp; {c.year}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-8">
                        <div>
                          <p className="flex overflow-hidden pb-[0.06em] text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] tracking-[-0.05em]">
                            {c.name.split("").map((ch, j, arr) => {
                              const a = ease((nameIn - (j / arr.length) * 0.5) / 0.5);
                              return (
                                <span key={j} className="inline-block whitespace-pre" style={{ transform: `translateY(${(1 - a) * 105}%)`, opacity: a }}>
                                  {ch}
                                </span>
                              );
                            })}
                          </p>
                          <p className="mt-2 max-w-[44ch] text-[1rem] leading-[1.5] text-white/80" style={{ opacity: nameIn }}>
                            {c.line}
                          </p>
                        </div>
                        <span className="cut flex shrink-0 items-center gap-2 bg-white px-3.5 py-2 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--brand-black)] transition-colors group-hover:bg-[var(--brand-orange)] group-hover:text-white" style={{ ["--cut" as string]: "7px" }}>
                          <span aria-hidden="true">&#8599;</span> View case
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Thumbnail strip: where you are, and a way to jump. */}
        <div className="shell">
          <ol className="flex items-center gap-2" aria-label="Projects">
            {PROJECTS.map((c, k) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => jump(k)}
                  aria-label={`${c.name}${k === i ? " (current)" : ""}`}
                  aria-current={k === i ? "true" : undefined}
                  className="duo duo--quiet relative block h-10 w-16 transition-[opacity,transform] duration-300 hover:-translate-y-0.5"
                  // The current one is ringed with a shadow, leaving the
                  // outline free for the keyboard focus ring.
                  style={{ opacity: k === i ? 1 : 0.45, boxShadow: k === i ? "0 0 0 2px var(--color-white), 0 0 0 4px var(--brand-orange)" : undefined }}
                >
                  <img src={c.images[0]} alt="" />
                </button>
              </li>
            ))}
            <li aria-hidden="true" className="ml-3 font-[family-name:var(--font-mono)] text-[0.6875rem] tracking-[0.1em] text-[var(--ink-mute)]">
              {PROJECTS[i].name}
            </li>
          </ol>
        </div>
      </div>

      {/* Every project for screen readers: the stage shows one at a time.
          Out of the tab order; keyboard users have the stage and strip. */}
      <ul className="sr-only">
        {PROJECTS.map((c) => (
          <li key={c.slug}>
            <h3>{c.name}</h3>
            <p>{c.line}</p>
            <Link to={`/work/${c.slug}`} tabIndex={-1}>
              View the {c.name} case
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
