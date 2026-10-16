import { useMediaQuery, useReducedMotion } from "../../lib/motion";
import { useVariant } from "../../lib/variants";
import { ApproachTrack } from "./approach/ApproachTrack";
import { ApproachStairs } from "./approach/ApproachStairs";
import { ApproachStack } from "./approach/ApproachStack";
import { ApproachList } from "./approach/shared";

/**
 * How we work. Three layouts, chosen from the Design menu (lib/variants):
 *   A  process track      — a seam marker travels the four steps
 *   B  diagonal staircase — the steps climb the 45° line
 *   C  stacked cards      — each step stacks on the last
 * Phones and reduced motion get the steps as a list, whichever layout is
 * chosen, so every browser shows a phone the same thing (the stacked cards
 * were too cramped in a phone's width).
 */
export function Approach() {
  const variant = useVariant("approach");
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();

  if (reduced || !wide) return <ApproachList />;
  if (variant === "c") return <ApproachStack />;
  return variant === "b" ? <ApproachStairs /> : <ApproachTrack />;
}
