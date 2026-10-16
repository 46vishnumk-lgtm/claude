import { siBehance, siDribbble, siInstagram, siLinkedin } from "simple-icons";

/**
 * Social profiles as icon buttons.
 *
 * Marks come from Simple Icons (pinned at 9.21.0, the last release that
 * still ships LinkedIn) rather than being redrawn, so each brand's own
 * geometry is used. They render monochrome in currentColor; the brand's
 * colour is not used, to keep the footer and menu in the house palette.
 *
 * TODO: the real profile URLs. A profile without one is not shown (an icon
 * that opens nowhere is worse than none), so until they are filled in the
 * list renders nothing.
 */
export const SOCIALS = [
  { name: "LinkedIn", href: "", icon: siLinkedin },
  { name: "Instagram", href: "", icon: siInstagram },
  { name: "Dribbble", href: "", icon: siDribbble },
  { name: "Behance", href: "", icon: siBehance },
];

export function Socials({ className = "" }: { className?: string }) {
  const live = SOCIALS.filter((s) => s.href);
  if (!live.length) return null;
  return (
    <ul className={`flex gap-2 ${className}`}>
      {live.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Arijentek on ${s.name} (opens in a new tab)`}
            className="group relative grid h-11 w-11 place-items-center text-[var(--ink-inv-soft)] transition-colors duration-300 hover:text-[var(--brand-orange)] focus-visible:text-[var(--brand-orange)]"
          >
            {/* Chamfered square outline. Drawn as an SVG so the hairline
                survives the 45° corners (a clipped CSS border would not). */}
            <svg aria-hidden="true" viewBox="0 0 44 44" className="absolute inset-0 h-full w-full" fill="none">
              <path
                d="M8 0.5H43.5V36L36 43.5H0.5V8Z"
                stroke="currentColor"
                strokeOpacity="0.35"
                vectorEffect="non-scaling-stroke"
                className="transition-[stroke-opacity] duration-300 group-hover:[stroke-opacity:1]"
              />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-[17px] w-[17px]" fill="currentColor">
              <path d={s.icon.path} />
            </svg>
            {/* The seam slides in under the icon on hover. */}
            <span
              aria-hidden="true"
              className="absolute bottom-[7px] left-1/2 h-[2px] w-4 -translate-x-1/2 scale-x-0 bg-[var(--brand-orange)] transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
