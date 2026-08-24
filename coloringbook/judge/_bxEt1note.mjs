// BUCK — the transfer test T1 CANNOT RUN ON THIS FACE, and its substitute.
//
// `_jt1transfer.mjs`'s `POOL_BY_SIDE` has four keys: penny, nickel, dime,
// quarter. THERE IS NO `buck` ROW. "T1 32/32" is 4 denominations x 2 faces x 4
// sizes; the $1 note is not one of the 32. The primary gate of §0.1 is
// structurally blind to a fifth of the set — the same locus fault that file
// already documents about its own two predecessors (obverses only; D11 at a
// size the app never draws).
//
// It cannot simply be added. T1 registers by `discOf()` and samples a DISC;
// a note has no disc, and the between-denomination question it asks is
// degenerate for the buck anyway because the set contains exactly one banknote.
//
// WHAT THE NOTE CAN SUPPORT is the same question one level down: is our
// obverse nearer the note's OBVERSE photographs than its REVERSE ones, and
// vice versa? Both faces are green rectangles of the same size with a device in
// the middle, so this is a real discrimination and not a give-away.
//
// Registration is the PRINTED BORDER (`_bx2fit.mjs`), for the photographs and
// for our own render alike — our frame rect x 5..95, y 5..51 IS our printed
// border, so both sides are fitted the same way and neither is flattered.
// Descriptor: blurred gradient energy, zero-mean unit-variance, NCC — the same
// one `_jt1transfer.mjs` uses, for the same reason (raw greyscale scored 3/12
// on that file's own control).
//
// CONTROL FIRST: the four photographs are sorted by face before our art is
// looked at. If the control fails, nothing below is reported.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT, REF } from './_paths.mjs';
import { fit2 } from './_bx2fit.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

const GW = 160, GH = 82;                       // ~ the note's 90:46 border aspect
const POOL = { obverse: ['bill-obv.jpg', 'bill-obv-2.jpg'], reverse: ['bill-rev.jpg', 'bill-rev-2.jpg'] };
const SIZES = [38, 48, 54, 84];

function energy(g, w, h) {
  // 3x3 box blur, then gradient magnitude, then blur again — same shape of
  // descriptor as _jt1transfer's; then zero-mean unit-variance.
  const b = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const jj = j + dy, ii = i + dx; if (jj < 0 || ii < 0 || jj >= h || ii >= w) continue; s += g[jj * w + ii]; n++;
    }
    b[j * w + i] = s / n;
  }
  const e = new Float64Array(w * h);
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
    const gx = b[j * w + i + 1] - b[j * w + i - 1], gy = b[(j + 1) * w + i] - b[(j - 1) * w + i];
    e[j * w + i] = Math.hypot(gx, gy);
  }
  const f = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let s = 0, n = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const jj = j + dy, ii = i + dx; if (jj < 0 || ii < 0 || jj >= h || ii >= w) continue; s += e[jj * w + ii]; n++;
    }
    f[j * w + i] = s / n;
  }
  let m = 0; for (const v of f) m += v; m /= f.length;
  let s2 = 0; for (const v of f) s2 += (v - m) ** 2; s2 = Math.sqrt(s2 / f.length) || 1;
  return f.map((v) => (v - m) / s2);
}
const ncc = (a, b) => { let s = 0; for (let k = 0; k < a.length; k++) s += a[k] * b[k]; return s / a.length; };

async function refGrid(f) {
  const r = await fit2(f);
  const [L, T, R, B] = r.border;
  const src = sharp(join(REF, f));
  const { width: SW, height: SH } = await src.metadata();
  const g = await src.clone().greyscale().raw().toBuffer();
  const out = new Float64Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const x = L + ((i + 0.5) / GW) * (R - L), y = T + ((j + 0.5) / GH) * (B - T);
    out[j * GW + i] = g[Math.min(SH - 1, Math.max(0, y | 0)) * SW + Math.min(SW - 1, Math.max(0, x | 0))];
  }
  return energy(out, GW, GH);
}
async function ourGrid(side, size) {
  const svg = coinSVG('buck', size, { side, decorative: true });
  const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
  const w = Math.max(1, Math.round(+m[1])), h = Math.max(1, Math.round(+m[2]));
  // render NATIVELY at the size the app draws, then sample the frame rect
  const raw = await sharp(Buffer.from(svg), { density: 96 }).resize(w, h).greyscale().raw().toBuffer();
  const out = new Float64Array(GW * GH);
  const L = 0.05 * w, R = 0.95 * w, T = (5 / 56) * h, B = (51 / 56) * h;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const x = L + ((i + 0.5) / GW) * (R - L), y = T + ((j + 0.5) / GH) * (B - T);
    out[j * GW + i] = raw[Math.min(h - 1, Math.max(0, y | 0)) * w + Math.min(w - 1, Math.max(0, x | 0))];
  }
  return energy(out, GW, GH);
}

const G = {};
for (const side of ['obverse', 'reverse']) for (const f of POOL[side]) G[f] = await refGrid(f);
console.log('CONTROL FIRST — can the descriptor sort the four real note photographs by FACE?');
let ctl = 0;
for (const side of ['obverse', 'reverse']) for (const f of POOL[side]) {
  const sc = {};
  for (const s2 of ['obverse', 'reverse']) sc[s2] = Math.max(...POOL[s2].filter((q) => q !== f).map((q) => ncc(G[f], G[q])));
  const best = sc.obverse >= sc.reverse ? 'obverse' : 'reverse';
  const ok = best === side; if (ok) ctl++;
  console.log(`  ${f.padEnd(16)} obv ${sc.obverse.toFixed(4)}  rev ${sc.reverse.toFixed(4)}  -> ${best}  ${ok ? 'OK' : 'WRONG'}`);
}
console.log(`  CONTROL: ${ctl}/4 photographs sorted by face.`);
if (ctl < 4) { console.log('  Control failed — nothing is reported about our art.'); process.exit(0); }

console.log('\nOUR ART — is each face nearer the note\'s photographs of THAT face?');
let ok = 0, tot = 0;
for (const size of SIZES) {
  const row = [];
  for (const side of ['obverse', 'reverse']) {
    const q = await ourGrid(side, size);
    const so = Math.max(...POOL.obverse.map((f) => ncc(q, G[f])));
    const sr = Math.max(...POOL.reverse.map((f) => ncc(q, G[f])));
    const best = so >= sr ? 'obverse' : 'reverse';
    tot++; if (best === side) ok++;
    row.push(`${side.padEnd(8)} obv ${so.toFixed(4)} rev ${sr.toFixed(4)} -> ${best.padEnd(8)} ${best === side ? 'OK' : 'CONFUSED'} margin ${(Math.abs(so - sr)).toFixed(4)}`);
  }
  console.log(`  ${String(size).padStart(3)}px  ${row[0]}\n         ${row[1]}`);
}
console.log(`\nT1-note: ${ok}/${tot} correct across ${SIZES.length} sizes x 2 faces.`);
