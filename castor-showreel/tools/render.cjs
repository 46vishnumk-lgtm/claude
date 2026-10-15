// Frame-accurate render of index.html → MP4 (silent).
// Usage: node tools/render.cjs [--fps 60] [--workers 4] [--out out/castor-showreel.mp4] [--from 0] [--to 46]
// Each worker seeks the GSAP timeline frame by frame, screenshots, and pipes PNGs to ffmpeg;
// the segments are then joined losslessly.
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..');
const FPS = +arg('fps', 60), WORKERS = +arg('workers', 4);
const OUT = path.resolve(ROOT, arg('out', 'out/castor-showreel.mp4'));
const TMP = path.join(path.dirname(OUT), '.segments');
fs.mkdirSync(TMP, { recursive: true });

async function worker(browser, idx, f0, f1) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?render');
  await page.waitForFunction(() => window.SHOWREEL && window.SHOWREEL.ready, null, { timeout: 60000 });
  const seg = path.join(TMP, `seg${idx}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.SHOWREEL.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 120 === 0) console.log(`worker ${idx}: frame ${f}/${f1}`);
  }
  ff.stdin.end();
  await done;
  await page.close();
  return seg;
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const probe = await browser.newPage();
  await probe.goto('file://' + path.join(ROOT, 'index.html') + '?render');
  await probe.waitForFunction(() => window.SHOWREEL && window.SHOWREEL.ready);
  const duration = await probe.evaluate(() => window.SHOWREEL.duration);
  await probe.close();
  const F0 = Math.round(+arg('from', 0) * FPS), F1 = Math.round(+arg('to', duration) * FPS);
  const per = Math.ceil((F1 - F0) / WORKERS);
  const t0 = Date.now();
  const segs = await Promise.all(Array.from({ length: WORKERS }, (_, i) =>
    worker(browser, i, F0 + i * per, Math.min(F1, F0 + (i + 1) * per))));
  await browser.close();
  const list = path.join(TMP, 'list.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${list}" -c copy -movflags +faststart "${OUT}"`);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(`rendered ${F1 - F0} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${OUT}`);
})();
