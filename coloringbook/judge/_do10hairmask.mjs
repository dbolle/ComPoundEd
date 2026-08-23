// THE HAIRLINE, SECOND ATTEMPT — and this one carries a control it can pass.
//
// `_do9hairline.mjs` walked a texture crossing along rungs and FAILED ITS OWN
// NULL TEST: run on our own render, where the answer is 0 by construction, it
// returned up to -5.50 local units, larger than anything it reported on the
// coin. Recorded there and not deleted. The reason is that our hair is a flat
// fill carrying twelve grooves, so "texture" on our art is a comb, not a field,
// and a crossing walk finds the outermost groove.
//
// SO THE CONTROL IS CHANGED, not the discriminator. Texture still separates
// hair from face on the coin. What was missing was a way to know the extraction
// is right, and this face has one sitting next to it:
//
//   THE HAIR MASS'S OUTER EDGE IS THE HEAD'S OWN SILHOUETTE over the crown and
//   the back, and `_do6sil.mjs` has that boundary on nine photographs to a
//   median of 0.03 local units.
//
// So: pool |grad I| over the nine references in our local frame, threshold
// between a frozen HAIR box and a frozen FACE box, take the component the hair
// box sits in — and check its OUTER boundary against the silhouette. If the
// extraction recovers a boundary we already know to 0.03, its INNER boundary is
// the hairline and may be reported. If it does not, nothing here is evidence
// and the round says the hairline is UNMEASURED.
//
// usage: node coloringbook/judge/_do10hairmask.mjs [scale]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT, JUDGE } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const SCALE = Number(process.argv[2] || 8);
const X0 = -40, X1 = 28, Y0 = -36, Y1 = 20;
const W = Math.round((X1 - X0) * SCALE), H = Math.round((Y1 - Y0) * SCALE);
const LX = (i) => X0 + (i + 0.5) / SCALE, LY = (j) => Y0 + (j + 0.5) / SCALE;

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];
const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);

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
    const lx = LX(i), ly = LY(j);
    const a = at(lx + HSTEP, ly), b = at(lx - HSTEP, ly), cc = at(lx, ly + HSTEP), d = at(lx, ly - HSTEP);
    g[j * W + i] = (a == null || b == null || cc == null || d == null) ? 0 : Math.hypot(a - b, cc - d);
  }
  const v = [...g].filter((q) => q > 0).sort((p, q) => p - q);
  const m = v.length ? v[v.length >> 1] : 1;
  for (let k = 0; k < g.length; k++) g[k] /= m || 1;
  maps.push(g);
}
const pooled = new Float64Array(W * H);
for (let k = 0; k < pooled.length; k++) {
  const v = maps.map((m) => m[k]).sort((a, b) => a - b);
  pooled[k] = v[v.length >> 1];
}
// smooth over 1 local unit so a single strand's own edge is not a boundary
const R = Math.max(1, Math.round(SCALE * 0.5));
const sm = new Float64Array(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  let s = 0, n = 0;
  for (let b = -R; b <= R; b++) for (let a = -R; a <= R; a++) {
    const p = j + b, q = i + a;
    if (p < 0 || q < 0 || p >= H || q >= W) continue;
    s += pooled[p * W + q]; n++;
  }
  sm[j * W + i] = s / n;
}

// INSIDE THE BUST ONLY, INSET 1.5 UNITS. The silhouette's own edge is the
// largest gradient anywhere on the coin, so a texture component seeded in the
// hair leaks straight through it into the field — which is exactly what the
// first run of this instrument did (+4.00 on 10 of 13 control rays, the search
// bound). Our own silhouette is known to 0.03 local units (`_do6sil.mjs`), so
// it is used as the mask and the fault cannot recur silently.
const ourLocal0 = ourB.pts.map(([x, y]) => [(x - (50 + o.cx)) / (o.dir * o.s), (y - o.cy) / o.s]);
let ccx = 0, ccy = 0;
for (const p of ourLocal0) { ccx += p[0]; ccy += p[1]; }
ccx /= ourLocal0.length; ccy /= ourLocal0.length;
const SIL = new Map();
for (const [x, y] of ourLocal0) {
  const a = Math.round(((Math.atan2(y - ccy, x - ccx) * 180) / Math.PI + 360) % 360);
  const r = Math.hypot(x - ccx, y - ccy);
  if (!SIL.has(a) || r > SIL.get(a)) SIL.set(a, r);
}
const silR = (a) => SIL.get(a) ?? SIL.get((a + 1) % 360) ?? SIL.get((a + 359) % 360) ?? 0;
const inside = (lx, ly) => {
  const a = Math.round(((Math.atan2(ly - ccy, lx - ccx) * 180) / Math.PI + 360) % 360) % 360;
  return Math.hypot(lx - ccx, ly - ccy) <= silR(a) - 1.5;
};
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (!inside(LX(i), LY(j))) sm[j * W + i] = 0;

// FROZEN SAMPLE BOXES — stated here so they can be re-read, and chosen to be
// unambiguous on all nine: the hair box is the top of the crown, the face box
// is the open cheek, which every comment in coins.js already uses as its tone
// normaliser.
const boxMed = (x0, x1, y0, y1) => {
  const v = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const lx = LX(i), ly = LY(j);
    if (lx >= x0 && lx <= x1 && ly >= y0 && ly <= y1) v.push(sm[j * W + i]);
  }
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
};
const hairE = boxMed(-24, -12, -26, -18);
const faceE = boxMed(4, 14, 0, 10);
const T = (hairE + faceE) / 2;
console.log(`pooled |grad| (normalised): HAIR box (-24..-12, -26..-18) = ${hairE.toFixed(2)}`);
console.log(`                            FACE box (  4..14 ,   0..10 ) = ${faceE.toFixed(2)}`);
console.log(`                            ratio ${(hairE / faceE).toFixed(2)}   threshold ${T.toFixed(2)}`);
if (hairE / faceE < 1.5) console.log('  *** under 1.5x — the two do not separate and nothing below is evidence');

// component containing the hair seed
const mask = new Uint8Array(W * H);
for (let k = 0; k < mask.length; k++) if (sm[k] > T) mask[k] = 1;
const si0 = Math.round((-18 - X0) * SCALE), sj0 = Math.round((-22 - Y0) * SCALE);
const comp = new Uint8Array(W * H);
const st = [sj0 * W + si0]; comp[sj0 * W + si0] = 1;
while (st.length) {
  const p = st.pop(), i = p % W, j = (p / W) | 0;
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const q = i + a, r = j + b;
    if (q < 0 || r < 0 || q >= W || r >= H) continue;
    const z = r * W + q;
    if (mask[z] && !comp[z]) { comp[z] = 1; st.push(z); }
  }
}

// ── CONTROL: does the extracted region's OUTER edge land on the silhouette? ──
// Our own silhouette in local units, over the crown and back, sampled by ray
// from the head's centroid.
const cx = ccx, cy = ccy, sil = SIL;
const inComp = (lx, ly) => {
  const i = Math.round((lx - X0) * SCALE - 0.5), j = Math.round((ly - Y0) * SCALE - 0.5);
  if (i < 0 || j < 0 || i >= W || j >= H) return false;
  return !!comp[j * W + i];
};
console.log('\nCONTROL — the extracted region\'s OUTER edge against the silhouette');
console.log('  (angles where the head\'s own edge IS hair: the crown and the back)');
console.log('  angle  silhouette r   texture r    delta');
const ctl = [];
for (let a = 195; a <= 300; a += 7.5) {
  const rs = silR(Math.round(a));
  if (!rs) continue;
  const t = (a * Math.PI) / 180;
  let rt = null;
  for (let r = rs - 1.6; r > 4; r -= 0.1) if (inComp(cx + r * Math.cos(t), cy + r * Math.sin(t))) { rt = r; break; }
  if (rt == null) continue;
  ctl.push(rt - rs);
  console.log(`  ${String(a).padStart(5)}  ${rs.toFixed(2).padStart(12)}  ${rt.toFixed(2).padStart(10)}  ${(rt - rs).toFixed(2).padStart(7)}`);
}
const cm = ctl.reduce((a, b) => a + b, 0) / ctl.length;
const cmax = Math.max(...ctl.map(Math.abs));
console.log(`  mean ${cm.toFixed(2)}   max |.| ${cmax.toFixed(2)}   over ${ctl.length} rays`);
const OK = cmax <= 1.8;
console.log(OK
  ? '  CONTROL PASSES — the extraction recovers a boundary already known to 0.03; the inner edge may be read.'
  : '  CONTROL FAILS — the extraction does not recover a boundary we already know. UNMEASURED.');

// ── the inner edge, at the same stations _do9 used ───────────────────────
const RUN = [
  [-30.93, 6.44], [-28.5, 4.6], [-26.5, 3.7], [-24, 2.5], [-22, 1.6], [-20, 0.7],
  [-18.1, -0.1], [-16.5, -0.6], [-14.9, -1.1], [-13.6, -1.6], [-12.2, -1.7],
  [-11.2, -1.4], [-10.2, -0.8], [-9.4, 0.4], [-8.9, 1.1], [-8.5, 1.4], [-8.2, 1.2],
  [-7.9, 0.6], [-7.4, -0.2], [-7, -0.9], [-6.3, -1.2], [-5.6, -2], [-4.9, -2.9],
  [-4.2, -3.8], [-3.5, -5.3], [-2.9, -6.6], [-2.3, -7.9], [-1.9, -9.3], [-1.3, -10.7],
  [-0.7, -12.1], [0.1, -13.5], [0.8, -15.1], [1.6, -16.6], [2.3, -18.4], [3.2, -20],
  [4.1, -21.6], [5, -23.5], [6.1, -24.9], [7.2, -26.3], [9.3, -27.8], [10.37, -28.04],
];
const PICK = [['nape', 2], ['back-low', 5], ['over ear', 9], ['sideburn tip', 15],
  ['temple', 21], ['upper temple', 25], ['brow', 29], ['mid forehead', 33], ['high forehead', 37]];
console.log('\nTHE HAIRLINE — offset of the extracted inner edge from where we draw it.');
console.log('  POSITIVE = the coin\'s hair reaches FURTHER onto the face than ours does.');
console.log('  station         our (x,y)          offset');
for (const [name, i] of PICK) {
  const p = RUN[i], a = RUN[Math.max(0, i - 1)], b = RUN[Math.min(RUN.length - 1, i + 1)];
  let tx = b[0] - a[0], ty = b[1] - a[1];
  const L = Math.hypot(tx, ty); tx /= L; ty /= L;
  const nx = ty, ny = -tx; // into the hair
  // walk from +6 (inside the hair) outward to -8; the edge is the last inside
  let d = null;
  for (let t = 6; t >= -8; t -= 0.05) {
    if (!inComp(p[0] + nx * t, p[1] + ny * t)) { d = t; break; }
  }
  console.log(`  ${name.padEnd(15)} ${`${p[0].toFixed(1)}, ${p[1].toFixed(1)}`.padEnd(16)} ${d == null ? '  (still hair at -8)' : d.toFixed(2).padStart(7)}`);
}

// picture
const buf = Buffer.alloc(W * H * 3);
const v2 = [...sm].sort((a, b) => a - b);
const lo = v2[Math.floor(v2.length * 0.02)], hi = v2[Math.floor(v2.length * 0.98)];
for (let k = 0; k < sm.length; k++) {
  const t = Math.max(0, Math.min(1, (sm[k] - lo) / (hi - lo)));
  const g = Math.round(255 * t);
  buf[k * 3] = comp[k] ? Math.min(255, g + 60) : g;
  buf[k * 3 + 1] = g;
  buf[k * 3 + 2] = comp[k] ? g : Math.min(255, g + 60);
}
const px = (lx, ly) => `${((lx - X0) * SCALE).toFixed(1)} ${((ly - Y0) * SCALE).toFixed(1)}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <path d="M ${RUN.map(([a, b]) => px(a, b)).join(' L ')}" fill="none" stroke="#ffe000" stroke-width="1.8"/>
  <rect x="${((-24 - X0) * SCALE).toFixed(1)}" y="${((-26 - Y0) * SCALE).toFixed(1)}" width="${12 * SCALE}" height="${8 * SCALE}" fill="none" stroke="#00ff88" stroke-width="1.4"/>
  <rect x="${((4 - X0) * SCALE).toFixed(1)}" y="${((0 - Y0) * SCALE).toFixed(1)}" width="${10 * SCALE}" height="${10 * SCALE}" fill="none" stroke="#00ff88" stroke-width="1.4"/>
</svg>`;
const file = join(JUDGE, '_do10hairmask.png');
await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(svg) }]).png().toFile(file);
console.log('\n  blue-tinted = the extracted hair region; green boxes are the two frozen samples');
console.log('  wrote', file.replace(ROOT, '<root>'));
