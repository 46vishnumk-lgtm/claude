import { useEffect, useState, type Ref } from "react";
import { Link } from "react-router";
import { STUDIO } from "../../data/site";
import { INTRO_DONE, introPending } from "../../components/BrandIntro";

/**
 * Hero — "Blueprint".
 *
 * Two columns: the copy on the left, the mark on the right in its own space,
 * so the headline never runs over the drawing. The mark stands on a drafting
 * grid as an orange construction drawing; scrolling holds the hero in place
 * and the drawing turns into the object from its top corner down, while the
 * rule at the foot reads IDEA → REALITY. The scene itself is drawn by
 * Opening.tsx, behind this section and the Statement after it.
 *
 * `staged` (wide screens): the hero is a layer of the Opening's held stage,
 * and `out` clears its copy where it stands — it fades and softens rather
 * than scrolling away — before the Statement appears in the same place.
 *
 * From the references: the giant headline sharing the screen with the object
 * (Noomo agency, Labs), the mono support column (PRØDUX), and the loading
 * rule turned into a progress reading (Labs).
 */
export function Hero({
  trackRef,
  progress,
  out,
  wide,
  reduced,
  staged = false,
}: {
  trackRef?: Ref<HTMLElement>;
  progress: number;
  /** 0 → 1: the copy clears (staged only). */
  out: number;
  wide: boolean;
  reduced: boolean;
  staged?: boolean;
}) {
  // Reveal once fonts are in, and after the brand intro if one is playing.
  const [shown, setShown] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    let done = false;
    const show = () => !done && requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const ready = Promise.race([fonts?.ready, new Promise((r) => setTimeout(r, 900))]);
    if (introPending()) {
      const onDone = () => ready.then(show);
      window.addEventListener(INTRO_DONE, onDone, { once: true });
      return () => {
        done = true;
        window.removeEventListener(INTRO_DONE, onDone);
      };
    }
    ready.then(show);
    return () => {
      done = true;
    };
  }, [reduced]);

  const reveal = Math.round(Math.min(1, Math.max(0, (progress - 0.08) / 0.8)) * 100);
  // Flow: the foot fades over the last stretch so it never rides up over the
  // nav when the hero releases. Staged: everything clears together.
  const footFade = staged ? 1 - out : reduced ? 1 : 1 - Math.min(1, Math.max(0, (progress - 0.9) / 0.08));
  const clearing = staged && out > 0;
  const clearStyle = clearing
    ? { opacity: 1 - out, filter: `blur(${(out * 8).toFixed(2)}px)`, transform: `translateY(${(-out * 18).toFixed(1)}px)` }
    : undefined;

  return (
    <section
      ref={trackRef}
      id="top"
      aria-label="Introduction"
      className={`chapter chapter--dark !bg-transparent ${staged ? "absolute inset-0" : "relative"}`}
      style={{
        height: staged ? undefined : reduced ? "100svh" : wide ? "230svh" : "170svh",
        pointerEvents: staged && out > 0.5 ? "none" : undefined,
        visibility: staged && out >= 1 ? "hidden" : undefined,
      }}
      data-in={shown ? "" : undefined}
    >
      <div className={`${staged ? "h-full" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        {/* The copy column: left half on wide screens, the mark has the right. */}
        <div className="shell relative flex h-full flex-col pt-24 md:pt-28" style={clearStyle}>
          <div className="md:max-w-[52%]">
            <p className="slabel !text-[var(--ink-inv-mute)]" data-reveal>
              <span className="twin twin--on" aria-hidden="true" /> Design and engineering studio
            </p>
            <h1 className="mt-5 text-[clamp(3rem,7.2vw,8.5rem)] leading-[0.9] tracking-[-0.055em] text-white">
              <span className="rise">
                <span style={{ transitionDelay: "120ms" }}>We build what</span>
              </span>{" "}
              <span className="rise">
                <span style={{ transitionDelay: "220ms" }}>
                  ideas <span className="text-[var(--brand-orange)]">become.</span>
                </span>
              </span>
            </h1>
            {/* The actions sit straight under the headline. They show only at
                the opening's first stop, so keyboard focus returns there. */}
            <div data-reveal data-focus-stop="0" style={{ transitionDelay: "450ms" }} className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="pbtn pbtn--solid">
                {STUDIO.cta}
                <span className="pbtn__icon" aria-hidden="true">
                  <span>&rarr;</span>
                  <span>&rarr;</span>
                </span>
              </Link>
              <a href="#work" className="pbtn pbtn--line">
                See selected work
                <span className="pbtn__icon" aria-hidden="true">
                  <span>&darr;</span>
                  <span>&darr;</span>
                </span>
              </a>
            </div>
            {/* The support copy, in the copy column under the actions. */}
            <p
              data-reveal
              style={{ transitionDelay: "550ms" }}
              className="mt-10 hidden max-w-[38ch] font-[family-name:var(--font-mono)] text-[0.8125rem] uppercase leading-[1.6] tracking-[0.04em] text-[var(--ink-inv-soft)] md:block"
            >
              {STUDIO.positioning} We take responsibility for how a product looks, works, and is built.
            </p>
          </div>
        </div>

        {/* Foot: the IDEA → REALITY rule. */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            opacity: footFade,
            filter: clearing ? `blur(${(out * 8).toFixed(2)}px)` : undefined,
            pointerEvents: !staged && !reduced && progress > 0.97 ? "none" : undefined,
          }}
        >
          <div className="shell pb-6 md:pb-8">
            {/* Phones: the support copy sits at the foot, clear of the mark. */}
            <p className="max-w-[34ch] font-[family-name:var(--font-mono)] text-[0.75rem] uppercase leading-[1.6] tracking-[0.04em] text-[var(--ink-inv-soft)] md:hidden">
              {STUDIO.positioning} We take responsibility for how a product looks, works, and is built.
            </p>
            {/* Indented past the fixed Design menu in the bottom-left corner.
                Hidden under reduced motion, where nothing scrubs. */}
            <div
              data-reveal
              style={{ transitionDelay: "650ms" }}
              className={`mt-6 items-center gap-4 pl-[6.5rem] md:mt-8 ${reduced ? "hidden" : "flex"}`}
              aria-hidden="true"
            >
              <span className="font-[family-name:var(--font-mono)] text-[0.6875rem] tracking-[0.12em] text-[var(--orange-ink)]">IDEA</span>
              <span className="relative h-px flex-1 bg-[var(--rule-inv)]">
                <span className="absolute left-0 block" style={{ width: `${reveal}%`, background: "var(--seam)", height: 2, top: -0.5 }} />
                <span
                  className="absolute top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--brand-orange)]"
                  style={{ left: `${reveal}%` }}
                />
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[0.6875rem] tracking-[0.12em] text-white">REALITY</span>
              <span className="w-10 text-right font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--ink-inv-mute)]">{reveal}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
