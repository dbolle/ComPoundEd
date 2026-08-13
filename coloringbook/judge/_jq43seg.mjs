// ROUND 4, TASK 2 — D2 REVERSE MOTIF SILHOUETTE: SEGMENT, SELF-AGREE, FREEZE.
//
// GATE, STATED BEFORE ANY VALUE EXISTS (this is round 2's, unchanged, from
// `_jq21stab.mjs`'s header — it is not re-derived to fit the new references):
//
//   FREEZE only if
//     (a) the MINIMUM pairwise IoU of the DEVICE contour across the swept
//         thresholds is >= 0.97 — the target's own ambiguity is then at most
//         0.03, under half the 0.05 that the D2 gate (IoU >= 0.95) is asked to
//         resolve; and
//     (b) two INDEPENDENT references agree with each other at >= 0.95 after
//         registration.
//   Round 0 got 0.2770-0.7786 on (a) and correctly refused.
//
// LOCUS, frozen before measuring and NOT a function of our art (§6.1):
//   region  r <= 0.862 R  (= viewBox r 40.5, the field circle) on the
//           disc-normalised grid; the motif is the connected component of the
//           threshold mask that contains the disc centre.
//   sweep   T = Tv - 15 .. Tv + 15 in steps of 5 (7 thresholds), where Tv is
//           the grey level of the histogram valley floor between the two
//           accepted modes of `_jqvalley.mjs`. Tv comes from the PHOTOGRAPH.
//
// §4.1 null test: the sweep bounds are printed; a mask whose area is monotone
// across the whole sweep with no interior plateau is reported as a bound, not
// a value. §4.3: `_jq43seg-<ref>.png` draws every threshold's contour on the
// source, and nothing is frozen before the judge has looked at it.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));

export const NG = 700;            // grid cells across 2 * SPANG
export const SPANG = 0.90;        // (u,v) half-span; 0.862 = field circle
export const RFIELD = 0.862;      // 40.5 / 47

export async function gridOf(file) {
  const d = D4[file];
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const g = new Float64Array(NG * NG);
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return NaN;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * W + x0] * (1 - fx) * (1 - fy) + data[y0 * W + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * W + x0] * (1 - fx) * fy + data[(y0 + 1) * W + x0 + 1] * fx * fy;
  };
  for (let j = 0; j < NG; j++) { const v = -SPANG + 2 * SPANG * j / (NG - 1);
    for (let i = 0; i < NG; i++) { const u = -SPANG + 2 * SPANG * i / (NG - 1);
      g[j * NG + i] = at(d.cx + u * d.R, d.cy + v * d.R); } }
  return g;
}

export function inField() {
  const m = new Uint8Array(NG * NG);
  for (let j = 0; j < NG; j++) { const v = -SPANG + 2 * SPANG * j / (NG - 1);
    for (let i = 0; i < NG; i++) { const u = -SPANG + 2 * SPANG * i / (NG - 1);
      m[j * NG + i] = Math.hypot(u, v) <= RFIELD ? 1 : 0; } }
  return m;
}

// connected component containing the centre, on {grey >= T} inside the field
export function motif(g, T, fld) {
  const bin = new Uint8Array(NG * NG);
  for (let p = 0; p < bin.length; p++) bin[p] = (fld[p] && g[p] >= T) ? 1 : 0;
  // seed: the centre cell; if the centre is not lit, take the nearest lit cell
  const c = ((NG >> 1) * NG) + (NG >> 1);
  let seed = -1;
  if (bin[c]) seed = c; else {
    for (let rad = 1; rad < NG / 2 && seed < 0; rad++)
      for (let a = 0; a < 360 && seed < 0; a += 3) {
        const i = (NG >> 1) + Math.round(rad * Math.cos(a * Math.PI / 180));
        const j = (NG >> 1) + Math.round(rad * Math.sin(a * Math.PI / 180));
        if (i >= 0 && j >= 0 && i < NG && j < NG && bin[j * NG + i]) seed = j * NG + i;
      }
  }
  const out = new Uint8Array(NG * NG); if (seed < 0) return { m: out, area: 0 };
  const st = [seed]; out[seed] = 1; let n = 1;
  while (st.length) { const p = st.pop(), x = p % NG, y = (p - x) / NG;
    const nb = [];
    if (x > 0) nb.push(p - 1); if (x < NG - 1) nb.push(p + 1);
    if (y > 0) nb.push(p - NG); if (y < NG - 1) nb.push(p + NG);
    for (const q of nb) if (!out[q] && bin[q]) { out[q] = 1; n++; st.push(q); } }
  return { m: out, area: n };
}

export const iou = (a, b) => { let i = 0, u = 0;
  for (let p = 0; p < a.length; p++) { if (a[p] && b[p]) i++; if (a[p] || b[p]) u++; }
  return u ? i / u : 0; };

// histogram valley floor between the two dominant modes, from the PHOTOGRAPH
export function valleyFloor(g, fld) {
  const hist = new Float64Array(256); let n = 0;
  for (let p = 0; p < g.length; p++) if (fld[p] && Number.isFinite(g[p])) { hist[Math.round(g[p])]++; n++; }
  for (let i = 0; i < 256; i++) hist[i] /= n;
  const s = new Float64Array(256), k = [1, 8, 28, 56, 70, 56, 28, 8, 1];
  for (let i = 0; i < 256; i++) { let a = 0;
    for (let j = -4; j <= 4; j++) { const t = i + j; if (t >= 0 && t < 256) a += hist[t] * k[j + 4]; }
    s[i] = a / 256; }
  const peaks = []; for (let i = 2; i < 254; i++) if (s[i] > s[i - 1] && s[i] > s[i + 1] && s[i] > 0.0008) peaks.push(i);
  let best = null;
  for (let a = 0; a < peaks.length; a++) for (let b = a + 1; b < peaks.length; b++) {
    const lo = peaks[a], hi = peaks[b]; if (hi - lo < 12) continue;
    let vmin = Infinity, arg = lo;
    for (let i = lo; i <= hi; i++) if (s[i] < vmin) { vmin = s[i]; arg = i; }
    const depth = 1 - vmin / Math.min(s[lo], s[hi]), mass = Math.min(s[lo], s[hi]);
    if (!best || depth * mass > best.depth * best.mass) best = { lo, hi, arg, depth, mass };
  }
  return { peaks, best, s };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2)
    : ['qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
  const fld = inField(); let nf = 0; for (const p of fld) nf += p;
  console.log(`locus: r <= ${RFIELD} R (viewBox r 40.5) on a ${NG}x${NG} disc-normalised grid = ${nf} cells`);
  console.log('gate (stated in round 2, unchanged): min pairwise device IoU across the sweep >= 0.97,');
  console.log('     AND cross-reference registered IoU >= 0.95.\n');
  const store = {};
  for (const f of refs) {
    const g = await gridOf(f);
    const vf = valleyFloor(g, fld);
    if (!vf.best) { console.log(`${f}: no separable mode pair — no threshold exists. BLOCKED`); continue; }
    const Tv = vf.best.arg;
    const TS = [-15, -10, -5, 0, 5, 10, 15].map((d) => Tv + d);
    console.log(`${f}`);
    console.log(`  modes ${vf.best.lo}/${vf.best.hi}  valley floor Tv = ${Tv}  depth ${vf.best.depth.toFixed(4)}`);
    console.log(`  sweep bounds (§4.1): T = ${TS[0]} .. ${TS[TS.length - 1]}, step 5`);
    const masks = TS.map((T) => ({ T, ...motif(g, T, fld) }));
    console.log('  T      area (% of field)   ');
    for (const m of masks) console.log(`  ${String(m.T).padStart(3)}    ${(100 * m.area / nf).toFixed(2)}%`);
    let mn = 1, mnPair = null;
    for (let a = 0; a < masks.length; a++) for (let b = a + 1; b < masks.length; b++) {
      const v = iou(masks[a].m, masks[b].m);
      if (v < mn) { mn = v; mnPair = [masks[a].T, masks[b].T]; }
    }
    const adjacent = [];
    for (let a = 0; a + 1 < masks.length; a++) adjacent.push(iou(masks[a].m, masks[a + 1].m));
    console.log(`  adjacent-threshold IoU: ${adjacent.map((v) => v.toFixed(4)).join(' ')}`);
    console.log(`  MIN pairwise device IoU across the sweep = ${mn.toFixed(4)} (T ${mnPair}) ` +
      `-> ${mn >= 0.97 ? 'meets' : 'MISSES'} the 0.97 self-agreement gate`);
    const areaDrift = (Math.max(...masks.map((m) => m.area)) - Math.min(...masks.map((m) => m.area)))
      / masks[3].area;
    console.log(`  area drift over the +-15 sweep: ${(100 * areaDrift).toFixed(1)}% of the central mask\n`);
    store[f] = { Tv, TS, masks, g, mn };
  }
  // cross-reference agreement, registered by rotation only (both are disc-normalised)
  const ks = Object.keys(store);
  if (ks.length === 2) {
    const A = store[ks[0]].masks[3].m, B = store[ks[1]].masks[3].m;
    const rot = (m, deg) => { const o = new Uint8Array(NG * NG);
      const th = deg * Math.PI / 180, C = Math.cos(th), S = Math.sin(th), c = (NG - 1) / 2;
      for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
        const u = i - c, v = j - c;
        const ii = Math.round(C * u - S * v + c), jj = Math.round(S * u + C * v + c);
        if (ii >= 0 && jj >= 0 && ii < NG && jj < NG) o[j * NG + i] = m[jj * NG + ii]; }
      return o; };
    let best = { v: -1, deg: null };
    for (let d = -6; d <= 6; d += 0.5) { const v = iou(A, rot(B, d)); if (v > best.v) best = { v, deg: d }; }
    console.log(`cross-reference registered IoU (${ks[0]} vs ${ks[1]}): ${best.v.toFixed(4)} at ${best.deg} deg` +
      `  [search bounds -6..6 deg]${Math.abs(best.deg) >= 6 ? '  <-- AT BOUND (§4.1)' : ''}`);
    console.log(`  -> ${best.v >= 0.95 ? 'meets' : 'MISSES'} the 0.95 cross-reference gate`);
  }

  // §4.3 overlays: every threshold's contour drawn on the source
  for (const f of ks) {
    const { masks } = store[f];
    const d = D4[f];
    const cols = ['#ff2d55', '#ff9500', '#ffe600', '#00ff6a', '#00e5ff', '#5b8cff', '#c874ff'];
    const md = await sharp(P(f)).metadata();
    const g2p = (i, j) => [d.cx + (-SPANG + 2 * SPANG * i / (NG - 1)) * d.R,
      d.cy + (-SPANG + 2 * SPANG * j / (NG - 1)) * d.R];
    let paths = '';
    masks.forEach((m, k) => {
      let pts = '';
      for (let j = 1; j < NG - 1; j++) for (let i = 1; i < NG - 1; i++) {
        const p = j * NG + i; if (!m.m[p]) continue;
        if (m.m[p - 1] && m.m[p + 1] && m.m[p - NG] && m.m[p + NG]) continue;   // interior
        const [x, y] = g2p(i, j); pts += `M${x.toFixed(1)} ${y.toFixed(1)}h1`;
      }
      paths += `<path d="${pts}" stroke="${cols[k]}" stroke-width="1.6" fill="none" opacity="0.95"/>`;
    });
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">` +
      `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * RFIELD}" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-dasharray="6 6"/>` +
      paths + '</svg>');
    const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
    const out = new URL(`./_jq43seg-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(full).toFile(out);
    console.log(`overlay: ${out}  (red = lowest T ... violet = highest T; dashed white = field circle)`);
  }
}
