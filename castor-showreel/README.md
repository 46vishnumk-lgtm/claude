# Castor Digital Ecosystem — Motion Case Study

A 46-second, 1920×1080 / 60 fps motion piece presenting Isofiniti's work for **Castor Home Health Solutions**: four businesses unified into one digital ecosystem.

- **Video:** `out/castor-showreel.mp4` (silent first draft) · `out/castor-showreel-vo.mp4` once the voiceover is generated
- **Live version:** `index.html`, the same piece as a real-time, scrubbable player. Open it in a browser and press space to pause.

## Creative direction

White → soft cyan gradient, glass cards with thin gray outlines and soft shadows, black Geist typography, and Isofiniti red `#D41100` used only for highlights. Castor teal `#198387` and navy `#0E1B33` come from castorcares.com. There is no photography of people: the Castor site screens were captured with every photo replaced by vector panels.

| # | Scene | Time | Motion idea |
|---|-------|------|-------------|
| 01 | Opening | 0–4s | Castor logo assembles (swoosh wipe, letters rise, star spins in); floating healthcare chips |
| 02 | The Challenge | 4–8s | Four chips fly into four separate "website" cards; broken dashed links and warnings |
| 03 | Customer Frustration | 8–12s | Search typed, cursor clicks site after site, extra windows pile up, everything shakes |
| 04 | Isofiniti Enters | 12–16s | Red line draws across; Isofiniti wordmark assembles; cards collapse and network lines connect them |
| 05 | The Ecosystem | 16–21s | Hero: "One Digital Ecosystem" hub, orbit rings, particles flowing along every connection |
| 06 | Building the Platform | 21–25s | Camera dives into the hub; Design → Launch pipeline; components self-assemble Figma-style; code types; tests pass |
| 07 | Website Reveal | 25–30s | The artboard becomes a browser that grows into the real castorcares.com: hover, click, scroll |
| 08 | Business Impact | 30–34s | Four glass benefit cards flip up one by one |
| 09 | Before vs After | 34–38s | Gray "before" vs. bright "after"; the four old sites fly into the unified platform |
| 10 | Final Hero + end card | 38–46s | Laptop and phone on the live site, delivery badges, Isofiniti end card and tagline |

## Build and render

```bash
python3 build.py                 # inlines the logo SVGs: src/showreel.src.html → index.html
node tools/frames.cjs <dir> 5 17 # screenshot specific seconds (quick visual checks)
node tools/render.cjs            # frame-accurate render → out/castor-showreel.mp4 (≈25 min on 4 cores)
```

Rendering drives the GSAP timeline frame by frame in headless Chromium (`index.html?render`), so every frame is deterministic. Requires Node with Playwright, Chromium, and ffmpeg.

## Voiceover (ElevenLabs)

The script, one line per scene with its start time, is in `voiceover/script.json`.

```bash
export ELEVENLABS_API_KEY=...          # required
export ELEVENLABS_VOICE_ID=...         # optional; defaults to the premade "Brian" narrator voice
python3 voiceover/voiceover.py generate   # → voiceover/clips/01.mp3 … 11.mp3
python3 voiceover/voiceover.py mix        # → out/castor-showreel-vo.mp4
```

Each clip is placed at its scene's start. A clip longer than its slot is sped up slightly (at most 1.15×). The mix is loudness-normalised to −16 LUFS.

## Files

```
index.html                 built piece (open in a browser)
src/showreel.src.html      source — scenes, styles, GSAP timeline
build.py                   inlines brand SVGs so their parts can be animated
assets/logos/              Castor + Isofiniti logos (as supplied)
assets/img/                castorcares.com captures, photos replaced with vector art
assets/fonts/, vendor/     Geist, Geist Mono, GSAP 3.12.5
tools/                     render + frame-check scripts
voiceover/                 ElevenLabs script and generator
```
