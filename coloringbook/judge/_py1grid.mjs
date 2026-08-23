// OUR CENT OBVERSE BESIDE THE PHOTOGRAPHS, both ruled in HEAD.Lincoln's OWN
// local frame, so a feature can be read off in the units `coins.js` authors in.
//
// This is `_nk17grid.mjs` with the nickel's frame constants replaced by the
// cent's (S 0.78, cx 3.88, cy 40.0, dir +1), the reference list replaced by the
// seven penny obverses, and ONE instrument fix. The 47-unit disc is carried
// over unchanged (NOT 50; the blank is drawn at r = 47 and `_nk3over.mjs`
// presented our device 6% small for its whole life by using 50), and so is the
// 1-unit / 5-unit ladder.
//
// THE FIX: the shared `discOf()` — R = sqrt(area/pi) over every pixel unlike
// the border median — is not usable on this coin's reference pool. On
// `penny-obv-2.jpg`, the 2002-S cameo proof, the MIRROR FIELD photographs as
// near-black and is therefore counted as background: the area fit returns
// R 395.7 where a rim fit returns 450.0 (−12.1%), with its centre 7.01 viewBox
// units off in x. That is not the −0.8%..−5.1% bias `_nk17grid.mjs` publishes,
// it is wrong in kind, and it lands every feature on that file about seven
// units from where it is. `_rvdisc.fit` (flood-fill, what `_jt1transfer.mjs`
// registers with) gets the same file right at R 445.8, so T1 is NOT affected —
// the fault is in the area `discOf()` that several overlay instruments carry a
// private copy of. This one fits the rim instead: 720 rays from the area
// centroid, outermost unlike pixel, Kasa circle with 15% trimmed, 4 passes. On
// the other six references it agrees with the area fit to −0.4%..−2.1% in R
// and under 0.3 viewBox units in centre.
//
// READS NOTHING, WRITES ONE PNG into judge/ (gitignored). No repo file moves.
//
//   node coloringbook/judge/_py1grid.mjs [x0 x1 y0 y1] [tag] [refs...]
//   node coloringbook/judge/_py1grid.mjs                       # whole coin, all refs
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const REF = new URL('../ref/', import.meta.url).pathname;
const OUT = new URL('./', import.meta.url).pathname;
const S = 0.78, CX = 3.88, CY = 40.0, DIR = 1, RDISC = 47;
const L2V = (X, Y) => [50 + CX + DIR * S * X, CY + S * Y];

async function discOf(file) {
  const { data, info } = await sharp(REF + file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, P = (x, y) => data[y * W + x];
  const b = [];
  for (let x = 0; x < W; x++) b.push(P(x, 0), P(x, H - 1));
  for (let y = 0; y < H; y++) b.push(P(0, y), P(W - 1, y));
  b.sort((p, q) => p - q); const bg = b[b.length >> 1];
  const on = (x, y) => Math.abs(P(x, y) - bg) > 25;
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on(x, y)) { n++; sx += x; sy += y; }
  const a0 = { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI) };
  const pts = [], RMAX = Math.hypot(W, H);
  for (let i = 0; i < 720; i++) {
    const a = (i / 720) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    let last = null;
    for (let r = a0.R * 0.6; r < RMAX; r += 0.5) {
      const x = Math.round(a0.cx + ca * r), y = Math.round(a0.cy + sa * r);
      if (x < 0 || y < 0 || x >= W || y >= H) break;
      if (on(x, y)) last = [x, y];
    }
    if (last) pts.push(last);
  }
  let cx = a0.cx, cy = a0.cy, R = a0.R;
  for (let it = 0; it < 4; it++) {
    const res = pts.map((p) => Math.abs(Math.hypot(p[0] - cx, p[1] - cy) - R));
    const s2 = res.slice().sort((u, v) => u - v);
    const cut = s2[Math.floor(s2.length * 0.85)];
    const keep = pts.filter((p, i) => res[i] <= cut);
    let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sz = 0, Sxz = 0, Syz = 0;
    for (const [x, y] of keep) {
      const z = x * x + y * y;
      Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y; Sz += z; Sxz += x * z; Syz += y * z;
    }
    const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, keep.length]];
    const B = [Sxz, Syz, Sz];
    for (let i = 0; i < 3; i++) {
      let q = i;
      for (let k = i + 1; k < 3; k++) if (Math.abs(A[k][i]) > Math.abs(A[q][i])) q = k;
      [A[i], A[q]] = [A[q], A[i]]; [B[i], B[q]] = [B[q], B[i]];
      for (let k = i + 1; k < 3; k++) {
        const m = A[k][i] / A[i][i];
        for (let j = i; j < 3; j++) A[k][j] -= m * A[i][j];
        B[k] -= m * B[i];
      }
    }
    const v = [0, 0, 0];
    for (let i = 2; i >= 0; i--) { let t = B[i]; for (let j = i + 1; j < 3; j++) t -= A[i][j] * v[j]; v[i] = t / A[i][i]; }
    cx = v[0] / 2; cy = v[1] / 2; R = Math.sqrt(v[2] + cx * cx + cy * cy);
  }
  return { cx, cy, R, w: W, h: H, areaR: a0.R };
}

const a = process.argv.slice(2);
const nums = a.filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
const rest = a.filter((s) => !/^-?[\d.]+$/.test(s));
const [X0, X1, Y0, Y1] = nums.length === 4 ? nums : [-34, 30, -40, 34];
const tag = rest[0] || 'whole';
const ALL = ['penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png', 'penny-obv.jpg',
  'penny-obv-1991d.png', 'penny-obv-proof2021.jpg', 'penny-obv-unc2005.png'];
const files = rest.slice(1).length ? rest.slice(1) : ALL;
const TW = 1100;
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
  const png = await sharp(Buffer.from(coinSVG('penny', 1600, { side: 'obverse' }))).flatten({ background: '#ffffff' }).png().toBuffer();
  const per = (await sharp(png).metadata()).width / 100;
  tiles.push(await tile(png, (x, y) => [x * per, y * per]));
  names.push('OURS');
}
for (const f of files) {
  const d = await discOf(f);
  tiles.push(await tile(REF + f, (x, y) => [d.cx + (x - 50) / RDISC * d.R, d.cy + (y - 50) / RDISC * d.R]));
  names.push(`${f}  (rim R ${d.R.toFixed(1)}, area ${d.areaR.toFixed(1)})`);
}
const metas = await Promise.all(tiles.map((t) => sharp(t).metadata()));
const pos = []; let x = 10;
for (const m of metas) { pos.push(x); x += m.width + 10; }
const HH = Math.max(...metas.map((m) => m.height)) + 34;
const txt = names.map((n, i) => `<text x="${pos[i]}" y="22" font-family="monospace" font-size="16" fill="#111">${n}</text>`).join('');
const out = `${OUT}_py1-grid-${tag}.png`;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${HH}"><rect width="${x}" height="${HH}" fill="#fff"/>${txt}</svg>`))
  .composite(tiles.map((b, i) => ({ input: b, left: pos[i], top: 30 }))).png().toFile(out);
console.log(`wrote ${out}  (local-frame window x ${X0}..${X1}, y ${Y0}..${Y1}, ${step} unit/line)`);
