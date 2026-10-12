"""Procedural sound design for the ISOFINITI showreel (15.0 s, 120 BPM, D minor).
Every cue is placed on the same timestamps the visuals use in src/main.js.
Writes out/isofiniti-showreel-audio.wav (48 kHz / 24-bit stereo)."""
import numpy as np, wave, os

SR, DUR = 48000, 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
REV_L = np.zeros(N); REV_R = np.zeros(N)  # reverb send bus


def t_(d): return np.arange(int(SR * d)) / SR


def place(sig, at, gain=1.0, pan=0.0, rev=0.0):
    i = int(at * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(s)] += s * lg; R[i:i + len(s)] += s * rg
    if rev:
        REV_L[i:i + len(s)] += s * lg * rev; REV_R[i:i + len(s)] += s * rg * rev


def env(n, a=0.002, d=0.2, curve=4.0):
    tt = np.arange(n) / SR
    att = np.clip(tt / max(a, 1e-5), 0, 1)
    return att * np.exp(-curve * np.maximum(tt - a, 0) / d)


def onepole_lp(x, fc):
    """time-varying one-pole low-pass; fc may be array."""
    fc = np.broadcast_to(fc, x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); z = 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z; y[i] = z
    return y


def hp(x, fc): return x - onepole_lp(x, fc)


def noise(d): return rng.standard_normal(int(SR * d))


# ── instruments ──────────────────────────────────────────────────────────
def kick(d=0.45, f0=140, f1=42):
    tt = t_(d); f = f1 + (f0 - f1) * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(len(tt), 0.001, 0.32, 3.2)
    click = hp(noise(d), 3000) * env(len(tt), 0.0005, 0.006, 5) * 0.4
    return np.tanh((body + click) * 1.6)


def sub_boom(d=2.2, f0=70, f1=30):
    tt = t_(d); f = f1 + (f0 - f1) * np.exp(-tt * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 1.4, 3)
    return np.tanh(s * 1.8)


def hat(d=0.06, open_=False):
    n = hp(hp(noise(d), 6000), 6000)
    return n * env(len(n), 0.0005, d * (0.9 if open_ else 0.5), 4)


def clap(d=0.25):
    n = hp(onepole_lp(noise(d), 4000), 900)
    e = np.zeros(len(n))
    for k, off in enumerate([0, 0.011, 0.023]):
        i = int(off * SR); e[i:] += env(len(n) - i, 0.0005, 0.02 if k < 2 else 0.16, 4)
    return n * e


def blip(f=2200, d=0.05, g=1.0):
    tt = t_(d); return np.sin(2 * np.pi * f * tt) * env(len(tt), 0.001, d * 0.6, 5) * g


def tick(d=0.012):
    n = hp(noise(d), 4500); return n * env(len(n), 0.0003, d * 0.5, 5)


def glitch(d=0.16, f=180):
    tt = t_(d)
    sq = np.sign(np.sin(2 * np.pi * f * tt * (1 + 0.5 * np.sin(2 * np.pi * 37 * tt))))
    n = noise(d)
    s = sq * 0.6 + n * 0.5
    s = np.round(s * 4) / 4  # bit-crush
    gate = (np.sin(2 * np.pi * 60 * tt) > -0.2).astype(float)
    return s * gate * env(len(tt), 0.001, d * 0.6, 3)


def whoosh(d=0.6, f0=300, f1=9000, rev=False):
    n = noise(d); tt = t_(d)
    p = tt / d
    fc = f0 * (f1 / f0) ** p
    s = onepole_lp(n, fc); s = hp(s, fc * 0.25)
    e = np.sin(np.pi * p) ** 2
    if rev: e = p ** 3
    return s * e


def shing(d=1.2):
    """metallic blade cut for the red slash"""
    tt = t_(d)
    parts = sum(np.sin(2 * np.pi * f * tt + k) * env(len(tt), 0.0008, d * w, 3)
                for k, (f, w) in enumerate([(2793, .5), (3520, .35), (4186, .3), (5274, .22), (6645, .15)]))
    n = hp(noise(d), 5000) * env(len(tt), 0.0005, 0.08, 4)
    return parts * 0.25 + n * 0.6


def pluck(f, d=0.35):
    tt = t_(d)
    s = sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.3 for h in range(1, 6))
    return onepole_lp(s * env(len(tt), 0.001, d * 0.35, 4), 3500)


def saw(f, tt, det=0.0):
    ph = (f * (1 + det)) * tt
    return 2 * (ph - np.floor(ph + 0.5))


def pad(freqs, d, cutoff=1400):
    tt = t_(d)
    s = sum(saw(f, tt, dt) for f in freqs for dt in (-0.004, 0.0, 0.0045)) / (3 * len(freqs))
    return onepole_lp(onepole_lp(s, cutoff), cutoff)


def add(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out


def midi(m): return 440 * 2 ** ((m - 69) / 12)


# ── score ────────────────────────────────────────────────────────────────
# 0.0–1.5 boot
place(blip(2400, 0.04), 0.0, 0.25, 0.1)
place(blip(2400, 0.04), 0.24, 0.25, 0.1)
place(whoosh(0.5, 200, 7000, rev=True), 0.0, 0.25)
place(shing(1.4), 0.5, 0.55, 0.2, rev=0.5)
place(sub_boom(1.6, 80, 32), 0.5, 0.75)
place(kick(), 0.5, 0.5)
for k, at in enumerate([0.88, 0.93]):  # brackets land
    place(add(tick(0.02), blip(900, 0.03, 0.4)), at, 0.5, -0.8 if k == 0 else 0.8, rev=0.2)
for k in range(16):  # HUD decode chatter
    place(tick(), 0.75 + k * 0.035, 0.12 * (1 - k / 20), np.sin(k * 1.7) * 0.7)

# 1.5–3.0 the problem — glitch hits on the beat
for k, at in enumerate([1.5, 2.0, 2.5]):
    place(kick(0.4, 160, 45), at, 0.85)
    place(glitch(0.18, 140 + k * 40), at, 0.32, (-0.3, 0.3, 0.0)[k], rev=0.15)
    place(clap(0.2), at, 0.35, 0, rev=0.3)
    for q in range(3):
        place(tick(0.008), at + 0.25 + q * 0.06, 0.12, rng.uniform(-0.8, 0.8))
place(whoosh(0.35, 400, 12000, rev=True), 2.65, 0.45)
# 3.0 slash cut → order
place(shing(1.6), 3.0, 0.75, -0.1, rev=0.6)
place(sub_boom(1.8, 75, 30), 3.0, 0.9)
place(kick(), 3.0, 0.8)
for k in range(10):  # cells snapping into the grid
    place(tick(0.01), 3.03 + k * 0.022, 0.18, np.sin(k * 2.3) * 0.8)
# 3.4–5.0 statement: softer pulse, pad enters
for at in [3.5, 4.0, 4.5]: place(kick(0.4, 120, 42), at, 0.45)
place(whoosh(0.5, 300, 4000), 3.4, 0.25)
place(pad([midi(50), midi(57), midi(60), midi(65)], 9.0, 900) * env(int(9 * SR), 1.2, 9, 0.6), 3.45, 0.22, 0, rev=0.4)

# 5.0–8.0 services: driving 120 BPM groove
for b in range(6):
    at = 5.0 + b * 0.5
    place(kick(), at, 0.8)
    place(whoosh(0.18, 2000, 12000), at - 0.04, 0.18, 0.6)
    place(blip(1760 if b % 2 else 1320, 0.06), at, 0.12, 0.5, rev=0.3)
    place(hat(0.05), at + 0.25, 0.3, 0.3)
    place(clap(0.18), at + 0.25, 0.12 if b % 2 == 0 else 0.0, 0)
    for q in range(4): place(hat(0.03), at + q * 0.125, 0.08, -0.3)
bass_notes = [38, 38, 41, 38, 36, 38]
for b in range(12):
    at = 5.0 + b * 0.25
    f = midi(bass_notes[(b // 2) % 6])
    tt = t_(0.24)
    s = onepole_lp(saw(f, tt) + 0.5 * np.sin(2 * np.pi * f / 2 * tt), 500) * env(len(tt), 0.004, 0.2, 2)
    place(s, at, 0.32)
# 7.85 zoom-through → 8.0 world
place(whoosh(0.4, 300, 9000, rev=True), 7.6, 0.5)
place(sub_boom(1.2, 65, 32), 8.0, 0.6)

# 8.0–11.0 process: kick + hats + arp (D minor pentatonic) + bass
arp = [62, 65, 69, 72, 74, 72, 69, 65]
for b in range(24):
    at = 8.0 + b * 0.125
    if b % 4 == 0: place(kick(), at, 0.78)
    if b % 4 == 2: place(hat(0.07, True), at, 0.28, 0.25)
    place(hat(0.025), at, 0.07, -0.4)
    place(pluck(midi(arp[b % 8] + (12 if b >= 16 else 0)), 0.3), at, 0.14, np.sin(b * 0.9) * 0.6, rev=0.35)
for at in [8.75, 9.5, 10.25]: place(clap(0.22), at, 0.3, 0, rev=0.3); place(blip(1320, 0.08), at, 0.1, 0.4, rev=0.4)
for b in range(12):
    at = 8.0 + b * 0.25
    f = midi([38, 38, 41, 43][(b // 3) % 4]); tt = t_(0.24)
    place(onepole_lp(saw(f, tt), 420) * env(len(tt), 0.004, 0.2, 2), at, 0.34)
for k, at in enumerate([8.75, 8.89, 9.03, 9.17, 9.31, 9.45]):  # 3D labels pop
    place(blip(2600 + k * 120, 0.03), at, 0.07, np.sin(k * 1.9) * 0.8, rev=0.3)
place(whoosh(0.5, 3000, 300), 10.5, 0.3)  # city sinks

# 11.0–12.5 Design. Build. Run.
for k, at in enumerate([11.0, 11.5, 12.0]):
    place(kick(0.5, 170, 40), at, 0.95)
    place(clap(0.3), at, 0.4, 0, rev=0.5)
    place(sub_boom(0.8, 60, 35), at, 0.35)
    place(pluck(midi([62, 65, 69][k]) * 2, 0.6), at, 0.18, 0, rev=0.6)
# riser into the logo
d = 2.0; tt = t_(d); p = tt / d
riser = onepole_lp(noise(d), 300 * (40 ** p)) * p ** 2.2
tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (p * 2)) / SR) * p ** 3 * 0.25
place(add(riser, tone) * (1 - np.clip((tt - 1.93) / 0.07, 0, 1)), 11.0, 0.5, 0, rev=0.3)
place(whoosh(0.7, 300, 6000), 12.4, 0.35)  # brackets travel

# 12.55 N draws, 13.0 IMPACT
place(whoosh(0.45, 600, 9000), 12.55, 0.25, -0.2)
place(sub_boom(2.4, 90, 28), 13.0, 1.0)
place(kick(0.6, 180, 38), 13.0, 1.0)
place(shing(2.0), 13.0, 0.85, 0.15, rev=0.8)
place(clap(0.35), 13.0, 0.45, 0, rev=0.7)
chord = [50, 57, 62, 65, 69, 74]
tail = sum(pad([midi(m)], 2.0, 2400) for m in chord) / len(chord)
place(tail * env(len(tail), 0.01, 2.0, 1.6), 13.0, 0.5, 0, rev=0.6)
for k, (c, pos) in enumerate([(133.7, 0), (250, 0), (414.4, 0), (576, 0), (682.4, 0), (953.5, 0), (1063.8, 0), (1174.1, 0)]):
    dd = abs(c - 817.8); at = 13.04 + dd / 683 * 0.36 + 0.08
    place(add(tick(0.012), blip(3000 + dd, 0.02, 0.5)), at, 0.16, (c - 654) / 654 * 0.9, rev=0.3)
for k in range(14): place(tick(), 13.55 + k * 0.035, 0.08, np.sin(k * 1.3) * 0.5)
place(whoosh(0.8, 2000, 14000) * 0.6, 13.8, 0.25, 0, rev=0.5)  # light sweep
place(add(blip(1760, 0.25), blip(2637, 0.25, 0.5)), 14.0, 0.12, 0, rev=0.7)

# ── reverb (FFT convolution with a decorrelated noise IR) ────────────────
def fftconv(x, h):
    n = len(x) + len(h)
    m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[: len(x)]


irn = int(SR * 2.2); it = np.arange(irn) / SR
ir_env = np.exp(-it * 3.1) * (1 - np.exp(-it * 300))
irL = onepole_lp(rng.standard_normal(irn), 6000) * ir_env
irR = onepole_lp(rng.standard_normal(irn), 6000) * ir_env
irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
L += fftconv(REV_L, irL) * 0.55
R += fftconv(REV_R, irR) * 0.55

# ── master: gentle glue, soft clip, fade, normalise to -1 dBFS ───────────
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
fade = np.ones(N); fn = int(0.5 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
mix *= fade[:, None]
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
os.makedirs('out', exist_ok=True)
pcm = (mix * (2 ** 23 - 1)).astype(np.int32)
b = np.zeros((N, 2, 3), np.uint8)
for k in range(3): b[:, :, k] = (pcm >> (8 * k)) & 0xFF
with wave.open('out/isofiniti-showreel-audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b.tobytes())
print('peak dBFS', 20 * np.log10(np.max(np.abs(mix))))
