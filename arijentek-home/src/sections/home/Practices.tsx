import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { SERVICES } from "../../data/site";
import { useMediaQuery, useReducedMotion, useReveal, useScrollProgress } from "../../lib/motion";
import { useVariant, type Variant } from "../../lib/variants";
import { useTheme } from "../../lib/theme";

/** One word per practice: the thing each one shapes. */
export const WORDS: Record<string, string> = {
  "digital-experiences": "Interface",
  "software-platform": "Platform",
  "3d-creative": "Form",
  "digital-transformation": "Process",
};

/** Size a single word to fill the column whatever its length. */
const wordSize = (w: string) => `min(24vw, ${(88 / (w.length * 0.64)).toFixed(2)}vw)`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Practices — one word per scene, all of it driven by the scroll.
 *
 * Noomo's agency site gives each idea the whole screen: one huge word and one
 * object that explains it. Here the word is what the practice shapes and the
 * object is a brand-duotone plate, tilted in 3D towards the pointer: two
 * layers, drifting at different speeds, joined by a blend mode (chosen in the
 * Design menu as "Practices type"):
 *   a  image in type — the plate multiplied onto the word, so the photograph
 *      is masked by the letters and slides inside them;
 *   b  negative — the word in front, in difference, inverting the image
 *      wherever a letter crosses it.
 *
 * Every change is computed from scroll progress, so it scrubs and reverses:
 * within each practice's stretch the first ~22% brings the scene in and the
 * last ~22% takes it out. Letters leave and arrive one by one through a mask,
 * the plate's photograph dissolves into the next one (no cut, no seam line),
 * and the whole stage pushes in and settles like a camera move.
 *
 * The transition type is chosen in the Design menu (lib/variants):
 * a letter rise, b decode, c split-flap; see Letters and Plate below.
 *
 * Phones and reduced motion get the four scenes stacked instead.
 */
export function Practices() {
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();
  const staged = wide && !reduced;
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top top", end: "bottom bottom", enabled: staged });
  const stageRef = useRef<HTMLDivElement>(null);
  // Transition type, from the Design menu: a letter rise, b decode, c split-flap.
  const mode = useVariant("practices");
  // How the word and the plate blend: a image in type, b negative.
  const masked = useVariant("practiceType") === "a";
  // The blend runs the other way round on a white ground (see the stage).
  const lightGround = useTheme() === "light";

  // Pointer tilt, eased, written as CSS variables so it never re-renders.
  useEffect(() => {
    if (!staged) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      stageRef.current?.style.setProperty("--mx", cur.x.toFixed(4));
      stageRef.current?.style.setProperty("--my", cur.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [staged]);

  if (!staged) return <PracticesStacked />;

  const n = SERVICES.length;
  const i = Math.min(n - 1, Math.floor(p * n));
  const sub = p * n - i;
  const s = SERVICES[i];
  const word = WORDS[s.slug] ?? s.left;

  // Scene in / out, 0 → 1. The first scene is already in when the section
  // arrives; the last never leaves (the section hand-off takes it).
  const tIn = i === 0 ? 1 : clamp01(sub / 0.22);
  const tOut = i === n - 1 ? 0 : clamp01((sub - 0.78) / 0.22);
  const push = Math.max(tOut, 1 - tIn); // the camera push around each cut
  const drift = sub - 0.5; // the word's parallax, -0.5 → 0.5 across the scene
  // The plate's parallax comes back to rest at each cut, because in the
  // letter rise the plate stays on screen while its photograph changes.
  const plateDrift = drift * (1 - push);
  const x = p * n;
  // The strip's content fades out and the next fades in, meeting at each
  // cut, so two practices' text never shows on top of each other.
  const layer = (k: number) =>
    Math.min(k === 0 ? 1 : smooth((x - k) / 0.1), k === n - 1 ? 1 : smooth((k + 1 - x) / 0.1));

  return (
    <section
      ref={ref}
      id="services"
      aria-label="Practices"
      className="chapter chapter--dark relative"
      style={{ height: `${n * 110 + 20}svh`, background: "var(--brand-black-2)" }}
      // Snap stops: each practice where its scene is fully in (the first is
      // in from the start; the last holds to the end).
      data-snap={Array.from({ length: n }, (_, k) => (k === 0 ? 0 : k === n - 1 ? 1 : (k + 0.5) / n)).join(",")}
    >
      {/* Bottom padding clears the fixed Design menu in the corner. The ground
          is repeated here because sticky makes this the blending context. */}
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-[6.5rem] pt-28" style={{ background: "var(--brand-black-2)" }}>
        {/* Above the stage, which is lifted under it and paints the ground. */}
        <div className="shell relative z-[1]">
          <p className="bracket text-[var(--ink-inv-soft)]">Practices</p>
        </div>

        {/* The stage, lifted a little so the word and plate sit centred
            between the label and the strip, clear of both. */}
        <div
          ref={stageRef}
          className="relative flex flex-1 items-center justify-center"
          aria-hidden="true"
          style={
            {
              top: "-6svh",
              // Image in type shows the plate only through the letters, so it
              // is a wide band, filling more of the word, and short enough
              // never to reach the stage's edge.
              "--plate": masked ? "min(56vw, 90svh)" : "min(30vw, 48svh)",
              "--plate-h": masked ? "38svh" : "var(--plate)",
              "--mx": 0,
              "--my": 0,
              perspective: "1400px",
              transform: `scale(${1 + push * 0.06})`,
              // Image in type, on black: the plate multiplies onto white
              // letters over black, so it survives only inside them, and the
              // stage screens onto the ground, which drops the black. On white
              // the same thing inverted: black letters over white, the plate
              // screened onto them, the stage multiplied onto the ground.
              ...(masked ? { background: lightGround ? "#fff" : "#000", mixBlendMode: lightGround ? "multiply" : "screen" } : {}),
              // Negative: the word blends in difference against what is
              // behind it inside the stage, so the stage needs the ground
              // itself (over nothing, white on a white page stayed white).
              ...(masked ? {} : { background: "var(--brand-black-2)" }),
            } as CSSProperties
          }
        >
          {/* Middle: the plate, tilted towards the pointer. */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: "var(--plate)",
              height: "var(--plate-h)",
              transform: `translate(-50%, calc(-50% + ${plateDrift * -46}px)) rotateY(calc(var(--mx) * 9deg)) rotateX(calc(var(--my) * -7deg)) rotateZ(${plateDrift * -2.5}deg)`,
              zIndex: masked ? 2 : 1,
              mixBlendMode: masked ? (lightGround ? "screen" : "multiply") : undefined,
              filter: masked
                ? lightGround
                  ? "contrast(0.9) brightness(0.9)"
                  : "contrast(0.7) brightness(1.75)"
                : lightGround
                  ? "drop-shadow(0 24px 34px rgb(0 0 0 / 0.16))"
                  : "drop-shadow(0 34px 44px rgb(0 0 0 / 0.55)) drop-shadow(0 0 40px rgb(234 88 12 / 0.18))",
            }}
          >
            {mode === "a" ? <PlateFade x={x} /> : <Plate mode={mode} image={s.image} tIn={tIn} tOut={tOut} />}
          </div>

          {/* The word. Image in type: under the plate, which multiplies onto
              it, so the photograph shows only inside the letters and slides
              there with its own parallax. Negative: in front, in difference,
              so where a letter crosses the image it turns to its negative. */}
          <Letters
            mode={mode}
            word={word}
            tIn={tIn}
            tOut={tOut}
            style={{
              fontSize: wordSize(word),
              // Literal colours: the blends need true white or black.
              // Difference with white reads as black ink on a white ground.
              color: masked && lightGround ? "#000" : "white",
              mixBlendMode: masked ? undefined : "difference",
              transform: `translate3d(calc(var(--mx) * -14px), ${drift * -60}px, 0)`,
              zIndex: masked ? 1 : 2,
            }}
          />
        </div>

        {/* The information strip. It stays put; only its content changes,
            crossfading from one practice to the next as the word changes. */}
        <div className="shell">
          <div className="grid grid-cols-[1fr_auto] items-end gap-10 border-t border-[var(--rule-inv)] pt-6">
            <div className="grid">
              {SERVICES.map((x, k) => {
                // Every layer stays in the grid, hidden while out, so the strip
                // keeps the tallest one's height and the stage never shifts.
                const o = layer(k);
                return (
                  <div
                    key={x.slug}
                    // Screen readers get all four from the list below.
                    aria-hidden="true"
                    className="col-start-1 row-start-1 grid grid-cols-[1.3fr_1fr] items-end gap-10"
                    style={{ opacity: o, visibility: o <= 0.001 ? "hidden" : undefined, pointerEvents: k === i ? undefined : "none" }}
                  >
                    <div className="flex items-start gap-6">
                      <span className="font-[family-name:var(--font-mono)] text-[clamp(2.5rem,4vw,3.5rem)] leading-[0.85] tracking-[-0.04em] text-[var(--brand-orange)]">
                        {x.n}
                      </span>
                      <div>
                        <h2 className="text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.05] tracking-[-0.035em] text-white">{x.title}</h2>
                        <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-[1.55] text-[var(--ink-inv-soft)]">{x.body}</p>
                      </div>
                    </div>
                    <ul className="flex flex-wrap gap-1.5 self-center">
                      {x.items.map((it) => (
                        <li
                          key={it}
                          className="rounded-full px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-inv-soft)]"
                          style={{ background: "color-mix(in srgb, var(--color-white) 6%, transparent)", boxShadow: "inset 0 0 0 1px var(--rule-inv)" }}
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="w-[16rem]">
              {/* Progress: one capsule per practice, filling with the scroll.
                  (The big number already says which practice this is.) */}
              <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                {SERVICES.map((x, k) => (
                  <span key={x.slug} className="relative h-[5px] overflow-hidden rounded-full bg-[var(--rule-inv)]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand-orange)]"
                      style={{ width: `${k < i ? 100 : k === i ? Math.max(sub, 0.08) * 100 : 0}%` }}
                    />
                  </span>
                ))}
              </div>
              <div className="mt-4 grid">
                {SERVICES.map((x, k) => {
                  const o = layer(k);
                  return (
                    <Link
                      key={x.slug}
                      to={`/services#${x.slug}`}
                      tabIndex={k === i ? undefined : -1}
                      aria-hidden={k !== i}
                      // Keyboard focus brings the page to this practice's stop.
                      data-focus-stop={k}
                      className="pbtn pbtn--line pbtn--sm col-start-1 row-start-1 justify-self-start"
                      style={{ opacity: o, visibility: o <= 0.001 ? "hidden" : undefined, pointerEvents: k === i ? undefined : "none" }}
                    >
                      Explore<span className="sr-only"> {x.title}</span>
                      <span className="pbtn__icon" aria-hidden="true">
                        <span>&rarr;</span>
                        <span>&rarr;</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Screen readers get all four practices, not just the visible one.
            Out of the tab order: keyboard users have the visible Explore. */}
        <ul className="sr-only">
          {SERVICES.map((x) => (
            <li key={x.slug}>
              <h2>{x.title}</h2>
              <p>{x.body}</p>
              <Link to={`/services#${x.slug}`} tabIndex={-1}>
                Explore {x.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A stable pseudo-random number for letter k at step t. */
const hash = (k: number, t: number) => {
  const x = Math.sin(k * 91.7 + t * 13.13) * 43758.5453;
  return x - Math.floor(x);
};
const GLYPHS = "ABCDEFGHJKLMNPRSTUVXYZ0123456789#/<>+=";

/**
 * A word set letter by letter, staggered across the word, in one of three
 * transition types (all scrubbed by tIn / tOut, so they reverse):
 *   a  letter rise: each letter rises in through a mask and leaves upwards,
 *      out of and into a blur;
 *   b  decode: each letter scrambles through random characters, orange while
 *      it is unresolved, then locks into place, like data resolving;
 *   c  split-flap: each letter flips over on its horizontal axis, like a
 *      departure board turning to the next destination.
 */
function Letters({ mode, word, tIn, tOut, style }: { mode: Variant; word: string; tIn: number; tOut: number; style: CSSProperties }) {
  const chars = word.toUpperCase().split("");
  const N = chars.length;
  return (
    <span
      className="pointer-events-none absolute inset-x-0 flex select-none justify-center font-medium uppercase leading-[0.8] tracking-[-0.05em]"
      style={style}
    >
      {chars.map((c, k) => {
        const lag = (k / Math.max(1, N - 1)) * 0.45;
        const a = ease((tIn - lag) / 0.55);
        const b = ease((tOut - lag) / 0.55);
        const moving = a < 1 || b > 0;

        if (mode === "b") {
          // Unresolved while arriving or leaving. The glyph changes in steps
          // as the scroll moves, so scrolling spins it.
          const u = Math.max(1 - a, b);
          const step = Math.floor((a + b) * 14);
          const busy = u > 0.02;
          const shown = busy ? GLYPHS[Math.floor(hash(k, step) * GLYPHS.length)] : c;
          return (
            <span key={k} className="inline-block pb-[0.08em] pt-[0.04em] text-center" style={{ minWidth: busy ? "0.62em" : undefined }}>
              <span
                className="inline-block"
                style={{
                  opacity: u > 0.97 ? 0 : 1,
                  color: busy ? "var(--brand-orange)" : undefined,
                }}
              >
                {shown}
              </span>
            </span>
          );
        }

        if (mode === "c") {
          // Flip down in from above (-90 to 0), then on out (0 to 90).
          const deg = (1 - a) * -90 + b * 90;
          return (
            <span key={k} className="inline-block pb-[0.08em] pt-[0.04em]" style={{ perspective: "600px" }}>
              <span
                className="inline-block"
                style={{
                  transform: moving ? `rotateX(${deg}deg)` : undefined,
                  opacity: Math.abs(deg) > 88 ? 0 : 1,
                  filter: moving ? `brightness(${1 - Math.abs(deg) / 180})` : undefined,
                }}
              >
                {c}
              </span>
            </span>
          );
        }

        return (
          <span key={k} className="inline-block overflow-hidden pb-[0.08em] pt-[0.04em]">
            <span
              className="inline-block"
              style={{
                transform: moving ? `translateY(${(1 - a) * 105 - b * 105}%) rotate(${(1 - a) * 6 - b * 6}deg)` : undefined,
                opacity: a * (1 - b),
                filter: moving ? `blur(${((1 - a) + b) * 8}px)` : undefined,
              }}
            >
              {c}
            </span>
          </span>
        );
      })}
    </span>
  );
}

const PlateImage = ({ image }: { image: string }) => (
  <div className="duo cut h-full w-full" style={{ ["--cut" as string]: "28px" }}>
    <img src={image} alt="" />
  </div>
);

/**
 * The plate in the letter rise (a): it stays on screen and only its
 * photograph changes, the next one dissolving in over it and settling from
 * a slight zoom, while the one held pushes in slowly with the scroll. Every
 * photograph stays mounted, so none has to load at its cut.
 */
function PlateFade({ x }: { x: number }) {
  const n = SERVICES.length;
  return (
    <div className="duo cut absolute inset-0" style={{ ["--cut" as string]: "28px" }}>
      {SERVICES.map((s, k) => {
        // In across the cut that brings it, 0.15 either side; hidden once
        // the next one covers it completely.
        const w = k === 0 ? 1 : smooth((x - k + 0.15) / 0.3);
        const shown = w > 0.001 && (k === n - 1 || x < k + 1.15);
        const scale = (1 + 0.08 * (1 - w)) * (1 + 0.04 * clamp01(x - k));
        return (
          <img
            key={s.slug}
            src={s.image}
            alt=""
            className="absolute inset-0"
            style={{ opacity: shown ? w : 0, visibility: shown ? undefined : "hidden", transform: `scale(${scale.toFixed(4)})` }}
          />
        );
      })}
    </div>
  );
}

/**
 * The plate in the other two transition types:
 *   b  a scan line sweeps down over a blueprint grid, revealing the image
 *      behind it; out, it sweeps on and takes the image with it;
 *   c  the plate turns on its vertical axis, edge-on at the cut, the next
 *      practice arriving on the turn.
 */
function Plate({ mode, image, tIn, tOut }: { mode: Variant; image: string; tIn: number; tOut: number }) {
  if (mode === "b") {
    const shown = ease(tIn);
    const gone = ease(tOut);
    const scanY = tOut > 0 ? gone : shown;
    const scanning = (shown > 0 && shown < 0.985) || (gone > 0.015 && gone < 1);
    return (
      <div className="absolute inset-0">
        <div className="drafting absolute inset-0" style={{ opacity: scanning ? 0.9 : 0, backgroundSize: "18px 18px" }} />
        <div className="absolute inset-0" style={{ clipPath: `inset(${gone * 100}% 0 ${(1 - shown) * 100}% 0)` }}>
          <PlateImage image={image} />
        </div>
        {scanning && (
          <span
            className="absolute inset-x-[-6%] h-[2px]"
            style={{ top: `${scanY * 100}%`, background: "var(--seam)", boxShadow: "0 0 22px 4px rgb(234 88 12 / 0.75)" }}
          />
        )}
      </div>
    );
  }

  const deg = (1 - ease(tIn)) * 90 + ease(tOut) * -90;
  return (
    <div className="absolute inset-0" style={{ perspective: "1100px" }}>
      <div
        className="absolute inset-0"
        style={{
          transform: `rotateY(${deg}deg)`,
          opacity: Math.abs(deg) > 88 ? 0 : 1,
          filter: deg !== 0 ? `brightness(${1 - Math.abs(deg) / 140})` : undefined,
        }}
      >
        <PlateImage image={image} />
      </div>
    </div>
  );
}

function PracticesStacked() {
  const ref = useReveal<HTMLElement>({ threshold: 0.05 });
  return (
    <section ref={ref} id="services" aria-labelledby="practices-title" className="chapter chapter--dark py-20" style={{ background: "var(--brand-black-2)" }}>
      <div className="shell">
        <p className="bracket text-[var(--ink-inv-soft)]" id="practices-title">
          Practices
        </p>
        <ul className="mt-10 grid gap-16">
          {SERVICES.map((s) => {
            const word = WORDS[s.slug] ?? s.left;
            return (
              <li key={s.slug} data-reveal>
                <div className="relative grid place-items-center pb-[0.35em]" aria-hidden="true" style={{ fontSize: wordSize(word) }}>
                  <div className="duo aspect-square w-[62%] cut text-[1rem]" style={{ ["--cut" as string]: "18px" }}>
                    <img src={s.image} alt="" loading="lazy" />
                  </div>
                  {/* The word overlaps the plate's foot, on the dark ground. */}
                  <span className="absolute inset-x-0 bottom-0 text-center font-medium uppercase leading-[0.8] tracking-[-0.05em] text-white">
                    {word}
                  </span>
                </div>
                <p className="mt-8 font-[family-name:var(--font-mono)] text-[0.75rem] tracking-[0.1em] text-[var(--orange-ink)]">{s.n}</p>
                <h2 className="mt-2 text-[1.75rem] leading-[1.05] tracking-[-0.03em] text-white">{s.title}</h2>
                <p className="mt-3 text-[1rem] leading-[1.55] text-[var(--ink-inv-soft)]">{s.body}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="cut px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-inv-soft)]"
                      style={{ ["--cut" as string]: "6px", background: "color-mix(in srgb, var(--color-white) 6%, transparent)" }}
                    >
                      {it}
                    </li>
                  ))}
                </ul>
                <Link to={`/services#${s.slug}`} className="sbtn sbtn--line cut mt-6">
                  Explore {s.title} <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
