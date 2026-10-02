const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(req.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.end(d); }); }).listen(4593, async () => {
  const b = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 430 } });
  await p.goto('http://localhost:4593/tools/models.html'); await p.waitForTimeout(9000);
  await p.screenshot({ path: '_models.png' }); await b.close(); server.close();
});
