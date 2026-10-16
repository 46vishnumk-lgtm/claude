/**
 * Cached bounding rect.
 *
 * `@canvas-ui/liquid-react` imports this from `../rect-cache` but the registry
 * item ships only `Liquid.tsx` and declares no registry dependency, so the
 * published component does not compile on its own. This is that module,
 * written to the contract the component uses: a `current` rect that is cheap
 * to read, and a `destroy`.
 *
 * Cheap matters. `current` is read on every `pointermove`, and
 * `getBoundingClientRect` forces layout — calling it per event on a page this
 * size would make the pointer the most expensive thing on it. So the rect is
 * measured once and re-measured only after something that could have moved it.
 *
 * Scroll is listened for in the capture phase because a scroll in any ancestor
 * moves the element in viewport space, and scroll events from a nested
 * scroller do not bubble to window.
 *
 * Known limit: an element moved by an animation or a transform, with no scroll
 * or resize, keeps a stale rect until the next of either. Splat positions are
 * off by the drift until then. Invalidating per frame instead would give up
 * the caching this exists for.
 */
export interface RectCache {
  /** The element's viewport rect, re-measured only when it may have moved. */
  readonly current: DOMRect;
  destroy(): void;
}

export function createRectCache(element: Element): RectCache {
  let rect = element.getBoundingClientRect();
  let stale = false;

  const invalidate = () => {
    stale = true;
  };

  window.addEventListener("scroll", invalidate, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", invalidate, { passive: true });

  const observer =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(invalidate);
  observer?.observe(element);

  return {
    get current() {
      if (stale) {
        rect = element.getBoundingClientRect();
        stale = false;
      }
      return rect;
    },
    destroy() {
      window.removeEventListener("scroll", invalidate, { capture: true });
      window.removeEventListener("resize", invalidate);
      observer?.disconnect();
    },
  };
}
