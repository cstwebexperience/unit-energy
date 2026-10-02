const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => { let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); res.end(d); }); }).listen(4595, async () => {
  const b = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => console.log('ERROR', e.message));
  await p.goto('http://localhost:4595/' + (process.argv[2] || ''));
  const fps = async (label) => { const t0 = Date.now(); const r = await Promise.race([p.evaluate(() => new Promise(res => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); })), new Promise(r => setTimeout(() => r('TIMEOUT'), 8000))]); console.log(label, 'fps', r, 'wall', Date.now() - t0); };
  for (const t of [1, 3, 5, 8, 12]) { await p.waitForTimeout(t === 1 ? 1000 : 2000); await fps('t~' + t + 's'); }
  for (let i = 1; i < 4; i++) { await p.evaluate(i => document.querySelector(`.card[data-index="${i}"]`).click(), i).catch(e => console.log('click fail')); await p.waitForTimeout(2600); await fps('after click ' + i); }
  await b.close(); server.close(); process.exit(0);
});
