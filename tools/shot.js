// node tools/shot.js [chromium|webkit] — screenshots desktop + phones into _shots/
const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const engine = process.argv[2] || 'chromium';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
fs.mkdirSync(path.join(root, '_shots'), { recursive: true });

const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (f.endsWith(path.sep)) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(4589, async () => {
  const browser = await pw[engine].launch({ args: engine === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] });
  const sizes = [['desk', 1440, 900, false], ['phone', 390, 844, true], ['small', 360, 740, true]];
  for (const [name, w, h, mobile] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile && engine === 'chromium', hasTouch: mobile });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') console.log(name, 'console:', m.text()); });
    page.on('pageerror', e => console.log(name, 'pageerror:', e.message));
    await page.goto('http://localhost:4589/');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: `_shots/${engine}-${name}-1.png` });
    await page.click('.card[data-index="1"]'); await page.waitForTimeout(3500);
    await page.screenshot({ path: `_shots/${engine}-${name}-2.png` });
    await page.click('.card[data-index="6"]'); await page.waitForTimeout(3500);
    await page.screenshot({ path: `_shots/${engine}-${name}-3.png` });
    if (name !== 'small') await page.screenshot({ path: `_shots/${engine}-${name}-full.png`, fullPage: true });
    await ctx.close();
  }
  await browser.close(); server.close();
});
