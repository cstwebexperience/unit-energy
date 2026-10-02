const sharp = require('sharp');
const jobs = {
  'original':      ['src/u_orig24.png.webp', 418, 120, 168, 480],
  'applee':        ['src/u_applee.png', 704, 220, 244, 780],
  'globery':       ['src/u_glob.png', 704, 220, 244, 780],
  'u18-original':  ['src/u18_orig.png.webp', 418, 120, 164, 480],
  'u18-skrr':      ['src/u18_skrr.png.webp', 416, 120, 166, 480],
  'u18-peachup':   ['src/u18_peach.png.webp', 418, 120, 164, 480],
  'fuel-punch':    ['src/unit_fuel_punch.png.webp', 448, 120, 140, 480],
  'peach-up':      ['src/unit_peachup.png.webp', 448, 120, 140, 480],
  'lemon-aid':     ['src/u_water_lem.png.webp', 444, 120, 150, 480],
};
(async () => {
  for (const [name, [f, x, y, w, h]] of Object.entries(jobs)) {
    const meta = await sharp(f).metadata();
    const W = Math.min(w, meta.width - x), H = Math.min(h, meta.height - y);
    const { data, info } = await sharp(f).extract({ left: x, top: y, width: W, height: H }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const n = info.width * info.height, seen = new Uint8Array(n), q = [];
    const white = i => { const p = i * 4; return data[p + 3] < 20 || Math.min(data[p], data[p + 1], data[p + 2]) > 232; };
    for (let i = 0; i < info.width; i++) { q.push(i, (info.height - 1) * info.width + i); }
    for (let j = 0; j < info.height; j++) { q.push(j * info.width, j * info.width + info.width - 1); }
    while (q.length) {
      const i = q.pop(); if (seen[i] || !white(i)) continue; seen[i] = 1;
      const xx = i % info.width, yy = (i / info.width) | 0;
      if (xx > 0) q.push(i - 1); if (xx < info.width - 1) q.push(i + 1);
      if (yy > 0) q.push(i - info.width); if (yy < info.height - 1) q.push(i + info.width);
    }
    for (let i = 0; i < n; i++) if (seen[i]) data[i * 4 + 3] = 0;
    await sharp(data, { raw: info }).blur(0.3).trim().resize({ height: 900, kernel: 'lanczos3' }).webp({ quality: 90, alphaQuality: 100 }).toFile(`produse/${name}.webp`);
  }
  const files = Object.keys(jobs);
  const imgs = await Promise.all(files.map(n => sharp(`produse/${n}.webp`).resize({ height: 300 }).toBuffer()));
  await sharp({ create: { width: 1200, height: 320, channels: 3, background: '#2a6b8a' } })
    .composite(imgs.map((b, i) => ({ input: b, left: i * 130 + 5, top: 10 }))).png().toFile('../_cut.png');
})();
