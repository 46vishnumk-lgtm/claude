// Usage: node tools/frames.cjs outDir t1 t2 ...   — screenshots the showreel at given times
const path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const [out, ...times] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?render');
  await p.waitForFunction(() => window.SHOWREEL && window.SHOWREEL.ready, null, { timeout: 30000 });
  for (const t of times) {
    await p.evaluate(t => window.SHOWREEL.seek(t), +t);
    await p.screenshot({ path: `${out}/f${String(t).padStart(5, '0')}.png` });
  }
  if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].join('\n'));
  await b.close();
})();
