// OUR DRAWING BESIDE THE PHOTOGRAPHS, both ruled in HEAD.Jefferson's OWN local
// frame, so a feature can be read off in the units coins.js authors in.
//
// TWO THINGS THIS DOES THAT `_nk3over.mjs` DOES NOT.
//
// 1. THE DISC. `_nk3over.mjs` normalises our render by W/2 — 50 viewBox units —
//    and matches that to the photograph's fitted disc radius. The coin's blank
//    is drawn at r = 47 (`outlineOf`), not 50, so it presents our device at
//    47/50 = 0.940 of its true size against the coin. Every placement that
//    overlay has ever shown was flattered by 6.0%. This uses 47.
//
// 2. THE RULER. An outline on a photograph says "not there"; it does not say
//    "there, by this much". The grid is HEAD.Jefferson's local frame at 1 or 5
//    units a line, so both are readable off one picture.
//
// AND A THIRD FAULT, in the shared disc fit rather than in either overlay:
// `discOf()` takes R = sqrt(area/pi) over every pixel unlike the border median.
// On a coin photographed on white with a soft dark HALO outside the rim the
// halo is counted; on a coin that FILLS its frame the ray search is clipped and
// returns its own bound. Measured against a rim fit (720 rays, 15% trimmed,
// algebraic circle) the two disagree by:
//
//     nickel-obv-proof.png     area-R 1401.4   rim-fit 1413.0   -0.8%
//     nickel-obv-unc2004.jpg    688.8            704.3          -2.2%
//     nickel-obv.jpg            219.3            231.0          -5.1%
//     nickel-obv-4.jpg          375.7            391.4          -4.0%
//     nickel-obv-5.JPG          467.4            473.0          -1.2%   VOID:
//         the coin fills the frame, so every ray hits its own search bound and
//         the "fit" residual is 0.0 px — the `_nk2env.mjs` failure mode again.
//
// This instrument keeps `discOf`'s area fit so its pictures are comparable with
// the rest of the library's, and the disagreement above is the uncertainty to
// read every number in this round against. On the PROOF, the one this round
// takes its shape numbers from, it is 0.8%.
//
//   node coloringbook/judge/_nk17grid.mjs [x0 x1 y0 y1] [tag] [refs...]
//   node coloringbook/judge/_nk17grid.mjs                       # whole coin, all refs
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const REF = new URL('../ref/', import.meta.url).pathname;
const OUT = new URL('./', import.meta.url).pathname;
const S = 0.95, CX = -6.4, CY = 43.7, DIR = -1, RDISC = 47;
const L2V = (X, Y) => [50 + CX + DIR * S * X, CY + S * Y];

async function discOf(file) {
  const { data, info } = await sharp(REF + file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, P = (x, y) => data[y * W + x];
  const b = [];
  for (let x = 0; x < W; x++) b.push(P(x, 0), P(x, H - 1));
  for (let y = 0; y < H; y++) b.push(P(0, y), P(W - 1, y));
  b.sort((p, q) => p - q); const bg = b[b.length >> 1];
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(P(x, y) - bg) > 25) { n++; sx += x; sy += y; }
  return { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI), w: W, h: H };
}

const a = process.argv.slice(2);
const nums = a.filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
const rest = a.filter((s) => !/^-?[\d.]+$/.test(s));
const [X0, X1, Y0, Y1] = nums.length === 4 ? nums : [-42, 28, -38, 34];
const tag = rest[0] || 'whole';
const files = rest.slice(1).length ? rest.slice(1) : ['nickel-obv-proof.png', 'nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'];
const TW = 1200;
const step = (X1 - X0) > 40 ? 5 : 1;

function grid(toPx) {
  let g = '';
  for (let X = Math.ceil(X0 / step) * step; X <= X1; X += step) {
    const p = toPx(X, Y0), q = toPx(X, Y1); const M = Math.abs(X % (step * 2)) < 1e-9;
    g += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="#00c8ff" stroke-width="${M ? 1.6 : 0.6}" opacity="${M ? 0.9 : 0.4}"/>`;
    if (M) g += `<text x="${q[0].toFixed(1)}" y="${(q[1] - 5).toFixed(1)}" font-family="monospace" font-size="18" fill="#00c8ff" text-anchor="middle">${X}</text>`;
  }
  for (let Y = Math.ceil(Y0 / step) * step; Y <= Y1; Y += step) {
    const p = toPx(X0, Y), q = toPx(X1, Y); const M = Math.abs(Y % (step * 2)) < 1e-9;
    g += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="#00c8ff" stroke-width="${M ? 1.6 : 0.6}" opacity="${M ? 0.9 : 0.4}"/>`;
    if (M) g += `<text x="${(Math.min(p[0], q[0]) + 4).toFixed(1)}" y="${p[1].toFixed(1)}" font-family="monospace" font-size="18" fill="#00c8ff">${Y}</text>`;
  }
  return g;
}
async function tile(png, V2P) {
  const c = [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].map(([x, y]) => V2P(...L2V(x, y)));
  const L = Math.floor(Math.min(...c.map((p) => p[0]))), R = Math.ceil(Math.max(...c.map((p) => p[0])));
  const T = Math.floor(Math.min(...c.map((p) => p[1]))), B = Math.ceil(Math.max(...c.map((p) => p[1])));
  const m = await sharp(png).metadata();
  const w = Math.min(R - L, m.width - Math.max(0, L)), h = Math.min(B - T, m.height - Math.max(0, T));
  const K = TW / (R - L), OW = Math.round((R - L) * K), OH = Math.round((B - T) * K);
  const toPx = (X, Y) => { const [x, y] = V2P(...L2V(X, Y)); return [(x - L) * K, (y - T) * K]; };
  const base = await sharp(png).extract({ left: Math.max(0, L), top: Math.max(0, T), width: w, height: h })
    .resize(Math.round(w * K), Math.round(h * K), { fit: 'fill' }).png().toBuffer();
  return sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}">${grid(toPx)}</svg>`) }]).png().toBuffer();
}

const tiles = [], names = [];
{
  const png = await sharp(Buffer.from(coinSVG('nickel', 1600, { side: 'obverse' }))).flatten({ background: '#ffffff' }).png().toBuffer();
  // NOT size/100: coinPx() scales the nickel's box by its true mm ratio, so the
  // emitted PNG is narrower than the size asked for. Read the real width.
  const per = (await sharp(png).metadata()).width / 100;
  tiles.push(await tile(png, (x, y) => [x * per, y * per]));
  names.push('OURS');
}
for (const f of files) {
  const d = await discOf(f);
  tiles.push(await tile(REF + f, (x, y) => [d.cx + (x - 50) / RDISC * d.R, d.cy + (y - 50) / RDISC * d.R]));
  names.push(`${f}  (disc R ${d.R.toFixed(1)})`);
}
const metas = await Promise.all(tiles.map((t) => sharp(t).metadata()));
const pos = []; let x = 10;
for (const m of metas) { pos.push(x); x += m.width + 10; }
const HH = Math.max(...metas.map((m) => m.height)) + 34;
const txt = names.map((n, i) => `<text x="${pos[i]}" y="22" font-family="monospace" font-size="16" fill="#111">${n}</text>`).join('');
const out = `${OUT}_nk17-grid-${tag}.png`;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${HH}"><rect width="${x}" height="${HH}" fill="#fff"/>${txt}</svg>`))
  .composite(tiles.map((b, i) => ({ input: b, left: pos[i], top: 30 }))).png().toFile(out);
console.log(`wrote ${out}  (local-frame window x ${X0}..${X1}, y ${Y0}..${Y1}, ${step} unit/line)`);
