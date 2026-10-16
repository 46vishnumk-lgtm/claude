import { Opening } from "../sections/home/Opening";
import { Practices } from "../sections/home/Practices";
import { Work } from "../sections/home/Work";
import { Approach } from "../sections/home/Approach";
import { Voices } from "../sections/home/Voices";
import { Close } from "../sections/home/Close";
import { usePageTitle } from "../components/Page";
import { SectionShift } from "../components/SectionShift";
import { useMediaQuery, useReducedMotion } from "../lib/motion";
import { useFocusFollow, useSnapScroll } from "../lib/snap";
import { useVariant } from "../lib/variants";

/**
 * Home, v2 — "The seam".
 *
 * Scene by scene: the opening (hero + statement, one mark carried across
 * both — the blueprint becoming the object, then stepping aside whole),
 * one word per practice, the work, how we work, voices, and the close.
 * Every scene and every hand-off between scenes is driven by the scroll;
 * scrolling snaps from one settled state to the next (lib/snap.ts); the
 * hand-off itself (fade, stack, zoom, tiles, seam) and the layouts of
 * Practices, Work, Approach, Voices and Close are switchable from the Design
 * menu (lib/variants.ts). The whole page takes the black or white theme
 * (lib/theme.ts).
 *
 * The v1 sections in src/sections/*.tsx are kept for the old version and
 * for reference; nothing on this page imports them.
 */
export function Home() {
  usePageTitle();
  // How the scroll comes to rest (lib/snap.ts), from the Design menu: one
  // scroll one step, or free flow that settles on a step, or free. Wide
  // screens only, and never under reduced motion.
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();
  const scroll = useVariant("scroll");
  useSnapScroll(!wide || reduced ? "off" : scroll === "a" ? "snap" : scroll === "c" ? "settle" : "off");
  // Keyboard focus brings the page to where the focused control shows,
  // wherever the hand-offs hold sections in place.
  useFocusFollow(wide && !reduced);
  const sections = [Opening, Practices, Work, Approach, Voices, Close];
  return (
    <>
      {sections.map((Section, i) => (
        <SectionShift key={i} index={i} first={i === 0} last={i === sections.length - 1}>
          <Section />
        </SectionShift>
      ))}
    </>
  );
}
