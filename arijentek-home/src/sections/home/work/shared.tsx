import { Link } from "react-router";
import { CASES, type Case } from "../../../data/pages";
import { useReveal } from "../../../lib/motion";
import { DraftNote } from "../../../components/Page";

/**
 * Shared pieces for the three Work variants.
 *
 * PLACEHOLDER — every project here is invented (see data/site.ts).
 */
export const PROJECTS: Case[] = CASES;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** PLACEHOLDER — shown at reading size until the case studies are real. */
export function WorkDraftNote({ className = "" }: { className?: string }) {
  return <DraftNote className={className}>Placeholder case studies: the clients, figures and outcomes are invented.</DraftNote>;
}

/** Section heading used by the variants that do not stage their own. */
export function WorkHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className={`max-w-[14ch] text-[clamp(2.5rem,6vw,5.75rem)] leading-[0.95] tracking-[-0.05em] ${dark ? "text-white" : ""}`}>
          Selected work.
        </h2>
        <WorkDraftNote className="mt-5" />
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <p
          className={`max-w-[36ch] font-[family-name:var(--font-mono)] text-[0.75rem] uppercase leading-[1.6] tracking-[0.06em] md:text-right ${
            dark ? "text-[var(--ink-inv-soft)]" : "text-[var(--ink-soft)]"
          }`}
        >
          Fewer projects, in more detail.
        </p>
        <Link to="/work" className="pbtn pbtn--line pbtn--sm">
          View all work
          <span className="pbtn__icon" aria-hidden="true">
            <span>&rarr;</span>
            <span>&rarr;</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/** Mono meta line: 01 / FINTECH / 2025. */
export function Meta({ c, className = "" }: { c: Case; className?: string }) {
  return (
    <p className={`font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] ${className}`}>
      {c.n} &nbsp;/&nbsp; {c.sector} &nbsp;/&nbsp; {c.year}
    </p>
  );
}

/**
 * Phones and reduced motion: a horizontal swipe rail with scroll snapping.
 * Tall pinned scenes feel endless on a small screen; a rail keeps all five
 * projects within one screen height.
 */
export function WorkSwipe() {
  const ref = useReveal<HTMLElement>({ threshold: 0.1 });
  return (
    <section ref={ref} id="work" className="chapter py-20" style={{ background: "var(--color-white)" }}>
      <div className="shell">
        <WorkHeader />
      </div>
      <ul
        className="mt-10 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]"
        aria-label="Selected projects"
      >
        {PROJECTS.map((c) => (
          <li key={c.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%]" data-reveal>
            <Link to={`/work/${c.slug}`} className="group block">
              <div className="split aspect-[4/5]">
                {(["split__a", "split__b"] as const).map((k) => (
                  <div key={k} className={`${k} duo duo--quiet`}>
                    <img src={c.images[0]} alt={k === "split__a" ? `${c.name} — lead image` : ""} loading="lazy" />
                  </div>
                ))}
              </div>
              <Meta c={c} className="mt-4 text-[var(--ink-mute)]" />
              <h3 className="mt-1.5 text-[1.5rem] leading-[1.05] tracking-[-0.03em]">{c.name}</h3>
              <p className="mt-1.5 text-[0.9375rem] leading-[1.5] text-[var(--ink-soft)]">{c.line}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
