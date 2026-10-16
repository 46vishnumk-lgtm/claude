import { Link } from "react-router";
import { STEPS } from "../../../data/site";
import { useReveal } from "../../../lib/motion";

export { STEPS };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

export const HEADLINE = "One team, from first interview to hundredth release.";
export const INTRO =
  "Design runs slightly ahead of engineering in the same two-week cycle, with the same people in both conversations. Nothing is handed over a wall, so nothing is lost on the way.";

/**
 * One blueprint icon per step, drawn in thin orange lines in the mark's
 * language (straight strokes and 45° cuts). `draw` (0 → 1) traces them in
 * with stroke-dashoffset, so the scroll can draw them.
 *   Discovery        — a crosshair inside a drafting frame: looking closely
 *   Design and build — two pieces meeting on one 45° seam
 *   Launch           — an arrow leaving its baseline on the 45°
 *   Evolve           — steps rising, with an arrow at the top
 */
const ICONS: string[][] = [
  ["M6 16V6H16M32 6H42V16M42 32V42H32M16 42H6V32", "M24 24m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0", "M24 10V17M24 31V38M10 24H17M31 24H38"],
  ["M8 8H36L8 36Z", "M40 12V40H12Z"],
  ["M6 42H24", "M14 34L40 8", "M27 8H40V21"],
  ["M6 42H15V33H24V24H33V15H40", "M33 6H42V15"],
];

export function StepIcon({
  index,
  draw = 1,
  className = "",
  style,
}: {
  index: number;
  draw?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} style={style}>
      {ICONS[index % ICONS.length].map((d, k) => (
        <path
          key={k}
          d={d}
          pathLength={1}
          stroke="#ea580c"
          strokeWidth={1.4}
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - clamp01(draw * 1.25 - k * 0.15) }}
        />
      ))}
    </svg>
  );
}

export function ApproachHeader({ compact = 0 }: { compact?: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <h2
        className="max-w-[14ch] origin-top-left text-[clamp(2.5rem,6.4vw,6.25rem)] leading-[0.95] tracking-[-0.05em] text-white"
        style={{ transform: compact ? `scale(${1 - compact * 0.4})` : undefined }}
      >
        {HEADLINE}
      </h2>
      <div className="lg:pt-4" style={{ opacity: 1 - compact * 0.6 }}>
        <p className="max-w-[40ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)]">{INTRO}</p>
        <Link to="/approach" className="pbtn pbtn--line pbtn--sm mt-6">
          How we work
          <span className="pbtn__icon" aria-hidden="true">
            <span>&rarr;</span>
            <span>&rarr;</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/**
 * The four steps for screen readers, whichever is on screen. The held
 * layouts show one step at a time and hide the rest, so their visual steps
 * are hidden from assistive tech and this list stands in for them.
 */
export function StepsForReaders() {
  return (
    <ol className="sr-only">
      {STEPS.map((s) => (
        <li key={s.n}>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
          <ul>
            {s.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** Phones and reduced motion: the steps as a list, each revealed as it arrives. */
export function ApproachList() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <section id="approach" className="chapter chapter--dark py-24" style={{ background: "var(--brand-black)" }}>
      <div ref={ref} className="shell over-trail">
        <ApproachHeader />
        <ol className="mt-16 grid gap-12">
          {STEPS.map((s, i) => (
            <li key={s.n} data-reveal className="border-t border-[var(--rule-inv)] pt-6">
              <div className="flex items-center justify-between">
                <p className="font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] text-[var(--orange-ink)]">{s.n}</p>
                <StepIcon index={i} className="h-10 w-10" />
              </div>
              <h3 className="mt-4 text-[1.625rem] leading-[1.1] tracking-[-0.03em] text-white">{s.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-[1.6] text-[var(--ink-inv-soft)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
