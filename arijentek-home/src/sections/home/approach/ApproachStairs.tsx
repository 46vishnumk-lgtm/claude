import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { useScrollProgress } from "../../../lib/motion";
import { useVariant } from "../../../lib/variants";
import { HEADLINE, STEPS, StepIcon, StepsForReaders, clamp01, ease } from "./shared";

const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Approach B — the diagonal staircase.
 *
 * The headline, a line of support and the link sit as one block at the top
 * left, solid and readable. The four steps sit on one 45° line — the angle of
 * the mark's seam — and the scroll moves the view along the diagonal, one
 * step per stop. The active step is held near the middle of the screen, in
 * full; the others are small numbered markers on the line (passed ones in
 * orange, ones to come in grey). The line runs only between the first step
 * and the last, and fills in orange as far as the active one. The active
 * step's card hangs below and to the right of its marker, off the line's
 * lower side, so the line never crosses it.
 *
 * Two choices in the Design menu:
 *   Staircase steps      a  glass cards: the active step a frosted card with
 *                           its points, the others frosted pills, over a
 *                           faint drafting grid and a warm glow that the
 *                           frosting blurs; b  plain text.
 *   Staircase direction  a  from above: the next step comes down the line
 *                           from the top right; b  from below: it comes up
 *                           the line from the bottom left.
 *
 * Between two steps the leaving one fades out before the next fades in, so
 * two steps' text never shows on top of each other.
 */
const STEP = 34; // svh between steps, both across and down, so the line is 45°

// Where the active step's marker is held, as fractions of the screen: just
// left of the middle, so the line runs through the centre and the card fills
// the space below and right of it.
const HOLD = { x: 0.47, y: 0.465 };
// The card's offset from its marker's centre (px): its top-left corner
// tucked in just below and right of the badge, off the line's lower side,
// so the line never crosses it (and the badge, radius 28, never touches it).
const CARD_DX = 36;
const CARD_DY = 20;
// The first and last steps hold for this much of the scroll at each end.
const DWELL = 0.08;
const CARD_MAX = 576; // px, the card's widest
const GUTTER = 48; // px kept clear at the right and bottom edges

/**
 * The frosted surface, from the shared glass-card tokens (`.gcard`, end of
 * styles/index.css): a faint light glass on dark, near-white glass on the
 * light theme. Mixing the ink's role colour instead turned it grey on white.
 */
const GLASS: CSSProperties = {
  background: "var(--gcard-fill)",
  backdropFilter: "var(--gcard-blur)",
  WebkitBackdropFilter: "var(--gcard-blur)",
  boxShadow: "var(--gcard-rim), var(--gcard-lift)",
};

export function ApproachStairs() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom" });
  const glass = useVariant("stairCard") === "a";
  // +1: later steps up the line to the top right, so each comes down to the
  // anchor; -1: later steps down the line to the bottom left, coming up.
  const dir = useVariant("stairDir") === "b" ? -1 : 1;
  const n = STEPS.length;
  const pos = clamp01((p - DWELL) / (1 - 2 * DWELL)) * (n - 1); // continuous active index
  const span = (n - 1) * STEP * Math.SQRT2; // the line's length, svh
  const angle = dir === 1 ? -45 : 135;
  const stageRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  // Place the hold point and size the card from the real layout, written as
  // CSS variables (--ax, --ay, --card) so nothing re-renders: the card as
  // wide as fits on the right; the hold point raised if the tallest card
  // would run off the bottom, and moved right if the line through it would
  // cross the headline block (whose corner must stay on the line's upper
  // side). Card height depends on its width, which depends on the hold
  // point, so it settles over a few passes.
  useLayoutEffect(() => {
    const el = stageRef.current;
    const block = blockRef.current;
    if (!el || !block) return;
    const corner = (n: HTMLElement) => {
      let x = 0;
      let y = 0;
      for (let c: HTMLElement | null = n; c && c !== el; c = c.offsetParent as HTMLElement | null) {
        x += c.offsetLeft;
        y += c.offsetTop;
      }
      return x + n.offsetWidth + y + n.offsetHeight;
    };
    const layout = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const clear = Math.max(...Array.from(block.children, (c) => corner(c as HTMLElement))) + 40;
      let x = HOLD.x * W;
      let y = HOLD.y * H;
      for (let pass = 0; pass < 3; pass++) {
        const w = Math.max(280, Math.min(CARD_MAX, W - x - CARD_DX - GUTTER));
        el.style.setProperty("--card", `${w}px`);
        const h = Math.max(0, ...cards.current.map((c) => c?.offsetHeight ?? 0));
        y = Math.max(0.2 * H, Math.min(HOLD.y * H, H - h - CARD_DY - GUTTER / 2));
        x = Math.max(HOLD.x * W, clear - y);
      }
      el.style.setProperty("--ax", `${x.toFixed(1)}px`);
      el.style.setProperty("--ay", `${y.toFixed(1)}px`);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    document.fonts?.ready.then(layout);
    return () => ro.disconnect();
  }, [glass]);

  return (
    <section
      ref={ref}
      id="approach"
      aria-label="How we work"
      className="chapter chapter--dark relative"
      style={{ height: "400svh", background: "var(--brand-black)" }}
      data-snap={STEPS.map((_, k) => (k === 0 ? 0 : k === n - 1 ? 1 : DWELL + ((1 - 2 * DWELL) * k) / (n - 1))).join(",")}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] overflow-hidden"
        // First-paint values; the layout effect replaces them with measured ones.
        style={{ ["--ax" as string]: `${HOLD.x * 100}%`, ["--ay" as string]: `${HOLD.y * 100}%`, ["--card" as string]: "min(36rem, calc(53vw - 8.75rem))" }}
      >
        {/* Glass: a faint drafting grid round the held card, for the
            frosting to blur. */}
        {glass && (
          <div
            aria-hidden="true"
            className="drafting pointer-events-none absolute inset-0"
            style={{
              WebkitMaskImage: `radial-gradient(40% 52% at calc(var(--ax) + ${CARD_DX}px + var(--card) / 2) calc(var(--ay) + ${CARD_DY}px + 10rem), #000, transparent 80%)`,
              maskImage: `radial-gradient(40% 52% at calc(var(--ax) + ${CARD_DX}px + var(--card) / 2) calc(var(--ay) + ${CARD_DY}px + 10rem), #000, transparent 80%)`,
            }}
          />
        )}

        {/* The headline block, top left. */}
        <div className="shell relative z-[2] pt-28">
          <div ref={blockRef} className="max-w-[min(40%,34rem)]">
            <h2 className="text-[clamp(2.25rem,4vw,4rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">{HEADLINE}</h2>
            <p className="mt-6 max-w-[38ch] text-[1rem] leading-[1.6] text-[var(--ink-inv-soft)]">
              Design runs slightly ahead of engineering, in the same cycle, with the same people.
            </p>
            <Link to="/approach" className="pbtn pbtn--line pbtn--sm mt-6">
              How we work
              <span className="pbtn__icon" aria-hidden="true">
                <span>&rarr;</span>
                <span>&rarr;</span>
              </span>
            </Link>
          </div>
        </div>

        {/* The anchor: where the active step is held. */}
        <div className="absolute" style={{ left: "var(--ax)", top: "var(--ay)" }}>
          {glass && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-[38rem] w-[58rem] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(${CARD_DX}px + var(--card) / 2)`, top: `calc(${CARD_DY}px + 10rem)`, background: "radial-gradient(closest-side, rgb(234 88 12 / 0.16), transparent)" }}
            />
          )}

          {/* The staircase, moved so the active step sits at the anchor. */}
          <div className="absolute left-0 top-0" style={{ transform: `translate(${-dir * pos * STEP}svh, ${dir * pos * STEP}svh)` }}>
            {/* The line, from the first step to the last only: a dim track,
                and the travelled part in orange. */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-px origin-left"
              style={{ width: `${span}svh`, transform: `rotate(${angle}deg)`, background: "rgb(234 88 12 / 0.28)" }}
            />
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-[2px] origin-left"
              style={{ width: `${(pos / (n - 1)) * span}svh`, transform: `translateY(-0.5px) rotate(${angle}deg)`, background: "var(--seam)" }}
            />

            {STEPS.map((s, k) => {
              const d = Math.abs(pos - k);
              // The badge grows and draws its icon as the step comes in.
              const focus = ease(clamp01(1 - d * 1.7));
              // The full step stays whole until 0.28 of the way to the next
              // step and is gone by 0.42; the small marker only appears after
              // 0.45, so the two never show together.
              const full = smooth((0.42 - d) / 0.14);
              const small = smooth((d - 0.45) / 0.12);
              const passed = k < pos - 0.5;
              const badge = 36 + focus * 20; // px
              return (
                <div
                  key={s.n}
                  className="absolute"
                  style={{ left: `${dir * k * STEP}svh`, top: `${-dir * k * STEP}svh` }}
                  aria-current={d < 0.5 ? "step" : undefined}
                >
                  {/* The round badge, centred on the step's point on the line. */}
                  <span
                    className="absolute grid place-items-center rounded-full bg-[var(--brand-black)]"
                    style={{
                      width: badge,
                      height: badge,
                      left: -badge / 2,
                      top: -badge / 2,
                      boxShadow: `inset 0 0 0 1.5px ${focus > 0.5 || passed ? "var(--brand-orange)" : "var(--rule-inv-strong)"}`,
                    }}
                  >
                    {/* Drawn in as the step arrives; steps to come show theirs dimmed. */}
                    <StepIcon
                      index={k}
                      draw={focus > 0.02 && !passed ? ease(focus * 1.3) : 1}
                      className="h-[58%] w-[58%]"
                      style={{ opacity: passed || focus > 0.02 ? 1 : 0.4 }}
                    />
                  </span>

                  {/* The small marker, for the steps not in focus. */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 flex -translate-y-1/2 items-baseline gap-2 whitespace-nowrap font-[family-name:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.1em] ${
                      glass ? "left-8 rounded-full px-3.5 py-2" : "left-7"
                    }`}
                    style={{
                      ...(glass ? GLASS : {}),
                      opacity: small,
                      visibility: small <= 0.001 ? "hidden" : undefined,
                      color: passed ? "var(--orange-ink)" : "var(--ink-inv-soft)",
                    }}
                  >
                    {s.n}{" "}
                    <span className={`font-[family-name:var(--font)] text-[0.9375rem] normal-case tracking-normal ${glass ? "text-white" : ""}`}>{s.title}</span>
                  </span>

                  {/* The full step, when it is the active one. */}
                  {glass ? (
                    <div
                      ref={(c) => {
                        cards.current[k] = c;
                      }}
                      className="absolute w-[var(--card)] rounded-[22px] p-7"
                      style={{
                        ...GLASS,
                        left: CARD_DX,
                        top: CARD_DY,
                        opacity: full,
                        visibility: full <= 0.001 ? "hidden" : undefined,
                        transform: `translate(${((1 - full) * 14).toFixed(1)}px, 0) scale(${(0.97 + full * 0.03).toFixed(4)})`,
                        transformOrigin: "left top",
                        pointerEvents: full > 0.5 ? undefined : "none",
                      }}
                      // Screen readers get every step from the list below.
                      aria-hidden="true"
                    >
                      {/* The line and its markers already show where this
                          step sits in the four; the card only numbers it. */}
                      <p className="font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] text-[var(--orange-ink)]">
                        {s.n} <span className="text-[var(--ink-inv-mute)]">/ {String(n).padStart(2, "0")}</span>
                      </p>
                      <h3 className="mt-4 text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1] tracking-[-0.04em] text-white">{s.title}</h3>
                      <p className="mt-3 text-[0.9375rem] leading-[1.6] text-[var(--ink-inv-soft)]">{s.body}</p>
                      <ul className="mt-5 grid gap-2 border-t border-[var(--rule-inv)] pt-4">
                        {s.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-3 text-[0.875rem] leading-[1.45] text-[var(--ink-inv-soft)]">
                            {/* A short 45° stroke, the seam, as the bullet. */}
                            <span aria-hidden="true" className="mt-[0.5em] h-[1.5px] w-2.5 shrink-0 -rotate-45 bg-[var(--brand-orange)]" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div
                      ref={(c) => {
                        cards.current[k] = c;
                      }}
                      className="absolute w-[var(--card)]"
                      style={{
                        left: CARD_DX,
                        top: CARD_DY,
                        opacity: full,
                        visibility: full <= 0.001 ? "hidden" : undefined,
                        transform: `translate(${((1 - full) * 12).toFixed(1)}px, 0)`,
                        pointerEvents: full > 0.5 ? undefined : "none",
                      }}
                      aria-hidden="true"
                    >
                      <span className="font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] text-[var(--orange-ink)]">{s.n} / 04</span>
                      <h3 className="mt-1 text-[clamp(2rem,3.2vw,3rem)] leading-[1] tracking-[-0.04em] text-white">{s.title}</h3>
                      <p className="mt-3 max-w-[40ch] text-[1rem] leading-[1.6] text-[var(--ink-inv-soft)]">{s.body}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StepsForReaders />
    </section>
  );
}
