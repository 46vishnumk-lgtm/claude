import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative asset paths: the built site works at a domain root (Vercel,
  // Netlify) and under a GitHub Pages project path alike.
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  css: {
    // Tailwind v4 runs through its own Vite plugin. Declaring an empty
    // PostCSS config stops Vite walking up into the parent project's
    // postcss.config.mjs, which belongs to an unrelated app.
    postcss: { plugins: [] },
  },
});
