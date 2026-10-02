// Renders tex-<id>.jpg for every can flavor from tools/texture.html
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');

const cans = {
  'original':     { bg: '#141414', line: '#e8461e', head: '#e8461e', name: '#e8461e', label: 'ORIGINAL' },
  'applee':       { bg: '#141414', line: '#a8d34a', head: '#a8d34a', name: '#a8d34a', label: 'APPLEE' },
  'globery':      { bg: '#141414', line: '#6c45d8', head: '#6c45d8', name: '#6c45d8', label: 'GLOBERY' },
  'u18-original': { bg: '#dc4a20', line: '#141414', head: '#141414', name: '#141414', label: 'ORIGINAL', u18: true },
  'u18-skrr':     { bg: '#b8b9bd', line: '#141414', head: '#141414', name: '#1d1d1f', label: 'SKRR', u18: true },
  'u18-peachup':  { bg: '#c9a92a', line: '#141414', head: '#141414', name: '#141414', label: 'PEACHUP', u18: true },
};

const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.end(d); });
}).listen(4588, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4588/tools/texture.html');
  for (const [id, cfg] of Object.entries(cans)) {
    const data = await page.evaluate(async cfg => { await draw(cfg); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, cfg);
    fs.writeFileSync(path.join(root, 'assets', `tex-${id}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
    console.log('ok', id);
  }
  await browser.close(); server.close();
});
