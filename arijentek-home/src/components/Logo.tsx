import { useId, type CSSProperties } from "react";
import { BAR_D, BLOCK_D, MARK_D } from "../lib/mark";

/**
 * Arijentek logo.
 *
 * Real artwork, supplied as SVG. The mark and wordmark carry the brand
 * gradient (#C2410C to #EA580C) so they read the same on paper and on black;
 * SOLUTION uses currentColor so it flips with the chapter.
 *
 * Gradient ids are generated per instance, because two copies of the logo on
 * one page with the same id would make the second reference the first.
 */

const WORDMARK_D =
  "M507.088 562.379C507.088 581.797 498.12 590.137 478.458 589.02V571.094C485.306 571.469 488.42 568.973 488.42 562.379V500.137H507.088V562.379ZM550.791 498.392C568.971 498.392 582.413 512.464 582.413 531.262C582.413 533.879 582.16 536.365 581.663 538.729H537.471C539.834 545.201 545.563 547.442 552.409 547.443C557.511 547.442 561.871 545.455 564.356 542.717L579.299 551.308C573.201 559.77 563.99 564.132 552.161 564.132C530.876 564.132 517.678 549.817 517.678 531.262C517.678 512.708 531.12 498.392 550.791 498.392ZM741.389 498.392C759.568 498.392 773.011 512.464 773.011 531.262C773.011 533.879 772.758 536.365 772.261 538.729H728.067C730.431 545.2 736.16 547.442 743.006 547.443C748.107 547.442 752.468 545.455 754.953 542.717L769.896 551.308C763.799 559.77 754.587 564.132 742.758 564.132C721.473 564.132 708.274 549.817 708.274 531.262C708.274 512.708 721.717 498.392 741.389 498.392ZM688.115 500.146H700.938V518.073H688.115V562.387H669.438V518.073H659.477V500.146H669.438V482.734L688.115 482.717V500.146ZM806.3 527.398L821.548 505.135C823.694 502.004 827.236 500.137 831.03 500.137H846.759L824.104 531.262L847.387 562.387H832.095C828.414 562.387 824.951 560.617 822.787 557.634L822.778 557.625L806.3 534.865V562.379H787.623V475.232H806.3V527.398ZM446.713 520.052C438.993 518.805 428.036 521.92 428.036 534.246V562.379H409.359V500.137H428.036V511.217C430.522 502.877 438.871 498.89 446.713 498.89V520.052ZM474.104 562.379H455.428V500.137H474.104V562.379ZM629.459 498.392C642.029 498.392 652.741 507.361 652.741 524.162V562.379H634.064V526.901C634.064 519.181 629.206 515.569 623.23 515.569C616.383 515.569 611.654 519.556 611.654 528.392V562.379H592.978V500.137H611.654V505.991C615.013 501.385 621.242 498.392 629.459 498.392ZM371.029 493.124C370.96 493.202 370.881 493.272 370.803 493.35L368.735 495.409L342.774 521.37L327.134 537.011L318.191 545.953L306.153 557.991C303.929 560.215 300.858 561.594 297.465 561.594H267.797L353.748 475.642C355.955 473.54 358.939 472.249 362.228 472.249H391.896L371.029 493.124ZM393.316 561.594H368.734V545.935C368.534 545.935 368.341 545.935 368.149 545.953H326.783L335.726 537.011L347.764 524.972C349.988 522.748 353.059 521.37 356.452 521.37H368.726V509.079C368.726 505.842 369.982 502.894 372.032 500.696L372.616 500.111L393.309 479.42H393.316V561.594ZM550.66 514.95C543.568 514.95 538.832 518.439 537.087 524.781H563.858C561.869 517.558 556.261 514.95 550.66 514.95ZM741.258 514.95C734.166 514.95 729.428 518.439 727.684 524.781H754.456C752.467 517.558 746.858 514.95 741.258 514.95ZM464.762 472.249C470.859 472.249 475.962 477.352 475.962 483.45C475.962 489.547 470.859 494.65 464.762 494.65C458.664 494.65 453.561 489.547 453.561 483.45C453.561 477.352 458.664 472.249 464.762 472.249ZM497.745 472.249C503.843 472.249 508.946 477.352 508.946 483.45C508.946 489.547 503.843 494.65 497.745 494.65C491.648 494.65 486.545 489.547 486.545 483.45C486.545 477.352 491.648 472.249 497.745 472.249Z";


const SOLUTION_D = [
  "M685.009 601.189L689.78 598.415C690.653 600.421 692.136 601.765 694.875 601.765C697.501 601.765 698.164 600.718 698.155 599.785C698.155 598.293 696.768 597.708 693.13 596.714C689.527 595.719 686.003 593.992 685.986 589.36C685.986 584.693 689.911 581.98 694.099 581.98C698.076 581.98 701.191 583.873 702.961 587.432L698.294 590.171C697.457 588.444 696.314 587.371 694.107 587.38C692.38 587.38 691.516 588.252 691.516 589.221C691.516 590.328 692.11 591.087 695.878 592.221C699.551 593.321 703.668 594.594 703.677 599.715C703.677 604.382 699.952 607.156 694.7 607.173C689.615 607.182 686.361 604.766 685 601.206L685.009 601.189Z",
  "M705.238 594.542C705.221 587.415 710.856 581.937 717.809 581.928C724.761 581.91 730.414 587.371 730.423 594.498C730.432 601.625 724.805 607.103 717.852 607.112C710.9 607.13 705.247 601.669 705.238 594.542ZM724.892 594.507C724.892 590.18 721.769 587.319 717.817 587.328C713.874 587.328 710.769 590.215 710.778 594.533C710.778 598.86 713.901 601.721 717.852 601.712C721.795 601.712 724.901 598.825 724.892 594.507Z",
  "M747.739 601.241V606.571L733.563 606.597L733.52 582.381H739.05L739.085 601.259L747.73 601.241H747.739Z",
  "M749.64 598.746L749.605 582.347H755.136L755.171 598.249C755.171 600.081 756.043 601.634 758.983 601.634C761.923 601.634 762.786 600.072 762.786 598.241L762.752 582.329H768.291L768.326 598.72C768.335 603.911 764.33 607.034 759 607.042C753.67 607.051 749.658 603.946 749.649 598.755L749.64 598.746Z",
  "M788.547 587.598H782.319L782.353 606.502H776.823L776.788 587.624H770.559L770.551 582.312L788.538 582.277V587.607L788.547 587.598Z",
  "M796.496 582.259L796.539 606.475H791.009L790.965 582.268H796.496V582.259Z",
  "M799.637 594.359C799.619 587.232 805.255 581.753 812.207 581.745C819.16 581.727 824.812 587.188 824.821 594.315C824.83 601.442 819.203 606.92 812.251 606.929C805.298 606.946 799.645 601.486 799.637 594.359ZM819.282 594.324C819.282 589.997 816.159 587.136 812.207 587.144C808.264 587.144 805.159 590.032 805.167 594.35C805.167 598.677 808.29 601.538 812.242 601.529C816.185 601.529 819.291 598.642 819.282 594.324Z",
  "M846.94 582.163L846.983 606.379H842.831L833.462 593.259L833.488 606.406H827.958L827.914 582.198H832.066L841.435 595.318L841.409 582.172H846.949L846.94 582.163Z",
];

/** Full lockup: mark, wordmark and SOLUTION. */
export function Logo({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="267.8 472.2 579.6 134.9"
      className={className}
      role="img"
      aria-label="Arijentek Solution"
      fill="none"
    >
      <defs>
        <linearGradient
          id={id}
          x1="355.467"
          y1="472.249"
          x2="847.029"
          y2="557.302"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C2410C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <path d={WORDMARK_D} fill={`url(#${id})`} />
      {SOLUTION_D.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * The mark with its two pieces held apart along the seam.
 *
 * `apart` is in logo units (the stroke is about 110). The pieces move away
 * from each other at right angles to the 45° seam, so the gap widens without
 * either piece drifting off its own diagonal.
 */
export function SplitMark({
  apart = 0,
  outline = false,
  draw = false,
  duration = 900,
  trace,
  className = "",
  style,
}: {
  /** With `outline`, how much of the drawing is traced, 0 → 1, set directly
   *  (for scroll-driven drawing; `draw` is the reveal-once version). */
  trace?: number;
  apart?: number;
  /** Blueprint: a thin orange line drawing instead of the filled mark. */
  outline?: boolean;
  /** With `outline`, trace the lines in when an ancestor gains [data-in]. */
  draw?: boolean;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const d = apart / 2 / Math.SQRT2;
  const move = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  const paint = outline
    ? ({ fill: "none", stroke: "#ea580c", strokeWidth: 1.25, vectorEffect: "non-scaling-stroke", pathLength: draw || trace !== undefined ? 1 : undefined } as const)
    : ({ fill: `url(#${id})` } as const);
  return (
    <svg
      viewBox="230 300 655 480"
      className={`${draw ? "draw" : ""} ${className}`}
      // Visible overflow: held apart, the pieces travel past the viewBox.
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id={id} x1="355" y1="340" x2="838" y2="739" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C2410C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <path d={BAR_D} {...paint} style={{ transform: `translate(${-d}px, ${-d}px)`, transition: move, ...traced(trace, 0) }} />
      <path d={BLOCK_D} {...paint} style={{ transform: `translate(${d}px, ${d}px)`, transition: move, ...traced(trace, 0.25) }} />
    </svg>
  );
}

const traced = (t: number | undefined, lag: number) =>
  t === undefined ? {} : { strokeDasharray: 1, strokeDashoffset: 1 - Math.min(1, Math.max(0, (t - lag) / (1 - lag))) };

/** The A mark on its own, for tight spaces and the favicon. */
export function LogoMark({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="277 340 561.2 399.4"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient
          id={id}
          x1="355.467"
          y1="340"
          x2="838.2"
          y2="739.4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C2410C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <path d={MARK_D} fill={`url(#${id})`} />
    </svg>
  );
}
