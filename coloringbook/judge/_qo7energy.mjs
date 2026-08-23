// QUARTER OBVERSE — WHERE THE TEXTURE IS IN THE WIG, ours against the coin's.
//
// The direction instrument (`_qo5field.mjs`) asks "which way do the strands
// run"; it can only ask that where BOTH sides have strands. This asks the prior
// question: WHERE does each side put any texture at all?
//
// Same band-pass as _qo5field (sigma 0.30 .. 2.2 viewBox units, set from the
// coin's own measured wig pitch of 0.95-1.75 units), then the RMS of the band
// in each cell of a grid over the wig, normalised per image by that image's own
// median cell so absolute contrast and exposure drop out. A ratio of two
// quantities on the SAME photograph, which is the only kind of number that
// survives here.
//
// The wig region is taken from the LIVE art — the HAIR path's own bounding box,
// read off the emitted render — so it cannot drift from the drawing.
//
// NULL TEST: the same pipeline on a flat synthetic field must return a flat map
// with no cell above 1.5x its own median.
//
// Run: node coloringbook/judge/_qo7energy.mjs
import { STRUCK, disc, grey, atVB, ours, atVBours } from './_qo1zoom.mjs';

const X0 = 36, Y0 = 8, X1 = 88, Y1 = 64, PPU = 10;
const W = (X1 - X0) * PPU, H = (Y1 - Y0) * PPU;
const gx = (i) => X0 + (i + 0.5) / PPU, gy = (j) => Y0 + (j + 0.5) / PPU;

function gauss(src, sig) {
  const s = sig * PPU, r = Math.max(1, Math.ceil(3 * s)), k = [];
  let sum = 0; for (let t = -r; t <= r; t++) { const v = Math.exp(-t * t / (2 * s * s)); k.push(v); sum += v; }
  for (let t = 0; t < k.length; t++) k[t] /= sum;
  const tmp = new Float64Array(W * H), out = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * src[j * W + Math.max(0, Math.min(W - 1, i + t))]; tmp[j * W + i] = a; }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * tmp[Math.max(0, Math.min(H - 1, j + t)) * W + i]; out[j * W + i] = a; }
  return out;
}
const band = (src) => { const lo = gauss(src, 2.2), hi = gauss(src, 0.30), o = new Float64Array(W * H); for (let p = 0; p < W * H; p++) o[p] = hi[p] - lo[p]; return o; };
const build = (s) => { const a = new Float64Array(W * H); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) a[j * W + i] = s(gx(i), gy(j)); return a; };

// ── the cells: a grid in the HEAD'S OWN LOCAL FRAME, so a cell means the same
// place on every image. Local -> viewBox with the live transform.
const L2V = ([lx, ly]) => [49.6 - 0.98 * lx, 41.8 + 0.98 * ly];
const CELL = 4;
const cells = [];
for (let lx = -22; lx <= 10; lx += CELL) for (let ly = -28; ly <= 8; ly += CELL) cells.push([lx, ly]);

function rmsAt(b, X, Y, rad = 2.0) {
  const ci = (X - X0) * PPU, cj = (Y - Y0) * PPU, r = Math.round(rad * PPU);
  let s = 0, n = 0;
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    if (di * di + dj * dj > r * r) continue;
    const i = Math.round(ci + di), j = Math.round(cj + dj);
    if (i < 0 || j < 0 || i >= W || j >= H) continue;
    s += b[j * W + i] ** 2; n++;
  }
  return n ? Math.sqrt(s / n) : 0;
}
const norm = (vals) => { const s = [...vals].sort((a, b) => a - b); const med = s[s.length >> 1] || 1e-9; return vals.map((v) => v / med); };

console.log('=== NULL TEST ===');
{
  const b = band(build(() => 140));
  const v = cells.map(([lx, ly]) => rmsAt(b, ...L2V([lx, ly])));
  const nv = norm(v);
  const worst = Math.max(...nv.filter(Number.isFinite));
  console.log(`  flat field: worst cell / median = ${Number.isFinite(worst) ? worst.toFixed(3) : 'n/a (all zero)'}  ${(!Number.isFinite(worst) || worst < 1.5) ? 'ok' : '!! FAIL'}`);
  if (Number.isFinite(worst) && worst >= 1.5) process.exit(1);
}

const maps = {};
{ const o = await ours(2000); maps.OURS = band(build((X, Y) => atVBours(o, X, Y))); }
for (const f of STRUCK) { const d = await disc(f), g = await grey(f); maps[f] = band(build((X, Y) => atVB(g, d, X, Y))); }

const keys = ['OURS', ...STRUCK];
const raw = {}, rel = {};
for (const k of keys) { raw[k] = cells.map(([lx, ly]) => rmsAt(maps[k], ...L2V([lx, ly]))); rel[k] = norm(raw[k]); }

console.log('\n=== band-pass RMS per cell, each column divided by ITS OWN median cell ===');
console.log('local(x,y) is the head frame; viewBox is where that lands\n');
console.log('local        viewBox        OURS' + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(12)).join('') + '   coin mean');
const front = [], mid = [], back = [];
cells.forEach(([lx, ly], n) => {
  const [X, Y] = L2V([lx, ly]);
  const coin = STRUCK.map((f) => rel[f][n]);
  const cm = coin.reduce((a, b) => a + b, 0) / coin.length;
  // only report cells inside the wig mass: the coin has real texture there
  if (cm < 0.8 && rel.OURS[n] < 0.8) return;
  console.log(`(${String(lx).padStart(4)},${String(ly).padStart(4)})  (${X.toFixed(1)},${Y.toFixed(1)})`.padEnd(26)
    + rel.OURS[n].toFixed(2).padStart(6) + coin.map((v) => v.toFixed(2).padStart(12)).join('') + cm.toFixed(2).padStart(12));
  const bucket = lx > -2 ? front : lx > -12 ? mid : back;
  bucket.push({ lx, ly, ours: rel.OURS[n], coin: cm });
});

console.log('\n=== the wig, in thirds along the head\'s own x axis ===');
for (const [name, b] of [['FRONT  (local x > -2, the rolls that frame the forehead)', front],
  ['MIDDLE (local x -12..-2)', mid], ['BACK   (local x <= -12, occiput and nape)', back]]) {
  if (!b.length) { console.log(`${name}: no cells`); continue; }
  const o = b.reduce((a, c) => a + c.ours, 0) / b.length, c = b.reduce((a, d) => a + d.coin, 0) / b.length;
  const blank = b.filter((x) => x.ours < 0.35).length;
  console.log(`${name.padEnd(56)} n=${String(b.length).padStart(2)}   ours ${o.toFixed(2)}   coin ${c.toFixed(2)}   ours/coin ${(o / c).toFixed(2)}   cells where ours is under 0.35 of its own median: ${blank}/${b.length}`);
}
