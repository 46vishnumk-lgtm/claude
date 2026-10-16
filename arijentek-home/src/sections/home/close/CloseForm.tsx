import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useReducedMotion, useScrollProgress } from "../../../lib/motion";
import { CloseActions, NextSteps, QUESTION, clamp01, ease } from "./shared";

/**
 * Close C — the blueprint form.
 *
 * As the section scrolls in it draws itself as a drafting sheet: the grid
 * fades up, construction lines and dimension marks are traced, and a short
 * enquiry — name, email, one line — builds into place field by field. It
 * does not send anything itself: it hands what was typed to the full contact
 * form (in router state, not the URL), where the rest is asked.
 */
export function CloseForm() {
  const [p, setP] = useState(0);
  const ref = useScrollProgress<HTMLElement>(setP, { start: "top 85%", end: "center center" });
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const k = reduced ? 1 : p;
  const grid = ease(k / 0.3);
  const lines = clamp01((k - 0.1) / 0.5);
  const field = (n: number) => ease((k - 0.35 - n * 0.12) / 0.3);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    navigate("/contact", {
      state: { name: String(d.get("name") ?? ""), email: String(d.get("email") ?? ""), project: String(d.get("project") ?? "") },
    });
  };

  return (
    <section ref={ref} id="contact" aria-labelledby="close-title" className="chapter chapter--dark relative overflow-hidden py-24 md:py-36" style={{ background: "var(--brand-black)" }}>
      <div aria-hidden="true" className="drafting absolute inset-0" style={{ opacity: grid }} />
      {/* Construction lines and dimension marks, traced by the scroll. */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900" fill="none">
        {[
          "M0 820L820 0",
          "M260 900L1160 0",
          "M720 120V780",
          "M80 300H1360",
          "M80 640H1360",
          "M100 280V320M1340 280V320M100 300H1340",
        ].map((d, n) => (
          <path
            key={n}
            d={d}
            pathLength={1}
            stroke="#ea580c"
            strokeOpacity={n < 2 ? 0.35 : 0.18}
            strokeDasharray={n === 5 ? undefined : 1}
            strokeDashoffset={n === 5 ? undefined : 1 - clamp01(lines * 1.4 - n * 0.12)}
            vectorEffect="non-scaling-stroke"
            style={n === 5 ? { opacity: lines } : undefined}
          />
        ))}
      </svg>

      <div className="shell over-trail relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <div>
          <p className="bracket text-[var(--ink-inv-soft)]">Next step</p>
          <h2 id="close-title" className="mt-6 max-w-[11ch] text-[clamp(3rem,7.5vw,7.5rem)] leading-[0.9] tracking-[-0.055em] text-white">
            {QUESTION}
          </h2>
          <p className="mt-8 max-w-[38ch] text-[1.0625rem] leading-[1.6] text-[var(--ink-inv-soft)]">
            Start here. Three lines are enough; the contact page asks the rest.
          </p>
          <NextSteps className="mt-8" />
        </div>

        <form onSubmit={submit} className="relative p-7 md:p-10" aria-label="Start an enquiry">
          {/* The form's frame, drawn in with the scroll. */}
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d="M6 0H100V94L94 100H0V6Z"
              pathLength={1}
              stroke="#ea580c"
              strokeOpacity={0.6}
              strokeDasharray={1}
              strokeDashoffset={1 - lines}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--orange-ink)]" style={{ opacity: grid }}>
            Enquiry / draft 01
          </p>
          {(
            [
              ["name", "Your name", "text", "name"],
              ["email", "Email", "email", "email"],
              ["project", "What are you building?", "text", "off"],
            ] as const
          ).map(([name, label, type, auto], n) => (
            <label key={name} className="mt-7 block" style={{ opacity: field(n), transform: `translateY(${(1 - field(n)) * 16}px)` }}>
              <span className="slabel !text-[var(--ink-inv-mute)]">{label}</span>
              <input name={name} type={type} autoComplete={auto} required={name !== "project"} className="sfield sfield--dark text-white" />
            </label>
          ))}
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4" style={{ opacity: field(3) }}>
            <button type="submit" className="sbtn sbtn--accent cut">
              Continue to the brief <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
          <div className="mt-8 border-t border-[var(--rule-inv)] pt-6" style={{ opacity: field(3.5) }}>
            <p className="mb-3 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-inv-mute)]">Or</p>
            <CloseActions />
          </div>
        </form>
      </div>
    </section>
  );
}
