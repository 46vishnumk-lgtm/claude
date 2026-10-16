import type { Ref } from "react";
import { useReveal } from "../../lib/motion";
import { WordReveal } from "../../components/WordReveal";

const POINTS = [
  ["Senior people", "do the work"],
  ["We stay", "after launch"],
  ["Honest", "about fit"],
  ["Built to be", "handed over"],
];
const SUPPORT =
  "Where design hands off to engineering. Where a platform stops keeping up with the business. Where the people who shipped a system move on. That is where products break, and where we work.";

/**
 * Statement — "The seam".
 *
 * Still on black, straight out of the hero, with the same mark still on
 * screen (Opening.tsx), stepped to the right. The copy keeps to the left so
 * the mark has the right of the screen. The argument brightens word by word
 * out of a blur as it is read (PRØDUX's scroll-scrubbed statement with
 * Noomo's blur).
 *
 * `staged` (wide screens): a layer of the Opening's held stage. It appears
 * in place where the hero's copy was — nothing scrolls up into view — with
 * `words` driving the statement and `extras` the support copy and the four
 * points, which settle in last, one by one.
 */
export function Statement({
  trackRef,
  staged = false,
  words = 0,
  extras = 0,
}: {
  trackRef?: Ref<HTMLElement>;
  staged?: boolean;
  words?: number;
  extras?: number;
}) {
  const ref = useReveal<HTMLDivElement>();

  if (staged) {
    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const part = (k: number) => {
      const a = ease((extras - k * 0.14) / 0.45);
      // Once settled, no inline style, so the section hand-off can stage it out.
      return a >= 1 ? undefined : { opacity: a, filter: `blur(${((1 - a) * 6).toFixed(2)}px)` };
    };
    const shown = words > 0;
    return (
      <section
        id="studio"
        className="chapter chapter--dark !bg-transparent absolute inset-0"
        style={{ visibility: shown ? undefined : "hidden", pointerEvents: shown ? undefined : "none" }}
      >
        {/* The right 44% is the mark's (its Statement pose in blueprintScene):
            the points' rules end short of its foot. */}
        <div className="shell over-trail flex h-full flex-col justify-center pb-16 pt-24 lg:pr-[44%]">
          <WordReveal
            as="h2"
            tone="dark"
            blur
            progress={words}
            className="max-w-[22ch] text-[clamp(2rem,4.1vw,4.25rem)] font-medium leading-[1.03] tracking-[-0.045em]"
            text="Digital products fail at the seams. We were built so there are none: design, engineering and intelligence on one team, accountable for one outcome."
          />
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-12">
            <p
              className="font-[family-name:var(--font-mono)] text-[0.8125rem] uppercase leading-[1.7] tracking-[0.04em] text-[var(--ink-inv-soft)]"
              style={part(0)}
            >
              {SUPPORT}
            </p>
            <ul className="grid grid-cols-2 content-start">
              {POINTS.map(([a, b], k) => (
                <li key={a} className="border-t border-[var(--rule-inv)] py-4 pr-4" style={part(1 + k)}>
                  <p className="text-[0.9375rem] font-medium leading-tight text-white">{a}</p>
                  <p className="text-[0.9375rem] leading-tight text-[var(--ink-inv-mute)]">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} id="studio" className="chapter chapter--dark relative !bg-transparent">
      {/* Straight after the hero on phones (no empty screen between them). */}
      <div ref={ref} className="shell over-trail flex flex-col justify-center py-20 md:min-h-[170svh] md:py-40 lg:pr-[40%]">
        <WordReveal
          as="h2"
          tone="dark"
          blur
          from="top 80%"
          to="bottom 60%"
          className="max-w-[20ch] text-[clamp(2.25rem,5vw,5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
          text="Digital products fail at the seams. We were built so there are none: design, engineering and intelligence on one team, accountable for one outcome."
        />

        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-12" data-reveal>
          <p className="font-[family-name:var(--font-mono)] text-[0.8125rem] uppercase leading-[1.7] tracking-[0.04em] text-[var(--ink-inv-soft)]">
            {SUPPORT}
          </p>
          {/* Lines only, no fills: the mark behind should show through. */}
          <ul className="grid grid-cols-2 content-start">
            {POINTS.map(([a, b]) => (
              <li key={a} className="border-t border-[var(--rule-inv)] py-4 pr-4">
                <p className="text-[0.9375rem] font-medium leading-tight text-white">{a}</p>
                <p className="text-[0.9375rem] leading-tight text-[var(--ink-inv-mute)]">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
