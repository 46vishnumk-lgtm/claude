import { useMediaQuery, useReducedMotion } from "../../lib/motion";
import { useVariant } from "../../lib/variants";
import { WorkStage } from "./work/WorkStage";
import { WorkRail } from "./work/WorkRail";
import { WorkTiles } from "./work/WorkTiles";
import { WorkSwipe } from "./work/shared";

/**
 * Selected work. Three layouts, chosen from the Design menu (lib/variants):
 *   A  project stage   — pinned, one project at a time, dissolving cuts
 *   B  horizontal rail — pinned, the projects travel sideways
 *   C  tile assembly   — each image builds from tiles as it scrolls in
 * Phones and reduced motion get a swipe rail for A and B; C works in flow.
 */
export function Work() {
  const variant = useVariant("work");
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();

  if (variant === "c") return <WorkTiles />;
  if (!wide || reduced) return <WorkSwipe />;
  return variant === "b" ? <WorkRail /> : <WorkStage />;
}
