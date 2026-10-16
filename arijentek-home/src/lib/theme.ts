import { useSyncExternalStore } from "react";

/**
 * Site theme: the whole page in black or in white.
 *
 * The theme lives on <html data-theme>, set before first paint by the inline
 * script in index.html (so a returning visitor never sees the wrong ground
 * flash), and is remembered per browser in localStorage. Dark is the default:
 * it is the brand ground.
 *
 * Colour follows from CSS (styles/index.css, "Theme"): every chapter maps its
 * native palette onto the theme's --bg / --fg tokens, so sections written
 * for a dark or a light ground both render in the chosen theme. Only a few
 * effects need the theme in script (blend modes that depend on the ground).
 */
export type Theme = "dark" | "light";

const KEY = "arijentek:theme";
const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f0f0ee" : "#0f0f11");
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* private mode: still switches for this visit */
  }
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark");
}
