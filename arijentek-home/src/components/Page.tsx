import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useMediaQuery, useReveal, useScrollProgress } from "../lib/motion";
import { STUDIO } from "../data/site";
import { SectionLabel } from "./SectionLabel";
import { SplitMark } from "./Logo";
import { WordReveal } from "./WordReveal";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Sets the tab title for a page. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${STUDIO.name}` : `${STUDIO.name} — ${STUDIO.descriptor}`;
  }, [title]);
}

/** The arrow badge of a pill button (two arrows, so it can slide on hover). */
export function PillIcon({ arrow = "→" }: { arrow?: string }) {
  return (
    <span className="pbtn__icon" aria-hidden="true">
      <span>{arrow}</span>
      <span>{arrow}</span>
    </span>
  );
}

/** Primary call to action, pointing at the contact page: a pill, as on Home. */
export function ContactButton({
  variant = "solid",
  children = STUDIO.cta,
}: {
  variant?: "solid" | "accent" | "ghost";
  children?: ReactNode;
}) {
  const kind = variant === "ghost" ? "pbtn--line" : variant === "accent" ? "pbtn--accent" : "pbtn--solid";
  return (
    <Link to="/contact" className={`pbtn ${kind}`}>
      {children}
      <PillIcon />
    </Link>
  );
}

/**
 * The opening every inner page shares, in the homepage's language: a
 * bracketed mono label, a large headline whose lines rise in with the last
 * one in orange (as "ideas become." on Home), the intro and pill actions in
 * the left column, and the mark on the right as a blueprint drawing on a
 * drafting grid, traced in when the page opens. As the page scrolls on, the
 * mark drifts up and the copy softens away in place. A page-specific index
 * (`children`) sits along the foot.
 */
export function PageHero({
  n,
  label,
  lines,
  intro,
  actions,
  children,
}: {
  n: string;
  label: string;
  lines: string[];
  intro?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  const [p, setP] = useState(0);
  const track = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom top" });
  const out = clamp01((p - 0.2) / 0.6);
  // The copy softens away only on wide screens, where the whole hero is on
  // screen at once. On a phone the hero runs past the fold, so the softening
  // would land on parts still being read.
  const wide = useMediaQuery("(min-width: 900px)");
  const soft = wide ? out : 0;

  return (
    <section ref={track} id="top" className="chapter chapter--dark relative overflow-hidden">
      {/* The drafting sheet: a grid fading in from the right, and a glow. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="drafting absolute inset-0"
          style={{
            WebkitMaskImage: "radial-gradient(60% 70% at 78% 45%, #000, transparent 75%)",
            maskImage: "radial-gradient(60% 70% at 78% 45%, #000, transparent 75%)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(45% 55% at 78% 45%, rgb(234 88 12 / 0.1), transparent 70%)" }} />
      </div>

      <div ref={ref} className="relative">
        {/* The mark, as a construction drawing, traced in on arrival. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[var(--gutter)] top-[24%] hidden w-[min(30vw,28rem)] md:block"
          style={{ transform: `translateY(${(-p * 90).toFixed(1)}px) rotate(${(-p * 4).toFixed(2)}deg)`, opacity: 1 - out * 0.85 }}
        >
          <SplitMark outline draw className="w-full" style={{ filter: "drop-shadow(0 0 14px rgb(234 88 12 / 0.25))" }} />
        </div>

        <div className="shell over-trail relative flex min-h-[80svh] flex-col pb-10 pt-32 md:pb-14 md:pt-40">
          {/* The opening copy softens away as the page scrolls on; the
              page's index along the foot (children) stays crisp, since it
              is navigation people scroll down to use. */}
          <div style={soft > 0 ? { opacity: 1 - soft * 0.7, filter: `blur(${(soft * 6).toFixed(2)}px)` } : undefined}>
            <div data-reveal>
              <SectionLabel n={n} title={label} />
            </div>

            <h1 className="mt-6 max-w-[16ch] text-[clamp(2.75rem,7vw,7.5rem)] leading-[0.94] tracking-[-0.05em] text-white md:max-w-[62%]">
              {lines.map((line, i) => (
                <span key={line} className="rise">
                  <span
                    style={{
                      transitionDelay: `${80 + i * 100}ms`,
                      // The last line in orange, as "become." on Home.
                      color: lines.length > 1 && i === lines.length - 1 ? "var(--brand-orange)" : undefined,
                    }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            {(intro || actions) && (
              <div className="mt-10 grid gap-8 md:mt-12 md:max-w-[62%]">
                {intro && (
                  <div data-reveal style={{ transitionDelay: "280ms" }} className="max-w-[54ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)] md:text-[1.1875rem]">
                    {intro}
                  </div>
                )}
                {actions && (
                  <div data-reveal style={{ transitionDelay: "360ms" }} className="flex flex-wrap gap-3">
                    {actions}
                  </div>
                )}
              </div>
            )}
          </div>

          {children && <div className="mt-auto pt-14">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/**
 * A section heading: the bracketed mono label, a headline that brightens
 * word by word out of a blur as it scrolls into view (the Statement's
 * reveal on Home), and an optional intro to the right.
 */
export function SectionHead({
  n,
  label,
  title,
  intro,
  id,
}: {
  n: string;
  label: string;
  title: string;
  intro?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-12">
      <div>
        <div data-reveal>
          <SectionLabel n={n} title={label} />
        </div>
        <WordReveal
          as="h2"
          id={id}
          blur
          from="top 92%"
          to="top 52%"
          text={title}
          className="mt-5 max-w-[17ch] text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.045em]"
        />
      </div>
      {intro && (
        <div data-reveal style={{ transitionDelay: "100ms" }} className="max-w-[40ch] text-[1.0625rem] leading-[1.55] text-[var(--fg-soft)] md:pb-2">
          {intro}
        </div>
      )}
    </div>
  );
}

/**
 * The closing section every inner page ends on, after Home's Close: the
 * question set huge as a window onto the seam gradient and a drifting grid,
 * growing to full size as it scrolls in, then the answer and pill actions.
 */
export function PageClose({
  label = "Next step",
  title,
  body,
  actions,
}: {
  label?: string;
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  const [p, setP] = useState(0);
  const track = useScrollProgress<HTMLElement>(setP, { start: "top bottom", end: "center center" });
  const grow = 1 - Math.pow(1 - clamp01(p), 3);

  return (
    <section ref={track} className="chapter chapter--dark relative overflow-hidden py-24 md:py-36">
      <div aria-hidden="true" className="drafting pointer-events-none absolute inset-0 opacity-50" />
      <div ref={ref} className="shell over-trail relative">
        <div data-reveal>
          <p className="bracket text-[var(--ink-inv-soft)]">{label}</p>
        </div>
        <h2
          className="close-window mt-6 max-w-[15ch] origin-left pb-[0.1em] text-[clamp(3rem,8vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.055em]"
          style={{ transform: `scale(${(0.86 + grow * 0.14).toFixed(4)})`, opacity: 0.3 + grow * 0.7 }}
        >
          {title}
        </h2>
        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          {body ? (
            <div data-reveal className="max-w-[44ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)] md:text-[1.125rem]">
              {body}
            </div>
          ) : (
            <span />
          )}
          <div data-reveal style={{ transitionDelay: "120ms" }} className="flex flex-wrap items-center gap-3">
            {actions ?? (
              <>
                <ContactButton variant="accent" />
                <a href={`mailto:${STUDIO.email}`} className="pbtn pbtn--line">
                  {STUDIO.email}
                  <PillIcon arrow="↗" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A placeholder notice for content that must be replaced before launch, at
 * reading size, so invented proof is never mistaken for the real thing.
 */
export function DraftNote({ children, className = "mb-8" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-start gap-2.5 rounded-full border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-[0.8125rem] leading-[1.5] text-[var(--fg-soft)] ${className}`}>
      <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-orange)]" />
      <span>{children}</span>
    </p>
  );
}
