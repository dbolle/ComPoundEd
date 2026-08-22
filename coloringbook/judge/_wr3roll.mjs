// ROUND 10 (specialist), QUARTER OBVERSE — THE GENERATOR for the lit-roll
// width, by the SAME arithmetic round 9 used to set the groove width.
//
// `_jw14gen.mjs` (round 9, shipped) sets a stroke width from a demanded duty
// cycle: w = duty * span / n, where n and span come from where the CENTRELINES
// cross a line, not from any detector. Its self-test is the round trip. That
// method was accepted and is the reason `groove` is 0.98.
//
// This applies it verbatim to the LIT ROLLS, which is the one group round 9 was
// scoped out of. It answers the question the brief could not resolve: does
// narrowing the rolls move ridge duty toward the coin's 0.350-0.443 or away?
//
// WHY NOT USE THE PHOTOMETRIC RIDGE DETECTOR. `_jw14cross.mjs`'s ridge finder
// censors exactly the features this round is about — see `_wr4censor.mjs`. Its
// answer for our art is bit-identical (0.369/0.348/0.312) for roll widths 1.1
// and 1.9, which is section 4's "two bit-identical answers from two different
// inputs is not agreement". The centreline arithmetic has no detector in it and
// cannot censor.
//
// COMMENSURABILITY (standing rule 1). Two quantities are compared here:
//   · OURS: (sum of authored stroke widths, projected onto the line) / (span
//     from the first roll crossing to the last). A duty cycle of drawn light.
//   · THE COIN: (sum of full widths at half prominence of the bright bands) /
//     (span from the first to the last), `_jw14cross.mjs`'s `rduty`.
// They are the same ratio; the widths are obtained differently (authored vs
// photometric), and THE BRIDGE BETWEEN THEM IS NOT 1.0. `_wr4censor.mjs`
// measures it on the rolls the detector does keep: FWHP / projected authored
// width runs 0.90x to 1.53x (median 1.43x), because half prominence is taken against whatever
// shoulder the band happens to have — the bare wig where the roll sits clear of
// a cut, the cut floor where it does not. So the ABSOLUTE level of our duty
// against the coin's carries that much uncertainty and is quoted, not leaned
// on. The DIRECTION does not: the bridge is a positive multiplier, and the
// photometric sweep in `_wr1duty.mjs` falls monotonically (0.322, 0.277, 0.233
// at widths 0.80, 0.60, 0.40) over the range where the detector is not
// censoring, which is the same sign this arithmetic gives.
//
// §4   RESPONSE: SELFTEST round-trips the solver, and the projection is checked
//      against a synthetic mark laid at a known angle.
// §4.1 NULL: the solver searches nothing. Its bound-equivalent is the round
//      trip; a demanded duty that does not come back is a failure report.
// §4.2 SELECTION: every crossing on every line is printed, with the authored
//      width of the mark that made it. Nothing is chosen.
// §6.1 LOCUS: `_jw14cross.mjs`'s seven frozen lines, unchanged, and the coin's
//      duty numbers are `_jw14cross.mjs`'s own output on the references.
//
// Run: node coloringbook/judge/_wr3roll.mjs
import { marks } from './_jqgeom.mjs';

const TRANSECTS = [
  { name: 'T1 front of wig', a: { x: 55.0, y: 46.0 }, b: { x: 45.6, y: 21.6 } },
  { name: 'T2 mid wig', a: { x: 62.0, y: 49.5 }, b: { x: 52.6, y: 25.1 } },
  { name: 'T3 back of wig', a: { x: 69.0, y: 51.0 }, b: { x: 59.6, y: 26.6 } },
  { name: 'T4 occiput', a: { x: 75.0, y: 50.0 }, b: { x: 65.6, y: 25.6 } },
  { name: 'C1 our normal lo', a: { x: 57.0, y: 46.0 }, b: { x: 61.7, y: 18.4 } },
  { name: 'C2 our normal mid', a: { x: 62.0, y: 48.0 }, b: { x: 66.7, y: 20.4 } },
  { name: 'C3 our normal hi', a: { x: 66.5, y: 49.0 }, b: { x: 71.2, y: 21.4 } },
];
// the C lines are the ones round 9 used to solve the groove width, because they
// are laid normal to our own mark direction and cannot miss our marks.
const SOLVE_ON = ['C1 our normal lo', 'C2 our normal mid', 'C3 our normal hi'];

// `_jw14cross.mjs`'s own RIDGE duty medians on the three references, and its
// ridge FWHP medians. Quoted, not recomputed: that instrument is frozen and its
// output on the references does not depend on our drawing.
const COIN = {
  'quarter-obv-2.jpg     7.95 px/u': { rduty: 0.350, rfwhp: 0.40 },
  'quarter-obv-1932ngc  21.26 px/u': { rduty: 0.409, rfwhp: 0.45 },
  'quarter-obv-4.jpg    20.98 px/u': { rduty: 0.443, rfwhp: 0.60 },
};

const dOf = (m) => (m.tag.match(/\sd="([^"]*)"/) || [null, ''])[1];
const isRoll = (m) => m.stroke === '#cfd5da' && Math.abs(m.opacity - 0.85) < 1e-6;
const isCut = (m) => m.stroke === '#242c33' && Math.abs(m.opacity - 0.33) < 1e-6;
// the two face lights are drawn in the same group as the wig rolls and are not
// wig rolls; they are named out by their own path data, not by a bounding box.
const FACE_LIGHTS = ['M 10 -20.2', 'M 13.4 16.3'];

// crossings, with the local tangent at the crossing so the width can be
// projected onto the line. A mark at angle theta to the line presents
// width / |sin theta|.
function crossings(m, t) {
  const pts = m.pts;
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L;
  const nx = -uy, ny = ux;
  const sideOf = (p) => (p.x - t.a.x) * nx + (p.y - t.a.y) * ny;
  const out = []; let dropped = 0;
  for (let i = 1; i < pts.length; i++) {
    const s0 = sideOf(pts[i - 1]), s1 = sideOf(pts[i]);
    if (s0 === 0 || (s0 > 0) !== (s1 > 0)) {
      const f = s0 / (s0 - s1);
      const p = { x: pts[i - 1].x + f * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + f * (pts[i].y - pts[i - 1].y) };
      const s = (p.x - t.a.x) * ux + (p.y - t.a.y) * uy;
      const tx = pts[i].x - pts[i - 1].x, ty = pts[i].y - pts[i - 1].y;
      const tl = Math.hypot(tx, ty);
      const sinth = Math.abs((tx / tl) * nx + (ty / tl) * ny);   // |t . n| = |sin theta|
      if (s > 0.2 && s < L - 0.2) out.push({ s, sinth, w: m.sw }); else dropped++;
    }
  }
  return { out, dropped, L };
}

// §4 RESPONSE on the projection: a straight mark at 30 deg to a horizontal line
// must present width / sin 30 = 2w.
{
  const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
  const th = Math.PI / 6;
  const fake = { pts: [{ x: 5 - Math.cos(th), y: -Math.sin(th) }, { x: 5 + Math.cos(th), y: Math.sin(th) }], sw: 1 };
  const c = crossings(fake, line).out[0];
  const proj = c.w / c.sinth;
  console.log(`SELFTEST projection  mark at 30 deg, width 1.0 -> presents ${proj.toFixed(4)} `
    + `(expected 2.0000)  ${Math.abs(proj - 2) < 1e-9 ? 'OK' : 'FAIL'}`);
}
// §4 RESPONSE on the solver: round trip, exactly as _jw14gen.mjs does it.
{
  const w = (0.30 * 16) / 5, back = (5 * w) / 16;
  console.log(`SELFTEST solver      5 marks spanning 16.0, demanded duty 0.300 -> width ${w.toFixed(4)}, `
    + `back ${back.toFixed(4)}  ${Math.abs(back - 0.30) < 1e-9 ? 'OK' : 'FAIL'}\n`);
}

const SIZE = Number(process.argv[2] || 2126);
const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', SIZE, { side: 'obverse' });
const all = marks(svg).filter((m) => m.isStroke && m.pts && m.pts.length > 1);
const rolls = all.filter((m) => isRoll(m) && !FACE_LIGHTS.some((f) => dOf(m).startsWith(f)));
const cutsM = all.filter(isCut);

console.log('### _wr3roll — LIT-ROLL duty from centrelines and authored widths, quarter obverse');
console.log(`### ${rolls.length} lit rolls (the two face lights excluded by path data), ${cutsM.length} cuts`);
console.log('### the coin, from _jw14cross.mjs on the references:');
for (const [k, v] of Object.entries(COIN)) console.log(`###   ${k}   RIDGE duty ${v.rduty.toFixed(3)}   ridge FWHP ${v.rfwhp.toFixed(2)}u`);
console.log('');

function dutyOn(set, t, widths) {
  const hits = [];
  for (const m of set) {
    const w = widths ? widths(m) : m.sw;
    for (const c of crossings(m, t).out) hits.push({ ...c, w, proj: w / c.sinth, d: dOf(m).slice(0, 30) });
  }
  hits.sort((a, b) => a.s - b.s);
  if (hits.length < 2) return { hits, n: hits.length, span: NaN, duty: NaN };
  const span = hits[hits.length - 1].s - hits[0].s;
  const duty = hits.reduce((a, h) => a + h.proj, 0) / span;
  return { hits, n: hits.length, span, duty, sum: hits.reduce((a, h) => a + h.proj, 0) };
}

console.log('## AS SHIPPED — every lit-roll crossing, with the width it presents to the line');
const rows = [];
for (const t of TRANSECTS) {
  const r = dutyOn(rolls, t);
  rows.push({ t, r });
  console.log(`   ${t.name.padEnd(18)} ${String(r.n).padStart(2)} roll crossings  span ${Number.isFinite(r.span) ? r.span.toFixed(2) : '  -  '}u  `
    + `sum ${Number.isFinite(r.sum) ? r.sum.toFixed(2) : '  -  '}u  RIDGE duty ${Number.isFinite(r.duty) ? r.duty.toFixed(3) : '  -  '}`);
  for (const h of r.hits) console.log(`        s ${h.s.toFixed(2).padStart(6)}u  sw ${String(h.w).padStart(4)} local `
    + `= ${(h.w * 0.98).toFixed(3)}u  at ${(Math.asin(Math.min(1, h.sinth)) * 180 / Math.PI).toFixed(0)} deg -> presents ${h.proj.toFixed(3)}u  ${h.d}`);
}
// lines that produced no finite duty are EXCLUDED and COUNTED, never averaged
// in as a NaN and never silently dropped (section 4.1).
const solveAll = rows.filter((r) => SOLVE_ON.includes(r.t.name));
const solveRows = solveAll.filter((r) => Number.isFinite(r.r.duty));
if (solveRows.length !== solveAll.length) {
  console.log(`   NOTE ${solveAll.length - solveRows.length} of ${solveAll.length} solve lines cross fewer than 2 lit rolls `
    + `at this size and produce NO duty. They are excluded and counted, not averaged as zero.`);
}
const meanN = solveRows.reduce((a, r) => a + r.r.n, 0) / solveRows.length;
const meanSpan = solveRows.reduce((a, r) => a + r.r.span, 0) / solveRows.length;
const dutyNow = solveRows.reduce((a, r) => a + r.r.duty, 0) / solveRows.length;
const meanW = rolls.reduce((a, m) => a + m.sw * 0.98, 0) / rolls.length;
console.log(`\n   over ${SOLVE_ON.length} solve lines: mean ${meanN.toFixed(2)} roll crossings, mean span ${meanSpan.toFixed(2)}u,`
  + ` our roll pitch ${(meanSpan / (meanN - 1)).toFixed(2)}u`);
console.log(`   MEAN RIDGE DUTY AS SHIPPED = ${dutyNow.toFixed(5)}   (mean authored roll width ${meanW.toFixed(3)}u)`);
console.log(`   the coin: ${Object.values(COIN).map((v) => v.rduty.toFixed(3)).join(' / ')}  -> band 0.350-0.443\n`);

console.log('## WHAT WIDTH EACH TARGET DEMANDS   (w = duty * span / n, _jw14gen.mjs\'s solver)');
for (const [k, v] of Object.entries(COIN)) {
  const wVB = (v.rduty * meanSpan) / meanN;
  console.log(`   duty ${v.rduty.toFixed(3)} (${k.split(' ')[0]}) -> ${wVB.toFixed(3)} viewBox = ${(wVB / 0.98).toFixed(3)} LOCAL`);
}
{
  const lo = (0.350 * meanSpan) / meanN, hi = (0.443 * meanSpan) / meanN;
  console.log(`   the whole band 0.350-0.443 -> ${(lo / 0.98).toFixed(3)} .. ${(hi / 0.98).toFixed(3)} LOCAL`);
}
console.log('');

console.log('## CANDIDATE WIDTH SETS — the duty each produces on the three solve lines');
const CANDS = [
  ['as shipped        1.9/1.9/1.8/1.1/1.1', null],
  ['variant B         0.92 on all five', () => 0.92],
  ['variant B\'        0.92 on the three wide only', (m) => (m.sw > 1.5 ? 0.92 : m.sw)],
  ['the coin\'s FWHP   0.45u = 0.46 local', () => 0.46],
  ['duty 0.409 (1932) solved', null],
  ['duty 0.443 (obv-4) solved', null],
];
for (const [label, wf] of CANDS) {
  if (!wf) {
    if (label.startsWith('as shipped')) {
      console.log(`   ${label.padEnd(38)} duty ${dutyNow.toFixed(3)}   ${dutyNow >= 0.350 && dutyNow <= 0.443 ? 'IN THE COIN\'S BAND' : 'outside'}`);
    } else {
      const target = Number(label.match(/duty ([\d.]+)/)[1]);
      const wVB = (target * meanSpan) / meanN;
      console.log(`   ${label.padEnd(38)} needs ${(wVB / 0.98).toFixed(2)} local on all five`);
    }
    continue;
  }
  const ds = solveRows.map((r) => dutyOn(rolls, r.t, wf).duty).filter(Number.isFinite);
  const d = ds.reduce((a, b) => a + b, 0) / ds.length;
  console.log(`   ${label.padEnd(38)} duty ${d.toFixed(3)}   (${ds.map((x) => x.toFixed(3)).join(' ')})   `
    + `${d >= 0.350 && d <= 0.443 ? 'IN THE COIN\'S BAND' : (d < 0.350 ? 'BELOW the band by ' + (0.350 - d).toFixed(3) : 'above')}`);
}

// WHICH REFERENCES BELONG IN THE BAND is contested, so the verdict is checked
// against every defensible subset rather than one. `quarter-obv-4.jpg` is the
// 1999+ state-quarter obverse (a re-engraved hub, judge-ruled a different
// design for tone); `quarter-obv-2.jpg` is 7.95 px per unit, which round 9
// excluded from its CUT duty target as too blurred to resolve a 0.3u feature.
console.log('\n## THE VERDICT UNDER EVERY SUBSET OF THE REFERENCES');
{
  const B = () => solveRows.map((r) => dutyOn(rolls, r.t, () => 0.92).duty).filter(Number.isFinite);
  const bDuty = B().reduce((a, b) => a + b, 0) / B().length;
  const sets = [
    ['all three                       ', [0.350, 0.409, 0.443]],
    ['drop obv-4 (state quarter)      ', [0.350, 0.409]],
    ['drop obv-2 (7.95 px/u, round 9) ', [0.409, 0.443]],
    ['1932 alone (same design, high-res)', [0.409]],
  ];
  for (const [name, vals] of sets) {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const dNow = Math.min(Math.abs(dutyNow - lo), Math.abs(dutyNow - hi), (dutyNow >= lo && dutyNow <= hi) ? 0 : Infinity);
    const dB = Math.min(Math.abs(bDuty - lo), Math.abs(bDuty - hi), (bDuty >= lo && bDuty <= hi) ? 0 : Infinity);
    console.log(`   ${name}  band ${lo.toFixed(3)}-${hi.toFixed(3)}   `
      + `shipped ${dutyNow.toFixed(3)} (miss ${dNow.toFixed(3)})   variant B ${bDuty.toFixed(3)} (miss ${dB.toFixed(3)})   `
      + `${dB > dNow ? 'variant B is FURTHER from the coin' : 'variant B is closer'}`);
  }
}

console.log('\n## THE CUT CONTROL — the same arithmetic on the grooves must reproduce round 9');
const cds = SOLVE_ON.map((n) => dutyOn(cutsM, TRANSECTS.find((t) => t.name === n)).duty);
const cN = SOLVE_ON.reduce((a, n) => a + dutyOn(cutsM, TRANSECTS.find((t) => t.name === n)).n, 0) / 3;
const cSpan = SOLVE_ON.reduce((a, n) => a + dutyOn(cutsM, TRANSECTS.find((t) => t.name === n)).span, 0) / 3;
console.log(`   cut duty by centreline arithmetic ${(cds.reduce((a, b) => a + b, 0) / 3).toFixed(3)}  `
  + `(${cds.map((x) => x.toFixed(3)).join(' ')}),  ${cN.toFixed(2)} crossings over ${cSpan.toFixed(2)}u`);
console.log('   round 9 shipped groove 0.98 local for a demanded duty of 0.300 at 84px (five cuts only);');
console.log('   at 2126px the two grooveFine cuts are also drawn, which is why this is higher.');
