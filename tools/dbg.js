const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.end(d); });
}).listen(4590, async () => {
  const b = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('console', m => console.log('console:', m.text().slice(0, 200)));
  await p.goto('http://localhost:4590/'); await p.waitForTimeout(7000);
  console.log(await p.evaluate(() => { const m = document.querySelector('#product-model'); const r = m.getBoundingClientRect(); return JSON.stringify({ loaded: m.loaded, cls: m.className, op: getComputedStyle(m).opacity, r, mats: m.model && m.model.materials.map(x => x.name + ':' + !!x.pbrMetallicRoughness.baseColorTexture) }); }));
  await b.close(); server.close();
});
