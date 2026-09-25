// Standbilder zu bestimmten Zeitpunkten nach out/stills/: node stills.js 1.5 4 9.2 ...
const puppeteer = require('puppeteer-core');
const path = require('path');
(async () => {
  const times = process.argv.slice(2).map(Number);
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--hide-scrollbars', '--force-color-profile=srgb']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://localhost:8765/erklaervideo.html?export=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.__ready);
  const dir = path.join(__dirname, 'out', 'stills');
  require('fs').mkdirSync(dir, { recursive: true });
  // vorwärts laufen lassen wie beim Export, damit alle Tweens ihre Startwerte korrekt aufnehmen
  let tPrev = 0;
  for (const t of times.sort((a, b) => a - b)) {
    for (let x = tPrev; x < t; x += 0.2) await page.evaluate(v => window.__render(v), x);
    await page.evaluate(v => window.__render(v), t);
    tPrev = t;
    const f = path.join(dir, 't' + t.toFixed(2).padStart(6, '0') + '.png');
    await page.screenshot({ path: f });
    console.log(f);
  }
  if (errs.length) console.log('FEHLER:\n' + errs.join('\n'));
  await browser.close().catch(() => {});
  process.exit(0);
})();
