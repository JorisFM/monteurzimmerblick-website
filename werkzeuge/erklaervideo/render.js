// Rendert erklaervideo.html bildgenau in ein stummes MP4 (out/video_stumm.mp4) und schreibt out/cues.json für den Ton.
// Vorher im Projektordner starten: python3 -m http.server 8765
// node render.js [fps] [von] [bis]
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');
const FF = process.env.FFMPEG || execSync('python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"').toString().trim();
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FPS = +(process.argv[2] || 30);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu-vsync']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8765/erklaervideo.html?export=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.__ready);
  const cues = await page.evaluate(() => window.__cues());
  fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify(cues, null, 1));
  const from = +(process.argv[3] || 0), to = +(process.argv[4] || cues.duration);
  const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS);
  const out = path.join(OUT, 'video_stumm.mp4');
  const ff = spawn(FF, ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const client = await page.target().createCDPSession();
  const t0 = Date.now();
  for (let i = n0; i < n1; i++) {
    await page.evaluate(v => window.__render(v), i / FPS);
    const shot = await client.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false });
    const buf = Buffer.from(shot.data, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - n0) % (FPS * 5) === 0) console.log('Bild ' + i + ' / ' + n1 + ' (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  if (errs.length) console.log('FEHLER:\n' + errs.join('\n'));
  console.log('fertig: ' + out + ' in ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  await browser.close().catch(() => {});
  process.exit(0);
})();
