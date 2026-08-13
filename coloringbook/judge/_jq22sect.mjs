// D5 band, reverse — IS THERE ANY SECTOR THAT WORKS?
//
// §22.8's method needs "a sector where nothing else lives", so that the legend
// shows as a plateau of angular sigma between two LOW shoulders. On the
// quarter reverse the straight-up sector is not one: the eagle's wings and
// E PLURIBUS UNUM occupy every radius inboard of the legend, so the inner
// shoulder does not exist and the profile is elevated from 28vb to 43vb without
// resting (_jq22band.mjs, printed profile).
//
// That could be a fact about the sector I picked rather than about the design.
// So sweep every sector, print the WHOLE candidate set (§4.2), and require the
// two INDEPENDENT references to agree (Q4). If no sector produces a
// shoulder-plateau-shoulder on which both references agree, D5-band-reverse is
// blocked by the DESIGN, not by the photograph, and no acquisition fixes it.
import { sweep, plateaus, RLO, RHI } from './_jq22band.mjs';

const REFS = [
  ['rev-3', 'quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }],
  ['rev-2', 'quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }],
];
const WIDTH = 30, STEP = 15;

console.log(`SEARCH BOUNDS: sector centre 0..345 deg step ${STEP}, width ${WIDTH} deg; radius ${RLO}..${RHI} R.`);
console.log('A band edge at a radius bound, or a plateau contrast at the profile max, is a failure report (§4.1).');
console.log('ACCEPTANCE, stated before any value exists:');
console.log('  a sector is USABLE iff (i) plateau contrast >= 1.8x — round 0 rejected 1.67 and 1.44,');
console.log('  and (ii) the two independent references place both band edges within 1.0 viewBox unit.\n');

const prof = {};
for (const [tag, file, D] of REFS) {
  prof[tag] = {};
  for (let c = 0; c < 360; c += STEP) {
    const sec = [c - WIDTH / 2, c + WIDTH / 2];
    const p = await sweep(file, D, sec, true);
    prof[tag][c] = plateaus(p);
  }
}

console.log('centre |            rev-3 best run             |            rev-2 best run             | agree?');
console.log('  deg  |  inner   outer  contrast  n_runs      |  inner   outer  contrast  n_runs      |');
const usable = [];
for (let c = 0; c < 360; c += STEP) {
  const a = prof['rev-3'][c], b = prof['rev-2'][c];
  const ra = a.runs[0], rb = b.runs[0];
  if (!ra || !rb) { console.log(`${String(c).padStart(5)}  |  (no run above half-max on one reference)`); continue; }
  const d0 = Math.abs(ra.r0 - rb.r0) * 47, d1 = Math.abs(ra.r1 - rb.r1) * 47;
  const ok = ra.contrast >= 1.8 && rb.contrast >= 1.8 && Math.max(d0, d1) <= 1.0;
  if (ok) usable.push(c);
  console.log(`${String(c).padStart(5)}  | ${(47 * ra.r0).toFixed(2).padStart(6)} ${(47 * ra.r1).toFixed(2).padStart(7)} ${ra.contrast.toFixed(2).padStart(8)}x ${String(a.runs.length).padStart(4)}       `
    + `| ${(47 * rb.r0).toFixed(2).padStart(6)} ${(47 * rb.r1).toFixed(2).padStart(7)} ${rb.contrast.toFixed(2).padStart(8)}x ${String(b.runs.length).padStart(4)}       `
    + `| d ${d0.toFixed(1)}/${d1.toFixed(1)} ${ok ? 'USABLE' : ''}`);
}
const cs = [];
for (const [tag] of REFS) for (let c = 0; c < 360; c += STEP) if (prof[tag][c].runs[0]) cs.push(prof[tag][c].runs[0].contrast);
console.log(`\nplateau contrast over all ${cs.length} sector x reference combinations: min ${Math.min(...cs).toFixed(2)}x  max ${Math.max(...cs).toFixed(2)}x  (gate 1.80x)`);
console.log(`sectors meeting BOTH conditions: ${usable.length ? usable.join(', ') : 'NONE'}`);
console.log(usable.length
  ? 'A locus exists. Freeze it before measuring anything against it (§6.1).'
  : 'No locus exists on this design with these references. D5-band-reverse stays BLOCKED.');
