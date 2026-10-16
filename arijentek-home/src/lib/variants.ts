import { useSyncExternalStore } from "react";

/**
 * Design variants — alternative layouts for homepage sections that can be
 * switched live from the Design menu, so the options can be compared on the
 * real page. The choice is remembered per browser (localStorage); DEFAULTS is what
 * every visitor sees by default.
 *
 * When a final choice is made, delete the losing components and this entry.
 */
export const VARIANTS = {
  nav: { label: "Nav bar", options: { a: "Plain bar", b: "Seam tab bar", c: "Minimal split", d: "Index", e: "Brackets" } },
  scroll: { label: "Scroll", options: { a: "Snap", b: "Free", c: "Flow + settle" } },
  shift: { label: "Section change", options: { a: "Fade", b: "Stack", c: "Zoom through", d: "Tile dissolve", e: "Seam wipe" } },
  practices: { label: "Practices transition", options: { a: "Letter rise", b: "Decode", c: "Split-flap" } },
  practiceType: { label: "Practices type", options: { a: "Image in type", b: "Negative" } },
  work: { label: "Work section", options: { a: "Project stage", b: "Horizontal rail", c: "Tile assembly" } },
  approach: { label: "Approach section", options: { a: "Process track", b: "Diagonal staircase", c: "Stacked cards" } },
  stairCard: { label: "Staircase steps", options: { a: "Glass cards", b: "Plain" } },
  stairDir: { label: "Staircase direction", options: { a: "From above", b: "From below" } },
  voices: { label: "Voices section", options: { a: "Quote theatre", b: "Horizontal rail", c: "Card stack" } },
  close: { label: "Close section", options: { a: "Mark finale", b: "Giant type", c: "Blueprint form" } },
} as const;

export type Section = keyof typeof VARIANTS;
export type Variant = "a" | "b" | "c" | "d" | "e";

/**
 * The Design menu is a review tool. It is on in the dev server and in builds
 * made with VITE_DESIGN_REVIEW=true (a build to show the client); in any
 * other build there is no menu, saved choices are ignored, and every visitor
 * gets DEFAULTS.
 */
export const REVIEW = import.meta.env.DEV || import.meta.env.VITE_DESIGN_REVIEW === "true";

const KEY = "arijentek:variants";
/** What visitors see; chosen in review (2026-10-14). Reset returns here. */
export const DEFAULTS: Record<Section, Variant> = {
  nav: "a",
  scroll: "c",
  shift: "a",
  practices: "c",
  practiceType: "b",
  work: "c",
  approach: "b",
  stairCard: "a",
  stairDir: "b",
  voices: "a",
  close: "b",
};
let state: Record<Section, Variant> = { ...DEFAULTS };
if (REVIEW) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    for (const k of Object.keys(state) as Section[]) if (saved[k] in VARIANTS[k].options) state[k] = saved[k];
  } catch {
    /* private mode: defaults */
  }
}

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setVariant(section: Section, v: Variant) {
  state = { ...state, [section]: v };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* still switches for this visit */
  }
  listeners.forEach((l) => l());
  // Section heights change with the layout; let pinned scenes re-measure.
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}

export function useVariant(section: Section): Variant {
  return useSyncExternalStore(subscribe, () => state[section]);
}
