// Clicks through every product, reports JS errors and frame timing
const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => { let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); res.end(d); }); }).listen(4594, async () => {
  const b = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [n, w, h, m] of [['desk', 1440, 900, false], ['phone', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
    const p = await ctx.newPage();
    p.on('pageerror', e => console.log(n, 'ERROR', e.message));
    p.on('console', x => { if (x.type() === 'error' && !x.text().includes('primitive index')) console.log(n, 'console', x.text().slice(0, 160)); });
    await p.goto('http://localhost:4594/'); await p.waitForTimeout(7000);
    for (let i = 1; i < 9; i++) { await p.evaluate(i => document.querySelector(`.card[data-index="${i}"]`).click(), i); await p.waitForTimeout(2600); if (i === 3 || i === 8) await p.screenshot({ path: `_shots/cycle-${n}-${i}.png` }); }
    console.log(n, 'current:', await p.evaluate(() => document.getElementById('count').textContent + ' ' + document.querySelector('.card.active .card-info span').textContent));
    await ctx.close();
  }
  await b.close(); server.close();
});
