import { useEffect } from "react";
import { getScroller, setWheelHook } from "./motion";
import { collectStops, sectionStops } from "./stops";

/**
 * Snap scrolling for the homepage: one scroll, one step (or, in the
 * "settle" mode, free scrolling that comes to rest on a step; see
 * useSettle).
 *
 * Every settled state on the page is a stop — each section once it has
 * arrived, and each step inside the held scenes (a practice, a project, a
 * quote …). A wheel gesture, trackpad swipe, arrow key, Page Up/Down or
 * Space plays the scroll from the current stop to the next as one eased
 * glide, so the transitions in between always run whole and the page never
 * rests half-way through one. Everything on the page is still driven by the
 * scroll position; snapping only decides where the scroll comes to rest.
 *
 * The stops come from the layout (lib/stops.ts), read fresh on every step.
 *
 * Input during a glide is swallowed, and a new step needs a new gesture:
 * trackpad momentum keeps firing wheel events after a flick, so a step is
 * only taken once the wheel has been quiet for a moment. Touch, ctrl+wheel
 * (zoom), sideways scrolling and scrollable panels ([data-lenis-prevent])
 * are left alone.
 */
const QUIET_MS = 180;

/** Smooth both ends: the glide leaves gently and settles gently. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * How the homepage scroll comes to rest (Design menu "Scroll"):
 *   snap    one gesture, one step (useSnapStep below);
 *   settle  free flowing scroll, and once the page has been still for a
 *           moment it eases into the nearest stop (useSettle below);
 *   off     ordinary scrolling.
 */
export type ScrollMode = "snap" | "settle" | "off";

export function useSnapScroll(mode: ScrollMode) {
  useSnapStep(mode === "snap");
  useSettle(mode === "settle");
}

/** True when the element is on screen and not faded out or hidden. */
function shows(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0 || r.bottom <= 0 || r.top >= window.innerHeight) return false;
  let opacity = 1;
  for (let a: HTMLElement | null = el; a; a = a.parentElement) {
    const cs = getComputedStyle(a);
    if (cs.visibility === "hidden") return false;
    opacity *= +cs.opacity;
  }
  return opacity > 0.5;
}

/**
 * Keyboard focus and the held scenes. A section in its hand-off is held in
 * the viewport by a transform while it is still transparent, so the browser
 * takes a control there for already on screen and does not scroll to it;
 * and a control belonging to one step of a scene shows only at that step.
 * So when keyboard focus moves into a homepage section, the page goes to the
 * stop where the control is shown:
 *   `data-focus-stop="k"` on it or an ancestor: the section's k-th stop;
 *   inside a `[data-snap-item]`: that item's stop;
 *   otherwise it stays if the page rests on one of the section's stops with
 *   the control in view, and else goes to the section's nearest stop (its
 *   first, if the nearest still does not show it).
 * Pointer focus is left alone (a click lands where it was aimed), and so is
 * focus moved by a jump link onto its target (lib/motion.ts useJumpLinks).
 * On whenever the hand-offs are (wide screens, motion allowed), whatever the
 * scroll mode.
 */
export function useFocusFollow(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let keyboard = false;
    let raf = 0;
    const onKey = () => (keyboard = true);
    const onPointer = () => (keyboard = false);
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!keyboard || !el || el.hasAttribute("data-jump-target")) return;
      const outer = el.closest<HTMLElement>("[data-shift]");
      if (!outer) return;
      cancelAnimationFrame(raf);
      // A frame later, after any scroll the browser makes for the focus.
      raf = requestAnimationFrame(() => {
        const lenis = getScroller();
        const stops = sectionStops(outer);
        if (!lenis || !stops.length) return;
        const y = lenis.scroll;
        let target: number | undefined;
        const own = el.closest<HTMLElement>("[data-focus-stop]");
        if (own) target = stops[Math.min(stops.length - 1, Math.max(0, Number(own.dataset.focusStop) || 0))].y;
        else {
          const item = el.closest<HTMLElement>("[data-snap-item]");
          if (item) target = stops.find((s) => s.item === item)?.y;
          if (target === undefined) {
            const resting = stops.some((s) => Math.abs(s.y - y) < 4);
            if (resting && shows(el)) return;
            target = stops.reduce((b, s) => (Math.abs(s.y - y) < Math.abs(b - y) ? s.y : b), stops[0].y);
            if (Math.abs(target - y) < 4) target = stops[0].y;
          }
        }
        if (Math.abs(target - y) < 2) return;
        const dist = Math.abs(target - y) / window.innerHeight;
        lenis.scrollTo(target, { duration: Math.min(1.1, 0.5 + dist * 0.25), easing: easeInOut, force: true });
      });
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("focusin", onFocus);
    };
  }, [enabled]);
}

/** Still this long (ms) after the last scroll or input before settling. */
const SETTLE_MS = 200;
/** Never travel further than this (screens) to settle: enough to finish
 *  the longest gap between two stops (the opening's, about 2.4 screens)
 *  from anywhere in it, so a gesture that stops part-way still carries on
 *  forward rather than falling back. */
const SETTLE_RANGE = 1.5;

/**
 * Flow and settle: the wheel, trackpad, keys and scrollbar all scroll
 * freely, past as many steps as the gesture carries; when the page comes to
 * rest it glides on into the nearest stop, so it never rests half-way
 * through a transition. The stop ahead, in the direction the page was
 * moving, counts as a little nearer than the one behind, so stopping just
 * past a step carries on into the next one instead of pulling back. Any new
 * input takes over at once (the glide is not locked), and nothing happens
 * while a mouse button is held (dragging the scrollbar, selecting text).
 */
function useSettle(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let gliding = false;
    let held = false;
    let last = getScroller()?.scroll ?? window.scrollY;
    let dir = 0;

    const settle = () => {
      const lenis = getScroller();
      if (!lenis || lenis.isStopped || held) return;
      const y = lenis.scroll;
      const stops = collectStops();
      const H = window.innerHeight;
      // A control with keyboard focus stays on screen: a stop that would
      // scroll it out of view is not a candidate. (Inside a held, sticky
      // scene it stays put, so any stop of the scene keeps it.)
      const focus = document.activeElement as HTMLElement | null;
      const guard = focus && focus !== document.body && focus.matches(":focus-visible") ? focus : null;
      const box = guard?.getBoundingClientRect();
      const pinned = !!guard?.closest(".sticky");
      const keeps = (s: number) => {
        if (!box || pinned) return true;
        const top = box.top + (y - s);
        return top + box.height > 0 && top < H;
      };
      let best: number | undefined;
      let bestCost = Infinity;
      for (const s of stops) {
        const d = Math.abs(s - y);
        if (d > H * SETTLE_RANGE || !keeps(s)) continue;
        const ahead = dir !== 0 && Math.sign(s - y) === dir;
        const cost = d * (ahead ? 0.7 : 1.3);
        if (cost < bestCost) {
          bestCost = cost;
          best = s;
        }
      }
      if (best === undefined || Math.abs(best - y) < 2) return;
      const dist = Math.abs(best - y) / H;
      const duration = Math.min(1.6, 0.55 + dist * 0.75);
      gliding = true;
      lenis.scrollTo(best, {
        duration,
        easing: easeInOut,
        force: true,
        onComplete: () => {
          gliding = false;
        },
      });
      // Never stay in the glide if it is cut short some other way.
      window.setTimeout(() => (gliding = false), duration * 1000 + 250);
    };

    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    const onScroll = () => {
      const y = getScroller()?.scroll ?? window.scrollY;
      // Our own glide neither re-arms the settle nor changes the direction.
      if (!gliding && Math.abs(y - last) > 0.5) dir = Math.sign(y - last);
      last = y;
      if (!gliding) arm();
    };
    // Input during a glide hands control straight back.
    const onInput = () => {
      gliding = false;
      arm();
    };
    const onDown = () => {
      held = true;
      window.clearTimeout(timer);
    };
    const onUp = () => {
      held = false;
      arm();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);
}

function useSnapStep(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let gliding = false;
    let ready = true; // a new gesture may take a step
    let quiet = 0;

    const step = (dir: 1 | -1 | "home" | "end") => {
      const lenis = getScroller();
      if (!lenis || gliding) return;
      const stops = collectStops();
      if (!stops.length) return;
      const y = lenis.scroll;
      const target =
        dir === "home"
          ? stops[0]
          : dir === "end"
            ? stops[stops.length - 1]
            : dir > 0
              ? stops.find((s) => s > y + 4)
              : [...stops].reverse().find((s) => s < y - 4);
      if (target === undefined || Math.abs(target - y) < 2) return;
      const dist = Math.abs(target - y) / window.innerHeight;
      gliding = true;
      lenis.scrollTo(target, {
        duration: Math.min(1.9, Math.max(1, 0.85 + dist * 0.3)),
        easing: easeInOut,
        lock: true,
        force: true,
        onComplete: () => {
          gliding = false;
        },
      });
      // Belt and braces: never stay locked if the glide is interrupted.
      window.setTimeout(() => (gliding = false), 2100);
    };

    setWheelHook(({ deltaX, deltaY, event }) => {
      if (event.type.includes("touch") || event.ctrlKey) return true;
      const lenis = getScroller();
      if (!lenis || lenis.isStopped) return true;
      const t = event.target as Element | null;
      if (t?.closest?.("[data-lenis-prevent]")) return true;
      if (Math.abs(deltaX) > Math.abs(deltaY)) return true;
      if (event.cancelable) event.preventDefault();
      window.clearTimeout(quiet);
      quiet = window.setTimeout(() => (ready = true), QUIET_MS);
      if (gliding || !ready || Math.abs(deltaY) < 2) return false;
      ready = false;
      step(deltaY > 0 ? 1 : -1);
      return false;
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const lenis = getScroller();
      if (!lenis || lenis.isStopped) return;
      let dir: 1 | -1 | "home" | "end" | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else if (e.key === " ") {
        // Space on a control presses it; elsewhere it pages.
        if (t?.closest("a, button, summary, [role='button'], [role='radio'], [role='switch']")) return;
        dir = e.shiftKey ? -1 : 1;
      } else if (e.key === "Home") dir = "home";
      else if (e.key === "End") dir = "end";
      if (!dir) return;
      e.preventDefault();
      step(dir);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      setWheelHook(null);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(quiet);
    };
  }, [enabled]);
}
