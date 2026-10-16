import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useScrollProgress } from "../../../lib/motion";
import { Meta, PROJECTS, WorkHeader } from "./shared";

/**
 * Work B — the horizontal rail (PRØDUX).
 *
 * The section holds and vertical scroll moves the projects sideways: cards of
 * different sizes on a staggered baseline. The card nearest the centre lifts
 * to full size and brightness; the others shrink, dim and turn slightly away.
 * "Selected work" sits behind the rail in outline type and travels slower,
 * so the rail reads as a layer in front of it.
 */
const SIZES = ["w-[36vw]", "w-[26vw]", "w-[32vw]", "w-[24vw]", "w-[34vw]"];
const ASPECTS = ["aspect-[4/3]", "aspect-[4/5]", "aspect-[16/11]", "aspect-[3/4]", "aspect-[16/10]"];
const DROPS = [0, 9, 3, 12, 5]; // svh, the staggered baseline

export function WorkRail() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const track = useRef<HTMLUListElement>(null);
  const [span, setSpan] = useState(0);
  const [centres, setCentres] = useState<number[]>([]);

  // Measure how far the track must travel, and where each card's centre is.
  useEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setSpan(Math.max(0, t.scrollWidth - window.innerWidth));
      setCentres(Array.from(t.children).map((li) => (li as HTMLElement).offsetLeft + (li as HTMLElement).offsetWidth / 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = -span * p;
  const vw = typeof window === "undefined" ? 1440 : window.innerWidth;

  return (
    <section
      ref={ref}
      id="work"
      aria-label="Selected work"
      className="chapter relative"
      style={{ height: "380svh", background: "var(--color-white)" }}
      // Snap stops: each card centred (the progress at which it is).
      data-snap={span ? centres.map((c) => Math.min(1, Math.max(0, (c - vw / 2) / span)).toFixed(4)).join(",") : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-24">
        <div className="shell relative z-[2]">
          <WorkHeader />
        </div>

        {/* The headline behind the rail, slower. */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[6svh] left-0 whitespace-nowrap text-[22vw] font-medium leading-none tracking-[-0.06em] text-transparent"
          style={{ WebkitTextStroke: "1px color-mix(in srgb, var(--fg) 12%, transparent)", transform: `translateX(${x * 0.35 + vw * 0.05}px)` }}
        >
          Selected work
        </p>

        <ul ref={track} className="relative z-[1] mt-10 flex flex-1 items-start gap-[4vw] pl-[var(--gutter)] pr-[18vw]" style={{ transform: `translateX(${x}px)` }}>
          {PROJECTS.map((c, k) => {
            const d = centres[k] !== undefined ? Math.abs(centres[k] + x - vw / 2) / vw : 1;
            const focus = Math.max(0, 1 - d * 1.6);
            return (
              <li
                key={c.slug}
                className={`${SIZES[k % SIZES.length]} shrink-0`}
                style={{
                  marginTop: `${DROPS[k % DROPS.length]}svh`,
                  transform: `perspective(1200px) rotateY(${(centres[k] !== undefined ? Math.sign(centres[k] + x - vw / 2) : 0) * (1 - focus) * -10}deg) scale(${0.86 + focus * 0.14})`,
                  opacity: 0.4 + focus * 0.6,
                }}
              >
                <Link to={`/work/${c.slug}`} className="group block">
                  <div className={`split ${ASPECTS[k % ASPECTS.length]}`}>
                    {(["split__a", "split__b"] as const).map((s) => (
                      <div key={s} className={`${s} duo duo--quiet`}>
                        <img src={c.images[0]} alt={s === "split__a" ? `${c.name} — lead image` : ""} loading="lazy" />
                      </div>
                    ))}
                  </div>
                  <Meta c={c} className="mt-4 text-[var(--ink-mute)]" />
                  <div className="mt-1.5 flex items-start justify-between gap-4">
                    <h3 className="text-[clamp(1.375rem,2vw,2rem)] leading-[1.05] tracking-[-0.035em]">{c.name}</h3>
                    <span className="mt-2 shrink-0 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] group-hover:text-[var(--orange-ink)]">
                      View case <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-[40ch] text-[0.9375rem] leading-[1.5] text-[var(--ink-soft)]">{c.line}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Rail progress. */}
        <div className="shell relative z-[2] pb-[5.5rem]">
          <span className="block h-px bg-[var(--rule)]">
            <span className="block h-[2px] -translate-y-[0.5px] bg-[var(--brand-orange)]" style={{ width: `${p * 100}%` }} />
          </span>
        </div>
      </div>
    </section>
  );
}
