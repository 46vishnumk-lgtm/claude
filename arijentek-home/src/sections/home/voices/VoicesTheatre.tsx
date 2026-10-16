import { useRef, useState } from "react";
import { useScrollProgress } from "../../../lib/motion";
import { QUOTES, QuoteMark, QuotesForReaders, Steppers, VoicesDraftNote, clamp01 } from "./shared";

/**
 * Voices A — the quote theatre (PRØDUX testimonials + Noomo Storytelling).
 *
 * The section holds and one quote at a time fills the screen at display size,
 * no card. Between two quotes the change is one soft crossfade: the old quote
 * drifts up a little and softens while the new one rises into the same place,
 * the two overlapping briefly so there is never an empty beat. The new quote
 * reads in phrase by phrase (a few words at a time, not word by word, so it
 * stays smooth at the speed of a snap glide), then its name settles in. The
 * blueprint quotation mark is drawn once and stays. The counter says where
 * you are; the arrows step from quote to quote.
 *
 * Quote k is settled, read in full, at q = k; the first is already read when
 * the section arrives. The hand-over from k to k + 1 runs over q ∈ (k + 0.2,
 * k + 1): out by k + 0.6, in from k + 0.4.
 */
const toQ = (p: number) => clamp01(p / 0.96) * (QUOTES.length - 1);
/** Progress at which quote k is settled. */
const stop = (k: number) => (k === QUOTES.length - 1 ? 1 : (0.96 * k) / (QUOTES.length - 1));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const PHRASE = 4; // words per phrase

export function VoicesTheatre() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const el = useRef<HTMLElement | null>(null);
  const n = QUOTES.length;
  const q = toQ(p);
  const i = Math.min(n - 1, Math.round(q));

  return (
    <section
      ref={(node) => {
        el.current = node;
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      aria-labelledby="voices-title"
      className="chapter relative"
      style={{ height: `${n * 90 + 60}svh`, background: "var(--paper)" }}
      data-snap={QUOTES.map((_, k) => stop(k)).join(",")}
    >
      <div className="sticky top-0 isolate flex h-[100svh] flex-col overflow-hidden pb-[6rem] pt-24">
        {/* A drafting sheet round the quotation mark, top right. */}
        <div
          aria-hidden="true"
          className="drafting-glow absolute inset-0 -z-10"
          style={{ ["--gx" as string]: "82%", ["--gy" as string]: "42%" }}
        />
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 id="voices-title" className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[0.98] tracking-[-0.045em]">
              In their words.
            </h2>
            <Steppers section={() => el.current} index={i} count={n} at={stop} />
          </div>
          <div aria-hidden="true" className="mt-6 h-px bg-[var(--rule)]" />
        </div>

        <div className="shell relative grid flex-1 items-center">
          <QuoteMark draw={1} className="pointer-events-none absolute -top-2 right-[var(--gutter)] w-[min(26vw,22rem)] opacity-80" />
          {QUOTES.map((qt, k) => {
            // Leaving: from k + 0.2 to k + 0.6. Arriving: from k - 0.6 to k.
            const out = k === n - 1 ? 0 : smooth((q - k - 0.2) / 0.4);
            const t = k === 0 ? 1 : clamp01((q - (k - 0.6)) / 0.6); // arrival, 0 → 1
            if (out >= 1 || t <= 0) return null;
            const words = qt.quote.split(" ");
            const phrases: string[] = [];
            for (let j = 0; j < words.length; j += PHRASE) phrases.push(words.slice(j, j + PHRASE).join(" "));
            const m = phrases.length;
            const nameIn = smooth((t - 0.55) / 0.45);
            return (
              <figure
                key={qt.name}
                // Screen readers get every quote from the list below.
                aria-hidden="true"
                className="relative col-start-1 row-start-1"
                style={{
                  opacity: 1 - out,
                  transform: out > 0 ? `translateY(${(-out * 28).toFixed(1)}px)` : undefined,
                  filter: out > 0.01 ? `blur(${(out * 6).toFixed(2)}px)` : undefined,
                }}
              >
                <blockquote className="max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.5rem)] leading-[1.12] tracking-[-0.035em]">
                  <span className="text-[var(--brand-orange)]">&ldquo;</span>
                  {phrases.map((ph, j) => {
                    // Phrases in turn across the first 80% of the arrival.
                    const a = smooth((t - (j / m) * 0.5) / 0.3);
                    return (
                      <span
                        key={j}
                        className="inline-block whitespace-pre-wrap"
                        style={
                          a >= 1
                            ? undefined
                            : { opacity: a, transform: `translateY(${((1 - a) * 18).toFixed(1)}px)`, filter: `blur(${((1 - a) * 5).toFixed(2)}px)` }
                        }
                      >
                        {ph}
                        {j < m - 1 ? " " : ""}
                      </span>
                    );
                  })}
                  <span className="text-[var(--brand-orange)]">&rdquo;</span>
                </blockquote>
                <figcaption className="mt-8" style={nameIn >= 1 ? undefined : { opacity: nameIn, transform: `translateY(${((1 - nameIn) * 12).toFixed(1)}px)` }}>
                  <span className="block text-[1.0625rem] font-medium">{qt.name}</span>
                  <span className="mt-1 block font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-mute)]">{qt.role}</span>
                </figcaption>
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
