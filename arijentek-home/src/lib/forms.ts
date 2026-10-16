/**
 * Where the site's forms send.
 *
 * Both are set at build time in `.env` (see `.env.example`). Any service that
 * accepts a JSON POST works, such as Formspree, Basin or a small serverless
 * function. Without an endpoint the contact form falls back to the visitor's
 * email app, and the newsletter is not shown at all: a signup that goes
 * nowhere is worse than no signup.
 */
export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
export const NEWSLETTER_ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT as
  | string
  | undefined;

export async function postJson(endpoint: string, data: Record<string, string>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
}
