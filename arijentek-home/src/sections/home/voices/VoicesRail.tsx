import { useRef, useState } from "react";
import { useScrollProgress } from "../../../lib/motion";
import { QUOTES, QuotesForReaders, Steppers, VoicesDraftNote, clamp01, ease } from "./shared";

/**
 * Voices B — the horizontal scroll rail.
 *
 * The section holds and the scroll moves the quote cards sideways. The card in
 * the centre is full size and bright; the others shrink, dim and turn slightly
 * away. The tick strip travels with the rail as its progress.
 */
const CARD = 46; // rem
const GAP = 1.5; // rem

export function VoicesRail() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const el = useRef<HTMLElement | null>(null);
  const n = QUOTES.length;
  const pos = clamp01((p - 0.05) / 0.9) * (n - 1); // continuous index
  const i = Math.round(pos);

  return (
    <section
      ref={(node) => {
        el.current = node;
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      aria-labelledby="voices-title"
      className="chapter relative"
      style={{ height: `${n * 70 + 40}svh`, background: "var(--paper)" }}
      data-snap={QUOTES.map((_, k) => (k === 0 ? 0 : k === n - 1 ? 1 : 0.05 + (k / (n - 1)) * 0.9)).join(",")}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-[6rem] pt-24">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 id="voices-title" className="text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.045em]">
              In their words.
            </h2>
            <Steppers section={() => el.current} index={i} count={n} at={(k) => 0.05 + (k / (n - 1)) * 0.9} />
          </div>
          <div aria-hidden="true" className="mt-8 h-px bg-[var(--rule)]" />
        </div>

        <div className="relative mt-10 flex-1">
          {/* Screen readers get every quote from the list below. */}
          <ul
            aria-hidden="true"
            className="absolute left-1/2 top-0 flex gap-[1.5rem]"
            style={{ transform: `translateX(calc(${-CARD / 2}rem - ${pos} * ${CARD + GAP}rem))` }}
          >
            {QUOTES.map((q, k) => {
              const d = Math.abs(pos - k);
              const focus = ease(1 - Math.min(1, d));
              return (
                <li
                  key={q.name}
                  className="plate shrink-0"
                  style={{
                    width: `${CARD}rem`,
                    ["--cut" as string]: "22px",
                    opacity: 0.3 + focus * 0.7,
                    transform: `perspective(1400px) rotateY(${Math.sign(k - pos) * (1 - focus) * -12}deg) scale(${0.86 + focus * 0.14})`,
                  }}
                >
                  <figure className="plate__in flex h-full flex-col justify-between gap-10 p-8 md:p-12">
                    <blockquote className="text-[clamp(1.375rem,2.4vw,2.125rem)] leading-[1.25] tracking-[-0.025em]">
                      <span aria-hidden="true" className="text-[var(--brand-orange)]">&ldquo;</span>
                      {q.quote}
                      <span aria-hidden="true" className="text-[var(--brand-orange)]">&rdquo;</span>
                    </blockquote>
                    <figcaption className="flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-5">
                      <span>
                        <span className="block text-[0.9375rem] font-medium">{q.name}</span>
                        <span className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-mute)]">{q.role}</span>
                      </span>
                      <span className="twin twin--on text-[var(--brand-black)]" aria-hidden="true" />
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
          <QuotesForReaders />
        </div>
        <div className="shell">
          <VoicesDraftNote />
        </div>
      </div>
    </section>
  );
}
