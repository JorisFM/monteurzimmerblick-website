// Einzelnes Bildschirmfoto einer Seite: node shot.js url datei.png
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'networkidle0' });
  await p.evaluate(() => window.__ready);
  await p.screenshot({ path: process.argv[3] });
  if (errs.length) console.log(errs.join('\n'));
  await b.close().catch(() => {}); process.exit(0);
})();
