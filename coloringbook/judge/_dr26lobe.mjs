// _dr26lobe.mjs — THE LOBE SPECTRUM OF THE OAK'S OUTER BOUNDARY.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
// Ledger A42: the coin's whole oak is ONE connected component at every erosion
// from 0 to 1.50, so no mask statistic can isolate one blade and no per-blade
// width profile can be taken on the photograph. Round 46 was asked whether our
// blades carry "many small teeth" where the coin carries "a few broad rounded
// lobes separated by narrow sinuses". That question does NOT need the blades
// separated: it is a statement about the SHAPE OF THE OUTER BOUNDARY, and the
// crown's outer boundary is the one piece of direct evidence A42 leaves.
//
// So this instrument measures the boundary, not the blade:
//
//   1. Clip the device mask to the oak window, take its largest component,
//      trace the OUTER contour (Moore neighbourhood, 8-connected), resample to
//      uniform arclength.
//   2. Smooth the contour circularly with a Gaussian of sigma SIG units of
//      arclength. SIG is chosen larger than a lobe and smaller than a leaf; it
//      is swept, and every number is quoted with the sigma it came from.
//   3. d(s) = (C(s) - Cs(s)) . n(s), the outward bulge of the real boundary
//      over its own smoothed self. A LOBE is a local maximum of d with
//      prominence >= PROM; a SINUS is the minimum between two lobes.
//   4. Report, per file: lobes per 10 units of contour, median lobe PITCH
//      (arclength between adjacent lobes), median sinus DEPTH (the smaller of
//      the two drops either side of the sinus), median sinus WIDTH (the
//      arclength between the half-depth points either side of the minimum).
//
// "Many small teeth" and "a few broad lobes" differ in PITCH and DEPTH, and
// those are the two numbers this prints. Ours and both photographs go through
// the identical pipeline, in OUR frame, at each file's own registration.
//
// ── THE OTHER HALF: our own glyph, exactly ─────────────────────────────────
// `profile` flattens the `OAK` path out of `src/art/coins.js` and reports the
// half-width profile along its own midrib analytically — lobe count per side,
// crown width, sinus width, sinus depth. That is available for OUR drawing at
// any precision and is NOT available for the coin (A42). Printing both, in the
// same table, is what stops a lobe number for the drawing being read as a
// measurement of the coin.
//
// ── THE BEVEL SKIRT, WHICH WOULD OTHERWISE DECIDE THIS ─────────────────────
// A struck coin's device mask carries a skirt: proofbright's median 10-90 %
// edge rise is 0.55 units, unc2005's 0.37 (`_dr9branch.mjs`, ledger A40). A
// skirt is a DILATION, and a dilation fills every notch narrower than twice its
// radius and rounds every crown. So a flat SVG fill measured against a
// photograph's mask is compared with its own outline SMOOTHED — the coin would
// read smoother than us even if the two outlines were identical. `skirt` mode
// dilates OUR mask by each file's own calibrated radius and re-measures, so the
// claim is made on shapes that have had the same operator applied.
//
// usage:
//   node _dr26lobe.mjs spectrum [sigma [prom]]     the boundary metric, 3 files
//   node _dr26lobe.mjs sweep                       spectrum over sigma x prom
//   node _dr26lobe.mjs skirt [sigma [prom]]        ours dilated to each skirt
//   node _dr26lobe.mjs profile                     our OAK glyph, analytically
//   node _dr26lobe.mjs box x0 x1 y0 y1 [sig [prom]]  lobes on ONE leaf's arc
//   node _dr26lobe.mjs flank ax ay bx by          half-width along a midrib,
//                                                 ours / ours+skirt / both files
//   node _dr26lobe.mjs pic [sigma [prom]]          the contour + its lobes, drawn
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ROOT, SCRATCH } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { reopen } from './_dr13elem.mjs';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
// The oak window (ledger A43), in OUR frame.
const WIN = [58, 82, 25, 61];
const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190, ours: 165 };
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75, ours: 0 };
const short = (f) => (f === 'ours' ? 'ours' : f.slice(9, -4));

const mode = process.argv[2] || 'spectrum';
const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);

// ── MASKS, all brought into OUR frame ──────────────────────────────────────
async function maskOurFrame(f) {
  let m;
  if (f === 'ours') m = await deviceMask('ours', T_OF.ours, 0);
  else {
    m = await deviceMask(f, T_OF[f], 0);
    // reopen 1.0 is proofbright ONLY (on unc2005 it reopens the flame).
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
  }
  const r = REG[f];
  const shift = Math.round(r / S);
  const out = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const ii = i + shift;                       // our x -> this file's x
    if (ii >= 0 && ii < MW) out[j * MW + i] = m[j * MW + ii];
  }
  return out;
}

/** dilate a full-frame mask by `units` (the 4-neighbour ball, matching erodeBy) */
function dilateBy(m, units) {
  let cur = m; const r = Math.round(units / S);
  for (let p = 0; p < r; p++) {
    const nx = new Uint8Array(MW * MH);
    for (let j = 1; j < MH - 1; j++) for (let i = 1; i < MW - 1; i++) {
      const k = j * MW + i;
      nx[k] = cur[k] || cur[k - 1] || cur[k + 1] || cur[k - MW] || cur[k + MW] ? 1 : 0;
    }
    cur = nx;
  }
  return cur;
}

const wi0 = Math.round((WIN[0] - X0) / S), wi1 = Math.round((WIN[1] - X0) / S);
const wj0 = Math.round((WIN[2] - Y0) / S), wj1 = Math.round((WIN[3] - Y0) / S);
const WW = wi1 - wi0 + 1, WH = wj1 - wj0 + 1;

/** largest 4-connected component of the mask clipped to the oak window */
function oakComponent(m) {
  const v = new Uint8Array(WW * WH);
  for (let j = 0; j < WH; j++) for (let i = 0; i < WW; i++) v[j * WW + i] = m[(wj0 + j) * MW + (wi0 + i)];
  const lab = new Int32Array(WW * WH).fill(-1);
  let best = -1, bestN = 0;
  for (let k = 0, id = 0; k < v.length; k++) {
    if (!v[k] || lab[k] >= 0) continue;
    const st = [k]; lab[k] = id; let n = 0;
    while (st.length) {
      const q = st.pop(); n++;
      const i = q % WW, j = (q - i) / WW;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + dx, b = j + dy;
        if (a < 0 || b < 0 || a >= WW || b >= WH) continue;
        const p = b * WW + a;
        if (v[p] && lab[p] < 0) { lab[p] = id; st.push(p); }
      }
    }
    if (n > bestN) { bestN = n; best = id; }
    id++;
  }
  const out = new Uint8Array(WW * WH);
  for (let k = 0; k < v.length; k++) if (lab[k] === best) out[k] = 1;
  return { comp: out, area: bestN * S * S };
}

/** Moore-neighbourhood trace of the OUTER boundary. Returns pixel indices [i,j]. */
function traceOuter(comp) {
  const at = (i, j) => (i >= 0 && j >= 0 && i < WW && j < WH ? comp[j * WW + i] : 0);
  let s = null;
  for (let j = 0; j < WH && !s; j++) for (let i = 0; i < WW; i++) if (at(i, j)) { s = [i, j]; break; }
  if (!s) return [];
  const N = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const pts = [s]; let cur = s, back = 4;               // came from the left
  for (let guard = 0; guard < 8 * WW * WH; guard++) {
    let nxt = null, nb = 0;
    for (let t = 1; t <= 8; t++) {
      const d = (back + t) % 8;
      const c = [cur[0] + N[d][0], cur[1] + N[d][1]];
      if (at(c[0], c[1])) { nxt = c; nb = (d + 4) % 8; break; }
    }
    if (!nxt) break;
    if (nxt[0] === s[0] && nxt[1] === s[1] && pts.length > 2) break;
    pts.push(nxt); back = nb; cur = nxt;
  }
  return pts;
}

/** resample a closed polyline to uniform arclength `ds` (viewBox units) */
function resample(pts, ds) {
  const P = pts.map(([i, j]) => [WIN[0] + i * S, WIN[2] + j * S]);
  const n = P.length; const cum = [0];
  for (let k = 1; k <= n; k++) {
    const a = P[k - 1], b = P[k % n];
    cum.push(cum[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const L = cum[n]; const M = Math.max(16, Math.round(L / ds)); const step = L / M;
  const out = []; let k = 0;
  for (let q = 0; q < M; q++) {
    const t = q * step;
    while (k < n - 1 && cum[k + 1] < t) k++;
    const seg = cum[k + 1] - cum[k] || 1; const u = (t - cum[k]) / seg;
    const a = P[k], b = P[(k + 1) % n];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return { pts: out, L, step };
}

/** circular Gaussian smoothing of a closed contour */
function smooth(pts, sigma, step) {
  const n = pts.length; const r = Math.max(1, Math.ceil((3 * sigma) / step));
  const w = []; let sw = 0;
  for (let k = -r; k <= r; k++) { const g = Math.exp(-((k * step) ** 2) / (2 * sigma * sigma)); w.push(g); sw += g; }
  const out = [];
  for (let q = 0; q < n; q++) {
    let sx = 0, sy = 0;
    for (let k = -r; k <= r; k++) { const p = pts[(q + k + n * 4) % n]; const g = w[k + r]; sx += g * p[0]; sy += g * p[1]; }
    out.push([sx / sw, sy / sw]);
  }
  return out;
}

/** signed outward bulge of the raw contour over its smoothed self */
function bulge(pts, sm) {
  const n = pts.length;
  // orientation: positive shoelace area => counter-clockwise in maths axes,
  // but y grows DOWN here, so sign is flipped. Fix by testing a known normal.
  let a2 = 0;
  for (let q = 0; q < n; q++) { const p = sm[q], r = sm[(q + 1) % n]; a2 += p[0] * r[1] - r[0] * p[1]; }
  const sgn = a2 > 0 ? 1 : -1;                 // +1 when the trace runs "clockwise on screen"
  const d = new Float64Array(n);
  for (let q = 0; q < n; q++) {
    const a = sm[(q - 1 + n) % n], b = sm[(q + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const nx = sgn * ty, ny = -sgn * tx;       // outward normal
    d[q] = (pts[q][0] - sm[q][0]) * nx + (pts[q][1] - sm[q][1]) * ny;
  }
  return d;
}

/** peaks of a circular signal with prominence >= prom */
function peaks(d, prom) {
  const n = d.length; const out = [];
  for (let q = 0; q < n; q++) {
    const p = d[q];
    if (!(p > d[(q - 1 + n) % n]) || !(p >= d[(q + 1) % n])) continue;
    // walk both ways to the first point higher than p, tracking the low
    let lo1 = p;
    for (let k = 1; k < n; k++) { const v = d[(q - k + n) % n]; if (v > p) break; if (v < lo1) lo1 = v; }
    let lo2 = p;
    for (let k = 1; k < n; k++) { const v = d[(q + k) % n]; if (v > p) break; if (v < lo2) lo2 = v; }
    const pr = Math.min(p - lo1, p - lo2);
    if (pr >= prom) out.push({ q, d: p, prom: pr });
  }
  // suppress plateaus: keep the highest peak in any run closer than 6 samples
  out.sort((a, b) => a.q - b.q);
  const keep = [];
  for (const p of out) {
    const last = keep[keep.length - 1];
    if (last && p.q - last.q < 6) { if (p.d > last.d) keep[keep.length - 1] = p; continue; }
    keep.push(p);
  }
  return keep;
}

const med = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : NaN);

/**
 * CROWN RADIUS. A least-squares circle through the contour either side of a
 * lobe's apex, out to `span` units of arclength. The coin's lobes are knobs;
 * ours were fins, and "round" is a radius, not an adjective. Ours and the
 * photographs go through the same fit on the same masks.
 */
function crownRadius(rp, q, step, span = 0.9) {
  const n = rp.length; const r = Math.round(span / step); const P = [];
  for (let k = -r; k <= r; k++) P.push(rp[(q + k + n * 4) % n]);
  let sx = 0, sy = 0; for (const p of P) { sx += p[0]; sy += p[1]; }
  const mx = sx / P.length, my = sy / P.length;
  let Suu = 0, Svv = 0, Suv = 0, Suuu = 0, Svvv = 0, Suvv = 0, Svuu = 0;
  for (const p of P) {
    const u = p[0] - mx, v = p[1] - my;
    Suu += u * u; Svv += v * v; Suv += u * v;
    Suuu += u * u * u; Svvv += v * v * v; Suvv += u * v * v; Svuu += v * u * u;
  }
  const det = Suu * Svv - Suv * Suv;
  if (Math.abs(det) < 1e-12) return NaN;
  const a = (Svv * (Suuu + Suvv) - Suv * (Svvv + Svuu)) / (2 * det);
  const b = (Suu * (Svvv + Svuu) - Suv * (Suuu + Suvv)) / (2 * det);
  return Math.sqrt(a * a + b * b + (Suu + Svv) / P.length);
}

/** the whole boundary metric for one mask */
function spectrum(m, sigma, prom, dsWanted = 0.05) {
  const { comp, area } = oakComponent(m);
  const pts = traceOuter(comp);
  const { pts: rp, L, step } = resample(pts, dsWanted);
  const sm = smooth(rp, sigma, step);
  const d = bulge(rp, sm, step);
  const pk = peaks(d, prom);
  // ROUGHNESS. The raw contour's length over its own smoothed length, arc by
  // arc. This is the one number here that does NOT depend on how much of a
  // leaf a spatial box happens to capture: it is a ratio of two lengths
  // measured over the SAME arc, so a box that catches two thirds of a leaf
  // reports the same roughness as one that catches all of it.
  const dRaw = new Float64Array(rp.length), dSm = new Float64Array(rp.length);
  for (let q = 0; q < rp.length; q++) {
    const a = rp[q], b = rp[(q + 1) % rp.length];
    const c = sm[q], e = sm[(q + 1) % sm.length];
    dRaw[q] = Math.hypot(b[0] - a[0], b[1] - a[1]);
    dSm[q] = Math.hypot(e[0] - c[0], e[1] - c[1]);
  }
  let Lsm = 0; for (const v of dSm) Lsm += v;
  // sinuses: the minimum of d between adjacent peaks
  const sin = [];
  for (let k = 0; k < pk.length; k++) {
    const a = pk[k].q, b = pk[(k + 1) % pk.length].q;
    const span = (b - a + rp.length) % rp.length;
    if (span < 3) continue;
    let lo = Infinity, at = a;
    for (let t = 1; t < span; t++) { const q = (a + t) % rp.length; if (d[q] < lo) { lo = d[q]; at = q; } }
    const depth = Math.min(pk[k].d, pk[(k + 1) % pk.length].d) - lo;
    // width at half depth
    const half = lo + depth / 2;
    let l = 0, r = 0;
    for (let t = 0; t < span; t++) { if (d[(at - t + rp.length) % rp.length] >= half) break; l = t; }
    for (let t = 0; t < span; t++) { if (d[(at + t) % rp.length] >= half) break; r = t; }
    sin.push({ at, depth, width: (l + r) * step, pitch: span * step });
  }
  return {
    area, L, Lsm, rough: L / Lsm, dRaw, dSm,
    n: pk.length, per10: (10 * pk.length) / L,
    pitch: med(sin.map((s) => s.pitch)),
    depth: med(sin.map((s) => s.depth)),
    width: med(sin.map((s) => s.width)),
    maxBulge: med(pk.map((p) => p.d)),
    radius: med(pk.map((p) => crownRadius(rp, p.q, step)).filter(Number.isFinite)),
    radii: pk.map((p) => crownRadius(rp, p.q, step)),
    pk, sin, rp, sm, d, step, comp,
  };
}

// ── OUR GLYPH, ANALYTICALLY ────────────────────────────────────────────────
function oakPathD() {
  const src = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
  const m = src.match(/const OAK =\n([\s\S]*?);\n/);
  if (!m) throw new Error('_dr26lobe: could not find `const OAK =` in src/art/coins.js');
  // the literal is a sum of single-quoted strings
  return m[1].split('\n').map((l) => (l.match(/'([^']*)'/) || [, ''])[1]).join('');
}
/** flatten an all-cubic 'M ... C ... Z' path into points */
function flatten(dstr, per = 64) {
  const t = dstr.trim().split(/[\s,]+/);
  const pts = []; let i = 0; let cur = [0, 0];
  while (i < t.length) {
    const c = t[i++];
    if (c === 'M') { cur = [+t[i++], +t[i++]]; pts.push(cur); }
    else if (c === 'C') {
      const p1 = [+t[i++], +t[i++]], p2 = [+t[i++], +t[i++]], p3 = [+t[i++], +t[i++]];
      for (let k = 1; k <= per; k++) {
        const u = k / per, v = 1 - u;
        pts.push([
          v * v * v * cur[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
          v * v * v * cur[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
        ]);
      }
      cur = p3;
    } else if (c === 'Z' || c === 'z') break;
  }
  return pts;
}
/** half-width profile of the glyph along its own x axis (the midrib) */
function glyphProfile(dstr, bins = 240) {
  const pts = flatten(dstr);
  let x0 = Infinity, x1 = -Infinity;
  for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; }
  const up = new Float64Array(bins).fill(NaN), dn = new Float64Array(bins).fill(NaN);
  for (const [x, y] of pts) {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(((x - x0) / (x1 - x0)) * bins)));
    if (y < 0) up[b] = Number.isNaN(up[b]) ? -y : Math.max(up[b], -y);
    else dn[b] = Number.isNaN(dn[b]) ? y : Math.max(dn[b], y);
  }
  return { x0, x1, up, dn, bins };
}
/** local maxima / minima of a 1-D profile, with prominence */
function extrema1d(v, x0, x1, bins, prom) {
  const dx = (x1 - x0) / bins;
  const mx = [], mn = [];
  const g = Array.from(v).map((a, k) => (Number.isNaN(a) ? (v[k - 1] ?? v[k + 1] ?? 0) : a));
  for (let k = 1; k < bins - 1; k++) {
    if (g[k] > g[k - 1] && g[k] >= g[k + 1]) {
      let l = g[k]; for (let t = k; t >= 0; t--) { if (g[t] > g[k]) break; l = Math.min(l, g[t]); }
      let r = g[k]; for (let t = k; t < bins; t++) { if (g[t] > g[k]) break; r = Math.min(r, g[t]); }
      const p = Math.min(g[k] - l, g[k] - r);
      if (p >= prom) mx.push({ x: x0 + (k + 0.5) * dx, v: g[k], prom: p });
    }
    if (g[k] < g[k - 1] && g[k] <= g[k + 1]) mn.push({ x: x0 + (k + 0.5) * dx, v: g[k] });
  }
  return { mx, mn, g, dx };
}

if (mode === 'profile') {
  const d = oakPathD();
  const { x0, x1, up, dn, bins } = glyphProfile(d);
  console.log('THE `OAK` GLYPH FROM src/art/coins.js, FLATTENED. Author frame; x is the midrib.\n');
  console.log(`  length ${(x1 - x0).toFixed(2)}  max half-width ${Math.max(...up.filter(Number.isFinite)).toFixed(2)}`
    + ` / ${Math.max(...dn.filter(Number.isFinite)).toFixed(2)}  -> width ${(Math.max(...up.filter(Number.isFinite)) + Math.max(...dn.filter(Number.isFinite))).toFixed(2)}`);
  for (const [name, v] of [['upper', up], ['lower', dn]]) {
    const { mx, mn } = extrema1d(v, x0, x1, bins, 0.12);
    console.log(`\n  ${name} side — ${mx.length} lobes`);
    console.log('    lobe   x       half-w   prom | sinus   x       half-w   depth  ratio to crowns');
    for (let k = 0; k < mx.length; k++) {
      const s = mn.find((q) => q.x > mx[k].x && (k + 1 >= mx.length || q.x < mx[k + 1].x));
      let tail = '';
      if (s && k + 1 < mx.length) {
        const mean = (mx[k].v + mx[k + 1].v) / 2;
        tail = ` | ${(k + 1)}->${k + 2}  ${s.x.toFixed(2).padStart(6)}  ${s.v.toFixed(2).padStart(6)}`
          + `  ${(mean - s.v).toFixed(2).padStart(6)}  ${(100 * s.v / mean).toFixed(0)}%`;
      }
      console.log(`    ${(k + 1).toString().padStart(4)}  ${mx[k].x.toFixed(2).padStart(6)}  ${mx[k].v.toFixed(2).padStart(6)}`
        + `  ${mx[k].prom.toFixed(2).padStart(5)}${tail}`);
    }
    const pitch = mx.slice(1).map((q, k) => q.x - mx[k].x);
    if (pitch.length) console.log(`    pitch: ${pitch.map((p) => p.toFixed(2)).join(' ')}  median ${med(pitch).toFixed(2)}`);
  }
  process.exit(0);
}

const SIG = nums[0] ?? 1.6;
const PROM = nums[1] ?? 0.25;

if (mode === 'spectrum' || mode === 'pic') {
  const files = ['ours', ...REFS];
  const res = {};
  for (const f of files) res[f] = spectrum(await maskOurFrame(f), SIG, PROM);
  console.log(`THE OAK'S OUTER BOUNDARY in x ${WIN[0]}..${WIN[1]} y ${WIN[2]}..${WIN[3]}, OUR frame.`);
  console.log(`Gaussian sigma ${SIG} units of arclength; a lobe is a bulge of prominence >= ${PROM} units.\n`);
  console.log('  file          area   contour   rough   shape   lobes  per10u   pitch   depth   width   bulge  crown r');
  for (const f of files) {
    const r = res[f];
    console.log(`  ${short(f).padEnd(12)} ${r.area.toFixed(1).padStart(6)}  ${r.L.toFixed(1).padStart(7)}`
      + `  ${r.rough.toFixed(3).padStart(6)}  ${((r.L * r.L) / (4 * Math.PI * r.area)).toFixed(2).padStart(6)}`
      + `  ${String(r.n).padStart(5)}  ${r.per10.toFixed(2).padStart(6)}  ${r.pitch.toFixed(2).padStart(6)}`
      + `  ${r.depth.toFixed(2).padStart(6)}  ${r.width.toFixed(2).padStart(6)}  ${r.maxBulge.toFixed(2).padStart(6)}`
      + `  ${r.radius.toFixed(2).padStart(7)}`);
  }
  if (mode === 'spectrum') process.exit(0);
  // ── the picture: contour black, smoothed grey, lobes red, sinuses blue
  const ppu = nums[2] ?? 26;
  for (const f of files) {
    const r = res[f];
    const W = Math.round((WIN[1] - WIN[0]) * ppu), H = Math.round((WIN[3] - WIN[2]) * ppu);
    const buf = Buffer.alloc(W * H * 3, 255);
    const put = (x, y, c, rad = 1) => {
      const i0 = Math.round((x - WIN[0]) * ppu), j0 = Math.round((y - WIN[2]) * ppu);
      for (let a = -rad; a <= rad; a++) for (let b = -rad; b <= rad; b++) {
        const i = i0 + a, j = j0 + b; if (i < 0 || j < 0 || i >= W || j >= H) continue;
        const k = (j * W + i) * 3; buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2];
      }
    };
    for (let j = 0; j < WH; j++) for (let i = 0; i < WW; i++) {
      if (!r.comp[j * WW + i]) continue;
      put(WIN[0] + i * S, WIN[2] + j * S, [232, 232, 236], 0);
    }
    for (const p of r.sm) put(p[0], p[1], [150, 150, 160], 0);
    for (const p of r.rp) put(p[0], p[1], [20, 20, 20], 0);
    for (const s of r.sin) put(r.rp[s.at][0], r.rp[s.at][1], [40, 90, 235], 2);
    for (const p of r.pk) put(r.rp[p.q][0], r.rp[p.q][1], [225, 30, 45], 2);
    const o = `_dr26-lobes-${short(f)}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${short(f).padEnd(12)} -> ${o}  ${W}x${H} @ ${ppu}px/unit  RED = lobe, BLUE = sinus`);
  }
  process.exit(0);
}

if (mode === 'skirt') {
  const SKIRT = { 'dime-rev-proofbright.png': 0.55, 'dime-rev-unc2005.png': 0.37 };
  const om = await maskOurFrame('ours');
  console.log('OURS DILATED BY EACH FILE\'S OWN CALIBRATED SKIRT, against that file.');
  console.log(`Gaussian sigma ${SIG}; prominence >= ${PROM}. shape = P^2/(4*pi*A), 1.0 = a disc.\n`);
  console.log('  what                        area   contour   shape   lobes  per10u   pitch   depth   width');
  const line = (label, r) => console.log(`  ${label.padEnd(26)} ${r.area.toFixed(1).padStart(6)}`
    + `  ${r.L.toFixed(1).padStart(7)}  ${((r.L * r.L) / (4 * Math.PI * r.area)).toFixed(2).padStart(6)}`
    + `  ${String(r.n).padStart(5)}  ${r.per10.toFixed(2).padStart(6)}  ${r.pitch.toFixed(2).padStart(6)}`
    + `  ${r.depth.toFixed(2).padStart(6)}  ${r.width.toFixed(2).padStart(6)}`);
  line('ours, dilate 0', spectrum(om, SIG, PROM));
  for (const f of REFS) {
    const d = SKIRT[f];
    line(`ours, dilate ${d.toFixed(2)}`, spectrum(dilateBy(om, d), SIG, PROM));
    line(`${short(f)} (skirt ${d.toFixed(2)})`, spectrum(await maskOurFrame(f), SIG, PROM));
  }
  process.exit(0);
}

if (mode === 'box') {
  const [bx0, bx1, by0, by1] = nums;
  const sg = nums[4] ?? 1.8, pr = nums[5] ?? 0.35;
  console.log(`LOBES ON THE BOUNDARY ARC INSIDE x ${bx0}..${bx1} y ${by0}..${by1} (OUR frame).`);
  console.log(`Gaussian sigma ${sg}; prominence >= ${pr}.\n`);
  for (const f of ['ours', ...REFS]) {
    const r = spectrum(await maskOurFrame(f), sg, pr);
    const inBox = (q) => {
      const p = r.rp[q];
      return p[0] >= bx0 && p[0] <= bx1 && p[1] >= by0 && p[1] <= by1;
    };
    const pk = r.pk.filter((p) => inBox(p.q));
    const sn = r.sin.filter((s) => inBox(s.at));
    let arc = 0, asm = 0;
    for (let q = 0; q < r.rp.length; q++) if (inBox(q)) { arc += r.dRaw[q]; asm += r.dSm[q]; }
    console.log(`  ${short(f)} — ${pk.length} lobes over ${arc.toFixed(1)} units of arc`
      + `  (${((10 * pk.length) / arc).toFixed(2)} per 10u)`
      + `  roughness ${(arc / asm).toFixed(3)}`
      + `  crown radius ${med(pk.map((q) => crownRadius(r.rp, q.q, r.step)).filter(Number.isFinite)).toFixed(2)}`);
    console.log('     lobe at            bulge   |  sinus at           depth   width   pitch');
    const n = Math.max(pk.length, sn.length);
    for (let k = 0; k < n; k++) {
      const a = pk[k] ? `${r.rp[pk[k].q][0].toFixed(1)}, ${r.rp[pk[k].q][1].toFixed(1)}`.padEnd(14)
        + `${pk[k].d.toFixed(2).padStart(6)}` : ' '.repeat(20);
      const b = sn[k] ? `  |  ${`${r.rp[sn[k].at][0].toFixed(1)}, ${r.rp[sn[k].at][1].toFixed(1)}`.padEnd(14)}`
        + `${sn[k].depth.toFixed(2).padStart(6)}  ${sn[k].width.toFixed(2).padStart(6)}  ${sn[k].pitch.toFixed(2).padStart(6)}` : '';
      console.log(`     ${a}${b}`);
    }
    const ds = sn.map((s) => s.depth), ws = sn.map((s) => s.width), ps = sn.map((s) => s.pitch);
    if (sn.length) console.log(`     median  depth ${med(ds).toFixed(2)}  width ${med(ws).toFixed(2)}  pitch ${med(ps).toFixed(2)}\n`);
    else console.log('');
  }
  process.exit(0);
}

// ── THE HALF-WIDTH PROFILE ALONG A MIDRIB, BOTH FLANKS ─────────────────────
// A42 forbids isolating a blade on the coin, so the midrib cannot be FITTED
// there. It is supplied — ours, from `OAKSEATS` — and the same line is walked
// on all three masks. The profile is therefore "the coin's edge measured from
// where WE put this blade's midrib", which is a fair comparison of SHAPE only
// because containment already puts our C within 5.4 % of the coin's own mask.
// It is not a claim about where the coin's midrib is.
//
// At each step along the line, march perpendicular from the midrib and stop at
// the FIRST field pixel. Stopping at the first, not the last, is what keeps a
// neighbouring leaf across a sinus out of the number (ledger E25).
if (mode === 'flank') {
  const [ax, ay, bx, by] = nums;
  const step = 0.1, maxw = 9;
  const dx = bx - ax, dy = by - ay, LEN = Math.hypot(dx, dy);
  const ux = dx / LEN, uy = dy / LEN;
  console.log(`HALF-WIDTH ALONG THE MIDRIB (${ax}, ${ay}) -> (${bx}, ${by}), length ${LEN.toFixed(2)}.`);
  console.log('Both flanks. "+" is the side the normal (-uy, ux) points to.\n');
  const rows = [];
  const om = await maskOurFrame('ours');
  const SET = [['ours', om], ['ours+0.55', dilateBy(om, 0.55)], ['ours+0.37', dilateBy(om, 0.37)],
    [REFS[0], await maskOurFrame(REFS[0])], [REFS[1], await maskOurFrame(REFS[1])]];
  for (const [f, m] of SET) {
    const on = (x, y) => {
      const i = Math.round((x - X0) / S), j = Math.round((y - Y0) / S);
      return i >= 0 && j >= 0 && i < MW && j < MH ? m[j * MW + i] : 0;
    };
    const prof = { p: [], n: [], t: [] };
    for (let t = 0; t <= LEN + 1e-9; t += step) {
      const x = ax + ux * t, y = ay + uy * t;
      for (const [key, sg] of [['p', 1], ['n', -1]]) {
        const nx = -uy * sg, ny = ux * sg;
        if (!on(x, y)) { prof[key].push(NaN); continue; }
        let u = 0; while (u < maxw && on(x + nx * (u + S), y + ny * (u + S))) u += S;
        prof[key].push(u);
      }
      prof.t.push(t);
    }
    rows.push([f, prof]);
  }
  const NM = (f) => (f.startsWith('ours') ? f : short(f));
  const N = rows[0][1].t.length;
  console.log('    t   ' + rows.map(([f]) => `${NM(f).slice(0, 11)} +/-`.padStart(16)).join(''));
  for (let k = 0; k < N; k += 2) {
    console.log(`  ${rows[0][1].t[k].toFixed(1).padStart(5)} `
      + rows.map(([, p]) => (`${Number.isNaN(p.p[k]) ? '  -  ' : p.p[k].toFixed(2).padStart(5)}`
        + `/${Number.isNaN(p.n[k]) ? '  -  ' : p.n[k].toFixed(2).padStart(5)}`).padStart(16)).join(''));
  }
  console.log('\n  LOBES ON EACH FLANK (local maxima of the profile, prominence >= 0.25):');
  for (const [f, p] of rows) {
    for (const [key, label] of [['p', '+'], ['n', '-']]) {
      const v = p[key].map((a) => (Number.isNaN(a) ? 0 : a));
      const { mx, mn } = extrema1d(Float64Array.from(v), 0, LEN, v.length, 0.25);
      const pitch = mx.slice(1).map((q, k) => q.x - mx[k].x);
      const dep = [];
      for (let k = 0; k + 1 < mx.length; k++) {
        const s = mn.find((q) => q.x > mx[k].x && q.x < mx[k + 1].x);
        if (s) dep.push(Math.min(mx[k].v, mx[k + 1].v) - s.v);
      }
      console.log(`    ${NM(f).padEnd(12)} ${label}  ${String(mx.length).padStart(2)} lobes at `
        + `${mx.map((q) => q.x.toFixed(1)).join(' ').padEnd(30)} `
        + `pitch ${pitch.length ? med(pitch).toFixed(2) : ' -- '}  sinus depth ${dep.length ? med(dep).toFixed(2) : ' -- '}`
        + `  max half-w ${Math.max(...v).toFixed(2)}`);
    }
  }
  process.exit(0);
}

if (mode === 'sweep') {
  const files = ['ours', ...REFS];
  const masks = {}; for (const f of files) masks[f] = await maskOurFrame(f);
  console.log('LOBES PER 10 UNITS OF CONTOUR / MEDIAN PITCH, over sigma x prominence.');
  console.log('The reading is only useful where it is STABLE; a metric that moves with');
  console.log('its own parameters is not measuring the coin.\n');
  for (const prom of [0.15, 0.25, 0.35, 0.5]) {
    console.log(`  prominence >= ${prom.toFixed(2)}`);
    console.log('    sigma      ours        proofbright      unc2005');
    for (const sg of [1.0, 1.4, 1.8, 2.2, 2.6, 3.0]) {
      const row = files.map((f) => {
        const r = spectrum(masks[f], sg, prom);
        return `${r.n}@${r.per10.toFixed(2)}/${r.pitch.toFixed(2)}`.padStart(16);
      });
      console.log(`    ${sg.toFixed(1).padStart(5)}  ${row.join('')}`);
    }
    console.log('');
  }
  process.exit(0);
}

console.log('usage: node _dr26lobe.mjs [spectrum|sweep|skirt|profile|box|flank|pic] ...');
