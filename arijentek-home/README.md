# Arijentek — homepage

The Arijentek homepage on its own: the 3D A mark (Three.js), the scroll-driven
scenes (GSAP ScrollTrigger + Lenis smooth scrolling), dark and light themes,
and the phone layout. Built with React 18, TypeScript, Vite and Tailwind CSS v4.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). With `npm run dev`
the **Design menu** is available in the bottom-left corner (or press **D**) to
compare section layouts. It never appears on the live site.

## Put it on GitHub

1. Create a new repository on [github.com](https://github.com/new) (for example
   `arijentek-home`). Leave "Add a README" unticked.
2. Upload these files: on the new repository's page click **uploading an
   existing file**, then drag in everything from this folder, including the
   hidden `.github` folder. (Or, with Git installed:)

   ```bash
   git init
   git add .
   git commit -m "Arijentek homepage"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/arijentek-home.git
   git push -u origin main
   ```

Do not upload `node_modules` or `dist`; they are rebuilt automatically.

## Make it live

Pick one.

### Option A — Vercel (recommended)

1. Sign in at [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import the GitHub repository. Vercel detects Vite; keep the defaults
   (build command `npm run build`, output folder `dist`).
3. Click **Deploy**. You get a link such as `arijentek-home.vercel.app`, and
   every push to GitHub updates it. Add your own domain under
   **Settings → Domains**.

Netlify and Cloudflare Pages work the same way (build `npm run build`, output
`dist`).

### Option B — GitHub Pages (free, no other account)

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or open **Actions → Deploy to GitHub Pages → Run workflow**).
   The workflow in `.github/workflows/deploy.yml` builds and publishes the
   site to `https://YOUR-NAME.github.io/arijentek-home/`.

The site uses relative paths, so it works both at a domain root and under a
GitHub Pages project path.

## What is in here

| Path | What it holds |
|---|---|
| `src/pages/Home.tsx` | The page: its sections in order, and the hand-off between them |
| `src/sections/home/` | The sections: Opening (hero + statement over the 3D scene), Practices, Work, Approach, Voices, Close |
| `src/three/blueprintScene.ts` | The 3D A mark: blueprint drawing → solid, grid floor, camera poses |
| `src/lib/motion.ts`, `snap.ts`, `stops.ts` | Smooth scrolling, scroll progress, snap and settle stops |
| `src/lib/variants.ts` | Section layouts and the defaults visitors see |
| `src/data/site.ts`, `src/data/pages.ts` | All text, projects and quotes |
| `src/styles/index.css` | Design tokens, themes and shared styles |
| `public/media/` | Images |

This build is the homepage only. Links that would open another page of the
full site go to the matching section here (Work, Services, Approach,
Contact); a project's "View the case" and similar links show "The full page is
coming soon." Contact buttons in the closing section and footer open an email
to the studio address in `src/data/site.ts`.

**Before launch:** the clients, projects, quotes and people are placeholder
content, flagged on the page with small "draft" notes. Replace them in
`src/data/site.ts` and `src/data/pages.ts`.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript check |
