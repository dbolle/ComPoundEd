// BUCK obverse round — the HEAD-AND-WIG mass inside the vignette, measured on
// BOTH obverse photographs through the printed-border fiducial, and compared
// with the live `VIGNETTE.head` path run out of `coins.js`.
//
// `_sw7gen.mjs`'s control points were read off a ladder registered on the PAPER
// BOX, whose two obverse photographs disagree by 5.9%; `_sw5seg.mjs` recorded
// the consequence as a 0.90-unit rigid X shift and IoU 0.582 between the two
// masks. This re-measures on the border fiducial to see whether that
// disagreement was the note or the registration.
//
// METHOD  inside the fitted vignette ellipse, blur to a 1.0-unit box (the
// engraving is line work, the mass is a region), threshold at the window's own
// Otsu, keep the largest LIGHT component, and report its per-row X extent.
// NULL TEST   the window is the fitted ellipse; a mask touching the ellipse is
//             flagged per row and the mask fraction of the window is printed.
// SELECTION   top-3 component sizes and the margin.
// RESPONSE    `--response` moves the threshold +-8 and prints the movement.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { rectify, S, W, H } from './_bx3rect.mjs';
import { sweep } from './_bx4vig.mjs';
import { ROOT } from './_paths.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

// ours, RUN not restated: rasterise the live obverse and read back the mask of
// the two head tones (`cloth` #a9c8a4 head+neck and `body` #cfe3c6 face).
async function oursMask() {
  const svg = coinSVG('buck', 380, { side: 'obverse', decorative: true })
    .replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`);
  const raw = await sharp(Buffer.from(svg)).resize(W, H).removeAlpha().raw().toBuffer();
  const m = new Uint8Array(W * H);
  const want = [[0xa9, 0xc8, 0xa4], [0xcf, 0xe3, 0xc6], [0xea, 0xf4, 0xe3]]; // cloth, body, field(jabot)
  let n = 0;
  for (let k = 0; k < W * H; k++) {
    const r = raw[k * 3], g = raw[k * 3 + 1], b = raw[k * 3 + 2];
    for (const [wr, wg, wb] of want) if (Math.abs(r - wr) < 10 && Math.abs(g - wg) < 10 && Math.abs(b - wb) < 10) { m[k] = 1; n++; break; }
  }
  if (!n) throw new Error('ours: no head-tone pixels found — the palette moved, this instrument is invalid');
  return m;
}
function otsuOf(vals) {
  const h = new Array(256).fill(0); for (const v of vals) h[v]++;
  const tot = vals.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i];
  let sB = 0, wB = 0, best = 0, bv = -1;
  for (let t = 0; t < 256; t++) { wB += h[t]; if (!wB) continue; const wF = tot - wB; if (!wF) break; sB += t * h[t];
    const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2; if (v > bv) { bv = v; best = t; } }
  return best;
}
function headMask(r, E, dt = 0) {
  const inside = (i, j) => { const X = (i + 0.5) / S, Y = (j + 0.5) / S; return ((X - E.cx) / E.rx) ** 2 + ((Y - E.cy) / E.ry) ** 2 <= 1; };
  const K = 5;
  const vals = []; const blur = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (!inside(i, j)) continue;
    let s = 0, n = 0;
    for (let b = -K; b <= K; b++) for (let a = -K; a <= K; a++) { const jj = j + b, ii = i + a; if (jj < 0 || ii < 0 || jj >= H || ii >= W) continue; s += r.plane[jj * W + ii]; n++; }
    blur[j * W + i] = s / n; vals.push(Math.round(s / n));
  }
  const thr = otsuOf(vals) + dt;
  const mask = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (inside(i, j) && blur[j * W + i] > thr) mask[j * W + i] = 1;
  // largest component
  const lab = new Int32Array(W * H).fill(-1), sizes = [], st = [];
  for (let k = 0; k < W * H; k++) { if (!mask[k] || lab[k] >= 0) continue; const id = sizes.length; sizes.push(0); st.push(k); lab[k] = id;
    while (st.length) { const q = st.pop(); sizes[id]++; const qi = q % W, qj = (q / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = qi + dx, nj = qj + dy; if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        const nk = nj * W + ni; if (mask[nk] && lab[nk] < 0) { lab[nk] = id; st.push(nk); } } } }
  const order = sizes.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
  const big = order[0][0];
  const out = new Uint8Array(W * H); let n = 0;
  for (let k = 0; k < W * H; k++) if (lab[k] === big) { out[k] = 1; n++; }
  return { mask: out, thr, n, area: n, top3: order.slice(0, 3).map((o) => o[1]), winArea: vals.length };
}
const rowExtent = (m, Y) => { const j = Math.round(Y * S - 0.5); let a = -1, b = -1;
  for (let i = 0; i < W; i++) if (m[j * W + i]) { if (a < 0) a = i; b = i; }
  return a < 0 ? null : [(a + 0.5) / S, (b + 0.5) / S]; };

const om = await oursMask();
const res = {};
for (const f of ['bill-obv.jpg', 'bill-obv-2.jpg']) {
  const r = await rectify(f);
  const E = sweep(r);
  const hm = headMask(r, E);
  res[f] = { r, E, hm };
  console.log(`${f}   vignette fit cx ${E.cx} cy ${E.cy} rx ${E.rx} ry ${E.ry}`);
  console.log(`  head mask: otsu ${hm.thr}, components ${hm.top3.join(', ')}, kept ${hm.area}px = ${(100 * hm.area / hm.winArea).toFixed(1)}% of the ellipse`);
  if (process.argv.includes('--response')) for (const dt of [-8, 8]) { const q = headMask(r, E, dt); console.log(`  response thr${dt >= 0 ? '+' : ''}${dt}: kept ${(100 * q.area / q.winArea).toFixed(1)}% of the ellipse`); }
}
const A = res['bill-obv.jpg'], Bf = res['bill-obv-2.jpg'];
// ours: same statistic
let on = 0; for (let k = 0; k < W * H; k++) if (om[k]) on++;
console.log(`\nours: head+face+jabot tones = ${on}px; inside the DRAWN ellipse (9.75x14 at 50.05,30.30) that is ${(100 * on / (Math.PI * 9.75 * 14 * S * S)).toFixed(1)}% of it`);
console.log('\nper-row X extent of the light head-and-wig mass, viewBox units');
console.log('   Y     bill-obv        bill-obv-2       OURS            ref width  our width');
for (let Y = 17; Y <= 40; Y += 1) {
  const a = rowExtent(A.hm.mask, Y), b = rowExtent(Bf.hm.mask, Y), o = rowExtent(om, Y);
  const fmt = (e) => e ? `${e[0].toFixed(1)}..${e[1].toFixed(1)}`.padEnd(14) : '—'.padEnd(14);
  const wid = (e) => e ? (e[1] - e[0]).toFixed(1).padStart(5) : '    —';
  const mw = a && b ? ((a[1] - a[0]) + (b[1] - b[0])) / 2 : null;
  console.log(`  ${String(Y).padStart(2)}   ${fmt(a)}  ${fmt(b)}  ${fmt(o)}  ${mw === null ? '    —' : mw.toFixed(1).padStart(5)}     ${wid(o)}`);
}
const dir = process.argv[2];
if (dir && !dir.startsWith('--')) {
  for (const [f, o] of Object.entries(res)) {
    const base = await sharp(o.r.colour, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
    const rgba = Buffer.alloc(W * H * 4);
    for (let k = 0; k < W * H; k++) { if (o.hm.mask[k]) { rgba[k * 4] = 255; rgba[k * 4 + 3] = 110; } if (om[k]) { rgba[k * 4 + 2] = 255; rgba[k * 4 + 3] = Math.max(rgba[k * 4 + 3], 110); } }
    const ov = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
    const comp = await sharp(base).composite([{ input: ov }]).png().toBuffer();
    await sharp(comp).extract({ left: 340, top: 120, width: 340, height: 380 }).resize(680).png().toFile(join(dir, 'bx6-' + f.replace('.jpg', '.png')));
    console.log('wrote bx6-' + f.replace('.jpg', '.png') + '  (red = the note\'s light mass, blue = ours)');
  }
}
