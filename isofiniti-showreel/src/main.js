// ISOFINITI — 15s showreel. Every pixel is a pure function of time `t` (seconds),
// so the render is frame-exact and reproducible. GSAP supplies the easing curves.
import * as THREE from '../vendor/three.module.min.js';

const gsap = window.gsap;
const W = 1920, H = 1080, FPS = 60, DUR = 15;
const RED = '#D01919', BG = '#0F0F11';

// ── helpers ──────────────────────────────────────────────────────────────
const E = (n) => gsap.parseEase(n);
const ez = {
  eo: E('expo.out'), ei: E('expo.in'), eio: E('expo.inOut'),
  p2o: E('power2.out'), p2io: E('power2.inOut'), p3o: E('power3.out'), p3i: E('power3.in'),
  p3io: E('power3.inOut'), p4o: E('power4.out'), p4io: E('power4.inOut'),
  bo: E('back.out(1.7)'), bo2: E('back.out(1.25)'), sine: E('sine.inOut'),
};
const cl = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const seg = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const $ = (s) => document.querySelector(s);
const el = (tag, cls, parent, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
};
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const css = (e, o) => { for (const k in o) e.style[k] = o[k]; };
const vis = (e, on) => { e.style.display = on ? '' : 'none'; };
const pos = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; };

// Deterministic "decode" scramble used for all mono labels.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_+*<>';
function scramble(str, p, seed, frame) {
  const n = str.length; let out = '';
  for (let i = 0; i < n; i++) {
    const c = str[i];
    if (c === ' ' || c === '·' || c === '—' || c === '/' || c === '.') { out += p > i / n ? c : ' '; continue; }
    const at = i / n;
    if (p <= 0) { out += '\u00a0'; continue; }
    if (p >= at + 0.22 || p >= 1) out += c;
    else if (p >= at) out += GLYPHS[Math.floor(rnd(seed * 97 + i * 13 + Math.floor(frame / 2) * 7.1) * GLYPHS.length)];
    else out += ' ';
  }
  return out;
}
const setText = (e, s) => { if (e.__t !== s) { e.textContent = s; e.__t = s; } };

// Mask-roll used everywhere text swaps: in from below, out through the top.
function roll(t, ts, te, inDur = 0.42, outDur = 0.22, push = false) {
  if (t < ts) return 112;
  let y = 112 * (1 - ez.p4o(seg(t, ts, ts + inDur)));
  if (te != null && t >= te) y = push ? -112 * ez.p4o(seg(t, te, te + inDur)) : -112 * ez.p3i(seg(t, te, te + outDur));
  return y;
}

// ── brand geometry (from the supplied SVGs) ─────────────────────────────
const WM = { // wordmark paths, viewBox 1308×360
  I1: 'M120.141 247.281V112.761H147.311V247.281H120.141Z',
  S: 'M252.516 248.8C243.143 248.8 234.403 247.344 226.296 244.43C218.316 241.517 211.603 236.894 206.156 230.56C200.836 224.227 197.479 216.057 196.086 206.05H223.826C224.966 210.357 227.056 213.84 230.096 216.5C233.136 219.034 236.746 220.87 240.926 222.01C245.233 223.15 249.729 223.72 254.416 223.72C257.963 223.72 261.446 223.277 264.866 222.39C268.286 221.504 271.073 219.984 273.226 217.83C275.506 215.677 276.646 212.764 276.646 209.09C276.646 206.304 276.013 204.024 274.746 202.25C273.606 200.477 271.896 199.084 269.616 198.07C267.463 196.93 264.803 195.917 261.636 195.03C258.976 194.27 256.189 193.637 253.276 193.13C250.489 192.624 247.703 191.99 244.916 191.23C242.256 190.47 239.659 189.584 237.126 188.57C232.313 187.304 227.689 185.784 223.256 184.01C218.823 182.11 214.896 179.767 211.476 176.98C208.056 174.067 205.333 170.457 203.306 166.15C201.406 161.844 200.456 156.65 200.456 150.57C200.456 143.984 201.533 138.41 203.686 133.85C205.966 129.29 208.943 125.554 212.616 122.64C216.416 119.6 220.596 117.257 225.156 115.61C229.843 113.964 234.529 112.824 239.216 112.19C243.903 111.557 248.336 111.24 252.516 111.24C261.256 111.24 269.109 112.76 276.076 115.8C283.043 118.84 288.743 123.4 293.176 129.48C297.609 135.56 300.143 143.224 300.776 152.47H274.366C273.859 148.67 272.466 145.567 270.186 143.16C267.906 140.754 264.993 138.98 261.446 137.84C258.026 136.7 254.163 136.13 249.856 136.13C247.069 136.13 244.346 136.384 241.686 136.89C239.026 137.397 236.619 138.22 234.466 139.36C232.439 140.374 230.793 141.767 229.526 143.54C228.386 145.314 227.816 147.467 227.816 150C227.816 152.534 228.513 154.75 229.906 156.65C231.299 158.424 233.326 160.007 235.986 161.4C238.773 162.667 242.003 163.87 245.676 165.01C249.476 166.277 253.466 167.29 257.646 168.05C261.826 168.81 265.816 169.824 269.616 171.09C274.429 172.357 278.926 173.877 283.106 175.65C287.286 177.297 290.959 179.45 294.126 182.11C297.293 184.644 299.763 187.937 301.536 191.99C303.309 195.917 304.196 200.794 304.196 206.62C304.196 214.347 302.739 220.934 299.826 226.38C297.039 231.7 293.176 236.007 288.236 239.3C283.423 242.594 277.913 245 271.706 246.52C265.499 248.04 259.103 248.8 252.516 248.8Z',
  O: 'M414.14 248.8C400.333 248.8 388.427 245.887 378.42 240.06C368.54 234.234 360.94 226.19 355.62 215.93C350.427 205.544 347.83 193.637 347.83 180.21C347.83 166.53 350.49 154.497 355.81 144.11C361.257 133.724 368.983 125.68 378.99 119.98C388.997 114.154 400.903 111.24 414.71 111.24C428.39 111.24 440.17 114.09 450.05 119.79C459.93 125.49 467.53 133.47 472.85 143.73C478.297 153.99 481.02 165.96 481.02 179.64C481.02 193.067 478.297 205.037 472.85 215.55C467.53 225.937 459.867 234.107 449.86 240.06C439.98 245.887 428.073 248.8 414.14 248.8ZM414.52 223.34C423.64 223.34 431.05 221.25 436.75 217.07C442.45 212.89 446.567 207.507 449.1 200.92C451.76 194.334 453.09 187.43 453.09 180.21C453.09 174.89 452.33 169.634 450.81 164.44C449.417 159.247 447.2 154.56 444.16 150.38C441.12 146.2 437.13 142.907 432.19 140.5C427.25 137.967 421.297 136.7 414.33 136.7C405.337 136.7 397.99 138.79 392.29 142.97C386.59 147.024 382.347 152.344 379.56 158.93C376.9 165.517 375.57 172.547 375.57 180.02C375.57 187.494 376.9 194.524 379.56 201.11C382.347 207.697 386.59 213.08 392.29 217.26C398.117 221.314 405.527 223.34 414.52 223.34Z',
  F: 'M528.176 247.281V112.761H623.936V138.031H555.346V172.801H613.296V197.881H555.346V247.281H528.176Z',
  I2: 'M668.828 247.281V112.761H695.998V247.281H668.828Z',
  I3: 'M939.891 247.281V112.761H967.061V247.281H939.891Z',
  T: 'M1050.04 247.281V138.031H1009V112.761H1118.63V138.031H1077.4V247.281H1050.04Z',
  I4: 'M1160.52 247.281V112.761H1187.69V247.281H1160.52Z',
  N: 'M864.491 245.2L771.151 151.86V245.2H744.891V113.94H771.151L864.491 207.28V113.94H890.741V245.2H864.491Z',
  NR: 'M771.15 245.201H744.9V233.531L864.5 113.931H890.75V125.601L771.15 245.201Z',
};
const LETTERS = [['I1', 133.7], ['S', 250], ['O', 414.4], ['F', 576], ['I2', 682.4], ['I3', 953.5], ['T', 1063.8], ['I4', 1174.1]];
const MARK_N = 'M318.401 345.4L182.391 209.39V345.4H144.141V154.13H182.391L318.401 290.15V154.13H356.661V345.4H318.401Z';
const MARK_NR = 'M182.391 345.4H144.141V328.4L318.411 154.13H356.661V171.13L182.391 345.4Z';
const SLASH_DEG = -Math.atan2(191.27, 212.27) * 180 / Math.PI; // the red cut's exact angle (-42.02°)

// Final logo placement: wordmark scaled by LS, content centre placed at (LX, LY).
const LS = 1.15, LX = 960, LY = 490, VCX = 653.76, VCY = 179.8;
const toScreen = (vx, vy) => [LX + (vx - VCX) * LS, LY + (vy - VCY) * LS];
const LOGO_BK = {
  tl: { ...xy(toScreen(49, 43)), L: 97.52 * LS, T: 26.2 * LS },
  br: { ...xy(toScreen(1258.52, 316.63)), L: 97.41 * LS, T: 26.2 * LS },
};
function xy(a) { return { x: a[0], y: a[1] }; }

// ── global FX ────────────────────────────────────────────────────────────
const IMPACTS = [[0.5, 6], [1.5, 5], [2.0, 5], [2.5, 8], [3.0, 12], [8.0, 4], [11.0, 5], [11.5, 5], [12.0, 6], [13.0, 16]];
const FLASHES = [[0.5, 0.12], [3.0, 0.16], [13.0, 0.2]];
const world = $('#world'), flash = $('#flash'), grain = $('#grain');
const gctx = grain.getContext('2d');
const gimg = gctx.createImageData(960, 540);
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function fx(t, f) {
  let sx = 0, sy = 0;
  for (const [ti, amp] of IMPACTS) {
    if (t < ti || t > ti + 0.35) continue;
    const a = amp * Math.pow(1 - seg(t, ti, ti + 0.35), 2);
    sx += (rnd(f * 1.37 + ti) - 0.5) * 2 * a; sy += (rnd(f * 2.11 + ti * 3) - 0.5) * 2 * a;
  }
  world.style.transform = `translate3d(${sx.toFixed(2)}px,${sy.toFixed(2)}px,0)`;
  let fl = 0;
  for (const [ti, a] of FLASHES) if (t >= ti) fl = Math.max(fl, a * (1 - ez.eo(seg(t, ti, ti + 0.3))));
  flash.style.opacity = fl.toFixed(3);
  // film grain — seeded per frame
  const r = mulberry(f * 7919 + 13), d = gimg.data;
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 18; }
  gctx.putImageData(gimg, 0, 0);
}

// ── grid ─────────────────────────────────────────────────────────────────
const grid = $('#grid');
function updGrid(t) {
  let o = ez.p2o(seg(t, 1.0, 1.5));
  o *= lerp(1, 0.35, seg(t, 7.9, 8.3)) / lerp(1, 0.35, seg(t, 10.8, 11.2));
  o *= 1 - seg(t, 12.3, 12.8);
  grid.style.opacity = o.toFixed(3);
}

// ── slash + cursor ───────────────────────────────────────────────────────
const slash = $('#slash'), cursor = $('#cursor');
function placeSlash(cx, cy, sx, sy, o, thick = 14) {
  css(slash, { height: thick + 'px', opacity: o, visibility: o > 0.001 && sx > 0.001 ? 'visible' : 'hidden',
    transform: `translate(${cx - 1400}px,${cy - thick / 2}px) rotate(${SLASH_DEG}deg) scale(${sx},${sy})` });
}
function updSlash(t, f) {
  // cursor blink at boot
  const blink = t < 0.12 || (t >= 0.24 && t < 0.5);
  vis(cursor, blink);
  if (t >= 0.5 && t < 1.45) {
    const sx = ez.eo(seg(t, 0.5, 0.85)), sy = 1 - ez.p3i(seg(t, 1.0, 1.4));
    placeSlash(960, 540, sx, sy, 1, 14);
  } else if (t >= 3.0 && t < 3.4) {
    placeSlash(960, 540, ez.eo(seg(t, 3.0, 3.12)), 1 - ez.p3i(seg(t, 3.14, 3.36)), 1, 22);
  } else if (t >= 13.0 && t < 13.6) {
    const [cx, cy] = toScreen(817.8, 179.6);
    placeSlash(cx, cy, ez.eo(seg(t, 13.0, 13.16)), 1 - ez.p3i(seg(t, 13.12, 13.55)), 0.9, 7);
  } else placeSlash(0, 0, 0, 0, 0);
}

// ── HUD: brand brackets + labels ─────────────────────────────────────────
const hud = $('#hud');
function mkBracket(corner) {
  const b = el('div', 'bk', hud); b.h = el('i', '', b); b.v = el('i', '', b); b.corner = corner; return b;
}
function setBracket(b, x, y, L, T, o = 1) {
  if (b.corner === 'tl') {
    css(b.h, { left: x + 'px', top: y + 'px', width: L + 'px', height: T + 'px' });
    css(b.v, { left: x + 'px', top: y + 'px', width: T + 'px', height: L + 'px' });
  } else {
    css(b.h, { left: x - L + 'px', top: y - T + 'px', width: L + 'px', height: T + 'px' });
    css(b.v, { left: x - T + 'px', top: y - L + 'px', width: T + 'px', height: L + 'px' });
  }
  b.style.opacity = o;
}
const bkTL = mkBracket('tl'), bkBR = mkBracket('br');
const hl = {
  tl: el('div', 'hud-lbl mono', hud), tr: el('div', 'hud-lbl mono', hud),
  bl: el('div', 'hud-lbl mono', hud), br: el('div', 'hud-lbl mono', hud),
};
css(hl.tl, { left: '100px', top: '96px' });
css(hl.tr, { right: '64px', top: '64px', textAlign: 'right' });
css(hl.bl, { left: '64px', bottom: '64px' });
css(hl.br, { right: '100px', bottom: '96px', textAlign: 'right' });
const recDot = el('span', '', null, '●'); recDot.style.color = RED;
const trTxt = el('span', '', null);
hl.tr.append(recDot, trTxt);
const SCENES = [[0.6, 'SYS_BOOT'], [1.5, '01 — THE PROBLEM'], [3.4, '02 — WHAT WE DO'], [5.0, '03 — SERVICES'], [8.0, '04 — PROCESS'], [11.0, '05 — PHILOSOPHY']];
const tc = (f) => { const s = Math.floor(f / FPS), ff = f % FPS; return `00:00:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`; };
function updHud(t, f) {
  const inP = ez.eo(seg(t, 0.55, 1.2));
  const outP = ez.p4io(seg(t, 12.45, 13.15));
  const tl0 = { x: lerp(-140, 64, inP), y: lerp(-140, 64, inP), L: 72, T: 7 };
  const br0 = { x: lerp(W + 140, W - 64, inP), y: lerp(H + 140, H - 64, inP), L: 72, T: 7 };
  const mix = (a, b) => ({ x: lerp(a.x, b.x, outP), y: lerp(a.y, b.y, outP), L: lerp(a.L, b.L, outP), T: lerp(a.T, b.T, outP) });
  const a = mix(tl0, LOGO_BK.tl), b = mix(br0, LOGO_BK.br);
  const on = t >= 0.55;
  vis(bkTL, on); vis(bkBR, on);
  setBracket(bkTL, a.x, a.y, a.L, a.T); setBracket(bkBR, b.x, b.y, b.L, b.T);

  const lo = seg(t, 0.75, 0.9) * (1 - seg(t, 12.25, 12.45));
  for (const k in hl) hl[k].style.opacity = lo;
  setText(hl.tl, scramble('ISOFINITI / SHOWREEL 2026', seg(t, 0.75, 1.3), 1, f));
  setText(trTxt, scramble('  REC  ' + tc(f), seg(t, 0.8, 1.25), 2, f));
  recDot.style.opacity = (Math.floor(t * 2) % 2 === 0 || t < 1.5) ? 1 : 0.15;
  setText(hl.br, scramble('ISOFINITI.COM', seg(t, 0.85, 1.4), 3, f));
  let cur = SCENES[0], k = 0;
  SCENES.forEach((s, i) => { if (t >= s[0]) { cur = s; k = i; } });
  setText(hl.bl, scramble(cur[1], seg(t, cur[0], cur[0] + 0.35), 10 + k, f));
}

// ── SCENE 1: the problem ─────────────────────────────────────────────────
const s1 = $('#s1');
const sheet = el('div', '', s1); sheet.id = 'sheet';
const COLS = 12, ROWS = 8;
const CHAOS = ['#REF!', '#N/A', '=SUM(?', 'TBD', '12,4??', 'v3_FINAL', '???', 'ERR', '#DIV/0!', '—', 'copy(2)', 'old_data', '#VALUE!', '=VLOOKUP(', '14,880', '9,302', 'null', 'FIX ME', 'manual', 'x_x'];
const CLEAN = ['12,480', '9,302', '4,117', '38,920', '1,204', '7,861', '22,315', '640', '5,093', '18,447', '3,372', '11,006'];
const cells = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const i = r * COLS + c, e = el('div', 'cell', sheet);
  e.bx = c * 150; e.by = r * 64; e.i = i; e.hd = r === 0;
  if (e.hd) { e.classList.add('hd'); e.textContent = String.fromCharCode(65 + c); }
  cells.push(e);
}
const sel = el('div', '', sheet); sel.id = 'sel';
const WORDS = [
  { s: 'SLOW', t0: 1.5, t1: 2.0 }, { s: 'MANUAL', t0: 2.0, t1: 2.5 }, { s: 'DISCONNECTED', t0: 2.5, t1: 3.0 },
];
WORDS.forEach((w, i) => {
  w.el = el('div', 'word', s1, `${w.s}<span class="r">.</span>`);
  w.gh = el('div', 'ghost', w.el, `${w.s}.`);
  w.k = el('div', 'mono abs', s1); css(w.k, { left: '0', width: '1920px', top: '392px', textAlign: 'center', fontSize: '16px', color: '#8A8A93' });
  w.k.textContent = `[ PROBLEM 0${i + 1} / 03 ]`;
});
function updS1(t, f) {
  const on = t >= 1.2 && t < 3.75; vis(s1, on); if (!on) return;
  const chaos = t < 3.0 ? lerp(0.55, 1.2, seg(t, 1.4, 3.0)) : 1.2 * (1 - ez.eo(seg(t, 3.0, 3.45)));
  const fq = Math.floor(f / 3);
  sheet.style.opacity = t < 3.0 ? 0.55 : lerp(0.55, 1, seg(t, 3.0, 3.15));
  for (const c of cells) {
    const i = c.i;
    const dx = ((rnd(i * 3 + 1) - 0.5) * 140 + (rnd(i * 31 + fq) - 0.5) * 16) * chaos;
    const dy = ((rnd(i * 3 + 2) - 0.5) * 100 + (rnd(i * 17 + fq) - 0.5) * 12) * chaos;
    const rot = (rnd(i * 3 + 3) - 0.5) * 16 * chaos;
    const d = Math.hypot(c.bx + 75 - 900, c.by + 32 - 256) / 950;
    const ex = ez.p3i(seg(t, 3.26 + d * 0.16, 3.42 + d * 0.16));
    const a0 = 1.25 + rnd(i * 5) * 0.3;
    let o = seg(t, a0, a0 + 0.08);
    if (o > 0 && o < 1) o = f % 2 ? 1 : 0.2;
    c.style.opacity = (o * (1 - ex)).toFixed(3);
    c.style.transform = `translate(${c.bx + dx}px,${c.by + dy}px) rotate(${rot}deg) scale(${1 - ex})`;
    if (!c.hd) {
      let txt, cls = '';
      if (t < 3.05) {
        const k = rnd(i) > 0.55 ? Math.floor(rnd(i * 7 + Math.floor(f / 6)) * CHAOS.length) : Math.floor(rnd(i * 7) * CHAOS.length);
        txt = CHAOS[k]; if (/[#?!]|ERR|null/.test(txt)) cls = 'err';
      } else {
        txt = (i % 7 === 3) ? '✓ SYNCED' : CLEAN[i % CLEAN.length];
        if (i % 7 === 3) cls = 'ok';
      }
      if (c.__t !== txt) { c.textContent = txt; c.__t = txt; c.className = 'cell ' + cls; }
    }
  }
  // selection sweep once order lands
  const sp = ez.eo(seg(t, 3.08, 3.3)), sx = ez.p3i(seg(t, 3.3, 3.44));
  vis(sel, t >= 3.12 && sx < 1);
  css(sel, { left: 300 + 'px', top: 128 + 'px', width: 150 + sp * 1050 + 'px', height: 64 + sp * 256 + 'px', opacity: 1 - sx });
  // kinetic words
  for (const w of WORDS) {
    const active = t >= w.t0 && t < w.t1; vis(w.el, active); vis(w.k, active);
    if (!active) continue;
    const u = t - w.t0, glitch = u < 0.1;
    const jx = glitch ? (rnd(f * 3.3) - 0.5) * 50 : 0, sk = glitch ? (rnd(f * 5.1) - 0.5) * 18 : 0;
    const sc = lerp(1.1, 1, ez.p3o(seg(u, 0, 0.5)));
    w.el.style.transform = `translateX(${jx}px) skewX(${sk}deg) scale(${sc})`;
    w.gh.style.opacity = glitch ? 0.9 : 0;
    w.gh.style.transform = `translateX(${glitch ? 22 : 0}px)`;
    const outU = w.t1 - t;
    if (outU < 0.07) { const a = rnd(f * 9.7) * 60, b = rnd(f * 4.3) * 40; w.el.style.clipPath = `inset(${a}% 0 ${b}% 0)`; }
    else w.el.style.clipPath = 'none';
    setText(w.k, scramble(w.k.__src || (w.k.__src = w.k.textContent), seg(u, 0, 0.2), 20, f));
  }
}

// ── SCENE 2: what we do ──────────────────────────────────────────────────
const s2 = $('#s2');
const s2k = el('div', 'abs', s2); css(s2k, { left: '160px', top: '292px', display: 'flex', alignItems: 'center', gap: '16px' });
const s2dash = el('div', '', s2k); css(s2dash, { width: '28px', height: '3px', background: RED });
const s2kt = el('div', 'mono', s2k); css(s2kt, { fontSize: '16px', color: '#8A8A93' });
const s2hair = el('div', 'abs', s2); css(s2hair, { left: '420px', top: '300px', width: '1340px', height: '1px', background: '#2A2A2E', transformOrigin: '0 50%' });
const mkLine = (parent, x, y, w, hgt, html, cls) => {
  const m = el('div', 'mask', parent); css(m, { left: x + 'px', top: y + 'px', width: w + 'px', height: hgt + 'px' });
  const i = el('div', cls, m, html); return i;
};
const s2l1 = mkLine(s2, 160, 340, 1600, 172, 'Custom software', 'big');
const s2l2 = mkLine(s2, 160, 512, 1600, 172, '<span class="muted">&amp;</span> AI automation<span class="r">.</span>', 'big');
const SUB = 'For businesses that have outgrown spreadsheets and disconnected tools.';
const s2sub = el('div', 'abs', s2); css(s2sub, { left: '1180px', top: '742px', width: '580px', font: '400 30px/1.35 IDisp', color: '#8A8A93', letterSpacing: '-.01em' });
const subWords = SUB.split(' ').map((w) => { const s = el('span', '', s2sub, w + ' '); s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; return s; });
const s2meta = el('div', 'mono abs', s2); css(s2meta, { left: '1180px', top: '700px', fontSize: '13px', color: '#55555C' });
function updS2(t, f) {
  const on = t >= 3.38 && t < 5.1; vis(s2, on); if (!on) return;
  const out = seg(t, 4.8, 4.98);
  setText(s2kt, scramble('WHAT WE DO', seg(t, 3.42, 3.75), 30, f));
  s2k.style.opacity = 1 - out;
  s2dash.style.transform = `scaleX(${ez.eo(seg(t, 3.4, 3.7))})`;
  s2hair.style.transformOrigin = t < 4.7 ? '0 50%' : '100% 50%';
  s2hair.style.transform = `scaleX(${ez.eo(seg(t, 3.5, 4.2)) * (1 - ez.p3i(seg(t, 4.75, 4.98)))})`;
  s2l1.style.transform = `translateY(${roll(t, 3.45, 4.8, 0.7, 0.2)}%)`;
  s2l2.style.transform = `translateY(${roll(t, 3.55, 4.84, 0.7, 0.18)}%)`;
  subWords.forEach((w, i) => {
    const p = ez.p3o(seg(t, 3.9 + i * 0.03, 4.3 + i * 0.03));
    w.style.opacity = p * (1 - out); w.style.transform = `translateY(${(1 - p) * 18}px)`;
  });
  s2meta.style.opacity = 1 - out;
  setText(s2meta, scramble('[ DESIGN · BUILD · RUN ]', seg(t, 3.85, 4.2), 31, f));
}

// ── SCENE 3: services ────────────────────────────────────────────────────
const s3 = $('#s3');
const SERVICES = [
  ['Custom Software', 'Built around how your business actually works.', 'CUSTOM_SOFTWARE'],
  ['AI Automation', 'Workflows that run themselves.', 'AI_AUTOMATION'],
  ['Integrations', 'Your tools, finally talking to each other.', 'INTEGRATIONS'],
  ['Mobile Apps', 'iOS & Android, built to ship.', 'MOBILE_APPS'],
  ['Modernization', 'Legacy systems, rebuilt for what’s next.', 'MODERNIZATION'],
  ['Private AI', 'On-prem models. Your data stays yours.', 'PRIVATE_AI'],
];
const SV_T0 = 5.0, SV_D = 0.5;
const svT = (i) => SV_T0 + i * SV_D;
const giantM = el('div', 'mask', s3); css(giantM, { left: '120px', top: '96px', width: '900px', height: '560px' });
const idxM = el('div', 'mask', s3); css(idxM, { left: '160px', top: '366px', width: '200px', height: '30px' });
const nameM = el('div', 'mask', s3); css(nameM, { left: '154px', top: '404px', width: '960px', height: '146px' });
const descM = el('div', 'mask', s3); css(descM, { left: '160px', top: '566px', width: '900px', height: '44px' });
const svEls = SERVICES.map((s, i) => ({
  g: el('div', '', giantM, String(i + 1).padStart(2, '0')),
  i: el('div', 'mono', idxM, `<span class="r">${String(i + 1).padStart(2, '0')}</span><span style="color:#55555C"> / 06</span>`),
  n: el('div', 'big', nameM, s[0]),
  d: el('div', '', descM, s[1]),
}));
svEls.forEach((e) => {
  css(e.g, { font: '800 560px/1 IDisp', letterSpacing: '-.06em', color: 'transparent', webkitTextStroke: '1.5px rgba(255,255,255,.075)' });
  css(e.i, { fontSize: '20px', lineHeight: '30px' });
  css(e.n, { fontSize: '128px', lineHeight: '146px' });
  css(e.d, { font: '400 30px/44px IDisp', color: '#8A8A93', letterSpacing: '-.01em' });
});
const segWrap = el('div', 'abs', s3); css(segWrap, { left: '160px', top: '660px' });
const segs = SERVICES.map((_, i) => { const s = el('div', 'seg', segWrap); s.style.left = i * 80 + 'px'; s.f = el('i', '', s); return s; });
const panel = el('div', '', s3); panel.id = 'panel';
const pbox = el('div', '', panel); pbox.id = 'pbox';
const pdots = el('div', '', panel); pdots.id = 'pdots';
const pvWrap = el('div', 'full', panel);
const pedge = el('div', '', panel); pedge.id = 'pedge';
const pLbl = el('div', 'mono abs', panel); css(pLbl, { left: '24px', top: '22px', fontSize: '12px', color: '#6A6A73' });
const pLbl2 = el('div', 'mono abs', panel); css(pLbl2, { right: '24px', bottom: '22px', left: 'auto', top: 'auto', fontSize: '12px', color: '#55555C' });
const pbk = { tl: el('div', 'bk', panel), br: el('div', 'bk', panel) };
for (const k in pbk) { pbk[k].h = el('i', '', pbk[k]); pbk[k].v = el('i', '', pbk[k]); pbk[k].corner = k; }

// service visuals (SVG 640×640, each driven by local time u)
const VIS = [];
function mkVis(build) {
  const d = el('div', 'pv', pvWrap); const s = sv('svg', { width: 640, height: 640, viewBox: '0 0 640 640' }, d);
  const v = build(s); v.div = d; VIS.push(v); return v;
}
const ST = { stroke: '#FFFFFF', fill: 'none', 'stroke-width': 2 };
// 01 custom software — editor typing
mkVis((s) => {
  sv('rect', { x: 70, y: 120, width: 500, height: 400, rx: 12, fill: '#0F0F11', stroke: '#2A2A2E', 'stroke-width': 1.5 }, s);
  sv('line', { x1: 70, y1: 160, x2: 570, y2: 160, stroke: '#2A2A2E', 'stroke-width': 1.5 }, s);
  ['#55555C', '#55555C', '#D01919'].forEach((c, i) => sv('circle', { cx: 96 + i * 20, cy: 140, r: 5, fill: c }, s));
  const tab = sv('text', { x: 300, y: 145, fill: '#8A8A93', 'font-family': 'JBM', 'font-size': 13, 'text-anchor': 'middle' }, s); tab.textContent = 'workflow.ts';
  const L = [[0, [60, 90, 40]], [1, [50, 120]], [2, [80, 60, 100]], [2, [140, 40]], [1, [30]], [1, [70, 110, 50]], [2, [90, 70]], [2, [60, 160]], [1, [30]], [0, [20]]];
  const lines = L.map(([ind, ws], li) => {
    const y = 192 + li * 30;
    const num = sv('text', { x: 100, y: y + 5, fill: '#3A3A42', 'font-family': 'JBM', 'font-size': 12, 'text-anchor': 'end' }, s); num.textContent = li + 1;
    let x = 124 + ind * 28;
    const bars = ws.map((w, k) => {
      const col = (li * 3 + k) % 5 === 1 ? '#D01919' : (k === 0 ? '#FFFFFF' : '#5A5A63');
      const r = sv('rect', { x, y: -5 + y, height: 9, rx: 4.5, width: 0, fill: col, opacity: k === 0 ? 0.9 : 1 }, s);
      r.w = w; x += w + 12; return r;
    });
    return { bars, num };
  });
  const cur = sv('rect', { width: 9, height: 20, fill: '#D01919' }, s);
  const chip = sv('g', {}, s);
  sv('rect', { x: 0, y: 0, width: 170, height: 34, rx: 17, fill: '#141417', stroke: '#2A2A2E' }, chip);
  sv('circle', { cx: 20, cy: 17, r: 4.5, fill: '#D01919' }, chip);
  const ct = sv('text', { x: 34, y: 22, fill: '#FFFFFF', 'font-family': 'JBM', 'font-size': 12, 'letter-spacing': 1.5 }, chip); ct.textContent = 'BUILD PASSED';
  return {
    update(u, f) {
      let lastX = 124, lastY = 192;
      lines.forEach((l, li) => {
        const p = ez.p3o(seg(u, li * 0.028, li * 0.028 + 0.12));
        l.num.setAttribute('opacity', p > 0 ? 1 : 0);
        l.bars.forEach((b, k) => {
          const bp = ez.p3o(seg(u, li * 0.028 + k * 0.03, li * 0.028 + k * 0.03 + 0.1));
          b.setAttribute('width', (b.w * bp).toFixed(1));
          if (bp > 0) { lastX = +b.getAttribute('x') + b.w * bp + 8; lastY = 192 + li * 30; }
        });
      });
      cur.setAttribute('x', lastX); cur.setAttribute('y', lastY - 10);
      cur.setAttribute('opacity', Math.floor(f / 8) % 2 ? 0.25 : 1);
      const cp = ez.bo(seg(u, 0.26, 0.42));
      chip.setAttribute('transform', `translate(380,${470 + (1 - cp) * 30})`);
      chip.setAttribute('opacity', cp);
    },
  };
});
// 02 AI automation — node graph with pulses
mkVis((s) => {
  const N = [[120, 190, 'EMAIL'], [120, 320, 'FORMS'], [120, 450, 'CSV'], [320, 320, ''], [520, 190, 'CRM'], [520, 320, 'SLACK'], [520, 450, 'REPORT']];
  const Ed = [[0, 3], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6]];
  const edges = Ed.map(([a, b]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b];
    const mx = (x1 + x2) / 2;
    const p = sv('path', { d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, stroke: '#3A3A42', fill: 'none', 'stroke-width': 2 }, s);
    p.len = p.getTotalLength(); p.setAttribute('stroke-dasharray', p.len); return p;
  });
  const pulses = Ed.map(() => sv('circle', { r: 5, fill: '#D01919' }, s));
  const ring = sv('circle', { cx: 320, cy: 320, r: 66, fill: 'none', stroke: '#D01919', 'stroke-width': 1.5, 'stroke-dasharray': '4 9' }, s);
  const nodes = N.map(([x, y, lab], i) => {
    const g = sv('g', {}, s);
    if (i === 3) {
      sv('circle', { cx: 0, cy: 0, r: 46, fill: '#0F0F11', stroke: '#FFFFFF', 'stroke-width': 2 }, g);
      const tx = sv('text', { x: 0, y: 10, fill: '#FFFFFF', 'font-family': 'IDisp', 'font-weight': 800, 'font-size': 30, 'text-anchor': 'middle' }, g); tx.textContent = 'AI';
    } else {
      sv('circle', { cx: 0, cy: 0, r: 14, fill: '#0F0F11', stroke: '#FFFFFF', 'stroke-width': 2 }, g);
      sv('circle', { cx: 0, cy: 0, r: 4, fill: i > 3 ? '#D01919' : '#FFFFFF' }, g);
      const tx = sv('text', { x: i < 3 ? -24 : 24, y: 4, fill: '#8A8A93', 'font-family': 'JBM', 'font-size': 12, 'letter-spacing': 1.5, 'text-anchor': i < 3 ? 'end' : 'start' }, g); tx.textContent = lab;
    }
    g.x = x; g.y = y; return g;
  });
  return {
    update(u) {
      nodes.forEach((g, i) => {
        const d = i === 3 ? 0 : i < 3 ? 0.06 + i * 0.03 : 0.14 + (i - 4) * 0.03;
        const p = ez.bo(seg(u, d, d + 0.2));
        g.setAttribute('transform', `translate(${g.x},${g.y}) scale(${p})`);
      });
      edges.forEach((e, i) => {
        const p = ez.p3o(seg(u, 0.05 + (i < 3 ? 0 : 0.08), 0.25 + (i < 3 ? 0 : 0.08)));
        e.setAttribute('stroke-dashoffset', (e.len * (1 - p)).toFixed(1));
        const q = ((u * 2.4 + i * 0.37) % 1 + 1) % 1, pt = e.getPointAtLength(e.len * q);
        pulses[i].setAttribute('cx', pt.x); pulses[i].setAttribute('cy', pt.y);
        pulses[i].setAttribute('opacity', u > 0.22 ? 1 : 0);
      });
      ring.setAttribute('transform', `rotate(${u * 160} 320 320)`);
      ring.setAttribute('opacity', ez.p3o(seg(u, 0.1, 0.3)));
    },
  };
});
// 03 integrations — everything routes through the Isofiniti mark
mkVis((s) => {
  const L = [['CRM', 170], ['ERP', 320], ['DB', 470]], R = [['API', 170], ['BI', 320], ['PAY', 470]];
  const curves = [], blocks = [];
  const mkBlock = (x, y, lab) => {
    const g = sv('g', {}, s);
    sv('rect', { x: -48, y: -32, width: 96, height: 64, rx: 10, fill: '#0F0F11', stroke: '#3A3A42', 'stroke-width': 1.5 }, g);
    const t = sv('text', { x: 0, y: 5, fill: '#FFFFFF', 'font-family': 'JBM', 'font-size': 14, 'font-weight': 500, 'letter-spacing': 2, 'text-anchor': 'middle' }, g); t.textContent = lab;
    g.x = x; g.y = y; blocks.push(g); return g;
  };
  L.forEach(([lab, y]) => {
    const p = sv('path', { d: `M148 ${y} C230 ${y} 200 320 260 320`, fill: 'none', stroke: '#3A3A42', 'stroke-width': 2 }, s); curves.push(p);
  });
  R.forEach(([lab, y]) => {
    const p = sv('path', { d: `M380 320 C440 320 410 ${y} 492 ${y}`, fill: 'none', stroke: '#3A3A42', 'stroke-width': 2 }, s); curves.push(p);
  });
  curves.forEach((p) => { p.len = p.getTotalLength(); p.setAttribute('stroke-dasharray', p.len); });
  L.forEach(([lab, y]) => mkBlock(100, y, lab)); R.forEach(([lab, y]) => mkBlock(540, y, lab));
  const hub = sv('g', {}, s);
  sv('rect', { x: -60, y: -60, width: 120, height: 120, rx: 16, fill: '#0F0F11', stroke: '#FFFFFF', 'stroke-width': 2 }, hub);
  const mk = sv('g', { transform: 'scale(0.36) translate(-250.4,-249.8)' }, hub);
  sv('path', { d: MARK_NR, fill: '#D01919' }, mk); sv('path', { d: MARK_N, fill: '#FFFFFF' }, mk);
  const packets = curves.map((_, i) => sv('rect', { width: 8, height: 8, rx: 1, fill: i % 2 ? '#FFFFFF' : '#D01919' }, s));
  return {
    update(u) {
      const hp = ez.bo(seg(u, 0, 0.2));
      hub.setAttribute('transform', `translate(320,320) scale(${hp})`);
      blocks.forEach((b, i) => { const p = ez.bo(seg(u, 0.04 + i * 0.025, 0.22 + i * 0.025)); b.setAttribute('transform', `translate(${b.x},${b.y}) scale(${p})`); });
      curves.forEach((c, i) => {
        const p = ez.p3o(seg(u, 0.1 + (i % 3) * 0.03, 0.3 + (i % 3) * 0.03));
        c.setAttribute('stroke-dashoffset', (c.len * (i < 3 ? 1 - p : -(1 - p))).toFixed(1));
        const q = ((u * 2.2 + i * 0.29) % 1), pt = c.getPointAtLength(c.len * q);
        packets[i].setAttribute('x', pt.x - 4); packets[i].setAttribute('y', pt.y - 4);
        packets[i].setAttribute('opacity', u > 0.28 ? 1 : 0);
      });
    },
  };
});
// 04 mobile apps — phone UI assembling
mkVis((s) => {
  const ghost = sv('rect', { x: 250, y: 104, width: 240, height: 470, rx: 38, fill: 'none', stroke: '#2A2A2E', 'stroke-width': 2 }, s);
  const ph = sv('g', {}, s);
  sv('rect', { x: -125, y: -245, width: 250, height: 490, rx: 40, fill: '#0F0F11', stroke: '#FFFFFF', 'stroke-width': 2.5 }, ph);
  sv('rect', { x: -38, y: -230, width: 76, height: 20, rx: 10, fill: '#1C1C21' }, ph);
  const hdr = sv('text', { x: -98, y: -170, fill: '#FFFFFF', 'font-family': 'IDisp', 'font-weight': 700, 'font-size': 24, 'letter-spacing': -0.5 }, ph); hdr.textContent = 'Overview';
  const cards = [];
  for (let i = 0; i < 3; i++) {
    const g = sv('g', {}, ph);
    sv('rect', { x: -100, y: 0, width: 200, height: i === 0 ? 130 : 62, rx: 14, fill: '#1C1C21' }, g);
    g.y0 = -148 + (i === 0 ? 0 : 144 + (i - 1) * 74); cards.push(g);
  }
  const bars = [];
  for (let i = 0; i < 7; i++) bars.push(sv('rect', { x: -80 + i * 24, width: 12, rx: 3, fill: i === 4 ? '#D01919' : '#5A5A63' }, cards[0]));
  const lbl = sv('text', { x: -82, y: 26, fill: '#8A8A93', 'font-family': 'JBM', 'font-size': 10, 'letter-spacing': 1 }, cards[0]); lbl.textContent = 'REVENUE  +24%';
  sv('rect', { x: -82, y: 18, width: 90, height: 8, rx: 4, fill: '#5A5A63' }, cards[1]);
  sv('rect', { x: -82, y: 34, width: 60, height: 8, rx: 4, fill: '#3A3A42' }, cards[1]);
  const tg = sv('rect', { x: 34, y: 18, width: 48, height: 26, rx: 13, fill: '#3A3A42' }, cards[1]);
  const knob = sv('circle', { cy: 31, r: 10, fill: '#FFFFFF' }, cards[1]);
  sv('rect', { x: -82, y: 18, width: 120, height: 8, rx: 4, fill: '#5A5A63' }, cards[2]);
  sv('rect', { x: -82, y: 34, width: 80, height: 8, rx: 4, fill: '#3A3A42' }, cards[2]);
  const tabs = [0, 1, 2, 3].map((i) => sv('circle', { cx: -66 + i * 44, cy: 208, r: 5, fill: i === 0 ? '#D01919' : '#55555C' }, ph));
  return {
    update(u) {
      const pp = ez.eo(seg(u, 0, 0.3));
      ph.setAttribute('transform', `translate(${lerp(300, 300, pp)},${lerp(380, 332, pp)}) rotate(${lerp(8, -4, pp)})`);
      ph.setAttribute('opacity', seg(u, 0, 0.06));
      ghost.setAttribute('transform', `rotate(${lerp(0, 8, pp)} 370 340) translate(${lerp(0, 34, pp)},0)`);
      ghost.setAttribute('opacity', pp * 0.9);
      cards.forEach((g, i) => { const p = ez.p4o(seg(u, 0.08 + i * 0.05, 0.3 + i * 0.05)); g.setAttribute('transform', `translate(0,${g.y0 + (1 - p) * 60})`); g.setAttribute('opacity', p); });
      bars.forEach((b, i) => { const hh = (18 + rnd(i * 3.3) * 52 + (i === 4 ? 30 : 0)) * ez.p3o(seg(u, 0.18 + i * 0.02, 0.36 + i * 0.02)); b.setAttribute('y', 110 - hh); b.setAttribute('height', hh); });
      const tp = ez.p3o(seg(u, 0.3, 0.4));
      knob.setAttribute('cx', lerp(47, 69, tp)); tg.setAttribute('fill', tp > 0.5 ? '#D01919' : '#3A3A42');
    },
  };
});
// 05 modernization — legacy pixels migrate into a clean isometric cube
mkVis((s) => {
  const px = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    if (rnd(r * 10 + c + 400) < 0.18) continue;
    const g = ['#2A2A2E', '#3A3A42', '#55555C', '#8A8A93'][Math.floor(rnd(r * 10 + c) * 4)];
    const e = sv('rect', { width: 14, height: 14, fill: g }, s); e.x0 = 70 + c * 16; e.y0 = 240 + r * 16; e.k = r * 10 + c; px.push(e);
  }
  const a = sv('text', { x: 320, y: 330, fill: '#55555C', 'font-family': 'JBM', 'font-size': 26, 'text-anchor': 'middle' }, s); a.textContent = '→';
  const cx = 470, cy = 320, R = 92, dx = R * Math.cos(Math.PI / 6), dy = R / 2;
  const top = sv('path', { d: `M${cx} ${cy - R} L${cx + dx} ${cy - R + dy} L${cx} ${cy} L${cx - dx} ${cy - R + dy} Z`, fill: 'rgba(208,25,25,.18)', stroke: '#D01919', 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
  const left = sv('path', { d: `M${cx - dx} ${cy - R + dy} L${cx} ${cy} L${cx} ${cy + R} L${cx - dx} ${cy + dy} Z`, fill: 'rgba(255,255,255,.06)', ...ST, 'stroke-linejoin': 'round' }, s);
  const right = sv('path', { d: `M${cx + dx} ${cy - R + dy} L${cx} ${cy} L${cx} ${cy + R} L${cx + dx} ${cy + dy} Z`, fill: 'rgba(255,255,255,.02)', ...ST, 'stroke-linejoin': 'round' }, s);
  const faces = [left, right, top]; faces.forEach((p) => { p.len = p.getTotalLength(); p.setAttribute('stroke-dasharray', p.len); });
  const t1 = sv('text', { x: 150, y: 440, fill: '#55555C', 'font-family': 'JBM', 'font-size': 12, 'letter-spacing': 2, 'text-anchor': 'middle' }, s); t1.textContent = 'LEGACY / 1998';
  const t2 = sv('text', { x: 470, y: 450, fill: '#FFFFFF', 'font-family': 'JBM', 'font-size': 12, 'letter-spacing': 2, 'text-anchor': 'middle' }, s); t2.textContent = 'MODERN / 2026';
  return {
    update(u, f) {
      px.forEach((e) => {
        const d0 = 0.06 + rnd(e.k * 2.7) * 0.14, p = ez.p3io(seg(u, d0, d0 + 0.22));
        const fl = rnd(e.k + Math.floor(f / 4)) > 0.85 ? 0.3 : 1;
        e.setAttribute('x', lerp(e.x0, cx - 7, p)); e.setAttribute('y', lerp(e.y0, cy - 7, p));
        e.setAttribute('opacity', (1 - p) * fl * seg(u, 0, 0.05));
        e.setAttribute('transform', `rotate(${p * 45} ${lerp(e.x0, cx, p) + 7} ${lerp(e.y0, cy, p) + 7})`);
      });
      faces.forEach((p, i) => { const q = ez.p3o(seg(u, 0.12 + i * 0.06, 0.34 + i * 0.06)); p.setAttribute('stroke-dashoffset', p.len * (1 - q)); p.setAttribute('fill-opacity', q); });
      a.setAttribute('opacity', seg(u, 0.05, 0.12)); a.setAttribute('x', 312 + ez.sine(seg(u % 0.3, 0, 0.3)) * 16);
      t1.setAttribute('opacity', seg(u, 0.02, 0.1)); t2.setAttribute('opacity', seg(u, 0.3, 0.4));
    },
  };
});
// 06 private AI — shield, lock, scanning rings
mkVis((s) => {
  const defs = sv('defs', {}, s);
  const cp = sv('clipPath', { id: 'shieldClip' }, defs);
  const SH = 'M320 150 L450 196 L450 320 C450 400 392 456 320 488 C248 456 190 400 190 320 L190 196 Z';
  sv('path', { d: SH }, cp);
  const r1 = sv('circle', { cx: 320, cy: 320, r: 236, fill: 'none', stroke: '#3A3A42', 'stroke-width': 1.5, 'stroke-dasharray': '2 10' }, s);
  const r2 = sv('circle', { cx: 320, cy: 320, r: 262, fill: 'none', stroke: '#D01919', 'stroke-width': 1.5, 'stroke-dasharray': '60 500' }, s);
  const sh = sv('path', { d: SH, fill: 'rgba(255,255,255,.03)', stroke: '#FFFFFF', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, s);
  sh.len = sh.getTotalLength(); sh.setAttribute('stroke-dasharray', sh.len);
  const lock = sv('g', {}, s);
  sv('path', { d: 'M-30 -8 V-34 C-30 -54 30 -54 30 -34 V-8', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 8, 'stroke-linecap': 'round' }, lock);
  sv('rect', { x: -46, y: -10, width: 92, height: 74, rx: 10, fill: '#FFFFFF' }, lock);
  sv('circle', { cx: 0, cy: 18, r: 9, fill: '#D01919' }, lock);
  sv('rect', { x: -3.5, y: 20, width: 7, height: 22, rx: 3, fill: '#D01919' }, lock);
  const scan = sv('g', { 'clip-path': 'url(#shieldClip)' }, s);
  const sl = sv('rect', { x: 180, width: 280, height: 2, fill: '#D01919' }, scan);
  const sg = sv('rect', { x: 180, width: 280, height: 40, fill: 'rgba(208,25,25,.12)' }, scan);
  const tx = sv('text', { x: 320, y: 560, fill: '#8A8A93', 'font-family': 'JBM', 'font-size': 12, 'letter-spacing': 2.5, 'text-anchor': 'middle' }, s);
  return {
    update(u, f) {
      const p = ez.p3o(seg(u, 0, 0.28));
      sh.setAttribute('stroke-dashoffset', sh.len * (1 - p));
      const lp = ez.bo(seg(u, 0.12, 0.3));
      lock.setAttribute('transform', `translate(320,${318 + (1 - lp) * 20}) scale(${lp})`);
      r1.setAttribute('transform', `rotate(${u * 60} 320 320)`); r2.setAttribute('transform', `rotate(${-u * 220 - 40} 320 320)`);
      r1.setAttribute('opacity', p); r2.setAttribute('opacity', p);
      const y = lerp(150, 488, ((u - 0.15) * 1.6 % 1 + 1) % 1);
      sl.setAttribute('y', y); sg.setAttribute('y', y - 40); scan.setAttribute('opacity', u > 0.15 ? 1 : 0);
      setText(tx, scramble('ON-PREM · ENCRYPTED · ISOLATED', seg(u, 0.1, 0.4), 60, f));
    },
  };
});
function updS3(t, f) {
  const on = t >= 4.9 && t < 8.35; vis(s3, on); if (!on) return;
  const zoom = ez.p4io(seg(t, 7.82, 8.15));
  // left column
  svEls.forEach((e, i) => {
    const last = i === 5, ts = svT(i), te = last ? 7.82 : svT(i + 1);
    e.n.style.transform = `translateY(${roll(t, ts, te, 0.42, 0.2, !last)}%)`;
    e.i.style.transform = `translateY(${roll(t, ts + 0.02, last ? te : te + 0.02, 0.4, 0.2, !last)}%)`;
    e.d.style.transform = `translateY(${roll(t, ts + 0.05, last ? te : te + 0.05, 0.45, 0.2, !last)}%)`;
    e.g.style.transform = `translateY(${roll(t, ts, te, 0.5, 0.24, !last) * 0.35}%)`;
    vis(e.g, t >= ts - 0.01 && t < te + 0.3);
  });
  segs.forEach((s, i) => {
    const ts = svT(i);
    const p = ez.p3o(seg(t, ts, ts + 0.45));
    s.f.style.transform = `scaleX(${p})`; s.f.style.background = t >= svT(i + 1) ? 'rgba(255,255,255,.55)' : RED;
  });
  segWrap.style.opacity = 1 - seg(t, 7.82, 7.95);
  // panel
  const pin = ez.eo(seg(t, 4.95, 5.35));
  const sxz = lerp(1, W / 640, zoom), syz = lerp(1, H / 640, zoom);
  const tx = lerp(0, 960 - 1440, zoom), ty = 0;
  pbox.style.transform = `translate(${tx}px,${ty}px) scale(${lerp(0.7, 1, pin) * sxz},${lerp(0.7, 1, pin) * syz})`;
  pbox.style.opacity = pin * (1 - seg(t, 8.05, 8.3));
  pbox.style.background = zoom > 0 ? `rgb(${lerp(20, 15, zoom)},${lerp(20, 15, zoom)},${lerp(23, 17, zoom)})` : '#141417';
  pbox.style.borderColor = `rgba(38,38,42,${1 - zoom})`;
  const contentO = pin * (1 - seg(t, 7.8, 7.92));
  pdots.style.opacity = contentO; pLbl.style.opacity = contentO; pLbl2.style.opacity = contentO;
  // brackets on the panel: fly outward from centre
  const bo = ez.eo(seg(t, 5.0, 5.45));
  setBracket(pbk.tl, lerp(320, -16, bo), lerp(320, -16, bo), 34, 4, bo * (1 - seg(t, 7.8, 7.9)));
  setBracket(pbk.br, lerp(320, 656, bo), lerp(320, 656, bo), 34, 4, bo * (1 - seg(t, 7.8, 7.9)));
  // visuals with left→right wipe
  let cur = 0;
  VIS.forEach((v, i) => {
    const ts = svT(i), u = t - ts;
    const show = t >= ts && (i === 5 ? t < 7.95 : t < svT(i + 1) + 0.2);
    vis(v.div, show);
    if (!show) return;
    cur = i;
    const wp = ez.eo(seg(t, ts, ts + 0.2));
    v.div.style.clipPath = `inset(0 ${(1 - wp) * 100}% 0 0)`;
    v.div.style.opacity = contentO;
    v.update(u, f);
  });
  const ets = svT(cur), ep = ez.eo(seg(t, ets, ets + 0.2));
  vis(pedge, ep > 0 && ep < 0.995 && t < 7.8); pedge.style.left = ep * 640 - 1 + 'px';
  setText(pLbl, scramble(`FIG.0${cur + 1} — ${SERVICES[cur][2]}`, seg(t, svT(cur), svT(cur) + 0.25), 70 + cur, f));
  setText(pLbl2, `T+${(t - SV_T0).toFixed(2)}S`);
}

// ── SCENE 4: isometric system (three.js) ─────────────────────────────────
const s4 = $('#s4');
const glc = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true, preserveDrawingBuffer: true });
const PR = Number(new URLSearchParams(location.search).get('pr') || 2);
renderer.setPixelRatio(PR); renderer.setSize(W, H, false);
renderer.setClearColor(0x000000, 0);
glc.style.width = W + 'px'; glc.style.height = H + 'px';
const scene = new THREE.Scene();
const PPU = 62; // pixels per world unit at zoom 1
const cam = new THREE.OrthographicCamera(-W / 2 / PPU, W / 2 / PPU, H / 2 / PPU, -H / 2 / PPU, -200, 400);
cam.setViewOffset(W, H, -250, -30, W, H);
scene.add(new THREE.HemisphereLight(0xffffff, 0x202024, 1.4));
const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(-4, 10, 6); scene.add(dl);
const dl2 = new THREE.DirectionalLight(0xff3030, 0.35); dl2.position.set(6, 2, -4); scene.add(dl2);
const SP = 1.2, NG = 5;
const boxG = new THREE.BoxGeometry(0.9, 1, 0.9); boxG.translate(0, 0.5, 0);
const edgeG = new THREE.EdgesGeometry(boxG);
const mBase = new THREE.MeshLambertMaterial({ color: 0x1e1e24 });
const mRed = new THREE.MeshLambertMaterial({ color: 0xd01919, emissive: 0x6a0808 });
const eBase = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.26 });
const eRed = new THREE.LineBasicMaterial({ color: 0xff6a6a, transparent: true, opacity: 0.8 });
const REDS = { '0,0': 'AI CORE', '-4,1': 'CRM SYNC', '3,-3': 'ERP BRIDGE', '1,4': 'MOBILE API', '-3,-4': 'PRIVATE LLM', '4,3': 'DATA LAKE' };
const SUBS = { '0,0': 'AGENTS · 24/7', '-4,1': 'REAL-TIME', '3,-3': 'LEGACY → CLOUD', '1,4': 'IOS · ANDROID', '-3,-4': 'ON-PREM', '4,3': 'ENCRYPTED' };
const bldgs = [];
for (let i = -NG; i <= NG; i++) for (let j = -NG; j <= NG; j++) {
  if (Math.abs(i) === 2 || Math.abs(j) === 2) continue; // roads
  const key = `${i},${j}`, isRed = key in REDS;
  if (!isRed && rnd(i * 31 + j * 7 + 5) < 0.1) continue; // plazas
  const d = Math.hypot(i, j);
  let h = 0.25 + Math.pow(rnd(i * 7.3 + j * 1.7 + 3), 2.2) * 2.6 + Math.max(0, 1.8 - d * 0.4);
  if (isRed) h = key === '0,0' ? 4.2 : 1.6 + rnd(i + j * 3) * 1.4;
  const m = new THREE.Mesh(boxG, isRed ? mRed : mBase);
  m.add(new THREE.LineSegments(edgeG, isRed ? eRed : eBase));
  m.position.set(i * SP, 0, j * SP); m.h = h; m.d = d; m.key = key; m.isRed = isRed;
  scene.add(m); bldgs.push(m);
}
// floor grid + roads
const gridPts = [], roadPts = [];
const EXT = (NG + 0.5) * SP;
for (let k = -NG; k <= NG + 1; k++) {
  const v = (k - 0.5) * SP;
  gridPts.push(-EXT, 0, v, EXT, 0, v, v, 0, -EXT, v, 0, EXT);
}
for (const v of [-2 * SP, 2 * SP]) roadPts.push(-EXT - 2, 0.002, v, EXT + 2, 0.002, v, v, 0.002, -EXT - 2, v, 0.002, EXT + 2);
const mkLines = (pts, col, op) => {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op })); scene.add(l); return l;
};
const gridL = mkLines(gridPts, 0xffffff, 0.07), roadL = mkLines(roadPts, 0xffffff, 0.22);
// data packets on the roads
const pkG = new THREE.BoxGeometry(0.2, 0.1, 0.2);
const packets = [];
for (let k = 0; k < 16; k++) {
  const lane = k % 4, dir = rnd(k * 3.1) > 0.5 ? 1 : -1, spd = 3 + rnd(k * 5.7) * 2.5, off = rnd(k * 9.1) * 20;
  const trail = [];
  for (let q = 0; q < 7; q++) {
    const mt = new THREE.MeshBasicMaterial({ color: q === 0 ? 0xff2a2a : 0xd01919, transparent: true, opacity: 1 - q / 7 });
    const m = new THREE.Mesh(pkG, mt); m.scale.setScalar(1 - q * 0.11); scene.add(m); trail.push(m);
  }
  packets.push({ lane, dir, spd, off, trail, white: k % 5 === 0 });
}
packets.forEach((p) => { if (p.white) p.trail.forEach((m, q) => m.material.color.set(q === 0 ? 0xffffff : 0xbbbbbb)); });
// overlay: process steps + 3D labels
const STEPS = ['Discovery', 'Strategy', 'Design & Development', 'Launch & Support'];
const STEP_T = [8.05, 8.8, 9.55, 10.3];
const s4k = el('div', 'abs', s4); css(s4k, { left: '160px', top: '150px', display: 'flex', alignItems: 'center', gap: '16px' });
const s4dash = el('div', '', s4k); css(s4dash, { width: '28px', height: '3px', background: RED });
const s4kt = el('div', 'mono', s4k); css(s4kt, { fontSize: '16px', color: '#8A8A93' });
const stepM = el('div', 'mask', s4); css(stepM, { left: '156px', top: '190px', width: '1100px', height: '118px' });
const stepBig = STEPS.map((s) => { const e = el('div', 'big', stepM, s + '<span class="r">.</span>'); css(e, { fontSize: '96px', lineHeight: '118px' }); return e; });
const stepList = el('div', 'abs', s4); css(stepList, { left: '160px', top: '760px' });
const track = el('div', 'abs', stepList); css(track, { left: '-24px', top: '-4px', width: '2px', height: '172px', background: '#2A2A2E' });
const trackF = el('div', 'abs', track); css(trackF, { left: '0', top: '0', width: '2px', height: '172px', background: RED, transformOrigin: '50% 0' });
const stepRows = STEPS.map((s, i) => { const e = el('div', 'step', stepList); e.style.top = i * 46 + 'px'; e.src = `0${i + 1}   ${s}`; return e; });
const lbl3 = Object.keys(REDS).map((k, i) => {
  const e = el('div', 'l3', s4); e.stem = el('div', 'stem', e); e.dot = el('div', 'dot', e);
  e.tx = el('div', 'tx mono', e); e.tx2 = el('div', 'tx2 mono', e); e.key = k; e.idx = i; return e;
});
const v3 = new THREE.Vector3();
function updS4(t, f) {
  const on = t >= 7.95 && t < 11.15; vis(s4, on); vis(glc, on); if (!on) return;
  const canvasO = seg(t, 8.0, 8.22) * (1 - seg(t, 10.9, 11.08));
  glc.style.opacity = canvasO;
  // camera
  const th = (45 + 24 * ez.p2io(seg(t, 8.0, 11.0))) * Math.PI / 180, ph = Math.atan(1 / Math.SQRT2);
  cam.position.set(Math.sin(th) * Math.cos(ph) * 60, Math.sin(ph) * 60, Math.cos(th) * Math.cos(ph) * 60);
  cam.lookAt(0, 0.6, 0);
  cam.zoom = lerp(0.62, 1.0, ez.eo(seg(t, 8.0, 9.1))) * lerp(1, 1.1, ez.sine(seg(t, 9.0, 11.0)));
  cam.updateProjectionMatrix();
  // buildings rise / sink
  for (const b of bldgs) {
    const st = 8.05 + (b.d / 7.1) * 0.6;
    let p = ez.bo2(seg(t, st, st + 0.6));
    const sk = 10.5 + (1 - b.d / 7.1) * 0.28;
    p *= 1 - ez.p3i(seg(t, sk, sk + 0.32));
    b.scale.y = Math.max(0.0001, b.h * p);
    b.visible = p > 0.001;
  }
  mRed.emissive.setRGB(0.42 + 0.18 * Math.sin(t * 9), 0.03, 0.03);
  const gl = seg(t, 8.0, 8.5) * (1 - seg(t, 10.7, 11.0));
  gridL.material.opacity = 0.07 * gl; roadL.material.opacity = 0.22 * gl;
  // packets
  for (const p of packets) {
    const po = seg(t, 8.45 + p.off * 0.01, 8.65 + p.off * 0.01) * (1 - seg(t, 10.55, 10.8));
    p.trail.forEach((m, q) => {
      const tt = t - q * 0.022;
      const s = ((tt * p.spd * p.dir + p.off) % (2 * EXT + 4) + (2 * EXT + 4)) % (2 * EXT + 4) - EXT - 2;
      const c = p.lane < 2 ? (p.lane ? 2 : -2) * SP : 0, c2 = p.lane >= 2 ? (p.lane === 3 ? 2 : -2) * SP : 0;
      if (p.lane < 2) m.position.set(c, 0.06, s); else m.position.set(s, 0.06, c2);
      m.material.opacity = (1 - q / 7) * po; m.visible = po > 0;
    });
  }
  renderer.render(scene, cam);
  // overlay text
  const outO = 1 - seg(t, 10.85, 11.0);
  s4k.style.opacity = outO;
  s4dash.style.transform = `scaleX(${ez.eo(seg(t, 8.0, 8.3))})`;
  setText(s4kt, scramble('HOW WE WORK', seg(t, 8.0, 8.35), 80, f));
  stepBig.forEach((e, i) => { e.style.transform = `translateY(${roll(t, STEP_T[i], i < 3 ? STEP_T[i + 1] : 10.8, 0.45, 0.2, i < 3)}%)`; });
  let act = 0; STEP_T.forEach((s, i) => { if (t >= s) act = i; });
  stepRows.forEach((r, i) => {
    const a = seg(t, 8.15 + i * 0.06, 8.35 + i * 0.06);
    setText(r, scramble(r.src, a, 90 + i, f));
    r.style.color = i === act ? '#FFFFFF' : i < act ? '#8A8A93' : '#45454C';
    r.style.opacity = outO;
  });
  trackF.style.transform = `scaleY(${cl((t - 8.05) / (11.0 - 8.05))})`;
  track.style.opacity = seg(t, 8.1, 8.3) * outO;
  // 3D-anchored labels
  for (const e of lbl3) {
    const b = bldgs.find((q) => q.key === e.key);
    v3.set(b.position.x, b.scale.y + 0.02, b.position.z).project(cam);
    const x = (v3.x + 1) / 2 * W, y = (1 - v3.y) / 2 * H;
    const a0 = 8.75 + e.idx * 0.14, p = ez.eo(seg(t, a0, a0 + 0.35)), q = 1 - ez.p3i(seg(t, 10.35, 10.55));
    vis(e, p > 0 && q > 0);
    e.style.transform = `translate(${x}px,${y}px)`;
    e.stem.style.transform = `scaleY(${p * q})`;
    e.dot.style.opacity = p * q;
    setText(e.tx, scramble(REDS[e.key], seg(t, a0 + 0.08, a0 + 0.4), 100 + e.idx, f));
    setText(e.tx2, scramble('● ' + SUBS[e.key], seg(t, a0 + 0.15, a0 + 0.5), 120 + e.idx, f));
    e.tx.style.opacity = e.tx2.style.opacity = q;
  }
}

// ── SCENE 5: design. build. run. ─────────────────────────────────────────
const s5 = $('#s5');
const inf = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;inset:0' }, s5);
const infDefs = sv('defs', {}, inf);
const glowF = sv('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, infDefs);
sv('feGaussianBlur', { stdDeviation: 14 }, glowF);
const infG = sv('g', {}, inf);
const LEM = (s, a = 660) => { const d = 1 + Math.sin(s) ** 2; return [960 + a * Math.cos(s) / d, 540 + a * Math.sin(s) * Math.cos(s) / d]; };
let ld = '';
for (let k = 0; k <= 400; k++) { const [x, y] = LEM(k / 400 * Math.PI * 2); ld += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
const infBase = sv('path', { d: ld, fill: 'none', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 1.5 }, infG);
infBase.len = infBase.getTotalLength(); infBase.setAttribute('stroke-dasharray', infBase.len);
const infGlow = sv('circle', { r: 26, fill: RED, filter: 'url(#glow)' }, infG);
const comet = []; for (let k = 0; k < 70; k++) comet.push(sv('circle', { r: 1, fill: k ? RED : '#FFFFFF' }, infG));
const MANTRA = [['Design', 11.0], ['Build', 11.5], ['Run', 12.0]];
const mM = el('div', 'mask', s5); css(mM, { left: '0', top: '378px', width: '1920px', height: '300px' });
const mEls = MANTRA.map(([w]) => { const e = el('div', '', mM, w + '<span class="r">.</span>'); css(e, { width: '1920px', textAlign: 'center', font: '900 280px/300px IDisp', letterSpacing: '-.05em' }); return e; });
const mCnt = el('div', 'mono abs', s5); css(mCnt, { left: '0', width: '1920px', top: '712px', textAlign: 'center', fontSize: '16px', color: '#8A8A93' });
function updS5(t, f) {
  const on = t >= 10.95 && t < 12.75; vis(s5, on); if (!on) return;
  const col = ez.p4io(seg(t, 12.3, 12.62));
  infBase.setAttribute('stroke-dashoffset', infBase.len * (1 - ez.p3o(seg(t, 10.95, 11.55))));
  infG.setAttribute('transform', `translate(960 540) scale(${1 - col}) translate(-960 -540)`);
  infG.setAttribute('opacity', 1 - seg(t, 12.5, 12.62));
  const s0 = (t - 10.95) * 4.6 - Math.PI / 2;
  comet.forEach((c, k) => {
    const [x, y] = LEM(s0 - k * 0.022);
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', (k ? 6.5 * (1 - k / 70) + 0.6 : 7.5));
    c.setAttribute('opacity', ((1 - k / 70) ** 1.4 * seg(t, 10.95, 11.1)).toFixed(3));
  });
  const [gx, gy] = LEM(s0); infGlow.setAttribute('cx', gx); infGlow.setAttribute('cy', gy);
  infGlow.setAttribute('opacity', 0.55 * seg(t, 10.95, 11.1));
  mEls.forEach((e, i) => {
    const ts = MANTRA[i][1], te = i < 2 ? MANTRA[i + 1][1] : 12.3;
    e.style.transform = `translateY(${roll(t, ts, te, 0.4, 0.2, i < 2)}%)`;
  });
  let k = 0; MANTRA.forEach((m, i) => { if (t >= m[1]) k = i; });
  setText(mCnt, `0${k + 1} / 03`);
  mCnt.style.opacity = seg(t, 11.0, 11.1) * (1 - seg(t, 12.25, 12.35));
}

// ── SCENE 6: logo resolve ────────────────────────────────────────────────
const s6 = $('#s6');
const lsvg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;inset:0;overflow:visible' }, s6);
const ldefs = sv('defs', {}, lsvg);
const clipL = sv('clipPath', { id: 'letterClip' }, ldefs); sv('rect', { x: 100, y: 100, width: 1120, height: 152 }, clipL);
const maskN = sv('mask', { id: 'maskN', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1308, height: 360 }, ldefs);
const mNpath = sv('path', { d: 'M758 262 L758 126 L877 234 L877 96', fill: 'none', stroke: '#fff', 'stroke-width': 48, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, maskN);
const maskR = sv('mask', { id: 'maskR', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1308, height: 360 }, ldefs);
const mRpath = sv('path', { d: 'M736 254 L900 104', fill: 'none', stroke: '#fff', 'stroke-width': 40, 'stroke-linecap': 'square' }, maskR);
const sweepG = sv('linearGradient', { id: 'sweep', x1: 0, y1: 0, x2: 1, y2: 0 }, ldefs);
[[0, 0], [0.5, 0.55], [1, 0]].forEach(([o, a]) => sv('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': a }, sweepG));
const maskS = sv('mask', { id: 'maskS', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1308, height: 360 }, ldefs);
const rglowF = sv('filter', { id: 'rglow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, ldefs);
sv('feGaussianBlur', { stdDeviation: 18 }, rglowF);
const logoG = sv('g', {}, lsvg);
const wmG = sv('g', {}, logoG); // in viewBox space
const rGlow = sv('path', { d: WM.NR, fill: RED, filter: 'url(#rglow)' }, wmG);
const nRed = sv('path', { d: WM.NR, fill: RED, mask: 'url(#maskR)' }, wmG);
const nWhite = sv('path', { d: WM.N, fill: '#fff', mask: 'url(#maskN)' }, wmG);
const lettersG = sv('g', { 'clip-path': 'url(#letterClip)' }, wmG);
const letters = LETTERS.map(([k, cx]) => { const p = sv('path', { d: WM[k], fill: '#fff' }, lettersG); p.d = Math.abs(cx - 817.8); return p; });
// mask for the light sweep = all glyphs
LETTERS.forEach(([k]) => sv('path', { d: WM[k], fill: '#fff' }, maskS));
sv('path', { d: WM.N, fill: '#fff' }, maskS);
const sweepR = sv('rect', { x: 0, y: 90, width: 260, height: 180, fill: 'url(#sweep)', mask: 'url(#maskS)' }, wmG);
const tagW = el('div', 'abs', s6); css(tagW, { left: '0', top: '688px', width: '1920px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '28px' });
const hairL = el('div', '', tagW), tag = el('div', 'mono', tagW), hairR = el('div', '', tagW);
css(hairL, { width: '300px', height: '1px', background: '#3A3A42', transformOrigin: '100% 50%' });
css(hairR, { width: '300px', height: '1px', background: '#3A3A42', transformOrigin: '0 50%' });
css(tag, { fontSize: '20px', color: '#8A8A93', letterSpacing: '.32em' });
const url = el('div', 'abs', s6); css(url, { left: '0', width: '1920px', top: '752px', textAlign: 'center', font: '500 26px/1 IDisp', letterSpacing: '.02em', color: '#fff' });
url.innerHTML = 'isofiniti<span class="r">.</span>com';
const nLen = mNpath.getTotalLength(), rLen = mRpath.getTotalLength();
mNpath.setAttribute('stroke-dasharray', nLen); mRpath.setAttribute('stroke-dasharray', rLen);
function updS6(t, f) {
  const on = t >= 12.45; vis(s6, on); if (!on) return;
  const breathe = lerp(0.985, 1.0, ez.sine(seg(t, 13.0, 15.0)));
  logoG.setAttribute('transform', `translate(${LX} ${LY}) scale(${breathe}) translate(${-LX} ${-LY})`);
  wmG.setAttribute('transform', `translate(${LX - VCX * LS} ${LY - VCY * LS}) scale(${LS})`);
  mNpath.setAttribute('stroke-dashoffset', nLen * (1 - ez.p4io(seg(t, 12.55, 12.98))));
  mRpath.setAttribute('stroke-dashoffset', rLen * (1 - ez.eo(seg(t, 13.0, 13.12))));
  rGlow.setAttribute('opacity', t < 13.0 ? 0 : lerp(0.95, 0.22, ez.p2o(seg(t, 13.0, 13.9))));
  letters.forEach((p) => {
    const d0 = 13.04 + (p.d / 683) * 0.36, q = ez.p4o(seg(t, d0, d0 + 0.5));
    p.setAttribute('transform', `translate(0 ${(1 - q) * 150})`);
  });
  const sp = ez.p3io(seg(t, 13.8, 14.55));
  sweepR.setAttribute('x', lerp(-300, 1320, sp)); sweepR.setAttribute('opacity', sp > 0 && sp < 1 ? 1 : 0);
  setText(tag, scramble('CUSTOM SOFTWARE · AI AUTOMATION', seg(t, 13.55, 14.1), 140, f));
  const hp = ez.eo(seg(t, 13.6, 14.2));
  hairL.style.transform = `scaleX(${hp})`; hairR.style.transform = `scaleX(${hp})`;
  const up = ez.p3o(seg(t, 13.95, 14.4));
  url.style.opacity = up; url.style.transform = `translateY(${(1 - up) * 16}px)`;
}

// ── frame driver ─────────────────────────────────────────────────────────
function renderAt(t) {
  const f = Math.round(t * FPS);
  updGrid(t); updSlash(t, f); updHud(t, f);
  updS1(t, f); updS2(t, f); updS3(t, f); updS4(t, f); updS5(t, f); updS6(t, f);
  fx(t, f);
}
window.renderAt = renderAt;
window.DUR = DUR; window.FPS = FPS;
window.ready = document.fonts.ready.then(() => Promise.all([...document.fonts].map((ff) => ff.load()))).then(() => { renderAt(0); return true; });

// ── interactive preview: ?t=<sec> to freeze, ?play to loop in real time ─
const qs = new URLSearchParams(location.search);
window.ready.then(() => {
  if (qs.has('t')) renderAt(parseFloat(qs.get('t')));
  else if (qs.has('play')) {
    document.body.classList.add('play');
    const fit = () => { const s = Math.min(innerWidth / W, innerHeight / H); $('#stage').style.transform = `scale(${s})`; };
    fit(); addEventListener('resize', fit);
    const audio = new Audio('out/isofiniti-showreel-audio.m4a');
    let t0 = null;
    const loop = (now) => {
      if (t0 === null) { t0 = now; audio.currentTime = 0; audio.play().catch(() => {}); }
      let t = (now - t0) / 1000;
      if (t >= DUR) { t0 = now; t = 0; audio.currentTime = 0; audio.play().catch(() => {}); }
      renderAt(t); requestAnimationFrame(loop);
    };
    addEventListener('click', () => { t0 = null; }, { once: false });
    requestAnimationFrame(loop);
  }
});
