import { useState } from "react";
import { useScrollProgress } from "../../../lib/motion";
import { ApproachHeader, STEPS, StepIcon, StepsForReaders, clamp01, ease } from "./shared";

/**
 * Approach C — stacked cards (PRØDUX / sticky stack).
 *
 * Each step is a large chamfered card. As the scroll moves on, the next card
 * slides up over the last, which sinks back, shrinks a little and darkens, so
 * a pile of four builds up — the process as something accumulated.
 */
export function ApproachStack() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const n = STEPS.length;
  // 1 → n: the first card is in place as the section arrives.
  const pos = 1 + clamp01((p - 0.04) / 0.88) * (n - 1);

  return (
    <section ref={ref} id="approach" aria-label="How we work" className="chapter chapter--dark relative" style={{ height: "400svh", background: "var(--brand-black)" }} data-snap={STEPS.map((_, k) => (k === 0 ? 0 : k === STEPS.length - 1 ? 1 : 0.04 + (0.88 * k) / (STEPS.length - 1))).join(",")}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-[6rem] pt-24">
        <div className="shell over-trail">
          <ApproachHeader compact={1} />
        </div>
        {/* Clipped at the foot, so cards still to come never peek in under
            the current one; open above, where the pile builds. */}
        <div className="shell relative mt-6 flex-1" style={{ clipPath: "inset(-100vh -100vw 0 -100vw)" }}>
          {STEPS.map((s, k) => {
            const arrive = ease(pos - k); // 0 → 1 as this card comes up
            const under = clamp01(pos - k - 1); // how far later cards cover it
            const depth = Math.min(3, Math.max(0, pos - k - 1));
            return (
              <article
                key={s.n}
                className="cut absolute inset-x-0 bottom-0 mx-auto grid h-[min(23rem,46svh)] max-w-[64rem] grid-cols-[auto_1fr_auto] gap-8 p-8 md:p-10"
                style={{
                  ["--cut" as string]: "26px",
                  // The theme's raised ground, so the card and its ink swap
                  // together in the white theme; the pile darkens by filter.
                  background: "var(--brand-black-2)",
                  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-white) 8%, transparent)",
                  transform: `translateY(${(1 - arrive) * 110 - depth * 5}%) scale(${1 - depth * 0.05})`,
                  transformOrigin: "50% 0",
                  zIndex: k,
                  filter: under > 0 ? `brightness(${1 - Math.min(0.5, depth * 0.18)})` : undefined,
                }}
                // Screen readers get every step from the list below.
                aria-hidden="true"
              >
                <span className="font-[family-name:var(--font-mono)] text-[clamp(3rem,6vw,5rem)] leading-[0.8] tracking-[-0.04em] text-[var(--brand-orange)]">{s.n}</span>
                <div>
                  <h3 className="text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.02] tracking-[-0.04em] text-white">{s.title}</h3>
                  <p className="mt-3 max-w-[48ch] text-[1rem] leading-[1.6] text-[var(--ink-inv-soft)]">{s.body}</p>
                  <ul className="mt-5 grid gap-1.5">
                    {s.points.map((pt) => (
                      <li key={pt} className="font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.06em] text-[var(--ink-inv-soft)]">
                        <span aria-hidden="true" className="mr-2 text-[var(--orange-ink)]">/</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <StepIcon index={k} draw={ease((pos - k) * 1.2)} className="h-16 w-16" />
              </article>
            );
          })}
        </div>
      </div>
      <StepsForReaders />
    </section>
  );
}
