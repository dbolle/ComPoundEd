// BUCK obverse round — REGISTRATION v2. Self-contained.
//
// v1 (`_bx1fit.mjs`) took the DARKEST row/col near each paper edge. On
// `bill-obv-2.jpg` that put the top edge on the bottom rule of the FEDERAL
// RESERVE NOTE banner, 8 units in. The printed border is not the darkest line,
// it is the OUTERMOST one, so v2 scans inward from the paper edge and stops at
// the first crossing of a threshold placed midway between the paper's own p90
// and the darkest line found in the search band.
//
// NULL TEST   the search band is printed; a crossing at either bound is flagged.
// SELECTION   the crossing index, the threshold and the profile value on each
//             side of the crossing are printed for every edge.
// CONTROL     both REVERSE files are fitted by the same code and their border
//             ratios are compared with r0's published 2.5610 / 2.5827.
// OVERLAY     `--overlay <dir>` draws the fitted rect on each source.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';

export async function grey(f) {
  const im = sharp(join(REF, f));
  const { width: W, height: H } = await im.metadata();
  return { d: await im.clone().greyscale().raw().toBuffer(), W, H };
}

export async function fit2(f, log = null) {
  const { d, W, H } = await grey(f);
  // The pool is cropped to the note, so the paper box IS the image box; this is
  // asserted rather than assumed — a photograph with a surround would need a
  // paper fit and this instrument does not claim to do one.
  const px0 = 0, py0 = 0, px1 = W - 1, py1 = H - 1;
  const pw = px1 - px0, ph = py1 - py0;
  const ix0 = px0 + Math.round(0.25 * pw), ix1 = px1 - Math.round(0.25 * pw);
  const iy0 = py0 + Math.round(0.25 * ph), iy1 = py1 - Math.round(0.25 * ph);
  const meanRow = (y) => { let s = 0; for (let x = ix0; x <= ix1; x++) s += d[y * W + x]; return s / (ix1 - ix0 + 1); };
  const meanCol = (x) => { let s = 0; for (let y = iy0; y <= iy1; y++) s += d[y * W + x]; return s / (iy1 - iy0 + 1); };
  const bandY = Math.round(0.14 * ph), bandX = Math.round(0.14 * pw);
  const p90 = (() => { const s = []; for (let y = iy0; y <= iy1; y += 5) for (let x = ix0; x <= ix1; x += 5) s.push(d[y * W + x]); s.sort((a, b) => a - b); return s[Math.floor(s.length * 0.9)]; })();
  const edge = (name, lo, hi, inward, fn) => {
    const prof = []; for (let i = lo; i <= hi; i++) prof.push(fn(i));
    const dark = Math.min(...prof);
    const thr = p90 - 0.5 * (p90 - dark);
    const order = inward > 0 ? prof.map((v, k) => [lo + k, v]) : prof.map((v, k) => [lo + k, v]).reverse();
    let hitI = null, exitI = null;
    for (const [i, v] of order) { if (v <= thr) { hitI = i; break; } }
    // the printed border is a LINE with width: walk on through it and take its
    // CENTRE, not its outer shoulder. r0's published reverse ratios come out
    // 2.6% below an outer-shoulder fit purely because of this.
    if (hitI !== null) {
      exitI = hitI;
      for (const [i, v] of order) { if (i === hitI || (inward > 0 ? i > hitI : i < hitI)) { if (v > thr) break; exitI = i; } }
      hitI = (hitI + exitI) / 2;
    }
    const onBound = hitI === lo || hitI === hi;
    if (log) log(`    ${name}: line centre ${hitI}  thr ${thr.toFixed(1)} (paper p90 ${p90}, darkest in band ${dark.toFixed(1)})  band [${lo},${hi}]${onBound ? '  ** ON BOUND **' : ''}`);
    return { i: hitI, thr, dark, onBound, grey: fn(Math.round(hitI)) };
  };
  const T = edge('T', py0, py0 + bandY, +1, meanRow);
  const B = edge('B', py1 - bandY, py1, -1, meanRow);
  const L = edge('L', px0, px0 + bandX, +1, meanCol);
  const R = edge('R', px1 - bandX, px1, -1, meanCol);
  return { f, W, H, p90, paper: [px0, py0, px1, py1], paperRatio: pw / ph,
    border: [L.i, T.i, R.i, B.i], borderRatio: (R.i - L.i) / (B.i - T.i),
    greys: [L.grey, T.grey, R.grey, B.grey], onBound: [L, T, R, B].some((e) => e.onBound) };
}

// (u,v) in [0,1]^2 over the fitted printed border -> source pixel
export function uvToPx(r, u, v) {
  const [L, T, R, B] = r.border;
  return [L + u * (R - L), T + v * (B - T)];
}
// our viewBox: the printed border rect is x 5..95, y 5..51
export const FRAME = { x0: 5, x1: 95, y0: 5, y1: 51 };
export const vbToUV = (x, y) => [(x - FRAME.x0) / (FRAME.x1 - FRAME.x0), (y - FRAME.y0) / (FRAME.y1 - FRAME.y0)];
export const uvToVB = (u, v) => [FRAME.x0 + u * (FRAME.x1 - FRAME.x0), FRAME.y0 + v * (FRAME.y1 - FRAME.y0)];

if (process.argv[1] && process.argv[1].endsWith('_bx2fit.mjs')) {
  const files = ['bill-rev.jpg', 'bill-rev-2.jpg', 'bill-obv.jpg', 'bill-obv-2.jpg'];
  const res = {};
  for (const f of files) {
    console.log(f + (f.includes('rev') ? '   [CONTROL — r0 published border ratio 2.5610 / 2.5827]' : '   [SUBJECT — r0 claims "no printed-border fiducial; the fit lands on blank paper"]'));
    const r = await fit2(f, (s) => console.log(s));
    res[f] = r;
    console.log(`    border ${r.border.join(',')}  ratio ${r.borderRatio.toFixed(4)}   edge greys ${r.greys.map((g) => g.toFixed(0)).join(',')}  vs paper p90 ${r.p90}`);
    console.log(`    margin paper->border  X ${(100 * ((r.border[0] - 0) + (r.W - 1 - r.border[2])) / 2 / (r.W - 1)).toFixed(2)}%  Y ${(100 * ((r.border[1] - 0) + (r.H - 1 - r.border[3])) / 2 / (r.H - 1)).toFixed(2)}%\n`);
  }
  const ov = process.argv.indexOf('--overlay');
  if (ov > 0) {
    const dir = process.argv[ov + 1];
    for (const f of files) {
      const r = res[f];
      const base = await sharp(join(REF, f)).resize(1200).png().toBuffer();
      const m = await sharp(base).metadata(), k = m.width / r.W;
      const [L, T, R, B] = r.border;
      const svg = `<svg width="${m.width}" height="${m.height}" xmlns="http://www.w3.org/2000/svg"><rect x="${L * k}" y="${T * k}" width="${(R - L) * k}" height="${(B - T) * k}" fill="none" stroke="#ff0000" stroke-width="2"/></svg>`;
      const o = await sharp(Buffer.from(svg)).resize(m.width, m.height).png().toBuffer();
      await sharp(base).composite([{ input: o }]).png().toFile(join(dir, 'bx2-' + f.replace('.jpg', '.png')));
    }
    console.log('overlays written to the directory named on the command line');
  }
}
