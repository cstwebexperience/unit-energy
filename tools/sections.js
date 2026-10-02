const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..'); const engine = process.argv[2] || 'chromium';
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' }); res.end(d); });
}).listen(4591, async () => {
  const b = await pw[engine].launch({ args: engine === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] });
  for (const [n, w, h, m] of [['desk', 1440, 900, false], ['phone', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: m && engine === 'chromium', hasTouch: m });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log(n, e.message));
    await p.goto('http://localhost:4591/'); await p.waitForTimeout(8000);
    await p.screenshot({ path: `_shots/${engine}-${n}-hero.png` });
    for (const id of ['gama', 'vitamine', 'mgk', 'contact']) {
      await p.evaluate(id => document.getElementById(id).scrollIntoView({ behavior: 'instant' }), id);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: `_shots/${engine}-${n}-${id}.png` });
      if (n === 'phone' && id !== 'contact') { await p.mouse.wheel(0, 800); await p.evaluate(() => scrollBy(0, 800)); await p.waitForTimeout(1200); await p.screenshot({ path: `_shots/${engine}-${n}-${id}-b.png` }); }
    }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('[data-open="1"]').click()); await p.waitForTimeout(900);
    await p.screenshot({ path: `_shots/${engine}-${n}-modal.png` });
    await ctx.close();
  }
  await b.close(); server.close();
});
