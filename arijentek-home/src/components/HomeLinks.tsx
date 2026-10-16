import { useEffect, useRef, useState } from "react";
import { scrollPage } from "../lib/motion";
import { STUDIO } from "../data/site";

/**
 * This build is the homepage alone. The sections still link to the pages of
 * the full site, so those links are resolved here instead:
 *   /work…, /services…, /approach → glide to that section of this page;
 *   /contact → the Close section, or, from inside it or the footer, an email;
 *   /        → the top.
 * A link to a section from inside that same section (a case study from
 * Work, "How we work" from Approach) has no page to open yet, so it says so.
 */
const SECTION: [RegExp, string][] = [
  [/^\/work(\/|$)/, "work"],
  [/^\/services(\/|$)/, "services"],
  [/^\/approach(\/|$)/, "approach"],
  [/^\/contact$/, "contact"],
];

const MESSAGE = "The full page is coming soon.";

export function HomeLinks() {
  const [shown, setShown] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const say = () => {
      setShown(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShown(false), 2600);
    };

    // Capture phase, so the router never sees a link to a page that is not here.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || a.target === "_blank") return;
      const href = a.getAttribute("href") ?? "";
      if (!href.startsWith("/")) return; // in-page #anchors, mailto: and other sites
      e.preventDefault();
      e.stopPropagation();

      const path = href.split("#")[0];
      if (path === "/") {
        scrollPage(0);
        return;
      }
      const id = SECTION.find(([re]) => re.test(path))?.[1];
      if (id === "contact" && a.closest("#contact, footer")) {
        window.location.href = `mailto:${STUDIO.email}`;
        return;
      }
      const target = id ? document.getElementById(id) : null;
      if (!target || a.closest(`#${id}`)) {
        say();
        return;
      }
      scrollPage(target);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      role="status"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-[var(--gutter)] transition-[opacity,transform] duration-300 ease-[var(--ease)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p aria-hidden="true" className="rounded-full bg-[var(--fg)] px-5 py-3 text-[14px] text-[var(--bg)] shadow-lg">
        {MESSAGE}
      </p>
      <span className="sr-only">{shown ? MESSAGE : ""}</span>
    </div>
  );
}
