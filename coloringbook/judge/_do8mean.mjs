// THE POOLED RELIEF MAP — nine photographs averaged in HEAD.Roosevelt's own
// local frame, so a feature can be read off the DESIGN rather than off one
// strike.
//
// WHY POOL. Every number on this face traces to one photograph: the outline to
// dime-obv-2.jpg, the jaw's width to dime-obv-3, the throat's edge to
// dime-obv-2 again ("One reference measures the throat, a different one
// measures the jaw, and neither measures both"). Nine files registered onto one
// frame let the DESIGN be separated from the lighting: a feature the die
// carries survives averaging, a highlight does not.
//
// WHAT IS AVERAGED. Not grey — the field's polarity flips between a business
// strike and a cameo proof, so grey averages to mud. |grad I|, normalised per
// file by its own median inside the bust, is large at a relief edge whichever
// side of that edge is bright, and it is the descriptor T1 already scores.
//
// The tile carries our own marks in the same frame (see `_do7over.mjs` for the
// colour key) plus a 1-unit grid, and prints a numeric PROFILE through the
// feature named on the command line so the picture can be checked as numbers.
//
// usage: node coloringbook/judge/_do8mean.mjs [x0 x1 y0 y1] [scale]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT, JUDGE } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const A = process.argv.slice(2).map(Number);
const [X0, X1, Y0, Y1] = A.length >= 4 ? A.slice(0, 4) : [-26, -2, -12, 14];
const SCALE = A.length >= 5 ? A[4] : 24;
const W = Math.round((X1 - X0) * SCALE), H = Math.round((Y1 - Y0) * SCALE);

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];
const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);

// A `perLocal`-aware gradient: the step is one local unit / 3 on every file, so
// a big photograph and a small one are differentiated at the same SCALE and the
// map is not a resolution ladder.
const HSTEP = 1 / 3;
const maps = [];
for (const f of POOL) {
  const s = await samplerFor(f);
  const B = boundary(s);
  if (!B) continue;
  const fit = icp(ourB.pts, B.pts);
  const c = Math.cos(fit.th), si = Math.sin(fit.th);
  const at = (lx, ly) => {
    const [x, y] = toView(lx, ly);
    return s.at(fit.k * (c * x - si * y) + fit.t[0], fit.k * (si * x + c * y) + fit.t[1]);
  };
  const g = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const lx = X0 + (i + 0.5) / SCALE, ly = Y0 + (j + 0.5) / SCALE;
    const a = at(lx + HSTEP, ly), b = at(lx - HSTEP, ly), cc = at(lx, ly + HSTEP), d = at(lx, ly - HSTEP);
    g[j * W + i] = (a == null || b == null || cc == null || d == null) ? 0 : Math.hypot(a - b, cc - d);
  }
  // normalise by this file's own median energy over the whole bust window
  const v = [...g].filter((q) => q > 0).sort((p, q) => p - q);
  const m = v.length ? v[v.length >> 1] : 1;
  for (let k = 0; k < g.length; k++) g[k] /= m || 1;
  maps.push({ f, g, k: fit.k, th: (fit.th * 180) / Math.PI });
  console.log(f.padEnd(24), `k ${fit.k.toFixed(3)}  theta ${((fit.th * 180) / Math.PI).toFixed(1)}  median|grad| ${m.toFixed(2)}`);
}

// MEDIAN across files, not mean: one blown-out reference cannot carry the map.
const pooled = new Float64Array(W * H);
for (let k = 0; k < pooled.length; k++) {
  const v = maps.map((m) => m.g[k]).sort((a, b) => a - b);
  pooled[k] = v[v.length >> 1];
}
const sorted = [...pooled].sort((a, b) => a - b);
const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
const buf = Buffer.alloc(W * H * 3);
for (let k = 0; k < pooled.length; k++) {
  const t = Math.max(0, Math.min(1, (pooled[k] - lo) / (hi - lo)));
  const v = Math.round(255 * t);
  buf[k * 3] = v; buf[k * 3 + 1] = v; buf[k * 3 + 2] = v;
}

// our own drawing, same window, for the side-by-side
const ourBuf = Buffer.alloc(W * H * 3);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const lx = X0 + (i + 0.5) / SCALE, ly = Y0 + (j + 0.5) / SCALE;
  const [x, y] = toView(lx, ly);
  const q = ourS.at(x, y);
  const v = q == null ? 0 : Math.round(q);
  const p = (j * W + i) * 3;
  ourBuf[p] = v; ourBuf[p + 1] = v; ourBuf[p + 2] = v;
}

const px = (lx, ly) => `${((lx - X0) * SCALE).toFixed(1)} ${((ly - Y0) * SCALE).toFixed(1)}`;
const poly = (pts, col, w = 1.6) =>
  `<path d="M ${pts.map(([a, b]) => px(a, b)).join(' L ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const HAIRLINE = [
  [-30.93, 6.44], [-28.5, 4.6], [-26.5, 3.7], [-24, 2.5], [-22, 1.6], [-20, 0.7],
  [-18.1, -0.1], [-16.5, -0.6], [-14.9, -1.1], [-13.6, -1.6], [-12.2, -1.7],
  [-11.2, -1.4], [-10.2, -0.8], [-9.4, 0.4], [-8.9, 1.1], [-8.5, 1.4], [-8.2, 1.2],
  [-7.9, 0.6], [-7.4, -0.2], [-7, -0.9], [-6.3, -1.2], [-5.6, -2], [-4.9, -2.9],
  [-4.2, -3.8], [-3.5, -5.3], [-2.9, -6.6], [-2.3, -7.9], [-1.9, -9.3], [-1.3, -10.7],
  [-0.7, -12.1], [0.1, -13.5], [0.8, -15.1], [1.6, -16.6], [2.3, -18.4], [3.2, -20],
  [4.1, -21.6], [5, -23.5], [6.1, -24.9], [7.2, -26.3], [9.3, -27.8], [10.37, -28.04],
];
const EARC = [[-11, -0.8], [-15, -1.4], [-18.8, 0.2], [-19.4, 3.4], [-20, 6.6], [-17, 9.6], [-13, 10.4]];
const EYEBROW = [[16.4, -8], [14.8, -7.4], [13.2, -6.4], [12.2, -5.4]];
const JAW = [[19.4, 20.86], [11.07, 20.04], [0.84, 17.11], [-9.99, 12.71], [-11.77, 11.19], [-13.43, 12.01],
  [-10.9, 14.44], [-0.02, 19.29], [10.92, 22.74], [19.4, 22.94]];
const G = X1 - X0 <= 30 ? 1 : 5;
let grid = '';
for (let g = Math.ceil(X0 / G) * G; g <= X1; g += G) grid += `<path d="M ${px(g, Y0)} L ${px(g, Y1)}" stroke="#ff00ff" stroke-width="0.4" opacity="0.45"/>`;
for (let g = Math.ceil(Y0 / G) * G; g <= Y1; g += G) grid += `<path d="M ${px(X0, g)} L ${px(X1, g)}" stroke="#ff00ff" stroke-width="0.4" opacity="0.45"/>`;
for (let gx = Math.ceil(X0 / (2 * G)) * 2 * G; gx <= X1; gx += 2 * G) for (let gy = Math.ceil(Y0 / (2 * G)) * 2 * G; gy <= Y1; gy += 2 * G) {
  const [a, b] = px(gx, gy).split(' ');
  grid += `<text x="${a}" y="${b}" font-size="9" fill="#ff77ff">${gx},${gy}</text>`;
}
const marks = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${grid}
  ${poly(HAIRLINE, '#ffe000', 1.8)}${poly(EARC, '#ff3030', 1.6)}
  <ellipse cx="${((-14.3 - X0) * SCALE).toFixed(1)}" cy="${((4.4 - Y0) * SCALE).toFixed(1)}" rx="${(1.4 * SCALE).toFixed(1)}" ry="${(2 * SCALE).toFixed(1)}" fill="none" stroke="#ff3030" stroke-width="1.4"/>
  ${poly(EYEBROW, '#00e5ff', 1.6)}
  <ellipse cx="${((14.2 - X0) * SCALE).toFixed(1)}" cy="${((-6.4 - Y0) * SCALE).toFixed(1)}" rx="${(1.8 * SCALE).toFixed(1)}" ry="${(1.05 * SCALE).toFixed(1)}" fill="none" stroke="#00e5ff" stroke-width="1.4"/>
  ${poly(JAW, '#33ff66', 1.4)}</svg>`;

const PAD = 10;
const t1 = await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(marks) }]).png().toBuffer();
const t2 = await sharp(ourBuf, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(marks) }]).png().toBuffer();
const t0 = await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
const file = join(JUDGE, `_do8mean-${X0}_${X1}_${Y0}_${Y1}.png`);
await sharp({ create: { width: 3 * W + 4 * PAD, height: H + 2 * PAD, channels: 3, background: '#101418' } })
  .composite([{ input: t0, left: PAD, top: PAD }, { input: t1, left: 2 * PAD + W, top: PAD }, { input: t2, left: 3 * PAD + 2 * W, top: PAD }])
  .png().toFile(file);
console.log(`\nleft: pooled median |grad| over ${maps.length} files, bare.  middle: same, with our marks.  right: OURS.`);
console.log('wrote', file.replace(ROOT, '<root>'));
