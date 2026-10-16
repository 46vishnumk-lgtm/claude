import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollPage, useChapterTone, useJumpLinks, useSmoothScroll } from "./lib/motion";
import { REVIEW } from "./lib/variants";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Liquid } from "./components/canvasui/Liquid";
import { DesignMenu } from "./components/DesignMenu";
import { BrandIntro } from "./components/BrandIntro";
import { HomeLinks } from "./components/HomeLinks";
import { Home } from "./pages/Home";

const TRAIL_KEY = "arijentek:trail";

// The pointer trail is switched from the Design menu, so it exists only in
// review builds (lib/variants.ts REVIEW).
const readTrail = () => {
  if (!REVIEW) return false;
  try {
    return localStorage.getItem(TRAIL_KEY) === "on";
  } catch {
    return false;
  }
};

/**
 * The homepage on its own. There is one page, so arriving lands at the top
 * once its sections exist; links to the other pages of the full site are
 * resolved on this page by HomeLinks.
 */
export default function App() {
  useSmoothScroll();
  useJumpLinks();
  useChapterTone("/");
  const [trail, setTrail] = useState(readTrail);

  useEffect(() => {
    // One frame so the sections exist before anything is measured.
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      scrollPage(0, true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleTrail = (on: boolean) => {
    setTrail(on);
    try {
      localStorage.setItem(TRAIL_KEY, on ? "on" : "off");
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  };

  return (
    <>
      <BrandIntro />
      <Nav />
      <main id="main">
        <Home />
      </main>
      <Footer />
      <HomeLinks />

      {/* The overlay is viewport-fixed and listens on window, so it does not
          need to wrap the page. Mounted beside it, switching it off tears down
          the simulation without remounting the content. */}
      {trail && (
        <Liquid
          force={0.6}
          radius={0.3}
          curl={0.4}
          pressureIterations={4}
          pressure={0.65}
          intensity={0.5}
          distortion={0}
          blend={1}
          densityDissipation={0.855}
          velocityDissipation={1}
          simResolution={32}
          dyeResolution={128}
          color={[1, 0.3412, 0]}
          rainbow={false}
        >
          {null}
        </Liquid>
      )}
      {/* A review tool, not part of the site: dev server and review builds only. */}
      {REVIEW && <DesignMenu trail={trail} onTrailChange={toggleTrail} />}
    </>
  );
}
