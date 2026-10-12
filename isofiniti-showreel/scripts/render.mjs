// Frame-exact renderer: drives window.renderAt(t) in headless Chromium and
// pipes PNG frames into ffmpeg.
//   node scripts/render.mjs --stills 0.4,2.1,6.3       → out/stills/*.png
//   node scripts/render.mjs --sub 2                    → out/video.mov (2 sub-frames/frame motion blur)
//   node scripts/render.mjs --sub 2 --from 0 --to 300 --out out/part0.mov   (shard for parallel renders)
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1] ?? true]] : a), []));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const PORT = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${PORT}/index.html?pr=${args.pr || 2}`);
await page.evaluate(() => window.ready);
const shoot = () => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });

if (args.stills) {
  fs.mkdirSync(path.join(ROOT, 'out/stills'), { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const t = parseFloat(s);
    await page.evaluate((t) => window.renderAt(t), t);
    fs.writeFileSync(path.join(ROOT, `out/stills/t${t.toFixed(2).padStart(5, '0')}.png`), await shoot());
    console.log('still', t);
  }
} else {
  const FPS = 60, DUR = 15, SUB = Number(args.sub || 1);
  const out = path.join(ROOT, args.out || 'out/video.mov');
  const F0 = Number(args.from || 0), F1 = Number(args.to || FPS * DUR); // output frame range [F0, F1)
  const total = (F1 - F0) * SUB;
  // Sub-frames are blended (tmix) then decimated → 180°-ish shutter motion blur.
  const blur = SUB > 1 ? `tmix=frames=${SUB}:weights=${Array(SUB).fill(1).join(' ')},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB,` : '';
  const vf = ['-vf', `${blur}scale=out_color_matrix=bt709:out_range=tv,format=yuv422p10le`];
  const tags = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-', ...vf,
    '-r', String(FPS), '-c:v', 'prores_ks', '-profile:v', '3', '-pix_fmt', 'yuv422p10le', ...tags, out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    // sub-frames sample the shutter interval [f, f + 0.5) of each output frame
    const fIdx = F0 + Math.floor(i / SUB), k = i % SUB;
    const t = (fIdx + (SUB > 1 ? (k / SUB) * 0.5 : 0)) / FPS;
    await page.evaluate((t) => window.renderAt(t), t);
    const buf = await shoot();
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();
