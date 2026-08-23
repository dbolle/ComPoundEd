// THE OVERLAY OBLIGATION (§4.3) — every reference warped into HEAD.Roosevelt's
// OWN local frame, with our INTERIOR divisions drawn on top of it.
//
// The silhouette ladder (`_do6sil.mjs`) says the outer bound is right on nine
// photographs to a median of 0.1 local units. That is exactly the situation the
// cent reverse was in when its INTERIOR division turned out to be 3.8 units
// out: a passing outer bound says nothing about what is inside it.
//
// So this warps each photograph through the ICP similarity that registers OUR
// bust onto it, inverted — the result is a picture of the coin in the units
// `HEAD.Roosevelt` is written in, one local unit per `SCALE` pixels, the SAME
// frame for all nine — and then draws, in colour:
//
//   yellow   HAIR.Roosevelt's return run: the HAIRLINE, the sideburn, the run
//            over the ear and the nape. This is the division that has never
//            been measured on this face.
//   red      EAR_ROOSEVELT's outer helix and its dark hollow
//   cyan     EYE_ROOSEVELT's brow stroke and its almond
//   green    RELIEF.Roosevelt.dark — the jaw region
//   magenta  a 5-local-unit grid, so anything can be read off in numbers
//
// usage: node coloringbook/judge/_do7over.mjs [file|all] [scale]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT, JUDGE } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const which = process.argv[2] || 'all';
const SCALE = Number(process.argv[3] || 9);   // px per local unit
// The local window. Defaults cover the whole bust; pass `x0 x1 y0 y1` to zoom
// on one feature, which is how the ear and the hairline were read.
const [X0, X1, Y0, Y1] = process.argv.length >= 8
  ? process.argv.slice(4, 8).map(Number)
  : [-42, 32, -40, 46];
const GRID = X1 - X0 <= 30 ? 1 : 5;
const W = Math.round((X1 - X0) * SCALE), H = Math.round((Y1 - Y0) * SCALE);

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
// our local -> our viewBox
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];

const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);

const files = which === 'all' ? ['ours', ...POOL] : [which];
const out = [];
for (const f of files) {
  let sample; // (lx, ly) -> grey
  if (f === 'ours') {
    sample = (lx, ly) => { const [x, y] = toView(lx, ly); return ourS.at(x, y); };
  } else {
    const s = await samplerFor(f);
    const B = boundary(s);
    if (!B) { console.log(f, 'NO COMPONENT — skipped'); continue; }
    const fit = icp(ourB.pts, B.pts);
    const c = Math.cos(fit.th), si = Math.sin(fit.th);
    sample = (lx, ly) => {
      const [x, y] = toView(lx, ly);
      return s.at(fit.k * (c * x - si * y) + fit.t[0], fit.k * (si * x + c * y) + fit.t[1]);
    };
    console.log(f.padEnd(24), `k ${fit.k.toFixed(3)}  theta ${((fit.th * 180) / Math.PI).toFixed(1)} deg`);
  }
  const buf = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const lx = X0 + (i + 0.5) / SCALE, ly = Y0 + (j + 0.5) / SCALE;
    const q = sample(lx, ly);
    const v = q == null ? 0 : Math.max(0, Math.min(255, Math.round(q)));
    const p = (j * W + i) * 3;
    buf[p] = v; buf[p + 1] = v; buf[p + 2] = v;
  }
  out.push({ f, buf });
}

// ── the marks, as an SVG laid over each tile in the same local frame ──────
const px = (lx, ly) => `${((lx - X0) * SCALE).toFixed(1)} ${((ly - Y0) * SCALE).toFixed(1)}`;
const poly = (pts, col, w = 1.6) =>
  `<path d="M ${pts.map(([a, b]) => px(a, b)).join(' L ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
// HAIR.Roosevelt's return run, knot by knot (the hairline half of the path)
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
let grid = '';
for (let g = Math.ceil(X0 / GRID) * GRID; g <= X1; g += GRID) grid += `<path d="M ${px(g, Y0)} L ${px(g, Y1)}" stroke="#ff00ff" stroke-width="0.4" opacity="0.5"/>`;
for (let g = Math.ceil(Y0 / GRID) * GRID; g <= Y1; g += GRID) grid += `<path d="M ${px(X0, g)} L ${px(X1, g)}" stroke="#ff00ff" stroke-width="0.4" opacity="0.5"/>`;
for (let gx = Math.ceil(X0 / (GRID*2)) * (GRID*2); gx <= X1; gx += GRID*2) for (let gy = Math.ceil(Y0 / (GRID*2)) * (GRID*2); gy <= Y1; gy += GRID*2) {
  const [a, b] = px(gx, gy).split(' ');
  grid += `<text x="${a}" y="${b}" font-size="7" fill="#ff66ff">${gx},${gy}</text>`;
}
const marks = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${grid}
  ${poly(HAIRLINE, '#ffe000', 1.8)}
  ${poly(EARC, '#ff3030', 1.6)}
  <ellipse cx="${((-14.3 - X0) * SCALE).toFixed(1)}" cy="${((4.4 - Y0) * SCALE).toFixed(1)}" rx="${(1.4 * SCALE).toFixed(1)}" ry="${(2 * SCALE).toFixed(1)}" fill="none" stroke="#ff3030" stroke-width="1.4"/>
  ${poly(EYEBROW, '#00e5ff', 1.6)}
  <ellipse cx="${((14.2 - X0) * SCALE).toFixed(1)}" cy="${((-6.4 - Y0) * SCALE).toFixed(1)}" rx="${(1.8 * SCALE).toFixed(1)}" ry="${(1.05 * SCALE).toFixed(1)}" fill="none" stroke="#00e5ff" stroke-width="1.4"/>
  ${poly(JAW, '#33ff66', 1.4)}
</svg>`;

const PAD = 10, COLS = Math.min(5, out.length);
const rowsN = Math.ceil(out.length / COLS);
const comps = [];
for (let i = 0; i < out.length; i++) {
  const col = i % COLS, row = (i / COLS) | 0;
  const tile = await sharp(out[i].buf, { raw: { width: W, height: H, channels: 3 } })
    .composite([{ input: Buffer.from(marks) }]).png().toBuffer();
  comps.push({ input: tile, left: PAD + col * (W + PAD), top: PAD + row * (H + PAD) });
}
const file = join(JUDGE, `_do7over-${which === 'all' ? 'sheet' : which.replace(/\W/g, '_')}.png`);
await sharp({ create: { width: PAD + COLS * (W + PAD), height: PAD + rowsN * (H + PAD), channels: 3, background: '#101418' } })
  .composite(comps).png().toFile(file);
console.log('tiles, in order:', out.map((r) => r.f).join(' | '));
console.log('wrote', file.replace(ROOT, '<root>'));
