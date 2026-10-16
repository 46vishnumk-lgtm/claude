import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router";
import { scrollPage, useReducedMotion } from "../lib/motion";
import { DEFAULTS, VARIANTS, setVariant, useVariant, type Section, type Variant } from "../lib/variants";
import { setTheme, useTheme } from "../lib/theme";

/**
 * The Design review panel.
 *
 * The button is out of the way until it is wanted: it fades in only when the
 * pointer comes into the bottom-left corner, while the panel is open, when it
 * has keyboard focus, or with the D key (which also opens and closes it).
 *
 * The panel follows the page. On the left, the page's areas in order — Whole
 * site, Nav bar, then each homepage section — with the one on screen marked;
 * choosing one scrolls the page to it. On the right, that area's choices as
 * cards: a name, one line on what it does, and tags for the one in use (Live)
 * and the one visitors get (Default). The foot counts what differs from the
 * defaults and resets it.
 */
type Group = Section | "theme" | "trail";
type Area = { id: string; title: string; note: string; where?: string; groups: Group[] };

const AREAS: Area[] = [
  { id: "site", title: "Whole site", note: "Colours, how scrolling moves, and the change between sections.", groups: ["theme", "scroll", "shift", "trail"] },
  { id: "nav", title: "Nav bar", note: "The bar along the top of every page.", groups: ["nav"] },
  { id: "practices", title: "Practices", note: "The four practices, one big word each.", where: "services", groups: ["practices", "practiceType"] },
  { id: "work", title: "Work", note: "Selected projects.", where: "work", groups: ["work"] },
  { id: "approach", title: "Approach", note: "How we work, in four steps.", where: "approach", groups: ["approach", "stairCard", "stairDir"] },
  { id: "voices", title: "Voices", note: "Client quotes.", where: "voices-title", groups: ["voices"] },
  { id: "close", title: "Close", note: "The last call to action before the footer.", where: "contact", groups: ["close"] },
];

/** One line on what each option does. */
const DESCRIBE: Record<Section, Partial<Record<Variant, string>>> = {
  nav: {
    a: "Logo, links and buttons straight on the page, no ground or pills.",
    b: "A chamfered plate; a line of seam light slides under the links.",
    c: "Only the logo and one large Menu button.",
    d: "Numbered mono links, 01 Work … 05 Contact.",
    e: "Mono links in [ brackets ]: the original bar.",
  },
  scroll: {
    a: "One scroll moves one settled step.",
    b: "Ordinary, continuous scrolling.",
    c: "Scroll freely; when you stop, it eases into the nearest step.",
  },
  shift: {
    a: "The old section clears, then the next focuses in, in place.",
    b: "The next section slides up over the last, which sinks back.",
    c: "A camera push: fly past one section into the next.",
    d: "The ground breaks into square tiles and re-forms.",
    e: "A 45° cut sweeps the next section in.",
  },
  practices: {
    a: "Letters rise through a mask, out of a blur; the photo dissolves.",
    b: "Letters scramble in orange, then lock into the word.",
    c: "Letters flip over like a departure board.",
  },
  practiceType: { a: "The photo shows only inside the letters.", b: "Letters invert the photo where they cross it." },
  work: { a: "One project at a time on a framed stage.", b: "Projects travel sideways on a rail.", c: "Each image assembles from square tiles." },
  approach: { a: "A marker travels a rule and lights each step.", b: "The steps climb one 45° line.", c: "Each step is a card that stacks on the last." },
  stairCard: { a: "Each step on a frosted glass card, with its points.", b: "Each step as plain text beside the line." },
  stairDir: { a: "The next step comes down the line from the top right.", b: "The next step comes up the line from the bottom left." },
  voices: { a: "One quote at a time, at display size.", b: "Quote cards on a sideways rail.", c: "A pile of cards, lifted off one by one." },
  close: { a: "The finished 3D mark rises with the question.", b: "The question fills the screen in orange.", c: "A drafting sheet with a short form." },
};

const SECTIONS = Object.keys(VARIANTS) as Section[];

const sectionOf = (id: string) => {
  const el = document.getElementById(id);
  return (el?.closest("section") ?? el) as HTMLElement | null;
};

export function DesignMenu({ trail, onTrailChange }: { trail: boolean; onTrailChange: (on: boolean) => void }) {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [near, setNear] = useState(false);
  const [focused, setFocused] = useState(false);
  const [area, setArea] = useState("site");
  const [onScreen, setOnScreen] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const onHome = useLocation().pathname === "/";
  // Every live choice (a fixed list, so the hooks always run in one order).
  const live = {} as Record<Section, Variant>;
  for (const s of SECTIONS) live[s] = useVariant(s); // eslint-disable-line react-hooks/rules-of-hooks
  const differs = (g: Group) => g !== "theme" && g !== "trail" && live[g] !== DEFAULTS[g];
  const changed = SECTIONS.filter(differs).length;

  // Show the button when the pointer comes into the bottom-left corner.
  useEffect(() => {
    let t = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const inCorner = e.clientX < 170 && e.clientY > window.innerHeight - 150;
      window.clearTimeout(t);
      if (inCorner) setNear(true);
      else t = window.setTimeout(() => setNear(false), 500);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(t);
    };
  }, []);

  // D opens and closes the panel; Escape closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "Escape" && open) {
        setOpen(false);
        buttonRef.current?.focus();
      } else if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Which homepage area is on screen, while the panel is open.
  useEffect(() => {
    if (!open || !onHome) {
      setOnScreen(null);
      return;
    }
    let raf = 0;
    const check = () => {
      // Layout positions, not boxes on screen: a section in its hand-off is
      // held in place by a transform and would still look on screen.
      const mid = window.scrollY + window.innerHeight / 2;
      const hit = AREAS.find((a) => {
        let node = a.where ? sectionOf(a.where) : null;
        if (!node) return false;
        const h = node.offsetHeight;
        let top = 0;
        for (; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
        return top <= mid && top + h >= mid;
      });
      setOnScreen(hit?.id ?? null);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, onHome]);

  // Opening starts at the area that is on screen.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current && onScreen) setArea(onScreen);
    wasOpen.current = open;
  }, [open, onScreen]);

  const go = (a: Area) => {
    setArea(a.id);
    if (!a.where || !onHome) return;
    // From the layout position: a section mid hand-off is transformed.
    let node = sectionOf(a.where);
    if (!node) return;
    let y = 0;
    for (; node; node = node.offsetParent as HTMLElement | null) y += node.offsetTop;
    scrollPage(Math.max(0, y));
  };

  const current = AREAS.find((a) => a.id === area) ?? AREAS[0];
  const shown = open || near || focused;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 md:bottom-6 md:left-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Design options"
          data-lenis-prevent
          className="flex h-[min(80svh,38rem)] w-[min(calc(100vw-2rem),48rem)] flex-col overflow-hidden rounded-[22px] text-white"
          style={{ background: "rgb(20 20 23)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.1), 0 30px 80px -20px rgb(0 0 0 / 0.6)" }}
        >
          {/* Head */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <p className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.14em]">
              Design<span className="text-[var(--brand-orange)]">/</span> review
              <span className="ml-3 hidden normal-case tracking-normal text-white/40 sm:inline">Press D to open or close</span>
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close design options"
              className="grid h-8 w-8 place-items-center rounded-full text-[1.125rem] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              &times;
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-[12.5rem_1fr] md:grid-rows-1">
            {/* The page's areas, in page order. */}
            <nav aria-label="Page areas" className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
              {AREAS.map((a) => {
                const sel = a.id === current.id;
                const diff = a.groups.filter(differs).length;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => go(a)}
                    aria-current={sel ? "true" : undefined}
                    className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[0.875rem] transition-colors ${
                      sel ? "bg-white/[0.09] text-white" : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${onScreen === a.id ? "bg-[var(--brand-orange)]" : "bg-white/15"}`} />
                      {a.title}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {onScreen === a.id && (
                        <span className="font-[family-name:var(--font-mono)] text-[0.5625rem] uppercase tracking-[0.1em] text-[var(--brand-orange)]">On screen</span>
                      )}
                      {diff > 0 && (
                        <span title="Changed from the default" className="rounded-full bg-white/10 px-1.5 font-[family-name:var(--font-mono)] text-[0.625rem] text-white/70">
                          {diff}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* The selected area's choices. */}
            <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[1.25rem] font-medium tracking-[-0.02em]">{current.title}</h2>
                {current.where && onHome && (
                  <button
                    type="button"
                    onClick={() => go(current)}
                    className="font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.12em] text-white/50 hover:text-[var(--brand-orange)]"
                  >
                    Scroll to it &darr;
                  </button>
                )}
              </div>
              <p className="mt-1 text-[0.8125rem] leading-[1.5] text-white/55">{current.note}</p>
              {current.where && !onHome && <p className="mt-2 text-[0.8125rem] text-[var(--brand-orange)]">This part is on the homepage.</p>}

              {current.groups.map((g) => {
                if (g === "theme")
                  return (
                    <Choices
                      key={g}
                      label="Theme"
                      value={theme}
                      defaultValue="dark"
                      options={[
                        ["dark", "Black", "The whole site on brand black."],
                        ["light", "White", "The whole site on paper white."],
                      ]}
                      onChange={(v) => setTheme(v as "dark" | "light")}
                    />
                  );
                if (g === "trail")
                  return reduced ? (
                    <p key={g} className="mt-5 text-[0.8125rem] leading-[1.45] text-white/55">
                      Motion effects are off because your system asks for reduced motion.
                    </p>
                  ) : (
                    <Choices
                      key={g}
                      label="Pointer trail"
                      value={trail ? "on" : "off"}
                      defaultValue="off"
                      options={[
                        ["off", "Off", "No effect under the pointer."],
                        ["on", "On", "A trail of orange light follows the pointer."],
                      ]}
                      onChange={(v) => onTrailChange(v === "on")}
                    />
                  );
                return (
                  <Choices
                    key={g}
                    label={VARIANTS[g].label}
                    // The staircase's own choices only show on that layout.
                    hint={(g === "stairCard" || g === "stairDir") && live.approach !== "b" ? "Shows with the Diagonal staircase layout." : undefined}
                    value={live[g]}
                    defaultValue={DEFAULTS[g]}
                    options={(Object.entries(VARIANTS[g].options) as [Variant, string][]).map(([v, name]) => [v, name, DESCRIBE[g][v] ?? ""])}
                    onChange={(v) => setVariant(g, v as Variant)}
                    lettered
                  />
                );
              })}
            </div>
          </div>

          {/* Foot */}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
            <p className="text-[0.75rem] text-white/55">
              {changed === 0 ? "Everything is as visitors see it." : `${changed} ${changed === 1 ? "choice differs" : "choices differ"} from what visitors see.`}
            </p>
            <button
              type="button"
              onClick={() => SECTIONS.forEach((s) => setVariant(s, DEFAULTS[s]))}
              disabled={changed === 0}
              className="rounded-full px-3.5 py-1.5 text-[0.75rem] text-white/80 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] transition-colors hover:text-[var(--brand-orange)] disabled:opacity-40"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-keyshortcuts="D"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex min-h-11 items-center gap-2 rounded-full px-4 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.12em] text-white transition-[opacity,transform] duration-300"
        style={{
          background: "rgb(23 23 26 / 0.92)",
          boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.14)",
          opacity: shown ? 1 : 0,
          transform: shown ? "none" : "translateY(6px)",
        }}
      >
        Design
        <span aria-hidden="true" className="text-[0.5625rem] transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          ▲
        </span>
      </button>
    </div>
  );
}

/**
 * One choice as a set of cards: a radio group in behaviour (arrow keys move
 * and choose, one tab stop), cards in appearance.
 */
function Choices({
  label,
  value,
  defaultValue,
  options,
  onChange,
  lettered = false,
  hint,
}: {
  label: string;
  hint?: string;
  value: string;
  defaultValue: string;
  options: [string, string, string][];
  onChange: (v: string) => void;
  lettered?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + options.length) % options.length;
    onChange(options[j][0]);
    refs.current[j]?.focus();
  };
  return (
    <fieldset className="mt-5">
      <legend className="mb-2 font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.14em] text-[var(--brand-orange)]">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-white/45">{hint}</span>}
      </legend>
      <div role="radiogroup" aria-label={label} className="grid gap-2 sm:grid-cols-2">
        {options.map(([v, name, desc], i) => {
          const on = v === value;
          return (
            <button
              key={v}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={name}
              aria-description={desc || undefined}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(v)}
              onKeyDown={(e) => onKey(e, i)}
              className={`flex items-start gap-3 rounded-2xl p-3 text-left transition-[background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] ${
                on
                  ? "bg-[rgb(234_88_12/0.12)] shadow-[inset_0_0_0_1.5px_var(--brand-orange)]"
                  : "bg-white/[0.04] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] hover:bg-white/[0.07]"
              }`}
            >
              {lettered && (
                <span
                  aria-hidden="true"
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase ${
                    on ? "bg-[var(--brand-orange)] text-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  {v}
                </span>
              )}
              <span className="min-w-0" aria-hidden="true">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[0.875rem] ${on ? "text-white" : "text-white/85"}`}>{name}</span>
                  {on && <Tag tone="live">Live</Tag>}
                  {v === defaultValue && <Tag>Default</Tag>}
                </span>
                {desc && <span className="mt-0.5 block text-[0.75rem] leading-[1.4] text-white/50">{desc}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Tag({ children, tone }: { children: string; tone?: "live" }) {
  return (
    <span
      className={`rounded-full px-1.5 py-px font-[family-name:var(--font-mono)] text-[0.5625rem] uppercase tracking-[0.1em] ${
        tone === "live" ? "bg-[var(--brand-orange)] text-white" : "bg-white/10 text-white/60"
      }`}
    >
      {children}
    </span>
  );
}
