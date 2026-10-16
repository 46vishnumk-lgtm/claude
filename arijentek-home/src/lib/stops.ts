/**
 * Where the homepage comes to rest — its stops — read from the layout.
 *
 * Snap and settle (lib/snap.ts), keyboard focus (useFocusFollow in
 * lib/snap.ts) and every scroll to an element (scrollPage in lib/motion.ts)
 * all go through here, so they land on the same settled states. Positions
 * come from layout offsets, never from boxes on screen: during a hand-off a
 * section is held in place by a transform (components/SectionShift), and a
 * sticky stage's box moves with the scroll, so neither says where a section
 * really is.
 *
 * Read fresh on every call, so layout changes and Design-menu switches need
 * no bookkeeping:
 *   each `[data-shift]` wrapper holds a section;
 *   if it holds an element with `data-snap="f1,f2,…"`, those are fractions
 *   of that element's held range (its top at the top of the screen → its
 *   bottom at the bottom);
 *   otherwise the section's top is a stop, then every `[data-snap-item]`
 *   centred on screen, then the section's end if it runs on further;
 *   after the last section, the footer, then the very end of the page.
 */

/** The element's top in the page, from offsets (transforms ignored). */
export const layoutTop = (el: HTMLElement) => {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
};

export type Stop = { y: number; item?: HTMLElement };

/** The stops of one section (its `[data-shift]` wrapper), in order. */
export function sectionStops(outer: HTMLElement): Stop[] {
  const H = window.innerHeight;
  const max = document.documentElement.scrollHeight - H;
  const at = (y: number) => Math.max(0, Math.min(max, Math.round(y)));
  const own = outer.querySelector<HTMLElement>("[data-snap]");
  const host = own ?? ((outer.firstElementChild?.firstElementChild as HTMLElement | null) || outer);
  const top = layoutTop(host);
  const range = Math.max(0, host.offsetHeight - H);
  if (own) {
    return own.dataset
      .snap!.split(",")
      .map(Number)
      .filter((f) => Number.isFinite(f))
      .map((f) => ({ y: at(top + f * range) }));
  }
  const list: Stop[] = [{ y: at(top) }];
  let last = top;
  host.querySelectorAll<HTMLElement>("[data-snap-item]").forEach((item) => {
    const c = Math.min(layoutTop(item) + item.offsetHeight / 2 - H / 2, top + range);
    if (c > last + H * 0.3) {
      list.push({ y: at(c), item });
      last = c;
    }
  });
  if (top + range > last + H * 0.3) list.push({ y: at(top + range) });
  return list;
}

/** Every stop on the page, in order. */
export function collectStops(): number[] {
  const H = window.innerHeight;
  const max = document.documentElement.scrollHeight - H;
  const list: number[] = [];
  document.querySelectorAll<HTMLElement>("[data-shift]").forEach((outer) => sectionStops(outer).forEach((s) => list.push(s.y)));

  const footer = document.querySelector<HTMLElement>("footer");
  if (footer) {
    const ft = Math.min(layoutTop(footer), max);
    list.push(Math.max(0, Math.round(ft)));
    if (max > ft + H * 0.3) list.push(Math.max(0, Math.round(max)));
  } else list.push(Math.max(0, Math.round(max)));

  // Stops closer than a third of a screen are one stop: a scroll that barely
  // moves the page reads as a scroll that did nothing.
  const sorted = list.sort((a, b) => a - b);
  return sorted.filter((y, i) => i === 0 || y - sorted[i - 1] > H * 0.3);
}

/**
 * Where to scroll to show an element. In a homepage section, that section's
 * first stop (its settled arrival); anywhere else, the element's layout
 * position, clear of the floating nav.
 */
export function stopFor(el: HTMLElement) {
  const outer = el.closest<HTMLElement>("[data-shift]");
  if (outer) return sectionStops(outer)[0]?.y ?? layoutTop(outer);
  return Math.max(0, layoutTop(el) - 88);
}
