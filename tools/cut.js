// Cuts the front can/bottle out of the multipack photos.
// The right edge of the front item sits on clean white background; mirroring it around the
// item's vertical axis gives the left edge, which removes the neighbours behind it.
const sharp = require('sharp');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets');

// [source, box x0, y0, x1, y1] — box must contain the whole front item with only white to its right
const jobs = {
  'original':     ['src/u_orig24.png.webp', 380, 100, 600, 600],
  'applee':       ['src/u_applee.png', 640, 200, 1000, 1000],
  'globery':      ['src/u_glob.png', 640, 200, 1000, 1000],
  'u18-original': ['src/u18_orig.png.webp', 380, 100, 600, 600],
  'u18-skrr':     ['src/u18_skrr.png.webp', 380, 100, 600, 600],
  'u18-peachup':  ['src/u18_peach.png.webp', 380, 100, 600, 600],
  'fuel-punch':   ['src/unit_fuel_punch.png.webp', 400, 100, 600, 600],
  'peach-up':     ['src/unit_peachup.png.webp', 400, 100, 600, 600],
  'lemon-aid':    ['src/u_water_lem.png.webp', 400, 100, 600, 600],
};
const BG = 243; // a pixel is background when all channels are above this

(async () => {
  for (const [name, [file, x0, y0, x1, y1]] of Object.entries(jobs)) {
    const img = sharp(path.join(dir, file)).flatten({ background: '#ffffff' });
    const meta = await img.metadata();
    const bx1 = Math.min(x1, meta.width), by1 = Math.min(y1, meta.height);
    const W = bx1 - x0, H = by1 - y0;
    const { data } = await img.extract({ left: x0, top: y0, width: W, height: H }).raw().toBuffer({ resolveWithObject: true });
    const ch = data.length / (W * H);
    const solid = (x, y) => { const p = (y * W + x) * ch; return Math.min(data[p], data[p + 1], data[p + 2]) < BG; };

    // right edge per row
    const right = new Array(H).fill(-1);
    for (let y = 0; y < H; y++) for (let x = W - 1; x >= 0; x--) if (solid(x, y)) { right[y] = x; break; }
    const top = right.findIndex(r => r >= 0);
    let bottom = H - 1; while (bottom > 0 && right[bottom] < 0) bottom--;

    // axis from the top rows, where only the front item exists
    const centers = [];
    for (let y = top + 4; y < top + 26; y++) {
      let l = -1; for (let x = 0; x < W; x++) if (solid(x, y)) { l = x; break; }
      if (l >= 0 && right[y] > l) centers.push((l + right[y]) / 2);
    }
    centers.sort((a, b) => a - b);
    const c = centers[centers.length >> 1];

    // alpha mask: inside [2c - r, r], 1px soft edge
    const out = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) {
      const r = right[y];
      for (let x = 0; x < W; x++) {
        const p = (y * W + x) * ch, q = (y * W + x) * 4;
        out[q] = data[p]; out[q + 1] = data[p + 1]; out[q + 2] = data[p + 2];
        if (r < 0) { out[q + 3] = 0; continue; }
        const l = 2 * c - r;
        const d = Math.min(x - l, r - x) + 1; // distance inside the edge
        out[q + 3] = d <= 0 ? 0 : d >= 1.5 ? 255 : Math.round(255 * d / 1.5);
      }
    }
    // rows below the item that are pure background stay transparent; trim + upscale
    await sharp(out, { raw: { width: W, height: H, channels: 4 } })
      .extract({ left: 0, top, width: W, height: bottom - top + 1 })
      .png().toBuffer().then(b => sharp(b).trim({ threshold: 0 }).toBuffer()).then(b => sharp(b)
      .resize({ height: 900, kernel: 'lanczos3' })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(path.join(dir, 'produse', `${name}.webp`)));
    console.log(name, 'axis', c.toFixed(1), 'rows', top, bottom);
  }
  const names = Object.keys(jobs);
  const thumbs = await Promise.all(names.map(n => sharp(path.join(dir, 'produse', `${n}.webp`)).resize({ height: 420 }).toBuffer()));
  let left = 10; const comp = [];
  for (const t of thumbs) { const m = await sharp(t).metadata(); comp.push({ input: t, left, top: 10 }); left += m.width + 14; }
  await sharp({ create: { width: left, height: 440, channels: 3, background: '#2a6b8a' } }).composite(comp).png().toFile(path.join(dir, '..', '_cut.png'));
})();
