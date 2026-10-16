import { useId } from "react";
import { setTheme, useTheme } from "../lib/theme";

const EASE = "700ms var(--ease)";

/**
 * Black / white theme switch: a sun on the white theme, a moon on the black.
 *
 * One disc does both. For the moon a second disc slides over its top-right
 * corner (through a mask), leaving a crescent; for the sun it slides away, the
 * disc shrinks to a core and eight short rays grow out one after another.
 * The ray on the 45° diagonal — the seam's angle, the logo's cut — is orange.
 * The whole drawing turns a little on each switch, and on hover.
 */
export function ThemeToggle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const theme = useTheme();
  const dark = theme === "dark";
  const next = dark ? "light" : "dark";
  // React's ids carry colons, which some browsers mis-read inside url(#…).
  const mask = `theme-${useId().replace(/:/g, "")}`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next === "light" ? "white" : "black"} theme`}
      title={`${next === "light" ? "White" : "Black"} theme`}
      className={`group grid h-11 w-11 place-items-center rounded-full transition-colors duration-300 hover:!text-[var(--orange-ink)] ${className}`}
      style={style}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px] overflow-visible transition-transform duration-500 ease-[var(--ease)] group-hover:rotate-[22deg]"
      >
        <defs>
          <mask id={mask}>
            <rect width="24" height="24" fill="white" />
            {/* The bite that makes the crescent; off the disc for the sun. */}
            <circle
              cx="16.75"
              cy="9.25"
              r="6.5"
              fill="black"
              style={{ transform: dark ? "none" : "translate(10px, -10px)", transition: `transform ${EASE}` }}
            />
          </mask>
        </defs>
        <g style={{ transformOrigin: "12px 12px", transform: `rotate(${dark ? 0 : 90}deg)`, transition: `transform ${EASE}` }}>
          <circle
            cx="12"
            cy="12"
            r="7.5"
            fill="currentColor"
            mask={`url(#${mask})`}
            style={{ transformOrigin: "12px 12px", transform: `scale(${dark ? 1 : 0.6})`, transition: `transform ${EASE}` }}
          />
          {Array.from({ length: 8 }, (_, k) => (
            <line
              key={k}
              x1="12"
              y1="1.25"
              x2="12"
              y2="3.75"
              stroke={k === 1 ? "var(--brand-orange)" : "currentColor"}
              strokeWidth="1.75"
              strokeLinecap="square"
              style={{
                transformOrigin: "12px 12px",
                transform: `rotate(${k * 45}deg) scale(${dark ? 0 : 1})`,
                opacity: dark ? 0 : 1,
                // The rays grow out in turn, and fold away in turn.
                transition: `transform ${EASE} ${k * 30}ms, opacity 400ms ease ${k * 30}ms`,
              }}
            />
          ))}
        </g>
      </svg>
    </button>
  );
}
