// Text visibility audit: samples the timeline and reports, per text element, how large it renders,
// how long it stays fully readable, and whether it is ever clipped, covered, overlapped or off-stage.
// Usage: node tools/audit-text.cjs [step=0.2]
const path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');

(async () => {
  const step = +(process.argv[2] || .2);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?render');
  await p.waitForFunction(() => window.SHOWREEL && window.SHOWREEL.ready);
  const dur = await p.evaluate(() => window.SHOWREEL.duration);
  const groups = {};
  for (let t = 0; t <= dur; t += step) {
    const rows = await p.evaluate(t => {
      window.SHOWREEL.seek(t);
      const stage = document.getElementById('stage');
      const out = [];
      const leaves = [...stage.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('svg'));
      const key = e => {
        const host = e.closest('h1,h2,p,.kicker,.pill,.badge,.frus,.li,.mini,.tab,.biz-name,.biz-sub,.url,.lyr,.cl,.lbl,.test,.addr,.addr2,.imp h3,.imp p,.v2f,.v2r,.v3b,.v3r,#sel,#mcur,.band,h3,h6,.t,.m,.tag,.unl') || e;
        const sc = host.closest('[id]');
        return (sc ? '#' + sc.id + ' ' : '') + (host.className && typeof host.className === 'string' ? '.' + host.className.split(' ')[0] : host.tagName.toLowerCase()) + ' «' + host.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '»';
      };
      const effOp = el => { let o = 1; for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= +cs.opacity; } return o; };
      for (const e of leaves) {
        // geometry of the glyphs themselves, not the (often full-width) box
        const rng = document.createRange(); rng.selectNodeContents(e);
        const rs = [...rng.getClientRects()].filter(x => x.width && x.height);
        if (!rs.length) continue;
        const r = { left: Math.min(...rs.map(x => x.left)), top: Math.min(...rs.map(x => x.top)), right: Math.max(...rs.map(x => x.right)), bottom: Math.max(...rs.map(x => x.bottom)) };
        r.width = r.right - r.left; r.height = r.bottom - r.top;
        let op = 1, blur = 0, hidden = false;
        for (let a = e; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          op *= +cs.opacity;
          if (cs.visibility === 'hidden' || cs.display === 'none') hidden = true;
          const m = cs.filter.match(/blur\(([\d.]+)px\)/); if (m) blur = Math.max(blur, +m[1]);
        }
        if (hidden || op < .05) continue;
        const eb = e.getBoundingClientRect(); const scale = e.offsetHeight ? eb.height / e.offsetHeight : 1;
        const fs = parseFloat(getComputedStyle(e).fontSize) * scale;
        // clipping by overflow ancestors and by the stage
        let vis = { l: r.left, t: r.top, r: r.right, b: r.bottom };
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.overflow !== 'visible' || a === stage) {
            const ar = a.getBoundingClientRect();
            vis = { l: Math.max(vis.l, ar.left), t: Math.max(vis.t, ar.top), r: Math.min(vis.r, ar.right), b: Math.min(vis.b, ar.bottom) };
          }
        }
        const area = r.width * r.height, va = Math.max(0, vis.r - vis.l) * Math.max(0, vis.b - vis.t);
        const clipped = va / area < .97;
        // occlusion: is something else painted on top of the text centre?
        const cx = (vis.l + vis.r) / 2, cy = (vis.t + vis.b) / 2;
        const top = va > 0 ? document.elementsFromPoint(cx, cy).find(x => x === e || e.contains(x) || x.contains(e) || effOp(x) > .05) : null;
        const occluded = top && !(top === e || e.contains(top) || top.contains(e)) && !top.closest('#links') ? (top.id ? '#' + top.id : '.' + (typeof top.className === 'string' ? top.className.split(' ')[0] : top.tagName)) : '';
        out.push({ k: key(e), fs: +fs.toFixed(1), op: +op.toFixed(2), blur, clipped, occluded, r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] });
      }
      return out;
    }, t);
    // merge leaves into groups (a heading's words become one entry)
    const now = {};
    for (const x of rows) {
      const g = now[x.k] || (now[x.k] = { fs: 99, op: 1, blur: 0, clipped: false, occluded: '', r: [9e9, 9e9, -9e9, -9e9] });
      g.fs = Math.min(g.fs, x.fs); g.op = Math.min(g.op, x.op); g.blur = Math.max(g.blur, x.blur);
      g.clipped = g.clipped || x.clipped; g.occluded = g.occluded || x.occluded;
      g.r = [Math.min(g.r[0], x.r[0]), Math.min(g.r[1], x.r[1]), Math.max(g.r[2], x.r[2]), Math.max(g.r[3], x.r[3])];
    }
    const keys = Object.keys(now);
    for (const k of keys) {
      const g = now[k], G = groups[k] || (groups[k] = { minFs: 99, readable: 0, first: t, last: t, clipped: [], occluded: [], overlaps: [], offstage: [] });
      G.last = t;
      const steady = g.op > .95 && g.blur < .5;
      if (steady) G.minFs = Math.min(G.minFs, g.fs);
      if (steady) G.readable += step;
      if (steady && g.clipped) G.clipped.push(+t.toFixed(1));
      if (steady && g.occluded) G.occluded.push(+t.toFixed(1) + g.occluded);
      if (steady && (g.r[0] < 0 || g.r[1] < 0 || g.r[2] > 1920 || g.r[3] > 1080)) G.offstage.push(+t.toFixed(1));
      if (!steady) continue;
      for (const k2 of keys) {
        if (k2 <= k) continue;
        const h = now[k2]; if (!(h.op > .95 && h.blur < .5)) continue;
        const ix = Math.min(g.r[2], h.r[2]) - Math.max(g.r[0], h.r[0]), iy = Math.min(g.r[3], h.r[3]) - Math.max(g.r[1], h.r[1]);
        if (ix > 4 && iy > 4) G.overlaps.push(+t.toFixed(1) + ' ↔ ' + k2.slice(0, 48));
      }
    }
  }
  await b.close();
  const span = a => a.length ? `${a[0]}…${a[a.length - 1]} (${a.length})` : '';
  const issues = [];
  for (const [k, G] of Object.entries(groups)) {
    const flags = [];
    if (G.minFs < 18 && G.readable > 0) flags.push(`small ${G.minFs}px`);
    if (G.readable < 1.2) flags.push(`readable only ${G.readable.toFixed(1)}s`);
    if (G.clipped.length) flags.push('clipped ' + span(G.clipped));
    if (G.occluded.length) flags.push('covered ' + span(G.occluded.map(String)));
    if (G.offstage.length) flags.push('off-stage ' + span(G.offstage));
    if (G.overlaps.length) flags.push('overlaps ' + [...new Set(G.overlaps.map(o => o.split(' ↔ ')[1]))].slice(0, 3).join(' | ') + ` @${G.overlaps[0].split(' ')[0]}`);
    if (flags.length) issues.push(`${G.first.toFixed(1).padStart(5)}s  ${k}\n         ${flags.join('; ')}`);
  }
  console.log(`${Object.keys(groups).length} text groups checked, ${issues.length} with issues\n`);
  console.log(issues.join('\n'));
})();
