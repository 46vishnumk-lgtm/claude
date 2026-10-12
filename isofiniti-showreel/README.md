# ISOFINITI — 15s Motion Showreel

A 15-second, 1920×1080, 60 fps brand showreel for **Isofiniti** (custom software and AI automation).
The animation is code. Each frame is a pure function of time, rendered frame-exact in headless Chromium with motion blur and scored with procedurally synthesized sound design locked to a 120 BPM grid.

## Deliverables (`out/`)

| File | Use |
|---|---|
| `isofiniti-showreel.mp4` | Web/social delivery (committed): H.264 High CRF 19, 1080p60, BT.709, AAC 320k, −14 LUFS / −1 dBTP (~28 MB) |
| `isofiniti-showreel-hq.mp4` | Near-lossless H.264 CRF 12 (~123 MB, generated locally, not committed) |
| `isofiniti-showreel-master.mov` | Master: ProRes 422 HQ 10-bit + 24-bit PCM (~870 MB, generated locally, not committed) |
| `storyboard.png` | 12-frame contact sheet of the final render |
| `isofiniti-showreel-audio.wav` | Soundtrack stem, 48 kHz / 24-bit |
| `isofiniti-showreel-audio.m4a` | Soundtrack for the live HTML preview |

## Brand system (from the supplied logo files)

- **Colors**: Ink `#0F0F11` · White `#FFFFFF` · Signal Red `#D01919` (logo-exact); neutrals `#141417 / #1C1C21 / #2A2A2E / #55555C / #8A8A93` derived from the ink.
- **Motifs** are taken straight from the mark:
  - **Corner brackets**: only top-left and bottom-right, as in the logo. They frame the whole reel as a viewfinder HUD, then travel into the exact bracket positions of the final wordmark.
  - **The red cut**: the N's red diagonal, at its exact angle (−42.02°). It's the transition device: the boot slash, the chaos→order cut, and the logo-hit flare.
  - **Red full stops** on every headline echo the single red accent in the mark.
- **Type**: Inter Display (900/800 headlines, tight −4.5% tracking) + JetBrains Mono (HUD/labels, +20% tracking, decode-scramble reveals).

## Storyboard (60 fps, 120 BPM: one beat = 0.5 s)

| Time | Scene | What happens | Sound |
|---|---|---|---|
| 0.00–1.50 | **Boot** | Red cursor blinks twice → stretches into the red cut at the logo's angle; brand brackets fly into the corners; HUD decodes (`ISOFINITI / SHOWREEL 2026`, live timecode, scene label); grid fades up | blips, reverse swell, blade *shing* + sub |
| 1.50–3.00 | **The Problem** | A jittering, misaligned spreadsheet full of `#REF!` / `v3_FINAL` / `TBD`. Glitch-cut words on each beat: **SLOW. MANUAL. DISCONNECTED.** | kick + bit-crushed glitch hits |
| 3.00–3.40 | **The Cut** | The red cut slices the frame; every cell snaps into a perfect grid, errors resolve to clean data / `✓ SYNCED`, a red selection sweeps, cells collapse from the centre | big *shing*, sub impact, cell-snap ticks |
| 3.40–5.00 | **What we do** | Mask-reveal headline **Custom software & AI automation.** + subline "For businesses that have outgrown spreadsheets and disconnected tools." | pad enters, soft pulse |
| 5.00–8.00 | **Services** (6 × 1 beat) | Slot-push titles, outlined giant index, progress segments. A bracket-framed panel wipes per beat: **Custom Software** (editor typing, BUILD PASSED) · **AI Automation** (node graph, live pulses) · **Integrations** (CRM/ERP/DB ⇄ API/BI/PAY routed through the Isofiniti mark) · **Mobile Apps** (phone UI assembling, toggle flips) · **Modernization** (legacy pixels migrate into an isometric cube) · **Private AI** (shield, lock, scanning rings, `ON-PREM · ENCRYPTED · ISOLATED`) | four-on-the-floor, swishes, bass |
| 7.82–8.10 | **Zoom-through** | The panel scales up to become the frame | reverse whoosh → low boom |
| 8.00–11.00 | **Process** (Three.js) | An isometric city of systems rises in a wave; red "nodes" (AI CORE, CRM SYNC, ERP BRIDGE, MOBILE API, PRIVATE LLM, DATA LAKE) with 3D-tracked labels; data packets with trails race the roads; camera orbits. Steps roll: **Discovery → Strategy → Design & Development → Launch & Support** with progress track | kick/hat groove, D-minor arpeggio, label pops |
| 11.00–12.45 | **Philosophy** | **Design. Build. Run.** on three beats. A red comet traces an infinity (∞, the *finiti* in Isofiniti) that collapses to a point | heavy hits + riser |
| 12.45–15.00 | **Logo resolve** | The HUD brackets travel and thicken into the logo brackets; the N draws stroke-by-stroke; **13.00 the red cut slams through** (flash, shake, glow); letters rise outward from the N; light sweep; `CUSTOM SOFTWARE · AI AUTOMATION` decodes; `isofiniti.com` | the big impact, chord bloom, letter ticks, shimmer |

Copy is drawn from isofiniti.com (services, process, "design, build and run"). The one-line service descriptors are new short taglines written for the reel. Swap them in `src/main.js` (`SERVICES`) if you prefer different wording.

## Run / re-render

```bash
npm install                     # gsap, three, fonts (also vendored in ./vendor and ./fonts)
npx serve .                     # open http://localhost:3000/?play  → live preview with sound (click to restart)
                                #      http://localhost:3000/?t=13.2 → freeze any moment
node scripts/render.mjs --stills 1.6,5.3,9.2,14.9   # QA stills → out/stills
./scripts/render-all.sh         # full render: 4 parallel shards × 2 sub-frames (motion blur) → out/
```

- `src/main.js`: all scenes and timing (`renderAt(t)` is the only entry point; GSAP eases via `gsap.parseEase`)
- `scripts/render.mjs`: deterministic frame capture → ffmpeg (ProRes, BT.709, tmix motion blur)
- `scripts/audio.py`: sound design synthesized in numpy (kicks, sub booms, blade shings, glitches, risers, pad, arps, convolution reverb)
