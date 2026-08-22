// SPECIALIST, quarter reverse — THE DEVICE BOUNDARY, by ray scan.
//
// *** RETAINED AS A FAILURE REPORT. NO NUMBER FROM THIS FILE IS QUOTED. ***
// Both scan directions failed, for two different reasons, and both are kept
// here because the second one is the finding: scanning OUTWARD locks onto an
// interior feather groove (see the note above rayScan); scanning INWARD from
// the frozen legend baseline leaves 97 of 180 rays on qp1963 and 90 of 180 on
// qp1964 riding the ROUT bound, which under §4.1 is a non-answer for more than
// half the circle. The cause is in `_jq4band.json` in as many words: the two
// cameo proofs are oblique shots fitting to p95 4.8%% and 11.1%% of R, so at
// r 40 their radial scale is uncertain by +-2 to +-4.5 viewBox units — bigger
// than the feature. They are the right artefact for the DEVICE and the wrong
// one for anything measured in RADIUS. The wing's outer edge was read instead
// off a hand ladder on the square-on references (`_sq8zoom.mjs`, COIN-JUDGE
// §2.1: a hand annotation is a legitimate frozen target).
//
// Why not the connected component: _sq7width2.mjs showed the wingtip and
// UNITED STATES OF AMERICA bridging at every threshold and surviving 1.2 units
// of opening, so a component-based half-width is device-plus-legend.
//
// On a cameo proof the field is a black mirror and the device is frosted
// white, so along a ray from the centre the sequence is
//     bright (device) ... dark (field) ... bright (letter) ...
// and the device boundary is the radius where the FIRST dark run of at least
// GAP units begins. The letters cannot be reached without crossing that run.
// `_jq4band.json` already rules that "the proofs are the right artefact for the
// DEVICE and the wrong one for the BAND", which is exactly this measurement.
//
// §4.1 null test  : r is searched over [RMIN, RMAX]; a ray returning either
//                   bound is printed as BOUND and excluded from every summary.
// §4.2 selection  : both proofs, every ray, printed.
// §4.3            : _sq9-ray.png draws the located boundary on the source.
// §6.1            : GAP, RMIN, RMAX and the ray set are literals; nothing here
//                   is computed from our drawing. Our profile is measured with
//                   the SAME ray set afterwards, from the emitted SVG.
// Response test   : run with SQ_PERTURB=<units> to inflate our motif about the
//                   centre; our numbers must move by that amount and the
//                   coin's must not move at all (reference-invariance, R1).
import sharp from 'sharp';
import { gridOf, inField, valleyFloor, NG, SPANG } from './_jq43seg.mjs';
import { coinSVG } from '../../src/art/coins.js';

const PROOFS = ['qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
const RMIN = 8, RMAX = 41, GAP = 1.5, STEP = 0.05;      // viewBox units
const ANG = []; for (let a = 0; a < 360; a += 2) ANG.push(a);
const X2i = (X) => ((X - 50) / 47 + SPANG) * (NG - 1) / (2 * SPANG);

const fld = inField();
const bilinear = (g, X, Y) => {
  const x = X2i(X), y = X2i(Y);
  if (x < 0 || y < 0 || x >= NG - 1 || y >= NG - 1) return NaN;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
  return g[y0 * NG + x0] * (1 - fx) * (1 - fy) + g[y0 * NG + x0 + 1] * fx * (1 - fy)
    + g[(y0 + 1) * NG + x0] * (1 - fx) * fy + g[(y0 + 1) * NG + x0 + 1] * fx * fy;
};

// FIRST ATTEMPT, RETAINED AS A FAILURE REPORT: scanning OUTWARD for the first
// dark run of GAP units locked onto an interior FEATHER GROOVE (ray 8 deg
// returned 19.50 where the wing plainly runs past 30). The grooves between
// primaries are exactly the feature this round is about, so they are wider
// than any gap threshold that would still find the outer edge. Not used.
//
// USED: scan INWARD from ROUT and take the outermost radius that is bright and
// stays bright for HOLD units. ROUT = 36.0 comes from `_jq4band.json`'s frozen
// top-legend baseline 36.5 (§6.1, target-derived), so the letters are never in
// view. A ray returning ROUT is riding the bound and is excluded (§4.1).
const ROUT = 36.0, HOLD = 0.8;
function rayScan(sample, T) {
  return ANG.map((a) => {
    const th = a * Math.PI / 180, cx = Math.cos(th), sy = Math.sin(th);
    for (let r = ROUT; r >= RMIN; r -= STEP) {
      let ok = true;
      for (let d = 0; d <= HOLD; d += STEP) {
        const v = sample(50 + (r - d) * cx, 50 + (r - d) * sy);
        if (!(Number.isFinite(v) && v >= T)) { ok = false; break; }
      }
      if (ok) return { a, r, bound: r >= ROUT - 1e-9 };
    }
    return { a, r: RMIN, bound: true };
  });
}

const coin = [];
for (const f of PROOFS) {
  const g = await gridOf(f);
  const T = valleyFloor(g, fld).best.arg;
  coin.push({ f, T, rays: rayScan((X, Y) => bilinear(g, X, Y), T) });
}

// ---- ours, same ray set ----------------------------------------------------
const PERT = +(process.env.SQ_PERTURB || 0);
function ourMask() {
  const s = coinSVG('quarter', 380, { side: 'reverse', decorative: true });
  const m = s.match(/<g fill="#6b737b">([\s\S]*?)<\/g>/);
  if (!m) throw new Error('EMPTY SELECTION — no solid motif group; failure report, not a value');
  const sc = PERT ? (1 + PERT / 35) : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${NG}" height="${NG}">` +
    `<rect width="100" height="100" fill="#000"/>` +
    `<g fill="#fff" transform="translate(${50 - 50 * sc} ${50 - 50 * sc}) scale(${sc})">${m[1]}</g></svg>`;
}
const { data: od } = await sharp(Buffer.from(ourMask())).greyscale().raw().toBuffer({ resolveWithObject: true });
// our SVG spans viewBox 0..100 across NG px
const oSample = (X, Y) => {
  const x = X * NG / 100, y = Y * NG / 100;
  if (x < 0 || y < 0 || x >= NG - 1 || y >= NG - 1) return NaN;
  return od[(y | 0) * NG + (x | 0)];
};
const ourRays = rayScan(oSample, 128);

// ---- report ----------------------------------------------------------------
console.log('=== device outer boundary by ray scan, viewBox units ===');
console.log(`inward scan from ROUT ${ROUT} to RMIN ${RMIN}; bright hold ${HOLD} units; ${ANG.length} rays at 2 deg`);
for (const c of coin) {
  const nb = c.rays.filter((r) => r.bound).length;
  console.log(`  ${c.f.padEnd(22)} T=${c.T}  rays riding a bound: ${nb}/${ANG.length}`);
}
console.log(`  ${'OURS'.padEnd(22)}          rays riding a bound: ${ourRays.filter((r) => r.bound).length}/${ANG.length}` +
  (PERT ? `   [PERTURBED +${PERT} units]` : ''));

// clock-face summary. 90 deg = straight DOWN in this frame (y grows downward).
const sect = (lo, hi) => (arr) => {
  const v = arr.filter((r) => !r.bound && ((lo <= hi) ? (r.a >= lo && r.a < hi) : (r.a >= lo || r.a < hi))).map((r) => r.r);
  return v.length ? v.reduce((p, q) => p + q, 0) / v.length : NaN;
};
console.log('\nsector means (deg measured from +x, clockwise on screen; 270 = straight up)');
console.log('  sector          1963    1964    coin   OURS   ours-coin');
const SECT = [[250, 290, 'TOP  (head)'], [200, 250, 'upper-left wing'], [160, 200, 'left  wingtip'],
  [110, 160, 'lower-left'], [70, 110, 'BOTTOM (wreath)'], [20, 70, 'lower-right'],
  [340, 20, 'right wingtip'], [290, 340, 'upper-right wing']];
for (const [lo, hi, name] of SECT) {
  const s = sect(lo, hi);
  const a = s(coin[0].rays), b = s(coin[1].rays), o = s(ourRays), c = (a + b) / 2;
  const f = (v) => (Number.isFinite(v) ? v.toFixed(2) : '  -').padStart(7);
  console.log(`  ${name.padEnd(16)}${f(a)}${f(b)}${f(c)}${f(o)}${f(o - c)}`);
}

console.log('\nper-ray (only where BOTH proofs are in bounds)');
console.log('  deg    1963   1964  spread |  OURS   ours-coin');
for (let i = 0; i < ANG.length; i++) {
  const a = coin[0].rays[i], b = coin[1].rays[i], o = ourRays[i];
  if (a.bound || b.bound) { console.log(`  ${String(ANG[i]).padStart(3)}    ${a.bound ? 'BOUND' : a.r.toFixed(2)}  ${b.bound ? 'BOUND' : b.r.toFixed(2)}   — excluded`); continue; }
  const c = (a.r + b.r) / 2;
  console.log(`  ${String(ANG[i]).padStart(3)} ${a.r.toFixed(2).padStart(6)} ${b.r.toFixed(2).padStart(6)} ${Math.abs(a.r - b.r).toFixed(2).padStart(6)} | ${(o.bound ? 'BOUND' : o.r.toFixed(2)).padStart(6)} ${(o.bound ? '' : (o.r - c).toFixed(2)).padStart(8)}`);
}

// §4.3 overlay
const PXO = 780, p2 = (X) => (X2i(X)) * PXO / (NG - 1);
const poly = (rays, col, w) => '<polyline fill="none" stroke="' + col + '" stroke-width="' + w + '" points="' +
  rays.filter((r) => !r.bound).map((r) => `${p2(50 + r.r * Math.cos(r.a * Math.PI / 180))},${p2(50 + r.r * Math.sin(r.a * Math.PI / 180))}`).join(' ') + '"/>';
const gg = await gridOf(PROOFS[0]);
const bb = Buffer.alloc(NG * NG);
for (let p = 0; p < NG * NG; p++) bb[p] = Math.max(0, Math.min(255, Math.round(gg[p] || 0)));
const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${PXO}" height="${PXO}">${poly(coin[0].rays, '#00e676', 2)}${poly(ourRays, '#ff1744', 1.6)}
  <text x="6" y="16" font-family="monospace" font-size="13" fill="#fff">green = qp1963 device boundary (ray scan), red = ours</text></svg>`;
await sharp(bb, { raw: { width: NG, height: NG, channels: 1 } }).resize(PXO, PXO)
  .toColourspace('srgb').composite([{ input: Buffer.from(ov) }]).png()
  .toFile(new URL(`./_sq9-ray${PERT ? '-pert' : ''}.png`, import.meta.url).pathname);
console.log(`\nwrote _sq9-ray${PERT ? '-pert' : ''}.png`);
