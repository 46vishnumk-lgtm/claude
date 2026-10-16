import { QUOTES } from "../../../data/site";
import { scrollPage, useReveal } from "../../../lib/motion";
import { layoutTop } from "../../../lib/stops";
import { DraftNote } from "../../../components/Page";

/** PLACEHOLDER — invented quotes from invented people (data/site.ts). */
export { QUOTES };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** PLACEHOLDER — shown at reading size until the quotes are real. */
export function VoicesDraftNote({ className = "" }: { className?: string }) {
  return <DraftNote className={className}>Placeholder quotes: the people and their words are invented.</DraftNote>;
}

/**
 * Every quote for screen readers, whichever is on screen. The held layouts
 * show one at a time, so their visual quotes are hidden from assistive tech
 * and this list stands in for them.
 */
export function QuotesForReaders() {
  return (
    <ul className="sr-only">
      {QUOTES.map((qt) => (
        <li key={qt.name}>
          <figure>
            <blockquote>&ldquo;{qt.quote}&rdquo;</blockquote>
            <figcaption>
              {qt.name}, {qt.role}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/** A large quotation mark drawn as blueprint lines, traced in by `draw`. */
export function QuoteMark({ draw = 1, className = "" }: { draw?: number; className?: string }) {
  const paths = ["M10 70V40L30 10H44L32 40H44V70Z", "M58 70V40L78 10H92L80 40H92V70Z"];
  return (
    <svg viewBox="0 0 100 80" fill="none" aria-hidden="true" className={className}>
      {paths.map((d, k) => (
        <path
          key={k}
          d={d}
          pathLength={1}
          stroke="#ea580c"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - clamp01(draw * 1.3 - k * 0.3) }}
        />
      ))}
    </svg>
  );
}

/** Prev / next buttons that move the scroll to the neighbouring quote. */
export function Steppers({ section, index, count, at }: { section: () => HTMLElement | null; index: number; count: number; at: (k: number) => number }) {
  const go = (k: number) => {
    const el = section();
    if (!el) return;
    // From the layout: the section's box can be held by a transform.
    scrollPage(layoutTop(el) + (el.offsetHeight - window.innerHeight) * at(Math.max(0, Math.min(count - 1, k))));
  };
  return (
    <div className="flex items-center gap-2">
      <span className="mr-3 font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] text-[var(--ink-mute)]" aria-live="polite">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="sbtn sbtn--line sbtn--icon cut" aria-label="Previous quote">
        &larr;
      </button>
      <button type="button" onClick={() => go(index + 1)} disabled={index === count - 1} className="sbtn sbtn--solid sbtn--icon cut" aria-label="Next quote">
        &rarr;
      </button>
    </div>
  );
}

/** Phones and reduced motion: the quotes as a list. */
export function VoicesList() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <section aria-labelledby="voices-title" className="chapter py-24" style={{ background: "var(--paper)" }}>
      <div ref={ref} className="shell">
        <h2 id="voices-title" className="text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.045em]">
          In their words.
        </h2>
        <ul className="mt-10 grid gap-4">
          {QUOTES.map((q) => (
            <li key={q.name} data-reveal className="plate" style={{ ["--cut" as string]: "18px" }}>
              <figure className="plate__in p-7">
                <blockquote className="text-[1.25rem] leading-[1.35] tracking-[-0.02em]">&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 border-t border-[var(--rule)] pt-4">
                  <span className="block text-[0.9375rem] font-medium">{q.name}</span>
                  <span className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-mute)]">{q.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <VoicesDraftNote className="mt-8" />
      </div>
    </section>
  );
}
