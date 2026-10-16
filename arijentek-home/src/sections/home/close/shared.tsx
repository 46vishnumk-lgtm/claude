import { Link } from "react-router";
import { BOOKING_URL, STUDIO } from "../../../data/site";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

export const QUESTION = "What are you building?";
export const INVITE =
  "Send a few lines about the project and where it stands. We reply within two business days, with questions or a time to talk.";

/** The two answers to the question. */
export function CloseActions({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Link to="/contact" className="sbtn sbtn--accent cut">
        {STUDIO.cta} <span aria-hidden="true">&rarr;</span>
      </Link>
      {BOOKING_URL && (
        <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={`sbtn sbtn--line cut ${tone === "dark" ? "sbtn--line-dark text-white" : ""}`}>
          Book a call <span aria-hidden="true">&#8599;</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

/** What happens next, as one quiet mono line instead of another grid. */
export function NextSteps({ className = "" }: { className?: string }) {
  const steps = ["You write", "We reply in 2 days", "A 30-min call", "Paid discovery"];
  return (
    <ol aria-label="What happens next" className={`flex flex-wrap items-center gap-x-3 gap-y-2 font-[family-name:var(--font-mono)] text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-inv-mute)] ${className}`}>
      {steps.map((s, k) => (
        <li key={s} className="flex items-center gap-3">
          <span>
            <span className="text-[var(--orange-ink)]">{String(k + 1).padStart(2, "0")}</span> {s}
          </span>
          {k < steps.length - 1 && <span aria-hidden="true">&rarr;</span>}
        </li>
      ))}
    </ol>
  );
}
