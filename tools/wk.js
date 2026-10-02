const http = require('http'), fs = require('fs'), path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'));
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.end(d); });
}).listen(4592, async () => {
  const b = await pw.webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4592/'); await p.waitForTimeout(6000);
  for (const [n, css] of [['none', '*{}'], ['nologo', '.logo-word{display:none}'], ['noleaf', '.leaves-container{display:none}'], ['nobubble', '#bubbles-container,.bg-stripes,.bg-word{display:none}']]) {
    await p.addStyleTag({ content: css }); await p.waitForTimeout(800);
    await p.screenshot({ path: '_shots/wk-' + n + '.png', clip: { x: 0, y: 0, width: 200, height: 200 } });
  }
  console.log(await p.evaluate(() => {
    const els = document.elementsFromPoint(40, 60).map(e => e.tagName + '.' + e.className);
    const fonts = [...document.fonts].filter(f => f.family.includes('Archivo')).map(f => f.style + ' ' + f.weight + ' ' + f.status);
    return JSON.stringify({ els, fonts });
  }));
  await b.close(); server.close();
});
