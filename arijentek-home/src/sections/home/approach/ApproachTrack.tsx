import { useState } from "react";
import { useScrollProgress } from "../../../lib/motion";
import { ApproachHeader, STEPS, StepIcon, clamp01, ease } from "./shared";

/**
 * Approach A — the process track (Noomo Storytelling's step-by-step).
 *
 * The section holds. The headline steps back as the steps begin, then a seam
 * marker travels along the orange rule from 01 to 04, and each step lights up
 * as it passes: its title rises, its description opens, its blueprint icon is
 * drawn in, and a giant outline numeral slides in behind it on a 45° mask.
 * Past steps stay readable but quiet; future ones show only their title.
 */
export function ApproachTrack() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const n = STEPS.length;
  const compact = ease(p / 0.12);
  const t = clamp01((p - 0.1) / 0.85); // marker 0 → 1
  const active = Math.min(n - 1, Math.floor(t * n));

  return (
    <section ref={ref} id="approach" aria-label="How we work" className="chapter chapter--dark relative" style={{ height: "420svh", background: "var(--brand-black)" }} data-snap={STEPS.map((_, k) => (k === STEPS.length - 1 ? 1 : 0.1 + (0.85 * (k + 0.5)) / STEPS.length)).join(",")}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-[6rem] pt-24">
        <div className="shell over-trail">
          <ApproachHeader compact={compact} />
        </div>

        <div className="shell over-trail relative mt-auto">
          {/* Giant outline numeral of the active step, behind the track. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-[0.62em] select-none font-medium leading-none tracking-[-0.06em] text-transparent transition-[left] duration-700 ease-[var(--ease)]"
            style={{
              fontSize: "clamp(9rem,18vw,17rem)",
              WebkitTextStroke: "1px rgb(234 88 12 / 0.4)",
              left: `${(active / n) * 100}%`,
              clipPath: `polygon(0 0, ${ease((t * n - active) / 0.25) * 200}% 0, 0 ${ease((t * n - active) / 0.25) * 200}%)`,
            }}
          >
            {STEPS[active].n}
          </span>

          {/* The rule and its travelling seam marker. */}
          <div className="relative h-[2px] bg-[var(--rule-inv)]">
            <span className="absolute inset-y-0 left-0" style={{ width: `${t * 100}%`, background: "var(--seam)" }} />
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--brand-orange)] shadow-[0_0_18px_rgb(234_88_12/0.8)]"
              style={{ left: `${t * 100}%` }}
            />
          </div>

          <ol className="relative grid grid-cols-4 gap-8 pt-8">
            {STEPS.map((s, k) => {
              const local = clamp01(t * n - k); // 0 before, 0 → 1 while active
              const reached = t * n >= k;
              const on = k === active;
              const titleIn = ease(local / 0.3);
              const bodyIn = ease((local - 0.15) / 0.3);
              return (
                <li key={s.n} className="relative" aria-current={on ? "step" : undefined}>
                  <span aria-hidden="true" className="absolute -top-[2.4rem] left-0 h-[2px] w-4 -skew-y-[45deg]" style={{ background: reached ? "var(--brand-orange)" : "var(--rule-inv-strong)" }} />
                  <div className="flex items-center justify-between">
                    <p className="font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em]" style={{ color: reached ? "var(--brand-orange)" : "var(--ink-inv-mute)" }}>
                      {s.n}
                    </p>
                    <StepIcon index={k} draw={ease(local / 0.5)} className="h-11 w-11" />
                  </div>
                  <h3
                    className="mt-5 overflow-hidden text-[1.75rem] leading-[1.1] tracking-[-0.03em]"
                    style={{ color: on ? "var(--color-white)" : reached ? "var(--ink-inv-soft)" : "var(--ink-inv-mute)" }}
                  >
                    <span className="block" style={{ transform: on ? `translateY(${(1 - titleIn) * 40}%)` : undefined }}>
                      {s.title}
                    </span>
                  </h3>
                  <p
                    className="mt-3 text-[0.9375rem] leading-[1.6] text-[var(--ink-inv-soft)]"
                    style={{ opacity: reached ? Math.max(bodyIn, on ? 0 : 0.45) : 0, transform: `translateY(${(1 - (reached ? bodyIn : 0)) * 14}px)` }}
                  >
                    {s.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
