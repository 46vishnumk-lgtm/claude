import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useReducedMotion, useReveal, useScrollProgress } from "../lib/motion";
import { Socials } from "./Socials";
import { Logo, SplitMark } from "./Logo";
import { BOOKING_URL, NAV, STUDIO } from "../data/site";
import { NEWSLETTER_ENDPOINT } from "../lib/forms";
import { Newsletter } from "./Newsletter";

/**
 * Footer, v2 — PRØDUX's ending, in the seam system.
 *
 * The studio line and the menu (MENU/, in two columns), then a drafting
 * sheet: the mark traced as a blueprint on a grid, with the name, address
 * and social icons set on the sheet beside it; then the legal row.
 * The footer opens on the plain ground, with no rule along its top edge.
 *
 * PRØDUX ends on a billboard wordmark; that was tried here and dropped as too
 * loud. The blueprint bookends the hero instead, and the small lockup carries
 * the name. On the homepage the Close already asks "What are you
 * building?", so the footer drops its own call to action there.
 *
 * A signup that goes nowhere is worse than none, so the newsletter appears
 * only once a list endpoint is configured.
 */

/** One footer link: mono caps, and a 45° tick that slides in on hover. */
function FootLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      to={href}
      className="group relative inline-flex min-h-9 items-center font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.08em] text-[var(--ink-inv-soft)] transition-[color,transform] duration-300 ease-[var(--ease)] hover:translate-x-4 hover:text-white focus-visible:translate-x-4"
    >
      {/* Out of the flow, so links stay flush with their column label. */}
      <span
        aria-hidden="true"
        className="absolute -left-4 top-1/2 h-[2px] w-2.5 origin-right -skew-y-[45deg] scale-x-0 bg-[var(--brand-orange)] transition-transform duration-300 ease-[var(--ease)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      {children}
    </Link>
  );
}

function Label({ children }: { children: string }) {
  return (
    <p className="mb-4 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.12em] text-white">
      {children}
      <span className="text-[var(--orange-ink)]">/</span>
    </p>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-reveal>
      <Label>{title}</Label>
      {children}
    </div>
  );
}

function DraftingBand() {
  const [t, setT] = useState(0);
  const ref = useScrollProgress<HTMLDivElement>(setT, { start: "top bottom", end: "bottom bottom" });
  const reduced = useReducedMotion();
  const k = reduced ? 1 : t;

  return (
    <div ref={ref} className="relative overflow-hidden border-t border-[var(--rule-inv)]">
      <div
        aria-hidden="true"
        className="drafting absolute inset-0"
        style={{ maskImage: "linear-gradient(to bottom, transparent, #000 30%)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 30%)" }}
      />
      {/* Construction lines on the seam's 45°; `slice` keeps them at a true 45°. */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMaxYMid slice" viewBox="0 0 400 100">
        {[150, 205, 262].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={110}
            x2={x + 120}
            y2={-10}
            pathLength={1}
            stroke="#ea580c"
            strokeOpacity={i === 1 ? 0.4 : 0.16}
            strokeWidth={1}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.min(1, Math.max(0, k * 1.6 - i * 0.15))}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <SplitMark
        outline
        trace={k * 1.15}
        className="pointer-events-none absolute right-[4vw] top-[18%] w-[40vw] md:w-[min(46vw,30rem)]"
        style={{ filter: "drop-shadow(0 0 18px rgb(234 88 12 / 0.35))", transform: `translateY(${(1 - k) * 60}px)` }}
      />

      <div className="shell over-trail relative grid gap-10 pb-10 pt-[clamp(6rem,12vw,10rem)] sm:grid-cols-[auto_auto] sm:justify-start sm:gap-16 md:gap-24">
        <div>
          <Link to="/" aria-label="Arijentek, home" className="inline-block w-fit">
            <Logo className="h-auto w-[10rem] text-white md:w-[12.5rem]" />
          </Link>
          <p className="mt-4 max-w-[22ch] font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase leading-[1.7] tracking-[0.12em] text-[var(--ink-inv-mute)]">
            Designed and engineered as one system
          </p>
        </div>
        <div>
          <Label>Studio</Label>
          {/* PLACEHOLDER — invented locations. TODO: the real ones, or the regions served. */}
          <p className="font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.08em] text-[var(--ink-inv-soft)]">
            London &middot; Bengaluru
          </p>
          <p className="mt-2 max-w-[30ch] text-[0.875rem] leading-[1.55] text-[var(--ink-inv-mute)]">
            Working with teams across Europe, India and North America.
          </p>
          <Socials className="mt-5" />
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const ref = useReveal<HTMLElement>({ threshold: 0.05 });
  const { pathname } = useLocation();
  // Home's Close, the Contact page and every page that ends on a PageClose
  // already ask; the footer does not ask twice.
  const home =
    ["/", "/contact", "/work", "/services", "/approach", "/about", "/careers"].includes(pathname) || pathname.startsWith("/work/");

  return (
    <footer
      ref={ref}
      className="chapter chapter--dark relative overflow-hidden"
      style={{ background: "var(--brand-black)" }}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Arijentek
      </h2>


      <div className="shell over-trail">
        {/* Band 1 — the one thing worth doing here (not on Home, whose Close asks already). */}
        {!home && (
          <div className="grid gap-10 border-b border-[var(--rule-inv)] py-14 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
            <div data-reveal>
              <p className="bracket text-[var(--ink-inv-soft)]">New project</p>
              <p className="mt-5 max-w-[16ch] text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[0.95] tracking-[-0.045em] text-white">
                Tell us what you are building.
              </p>
            </div>
            <div data-reveal style={{ transitionDelay: "100ms" }} className="lg:justify-self-end">
              <p className="max-w-[34ch] text-[1rem] leading-[1.55] text-[var(--ink-inv-soft)]">
                We reply within two business days, with questions or a time to talk.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link to="/contact" className="sbtn sbtn--light cut">
                  {STUDIO.cta} <span aria-hidden="true">&rarr;</span>
                </Link>
                {BOOKING_URL && (
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="sbtn sbtn--line cut">
                    Book a call <span aria-hidden="true">&#8599;</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Band 2 — the studio line, and the menu in two columns. */}
        <div className="grid gap-12 py-14 md:py-16 lg:grid-cols-[1.4fr_1fr]">
          <div data-reveal>
            <p className="max-w-[28ch] text-[1.125rem] leading-[1.45] tracking-[-0.015em] text-white">{STUDIO.positioning}</p>
            <a
              href={`mailto:${STUDIO.email}`}
              className="group mt-6 inline-flex items-center gap-3 border-b border-[var(--rule-inv-strong)] pb-1.5 text-[1.125rem] text-white transition-colors duration-300 hover:border-[var(--brand-orange)] hover:text-[var(--orange-ink)]"
            >
              {STUDIO.email}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            {NEWSLETTER_ENDPOINT && (
              <div className="mt-10 max-w-[26rem]">
                <Label>Newsletter</Label>
                <Newsletter tone="dark" />
              </div>
            )}
          </div>

          <Column title="Menu">
            <ul className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-x-8">
              {NAV.map((l) => (
                <li key={l.href}>
                  <FootLink href={l.href}>{l.label}</FootLink>
                </li>
              ))}
            </ul>
          </Column>
        </div>
      </div>

      {/* Band 3 — the drafting sheet. The site opens on the mark as a
          blueprint and closes on it: the same drawing, traced in line by line
          as the footer scrolls into view, drifting a little slower than the
          page, and cut off by the bottom edge. The studio's name, address and
          profiles sit on the sheet beside it. */}
      <DraftingBand />

      {/* Band 4 — legal. */}
      <div className="shell over-trail">
        <div className="flex flex-col gap-3 border-t border-[var(--rule-inv)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6">
            <p className="flex min-h-9 items-center gap-2.5 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-inv-mute)]">
              <span className="twin twin--on" aria-hidden="true" />
              &copy; {new Date().getFullYear()} {STUDIO.name}
            </p>
          </div>

          <a href="#top" className="pbtn pbtn--line pbtn--sm self-end sm:self-auto">
            Back to top
            <span className="pbtn__icon" aria-hidden="true">
              <span>&uarr;</span>
              <span>&uarr;</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
