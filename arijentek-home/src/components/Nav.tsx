import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { BOOKING_URL, NAV, STUDIO } from "../data/site";
import { lockScroll, scrollPage } from "../lib/motion";
import { Logo, SplitMark } from "./Logo";
import { Socials } from "./Socials";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../lib/theme";
import { useVariant } from "../lib/variants";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Navigation, v2 — a bracket bar and a full-screen menu.
 *
 * The bar comes in five styles, picked in the Design menu ("Nav bar"):
 *   a  floating pill — the links in a frosted capsule, a soft marker
 *      sliding to the hovered link, an orange round menu button;
 *   b  seam tab bar — a chamfered plate cut on the logo's 45°, plain
 *      sentence-case links, a line of seam light sliding under them;
 *   c  minimal split — only the logo and one large Menu button; the pages
 *      live in the full-screen menu (Noomo);
 *   d  index — numbered mono links, 01 Work … 05 Contact, with hairlines;
 *   e  brackets — mono links in [ brackets ] (PRØDUX / Noomo Labs).
 * The pill and the tab bar float as plates of their own; the others sit
 * straight on the page.
 *
 * The original bar (e): the small logo, mono bracket links and a
 * [ MENU ] button sitting straight on the page — no plates, no glass. Over
 * the top of a page it is transparent; once the page moves it takes a solid
 * ground (black or white, from the theme) with a seam
 * of orange light along its foot. It slides away while you read downwards
 * and comes back the moment you scroll up.
 *
 * The menu (Noomo agency): a brand-black screen opened on a 45° wipe, the
 * pages set large and revealed one by one, the mark traced as a blueprint in
 * the corner, and the studio's contact details along the foot.
 */
export function Nav() {
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  // Shown while the pointer is near the top of the screen, even if the
  // scroll has tucked the bar away.
  const [peek, setPeek] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // The whole page takes the theme's ground, so the bar simply follows it.
  const light = useTheme() === "light";

  // Solid once the page moves, plus hide-on-scroll-down / show-on-up.
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    const check = () => {
      const y = window.scrollY;
      setAtTop(y < 40);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 160);
        lastY = y;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    const t = window.setTimeout(check, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // Bring the bar back when a mouse comes up to the top edge; let it go
  // again a moment after it leaves, so it never flickers.
  useEffect(() => {
    let t = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.clientY < 90) {
        window.clearTimeout(t);
        setPeek(true);
      } else if (e.clientY > 110) {
        window.clearTimeout(t);
        t = window.setTimeout(() => setPeek(false), 600);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(t);
    };
  }, []);

  // Close the menu when the route changes underneath it.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      // Keep the tab ring inside the menu; otherwise Tab walks off the last
      // link onto the page behind, where focus is invisible.
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.tabIndex !== -1,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    // Lenis drives the scroll, so overflow: hidden alone would not hold it.
    lockScroll(true);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      triggerRef.current?.focus();
    };
  }, [open]);

  const solid = !atTop;
  const ink = "var(--fg)";
  const soft = "var(--fg-soft)";
  // Bar style, from the Design menu: a floating pill, b seam tab bar,
  // c minimal split, d index, e brackets.
  const style = useVariant("nav");
  // The pill and the tab bar float as their own plates; the others take a
  // solid ground with a seam once the page moves.
  // Style a is a plain bar: no ground, plates, pills or link marker — the
  // logo, links, theme switch and menu button sit straight on the page; the
  // hovered and current links brighten.
  const bar = style === "a";
  const floating = style === "b";
  const links = NAV.slice(0, 3);

  const menuButton = (
    <MenuButton style={style} open={open} onOpen={() => setOpen(true)} buttonRef={triggerRef} ink={ink} />
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--accent)] focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>

      <header
        onFocus={() => setPeek(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setPeek(false)}
        className="fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-[var(--ease)]"
        style={{
          transform: hidden && !open && !peek ? "translateY(-100%)" : "none",
          // The plain bar has no ground of its own: logo, links and buttons
          // sit straight on the page.
          background: !bar && solid && !floating ? (light ? "rgb(240 240 238 / 0.94)" : "rgb(15 15 17 / 0.94)") : "transparent",
        }}
      >
        <div className={`shell flex items-center justify-between gap-6 ${floating ? "h-[5rem]" : "h-[4.5rem]"}`}>
          <Link
            to="/"
            onClick={() => pathname === "/" && scrollPage(0)}
            aria-label="Arijentek, home"
            className={`shrink-0 transition-[background-color,box-shadow,padding] duration-500 ${
              floating && solid ? "rounded-full px-4 py-2.5" : ""
            }`}
            style={floating && solid ? PLATE : undefined}
          >
            <Logo className="h-[28px] w-auto md:h-[32px]" />
          </Link>

          {style === "a" && (
            <div className="flex items-center gap-2">
              <div className="mr-2 hidden items-center md:flex">
                <Sliding kind="tab" marker={false} large items={[...links, { label: "Contact", href: "/contact" }]} isCurrent={isCurrent} />
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle className="!h-10 !w-10 rounded-full" style={{ color: ink }} />
                {menuButton}
              </div>
            </div>
          )}

          {style === "b" && (
            <div
              className="cut flex items-center gap-1 pl-2 pr-1.5"
              style={{ ["--cut" as string]: "12px", ...PLATE, borderRadius: 0 }}
            >
              <div className="hidden md:flex">
                <Sliding kind="tab" items={links} isCurrent={isCurrent} />
              </div>
              <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-[var(--line)] md:block" />
              <Link
                to="/contact"
                aria-current={isCurrent("/contact") ? "page" : undefined}
                className="hidden h-12 items-center px-3 text-[0.875rem] font-medium text-[var(--orange-ink)] transition-colors hover:text-[var(--fg)] md:flex"
              >
                Contact
              </Link>
              <ThemeToggle style={{ color: ink }} />
              {menuButton}
            </div>
          )}

          {style === "c" && (
            <div className="flex items-center gap-3">
              <ThemeToggle style={{ color: ink }} />
              {menuButton}
            </div>
          )}

          {style === "d" && (
            <div className="flex items-center">
              <nav aria-label="Primary" className="hidden items-stretch md:flex">
                {[...links, { label: "Contact", href: "/contact" }].map((l, k) => {
                  const current = isCurrent(l.href);
                  return (
                    <Link
                      key={l.href}
                      to={l.href}
                      aria-current={current ? "page" : undefined}
                      className="group flex items-baseline gap-2 border-l border-[var(--line)] px-4 py-1 first:border-l-0"
                    >
                      <span className="font-[family-name:var(--font-mono)] text-[0.625rem] tracking-[0.08em] text-[var(--orange-ink)]">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.1em] transition-colors duration-300 group-hover:text-[var(--orange-ink)]"
                        style={{ color: current ? ink : soft }}
                      >
                        {l.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <span aria-hidden="true" className="mx-3 hidden h-5 w-px bg-[var(--line)] md:block" />
              <ThemeToggle style={{ color: ink }} />
              {menuButton}
            </div>
          )}

          {style === "e" && (
            <div className="flex items-center gap-1 md:gap-3">
              <nav aria-label="Primary" className="hidden items-center md:flex">
                {links.map((l) => (
                  <BarLink key={l.href} href={l.href} current={isCurrent(l.href)} ink={ink} soft={soft}>
                    {l.label}
                  </BarLink>
                ))}
              </nav>
              <span aria-hidden="true" className="mx-2 hidden h-4 w-px md:block" style={{ background: soft, opacity: 0.4 }} />
              <span className="hidden md:block">
                <BarLink href="/contact" current={isCurrent("/contact")} ink={ink} soft={soft} accent>
                  Contact
                </BarLink>
              </span>
              <ThemeToggle style={{ color: ink }} />
              {menuButton}
            </div>
          )}
        </div>
        {/* The seam along the foot of the solid bar (not on the plain bar,
            which keeps a clean edge and its soft shadow). */}
        {!floating && !bar && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-700 ease-[var(--ease)]"
            style={{ background: "var(--seam)", transform: `scaleX(${solid ? 1 : 0})` }}
          />
        )}
      </header>

      <MenuPanel open={open} onClose={() => setOpen(false)} panelRef={panelRef} closeRef={closeRef} isCurrent={isCurrent} />
    </>
  );
}

/** The floating plates' surface: the theme ground, frosted, with a hairline. */
const PLATE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--bg-2) 84%, transparent)",
  backdropFilter: "blur(14px) saturate(1.2)",
  WebkitBackdropFilter: "blur(14px) saturate(1.2)",
  boxShadow: "inset 0 0 0 1px var(--line), 0 10px 30px -12px rgb(0 0 0 / 0.35)",
};

/**
 * Links with a marker that slides to whichever one is hovered or focused,
 * and rests on the current page (or nowhere) otherwise.
 *   pill: a soft capsule behind the link, with an orange dot under it;
 *   tab:  a line of seam light along the foot of the tab bar.
 */
function Sliding({
  kind,
  items,
  isCurrent,
  marker = true,
  large = false,
}: {
  kind: "pill" | "tab";
  items: { label: string; href: string }[];
  isCurrent: (href: string) => boolean;
  /** false: no sliding marker; the hovered and current link brighten only. */
  marker?: boolean;
  /** 16px links instead of 14px (the plain bar). */
  large?: boolean;
}) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const current = items.findIndex((l) => isCurrent(l.href));
  const target = hover ?? (current >= 0 ? current : null);

  useEffect(() => {
    const measure = () => {
      const el = target === null ? null : refs.current[target];
      setBox(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [target, items.length]);

  return (
    <nav aria-label="Primary" className="relative flex items-center" onMouseLeave={() => setHover(null)}>
      {marker && box && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute transition-[left,width,opacity] duration-500 ease-[var(--ease)] ${
            kind === "pill" ? "inset-y-0 rounded-full" : "bottom-0 h-[2px]"
          }`}
          style={{
            left: box.left,
            width: box.width,
            background: kind === "pill" ? "color-mix(in srgb, var(--fg) 9%, transparent)" : "var(--seam)",
          }}
        />
      )}
      {items.map((l, k) => {
        const on = isCurrent(l.href);
        return (
          <Link
            key={l.href}
            to={l.href}
            ref={(el) => {
              refs.current[k] = el;
            }}
            aria-current={on ? "page" : undefined}
            onMouseEnter={() => setHover(k)}
            onFocus={() => setHover(k)}
            onBlur={() => setHover(null)}
            className={`relative flex items-center px-4 ${large ? "text-[1rem]" : "text-[0.875rem]"} transition-colors duration-300 ${
              kind === "pill" ? "h-10 rounded-full" : "h-12"
            } ${on || hover === k ? "text-[var(--fg)]" : "text-[var(--fg-soft)]"} ${
              l.href === "/contact" ? "font-medium !text-[var(--orange-ink)]" : ""
            }`}
          >
            {l.label}
            {kind === "pill" && on && (
              <span aria-hidden="true" className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--brand-orange)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** The menu trigger, dressed for each bar style. */
function MenuButton({
  style,
  open,
  onOpen,
  buttonRef,
  ink,
}: {
  style: string;
  open: boolean;
  onOpen: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  ink: string;
}) {
  const lines = (w: string) => (
    <span className="flex flex-col gap-[4px]" aria-hidden="true">
      <span className={`block h-[1.5px] ${w} bg-current transition-transform duration-300 group-hover:translate-x-0.5`} />
      <span className={`block h-[1.5px] ${w} bg-current transition-transform duration-300 group-hover:-translate-x-0.5`} />
    </span>
  );
  const common = { ref: buttonRef, type: "button" as const, "aria-expanded": open, "aria-controls": "menu-panel", onClick: onOpen };

  if (style === "a")
    return (
      <button {...common} aria-label="Menu" className="group grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-orange)] text-[white] transition-transform duration-300 hover:scale-105">
        {lines("w-4")}
      </button>
    );
  if (style === "b")
    return (
      <button {...common} className="group flex h-12 items-center gap-2.5 px-3 text-[0.875rem] font-medium" style={{ color: ink }}>
        {lines("w-3.5")}
        Menu
      </button>
    );
  if (style === "c")
    return (
      <button
        {...common}
        className="group flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-[1rem] font-medium transition-colors duration-300"
        style={{ color: ink, boxShadow: "inset 0 0 0 1px var(--line-strong)" }}
      >
        Menu
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-orange)] text-white">{lines("w-4")}</span>
      </button>
    );
  if (style === "d")
    return (
      <button {...common} className="group flex items-center gap-2.5 px-2 font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.1em]" style={{ color: ink }}>
        {lines("w-3.5")}
        Menu
      </button>
    );
  return (
    <button {...common} className="bracket group gap-2.5 px-2 transition-colors duration-300" style={{ color: ink }}>
      {lines("w-3.5")}
      Menu
    </button>
  );
}

/** A bar link: mono caps in brackets that open on hover; the current page gets the 45° tick. */
function BarLink({
  href,
  current,
  ink,
  soft,
  accent = false,
  children,
}: {
  href: string;
  current: boolean;
  ink: string;
  soft: string;
  accent?: boolean;
  children: string;
}) {
  return (
    <Link
      to={href}
      aria-current={current ? "page" : undefined}
      className="bracket relative px-2.5 transition-colors duration-300 hover:!text-[var(--orange-ink)]"
      style={{ color: current || accent ? ink : soft }}
    >
      {current && (
        <span aria-hidden="true" className="absolute -bottom-0.5 left-1/2 h-[2px] w-3 -translate-x-1/2 -skew-y-[45deg] bg-[var(--brand-orange)]" />
      )}
      {children}
    </Link>
  );
}

function MenuPanel({
  open,
  onClose,
  panelRef,
  closeRef,
  isCurrent,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  isCurrent: (href: string) => boolean;
}) {
  const tab = open ? 0 : -1;
  return (
    <div
      ref={panelRef}
      id="menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      data-in={open ? "" : undefined}
      className="tone-dark fixed inset-0 z-[60] flex flex-col overflow-y-auto"
      data-lenis-prevent
      style={{
        background: "var(--brand-black)",
        visibility: open ? "visible" : "hidden",
        // 45° wipe from the top-right corner, the seam angle.
        clipPath: open ? "polygon(-100% 0, 100% 0, 100% 200%)" : "polygon(100% 0, 100% 0, 100% 0)",
        transition: open
          ? "clip-path 800ms cubic-bezier(0.65, 0, 0.35, 1), visibility 0s"
          : "clip-path 600ms cubic-bezier(0.65, 0, 0.35, 1), visibility 0s 600ms",
      }}
    >
      {/* Drafting grid and the blueprint mark in the corner. */}
      <div aria-hidden="true" className="drafting pointer-events-none absolute inset-0 opacity-70" />
      <SplitMark
        outline
        draw
        className="pointer-events-none absolute -bottom-[6%] right-[3%] w-[52vw] opacity-90 md:bottom-auto md:right-[5%] md:top-[16%] md:w-[min(40vw,30rem)]"
        style={{ filter: "drop-shadow(0 0 16px rgb(234 88 12 / 0.3))" }}
      />

      <div className="shell relative flex h-[4.5rem] shrink-0 items-center justify-between">
        <Link to="/" onClick={onClose} tabIndex={tab} aria-label="Arijentek, home">
          <Logo className="h-[24px] w-auto text-white" />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle className="text-white" />
          {/* Round and orange, at the right edge: where the menu button was. */}
          <button
            ref={closeRef}
            type="button"
            tabIndex={tab}
            onClick={onClose}
            aria-label="Close menu"
            className="group grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-orange)] text-[white] transition-transform duration-300 hover:scale-105"
          >
            <span aria-hidden="true" className="relative block h-4 w-4 transition-transform duration-500 ease-[var(--ease)] group-hover:rotate-90">
              <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>
      </div>

      <nav aria-label="Menu" className="shell relative flex flex-1 flex-col justify-center py-6 md:py-8">
        <ul>
          {NAV.map((l, i) => {
            const current = isCurrent(l.href);
            return (
              <li key={l.href} className="overflow-hidden">
                <Link
                  to={l.href}
                  tabIndex={tab}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className="group flex items-baseline gap-5 py-1 md:gap-8"
                >
                  <span
                    className="block transition-transform duration-[900ms] ease-[var(--ease)]"
                    style={{
                      transform: open ? "none" : "translateY(110%) skewY(4deg)",
                      transitionDelay: open ? `${260 + i * 60}ms` : "0ms",
                    }}
                  >
                    <span className="flex items-baseline gap-5 md:gap-8">
                      <span
                        className={`w-8 font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] transition-colors duration-300 group-hover:text-[var(--orange-ink)] ${
                          current ? "text-[var(--orange-ink)]" : "text-[var(--ink-inv-mute)]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[clamp(2.25rem,min(6vw,8svh),5rem)] font-medium leading-[1.04] tracking-[-0.045em] transition-[color,transform] duration-500 ease-[var(--ease)] group-hover:translate-x-3 group-hover:text-white ${
                          current ? "text-white" : "text-[var(--ink-inv-soft)]"
                        }`}
                      >
                        {l.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-[3px] w-6 -skew-y-[45deg] self-center bg-[var(--brand-orange)] transition-transform duration-300 group-hover:scale-x-100"
                        style={{ transform: current ? undefined : "scaleX(0)" }}
                      />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="shell relative grid shrink-0 gap-6 border-t border-[var(--rule-inv)] bg-[var(--brand-black)] py-6 transition-opacity duration-700 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-10"
        style={{ opacity: open ? 1 : 0, transitionDelay: open ? "600ms" : "0ms" }}
      >
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--ink-inv-mute)]">
            New project<span className="text-[var(--orange-ink)]">/</span>
          </p>
          <a href={`mailto:${STUDIO.email}`} tabIndex={tab} className="mt-2 inline-block text-[1.25rem] tracking-[-0.015em] text-white hover:text-[var(--orange-ink)]">
            {STUDIO.email}
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offered once there is a real booking link. */}
          {BOOKING_URL && (
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" tabIndex={tab} className="sbtn sbtn--line sbtn--line-dark cut text-white">
              Book a call <span aria-hidden="true">&#8599;</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
        {/* Closed, the panel is visibility: hidden, which already takes every
            link here out of the tab order. */}
        <Socials />
      </div>
    </div>
  );
}
