import { useRef, useState } from "react";
import { useScrollProgress } from "../../../lib/motion";
import { QUOTES, QuotesForReaders, Steppers, VoicesDraftNote, clamp01, ease } from "./shared";

/**
 * Voices C — the card stack.
 *
 * The quotes lie in a pile in the middle of the screen, each card turned a
 * little, like printed notes on a desk. Every step of the scroll lifts the
 * top card off along the 45° line — up and to the right, turning as it goes —
 * revealing the next one underneath.
 */
const TILT = [-2.5, 1.8, -1.2, 2.4];

export function VoicesStack() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const el = useRef<HTMLElement | null>(null);
  const n = QUOTES.length;
  const pos = clamp01((p - 0.08) / 0.84) * (n - 1); // cards lifted so far
  const i = Math.min(n - 1, Math.floor(pos + 0.5));

  return (
    <section
      ref={(node) => {
        el.current = node;
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      aria-labelledby="voices-title"
      className="chapter relative"
      style={{ height: `${n * 80 + 40}svh`, background: "var(--paper)", overflowX: "clip" }}
      data-snap={QUOTES.map((_, k) => (k === 0 ? 0 : k === n - 1 ? 1 : 0.08 + (k / (n - 1)) * 0.84)).join(",")}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-[6rem] pt-24">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 id="voices-title" className="text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.045em]">
              In their words.
            </h2>
            <Steppers section={() => el.current} index={i} count={n} at={(k) => 0.08 + (k / (n - 1)) * 0.84} />
          </div>
          <div aria-hidden="true" className="mt-6 h-px bg-[var(--rule)]" />
        </div>

        <div className="relative flex-1">
          {QUOTES.map((q, k) => {
            const lift = ease(pos - k); // 0 resting → 1 gone
            return (
              <figure
                key={q.name}
                // Screen readers get every quote from the list below.
                aria-hidden="true"
                className="plate absolute left-1/2 top-1/2 w-[min(44rem,86vw)]"
                style={{
                  ["--cut" as string]: "22px",
                  zIndex: n - k,
                  transform: `translate(calc(-50% + ${lift * 70}vw), calc(-50% - ${lift * 70}vw)) rotate(${TILT[k % TILT.length] + lift * 18}deg)`,
                  opacity: 1 - clamp01((pos - k - 0.6) * 2.5),
                  filter: "drop-shadow(0 18px 30px rgb(15 15 17 / 0.12))",
                }}
              >
                <div className="plate__in p-8 md:p-12">
                  <blockquote className="text-[clamp(1.375rem,2.4vw,2.125rem)] leading-[1.25] tracking-[-0.025em]">
                    <span aria-hidden="true" className="text-[var(--brand-orange)]">&ldquo;</span>
                    {q.quote}
                    <span aria-hidden="true" className="text-[var(--brand-orange)]">&rdquo;</span>
                  </blockquote>
                  <figcaption className="mt-10 border-t border-[var(--rule)] pt-5">
                    <span className="block text-[0.9375rem] font-medium">{q.name}</span>
                    <span className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-mute)]">{q.role}</span>
                  </figcaption>
                </div>
              </figure>
            );
          })}
          <QuotesForReaders />
        </div>
        <div className="shell">
          <VoicesDraftNote />
        </div>
      </div>
    </section>
  );
}
