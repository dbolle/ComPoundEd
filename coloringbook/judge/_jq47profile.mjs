// ROUND 4 — D2-PROFILE: the coarse shape gate that an ambiguous target CAN carry.
//
// WHY THIS EXISTS, and the derivation written BEFORE any value (§8: a gate may
// be re-derived, in writing, before re-measuring; it may never be relaxed to
// fit a result already seen).
//
// D2 as specified is an AREA IoU against a frozen mask, gate >= 0.95, so the
// target must agree with itself to better than 0.03. Round 4's proof masks
// agree with themselves at 0.84-0.95 across a +-15 grey-level sweep, so they
// cannot carry that gate and D2 does not freeze. But the round-3 failure this
// round exists to prevent was not a 0.05 failure: the eagle came out reading
// as **a sailboat** at 26/44/54 px. A sailboat is a gross error in the motif's
// OUTLINE, and an outline descriptor is far less sensitive to the threshold
// than an area is, because thresholding moves a boundary by a pixel or two
// while area accumulates every one of those pixels over the whole contour.
//
// DESCRIPTOR (frozen before measuring): the motif's RADIAL EXTENT PROFILE —
// for each of 72 angular bins of 5 deg, the 95th-percentile radius of device
// cells inside the field circle, in viewBox units. 95th rather than max so a
// single speckle cannot define a lobe.
//
// The TARGET'S OWN NOISE FLOOR is then measured three ways and the gate is
// stated as a multiple of the worst:
//   (a) across the +-15 grey-level sweep, one reference;
//   (b) between the two independent proof references, after best rotation;
//   (c) between the two circulation references, as the pre-acquisition control.
// A gate of 2x the worst floor is proposed; the multiplier is written here,
// before the floor is known, so it cannot be chosen to fit.
//
// §4.1: bins with no device cells are reported as such, never as radius 0.
// §4.3: the profile is drawn back on the source as a 72-spoke polygon.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { gridOf, inField, valleyFloor, motif, NG, SPANG, RFIELD } from './_jq43seg.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));
export const NBIN = 72, PCT = 0.95, GATE_MULT = 2.0;

export function profileOf(mask) {
  const bins = Array.from({ length: NBIN }, () => []);
  for (let j = 0; j < NG; j++) { const v = -SPANG + 2 * SPANG * j / (NG - 1);
    for (let i = 0; i < NG; i++) { const p = j * NG + i; if (!mask[p]) continue;
      const u = -SPANG + 2 * SPANG * i / (NG - 1);
      const r = Math.hypot(u, v); if (r > RFIELD) continue;
      let a = Math.atan2(v, u) * 180 / Math.PI; if (a < 0) a += 360;
      bins[Math.min(NBIN - 1, (a / (360 / NBIN)) | 0)].push(r * 47); } }
  return bins.map((b) => { if (!b.length) return NaN; b.sort((x, y) => x - y);
    return b[Math.min(b.length - 1, Math.round(PCT * (b.length - 1)))]; });
}

export function compare(a, b, shiftBins = 0) {
  const d = [];
  for (let k = 0; k < NBIN; k++) {
    const x = a[k], y = b[(k + shiftBins + NBIN) % NBIN];
    if (Number.isFinite(x) && Number.isFinite(y)) d.push(Math.abs(x - y));
  }
  d.sort((p, q) => p - q);
  return { n: d.length, mean: d.reduce((p, q) => p + q, 0) / d.length,
    p95: d[Math.min(d.length - 1, Math.round(0.95 * (d.length - 1)))], max: d[d.length - 1] };
}
export function bestShift(a, b, span = 3) {
  let best = null;
  for (let s = -span; s <= span; s++) { const c = compare(a, b, s); if (!best || c.mean < best.mean) best = { ...c, shift: s }; }
  return best;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fld = inField();
  const REFS = ['qp1963-rev-pad.png', 'qp1964-rev-pad.png', 'quarter-rev-3.jpg', 'quarter-rev-2.png'];
  const prof = {};
  console.log(`descriptor: ${NBIN} bins x ${360 / NBIN} deg, ${PCT * 100}th-pct device radius in viewBox units, inside r ${47 * RFIELD}`);
  console.log(`gate multiplier declared BEFORE the floor is known: ${GATE_MULT}x the worst floor below\n`);
  for (const f of REFS) {
    const g = await gridOf(f);
    const vf = valleyFloor(g, fld); if (!vf.best) { console.log(`${f}: no mode pair`); continue; }
    const Tv = vf.best.arg;
    prof[f] = {};
    for (const d of [-15, -10, -5, 0, 5, 10, 15]) prof[f][d] = profileOf(motif(g, Tv + d, fld).m);
    const empty = prof[f][0].filter((x) => !Number.isFinite(x)).length;
    console.log(`${f}  Tv ${Tv}  empty bins ${empty}/${NBIN}` + (empty ? '  <-- reported, not scored as 0 (§4.1)' : ''));
  }
  console.log('\n(a) FLOOR from the +-15 grey-level sweep, per reference (mean |dr| in viewBox units):');
  const floors = [];
  for (const f of Object.keys(prof)) {
    let worst = null;
    for (const a of [-15, -10, -5, 0, 5, 10, 15]) for (const b of [-15, -10, -5, 0, 5, 10, 15]) {
      if (a >= b) continue; const c = compare(prof[f][a], prof[f][b]);
      if (!worst || c.mean > worst.mean) worst = { ...c, a, b };
    }
    console.log(`  ${f.padEnd(20)} worst pair T${worst.a}/T${worst.b}: mean ${worst.mean.toFixed(3)}  p95 ${worst.p95.toFixed(3)}  max ${worst.max.toFixed(3)}`);
    if (/^qp/.test(f)) floors.push(worst.mean);
  }
  console.log('\n(b) FLOOR between the two independent PROOF references (best rotation within +-3 bins):');
  const bp = bestShift(prof['qp1963-rev-pad.png'][0], prof['qp1964-rev-pad.png'][0]);
  console.log(`  qp1963 vs qp1964: mean ${bp.mean.toFixed(3)}  p95 ${bp.p95.toFixed(3)}  max ${bp.max.toFixed(3)}  at shift ${bp.shift} bins (${bp.shift * 5} deg)`);
  floors.push(bp.mean);
  console.log('\n(c) CONTROL — the same statistic on the two CIRCULATION references:');
  const bc = bestShift(prof['quarter-rev-3.jpg'][0], prof['quarter-rev-2.png'][0]);
  console.log(`  rev-3 vs rev-2:   mean ${bc.mean.toFixed(3)}  p95 ${bc.p95.toFixed(3)}  max ${bc.max.toFixed(3)}  at shift ${bc.shift} bins`);
  const worstFloor = Math.max(...floors);
  console.log(`\nWORST PROOF-SIDE FLOOR = ${worstFloor.toFixed(3)} viewBox units of mean radial disagreement.`);
  console.log(`PROPOSED D2-PROFILE GATE = ${GATE_MULT} x ${worstFloor.toFixed(3)} = ${(GATE_MULT * worstFloor).toFixed(2)} viewBox units,`);
  console.log('  measured as the mean |dr| over the 72 bins between our reverse motif and the frozen');
  console.log('  target profile, with the target = the mean of the two proof references at T = Tv.');
  console.log('\nFROZEN TARGET PROFILE (viewBox radius per 5-deg bin, 0 deg = 3 o\'clock, 90 = 6 o\'clock):');
  const tgt = prof['qp1963-rev-pad.png'][0].map((v, k) => {
    const w = prof['qp1964-rev-pad.png'][0][(k + bp.shift + NBIN) % NBIN];
    return (Number.isFinite(v) && Number.isFinite(w)) ? +((v + w) / 2).toFixed(2) : null; });
  for (let k = 0; k < NBIN; k += 12)
    console.log('  ' + tgt.slice(k, k + 12).map((v, i) => `${(k + i) * 5}:${v === null ? ' —' : v.toFixed(1)}`).join('  '));

  // §4.3 overlay: draw the frozen profile as a 72-gon on both proof references
  for (const f of ['qp1963-rev-pad.png', 'qp1964-rev-pad.png']) {
    const d = D4[f], md = await sharp(P(f)).metadata();
    const pts = tgt.map((v, k) => { if (v === null) return null;
      const th = (k + 0.5) * (360 / NBIN) * Math.PI / 180, rr = v / 47 * d.R;
      return `${(d.cx + rr * Math.cos(th)).toFixed(1)},${(d.cy + rr * Math.sin(th)).toFixed(1)}`; }).filter(Boolean);
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">` +
      `<polygon points="${pts.join(' ')}" fill="none" stroke="#00ff6a" stroke-width="2.4"/>` +
      `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * RFIELD}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="6 6"/></svg>`);
    const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
    const out = new URL(`./_jq47profile-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(full).toFile(out);
    console.log(`overlay: ${out}`);
  }
}
