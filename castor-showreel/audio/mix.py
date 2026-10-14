#!/usr/bin/env python3
"""Soundtrack for the Castor showreel: voiceover + sound effects + background music.

    python3 audio/mix.py music                 # compose audio/music.wav (59.5 s)
    python3 audio/mix.py mix A-dawn [B-grant …] # → out/castor-showreel-<take>.mp4

Each voice take (voiceover/takes/<take>.mp3) is one continuous read of the script with long
pauses between lines; it is split at the 10 longest pauses and each line is placed on its
scene start from voiceover/script.json. Music is ducked under the voice; the final mix is
loudness-normalised for web playback (-14 LUFS).
"""
import json
import pathlib
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
DUR = 59.5
N = int(DUR * SR)
SCRIPT = json.loads((ROOT / "voiceover" / "script.json").read_text())["lines"]


def load(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).copy()


def save(path, x):
    x = np.clip(x, -1, 1).astype(np.float32)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(path)],
                   input=x.T.copy().tobytes(), check=True)


def smooth(x, win):
    c = np.cumsum(np.concatenate([[0.0], x]))
    h = win // 2
    idx = np.arange(len(x))
    lo, hi = np.clip(idx - h, 0, len(x)), np.clip(idx + h, 0, len(x))
    return (c[hi] - c[lo]) / np.maximum(1, hi - lo)


def place(bus, clip, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= bus.shape[1]:
        return
    n = min(len(clip), bus.shape[1] - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[0, i:i + n] += clip[:n] * gain * l * 1.414
    bus[1, i:i + n] += clip[:n] * gain * r * 1.414


# ---------------------------------------------------------------- music
def music():
    rng = np.random.default_rng(7)
    t = np.arange(N) / SR
    bpm = 96
    beat = 60 / bpm
    bar = 4 * beat
    mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
    # Dmaj9 – Bm9 – Gmaj9 – A6/9, two bars each
    chords = [[50, 57, 62, 66, 69, 76], [47, 54, 61, 62, 66, 73], [43, 50, 59, 62, 66, 74], [45, 52, 59, 61, 64, 71]]
    out = np.zeros((2, N))

    # pad: detuned sines with slow swells, low-passed
    for k in range(int(DUR / (2 * bar)) + 1):
        c = chords[k % 4]
        t0 = k * 2 * bar
        seg = (t >= t0 - .4) & (t < t0 + 2 * bar + 1.2)
        tt = t[seg] - t0
        env = np.clip((tt + .4) / 1.2, 0, 1) * np.clip((2 * bar + 1.2 - tt) / 1.6, 0, 1)
        for j, m in enumerate(c):
            f = mtof(m)
            for d, side in ((-.12, 0), (.12, 1)):
                ph = rng.uniform(0, 2 * np.pi)
                v = np.sin(2 * np.pi * f * (1 + d / 100) * tt + ph) + .25 * np.sin(4 * np.pi * f * (1 + d / 100) * tt + ph)
                out[side, seg] += v * env * (.05 if j else .07)
    sos = butter(2, 2200, 'low', fs=SR, output='sos')
    out = sosfilt(sos, out, axis=1)

    # plucked arpeggio (8ths) from 4 s, brighter after the Isofiniti reveal
    pl = np.zeros(N)
    step = beat / 2
    for i in range(int(DUR / step)):
        ts = i * step
        if ts < 4 or ts > DUR - 1.5:
            continue
        c = chords[int(ts // (2 * bar)) % 4]
        m = c[2 + (i % 4)] + (12 if (i % 8) in (3, 7) else 0)
        f = mtof(m)
        n = int(.9 * SR)
        tt = np.arange(n) / SR
        v = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt) + .1 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 6.5)
        g = .05 if ts < 16 else .075
        a = int(ts * SR)
        pl[a:a + n] += v[:N - a] * g
    out[0] += pl * .9
    out[1] += np.roll(pl, int(.011 * SR)) * .9   # tiny Haas widening

    # soft kick + shaker from the ecosystem scene, pulling back for the end card
    def kick():
        n = int(.35 * SR); tt = np.arange(n) / SR
        return np.sin(2 * np.pi * (48 + 70 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 11)
    def shaker():
        n = int(.09 * SR); tt = np.arange(n) / SR
        return sosfilt(butter(2, 6500, 'high', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-tt * 55)
    K, S = kick(), shaker()
    for i in range(int(DUR / beat)):
        ts = i * beat
        if 20.4 <= ts < 55.2:
            a = int(ts * SR)
            out[:, a:a + len(K)] += K[:N - a] * .16
        for h in (0, .5):
            th = ts + h * beat
            if 16.2 <= th < 55.2:
                a = int(th * SR)
                g = .035 if h else .02
                out[0, a:a + len(S)] += S[:N - a] * g
                out[1, a:a + len(S)] += S[:N - a] * g * .8

    # global arc: fade in, gentle dip under the challenge, swell into the ecosystem, resolve at the end
    arc = np.interp(t, [0, 2.5, 9, 15.4, 20.5, 27, 55, 57.5, DUR], [0, .85, .75, .8, 1, .95, .95, .7, 0])
    out *= arc
    # simple stereo room
    for d, g in ((.031, .22), (.053, .16), (.089, .1)):
        s = int(d * SR)
        out[0, s:] += out[1, :-s] * g
        out[1, s:] += out[0, :-s] * g
    out /= np.max(np.abs(out)) / .7
    save(ROOT / "audio" / "music.wav", out)
    print("wrote audio/music.wav")


# ---------------------------------------------------------------- voice
def split_take(x):
    """Return 11 (start, end) sample ranges: the voice between the 10 longest pauses."""
    hop = int(.01 * SR)
    frames = np.sqrt(smooth(x ** 2, hop)[::hop])
    voiced = frames > 10 ** (-38 / 20)
    gaps, i = [], 0
    while i < len(voiced):
        if not voiced[i]:
            j = i
            while j < len(voiced) and not voiced[j]:
                j += 1
            if i > 0 and j < len(voiced):
                gaps.append((j - i, i, j))
            i = j
        else:
            i += 1
    gaps = sorted(sorted(gaps, reverse=True)[:len(SCRIPT) - 1], key=lambda g: g[1])
    if len(gaps) != len(SCRIPT) - 1:
        sys.exit(f"found {len(gaps)} pauses, need {len(SCRIPT) - 1}")
    bounds = [0] + [g[1] for g in gaps for _ in (0, 1)] + [len(voiced)]
    bounds = [0] + sum(([g[1], g[2]] for g in gaps), []) + [len(voiced)]
    segs = []
    for k in range(len(SCRIPT)):
        a, b = bounds[2 * k], bounds[2 * k + 1]
        v = np.where(voiced[a:b])[0]
        a2, b2 = a + v[0], a + v[-1] + 1
        segs.append((max(0, a2 * hop - int(.04 * SR)), min(len(x), b2 * hop + int(.12 * SR))))
    return segs


def tempo(clip, factor):
    if abs(factor - 1) < .005:
        return clip
    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", f"atempo={factor:.3f}", "-f", "f32le", "-"], input=clip.astype(np.float32).tobytes(),
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


# ---------------------------------------------------------------- sfx cue sheet (seconds, matches the timeline)
CUES = {
    "whoosh": [(4.4, .5), (9.5, .55), (14.9, .5), (15.55, .45), (19.8, .5), (26.25, .8), (32.15, .55), (39.2, .5), (44.95, .5), (48.25, .55), (55.15, .6)],
    "pop": [(.75, .18), (.85, .15), (.95, .15), (1.05, .15), (5.15, .3), (5.24, .28), (5.33, .28), (5.42, .28), (6.75, .3), (6.9, .3),
            (11.6, .3), (12.2, .3), (12.8, .3), (20.3, .35), (22.25, .25), (22.39, .25), (22.53, .25), (22.67, .25),
            (28.0, .3), (28.95, .3), (29.9, .3), (30.85, .3), (31.8, .3), (30.15, .22), (30.29, .22), (30.43, .22),
            (40.5, .35), (40.95, .35), (41.4, .35), (41.85, .35), (42.45, .25), (42.65, .22), (42.77, .22), (42.89, .22), (43.0, .22),
            (47.05, .3), (47.2, .3), (47.35, .3), (47.5, .3), (49.3, .35), (51.25, .22), (51.37, .22), (51.49, .22), (51.61, .22),
            (51.95, .3), (52.09, .3)],
    "click": [(11.3, .55), (11.95, .55), (12.6, .55), (13.15, .55), (35.85, .6)]
             + [(13.3 + i * .085, .16) for i in range(9)] + [(41.6 + i * .08, .12) for i in range(8)],
    "chime": [(.95, .25), (17.45, .55), (56.45, .6)],
}


def sfx_bus():
    bus = np.zeros((2, N))
    for name, cues in CUES.items():
        clip = load(ROOT / "audio" / "sfx" / f"{name}.mp3")
        clip /= max(1e-6, np.max(np.abs(clip)))
        for k, (ts, g) in enumerate(cues):
            place(bus, clip, ts, g * .5, pan=((k % 5) - 2) * .12)
    return bus


def mix(take):
    x = load(ROOT / "voiceover" / "takes" / f"{take}.mp3")
    segs = split_take(x)
    vo = np.zeros((2, N))
    report = []
    for (a, b), line in zip(segs, SCRIPT):
        clip = x[a:b]
        dur = len(clip) / SR
        f = min(1.18 if line is SCRIPT[-1] else 1.12, max(1.0, dur / line["max"]))
        clip = tempo(clip, f)
        place(vo, clip, line["at"], 1.0)
        report.append(f'{line["id"]} {dur:4.2f}s/{line["max"]}s' + (f' ×{f:.2f}' if f > 1.005 else ''))
    print(take, ' · '.join(report))
    # duck music under the voice (smoothed envelope)
    env = np.abs(vo[0])
    win = int(.25 * SR)
    env = smooth(env, win)
    duck = 1 - .62 * np.clip(env / (np.max(env) * .25 + 1e-9), 0, 1)
    duck = smooth(duck, int(.3 * SR))
    mus2 = np.zeros((2, N))
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(ROOT / "audio" / "music.wav"), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    m = np.frombuffer(raw, np.float32).reshape(-1, 2).T
    mus2[:, :min(N, m.shape[1])] = m[:, :N]
    total = vo * .9 + mus2 * .26 * duck + sfx_bus() * .5
    total /= max(1.0, np.max(np.abs(total)) / .95)
    wav = ROOT / "out" / f".mix-{take}.wav"
    save(wav, total)
    video = pathlib.Path(__import__("os").environ.get("VIDEO", ROOT / "out" / "castor-showreel.mp4"))
    out = ROOT / "out" / (__import__("os").environ.get("PREFIX", "castor-showreel-") + f"{take}.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-i", str(wav),
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-shortest", str(out)], check=True)
    wav.unlink()
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    if sys.argv[1:2] == ["music"]:
        music()
    elif sys.argv[1:2] == ["mix"]:
        for take in sys.argv[2:]:
            mix(take)
    else:
        sys.exit(__doc__)
