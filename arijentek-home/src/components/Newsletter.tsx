import { useId, useState, type FormEvent } from "react";
import { NEWSLETTER_ENDPOINT, postJson } from "../lib/forms";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Newsletter signup. Renders nothing unless a list endpoint is configured.
 * `tone` matches the surface it sits on.
 */
export function Newsletter({
  tone = "dark",
  align = "start",
}: {
  tone?: "dark" | "light";
  align?: "start" | "end";
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");

  if (!NEWSLETTER_ENDPOINT) return null;
  const endpoint = NEWSLETTER_ENDPOINT;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("website")) return setStatus("done");
    setStatus("sending");
    try {
      await postJson(endpoint, { email: String(data.get("email") ?? "") });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const dark = tone === "dark";
  const border = dark ? "border-[var(--rule-inv-strong)]" : "border-[var(--rule-strong)]";
  const text = dark ? "text-[var(--ink-inv)]" : "text-[var(--ink)]";
  const muted = dark ? "text-[var(--ink-inv-soft)]" : "text-[var(--ink-soft)]";
  const placeholder = dark
    ? "placeholder:text-[var(--ink-inv-mute)]"
    : "placeholder:text-[var(--ink-mute)]";

  if (status === "done") {
    return (
      <p role="status" className={`max-w-md text-[0.9375rem] leading-[1.55] ${text} ${align === "end" ? "lg:ml-auto" : ""}`}>
        Thanks. You are on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`max-w-md ${align === "end" ? "lg:ml-auto" : ""}`}
      data-newsletter
    >
      <div
        // The pill carries the focus ring for the field inside it.
        className={`flex items-center gap-2 rounded-full border ${border} p-1 pl-5 transition-[border-color,box-shadow] duration-300 focus-within:border-[var(--brand-orange)] focus-within:shadow-[0_0_0_1px_var(--brand-orange)]`}
      >
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={`w-full min-w-0 bg-transparent py-2.5 text-left text-[0.9375rem] ${text} ${placeholder} focus-visible:outline-none`}
        />
        {/* Honeypot: hidden from people, filled in by bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn--solid h-10 min-h-0 shrink-0 px-5 disabled:opacity-60"
        >
          {status === "sending" ? "Sending" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className={`mt-3 text-[0.875rem] ${muted}`}>
          That did not go through. Please try again in a moment.
        </p>
      )}
      <p className={`mt-3 text-[0.8125rem] leading-[1.5] ${muted}`}>
        No more than once a month. Unsubscribe in one click.
      </p>
    </form>
  );
}
