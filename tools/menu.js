const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => { let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); res.end(d); }); }).listen(4596, async () => {
  const b = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:4596/'); await p.waitForTimeout(5000);
  await p.click('.menu-btn'); await p.waitForTimeout(600);
  await p.screenshot({ path: '_shots/menu.png' });
  const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await d.goto('http://localhost:4596/'); await d.waitForTimeout(5000);
  await d.hover('.nav-item:nth-child(2)'); await d.waitForTimeout(300);
  await d.screenshot({ path: '_shots/band.png', clip: { x: 0, y: 0, width: 1440, height: 90 } });
  await b.close(); server.close();
});
